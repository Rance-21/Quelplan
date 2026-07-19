use crate::api::bgm_avator::update_bgm_avatar;
use crate::commands::token::Platform::{Bgm, Vndb};
use crate::services::wal::{update_avatar_path_wal, update_bgm_token_wal, update_vndb_token_wal};
use crate::state::AppState;
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Serialize, Deserialize)]
pub enum Platform {
    Bgm,
    Vndb,
}

#[tauri::command]
pub async fn update_token(
    state: State<'_, AppState>,
    which: Platform,
    token: String,
) -> Result<(), String> {
    match which {
        Bgm => {
            let previous_avatar_path = state.settings.lock().unwrap().avatar_path.clone();
            let avatar_path = update_bgm_avatar(&state, &token, previous_avatar_path).await?;

            update_bgm_token_wal(&state, &token)?;
            update_avatar_path_wal(&state, avatar_path.as_deref())?;
            state.tokens.lock().unwrap().bgm = Some(token);
            state.settings.lock().unwrap().avatar_path = avatar_path;
        }
        Vndb => {
            update_vndb_token_wal(&state, &token)?;
            state.tokens.lock().unwrap().vndb = Some(token);
        }
    }

    Ok(())
}
