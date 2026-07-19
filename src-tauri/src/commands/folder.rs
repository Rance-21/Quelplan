use opener::open;

#[tauri::command]
pub fn open_folder(path: String) -> Result<(), String> {
    open(&path).map_err(|e| format!("打开文件夹失败: {}", e))
}
