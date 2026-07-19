use crate::commands::setting::WhichSetting::{AutoStart, CloseTary, HideOnLaunch};
use crate::models::Settings;
use crate::services::wal::*;
use crate::state::AppState;
use device_query::Keycode;
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Serialize, Deserialize, Clone, Copy)]
pub enum WhichSetting {
    AutoStart,
    HideOnLaunch,
    CloseTary,
}

#[tauri::command]
pub fn get_settings(state: State<'_, AppState>) -> Result<Settings, String> {
    let settings = state
        .settings
        .lock()
        .map_err(|_| "failed to lock settings".to_string())?;

    Ok(settings.clone())
}

#[tauri::command]
pub fn get_avatar_path(state: State<'_, AppState>) -> Result<Option<String>, String> {
    let settings = state
        .settings
        .lock()
        .map_err(|_| "failed to lock settings".to_string())?;

    Ok(settings.avatar_path.clone())
}

#[tauri::command]
pub fn update_settings(
    state: State<'_, AppState>,
    yes: bool,
    which: WhichSetting,
) -> Result<(), String> {
    let mut settings = state
        .settings
        .lock()
        .map_err(|_| "failed to lock settings".to_string())?;

    match which {
        AutoStart => {
            update_auto_start_wal(&state, yes)?;
            settings.auto_start = yes;
        }
        HideOnLaunch => {
            update_hide_on_launch_wal(&state, yes)?;
            settings.hide_on_launch = yes;
        }
        CloseTary => {
            update_close_tray_wal(&state, yes)?;
            settings.close_tary = yes;
        }
    }

    Ok(())
}

#[tauri::command]
pub fn update_launch_key(state: State<'_, AppState>, launch_key: String) -> Result<(), String> {
    launch_key
        .parse::<Keycode>()
        .map_err(|_| format!("invalid launch key: {launch_key}"))?;

    let mut settings = state
        .settings
        .lock()
        .map_err(|_| "failed to lock settings".to_string())?;

    update_launch_key_wal(&state, &launch_key)?;
    settings.launch_key = launch_key;

    Ok(())
}
