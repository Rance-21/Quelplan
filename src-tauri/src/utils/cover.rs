use std::path::Path;

#[inline]
pub fn find_extension(last: &str) -> String {
    let url_without_query = last.split('?').next().unwrap_or(last);

    Path::new(url_without_query)
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("jpg")
        .to_string()
}
