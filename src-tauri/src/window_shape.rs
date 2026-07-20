use tauri::{Runtime, WebviewWindow, Window};

const WINDOW_RADIUS_CSS_PX: f64 = 16.0;

pub fn apply<R: Runtime>(window: &Window<R>) {
    #[cfg(target_os = "windows")]
    if let Err(error) = windows_impl::apply_window(window) {
        eprintln!(
            "failed to update native shape for window '{}': {error}",
            window.label()
        );
    }

    #[cfg(not(target_os = "windows"))]
    let _ = window;
}

pub fn apply_webview<R: Runtime>(window: &WebviewWindow<R>) {
    #[cfg(target_os = "windows")]
    if let Err(error) = windows_impl::apply_webview(window) {
        eprintln!(
            "failed to set initial native shape for window '{}': {error}",
            window.label()
        );
    }

    #[cfg(not(target_os = "windows"))]
    let _ = window;
}

#[cfg(target_os = "windows")]
mod windows_impl {
    use super::WINDOW_RADIUS_CSS_PX;
    use std::{ffi::c_void, mem::size_of};
    use tauri::{Runtime, WebviewWindow, Window};
    use windows::{
        core::Error,
        Win32::{
            Foundation::{COLORREF, HWND},
            Graphics::{
                Dwm::{
                    DwmSetWindowAttribute, DWMWA_BORDER_COLOR, DWMWA_WINDOW_CORNER_PREFERENCE,
                    DWMWCP_ROUND,
                },
                Gdi::{CreateRoundRectRgn, DeleteObject, SetWindowRgn, HGDIOBJ},
            },
            UI::WindowsAndMessaging::IsZoomed,
        },
    };

    const DWM_COLOR_NONE: COLORREF = COLORREF(0xFFFF_FFFE);

    pub(super) fn apply_window<R: Runtime>(window: &Window<R>) -> Result<(), String> {
        let tauri_hwnd = window.hwnd().map_err(|error| error.to_string())?;
        let hwnd = HWND(tauri_hwnd.0);

        apply_native(
            hwnd,
            || window.outer_size().map_err(|error| error.to_string()),
            || window.scale_factor().map_err(|error| error.to_string()),
        )
    }

    pub(super) fn apply_webview<R: Runtime>(window: &WebviewWindow<R>) -> Result<(), String> {
        let tauri_hwnd = window.hwnd().map_err(|error| error.to_string())?;
        let hwnd = HWND(tauri_hwnd.0);

        apply_native(
            hwnd,
            || window.outer_size().map_err(|error| error.to_string()),
            || window.scale_factor().map_err(|error| error.to_string()),
        )
    }

    fn apply_native(
        hwnd: HWND,
        get_size: impl FnOnce() -> Result<tauri::PhysicalSize<u32>, String>,
        get_scale_factor: impl FnOnce() -> Result<f64, String>,
    ) -> Result<(), String> {
        // Keep the native Windows 11 hint and border suppression, then apply a
        // region everywhere so the custom radius is not capped by DWM's fixed
        // corner size and stays identical to the CSS frame.
        let _ = apply_dwm_rounding(hwnd);

        apply_rounded_region(hwnd, get_size()?, get_scale_factor()?)
    }

    fn apply_dwm_rounding(hwnd: HWND) -> windows::core::Result<()> {
        unsafe {
            DwmSetWindowAttribute(
                hwnd,
                DWMWA_WINDOW_CORNER_PREFERENCE,
                &DWMWCP_ROUND as *const _ as *const c_void,
                size_of_val(&DWMWCP_ROUND) as u32,
            )?;

            let _ = DwmSetWindowAttribute(
                hwnd,
                DWMWA_BORDER_COLOR,
                &DWM_COLOR_NONE as *const _ as *const c_void,
                size_of::<COLORREF>() as u32,
            );
        }

        Ok(())
    }

    fn apply_rounded_region(
        hwnd: HWND,
        size: tauri::PhysicalSize<u32>,
        scale_factor: f64,
    ) -> Result<(), String> {
        unsafe {
            if IsZoomed(hwnd).as_bool() {
                if SetWindowRgn(hwnd, None, true) == 0 {
                    return Err(Error::from_thread().to_string());
                }
                return Ok(());
            }
        }

        let ellipse_diameter = ellipse_diameter(scale_factor);
        let width = i32::try_from(size.width).unwrap_or(i32::MAX - 1);
        let height = i32::try_from(size.height).unwrap_or(i32::MAX - 1);

        unsafe {
            // CreateRoundRectRgn excludes its lower and right edges, hence +1.
            let region = CreateRoundRectRgn(
                0,
                0,
                width.saturating_add(1),
                height.saturating_add(1),
                ellipse_diameter,
                ellipse_diameter,
            );
            if region.is_invalid() {
                return Err(Error::from_thread().to_string());
            }

            if SetWindowRgn(hwnd, Some(region), true) == 0 {
                let error = Error::from_thread();
                // Windows owns the region only after SetWindowRgn succeeds.
                let _ = DeleteObject(HGDIOBJ(region.0));
                return Err(error.to_string());
            }
        }

        Ok(())
    }

    fn ellipse_diameter(scale_factor: f64) -> i32 {
        ((WINDOW_RADIUS_CSS_PX * 2.0 * scale_factor).round() as i32).max(1)
    }

    #[cfg(test)]
    mod tests {
        use super::ellipse_diameter;

        #[test]
        fn corner_diameter_tracks_display_scale() {
            assert_eq!(ellipse_diameter(1.0), 32);
            assert_eq!(ellipse_diameter(1.5), 48);
            assert_eq!(ellipse_diameter(2.0), 64);
        }
    }
}
