use crate::db::engine::save_full_snapshot;
use crate::services::byfen::{copy_cover, create_migration_folders, replace_folder, replace_state};
use crate::state::AppState;
use std::path::Path;
use tauri::{Emitter, State, Window};

#[tauri::command]
pub fn db_byfen(state: State<'_, AppState>, window: Window, path: String) -> Result<(), String> {
    let selected_dir = Path::new(&path);
    if !selected_dir.exists() {
        return Err("Database file does not exist.".to_string());
    }

    let paths = create_migration_folders(&selected_dir)?;
    let data_dir = &paths[0];
    let cover_dir = &paths[1];

    let app_data = state
        .app_data
        .lock()
        .map_err(|_| "无法锁定应用数据".to_string())?;
    let game_data = state
        .game_data
        .lock()
        .map_err(|_| "无法锁定游戏数据".to_string())?;
    let tokens = state
        .tokens
        .lock()
        .map_err(|_| "failed to lock tokens".to_string())?;
    let settings = state
        .settings
        .lock()
        .map_err(|_| "failed to lock settings".to_string())?;

    save_full_snapshot(&game_data, &app_data, &tokens, &settings, data_dir)?;
    drop(app_data);
    drop(tokens);

    for game in &game_data.games {
        let cover = &game.1.cover;
        let cover_str = cover.to_string();
        let src = Path::new(&cover_str);
        let name = match src.iter().last() {
            Some(name) => name,
            None => continue,
        };
        let dst = cover_dir.join(name);

        match copy_cover(src, &dst) {
            Ok(_) => continue,
            Err(_) => {
                let _ = window.emit("toast-error", "游戏封面备份失败");
                continue;
            }
        }
    }

    let src = settings.avatar_path.as_ref().unwrap();
    let src = Path::new(src);
    let name = match src.iter().last() {
        Some(name) => name,
        None => return Ok(()),
    };
    let dst = cover_dir.join(name);
    let _ = copy_cover(src, &dst);

    Ok(())
}

#[tauri::command]
pub fn import_byfen(state: State<'_, AppState>, path: String) -> Result<(), String> {
    let byfen_folder = Path::new(&path);
    if !byfen_folder.exists() {
        return Err("Byfen 文件夹不存在".to_string());
    }

    let db_folder = state.data_dir.parent().clone().unwrap();

    let cover_folder = byfen_folder.join("cover");
    let data_folder = byfen_folder.join("data");
    replace_folder(&cover_folder, &db_folder)?;
    replace_folder(&data_folder, &db_folder)?;

    replace_state(state)?;

    Ok(())
}
