use crate::db::steam::{load_steam_game_index, save_steam_game_index};
use crate::models::{DailyPlayTime, FolderGame, Game, LinkExe};
use crate::services::add::find_game_executable;
use crate::services::wal::add_game_wal;
use crate::state::AppState;
use crate::utils::cover::find_extension;
use crate::utils::time::{get_current_timestamp, parse_steam_date};
use serde::Deserialize;
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::sync::Arc;
use std::time::Duration;
use tauri::{Emitter, State, Window};
use tokio::sync::mpsc;
use tokio::task;
use tokio::time::{interval, MissedTickBehavior};
use winreg::enums::*;
use winreg::RegKey;

struct SteamAppInfo {
    appid: u32,
    exe_path: String,
}

#[derive(Deserialize, Debug)]
struct Metacritic {
    score: u32,
}

#[derive(Deserialize, Debug)]
struct ReleaseDate {
    date: String, //2023年8月3日
}

#[derive(Deserialize, Debug)]
struct SteamData {
    name: String,
    developers: Vec<String>,
    release_date: ReleaseDate,
    metacritic: Option<Metacritic>,
}

#[derive(Deserialize, Debug)]
struct AppIdWrapper {
    success: bool,
    data: SteamData,
}

pub async fn get_steam_games(state: State<'_, AppState>, window: Window) -> Result<(), String> {
    let _steam_import_guard = state.steam_import_mutex.lock().await;
    let steam_path = get_steam_path().ok_or("无法获取steam安装路径".to_string())?;
    let steam_apps_paths = get_library_folders(&steam_path).ok_or("未获取steam安装游戏的信息")?;
    let mut steam_game_index = load_steam_game_index(&state.data_dir)?;

    {
        let game_data = state.game_data.lock().unwrap();
        steam_game_index.retain(|steam_id, internal_game_id| {
            game_data
                .games
                .get(internal_game_id)
                .map(|game| game.steam_id == Some(*steam_id))
                .unwrap_or(false)
        });

        for game in game_data.games.values() {
            if let Some(steam_id) = game.steam_id {
                steam_game_index
                    .entry(steam_id)
                    .and_modify(|internal_game_id| {
                        *internal_game_id = (*internal_game_id).min(game.id)
                    })
                    .or_insert(game.id);
            }
        }
    }

    let (tx, mut rx) = mpsc::channel::<SteamAppInfo>(100);

    task::spawn_blocking(move || {
        for path in steam_apps_paths {
            let _ = get_acf_info(&path, &tx);
        }
    });

    let mut ticker = interval(Duration::from_millis(500));
    ticker.set_missed_tick_behavior(MissedTickBehavior::Delay);

    if cfg!(debug_assertions) {
        println!("---------------开始启动SteamApi----------");
    }

    while let Some(app_info) = rx.recv().await {
        if steam_game_index.contains_key(&app_info.appid) {
            continue;
        }

        ticker.tick().await;
        if cfg!(debug_assertions) {
            println!("正在获取Steam游戏信息: {}", app_info.appid);
        }

        let steam_data: SteamData;
        match search_on_steam(app_info.appid).await {
            Ok(data) => steam_data = data,
            Err(_) => continue,
        };

        let url = format!(
            "https://steamcdn-a.akamaihd.net/steam/apps/{}/library_600x900_2x.jpg",
            app_info.appid
        );
        let cover_path = get_steam_cover(&state, &url).await.unwrap_or_else(|_| {
            state
                .download_path
                .join("default.jpg")
                .to_string_lossy()
                .into_owned()
        });

        let link_exe = [
            LinkExe::new(Arc::from(app_info.exe_path.clone()), Some(app_info.appid)),
            LinkExe::empty(),
            LinkExe::empty(),
        ];

        let (internal_game_id, folder_game) = {
            let mut game_data = state.game_data.lock().unwrap();
            let game = Game {
                id: game_data.next_id,
                name: Arc::from(steam_data.name),
                cover: Arc::from(cover_path),
                last_played: 0,
                play_time: 0,
                added_time: get_current_timestamp(),
                path: Arc::from(app_info.exe_path),
                developer: Arc::from(steam_data.developers.join(",")),
                publish_date: parse_steam_date(&steam_data.release_date.date).unwrap_or(0),
                score: steam_data
                    .metacritic
                    .unwrap_or(Metacritic { score: 0 })
                    .score as f32
                    / 10.0,
                liked: false,
                if_finished: false,
                steam_id: Some(app_info.appid),
                link_exe,
                daily_play_times: [DailyPlayTime {
                    play_date: 0,
                    play_time: 0,
                }; 7],
            };

            let folder_game = FolderGame {
                id: game.id,
                name: Arc::clone(&game.name),
                path: Arc::clone(&game.path),
                cover_url: Arc::clone(&game.cover),
                playtime: game.play_time,
                score: game.score,
            };

            if add_game_wal(&state, game.id, &game).is_err() {
                continue;
            }

            let internal_game_id = game.id;
            game_data.games.insert(internal_game_id, game);
            game_data.next_id += 1;
            (internal_game_id, folder_game)
        };

        steam_game_index.insert(app_info.appid, internal_game_id);

        let _ = window.emit("new-game-discovered", folder_game);
    }

    save_steam_game_index(&state.data_dir, &steam_game_index)
}

