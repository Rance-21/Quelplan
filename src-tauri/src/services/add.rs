use crate::api::bgm::{get_bgm_game_cover, search_on_bgm};
use crate::api::igdb::{get_igdb_game_cover, search_on_igdb};
use crate::api::vndb::{get_vndb_game_cover, search_on_vndb};
use crate::commands::add::{SOURCE_BGM, SOURCE_IGDB, SOURCE_VNDB};
use crate::models::{App, DailyPlayTime, Game, LinkExe, SearchCache, SearchResult, SearchedGame};
use crate::services::wal::add_game_wal;
use crate::state::AppState;
use crate::utils::time::{date_string_to_u64, get_current_timestamp};
use std::ffi::OsStr;
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use tauri::State;
use tokio::sync::mpsc::Sender;

#[inline]
pub async fn add_game(
    state: &State<'_, AppState>,
    cache: &State<'_, SearchCache>,
    name: Option<String>,
    path: &str,
    source_mask: u8,
) -> Result<SearchResult, String> {
    let path = path.replace("\\", "/");
    let game_temp_name = name.unwrap_or(get_game_temp_name(&path));
    let searched_games = get_searched_games(&state, &game_temp_name, source_mask).await?;

    let mut search_cache = cache.results.lock().unwrap();

    let result = SearchResult {
        path: Arc::from(path),
        searched_games,
    };

    search_cache.push(result.clone());

    Ok(result)
}

async fn get_searched_games(
    state: &State<'_, AppState>,
    game_temp_name: &str,
    source_mask: u8,
) -> Result<Vec<SearchedGame>, String> {
    let mut search_results = Vec::new();

    if source_mask & SOURCE_BGM == 0
        && source_mask & SOURCE_VNDB == 0
        && source_mask & SOURCE_IGDB == 0
    {
        search_results.push(none_source_game(state, &game_temp_name).unwrap());
        return Ok(search_results);
    }

    if source_mask & SOURCE_BGM != 0 {
        let token = state.tokens.lock().unwrap().bgm.clone();
        let refresh_token = state.tokens.lock().unwrap().bgm_refresh.clone();
        for game in search_on_bgm(&game_temp_name, token, refresh_token, state)
            .await
            .unwrap_or_else(|_| Vec::new())
        {
            search_results.push(game);
        }
    }

    if source_mask & SOURCE_VNDB != 0 {
        let token = state.tokens.lock().unwrap().vndb.clone();
        for game in search_on_vndb(game_temp_name, token)
            .await
            .unwrap_or_else(|_| Vec::new())
        {
            search_results.push(game);
        }
    }

    if source_mask & SOURCE_IGDB != 0 {
        for game in search_on_igdb(game_temp_name, state)
            .await
            .unwrap_or_else(|_| Vec::new())
        {
            search_results.push(game);
        }
    }

    if search_results.is_empty() {
        Err("Can't find any game!".to_string())
    } else {
        Ok(search_results)
    }
}

fn get_game_temp_name(exe_path: &str) -> String {
    let folder_name: Vec<&str> = exe_path.split('/').collect();
    if folder_name.len() < 2 {
        return folder_name.last().unwrap().to_string();
    }
    let name = folder_name[folder_name.len() - 2];
    let mut true_name: String = "".to_string();

    let mut in_parentthesis: bool = false;
    for c in name.chars() {
        if is_left_parenthesis(&c) {
            in_parentthesis = true;
        }

        if !in_parentthesis {
            true_name.push(c);
        }

        if is_right_parenthesis(&c) {
            in_parentthesis = false;
        }
    }

    if true_name == "bin" {
        let parent = Path::new(exe_path).parent().unwrap();
        let exe_path = &parent.to_string_lossy();
        return get_game_temp_name(exe_path);
    }

    true_name
}

#[inline]
fn is_left_parenthesis(c: &char) -> bool {
    *c == '(' || *c == '（' || *c == '[' || *c == '【' || *c == '<' || *c == '{' || *c == '《'
}

#[inline]
fn is_right_parenthesis(c: &char) -> bool {
    *c == ')' || *c == '）' || *c == ']' || *c == '】' || *c == '>' || *c == '}' || *c == '》'
}

fn none_source_game(state: &State<'_, AppState>, name: &str) -> Result<SearchedGame, String> {
    let image = default_cover_path(state)?;

    return Ok(SearchedGame {
        name: Arc::from(name),
        image: Arc::from(image.as_str()),
        score: 0.0,
        developer: Arc::from("未知开发商".to_string()),
        //传image直接返回None
        publish_date: date_string_to_u64(&image).unwrap_or(0),
    });
}

fn default_cover_path(state: &State<'_, AppState>) -> Result<String, String> {
    state
        .download_path
        .join("default.jpg")
        .into_os_string()
        .into_string()
        .map_err(|_| "默认封面路径不是有效的 UTF-8".to_string())
}

pub fn dfs_add_games(dir: &Path, sender: &Sender<String>) {
    let entries = match fs::read_dir(dir) {
        Ok(e) => e,
        Err(_) => return,
    };

    let entries_vec: Vec<_> = entries.flatten().collect();

    // 第一遍扫描：只找当前目录下的 exe
    for entry in &entries_vec {
        let next_dir = entry.path();

        if next_dir.is_file() {
            if let Some(ext) = next_dir.extension() {
                if ext.to_string_lossy().to_lowercase() == "exe" {
                    let name = next_dir.file_name().unwrap_or(OsStr::new(""));

                    if check_exe(name) {
                        continue;
                    }

                    let path = next_dir.to_string_lossy().to_string();
                    if sender.blocking_send(path).is_err() {
                        return;
                    }

                    return;
                }
            }
        }
    }

    // 第二遍扫描：只找子文件夹并递归
    for entry in &entries_vec {
        let next_dir = entry.path();

        if next_dir.is_dir() {
            let last_folder = next_dir.iter().last().unwrap();

            if check_dir(last_folder) {
                continue;
            }

            dfs_add_games(&next_dir, sender);
        }
    }
}

