use crate::api::bgm_oauth2::refresh_bgm_token;
use crate::models::SearchedGame;
use crate::state::AppState;
use crate::utils::cover::find_extension;
use crate::utils::time::date_string_to_u64;
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, USER_AGENT};
use serde::Deserialize;
use serde_json::Value;
use std::sync::Arc;
use std::time::Duration;
use tauri::State;
use tokio::fs;
/*https://bangumi.github.io/api/#/%E6%9D%A1%E7%9B%AE/searchSubjects */

#[derive(Deserialize, Clone, Debug)]
pub struct BgmRating {
    pub score: f32, //只需要里面的 score 字段
}

#[derive(Deserialize, Clone, Debug)]
pub struct InfoBoxItem {
    pub key: String,
    pub value: Value,
}

#[derive(Deserialize, Clone, Debug)]
pub struct BgmGame {
    pub name_cn: Option<String>,
    pub name: String,

    #[serde(rename = "date")]
    pub publish_date: Option<String>,

    pub image: Option<String>,
    pub rating: Option<BgmRating>,

    pub infobox: Option<Vec<InfoBoxItem>>,
}

#[derive(Deserialize, Debug)]
struct BgmGameArray {
    pub data: Vec<BgmGame>,
}

pub async fn search_on_bgm(
    game_name: &str,
    token: Option<String>,
    refresh_token: Option<String>,
    state: &State<'_, AppState>,
) -> Result<Vec<SearchedGame>, String> {
    let url = "https://api.bgm.tv/v0/search/subjects";

    let body = serde_json::json!({
        "keyword": game_name,
        "filter": {
            "type": [4]
        },
        "limit": 5,
        "nsfw": true,
    });

    let mut headers = HeaderMap::new();
    headers.insert(
        USER_AGENT,
        HeaderValue::from_static("Rance-21/Quelplan (https://github.com/Rance-21/Quelplan)"),
    );

    if let Some(token) = token {
        let token = format!("Bearer {}", token);
        headers.insert(AUTHORIZATION, HeaderValue::from_str(&token).unwrap());
    }

    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(10))
        .build()
        .unwrap();

    if cfg!(debug_assertions) {
        println!("发送请求到 BGM API...");
    }

    let mut res = client
        .post(url)
        .headers(headers.clone())
        .json(&body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status() == reqwest::StatusCode::UNAUTHORIZED && refresh_token.is_some() {
        if let Some(refresh_token) = refresh_token {
            let new_token = refresh_bgm_token(refresh_token, &state)
                .await
                .map_err(|e| format!("OAuth2 授权过期,请重新在设置页面授权: {}", e))?
                .access_token;
            headers.insert(
                AUTHORIZATION,
                HeaderValue::from_str(&format!("Bearer {}", new_token)).unwrap(),
            );

            res = client
                .post(url)
                .headers(headers)
                .json(&body)
                .send()
                .await
                .map_err(|e| e.to_string())?;
        }
    }

    let search_res: BgmGameArray = res.json().await.map_err(|e| e.to_string())?;

    if search_res.data.is_empty() {
        return Err("在 Bangumi 上未找到相关游戏".to_string());
    }

    if cfg!(debug_assertions) {
        println!("BGM游戏名\n{}", &search_res.data[0].name);
    }

    // if cfg!(debug_assertions) {
    //     println!("{:?}", search_res);
    // }

    let mut search_results = Vec::new();
    for bgm_game in search_res.data {
        let true_name = match bgm_game.name_cn {
            Some(cn) => {
                if cn.is_empty() {
                    bgm_game.name
                } else {
                    cn
                }
            }
            None => bgm_game.name,
        };

        let searched_game = SearchedGame {
            name: Arc::from(true_name),
            score: bgm_game.rating.unwrap_or(BgmRating { score: 0.0 }).score,
            publish_date: date_string_to_u64(&bgm_game.publish_date.unwrap_or(0.to_string()))
                .unwrap_or(0),
            image: Arc::from(bgm_game.image.unwrap_or("123".to_string())),
            developer: {
                match bgm_game.infobox {
                    Some(info) => info
                        .iter()
                        .find_map(|item| {
                            if item.key.contains("开发") {
                                Some(Arc::from(item.value.to_string().replace("\"", "")))
                            } else {
                                None
                            }
                        })
                        .unwrap_or_else(|| Arc::from("未知")),
                    None => Arc::from("未知"),
                }
            },
        };

        search_results.push(searched_game);
    }

    Ok(search_results)
}

pub async fn get_bgm_game_cover(
    state: &State<'_, AppState>,
    image_url: &str,
    id: u32,
) -> Result<String, String> {
    let mut headers = reqwest::header::HeaderMap::new();
    headers.insert(
        reqwest::header::USER_AGENT,
        reqwest::header::HeaderValue::from_static(
            "Rance-21/Quelplan (https://github.com/Rance-21/Quelplan)",
        ),
    );

    if let Some(token) = state.tokens.lock().unwrap().bgm.clone() {
        let token = format!("Bearer {}", token);
        headers.insert(AUTHORIZATION, HeaderValue::from_str(&token).unwrap());
    }

    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(10))
        .build()
        .unwrap();

    let mut res = client
        .get(image_url)
        .headers(headers.clone())
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let refresh_token = state.tokens.lock().unwrap().bgm_refresh.clone();

    if res.status() == reqwest::StatusCode::UNAUTHORIZED && refresh_token.is_some() {
        if let Some(refresh_token) = refresh_token {
            let new_token = refresh_bgm_token(refresh_token, &state)
                .await
                .map_err(|e| format!("OAuth2 授权过期,请重新在设置页面授权: {}", e))?
                .access_token;
            headers.insert(
                AUTHORIZATION,
                HeaderValue::from_str(&format!("Bearer {}", new_token)).unwrap(),
            );

            res = client
                .get(image_url)
                .headers(headers)
                .send()
                .await
                .map_err(|e| e.to_string())?;
        }
    }

    let image_bytes = res.bytes().await.map_err(|e| e.to_string())?;

    let mut download_dir = state.download_path.clone();
    let file_name = format!("{}.{}", id, find_extension(image_url));
    download_dir.push(file_name);

    // 写入二进制数据到文件
    fs::write(&download_dir, image_bytes)
        .await
        .map_err(|_| format!("写入图片失败, 使用默认图片"))?;

    Ok(download_dir
        .into_os_string()
        .into_string()
        .map_err(|_| "系统路径包含无法识别的非法 UTF-8 字符".to_string())?)
}
