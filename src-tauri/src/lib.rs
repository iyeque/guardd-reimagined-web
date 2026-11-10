// Digital Guardian desktop companion — Tauri v2 library target.

use std::fs;
use std::io::Write;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{TrayIconBuilder, TrayIconEvent},
    Manager,
};
use tauri_plugin_notification::NotificationExt;

#[cfg(target_os = "windows")]
const HOSTS_PATH: &str = r"C:\Windows\System32\drivers\etc\hosts";

#[cfg(target_os = "macos")]
const HOSTS_PATH: &str = "/etc/hosts";

#[cfg(target_os = "linux")]
const HOSTS_PATH: &str = "/etc/hosts";

const MARKER_START: &str = "# >>> Digital Guardian START <<<";
const MARKER_END: &str = "# >>> Digital Guardian END <<<";

fn clear_hosts_block() -> Result<(), String> {
    let content = fs::read_to_string(HOSTS_PATH).map_err(|e| e.to_string())?;
    let mut lines: Vec<&str> = content.lines().collect();
    if let (Some(start), Some(end)) = (
        lines.iter().position(|l| l.trim() == MARKER_START),
        lines.iter().rposition(|l| l.trim() == MARKER_END),
    ) {
        lines.drain(start..=end);
    }
    let mut out = lines.join("\n");
    if !out.ends_with('\n') {
        out.push('\n');
    }
    fs::write(HOSTS_PATH, out).map_err(|e| e.to_string())?;
    Ok(())
}

fn write_hosts_block(domains: &[String]) -> Result<(), String> {
    clear_hosts_block()?;
    if domains.is_empty() {
        return Ok(());
    }
    let mut file = fs::OpenOptions::new()
        .append(true)
        .open(HOSTS_PATH)
        .map_err(|e| e.to_string())?;
    writeln!(file, "{}", MARKER_START).map_err(|e| e.to_string())?;
    for d in domains {
        writeln!(file, "127.0.0.1 {}", d).map_err(|e| e.to_string())?;
        writeln!(file, "127.0.0.1 www.{}", d).map_err(|e| e.to_string())?;
    }
    writeln!(file, "{}", MARKER_END).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn block_domains(domains: Vec<String>) -> Result<String, String> {
    write_hosts_block(&domains)?;
    Ok(format!("Blocked {} domains", domains.len()))
}

#[tauri::command]
fn unblock_all() -> Result<String, String> {
    clear_hosts_block()?;
    Ok("All blocks removed".to_string())
}

#[tauri::command]
fn send_notification(app: tauri::AppHandle, title: String, body: String) -> Result<(), String> {
    app.notification()
        .builder()
        .title(&title)
        .body(&body)
        .show()
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec![]),
        ))
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .invoke_handler(tauri::generate_handler![block_domains, unblock_all, send_notification])
        .setup(|app| {
            // System tray
            let show_item = MenuItem::with_id(app, "show", "Show Window", true, None::<&str>)?;
            let hide_item = MenuItem::with_id(app, "hide", "Hide to Tray", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_item, &hide_item, &quit_item])?;

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .tooltip("Digital Guardian")
                .menu(&menu)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "hide" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.hide();
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click { .. } = event {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            // Minimize to tray instead of closing
            if let Some(window) = app.get_webview_window("main") {
                let window_clone = window.clone();
                window.on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                        api.prevent_close();
                        let _ = window_clone.hide();
                    }
                });
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
