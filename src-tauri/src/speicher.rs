//! Laden und Speichern des Datenbestands als JSON-Datei.
//! Dieses Modul kennt Tauri nicht und lässt sich deshalb allein testen.

use serde::{Deserialize, Serialize};
use std::fs;
use std::io::Write;
use std::path::Path;

pub const DATEINAME: &str = "lernkarten.json";
pub const FORMAT_VERSION: u32 = 1;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Karte {
    pub id: String,
    pub frage: String,
    pub antwort: String,
    pub fach: u8,
    pub faellig_am: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Stapel {
    pub id: String,
    pub name: String,
    pub karten: Vec<Karte>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Datenbestand {
    pub version: u32,
    pub stapel: Vec<Stapel>,
}

impl Datenbestand {
    pub fn leer() -> Self {
        Self { version: FORMAT_VERSION, stapel: Vec::new() }
    }
}

/// Liest den Bestand. Eine fehlende Datei ist kein Fehler, sondern ein leerer Bestand.
pub fn lade(pfad: &Path) -> Result<Datenbestand, String> {
    if !pfad.exists() {
        return Ok(Datenbestand::leer());
    }
    let text = fs::read_to_string(pfad).map_err(|e| format!("Datei nicht lesbar: {e}"))?;
    let bestand: Datenbestand =
        serde_json::from_str(&text).map_err(|e| format!("Datei beschädigt: {e}"))?;
    if bestand.version != FORMAT_VERSION {
        return Err(format!("Unbekannte Formatversion {}", bestand.version));
    }
    Ok(bestand)
}

/// Schreibt erst in eine Nachbardatei und benennt sie dann um,
/// damit ein Absturz die vorhandene Datei nicht halb überschreibt.
pub fn speichere(pfad: &Path, bestand: &Datenbestand) -> Result<(), String> {
    if let Some(ordner) = pfad.parent() {
        fs::create_dir_all(ordner).map_err(|e| format!("Ordner nicht anlegbar: {e}"))?;
    }
    let text = serde_json::to_string_pretty(bestand).map_err(|e| e.to_string())?;
    let temp = pfad.with_extension("json.tmp");
    {
        let mut datei = fs::File::create(&temp).map_err(|e| format!("Datei nicht anlegbar: {e}"))?;
        datei.write_all(text.as_bytes()).map_err(|e| format!("Schreiben fehlgeschlagen: {e}"))?;
        datei.sync_all().map_err(|e| format!("Schreiben fehlgeschlagen: {e}"))?;
    }
    fs::rename(&temp, pfad).map_err(|e| format!("Umbenennen fehlgeschlagen: {e}"))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    fn test_ordner(name: &str) -> PathBuf {
        let ordner = std::env::temp_dir().join(format!("lernkarten-test-{}-{name}", std::process::id()));
        let _ = fs::remove_dir_all(&ordner);
        ordner
    }

    fn beispiel() -> Datenbestand {
        Datenbestand {
            version: FORMAT_VERSION,
            stapel: vec![Stapel {
                id: "s1".into(),
                name: "SQL".into(),
                karten: vec![Karte {
                    id: "k1".into(),
                    frage: "Welche Klausel filtert Gruppen?".into(),
                    antwort: "HAVING".into(),
                    fach: 1,
                    faellig_am: "2026-11-11".into(),
                }],
            }],
        }
    }

    #[test]
    fn fehlende_datei_ergibt_leeren_bestand() {
        let pfad = test_ordner("fehlt").join(DATEINAME);
        assert_eq!(lade(&pfad).unwrap(), Datenbestand::leer());
    }

    #[test]
    fn speichern_und_laden_ergibt_denselben_bestand() {
        let pfad = test_ordner("rundreise").join(DATEINAME);
        speichere(&pfad, &beispiel()).unwrap();
        assert_eq!(lade(&pfad).unwrap(), beispiel());
        assert!(!pfad.with_extension("json.tmp").exists());
    }

    #[test]
    fn json_nutzt_die_feldnamen_des_frontends() {
        let text = serde_json::to_string(&beispiel()).unwrap();
        assert!(text.contains("\"faelligAm\""));
    }

    #[test]
    fn beschaedigte_datei_ist_ein_fehler() {
        let pfad = test_ordner("kaputt").join(DATEINAME);
        fs::create_dir_all(pfad.parent().unwrap()).unwrap();
        fs::write(&pfad, "{ kein json").unwrap();
        assert!(lade(&pfad).unwrap_err().starts_with("Datei beschädigt"));
    }

    #[test]
    fn unbekannte_version_ist_ein_fehler() {
        let pfad = test_ordner("version").join(DATEINAME);
        fs::create_dir_all(pfad.parent().unwrap()).unwrap();
        fs::write(&pfad, r#"{"version": 99, "stapel": []}"#).unwrap();
        assert_eq!(lade(&pfad).unwrap_err(), "Unbekannte Formatversion 99");
    }
}
