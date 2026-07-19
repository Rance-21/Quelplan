use tokio::fs;

pub async fn delete_previous_avatar(
    previous_avatar_path: Option<String>,
    next_avatar_path: Option<&str>,
) {
    let Some(previous_avatar_path) = previous_avatar_path else {
        return;
    };

    if previous_avatar_path.trim().is_empty()
        || next_avatar_path == Some(previous_avatar_path.as_str())
    {
        return;
    }

    let _ = fs::remove_file(previous_avatar_path).await;
}