async fn search_on_steam(steam_id: u32) -> Result<SteamData, String> {
    let client = reqwest::Client::new();
    let url = format!(
        //以后会有其他语言
        "https://store.steampowered.com/api/appdetails?appids={}&l=schinese",
        steam_id
    );

    if let Ok(response) = client.get(&url).send().await {
        if cfg!(debug_assertions) {
            println!("获取steam商店信息: {}", url);
        }

        let mut res: HashMap<String, AppIdWrapper> =
            response.json().await.map_err(|e| e.to_string())?;

        let id_str = steam_id.to_string();

        if cfg!(debug_assertions) {
            println!(
                "获取steam商店信息成功: {:?}",
                res.get(&id_str).unwrap().data
            );
        }
        Ok(res.remove(&id_str).unwrap().data)
    } else {
        Err("获取steam商店信息失败".to_string())
    }
}

async fn get_steam_cover(state: &State<'_, AppState>, url: &str) -> Result<String, String> {
    let client = reqwest::Client::new();
    if cfg!(debug_assertions) {
        println!("正在下载Steam游戏封面: {}", url);
    }

    let response = client.get(url).send().await.map_err(|e| e.to_string())?;
    if !response.status().is_success() {
        return Err(format!(
            "下载图片失败，服务器返回错误码: {}",
            response.status()
        ));
    }
    let bytes = response.bytes().await.map_err(|e| e.to_string())?;

    if cfg!(debug_assertions) {
        println!("下载Steam游戏封面-----------完成-------");
    }

    let mut download_dir = state.download_path.clone();

    let file_name = {
        let name = state.game_data.lock().unwrap().next_id.to_string();
        let ext = find_extension(url);
        format!("{}.{}", name, ext)
    };

    download_dir.push(file_name);

    tokio::fs::write(&download_dir, bytes)
        .await
        .map_err(|_| format!("写入图片失败, 使用默认图片"))?;

    if cfg!(debug_assertions) {
        println!("Steam游戏封面下载成功: {:?}", download_dir);
    }

    Ok(download_dir
        .into_os_string()
        .into_string()
        .map_err(|_| "系统路径包含无法识别的非法 UTF-8 字符".to_string())?)
}

#[inline]
fn get_steam_path() -> Option<PathBuf> {
    let hklm = RegKey::predef(HKEY_CURRENT_USER);
    let steam_key = hklm.open_subkey("Software\\Valve\\Steam").ok()?;
    let steam_path: String = steam_key.get_value("SteamPath").ok()?;
    Some(PathBuf::from(steam_path))
}

#[inline]
fn get_library_folders(steam_path: &PathBuf) -> Option<Vec<PathBuf>> {
    let mut libraries = Vec::new();

    let vdf_path = steam_path.join("steamapps").join("libraryfolders.vdf");

    if let Ok(content) = fs::read_to_string(vdf_path) {
        for line in content.lines() {
            if line.contains("\"path\"") {
                let path: Vec<&str> = line.split('"').collect();
                libraries.push(PathBuf::from(path[3]));
                if cfg!(debug_assertions) {
                    println!("从vdf文件找到的 Steam Library Path: {:?}", path[3]);
                }
            }
        }
    }
    Some(libraries)
}

#[inline]
fn get_acf_info(steam_apps_path: &PathBuf, tx: &mpsc::Sender<SteamAppInfo>) -> Result<(), String> {
    let steam_apps_path = steam_apps_path.join("steamapps");
    if cfg!(debug_assertions) {
        println!("SteamApps目录: {:?}", steam_apps_path);
    }
    let entries = fs::read_dir(&steam_apps_path).map_err(|e| e.to_string())?;
    let entries_vec: Vec<_> = entries.flatten().collect();

    for entry in &entries_vec {
        let next_dir = entry.path();
        if cfg!(debug_assertions) {
            println!("正在扫描Steam游戏目录: {:?}", next_dir);
        }

        if next_dir.is_file() {
            if let Some(ext) = next_dir.extension() {
                if ext.to_string_lossy().to_lowercase() == "acf" {
                    if let Ok(content) = fs::read_to_string(&next_dir) {
                        let mut appid = None;
                        let mut install_dir_name = None;

                        for line in content.lines() {
                            let values = line.split('"').collect::<Vec<_>>();
                            if values.len() < 4 {
                                continue;
                            }

                            if line.contains("\"appid\"") {
                                appid = values[3].parse::<u32>().ok();
                            } else if line.contains("\"installdir\"") {
                                install_dir_name = Some(values[3].to_string());
                            }

                            if appid.is_some() && install_dir_name.is_some() {
                                break;
                            }
                        }

                        let (Some(appid), Some(install_dir_name)) = (appid, install_dir_name)
                        else {
                            if cfg!(debug_assertions) {
                                println!("Steam ACF 缺少 appid 或 installdir: {:?}", next_dir);
                            }
                            continue;
                        };

                        let install_dir = steam_apps_path.join("common").join(install_dir_name);
                        let Some(exe_path) = find_game_executable(&install_dir) else {
                            if cfg!(debug_assertions) {
                                println!("Steam 游戏目录中未找到可执行文件: {:?}", install_dir);
                            }
                            continue;
                        };

                        if cfg!(debug_assertions) {
                            println!("Steam AppId: {}, 游戏程序: {:?}", appid, exe_path);
                        }

                        let app_info = SteamAppInfo {
                            appid,
                            exe_path: exe_path.to_string_lossy().into_owned(),
                        };

                        if tx.blocking_send(app_info).is_err() {
                            return Ok(());
                        }
                    }
                }
            }
        }
    }

    Ok(())
}
