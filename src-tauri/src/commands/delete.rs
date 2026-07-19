use crate::services::wal::{delete_app_wal, delete_game_wal};
use crate::state::AppState;
use std::path::Path;
use tauri::State;
use tokio::fs;

#[tauri::command]
pub async fn delete(id: u32, state: State<'_, AppState>) -> Result<(), String> {
    let path = {
        let mut gamedata = state.game_data.lock().unwrap();

        let cover_path = gamedata.games.get(&id).ok_or("未找到游戏")?.cover.clone();

        if cfg!(debug_assertions) {
            println!("路径:{}", cover_path);
        }

        gamedata.games.remove(&id);

        cover_path
    };

    let default_cover = state.download_path.join("default.jpg");
    let is_default_cover = Path::new(path.as_ref()) == default_cover.as_path();

    if !is_default_cover && path.contains(&state.download_path.to_str().unwrap_or("")) {
        delete_cover(&path).await;
    }
    delete_game_wal(&state, id)?;
    return Ok(());
}

#[tauri::command]
pub fn delete_app(id: u32, state: State<AppState>) -> Result<(), String> {
    let mut app_data = state.app_data.lock().unwrap();
    app_data.apps.remove(&id);

    delete_app_wal(&state, id)?;
    return Ok(());
}

async fn delete_cover(path: &str) {
    let path = Path::new(&path);

    if path.is_file() {
        // 删除单个文件
        let _ = fs::remove_file(path).await;
    } else if path.is_dir() {
        // 递归删除整个文件夹及其内部所有内容
        let _ = fs::remove_dir_all(path).await;
    } else {
    }
}
