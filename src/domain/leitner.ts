// Lernkartei nach Leitner: gewusste Karten wandern ein Fach weiter,
// nicht gewusste zurück in Fach 1. Jedes Fach hat ein festes Wiederholungsintervall.

import type { Karte, Stapel } from "./typen";

export const FACH_ANZAHL = 5;

/** Wiederholungsintervall in Tagen je Fach; Index 0 gehört zu Fach 1. */
export const INTERVALLE_TAGE = [1, 2, 5, 10, 30] as const;

/** Heutiges Datum in Ortszeit als JJJJ-MM-TT. */
export function heuteIso(jetzt: Date = new Date()): string {
  const jahr = jetzt.getFullYear();
  const monat = String(jetzt.getMonth() + 1).padStart(2, "0");
  const tag = String(jetzt.getDate()).padStart(2, "0");
  return `${jahr}-${monat}-${tag}`;
}

/** Addiert Tage auf ein ISO-Datum, unabhängig von Zeitzone und Sommerzeit. */
export function plusTage(datum: string, tage: number): string {
  const d = new Date(`${datum}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + tage);
  return d.toISOString().slice(0, 10);
}

/** Liefert die Karte nach einer Antwort; die übergebene Karte bleibt unverändert. */
export function bewerte(karte: Karte, gewusst: boolean, heute: string): Karte {
  const fach = gewusst ? Math.min(karte.fach + 1, FACH_ANZAHL) : 1;
  return { ...karte, fach, faelligAm: plusTage(heute, INTERVALLE_TAGE[fach - 1]) };
}

export function istFaellig(karte: Karte, heute: string): boolean {
  return karte.faelligAm <= heute;
}

export function faelligeKarten(stapel: Stapel, heute: string): Karte[] {
  return stapel.karten.filter((karte) => istFaellig(karte, heute));
}
