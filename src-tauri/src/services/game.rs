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

    // 只保留最近 7 个有游玩记录的日期。较早开始的会话可能较晚结束，
    // 不能让它挤掉已经保留的更新日期。
    let oldest_record = game
        .daily_play_times
        .iter_mut()
        .min_by_key(|record| record.play_date);
    if let Some(record) = oldest_record {
        if play_date > record.play_date {
            *record = DailyPlayTime {
                play_date,
                play_time,
            };
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn game() -> Game {
        Game {
            id: 1,
            name: Arc::from("test"),
            path: Arc::from("game.exe"),
            cover: Arc::from(""),
            last_played: 0,
            play_time: 0,
            added_time: 0,
            score: 0.0,
            developer: Arc::from(""),
            publish_date: 0,
            liked: false,
            if_finished: false,
            steam_id: None,
            link_exe: std::array::from_fn(|_| crate::models::LinkExe::empty()),
            daily_play_times: [DailyPlayTime {
                play_date: 0,
                play_time: 0,
            }; 7],
        }
    }

    fn records(game: &Game) -> Vec<(u64, u64)> {
        let mut records: Vec<_> = game
            .daily_play_times
            .iter()
            .filter(|record| record.play_date != 0)
            .map(|record| (record.play_date, record.play_time))
            .collect();
        records.sort_unstable();
        records
    }

    #[test]
    fn accumulates_sessions_on_the_same_start_date() {
        let mut game = game();
        update_daily_play_time(&mut game, 20260926, 3600);
        update_daily_play_time(&mut game, 20260926, 7200);
        assert_eq!(records(&game), vec![(20260926, 10800)]);
    }

    #[test]
    fn retains_the_latest_seven_played_dates_across_month_and_year_boundaries() {
        let mut game = game();
        let dates = [
            20251225, 20251227, 20251230, 20251231, 20260101, 20260103, 20260105, 20260108,
            20260110,
        ];
        for date in dates {
            update_daily_play_time(&mut game, date, 60);
        }
        assert_eq!(
            records(&game),
            dates[2..]
                .iter()
                .map(|date| (*date, 60))
                .collect::<Vec<_>>()
        );
    }

    #[test]
    fn accepts_out_of_order_sessions_without_evicting_newer_dates() {
        let mut game = game();
        for date in [
            20260920, 20260922, 20260923, 20260924, 20260925, 20260926, 20260927,
        ] {
            update_daily_play_time(&mut game, date, 60);
        }
        update_daily_play_time(&mut game, 20260921, 120);
        update_daily_play_time(&mut game, 20260919, 180);
        update_daily_play_time(&mut game, 20260925, 240);
        assert_eq!(
            records(&game),
            vec![
                (20260921, 120),
                (20260922, 60),
                (20260923, 60),
                (20260924, 60),
                (20260925, 300),
                (20260926, 60),
                (20260927, 60),
            ]
        );
    }

    #[test]
    fn ignores_empty_sessions_and_saturates_accumulated_time() {
        let mut game = game();
        update_daily_play_time(&mut game, 0, 60);
        update_daily_play_time(&mut game, 20260927, 0);
        assert!(records(&game).is_empty());
        update_daily_play_time(&mut game, 20260927, u64::MAX);
        update_daily_play_time(&mut game, 20260927, 1);
        assert_eq!(records(&game), vec![(20260927, u64::MAX)]);
    }

    #[test]
    fn restores_the_same_daily_records_and_total_from_the_wal() {
        use crate::db::{engine::init_db, models::CommandRef, wal::WalWriter};
        use std::time::{SystemTime, UNIX_EPOCH};

        let directory = std::env::temp_dir().join(format!(
            "quelplan-play-time-{}-{}",
            std::process::id(),
            SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_nanos(),
        ));
        std::fs::create_dir(&directory).unwrap();
        let mut game = game();
        let mut wal = WalWriter::new(&directory).unwrap();
        wal.append_command(CommandRef::AddGame {
            id: game.id,
            game: &game,
        })
        .unwrap();
        for date in [
            20260920, 20260921, 20260922, 20260923, 20260924, 20260925, 20260926, 20260927,
            20260926, 20260919,
        ] {
            update_daily_play_time(&mut game, date, 60);
            game.play_time += 60;
            wal.append_command(CommandRef::UpdateDailyPlayTime {
                id: game.id,
                play_date: date,
                play_time: 60,
            })
            .unwrap();
            wal.append_command(CommandRef::UpdatePlayTime {
                id: game.id,
                play_time: 60,
            })
            .unwrap();
        }
        drop(wal);
        let restored = init_db(&directory).unwrap();
        let restored_game = restored.games.games.get(&game.id).unwrap();
        assert_eq!(records(restored_game), records(&game));
        assert_eq!(restored_game.play_time, 600);
        std::fs::remove_file(directory.join("log.wal")).unwrap();
        std::fs::remove_dir(directory).unwrap();
    }
}