#[inline]
fn check_exe(file_name: &OsStr) -> bool {
    let name_lower = file_name.to_string_lossy().to_ascii_lowercase();

    // 黑名单过滤
    name_lower.contains("uninstall")
        || name_lower.contains("unins")
        || name_lower.contains("Magpie")
        || name_lower.contains("update")
        || name_lower.contains("redist")
        || name_lower.contains("save")
        || name_lower.contains("修改器")
}

#[inline]
fn check_dir(last_folder: &OsStr) -> bool {
    let name_lower = last_folder.to_string_lossy().to_ascii_lowercase();

    name_lower.contains("cache") || name_lower.contains("log") || name_lower.contains("data")
}

pub fn add_steam_app(path: String, state: State<'_, AppState>, name: &str) -> Result<u32, String> {
    let parts: Vec<&str> = path.split("/steamapps/common/").collect();

    let mut steamapps_dir = PathBuf::from(parts[0]);
    steamapps_dir.push("steamapps");

    let install_dir_name = parts[1]
        .split('/')
        .next()
        .ok_or("无法从路径中提取出游戏安装目录名称")?;

    if cfg!(debug_assertions) {
        println!("目标 steamapps 目录: {:?}", steamapps_dir);
        println!("目标游戏安装目录名: {}", install_dir_name);
    }

    let entries =
        fs::read_dir(&steamapps_dir).map_err(|e| format!("无法读取 steamapps 目录: {}", e))?;

    for entry in entries.flatten() {
        let file_path = entry.path();

        //检查.acf 文件
        if file_path.is_file() && file_path.extension().unwrap_or_default() == "acf" {
            if let Ok(content) = fs::read_to_string(&file_path) {
                let mut current_appid: Option<u32> = None;
                let mut current_installdir = String::new();

                for line in content.lines() {
                    if line.contains("\"appid\"") {
                        let tokens: Vec<&str> = line.split('"').collect();
                        if tokens.len() >= 4 {
                            current_appid = tokens[3].parse::<u32>().ok();
                        }
                    } else if line.contains("\"installdir\"") {
                        let tokens: Vec<&str> = line.split('"').collect();
                        if tokens.len() >= 4 {
                            current_installdir = tokens[3].to_string();
                        }
                        break;
                    }
                }

                if current_installdir.eq_ignore_ascii_case(install_dir_name) {
                    if let Some(steam_id) = current_appid {
                        let mut app_data = state.app_data.lock().unwrap();
                        let id = app_data.next_id;
                        let app = App {
                            id,
                            steam_id: Some(steam_id),
                            name: Arc::from(name),
                            exe_path: Arc::from(path),
                        };

                        if cfg!(debug_assertions) {
                            println!(
                                "找到匹配的 ACF 文件: {:?}, Steam AppId: {}",
                                file_path, steam_id
                            );
                        }

                        app_data.apps.insert(id, app);
                        app_data.next_id += 1;

                        return Ok(id);
                    }
                }
            }
        }
    }

    Err(format!("未找到匹配 '{}' 的 acf 配置文件", install_dir_name))
}

pub async fn add_game_to_db(
    state: &State<'_, AppState>,
    path: &str,
    search_res: &SearchedGame,
) -> Result<(), String> {
    let id = {
        let game_data = state.game_data.lock().unwrap();
        game_data.next_id
    };

    let default_cover = default_cover_path(state)?;

    let cover = get_cover(&state, &search_res.image, id)
        .await
        .unwrap_or(default_cover);

    let link_exe = [
        LinkExe::new(Arc::from(path.to_string()), None),
        LinkExe::empty(),
        LinkExe::empty(),
    ];

    let game = Game {
        id: id,
        name: search_res.name.clone(),
        path: Arc::from(path),
        cover: Arc::from(cover),
        last_played: 0,
        play_time: 0,
        added_time: get_current_timestamp(),
        score: search_res.score,
        developer: search_res.developer.clone(),
        publish_date: search_res.publish_date,
        liked: false,
        if_finished: false,
        steam_id: None,
        link_exe: link_exe,
        daily_play_times: [DailyPlayTime {
            play_date: 0,
            play_time: 0,
        }; 7],
    };

    add_game_wal(&state, id, &game)?;
    let mut game_data = state.game_data.lock().unwrap();
    game_data.next_id += 1;
    game_data.games.insert(id, game);
    Ok(())
}

async fn get_cover(state: &State<'_, AppState>, url: &str, id: u32) -> Result<String, String> {
    if Path::new(url).is_file() {
        return Ok(url.to_string());
    }

    let normalized_url = if url.starts_with("//") {
        format!("https:{}", url)
    } else {
        url.to_string()
    };
    let parsed_url =
        reqwest::Url::parse(&normalized_url).map_err(|_| format!("无法识别封面地址: {}", url))?;
    let host = parsed_url
        .host_str()
        .ok_or_else(|| format!("封面地址缺少域名: {}", url))?;

    let download_result = if host == "bgm.tv" || host.ends_with(".bgm.tv") {
        get_bgm_game_cover(state, &normalized_url, id).await
    } else if host == "vndb.org" || host.ends_with(".vndb.org") {
        get_vndb_game_cover(state, &normalized_url, id).await
    } else if host == "images.igdb.com" {
        get_igdb_game_cover(state, &normalized_url, id).await
    } else {
        return Err(format!("不支持的封面数据源: {}", host));
    };

    download_result.or_else(|_| default_cover_path(state))
}
