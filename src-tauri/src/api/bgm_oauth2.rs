use crate::api::bgm_avator::update_bgm_avatar;
use crate::services::wal::{
    update_avatar_path_wal, update_bgm_refresh_token_wal, update_bgm_token_wal,
};
use crate::state::AppState;
use dotenvy_macro::dotenv;
use serde::Deserialize;
use std::io::{Read, Write};
use std::{collections::HashMap, net::TcpListener};
use tauri::{AppHandle, State};
use tauri_plugin_opener::OpenerExt;

#[derive(Debug, Deserialize)]
pub struct BgmTokenResponse {
    pub access_token: String,
    pub expires_in: u64,
    pub token_type: String,
    pub refresh_token: String,
}

pub async fn bgm_oauth(app: AppHandle, state: State<'_, AppState>) -> Result<(), String> {
    let client_id = dotenv!("BGM_CLIENT_ID");
    let client_secret = dotenv!("BGM_CLIENT_SECRET");

    if cfg!(debug_assertions) {
        println!("BGM OAuth2 授权流程开始...");
    }

    let redirect_uri = "http://127.0.0.1:14253/callback";

    let auth_url = format!(
        "https://bgm.tv/oauth/authorize?client_id={}&response_type=code&redirect_uri={}",
        client_id, redirect_uri
    );

    app.opener()
        .open_url(&auth_url, None::<&str>)
        .map_err(|e| e.to_string())?;

    let auth_code = tokio::task::spawn_blocking(move || {
        let listener = TcpListener::bind("127.0.0.1:14253").map_err(|e| e.to_string())?;

        for stream in listener.incoming() {
            if let Ok(mut stream) = stream {
                let mut buffer = [0; 1024];

                if stream.read(&mut buffer).is_ok() {
                    let request_str = String::from_utf8_lossy(&buffer);
                    
                    if request_str.starts_with("GET /callback?code=") {
                        if let Some(code_start) = &request_str.find("code=") {
                            let start_idx = code_start + 5;

                            if let Some(end_idx) = request_str[start_idx..].find(' ') {
                            let code = &request_str[start_idx..start_idx + end_idx];

                            let html = "<!DOCTYPE html><html><head><meta charset='utf-8'><title>授权成功</title></head><body style='display:flex;justify-content:center;align-items:center;height:100vh;background:#222;color:#fff;font-family:sans-serif;'><h1> 授权成功！您可以关闭此网页并返回启动器了。</h1></body></html>";
                            
                            let response = format!(
                                "HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nContent-Length: {}\r\n\r\n{}",
                                html.len(),
                                html
                            );
                            
                            // 把数据直接灌进 TCP 通道，并强制刷新
                            let _ = stream.write_all(response.as_bytes());
                            let _ = stream.flush();

                            return Ok(code.to_string());
                        }
                    }
                }
            }
        }
    }
        Err(" TCP 监听异常退出".to_string())
    })
    .await
    .map_err(|e| e.to_string())??;

    let client = reqwest::Client::new();
    let mut params = HashMap::new();
    params.insert("grant_type", "authorization_code");
    params.insert("client_id", &client_id);
    params.insert("client_secret", &client_secret);
    params.insert("code", &auth_code);
    params.insert("redirect_uri", redirect_uri);

    let res = client
        .post("https://bgm.tv/oauth/access_token")
        .form(&params)
        .send()
        .await
        .map_err(|e| format!("请求 Bangumi 接口失败: {}", e))?;

    if !res.status().is_success() {
        return Err(format!("换取 Token 失败，HTTP 状态码: {}", res.status()));
    }

    let token_data = res
        .json::<BgmTokenResponse>()
        .await
        .map_err(|e| format!("解析 Token JSON 失败: {}", e))?;

    update_bgm_token_wal(&state, &token_data.access_token)?;
    update_bgm_refresh_token_wal(&state, &token_data.refresh_token)?;

    let token = token_data.access_token.clone();
    state.tokens.lock().unwrap().bgm = Some(token_data.access_token);
    state.tokens.lock().unwrap().bgm_refresh = Some(token_data.refresh_token);

    let previous_avatar_path = state.settings.lock().unwrap().avatar_path.clone();
    let avatar_path = update_bgm_avatar(&state, &token, previous_avatar_path).await?;
    state.settings.lock().unwrap().avatar_path = avatar_path.clone();
    update_avatar_path_wal(&state, avatar_path.as_deref())?;

    Ok(())
}

pub async fn refresh_bgm_token(
    saved_refresh_token: String,
    state: &State<'_, AppState>,
) -> Result<BgmTokenResponse, String> {
    let client_id = dotenv!("BGM_CLIENT_ID");
    let client_secret = dotenv!("BGM_CLIENT_SECRET");

    let mut params = HashMap::new();

    params.insert("grant_type", "refresh_token");
    params.insert("refresh_token", &saved_refresh_token);
    params.insert("client_id", &client_id);
    params.insert("client_secret", &client_secret);
    params.insert("redirect_uri", "http://127.0.0.1:14253/callback");

    let client = reqwest::Client::new();

    let res = client
        .post("https://bgm.tv/oauth/access_token")
        .form(&params)
        .send()
        .await
        .map_err(|e| format!("刷新请求失败: {}", e))?;

    if !res.status().is_success() {
        return Err(format!("刷新失败，必须重新登录，状态码: {}", res.status()));
    }

    let token_data = res
        .json::<BgmTokenResponse>()
        .await
        .map_err(|e| format!("解析刷新后的 JSON 失败: {}", e))?;

    update_bgm_token_wal(state, &token_data.access_token)?;
    state.tokens.lock().unwrap().bgm = Some(token_data.access_token.clone());

    Ok(token_data)
}
