use crate::commands::game::ChangeLinkExeParams;
use crate::db::models::CommandRef;
use crate::db::wal::WalWriter;
use crate::models::{App, Game};
use crate::state::AppState;
use tauri::State;

#[inline]
pub fn add_game_wal(state: &State<'_, AppState>, id: u32, game: &Game) -> Result<(), String> {
    let path = &state.data_dir;
    let mut wal_writer = WalWriter::new(&path)?;

    if cfg!(debug_assertions) {
        println!("WAL路径：{}", path.to_str().unwrap());
    }

    let cmd = CommandRef::AddGame { id, game };
    wal_writer.append_command(cmd)
}

#[inline]
pub fn delete_game_wal(state: &State<'_, AppState>, id: u32) -> Result<(), String> {
    let path = &state.data_dir;
    let mut wal_writer = WalWriter::new(&path)?;

    let cmd = CommandRef::DeleteGame { id };
    wal_writer.append_command(cmd)
}

#[inline]
pub fn update_name_wal(state: &State<'_, AppState>, id: u32, name: &str) -> Result<(), String> {
    let path = &state.data_dir;
    let mut wal_writer = WalWriter::new(&path)?;

    let cmd = CommandRef::UpdateName { id, name };
    wal_writer.append_command(cmd)
}

#[inline]
pub fn update_like_wal(state: &State<'_, AppState>, id: u32, like: bool) -> Result<(), String> {
    let path = &state.data_dir;
    let mut wal_writer = WalWriter::new(&path)?;

    let cmd = CommandRef::UpdateLike { id, like };
    wal_writer.append_command(cmd)
}

#[inline]
pub fn update_finish_wal(state: &State<'_, AppState>, id: u32, finish: bool) -> Result<(), String> {
    let path = &state.data_dir;
    let mut wal_writer = WalWriter::new(&path)?;

    let cmd = CommandRef::UpdateFinish { id, finish };
    wal_writer.append_command(cmd)
}

#[inline]
pub fn update_main_game_id_wal(state: &State<'_, AppState>, id: u32) -> Result<(), String> {
    let path = &state.data_dir;
    let mut wal_writer = WalWriter::new(&path)?;

    let cmd = CommandRef::UpdateMainGameId { id };
    wal_writer.append_command(cmd)
}

#[inline]
pub fn update_last_play_wal(
    state: &State<'_, AppState>,
    id: u32,
    last_play: u64,
) -> Result<(), String> {
    let path = &state.data_dir;
    let mut wal_writer = WalWriter::new(&path)?;

    let cmd = CommandRef::UpdateLastPlay { id, last_play };
    wal_writer.append_command(cmd)
}

#[inline]
pub fn update_play_time_wal(
    state: &State<'_, AppState>,
    id: u32,
    play_time: u64,
) -> Result<(), String> {
    let path = &state.data_dir;
    let mut wal_writer = WalWriter::new(&path)?;

    let cmd = CommandRef::UpdatePlayTime { id, play_time };
    wal_writer.append_command(cmd)
}

#[inline]
pub fn update_daily_play_time_wal(
    state: &State<'_, AppState>,
    id: u32,
    play_date: u64,
    play_time: u64,
) -> Result<(), String> {
    let path = &state.data_dir;
    let mut wal_writer = WalWriter::new(path)?;

    let cmd = CommandRef::UpdateDailyPlayTime {
        id,
        play_date,
        play_time,
    };
    wal_writer.append_command(cmd)
}

#[inline]
pub fn update_exe_path_wal(state: &State<'_, AppState>, id: u32, path: &str) -> Result<(), String> {
    let data_dir = &state.data_dir;
    let mut wal_writer = WalWriter::new(data_dir)?;

    let cmd = CommandRef::UpdateExePath { id, path };
    wal_writer.append_command(cmd)
}

#[inline]
pub fn update_cover_wal(state: &State<'_, AppState>, id: u32, cover: &str) -> Result<(), String> {
    let data_dir = &state.data_dir;
    let mut wal_writer = WalWriter::new(data_dir)?;

    let cmd = CommandRef::UpdateCover { id, cover };
    wal_writer.append_command(cmd)
}

#[inline]
pub fn update_developer_wal(
    state: &State<'_, AppState>,
    id: u32,
    developer: &str,
) -> Result<(), String> {
    let data_dir = &state.data_dir;
    let mut wal_writer = WalWriter::new(data_dir)?;

    let cmd = CommandRef::UpdateDeveloper { id, developer };
    wal_writer.append_command(cmd)
}

