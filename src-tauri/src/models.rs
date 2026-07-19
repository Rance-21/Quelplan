use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use std::sync::Mutex;

#[derive(Serialize, Deserialize, Clone, Copy)]
pub struct DailyPlayTime {
    pub play_date: u64,
    pub play_time: u64,
}

//序列化和反序列化
#[derive(Serialize, Deserialize, Clone)]
pub struct LinkExe {
    pub steam_id: Option<u32>,
    pub path: Arc<str>,
}

impl LinkExe {
    pub fn empty() -> Self {
        Self {
            steam_id: None,
            path: Arc::from(""),
        }
    }

    pub fn new(path: Arc<str>, steam_id: Option<u32>) -> Self {
        Self { steam_id, path }
    }
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Game {
    pub id: u32,
    pub name: Arc<str>,
    pub path: Arc<str>,
    pub cover: Arc<str>,
    pub last_played: u64,
    pub play_time: u64,
    pub added_time: u64,
    pub score: f32,
    pub developer: Arc<str>,
    pub publish_date: u64,
    pub liked: bool,
    pub if_finished: bool,
    pub steam_id: Option<u32>,
    pub link_exe: [LinkExe; 3],
    pub daily_play_times: [DailyPlayTime; 7],
}

#[derive(Serialize, Deserialize)]
pub struct Games {
    pub games: HashMap<u32, Game>,
    pub next_id: u32,
    pub main_game_id: Option<u32>,
}

impl Games {
    pub fn new() -> Self {
        let games: HashMap<u32, Game> = HashMap::with_capacity(1000);
        return Self {
            games,
            next_id: 1,
            main_game_id: None,
        };
    }
}

#[derive(Serialize, Clone)]
pub struct FolderGame {
    pub id: u32,
    pub name: Arc<str>,
    pub path: Arc<str>,
    #[serde(rename = "coverUrl")] //自动无缝转换成前端的驼峰命名
    pub cover_url: Arc<str>,
    pub playtime: u64,
    pub score: f32,
}

#[derive(Serialize)]
pub struct FolderGames {
    pub games: Vec<FolderGame>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct App {
    pub id: u32,
    pub exe_path: Arc<str>,
    pub name: Arc<str>,
    pub steam_id: Option<u32>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Apps {
    pub apps: HashMap<u32, App>,
    pub next_id: u32,
}

impl Apps {
    pub fn new() -> Self {
        let apps: HashMap<u32, App> = HashMap::with_capacity(100);
        return Self { apps, next_id: 1 };
    }
}

#[derive(Serialize, Deserialize, Clone)]
pub struct MainGame {
    pub id: u32,
    pub name: Arc<str>,
    #[serde(rename = "coverUrl")] //自动无缝转换成前端的驼峰命名
    pub cover_url: Arc<str>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Tokens {
    pub bgm: Option<String>,
    pub bgm_refresh: Option<String>,
    pub vndb: Option<String>,
    pub igdb: Option<String>,
}

impl Tokens {
    pub fn new() -> Self {
        Self {
            bgm: None,
            bgm_refresh: None,
            vndb: None,
            igdb: None,
        }
    }
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Settings {
    pub auto_start: bool,
    pub hide_on_launch: bool,
    pub close_tary: bool,
    pub avatar_path: Option<String>,
    pub launch_key: String,
}

impl Settings {
    pub fn new() -> Self {
        Self {
            auto_start: false,
            hide_on_launch: false,
            close_tary: false,
            avatar_path: None,
            launch_key: "F9".to_string(),
        }
    }
}

#[derive(Serialize)]
pub struct SearchCache {
    pub results: Mutex<Vec<SearchResult>>,
}

#[derive(Serialize, Clone)]
pub struct SearchResult {
    pub path: Arc<str>,
    pub searched_games: Vec<SearchedGame>,
}

#[derive(Serialize, Clone)]
pub struct SearchedGame {
    pub name: Arc<str>,
    pub score: f32,
    pub publish_date: u64,
    pub image: Arc<str>,
    pub developer: Arc<str>,
}

impl SearchCache {
    pub fn new() -> Self {
        Self {
            results: Mutex::new(Vec::new()),
        }
    }

    pub fn clear(&self) {
        let mut locked_results = self.results.lock().unwrap();
        *locked_results = Vec::new();
    }
}
