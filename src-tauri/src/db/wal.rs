use super::models::CommandRef;
use std::fs::{File, OpenOptions};
use std::io::Write;
use std::path::Path;

pub struct WalWriter {
    pub file: File,
}

impl WalWriter {
    pub fn new(path: &Path) -> Result<Self, String> {
        let path = path.join("log.wal");

        let file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(path)
            .map_err(|e| e.to_string())?;

        if cfg!(debug_assertions) {
            println!("获取WAL文件成功");
        }

        Ok(Self { file })
    }

    pub fn append_command(&mut self, cmd: CommandRef) -> Result<(), String> {
        let bytes = bincode::serialize(&cmd).map_err(|e| e.to_string())?;

        self.file.write_all(&bytes).map_err(|e| e.to_string())?;
        if cfg!(debug_assertions) {
            println!("已经写入");
        }

        Ok(())
    }
}
