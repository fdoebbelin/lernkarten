// Datenmodell der Lernkarten-App.
// Diese Datei ist eine geteilte Datei: Änderungen nur mit ausdrücklichem Auftrag
// und immer in der Übergabe nennen (siehe AGENTS.md).

/** Eine Lernkarte mit Vorder- und Rückseite. */
export interface Karte {
  id: string;
  frage: string;
  antwort: string;
  /** Fach der Lernkartei, 1 bis FACH_ANZAHL. */
  fach: number;
  /** Nächste Fälligkeit als ISO-Datum JJJJ-MM-TT. */
  faelligAm: string;
}

/** Ein Stapel fasst Karten zu einem Thema zusammen. */
export interface Stapel {
  id: string;
  name: string;
  karten: Karte[];
}

/** Der gesamte gespeicherte Datenbestand. */
export interface Datenbestand {
  version: 1;
  stapel: Stapel[];
}