#[inline]
pub fn update_score_wal(state: &State<'_, AppState>, id: u32, score: f32) -> Result<(), String> {
    let data_dir = &state.data_dir;
    let mut wal_writer = WalWriter::new(data_dir)?;

    let cmd = CommandRef::UpdateScore { id, score };
    wal_writer.append_command(cmd)
}

#[inline]
pub fn update_publish_date_wal(
    state: &State<'_, AppState>,
    id: u32,
    publish_date: u64,
) -> Result<(), String> {
    let data_dir = &state.data_dir;
    let mut wal_writer = WalWriter::new(data_dir)?;

    let cmd = CommandRef::UpdatePublishDate { id, publish_date };
    wal_writer.append_command(cmd)
}

#[inline]
pub fn add_app_wal(state: &State<'_, AppState>, id: u32, app: &App) -> Result<(), String> {
    let path = &state.data_dir;
    let mut wal_writer = WalWriter::new(&path)?;

    let cmd = CommandRef::AddApp { id, app };
    wal_writer.append_command(cmd)
}

#[inline]
pub fn delete_app_wal(state: &State<'_, AppState>, id: u32) -> Result<(), String> {
    let path = &state.data_dir;
    let mut wal_writer = WalWriter::new(&path)?;

    let cmd = CommandRef::DeleteApp { id };
    wal_writer.append_command(cmd)
}

#[inline]
pub fn update_link_exe_wal(
    state: &State<'_, AppState>,
    change_link_exe_params: ChangeLinkExeParams,
) -> Result<(), String> {
    let path = &state.data_dir;
    let mut wal_writer = WalWriter::new(&path)?;

    let cmd = CommandRef::UpdateLinkExe {
        change_link_exe_params,
    };
    wal_writer.append_command(cmd)
}

#[inline]
pub fn update_bgm_token_wal(state: &State<'_, AppState>, token: &str) -> Result<(), String> {
    let path = &state.data_dir;
    let mut wal_writer = WalWriter::new(&path)?;

    let cmd = CommandRef::UpdateBgmToken { token };
    wal_writer.append_command(cmd)
}

#[inline]
pub fn update_bgm_refresh_token_wal(
    state: &State<'_, AppState>,
    token: &str,
) -> Result<(), String> {
    let path = &state.data_dir;
    let mut wal_writer = WalWriter::new(&path)?;

    let cmd = CommandRef::UpdateBgmRefreshToken { token };
    wal_writer.append_command(cmd)
}

#[inline]
pub fn update_vndb_token_wal(state: &State<'_, AppState>, token: &str) -> Result<(), String> {
    let path = &state.data_dir;
    let mut wal_writer = WalWriter::new(&path)?;

    let cmd = CommandRef::UpdateVndbToken { token };
    wal_writer.append_command(cmd)
}

#[inline]
pub fn update_igdb_token_wal(state: &State<'_, AppState>, token: &str) -> Result<(), String> {
    let path = &state.data_dir;
    let mut wal_writer = WalWriter::new(path)?;

    let cmd = CommandRef::UpdateIgdbToken { token };
    wal_writer.append_command(cmd)
}

#[inline]
pub fn update_auto_start_wal(state: &State<'_, AppState>, yes: bool) -> Result<(), String> {
    let path = &state.data_dir;
    let mut wal_writer = WalWriter::new(&path)?;

    let cmd = CommandRef::UpdateAutoStart { yes };
    wal_writer.append_command(cmd)
}

#[inline]
pub fn update_hide_on_launch_wal(state: &State<'_, AppState>, yes: bool) -> Result<(), String> {
    let path = &state.data_dir;
    let mut wal_writer = WalWriter::new(&path)?;

    let cmd = CommandRef::UpdateHideonLaunch { yes };
    wal_writer.append_command(cmd)
}

#[inline]
pub fn update_close_tray_wal(state: &State<'_, AppState>, yes: bool) -> Result<(), String> {
    let path = &state.data_dir;
    let mut wal_writer = WalWriter::new(&path)?;

    let cmd = CommandRef::UpdateCloseTary { yes };
    wal_writer.append_command(cmd)
}

#[inline]
pub fn update_avatar_path_wal(
    state: &State<'_, AppState>,
    avatar_path: Option<&str>,
) -> Result<(), String> {
    let path = &state.data_dir;
    let mut wal_writer = WalWriter::new(&path)?;

    let cmd = CommandRef::UpdateAvatarPath { avatar_path };
    wal_writer.append_command(cmd)
}

#[inline]
pub fn update_launch_key_wal(state: &State<'_, AppState>, launch_key: &str) -> Result<(), String> {
    let path = &state.data_dir;
    let mut wal_writer = WalWriter::new(path)?;

    let cmd = CommandRef::UpdateLaunchKey { launch_key };
    wal_writer.append_command(cmd)
}
