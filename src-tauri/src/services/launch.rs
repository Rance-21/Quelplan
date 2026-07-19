use std::path::Path;
use tokio::process::Command;

pub enum GameProcess {
    Normal(tokio::process::Child),
}

impl GameProcess {
    pub async fn wait_exit(&mut self) {
        match self {
            GameProcess::Normal(child) => {
                let _ = child.wait().await;
            }
        }
    }
}

pub async fn spawn_game(exe_path: &str) -> Result<GameProcess, String> {
    let path = Path::new(exe_path);
    let parent = path.parent().unwrap_or(Path::new(""));

    match Command::new(path).current_dir(parent).spawn() {
        Ok(child) => Ok(GameProcess::Normal(child)),
        Err(e) => {
            if e.raw_os_error() == Some(740) {
                let ps_cmd = format!(
                    "Start-Process -FilePath '{}' -WorkingDirectory '{}' -Verb RunAs",
                    exe_path,
                    parent.to_string_lossy()
                );

                match Command::new("powershell")
                    .args(["-NoProfile", "-WindowStyle", "Hidden", "-Command", &ps_cmd])
                    .spawn()
                {
                    Ok(child) => Ok(GameProcess::Normal(child)),
                    Err(err) => Err(format!("UAC 提权启动失败: {}", err)),
                }
            } else {
                Err(format!("普通启动失败: {}", e))
            }
        }
    }
}

pub fn launch_steam_app(steam_id: u32) -> Result<(), String> {
    const CREATE_NO_WINDOW: u32 = 0x08000000;
    let launch_uri = format!("steam://rungameid/{}", steam_id);

    if cfg!(debug_assertions) {
        println!("准备拉起 Steam 游戏: {}", launch_uri);
    }

    match Command::new("cmd")
        .args(["/C", "start", "", &launch_uri])
        .creation_flags(CREATE_NO_WINDOW)
        .spawn()
    {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("无法唤醒 Steam 游戏, 错误: {}", e)),
    }
}
