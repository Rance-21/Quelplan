use crate::models::SearchedGame;
use crate::state::AppState;
use crate::utils::cover::find_extension;
use crate::utils::folat::round_to_one_decimal;
use crate::utils::time::date_string_to_u64;
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE, USER_AGENT};
use serde::Deserialize;
use std::sync::Arc;
use std::time::Duration;
use tauri::State;
use tokio::fs;

#[derive(Deserialize, Debug)]
pub struct VndbResult {
    pub results: Vec<VndbGame>,
}

#[derive(Deserialize, Clone, Debug)]
pub struct VndbDeveloper {
    pub name: String,
}

#[derive(Deserialize, Clone, Debug)]
pub struct VndbImage {
    pub url: String,
}

#[derive(Deserialize, Clone, Debug)]
pub struct VndbGame {
    pub title: String,
    pub released: Option<String>,
    pub rating: Option<f32>,
    #[serde(default)]
    pub developers: Vec<VndbDeveloper>,
    pub image: Option<VndbImage>,
}

pub async fn search_on_vndb(
    game_name: &str,
    token: Option<String>,
) -> Result<Vec<SearchedGame>, String> {
    let url = "https://api.vndb.org/kana/vn";

    let body = serde_json::json!({
        "filters": ["search", "=", game_name],
        "fields": "title, released, rating, developers.name, image.url",
        "results": 5
    });

    let mut headers = HeaderMap::new();
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));

    if let Some(token) = token {
        let token = format!("Bearer {}", token);
        headers.insert(AUTHORIZATION, HeaderValue::from_str(&token).unwrap());
    }

    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(10))
        .build()
        .unwrap();
    if cfg!(debug_assertions) {
        println!("发送请求到 VNDB API...");
    }
    let res = client
        .post(url)
        .headers(headers)
        .json(&body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if cfg!(debug_assertions) {
        println!("接受成功一半");
    }

    let search_res: VndbResult = res.json().await.map_err(|e| e.to_string())?;

    if search_res.results.is_empty() {
        return Err("在 VNDB 上未找到相关游戏".to_string());
    }

    if cfg!(debug_assertions) {
        println!("接收成功，名称： {}", search_res.results[0].title);
    }

    let mut search_results = Vec::new();
    for vndb_game in search_res.results {
        let game = SearchedGame {
            name: Arc::from(vndb_game.title),
            score: round_to_one_decimal(vndb_game.rating.unwrap_or(0.0)),
            publish_date: date_string_to_u64(&vndb_game.released.unwrap_or("".to_string()))
                .unwrap_or(0),
            image: Arc::from(
                vndb_game
                    .image
                    .unwrap_or(VndbImage {
                        url: "123".to_string(),
                    })
                    .url,
            ),
            developer: {
                let mut res: String = "".to_string();

                for developer in vndb_game.developers {
                    res.push_str(&(developer.name + " "));
                }

                Arc::from(res)
            },
        };

        search_results.push(game);
    }

    Ok(search_results)
}

pub async fn get_vndb_game_cover(
    state: &State<'_, AppState>,
    image_url: &str,
    id: u32,
) -> Result<String, String> {
    let mut headers = reqwest::header::HeaderMap::new();
    headers.insert(
        USER_AGENT,
        reqwest::header::HeaderValue::from_static(
            "Rance-21/Quelplan (https://github.com/Rance-21/Quelplan)",
        ),
    );

    if let Some(token) = state.tokens.lock().unwrap().vndb.clone() {
        let token = format!("Bearer {}", token);
        headers.insert(AUTHORIZATION, HeaderValue::from_str(&token).unwrap());
    }

    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(10))
        .build()
        .unwrap();

    let res = client
        .get(image_url)
        .headers(headers)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let image_bytes = res.bytes().await.map_err(|e| e.to_string())?;

    let mut download_dir = state.download_path.clone();
    let file_name = format!("{}.{}", id, find_extension(image_url));
    download_dir.push(file_name);

    fs::write(&download_dir, image_bytes)
        .await
        .map_err(|e| e.to_string())?;

    return Ok(download_dir
        .into_os_string()
        .into_string()
        .map_err(|_| "系统路径包含无法识别的非法 UTF-8 字符".to_string())?);
}
