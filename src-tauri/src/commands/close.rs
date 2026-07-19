use crate::db::engine::save_full_snapshot;
use crate::state::AppState;
use tauri::State;

#[tauri::command]
pub fn save_full_snapshot_on_close(state: State<'_, AppState>) -> Result<(), String> {
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

    save_full_snapshot(&game_data, &app_data, &tokens, &settings, &state.data_dir)
}
