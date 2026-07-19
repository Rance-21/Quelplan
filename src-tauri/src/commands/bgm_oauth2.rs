use crate::api::bgm_oauth2::bgm_oauth;
use crate::state::AppState;
use tauri::{AppHandle, State};

#[tauri::command]
pub async fn start_bgm_oauth(app: AppHandle, state: State<'_, AppState>) -> Result<(), String> {
    bgm_oauth(app, state).await
}
