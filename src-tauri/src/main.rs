// Digital Guardian desktop companion — Tauri v2
//
// Enforcement strategy: modify the system hosts file to redirect blocked domains
// to 127.0.0.1 during active commitment windows. The shared rules engine
// (shared/commitment-rules.ts) is consumed via the JS bridge for evaluation;
// this Rust side handles the OS-level file modification.

use std::fs;
use std::io::Write;
use tauri::Manager;

#[cfg(target_os = "windows")]
const HOSTS_PATH: &str = r"C:\Windows\System32\drivers\etc\hosts";

#[cfg(target_os = "macos")]
const HOSTS_PATH: &str = "/etc/hosts";

#[cfg(target_os = "linux")]
const HOSTS_PATH: &str = "/etc/hosts";

const MARKER_START: &str = "# >>> Digital Guardian START <<<";
const MARKER_END: &str = "# >>> Digital Guardian END <<<";

/// Remove any previously written Digital Guardian block from the hosts file.
fn clear_hosts_block() -> Result<(), String> {
    let content = fs::read_to_string(HOSTS_PATH).map_err(|e| e.to_string())?;
    let mut lines: Vec<&str> = content.lines().collect();
    // Find and remove the marked block
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

/// Write a new block of hosts entries for the given domains.
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

/// Tauri command: apply blocking for the given list of domains.
#[tauri::command]
fn block_domains(domains: Vec<String>) -> Result<String, String> {
    write_hosts_block(&domains)?;
    Ok(format!("Blocked {} domains", domains.len()))
}

/// Tauri command: remove all Digital Guardian blocks.
#[tauri::command]
fn unblock_all() -> Result<String, String> {
    clear_hosts_block()?;
    Ok("All blocks removed".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![block_domains, unblock_all])
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            window.set_title("Digital Guardian").unwrap();
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn main() {
    run();
}
