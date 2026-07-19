use crate::api::igdb_oauth2::{igdb_client_id, refresh_igdb_token};
use crate::models::SearchedGame;
use crate::state::AppState;
use crate::utils::cover::find_extension;
use crate::utils::folat::round_to_one_decimal;
use reqwest::header::{HeaderMap, HeaderName, HeaderValue, AUTHORIZATION};
use serde::Deserialize;
use std::sync::Arc;
use std::time::Duration;
use tauri::State;
use tokio::fs;

const IGDB_GAMES_URL: &str = "https://api.igdb.com/v4/games";
const CLIENT_ID_HEADER: HeaderName = HeaderName::from_static("client-id");

#[derive(Deserialize, Clone, Debug)]
pub struct IgdbCover {
    pub url: String,
}

#[derive(Deserialize, Clone, Debug)]
pub struct IgdbCompany {
    pub name: String,
}

#[derive(Deserialize, Clone, Debug)]
pub struct IgdbInvolvedCompany {
    pub developer: bool,
    pub company: IgdbCompany,
}

#[derive(Deserialize, Clone, Debug)]
pub struct IgdbGame {
    pub name: String,
    pub first_release_date: Option<u64>,
    pub total_rating: Option<f32>,
    pub cover: Option<IgdbCover>,
    #[serde(default)]
    pub involved_companies: Vec<IgdbInvolvedCompany>,
}

fn build_headers(token: &str) -> Result<HeaderMap, String> {
    let mut headers = HeaderMap::new();
    headers.insert(
        CLIENT_ID_HEADER,
        HeaderValue::from_str(igdb_client_id()?).map_err(|e| e.to_string())?,
    );
    headers.insert(
        AUTHORIZATION,
        HeaderValue::from_str(&format!("Bearer {}", token)).map_err(|e| e.to_string())?,
    );
    Ok(headers)
}

fn escape_search_term(game_name: &str) -> String {
    game_name.replace('\\', "\\\\").replace('"', "\\\"")
}

async fn send_search_request(
    client: &reqwest::Client,
    token: &str,
    body: &str,
) -> Result<reqwest::Response, String> {
    client
        .post(IGDB_GAMES_URL)
        .headers(build_headers(token)?)
        .body(body.to_string())
        .send()
        .await
        .map_err(|e| format!("请求 IGDB API 失败: {}", e))
}

pub async fn search_on_igdb(
    game_name: &str,
    state: &State<'_, AppState>,
) -> Result<Vec<SearchedGame>, String> {
    let body = format!(
        "fields name,first_release_date,total_rating,cover.url,involved_companies.developer,involved_companies.company.name; search \"{}\"; limit 5;",
        escape_search_term(game_name)
    );

    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(10))
        .build()
        .map_err(|e| e.to_string())?;

    let token = state
        .tokens
        .lock()
        .map_err(|_| "failed to lock tokens".to_string())?
        .igdb
        .clone();
    let token = match token {
        Some(token) => token,
        None => refresh_igdb_token(state).await?.access_token,
    };

    let mut res = send_search_request(&client, &token, &body).await?;
    if res.status() == reqwest::StatusCode::UNAUTHORIZED {
        let token = refresh_igdb_token(state).await?.access_token;
        res = send_search_request(&client, &token, &body).await?;
    }

    if !res.status().is_success() {
        let status = res.status();
        let body = res.text().await.unwrap_or_default();
        return Err(format!(
            "IGDB 游戏搜索失败，HTTP 状态码: {}，响应: {}",
            status, body
        ));
    }

    let games = res
        .json::<Vec<IgdbGame>>()
        .await
        .map_err(|e| format!("解析 IGDB 游戏搜索响应失败: {}", e))?;

    if games.is_empty() {
        return Err("在 IGDB 上未找到相关游戏".to_string());
    }

    let mut search_results = Vec::new();

    for igdb_game in games {
        let game = SearchedGame {
            name: Arc::from(igdb_game.name),
            score: round_to_one_decimal(igdb_game.total_rating.unwrap_or(0.0)),
            publish_date: igdb_game.first_release_date.unwrap_or(0),
            image: Arc::from(
                igdb_game
                    .cover
                    .unwrap_or(IgdbCover {
                        url: "123".to_string(),
                    })
                    .url,
            ),
            developer: Arc::from(igdb_developer_names(&igdb_game.involved_companies)),
        };

        search_results.push(game);
    }

    Ok(search_results)
}

pub async fn get_igdb_game_cover(
    state: &State<'_, AppState>,
    image_url: &str,
    id: u32,
) -> Result<String, String> {
    let image_url = normalize_igdb_image_url(image_url).replace("t_thumb", "t_1080p");

    if cfg!(debug_assertions) {
        println!("图片url: {}", image_url);
    }

    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(10))
        .build()
        .map_err(|e| e.to_string())?;

    let res = client
        .get(&image_url)
        .send()
        .await
        .map_err(|e| format!("下载 IGDB 封面失败: {}", e))?;

    if !res.status().is_success() {
        return Err(format!("下载 IGDB 封面失败，HTTP 状态码: {}", res.status()));
    }

    let image_bytes = res.bytes().await.map_err(|e| e.to_string())?;
    let mut download_dir = state.download_path.clone();
    let file_name = format!("{}.{}", id, find_extension(&image_url));
    download_dir.push(file_name);

    fs::write(&download_dir, image_bytes)
        .await
        .map_err(|e| e.to_string())?;

    download_dir
        .into_os_string()
        .into_string()
        .map_err(|_| "cover path is not valid UTF-8".to_string())
}

#[inline]
fn normalize_igdb_image_url(image_url: &str) -> String {
    if image_url.starts_with("//") {
        format!("https:{}", image_url)
    } else {
        image_url.to_string()
    }
}

#[inline]
fn igdb_developer_names(involved_companies: &[IgdbInvolvedCompany]) -> String {
    let developers = involved_companies
        .iter()
        .filter(|involved_company| involved_company.developer)
        .map(|involved_company| involved_company.company.name.as_str())
        .collect::<Vec<_>>()
        .join(" ");

    if developers.is_empty() {
        "未知开发商".to_string()
    } else {
        developers
    }
}
