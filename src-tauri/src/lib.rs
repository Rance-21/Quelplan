// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod api;
mod commands;
mod db;
mod models;
mod services;
mod state;
mod utils;
mod window_shape;

use crate::commands::close::save_full_snapshot_on_close;
use crate::models::SearchCache;
use tauri::menu::{Menu, MenuItem};
use tauri::tray::TrayIconBuilder;
use tauri::{AppHandle, Manager};
use tauri_plugin_autostart::MacosLauncher;
use tauri_plugin_autostart::ManagerExt;

fn show_main_window(app: &AppHandle) {
    let Some(window) = app.get_webview_window("main") else {
        return;
    };

    let _ = window.show();
    let _ = window.unminimize();
    let _ = window.set_focus();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default();

    #[cfg(desktop)]
    let builder = builder.plugin(tauri_plugin_single_instance::init(
        |app, _args, _cwd| {
            show_main_window(app);
        },
    ));

    builder
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec!["--minimized"]),
        ))
        .manage(SearchCache::new())
        .setup(|app| {
            let quit_i = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
            let show_i = MenuItem::with_id(app, "show", "主界面", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&quit_i, &show_i])?;
            let app_state = state::AppState::init(app.handle())?;

            if app_state.settings.lock().unwrap().auto_start {
                let autostart_manager = app.autolaunch();
                // 启用 autostart
                let _ = autostart_manager.enable();

                if cfg!(debug_assertions) {
                    println!(
                        "registered for autostart? {}",
                        autostart_manager.is_enabled().unwrap()
                    );
                }
            }

            app.manage(app_state);

            if let Some(window) = app.get_webview_window("main") {
                window_shape::apply_webview(&window);
            }

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        save_full_snapshot_on_close(app.state()).unwrap();
                        app.exit(0);
                    }
                    "show" => {
                        show_main_window(app);
                    }
                    _ => {
                        1;
                    }
                })
                .build(app)?;

            Ok(())
        })
        .on_window_event(|window, event| {
            if window.label() == "main"
                && matches!(
                    event,
                    tauri::WindowEvent::Resized(_) | tauri::WindowEvent::ScaleFactorChanged { .. }
                )
            {
                window_shape::apply(window);
            }
        })
        .invoke_handler(tauri::generate_handler![
            commands::game::get_folder_games,
            commands::add::add_new_game,
            commands::add::add_new_games,
            commands::add::clear_search_cache,
            commands::add::add_app,
            commands::delete::delete_app,
            commands::app::get_apps,
            commands::delete::delete,
            commands::game::get_game_detail,
            commands::game::update_game_field,
            commands::game::change_link_exe,
            commands::game::get_main_game,
            commands::launch::launch_game_chain,
            commands::close::save_full_snapshot_on_close,
            commands::token::update_token,
            commands::setting::get_settings,
            commands::setting::get_avatar_path,
            commands::setting::update_settings,
            commands::setting::update_launch_key,
            commands::folder::open_folder,
            commands::add::add_steam_games,
            commands::byfen::db_byfen,
            commands::byfen::import_byfen,
            commands::bgm_oauth2::start_bgm_oauth,
            commands::add::add_games_to_db,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
