use crate::state::AppState;
use crate::utils::avatar::delete_previous_avatar;
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, USER_AGENT};
use serde::Deserialize;
use std::time::Duration;
use tauri::State;
use tokio::fs;

#[derive(Deserialize, Clone, Debug)]
struct BgmAvatar {
    #[serde(rename = "avatar")]
    avatar: Avatar,
}

#[derive(Deserialize, Clone, Debug)]
struct Avatar {
    large: Option<String>,
}

#[inline]
fn build_headers(token: &str) -> Result<HeaderMap, String> {
    let mut headers = HeaderMap::new();
    headers.insert(
        USER_AGENT,
        HeaderValue::from_static("Rance-21/Quelplan (https://github.com/Rance-21/Quelplan)"),
    );

    let token = format!("Bearer {}", token);
    let token = HeaderValue::from_str(&token).map_err(|e| e.to_string())?;
    headers.insert(AUTHORIZATION, token);

    Ok(headers)
}

pub async fn get_bgm_personal_info(token: &str) -> Result<String, String> {
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(10))
        .build()
        .map_err(|e| e.to_string())?;

    let res = client
        .get("https://api.bgm.tv/v0/me")
        .headers(build_headers(token)?)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let res: BgmAvatar = res
        .json()
        .await
        .map_err(|e| format!("Token error: {}", e))?;

    if cfg!(debug_assertions) {
        println!("bgm个人信息： {:?}", &res);
    }

    Ok(res.avatar.large.unwrap_or_default())
}

pub async fn update_bgm_avatar(
    state: &State<'_, AppState>,
    token: &str,
    previous_avatar_path: Option<String>,
) -> Result<Option<String>, String> {
    let avatar_url = get_bgm_personal_info(token).await?;

    if cfg!(debug_assertions) {
        println!("头像url： {}", &avatar_url);
    }

    if avatar_url.trim().is_empty() {
        return Ok(None);
    }

    let avatar_path = get_bgm_avator(state, &avatar_url, token).await?;
    delete_previous_avatar(previous_avatar_path, Some(&avatar_path)).await;
    Ok(Some(avatar_path))
}

async fn get_bgm_avator(
    state: &State<'_, AppState>,
    image_url: &str,
    token: &str,
) -> Result<String, String> {
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(10))
        .build()
        .map_err(|e| e.to_string())?;

    let res = client
        .get(image_url)
        .headers(build_headers(token)?)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let image_bytes = res.bytes().await.map_err(|e| e.to_string())?;

    let mut download_path = state.download_path.clone();
    let file_name = image_url
        .split('/')
        .last()
        .filter(|name| !name.is_empty())
        .unwrap_or("default_avator.jpg");
    let file_name = file_name.split(['?', '#']).next().unwrap_or(file_name);
    download_path.push(file_name);

    if cfg!(debug_assertions) {
        println!("头像下载路径： {:?}", &download_path);
    }

    fs::write(&download_path, image_bytes)
        .await
        .map_err(|e| e.to_string())?;

    if cfg!(debug_assertions) {
        println!("头像下载完成： {:?}", &download_path);
    }

    download_path
        .into_os_string()
        .into_string()
        .map_err(|_| "avatar path is not valid UTF-8".to_string())
}
