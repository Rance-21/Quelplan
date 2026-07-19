use crate::services::wal::update_igdb_token_wal;
use crate::state::AppState;
use dotenvy_macro::dotenv;
use serde::Deserialize;
use std::time::Duration;
use tauri::State;

#[derive(Debug, Deserialize)]
pub struct IgdbTokenResponse {
    pub access_token: String,
    pub expires_in: u64,
    pub token_type: String,
}

pub fn igdb_client_id() -> Result<&'static str, String> {
    let client_id = dotenv!("IGDB_CLIENT_ID").trim();
    if client_id.is_empty() {
        return Err("IGDB_CLIENT_ID is empty".to_string());
    }

    Ok(client_id)
}

fn igdb_client_secret() -> Result<&'static str, String> {
    let client_secret = dotenv!("IGDB_CLIENT_SECRET").trim();
    if client_secret.is_empty() {
        return Err("IGDB_CLIENT_SECRET is empty".to_string());
    }

    Ok(client_secret)
}

async fn request_igdb_token() -> Result<IgdbTokenResponse, String> {
    let client_id = igdb_client_id()?;
    let client_secret = igdb_client_secret()?;
    let params = [
        ("client_id", client_id),
        ("client_secret", client_secret),
        ("grant_type", "client_credentials"),
    ];

    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(10))
        .build()
        .map_err(|e| e.to_string())?;

    let res = client
        .post("https://id.twitch.tv/oauth2/token")
        .form(&params)
        .send()
        .await
        .map_err(|e| format!("请求 IGDB OAuth2 Token 失败: {}", e))?;

    if !res.status().is_success() {
        let status = res.status();
        let body = res.text().await.unwrap_or_default();
        return Err(format!(
            "获取 IGDB OAuth2 Token 失败，HTTP 状态码: {}，响应: {}",
            status, body
        ));
    }

    res.json::<IgdbTokenResponse>()
        .await
        .map_err(|e| format!("解析 IGDB OAuth2 Token 响应失败: {}", e))
}

pub async fn refresh_igdb_token(state: &State<'_, AppState>) -> Result<IgdbTokenResponse, String> {
    let token_data = request_igdb_token().await?;

    update_igdb_token_wal(state, &token_data.access_token)?;
    state
        .tokens
        .lock()
        .map_err(|_| "failed to lock tokens".to_string())?
        .igdb = Some(token_data.access_token.clone());

    Ok(token_data)
}
