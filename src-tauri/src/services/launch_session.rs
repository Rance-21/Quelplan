use std::collections::HashSet;
use std::sync::{Arc, Mutex};

#[derive(Default)]
pub struct GameLaunches {
    active: Arc<Mutex<HashSet<u32>>>,
}

impl GameLaunches {
    pub fn acquire(&self, game_id: u32) -> Result<Arc<GameLaunch>, String> {
        let mut active = self.active.lock().map_err(|_| "无法锁定游戏启动状态")?;
        if !active.insert(game_id) {
            return Err("游戏正在启动或运行中，请勿重复启动".to_string());
        }
        Ok(Arc::new(GameLaunch {
            active: Arc::clone(&self.active),
            game_id,
        }))
    }
}

// The chain and its process tracker each hold a reference. Release only after
// both finish, including early errors and task cancellation.
pub struct GameLaunch {
    active: Arc<Mutex<HashSet<u32>>>,
    game_id: u32,
}

impl Drop for GameLaunch {
    fn drop(&mut self) {
        self.active
            .lock()
            .unwrap_or_else(|error| error.into_inner())
            .remove(&self.game_id);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::Barrier;

    #[test]
    fn blocks_until_both_chain_and_process_finish() {
        let launches = GameLaunches::default();
        let chain = launches.acquire(1).unwrap();
        let process = Arc::clone(&chain);
        assert!(launches.acquire(1).is_err());
        assert!(launches.acquire(2).is_ok());
        drop(chain);
        assert!(launches.acquire(1).is_err());
        drop(process);
        assert!(launches.acquire(1).is_ok());
    }

    #[test]
    fn only_one_concurrent_request_can_start() {
        let launches = GameLaunches::default();
        let barrier = Barrier::new(8);
        std::thread::scope(|scope| {
            let handles: Vec<_> = (0..8)
                .map(|_| {
                    scope.spawn(|| {
                        barrier.wait();
                        let launch = launches.acquire(1);
                        barrier.wait();
                        launch
                    })
                })
                .collect();
            let results: Vec<_> = handles.into_iter().map(|h| h.join().unwrap()).collect();
            assert_eq!(results.iter().filter(|result| result.is_ok()).count(), 1);
        });
        assert!(launches.acquire(1).is_ok());
    }

    #[test]
    fn failed_launch_releases_reservation() {
        let launches = GameLaunches::default();
        let fail = || -> Result<(), String> {
            let _launch = launches.acquire(1)?;
            Err("launch failed".to_string())
        };
        assert!(fail().is_err());
        assert!(launches.acquire(1).is_ok());
    }

    #[test]
    fn cancelled_tracker_releases_reservation() {
        tokio::runtime::Builder::new_current_thread()
            .enable_all()
            .build()
            .unwrap()
            .block_on(async {
                let launches = GameLaunches::default();
                let chain = launches.acquire(1).unwrap();
                let process = Arc::clone(&chain);
                let (started, ready) = tokio::sync::oneshot::channel();
                let task = tokio::spawn(async move {
                    let _launch = process;
                    started.send(()).unwrap();
                    std::future::pending::<()>().await;
                });
                ready.await.unwrap();
                drop(chain);
                assert!(launches.acquire(1).is_err());
                task.abort();
                assert!(task.await.unwrap_err().is_cancelled());
                assert!(launches.acquire(1).is_ok());
            });
    }
}
