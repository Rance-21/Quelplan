use crate::db::engine::init_db;
use crate::models::{Apps, Games, Settings, Tokens};
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{AppHandle, Manager};
use tokio::sync::Mutex as AsyncMutex;

pub struct AppState {
    pub game_data: Mutex<Games>,
    pub app_data: Mutex<Apps>,
    pub data_dir: PathBuf,
    pub download_path: PathBuf,
    pub tokens: Mutex<Tokens>,
    pub settings: Mutex<Settings>,
    pub steam_import_mutex: AsyncMutex<()>,
}

impl AppState {
    pub fn init(app: &AppHandle) -> Result<Self, Box<dyn std::error::Error>> {
        let mut data_dir = app.path().app_local_data_dir()?;
        data_dir.push("data");
        std::fs::create_dir_all(&data_dir)?;

        let data_base = init_db(&data_dir)?;
        let game_data = data_base.games;
        let app_data = data_base.apps;
        let tokens = data_base.tokens;
        let settings = data_base.settings;

        let mut download_path = app
            .path()
            .app_local_data_dir()
            .unwrap_or_else(|_| PathBuf::from("./"));
        download_path.push("cover");
        std::fs::create_dir_all(&download_path)?;

        let default_cover = download_path.join("default.jpg");
        let default_bytes = include_bytes!("..\\assets\\default.jpg");

        fs::write(default_cover, default_bytes)?;

        return Ok(Self {
            game_data: Mutex::new(game_data),
            app_data: Mutex::new(app_data),
            data_dir,
            download_path,
            tokens: Mutex::new(tokens),
            settings: Mutex::new(settings),
            steam_import_mutex: AsyncMutex::new(()),
        });
    }
}
