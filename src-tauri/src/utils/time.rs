use crate::services::game::*;
use crate::services::launch::GameProcess;
use crate::services::wal::{update_daily_play_time_wal, update_play_time_wal};
use crate::state::AppState;
use chrono::{Datelike, Local, NaiveDate};
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};
use sysinfo::System;
use tauri::State;
use tokio::task;

pub fn date_string_to_u64(date_str: &str) -> Option<u64> {
    let naive_date = NaiveDate::parse_from_str(date_str, "%Y-%m-%d").ok()?;

    let naive_datetime = naive_date.and_hms_opt(0, 0, 0)?;

    // 获取 Unix 时间戳（返回的是 i64 类型的秒数）
    let timestamp_i64 = naive_datetime.and_utc().timestamp();

    // 1970年之前的日期时间戳是负数，直接转 u64 会溢出报错，所以要加个判断
    if timestamp_i64 >= 0 {
        Some(timestamp_i64 as u64)
    } else {
        None // 如果日期在 1970 年之前，这里选择返回 None
    }
}

pub fn get_current_timestamp() -> u64 {
    let now = SystemTime::now();
    let since_the_epoch = now.duration_since(UNIX_EPOCH).expect("系统时间倒流了！");

    since_the_epoch.as_secs() // 返回 u64 级别的秒数
}

pub async fn record_play_time(
    child: &mut GameProcess,
    id: u32,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let started_at = Local::now();
    let start_time = Instant::now();
    let _status = child.wait_exit().await;
    let play_time = start_time.elapsed().as_secs();

    let mut gamedata = state.game_data.lock().unwrap();
    let game = gamedata.games.get_mut(&id).ok_or("未找到游戏")?;
    game.play_time += play_time;

    let play_date: u64 = (started_at.year() as u64 * 10000)
        + (started_at.month() as u64 * 100)
        + (started_at.day() as u64);
    update_daily_play_time(game, play_date, play_time);

    update_daily_play_time_wal(&state, id, play_date, play_time)?;
    update_play_time_wal(&state, id, play_time)?;

    Ok(())
}

pub fn parse_steam_date(date_str: &str) -> Option<u64> {
    // 遍历字符串，以"任何不是 ASCII 数字的字符"作为分隔符进行切割
    let numbers: Vec<u32> = date_str
        .split(|c: char| !c.is_ascii_digit())
        .filter(|s| !s.is_empty()) // 过滤掉因为连续中文字符切出来的空字符串
        .filter_map(|s| s.parse::<u32>().ok()) // 安全地将其转换为 u32
        .collect();

    //必须严格拿到 3 个数字 (年, 月, 日)
    if numbers.len() >= 3 {
        let year = numbers[0] as i32; // chrono 的年份需要 i32
        let month = numbers[1];
        let day = numbers[2];

        // 防止非法的离谱日期 (比如 2月30日)
        if let Some(date) = NaiveDate::from_ymd_opt(year, month, day) {
            // 将日期强行对齐到当天的午夜 00:00:00 (UTC 时间)
            if let Some(datetime) = date.and_hms_opt(0, 0, 0) {
                // 转换为距离 1970-01-01 的绝对秒数
                let timestamp = datetime.and_utc().timestamp();

                // 确保时间戳是正数 (排除 1970 年之前的古董游戏异常数据)
                if timestamp >= 0 {
                    return Some(timestamp as u64);
                }
            }
        }
    }

    None
}

pub async fn record_steam_time(
    state: &State<'_, AppState>,
    name: &str,
    id: u32,
) -> Result<(), String> {
    let name = name.to_string();

    let play_time = task::spawn_blocking(move || {
        let mut sys = System::new_all();
        let start_time = Instant::now();
        loop {
            std::thread::sleep(Duration::from_secs(2));
            sys.refresh_processes(sysinfo::ProcessesToUpdate::All, true);

            let is_running = sys
                .processes()
                .values()
                .any(|p| p.name().eq_ignore_ascii_case(&name));

            if !is_running {
                break;
            }
        }

        start_time.elapsed().as_secs()
    })
    .await
    .map_err(|e| format!("后台追踪线程崩溃: {}", e))?;

    let started_at = Local::now();

    let mut gamedata = state.game_data.lock().unwrap();
    let game = gamedata.games.get_mut(&id).ok_or("未找到游戏")?;
    game.play_time += play_time;

    let play_date: u64 = (started_at.year() as u64 * 10000)
        + (started_at.month() as u64 * 100)
        + (started_at.day() as u64);
    update_daily_play_time(game, play_date, play_time);

    update_daily_play_time_wal(&state, id, play_date, play_time)?;
    update_play_time_wal(&state, id, play_time)?;
    Ok(())
}
