use super::models::Command;
use crate::models::{Apps, Games, LinkExe, Settings, Tokens};
use crate::services::game::*;
use bincode;
use std::fs::File;
use std::io::{BufReader, BufWriter, Read, Write};
use std::path::Path;
use std::sync::Arc;

#[derive(serde::Deserialize, serde::Serialize)]
struct LegacySettings {
    auto_start: bool,
    hide_on_launch: bool,
    close_tary: bool,
    avatar_path: Option<String>,
}

#[derive(serde::Deserialize, serde::Serialize)]
struct LegacyTokens {
    bgm: Option<String>,
    bgm_refresh: Option<String>,
    vndb: Option<String>,
}

fn deserialize_settings(mut reader: impl Read) -> Settings {
    let mut bytes = Vec::new();
    if reader.read_to_end(&mut bytes).is_err() {
        return Settings::new();
    }

    bincode::deserialize(&bytes).unwrap_or_else(|_| {
        bincode::deserialize::<LegacySettings>(&bytes)
            .map(|legacy_settings| Settings {
                auto_start: legacy_settings.auto_start,
                hide_on_launch: legacy_settings.hide_on_launch,
                close_tary: legacy_settings.close_tary,
                avatar_path: legacy_settings.avatar_path,
                launch_key: "F9".to_string(),
            })
            .unwrap_or_else(|_| Settings::new())
    })
}

fn deserialize_tokens(mut reader: impl Read) -> Tokens {
    let mut bytes = Vec::new();
    if reader.read_to_end(&mut bytes).is_err() {
        return Tokens::new();
    }

    bincode::deserialize(&bytes).unwrap_or_else(|_| {
        bincode::deserialize::<LegacyTokens>(&bytes)
            .map(|legacy_tokens| Tokens {
                bgm: legacy_tokens.bgm,
                bgm_refresh: legacy_tokens.bgm_refresh,
                vndb: legacy_tokens.vndb,
                igdb: None,
            })
            .unwrap_or_else(|_| Tokens::new())
    })
}

pub struct DataBase {
    pub games: Games,
    pub apps: Apps,
    pub tokens: Tokens,
    pub settings: Settings,
}

pub fn init_db(path: &Path) -> Result<DataBase, String> {
    let game_path = path.join("games.db");
    let app_path = path.join("apps.db");
    let token_path = path.join("tokens.db");
    let setting_path = path.join("settings.db");
    let wal_path = path.join("log.wal");

    let mut games: Games = if game_path.exists() {
        let file = File::open(&game_path).map_err(|e| format!("无法打开游戏信息存储文件 {}", e))?;
        let reader = BufReader::new(file);

        bincode::deserialize_from(reader).unwrap_or_else(|_| Games::new())
    } else {
        Games::new()
    };

    let mut apps: Apps = if app_path.exists() {
        let file = File::open(&app_path).map_err(|e| format!("无法打开App信息存储文件 {}", e))?;
        let reader = BufReader::new(file);

        bincode::deserialize_from(reader).unwrap_or_else(|_| Apps::new())
    } else {
        Apps::new()
    };

    let mut tokens: Tokens = if token_path.exists() {
        let file =
            File::open(&token_path).map_err(|e| format!("无法打开Token信息存储文件 {}", e))?;
        let reader = BufReader::new(file);

        deserialize_tokens(reader)
    } else {
        Tokens::new()
    };

    let mut settings: Settings = if setting_path.exists() {
        let file =
            File::open(&setting_path).map_err(|e| format!("无法打开设置信息存储文件 {}", e))?;
        let reader = BufReader::new(file);

        deserialize_settings(reader)
    } else {
        Settings::new()
    };

    if wal_path.exists() {
        if cfg!(debug_assertions) {
            println!("wal路径存在，开始读取数据");
        }

        let file = File::open(&wal_path).map_err(|e| format!("无法打开wal文件 {}", e))?;
        let mut reader = BufReader::new(file);

        while let Ok(cmd) = bincode::deserialize_from::<_, Command>(&mut reader) {
            apply_cmd(&mut apps, &mut games, &mut tokens, &mut settings, cmd);
            if cfg!(debug_assertions) {
                println!("已经读取一条wal");
            }
        }
    }

    Ok(DataBase {
        games,
        apps,
        tokens,
        settings,
    })
}

