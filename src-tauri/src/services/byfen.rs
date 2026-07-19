use crate::db::engine::init_db;
use crate::state::AppState;
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use tauri::State;

pub fn create_migration_folders(selected_dir: &Path) -> Result<Vec<PathBuf>, String> {
    let base_path = Path::new(&selected_dir);

    let byfen_dir = base_path.join("quelplan_byfen");
    let data_dir = byfen_dir.join("data");
    let cover_dir = byfen_dir.join("cover");

    fs::create_dir_all(&data_dir).map_err(|e| format!("创建 data 目录失败: {}", e))?;
    fs::create_dir_all(&cover_dir).map_err(|e| format!("创建 cover 目录失败: {}", e))?;

    Ok(vec![data_dir, cover_dir])
}

#[inline]
pub fn copy_cover(src: &Path, dst: &Path) -> Result<u64, String> {
    if src.exists() || dst.exists() {
        return fs::copy(src, dst).map_err(|e| e.to_string());
    }
    Err(" 路径不存在".to_string())
}

pub fn replace_folder(byfen_folder: &Path, db_folder: &Path) -> Result<(), String> {
    if !byfen_folder.exists() {
        return Err("传入的 Byfen 文件夹根本不存在！".to_string());
    }

    //cover或data
    let folder_name = byfen_folder
        .file_name()
        .unwrap_or_default()
        .to_string_lossy();

    let temp_folder = db_folder.join(format!("{}_temp", folder_name));
    if cfg!(debug_assertions) {
        println!("临时文件夹路径: {:?}", temp_folder);
    }
    let backup_folder = db_folder.join(format!("{}_backup", folder_name));
    if cfg!(debug_assertions) {
        println!("备份文件夹路径: {:?}", backup_folder);
    }
    let origin_folder = db_folder.join(folder_name.to_string());

    let _ = fs::remove_dir_all(&temp_folder);
    let _ = fs::remove_dir_all(&backup_folder);

    if cfg!(debug_assertions) {
        println!("开始复制文件夹: {:?} 到 {:?}", byfen_folder, temp_folder);
    }

    copy_dir_all(byfen_folder, &temp_folder)?;

    if db_folder.exists() {
        fs::rename(&origin_folder, &backup_folder)
            .map_err(|e| format!("备份旧文件夹失败: {}", e))?;
    }

    if let Err(e) = fs::rename(&temp_folder, &origin_folder) {
        let _ = fs::rename(&backup_folder, &origin_folder);
        return Err(format!("文件夹替换失败，已自动回滚旧数据: {}", e));
    }

    if backup_folder.exists() {
        let _ = fs::remove_dir_all(&backup_folder);
    }

    if cfg!(debug_assertions) {
        println!("文件夹替换成功: {:?} -> {:?}", byfen_folder, origin_folder);
    }

    Ok(())
}

fn copy_dir_all(src: impl AsRef<Path>, dst: impl AsRef<Path>) -> Result<(), String> {
    let src = src.as_ref();
    let dst = dst.as_ref();

    if !dst.exists() {
        fs::create_dir_all(dst).map_err(|e| format!("创建目标目录失败: {}", e))?;
    }

    for entry in fs::read_dir(src).map_err(|e| e.to_string())?.flatten() {
        let ty = entry.file_type().map_err(|e| e.to_string())?;
        let dst_path = dst.join(entry.file_name());

        if ty.is_dir() {
            copy_dir_all(entry.path(), &dst_path)?;
        } else {
            fs::copy(entry.path(), &dst_path).map_err(|e| format!("复制文件失败: {:?}", e))?;
        }
    }
    Ok(())
}

pub fn replace_state(state: State<'_, AppState>) -> Result<(), String> {
    let new_db = init_db(&state.data_dir)?;

    let mut app_state = state.app_data.lock().unwrap();
    *app_state = new_db.apps;

    let mut game_state = state.game_data.lock().unwrap();
    *game_state = new_db.games;

    let cover_folder = state.download_path.join("cover");
    for game in game_state.games.values_mut() {
        let cover_name = game.cover.split('/').last().unwrap_or_default();
        let cover_path = cover_folder.join(cover_name);
        game.cover = Arc::from(cover_path.to_string_lossy().to_string());
    }

    let mut tokens_state = state.tokens.lock().unwrap();
    *tokens_state = new_db.tokens;

    let mut settings_state = state.settings.lock().unwrap();
    *settings_state = new_db.settings;

    if let Some(avatar_name) = settings_state
        .avatar_path
        .as_deref()
        .and_then(|avatar_path| Path::new(avatar_path).file_name())
        .map(|avatar_name| avatar_name.to_owned())
    {
        let avatar_path = state.download_path.join(avatar_name);
        settings_state.avatar_path = Some(avatar_path.to_string_lossy().to_string());
    }

    Ok(())
}
