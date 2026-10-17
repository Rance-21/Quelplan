use crate::commands::game::update_game_field;
use crate::services::launch::{launch_steam_app, spawn_game};
use crate::state::AppState;
use crate::utils::time::{
    get_current_timestamp, record_play_time, record_steam_time, PlayTimeUpdate,
};
use device_query::{DeviceQuery, DeviceState, Keycode};
use tauri::{AppHandle, Emitter, Manager};

fn report_play_time(app: &AppHandle, result: Result<PlayTimeUpdate, String>) {
    match result {
        Ok(update) => {
            let _ = app.emit("game-play-time-updated", update);
        }
        Err(error) => {
            eprintln!("记录游戏时间失败: {}", error);
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.emit("toast-error", format!("记录游戏时间失败: {}", error));
            }
        }
    }
}

#[tauri::command]
pub async fn launch_game_chain(
    state: tauri::State<'_, AppState>,
    app: AppHandle,
    game_id: u32,
) -> Result<(), String> {
    // Reserve before hiding the window or changing last_played so every entry
    // point, including concurrent IPC requests, shares the same protection.
    let launch = state.game_launches.acquire(game_id)?;
    let (links, path) = {
        let gamedata = state.game_data.lock().map_err(|_| "无法锁定游戏数据")?;
        let game = gamedata.games.get(&game_id).ok_or("找不到游戏")?;
        (game.link_exe.clone(), game.path.clone())
    };
    if path.is_empty()
        || !links
            .iter()
            .take_while(|link| !link.path.is_empty())
            .any(|link| link.path == path)
    {
        return Err("启动顺序中缺少游戏本体，请检查关联启动设置".to_string());
    }

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

    let last_played = get_current_timestamp();
    update_game_field(
        state,
        game_id,
        "last_played".to_string(),
        last_played.into(),
    )?;

    if hide_on_launch {
        if let Some(window) = app.get_webview_window("main") {
            let _ = window.hide();
        }
    }

    let app_handle = app.clone();

    // 后台监听协程
    tokio::spawn(async move {
        let mut game_task: Option<tokio::task::JoinHandle<()>> = None;
        let device_state = DeviceState::new();
        let mut current_index = 0;
        let mut key_was_pressed = false;
        let mut is_first: bool = true;

        while current_index < 3 {
            // Stop a pending hotkey chain when its game exits or fails to start.
            if game_task.as_ref().is_some_and(|task| task.is_finished()) {
                break;
            }
            let next_exe = &links[current_index];

            if next_exe.path.is_empty() {
                break;
            }

            let keys = device_state.get_keys();
            let is_pressed = keys.contains(&launch_key_code);

            if (is_pressed && !key_was_pressed) || is_first {
                is_first = false;

                if next_exe.path == path {
                    // A linked application may point at the game executable too.
                    if game_task.is_some() {
                        current_index += 1;
                        key_was_pressed = is_pressed;
                        continue;
                    }
                    let app_handle_clone = app_handle.clone();

                    match next_exe.steam_id {
                        None => match spawn_game(&next_exe.path).await {
                            Ok(mut game_process) => {
                                let process_launch = launch.clone();
                                game_task = Some(tokio::spawn(async move {
                                    let _launch = process_launch;
                                    let background_state = app_handle_clone.state::<AppState>();
                                    let result = record_play_time(
                                        &mut game_process,
                                        game_id,
                                        background_state,
                                    )
                                    .await;
                                    report_play_time(&app_handle_clone, result);
                                }));
                            }
                            Err(e) => {
                                if let Some(window) = app_handle.get_webview_window("main") {
                                    let _ = window.emit("toast-error", e);
                                }
                                return;
                            }
                        },
                        Some(steam_id) => match launch_steam_app(steam_id) {
                            Ok(()) => {
                                let exe_path = path.to_string();

                                let process_launch = launch.clone();
                                game_task = Some(tokio::spawn(async move {
                                    let _launch = process_launch;
                                    let background_state = app_handle_clone.state::<AppState>();
                                    let result =
                                        record_steam_time(&background_state, &exe_path, game_id)
                                            .await;
                                    report_play_time(&app_handle_clone, result);
                                }));
                            }
                            Err(_) => {
                                if let Some(window) = app_handle.get_webview_window("main") {
                                    let _ = window.emit("toast-error", "steam游戏启动失败");
                                }
                                return;
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
                                return;
                            }
                        },
                        Some(steam_id) => {
                            match launch_steam_app(steam_id) {
                                Ok(()) => {}
                                Err(_) => {
                                    if let Some(window) = app_handle.get_webview_window("main") {
                                        let _ = window.emit("toast-error", "steam游戏启动失败");
                                    }
                                    return;
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
