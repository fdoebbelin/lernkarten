// Dünne Schicht über den Tauri-Befehlen aus src-tauri/src/lib.rs.
// Die Oberfläche greift über useBestand() in bestand.ts darauf zu.

import { invoke } from "@tauri-apps/api/core";
import type { Datenbestand } from "../domain/typen";

export function ladeBestand(): Promise<Datenbestand> {
  return invoke<Datenbestand>("lade_bestand");
}

export function speichereBestand(bestand: Datenbestand): Promise<void> {
  return invoke("speichere_bestand", { bestand });
}
