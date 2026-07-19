use crate::commands::game::update_game_field;
use crate::services::launch::{launch_steam_app, spawn_game};
use crate::state::AppState;
use crate::utils::time::{get_current_timestamp, record_play_time, record_steam_time};
use device_query::{DeviceQuery, DeviceState, Keycode};
use tauri::{AppHandle, Emitter, Manager};

#[tauri::command]
pub async fn launch_game_chain(
    state: tauri::State<'_, AppState>,
    app: AppHandle,
    game_id: u32,
) -> Result<(), String> {
    let (hide_on_launch, launch_key_code) = {
        let settings = state
            .settings
            .lock()
            .map_err(|_| "failed to lock settings".to_string())?;
        let launch_key_code = settings
            .launch_key
            .parse::<Keycode>()
            .map_err(|_| format!("invalid launch key: {}", settings.launch_key))?;

        (settings.hide_on_launch, launch_key_code)
    };

    if hide_on_launch {
        if let Some(window) = app.get_webview_window("main") {
            let _ = window.hide();
        }
    }

    let gamedata = state.game_data.lock().unwrap();
    let game = gamedata.games.get(&game_id).ok_or("找不到游戏")?;
    let links = game.link_exe.clone();
    let path = game.path.clone();
    drop(gamedata);

    let last_played = get_current_timestamp();
    update_game_field(
        state,
        game_id,
        "last_played".to_string(),
        last_played.into(),
    )?;

    let app_handle = app.clone();

    // 后台监听协程
    tokio::spawn(async move {
        let device_state = DeviceState::new();
        let mut current_index = 0;
        let mut key_was_pressed = false;
        let mut is_first: bool = true;

        while current_index < 3 {
            let next_exe = &links[current_index];

            if next_exe.path.is_empty() {
                break;
            }

            let keys = device_state.get_keys();
            let is_pressed = keys.contains(&launch_key_code);

            if (is_pressed && !key_was_pressed) || is_first {
                is_first = false;

                if next_exe.path == path {
                    let app_handle_clone = app_handle.clone();

                    match next_exe.steam_id {
                        None => match spawn_game(&next_exe.path).await {
                            Ok(mut game_process) => {
                                tokio::spawn(async move {
                                    let background_state = app_handle_clone.state::<AppState>();
                                    let _ = record_play_time(
                                        &mut game_process,
                                        game_id,
                                        background_state,
                                    )
                                    .await;
                                });
                            }
                            Err(e) => {
                                if let Some(window) = app_handle.get_webview_window("main") {
                                    let _ = window.emit("toast-error", e);
                                }
                            }
                        },
                        Some(steam_id) => match launch_steam_app(steam_id) {
                            Ok(()) => {
                                let name = path
                                    .to_string()
                                    .split('/')
                                    .last()
                                    .unwrap_or_else(|| "")
                                    .to_string();

                                tokio::spawn(async move {
                                    let background_state = app_handle_clone.state::<AppState>();
                                    let _ =
                                        record_steam_time(&background_state, &name, game_id).await;
                                });
                            }
                            Err(_) => {
                                if let Some(window) = app_handle.get_webview_window("main") {
                                    let _ = window.emit("toast-error", "steam游戏启动失败");
                                }
                            }
                        },
                    }
                } else {
                    match next_exe.steam_id {
                        None => match spawn_game(&next_exe.path).await {
                            Ok(_) => (),
                            Err(e) => {
                                if let Some(window) = app_handle.get_webview_window("main") {
                                    let _ = window.emit("toast-error", e);
                                }
                            }
                        },
                        Some(steam_id) => {
                            match launch_steam_app(steam_id) {
                                Ok(()) => {}
                                Err(_) => {
                                    if let Some(window) = app_handle.get_webview_window("main") {
                                        let _ = window.emit("toast-error", "steam游戏启动失败");
                                    }
                                }
                            };
                        }
                    }
                }

                current_index += 1;
            }

            key_was_pressed = is_pressed;

            // 20ms够用
            tokio::time::sleep(std::time::Duration::from_millis(20)).await;
        }

        //这里Windows过一会会自己卸载内存
    });

    Ok(())
}
