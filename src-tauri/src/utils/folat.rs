#[inline]
pub fn round_to_one_decimal(score: f32) -> f32 {
    (score * 1.0).round() / 10.0
}
