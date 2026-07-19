use crate::commands::game::ChangeLinkExeParams;
use crate::models::{App, Game};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub enum Command {
    AddGame {
        id: u32,
        game: Game,
    },
    DeleteGame {
        id: u32,
    },
    UpdateName {
        id: u32,
        name: String,
    },
    UpdatePlayTime {
        id: u32,
        play_time: u64,
    },
    UpdateDailyPlayTime {
        id: u32,
        play_date: u64,
        play_time: u64,
    },
    UpdateFinish {
        id: u32,
        finish: bool,
    },
    UpdateLike {
        id: u32,
        like: bool,
    },
    UpdateExePath {
        id: u32,
        path: String,
    },
    UpdateLastPlay {
        id: u32,
        last_play: u64,
    },
    UpdateLinkExe {
        change_link_exe_params: ChangeLinkExeParams,
    },
    UpdateMainGameId {
        id: u32,
    },
    AddApp {
        id: u32,
        app: App,
    },
    DeleteApp {
        id: u32,
    },
    UpdateBgmToken {
        token: String,
    },
    UpdateVndbToken {
        token: String,
    },
    UpdateAutoStart {
        yes: bool,
    },
    UpdateHideonLaunch {
        yes: bool,
    },
    UpdateCloseTary {
        yes: bool,
    },
    UpdateCover {
        id: u32,
        cover: String,
    },
    UpdateAvatarPath {
        avatar_path: Option<String>,
    },
    UpdateSteamId {
        id: u32,
        steam_id: Option<u32>,
    },
    UpdateLaunchKey {
        launch_key: String,
    },
    UpdateBgmRefreshToken {
        token: String,
    },
    UpdateIgdbToken {
        token: String,
    },
    UpdateDeveloper {
        id: u32,
        developer: String,
    },
    UpdateScore {
        id: u32,
        score: f32,
    },
    UpdatePublishDate {
        id: u32,
        publish_date: u64,
    },
}

#[derive(Serialize)]
pub enum CommandRef<'a> {
    AddGame {
        id: u32,
        game: &'a Game,
    },
    DeleteGame {
        id: u32,
    },
    UpdateName {
        id: u32,
        name: &'a str,
    },
    UpdatePlayTime {
        id: u32,
        play_time: u64,
    },
    UpdateDailyPlayTime {
        id: u32,
        play_date: u64,
        play_time: u64,
    },
    UpdateFinish {
        id: u32,
        finish: bool,
    },
    UpdateLike {
        id: u32,
        like: bool,
    },
    UpdateExePath {
        id: u32,
        path: &'a str,
    },
    UpdateLastPlay {
        id: u32,
        last_play: u64,
    },
    UpdateLinkExe {
        change_link_exe_params: ChangeLinkExeParams,
    },
    UpdateMainGameId {
        id: u32,
    },
    AddApp {
        id: u32,
        app: &'a App,
    },
    DeleteApp {
        id: u32,
    },
    UpdateBgmToken {
        token: &'a str,
    },
    UpdateVndbToken {
        token: &'a str,
    },
    UpdateAutoStart {
        yes: bool,
    },
    UpdateHideonLaunch {
        yes: bool,
    },
    UpdateCloseTary {
        yes: bool,
    },
    UpdateCover {
        id: u32,
        cover: &'a str,
    },
    UpdateAvatarPath {
        avatar_path: Option<&'a str>,
    },
    #[allow(dead_code)]
    UpdateSteamId {
        id: u32,
        steam_id: Option<u32>,
    },
    UpdateLaunchKey {
        launch_key: &'a str,
    },
    UpdateBgmRefreshToken {
        token: &'a str,
    },
    UpdateIgdbToken {
        token: &'a str,
    },
    UpdateDeveloper {
        id: u32,
        developer: &'a str,
    },
    UpdateScore {
        id: u32,
        score: f32,
    },
    UpdatePublishDate {
        id: u32,
        publish_date: u64,
    },
}
