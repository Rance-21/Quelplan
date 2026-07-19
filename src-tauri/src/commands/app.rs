use crate::models::Apps;
use crate::state::AppState;
use tauri::State;

#[tauri::command]
pub fn get_apps(state: State<'_, AppState>) -> Result<Apps, String> {
    let app_data = state.app_data.lock().unwrap();
    return Ok(app_data.clone());
}
