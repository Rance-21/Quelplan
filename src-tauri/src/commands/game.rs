use crate::models::{FolderGame, FolderGames, Game, LinkExe, MainGame};
use crate::services::game::*;
use crate::services::wal::*;
use crate::state::AppState;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::sync::Arc;
use tauri::State;

#[tauri::command]
pub fn get_folder_games(state: State<'_, AppState>) -> Result<FolderGames, String> {
    let gamedata = state.game_data.lock().unwrap();

    let result: Vec<FolderGame> = gamedata
        .games
        .values()
        .map(|game| FolderGame {
            id: game.id,
            name: Arc::clone(&game.name),
            path: Arc::clone(&game.path),
            cover_url: Arc::clone(&game.cover),
            playtime: game.play_time,
            score: game.score,
        })
        .collect();

    Ok(FolderGames { games: result })
}

#[tauri::command]
pub fn get_game_detail(state: State<'_, AppState>, id: u32) -> Game {
    let gamedata = state.game_data.lock().unwrap();
    let game = gamedata.games.get(&id).unwrap();
    return game.clone();
}

#[tauri::command]
pub fn update_game_field(
    state: State<'_, AppState>,
    id: u32,
    field: String,
    value: Value,
) -> Result<(), String> {
    let mut gamedata = state.game_data.lock().unwrap();
    let game = gamedata.games.get_mut(&id).unwrap();

    match field.as_str() {
        "name" => {
            if let Some(s) = value.as_str() {
                game.name = Arc::from(s);
                update_name_wal(&state, id, s)?;
            }
        }
        "liked" => {
            if let Some(b) = value.as_bool() {
                game.liked = b;
                update_like_wal(&state, id, b)?;
            }
        }
        "if_finished" => {
            if let Some(b) = value.as_bool() {
                game.if_finished = b;
                update_finish_wal(&state, id, b)?;
            }
        }
        "main_game_id" => {
            if let Some(n) = value.as_u64() {
                gamedata.main_game_id = Some(n as u32);
                update_main_game_id_wal(&state, n as u32)?;
            }
        }
        "last_played" => {
            if let Some(n) = value.as_u64() {
                game.last_played = n;
                update_last_play_wal(&state, id, n)?;
            }
        }
        "exe_path" => {
            if let Some(s) = value.as_str() {
                let next_exe_path = s.trim();
                if next_exe_path.is_empty() {
                    return Err("游戏本体路径不能为空".to_string());
                }

                replace_exe_path(game, Arc::from(s));
                update_exe_path_wal(&state, id, next_exe_path)?;
            }
        }
        "cover" => {
            if let Some(s) = value.as_str() {
                let next_cover = s.trim();
                if next_cover.is_empty() {
                    return Err("Cover path cannot be empty".to_string());
                }

                game.cover = Arc::from(next_cover);
                update_cover_wal(&state, id, next_cover)?;
            }
        }
        "developer" => {
            if let Some(s) = value.as_str() {
                let developer = s.trim();
                game.developer = Arc::from(developer);
                update_developer_wal(&state, id, developer)?;
            }
        }
        "score" => {
            if let Some(n) = value.as_f64() {
                if !n.is_finite() || !(0.0..=100.0).contains(&n) {
                    return Err("Score must be between 0 and 100".to_string());
                }

                game.score = n as f32;
                update_score_wal(&state, id, game.score)?;
            }
        }
        "publish_date" => {
            if let Some(n) = value.as_u64() {
                game.publish_date = n;
                update_publish_date_wal(&state, id, n)?;
            }
        }
        _ => return Err("未找到要更改的类型".to_string()),
    }

    return Ok(());
}

#[derive(Deserialize, Serialize)]
pub struct ChangeLinkExeParams {
    pub first_id: u32,
    pub second_id: u32,
    pub third_id: u32,
    pub which_is_game: u32,
}

#[tauri::command(rename_all = "snake_case")]
pub fn change_link_exe(
    state: State<'_, AppState>,
    change_link_exe_params: ChangeLinkExeParams,
) -> Result<(), String> {
    let link_ids = [
        change_link_exe_params.first_id,
        change_link_exe_params.second_id,
        change_link_exe_params.third_id,
    ];

    let which_index = change_link_exe_params
        .which_is_game
        .checked_sub(1)
        .and_then(|idx| usize::try_from(idx).ok())
        .ok_or_else(|| "which_is_game must be 1, 2, or 3".to_string())?;
    let id = link_ids[which_index];

    let app_data = state.app_data.lock().unwrap();
    let mut gamedata = state.game_data.lock().unwrap();
    let game = gamedata
        .games
        .get_mut(&id)
        .ok_or_else(|| "未找到对应游戏".to_string())?;

    let mut next_link_exe = std::array::from_fn(|_| LinkExe::empty());

    for (index, link_id) in link_ids.iter().enumerate() {
        if index == which_index {
            next_link_exe[index] = LinkExe::new(game.path.clone(), game.steam_id);
        } else if *link_id == 0 {
            next_link_exe[index] = LinkExe::empty();
        } else {
            let app = app_data
                .apps
                .get(link_id)
                .ok_or_else(|| format!("未找到 ID 为 {} 的应用", link_id))?;
            next_link_exe[index] = LinkExe::new(Arc::clone(&app.exe_path), app.steam_id);
        }
    }

    update_link_exe_wal(&state, change_link_exe_params)?;
    game.link_exe = next_link_exe;

    return Ok(());
}

#[tauri::command]
pub fn get_main_game(state: State<'_, AppState>) -> Option<MainGame> {
    let gamedata = state.game_data.lock().unwrap();
    let game = gamedata.games.get(&gamedata.main_game_id?)?;
    let main_game = MainGame {
        id: gamedata.main_game_id?,
        name: game.name.clone(),
        cover_url: Arc::clone(&game.cover),
    };
    return Some(main_game);
}
