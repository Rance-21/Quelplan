use crate::api::steam::get_steam_games;
use crate::models::{App, SearchCache, SearchResult, SearchedGame};
use crate::services::add::{add_game, add_game_to_db, add_steam_app, dfs_add_games};
use crate::services::wal::add_app_wal;
use crate::state::AppState;
use std::path::Path;
use std::sync::Arc;
use std::time::Duration;
use tauri::{Emitter, State, Window};
use tokio::sync::mpsc;
use tokio::time::{interval, MissedTickBehavior};

pub const SOURCE_BGM: u8 = 1 << 0;
pub const SOURCE_VNDB: u8 = 1 << 1;
pub const SOURCE_IGDB: u8 = 1 << 2;

#[tauri::command(rename_all = "snake_case")]
pub async fn add_new_game(
    state: State<'_, AppState>,
    cache: State<'_, SearchCache>,
    name: Option<String>,
    path: &str,
    source_mask: u8,
) -> Result<SearchResult, String> {
    add_game(&state, &cache, name, path, source_mask).await
}

#[tauri::command]
pub fn clear_search_cache(cache: State<'_, SearchCache>) {
    cache.clear();
}

#[tauri::command]
pub fn add_app(path: String, state: State<'_, AppState>) -> Result<u32, String> {
    let path = path.replace("\\", "/");
    let name = Path::new(&path)
        .file_stem()
        .and_then(|file_stem| file_stem.to_str())
        .ok_or_else(|| "无法读取应用程序名称".to_string())?
        .to_string();

    if path.contains("steamapps/common") {
        return add_steam_app(path, state, &name);
    }

    let mut app_data = state.app_data.lock().unwrap();
    let id = app_data.next_id;

    let app = App {
        id: id,
        exe_path: Arc::from(path),
        name: Arc::from(name),
        steam_id: None,
    };
    add_app_wal(&state, id, &app)?;
    app_data.apps.insert(id, app);

    app_data.next_id += 1;

    return Ok(id);
}

#[tauri::command(rename_all = "snake_case")]
pub async fn add_new_games(
    window: Window,
    state: State<'_, AppState>,
    cache: State<'_, SearchCache>,
    dir: String,
    source_mask: u8,
) -> Result<(), String> {
    let (tx, mut rx) = mpsc::channel::<String>(1000);
    if cfg!(debug_assertions) {
        println!("开始批量添加");
    }

    tokio::task::spawn_blocking(move || {
        let root = Path::new(&dir);
        if root.exists() && root.is_dir() {
            dfs_add_games(root, &tx);
        }
    });

    //创建一个每 500 毫秒一次的异步节拍器
    let mut ticker = interval(Duration::from_millis(500));
    ticker.set_missed_tick_behavior(MissedTickBehavior::Delay);

    while let Some(game_path) = rx.recv().await {
        ticker.tick().await;

        if cfg!(debug_assertions) {
            println!("开始异步网络抓取: {}", game_path);
        }

        match add_game(&state, &cache, None, &game_path, source_mask).await {
            Ok(game) => {
                let _ = window.emit("new-game-discovered", game);
            }
            Err(_) => {
                continue;
            }
        }
    }

    Ok(())
}

#[tauri::command(rename_all = "snake_case")]
pub async fn add_steam_games(state: State<'_, AppState>, window: Window) -> Result<(), String> {
    get_steam_games(state, window).await
}

#[tauri::command]
pub async fn add_games_to_db(
    idxs: Vec<(usize, usize)>,
    cache: State<'_, SearchCache>,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let mut collected: Vec<(Arc<str>, SearchedGame)> = Vec::new();
    {
        let mut cache_lock = cache.results.lock().unwrap();
        for idx in &idxs {
            let path = cache_lock
                .get(idx.0)
                .ok_or_else(|| "Index out of bounds".to_string())?
                .path
                .clone();
            let game = cache_lock
                .get(idx.0)
                .ok_or_else(|| "Index out of bounds".to_string())?
                .searched_games
                .get(idx.1)
                .ok_or_else(|| "Index out of bounds".to_string())?
                .clone();
            collected.push((path, game));
        }
        cache_lock.clear();
    }

    let mut ticker = interval(Duration::from_millis(500));
    ticker.set_missed_tick_behavior(MissedTickBehavior::Delay);

    for (path, game) in collected {
        ticker.tick().await;
        let _ = add_game_to_db(&state, &path, &game).await;
    }

    Ok(())
}
