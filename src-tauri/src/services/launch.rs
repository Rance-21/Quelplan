use std::path::Path;
use tokio::process::Command;

pub enum GameProcess {
    Normal(tokio::process::Child),
    Elevated(tokio::process::Child),
}

impl GameProcess {
    pub async fn wait_exit(&mut self) -> Result<(), String> {
        let elevated = matches!(self, GameProcess::Elevated(_));
        let child = match self {
            GameProcess::Normal(child) | GameProcess::Elevated(child) => child,
        };
        let status = child
            .wait()
            .await
            .map_err(|e| format!("等待游戏退出失败: {}", e))?;
        if elevated && !status.success() {
            return Err("管理员权限游戏启动失败或已取消授权".to_string());
        }
        Ok(())
    }
}

fn elevated_launch_command(exe_path: &str, parent: &Path) -> String {
    // -Wait keeps the helper alive until the elevated game exits.
    // Escape PowerShell single-quoted literals for paths containing apostrophes.
    format!(
        "Start-Process -FilePath '{}' -WorkingDirectory '{}' -Verb RunAs -Wait -ErrorAction Stop",
        exe_path.replace('\'', "''"),
        parent.to_string_lossy().replace('\'', "''")
    )
}

pub async fn spawn_game(exe_path: &str) -> Result<GameProcess, String> {
    let path = Path::new(exe_path);
    let parent = path.parent().unwrap_or(Path::new(""));

    match Command::new(path).current_dir(parent).spawn() {
        Ok(child) => Ok(GameProcess::Normal(child)),
        Err(e) => {
            if e.raw_os_error() == Some(740) {
                let ps_cmd = elevated_launch_command(exe_path, parent);

                match Command::new("powershell")
                    .args(["-NoProfile", "-WindowStyle", "Hidden", "-Command", &ps_cmd])
                    .creation_flags(0x08000000)
                    .spawn()
                {
                    Ok(child) => Ok(GameProcess::Elevated(child)),
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

#[cfg(all(test, windows))]
mod tests {
    use super::*;
    use std::fs;
    use std::time::{Duration, SystemTime, UNIX_EPOCH};

    #[test]
    fn launches_batch_scripts_in_their_own_directory() {
        tokio::runtime::Builder::new_current_thread()
            .enable_all()
            .build()
            .unwrap()
            .block_on(check_batch_scripts());
    }

    async fn check_batch_scripts() {
        let unique = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let directory = std::env::temp_dir().join(format!(
            "quelplan script 中文 & (test) {} {unique}",
            std::process::id()
        ));
        fs::create_dir(&directory).unwrap();

        for extension in ["cmd", "bat", "CMD", "BAT"] {
            let script = directory.join(format!("launch tool.{extension}"));
            let output = directory.join("result.txt");
            fs::write(&script, b"@echo off\r\necho script-ok>result.txt\r\n").unwrap();
            // add_app stores paths with forward slashes.
            let path = script.to_string_lossy().replace('\\', "/");
            let mut process = spawn_game(&path).await.expect("script should launch");
            tokio::time::timeout(Duration::from_secs(10), process.wait_exit())
                .await
                .expect("script should finish")
                .expect("waiting should succeed");
            assert_eq!(fs::read_to_string(&output).unwrap().trim(), "script-ok");
            fs::remove_file(output).unwrap();
            fs::remove_file(script).unwrap();
        }

        fs::remove_dir(directory).unwrap();
    }

    #[test]
    fn elevated_launch_waits_for_the_game_and_escapes_paths() {
        let directory = std::env::temp_dir().join(format!(
            "quelplan player's wait {} {}",
            std::process::id(),
            SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_nanos(),
        ));
        fs::create_dir(&directory).unwrap();
        let script = directory.join("game.cmd");
        let output = directory.join("finished.txt");
        fs::write(&script, b"@echo off\r\npowershell -NoProfile -WindowStyle Hidden -Command \"Start-Sleep -Seconds 2\"\r\necho finished>finished.txt\r\n").unwrap();
        // Exercise the real helper command without opening a UAC prompt in tests.
        let command = elevated_launch_command(script.to_str().unwrap(), &directory)
            .replace("-Verb RunAs", "-WindowStyle Hidden");
        tokio::runtime::Builder::new_current_thread()
            .enable_all()
            .build()
            .unwrap()
            .block_on(async {
                let child = Command::new("powershell")
                    .args(["-NoProfile", "-WindowStyle", "Hidden", "-Command", &command])
                    .creation_flags(0x08000000)
                    .spawn()
                    .unwrap();
                let mut process = GameProcess::Elevated(child);
                tokio::time::timeout(Duration::from_secs(30), process.wait_exit())
                    .await
                    .expect("helper should finish")
                    .expect("waiting should succeed");
                assert_eq!(fs::read_to_string(&output).unwrap().trim(), "finished");
            });
        fs::remove_file(output).unwrap();
        fs::remove_file(script).unwrap();
        fs::remove_dir(directory).unwrap();
    }

    #[test]
    fn reports_failed_elevated_launches_but_counts_games_with_nonzero_exit_codes() {
        tokio::runtime::Builder::new_current_thread()
            .enable_all()
            .build()
            .unwrap()
            .block_on(async {
                for elevated in [false, true] {
                    let child = Command::new("cmd")
                        .args(["/C", "exit", "1"])
                        .creation_flags(0x08000000)
                        .spawn()
                        .unwrap();
                    let mut process = if elevated {
                        GameProcess::Elevated(child)
                    } else {
                        GameProcess::Normal(child)
                    };
                    assert_eq!(process.wait_exit().await.is_err(), elevated);
                }
            });
    }
}
