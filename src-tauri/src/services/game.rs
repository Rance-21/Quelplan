use crate::models::{DailyPlayTime, Game};
use std::sync::Arc;

pub fn replace_exe_path(game: &mut Game, new_exe_path: Arc<str>) {
    let old_exe_path = game.path.clone();

    for link_exe in &mut game.link_exe {
        if link_exe.path.as_ref() == old_exe_path.as_ref() {
            link_exe.path = Arc::clone(&new_exe_path);
        }
    }

    game.path = new_exe_path;
}

pub fn update_daily_play_time(game: &mut Game, play_date: u64, play_time: u64) {
    if play_date == 0 || play_time == 0 {
        return;
    }

    //找相同
    if let Some(record) = game
        .daily_play_times
        .iter_mut()
        .find(|record| record.play_date == play_date)
    {
        record.play_time = record.play_time.saturating_add(play_time);
        return;
    }

    //找第一个空位
    if let Some(record) = game
        .daily_play_times
        .iter_mut()
        .find(|record| record.play_date == 0)
    {
        *record = DailyPlayTime {
            play_date,
            play_time,
        };
        //
        return;
    }

    //找最老的，直接替换
    let oldest_record = game
        .daily_play_times
        .iter_mut()
        .min_by_key(|record| record.play_date);
    oldest_record.map(|record| {
        *record = DailyPlayTime {
            play_date,
            play_time,
        }
    });
}
