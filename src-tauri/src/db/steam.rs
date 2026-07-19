use std::collections::HashMap;
use std::fs::File;
use std::io::{BufReader, BufWriter, Write};
use std::path::Path;

pub type SteamGameIndex = HashMap<u32, u32>;

pub fn load_steam_game_index(data_directory: &Path) -> Result<SteamGameIndex, String> {
    let steam_database_path = data_directory.join("steam.db");
    if !steam_database_path.exists() {
        return Ok(SteamGameIndex::new());
    }

    let steam_database = File::open(steam_database_path).map_err(|error| error.to_string())?;
    let reader = BufReader::new(steam_database);
    Ok(bincode::deserialize_from(reader).unwrap_or_default())
}

pub fn save_steam_game_index(
    data_directory: &Path,
    steam_game_index: &SteamGameIndex,
) -> Result<(), String> {
    let steam_database_path = data_directory.join("steam.db");
    let steam_temporary_database_path = data_directory.join("steam_temp.db");
    let steam_temporary_database =
        File::create(&steam_temporary_database_path).map_err(|error| error.to_string())?;
    let mut writer = BufWriter::new(steam_temporary_database);

    bincode::serialize_into(&mut writer, steam_game_index).map_err(|error| error.to_string())?;
    writer.flush().map_err(|error| error.to_string())?;
    drop(writer);

    if steam_database_path.exists() {
        std::fs::remove_file(&steam_database_path).map_err(|error| error.to_string())?;
    }
    std::fs::rename(steam_temporary_database_path, steam_database_path)
        .map_err(|error| error.to_string())
}
