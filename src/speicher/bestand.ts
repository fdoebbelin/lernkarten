// Composable für den gespeicherten Datenbestand: lädt beim Start, speichert nach jeder Änderung.
// Lade- und Speicherfunktion sind austauschbar, damit die Logik ohne Tauri testbar ist.

import { readonly, ref, shallowRef } from "vue";
import type { Ref } from "vue";
import { beispielBestand } from "../domain/beispiel";
import { heuteIso } from "../domain/leitner";
import type { Datenbestand } from "../domain/typen";
import { ladeBestand, speichereBestand } from "./befehle";

export type Zustand = "laden" | "bereit" | "fehler";

export interface BestandOptionen {
  lade?: () => Promise<Datenbestand>;
  speichere?: (bestand: Datenbestand) => Promise<void>;
  /** Stichtag für den Beispielbestand, ISO-Datum JJJJ-MM-TT. */
  heute?: string;
}

export interface BestandZugriff {
  bestand: Readonly<Ref<Datenbestand | null>>;
  zustand: Readonly<Ref<Zustand>>;
  fehlermeldung: Readonly<Ref<string>>;
  /**
   * Wendet die Änderung auf den aktuellen Bestand an und speichert das Ergebnis.
   * Die Funktion liefert einen neuen Bestand und verändert den alten nicht.
   */
  aendere: (aenderung: (alt: Datenbestand) => Datenbestand) => Promise<void>;
  /** Erfüllt, sobald der Start abgeschlossen ist (bereit oder Fehler). Lehnt nie ab. */
  geladen: Promise<void>;
}

/** Tauri meldet Fehler als Zeichenkette, nicht als Error. */
function fehlerText(fehler: unknown): string {
  if (typeof fehler === "string") return fehler;
  if (fehler instanceof Error) return fehler.message;
  return String(fehler);
}

export function useBestand(optionen: BestandOptionen = {}): BestandZugriff {
  const lade = optionen.lade ?? ladeBestand;
  const speichere = optionen.speichere ?? speichereBestand;
  const heute = optionen.heute ?? heuteIso();

  // shallowRef: Der Bestand wird nur als Ganzes ersetzt (unveränderlich) und bleibt ein einfaches Objekt,
  // das sich ohne Proxy-Probleme kopieren und an Tauri übergeben lässt.
  const bestand = shallowRef<Datenbestand | null>(null);
  const zustand = ref<Zustand>("laden");
  const fehlermeldung = ref("");

  // Speichervorgänge laufen nacheinander, damit ein späterer Stand nicht von einem früheren überholt wird.
  let speicherkette: Promise<void> = Promise.resolve();

  function meldeFehler(text: string): void {
    zustand.value = "fehler";
    fehlermeldung.value = text;
  }

  function schreibe(stand: Datenbestand): Promise<void> {
    // Kopie, damit spätere Änderungen den laufenden Speichervorgang nicht verfälschen.
    const kopie = structuredClone(stand);
    const vorgang = speicherkette.then(async () => {
      try {
        await speichere(kopie);
      } catch (fehler) {
        meldeFehler(`Speichern fehlgeschlagen: ${fehlerText(fehler)}`);
      }
    });
    speicherkette = vorgang;
    return vorgang;
  }

  async function starte(): Promise<void> {
    let geladenerBestand: Datenbestand;
    try {
      geladenerBestand = await lade();
    } catch (fehler) {
      // Nichts speichern: eine beschädigte Datei darf nicht überschrieben werden.
      meldeFehler(fehlerText(fehler));
      return;
    }
    if (geladenerBestand.stapel.length === 0) {
      bestand.value = beispielBestand(heute);
      await schreibe(bestand.value);
    } else {
      bestand.value = geladenerBestand;
    }
    if (zustand.value === "laden") zustand.value = "bereit";
  }

  async function aendere(aenderung: (alt: Datenbestand) => Datenbestand): Promise<void> {
    if (bestand.value === null) return;
    bestand.value = aenderung(bestand.value);
    await schreibe(bestand.value);
  }

  const geladen = starte();

  return {
    bestand,
    zustand: readonly(zustand),
    fehlermeldung: readonly(fehlermeldung),
    aendere,
    geladen,
  };
}
