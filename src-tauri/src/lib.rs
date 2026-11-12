mod speicher;

use speicher::Datenbestand;
use std::path::PathBuf;
use tauri::Manager;

/// Pfad der Datendatei im App-Datenverzeichnis des Betriebssystems.
fn datei_pfad(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let ordner = app.path().app_data_dir().map_err(|e| e.to_string())?;
    Ok(ordner.join(speicher::DATEINAME))
}

#[tauri::command]
fn lade_bestand(app: tauri::AppHandle) -> Result<Datenbestand, String> {
    speicher::lade(&datei_pfad(&app)?)
}

#[tauri::command]
fn speichere_bestand(app: tauri::AppHandle, bestand: Datenbestand) -> Result<(), String> {
    speicher::speichere(&datei_pfad(&app)?, &bestand)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![lade_bestand, speichere_bestand])
        .run(tauri::generate_context!())
        .expect("Fehler beim Start der Tauri-Anwendung");
}