#[inline]
fn apply_cmd(
    apps: &mut Apps,
    games: &mut Games,
    tokens: &mut Tokens,
    settings: &mut Settings,
    cmd: Command,
) {
    //编译器会优化成jmp，而不是一个个匹配
    match cmd {
        Command::AddGame { id, game } => {
            games.games.insert(id, game);
            games.next_id += 1;
            if cfg!(debug_assertions) {
                println!("已经插入  {}", id);
            }
        }
        Command::DeleteGame { id } => {
            games.games.remove(&id);
        }
        Command::UpdateName { id, name } => {
            let game = games.games.get_mut(&id).unwrap();
            game.name = Arc::from(name);
        }
        Command::UpdatePlayTime { id, play_time } => {
            let game = games.games.get_mut(&id).unwrap();
            game.play_time += play_time;
        }
        Command::UpdateDailyPlayTime {
            id,
            play_date,
            play_time,
        } => {
            let game = games.games.get_mut(&id).unwrap();
            update_daily_play_time(game, play_date, play_time);
        }
        Command::UpdateFinish { id, finish } => {
            let game = games.games.get_mut(&id).unwrap();
            game.if_finished = finish;
        }
        Command::UpdateLike { id, like } => {
            let game = games.games.get_mut(&id).unwrap();
            game.liked = like;
        }
        Command::UpdateExePath { id, path } => {
            let game = games.games.get_mut(&id).unwrap();
            game.path = Arc::from(path);
        }
        Command::UpdateCover { id, cover } => {
            let game = games.games.get_mut(&id).unwrap();
            game.cover = Arc::from(cover);
        }
        Command::UpdateLastPlay { id, last_play } => {
            let game = games.games.get_mut(&id).unwrap();
            game.last_played = last_play;
        }
        Command::UpdateMainGameId { id } => {
            games.main_game_id = Some(id);
        }
        Command::UpdateLinkExe {
            change_link_exe_params,
        } => {
            let link_ids = [
                change_link_exe_params.first_id,
                change_link_exe_params.second_id,
                change_link_exe_params.third_id,
            ];
            //待优化
            let which_index = change_link_exe_params
                .which_is_game
                .checked_sub(1)
                .and_then(|idx| usize::try_from(idx).ok())
                .unwrap();
            let id = link_ids[which_index];

            let game = games.games.get_mut(&id).unwrap();

            let mut next_link_exe = std::array::from_fn(|_| LinkExe::empty());

            for (index, link_id) in link_ids.iter().enumerate() {
                if index == which_index {
                    next_link_exe[index] = LinkExe::new(game.path.clone(), game.steam_id);
                } else if *link_id == 0 {
                    next_link_exe[index] = LinkExe::empty();
                } else {
                    //待优化
                    let app = apps.apps.get(link_id).unwrap();
                    next_link_exe[index] = LinkExe::new(Arc::clone(&app.exe_path), app.steam_id);
                }
            }

            game.link_exe = next_link_exe;
        }
        Command::AddApp { id, app } => {
            apps.apps.insert(id, app);
        }
        Command::DeleteApp { id } => {
            apps.apps.remove(&id);
        }
        Command::UpdateBgmToken { token } => tokens.bgm = Some(token),
        Command::UpdateVndbToken { token } => tokens.vndb = Some(token),
        Command::UpdateAutoStart { yes } => settings.auto_start = yes,
        Command::UpdateCloseTary { yes } => settings.close_tary = yes,
        Command::UpdateHideonLaunch { yes } => settings.hide_on_launch = yes,
        Command::UpdateAvatarPath { avatar_path } => settings.avatar_path = avatar_path,
        Command::UpdateSteamId { id, steam_id } => {
            let game = games.games.get_mut(&id).unwrap();
            game.steam_id = steam_id;
        }
        Command::UpdateLaunchKey { launch_key } => settings.launch_key = launch_key,
        Command::UpdateBgmRefreshToken { token } => tokens.bgm_refresh = Some(token),
        Command::UpdateIgdbToken { token } => tokens.igdb = Some(token),
        Command::UpdateDeveloper { id, developer } => {
            let game = games.games.get_mut(&id).unwrap();
            game.developer = Arc::from(developer);
        }
        Command::UpdateScore { id, score } => {
            let game = games.games.get_mut(&id).unwrap();
            game.score = score;
        }
        Command::UpdatePublishDate { id, publish_date } => {
            let game = games.games.get_mut(&id).unwrap();
            game.publish_date = publish_date;
        }
    }
}

#[inline]
fn replace_file(from: &Path, to: &Path) -> Result<(), String> {
    if to.exists() {
        std::fs::remove_file(to).map_err(|e| e.to_string())?;
    }

    std::fs::rename(from, to).map_err(|e| e.to_string())
}

pub fn save_full_snapshot(
    games: &Games,
    apps: &Apps,
    tokens: &Tokens,
    settings: &Settings,
    path: &Path,
) -> Result<(), String> {
    let games_temp_path = path.join("games_temp.db");
    let apps_temp_path = path.join("apps_temp.db");
    let tokens_temp_path = path.join("tokens_temp.db");
    let settings_temp_path = path.join("settings_temp.db");
    let wal_path = path.join("log.wal");

    let temp_games = File::create(&games_temp_path).map_err(|e| e.to_string())?;
    let temp_apps = File::create(&apps_temp_path).map_err(|e| e.to_string())?;
    let temp_tokens = File::create(&tokens_temp_path).map_err(|e| e.to_string())?;
    let temp_settings = File::create(&settings_temp_path).map_err(|e| e.to_string())?;

    let mut games_writer = BufWriter::new(temp_games);
    let mut apps_writer = BufWriter::new(temp_apps);
    let mut tokens_writer = BufWriter::new(temp_tokens);
    let mut settings_writer = BufWriter::new(temp_settings);

    bincode::serialize_into(&mut games_writer, games).map_err(|e| e.to_string())?;
    bincode::serialize_into(&mut apps_writer, apps).map_err(|e| e.to_string())?;
    bincode::serialize_into(&mut tokens_writer, tokens).map_err(|e| e.to_string())?;
    bincode::serialize_into(&mut settings_writer, settings).map_err(|e| e.to_string())?;

    games_writer.flush().map_err(|e| e.to_string())?;
    apps_writer.flush().map_err(|e| e.to_string())?;
    tokens_writer.flush().map_err(|e| e.to_string())?;
    settings_writer.flush().map_err(|e| e.to_string())?;

    drop(games_writer);
    drop(apps_writer);
    drop(tokens_writer);
    drop(settings_writer);

    let apps_path = path.join("apps.db");
    let games_path = path.join("games.db");
    let tokens_path = path.join("tokens.db");
    let settings_path = path.join("settings.db");

    replace_file(&games_temp_path, &games_path)?;
    replace_file(&apps_temp_path, &apps_path)?;
    replace_file(&tokens_temp_path, &tokens_path)?;
    replace_file(&settings_temp_path, &settings_path)?;

    File::create(wal_path).map_err(|e| format!("清空 WAL 失败: {}", e))?;

    Ok(())
}
