// CSV-Import und -Export für Karten: Semikolon als Trennzeichen,
// Felder mit Sonderzeichen stehen in Anführungszeichen.

import type { Karte } from "./typen";

const TRENNER = ";";
const KOPFZEILE = `frage${TRENNER}antwort${TRENNER}fach${TRENNER}faelligAm`;
const FACH_MIN = 1;
const FACH_MAX = 5;
const DATUM_MUSTER = /^\d{4}-\d{2}-\d{2}$/;
const BOM = String.fromCharCode(0xfeff);

export interface CsvFehler {
  /** Zeile in der Datei; die Kopfzeile zählt als Zeile 1. */
  zeile: number;
  meldung: string;
}

export interface CsvErgebnis {
  karten: Karte[];
  fehler: CsvFehler[];
}

/** Setzt Anführungszeichen, wenn das Feld Trennzeichen, Anführungszeichen oder Zeilenumbruch enthält. */
function feld(wert: string): string {
  if (wert.includes(TRENNER) || wert.includes('"') || wert.includes("\n") || wert.includes("\r")) {
    return `"${wert.split('"').join('""')}"`;
  }
  return wert;
}

/** Wandelt Karten in CSV-Text um; die Kopfzeile steht immer in der ersten Zeile. */
export function kartenZuCsv(karten: Karte[]): string {
  const zeilen = [KOPFZEILE];
  for (const karte of karten) {
    zeilen.push(
      [feld(karte.frage), feld(karte.antwort), feld(String(karte.fach)), feld(karte.faelligAm)].join(TRENNER),
    );
  }
  return zeilen.join("\n");
}

/** Ein gelesener Datensatz mit der Zeile, in der er beginnt. */
interface Datensatz {
  felder: string[];
  startZeile: number;
  /** true, wenn ein geöffnetes Anführungszeichen im Feld am Dateiende nicht geschlossen wurde. */
  nichtGeschlossen: boolean;
}

/**
 * Zerlegt CSV-Text in Datensätze. Ein state machine liest auch Anführungszeichen,
 * verdoppelte Anführungszeichen und Zeilenumbrüche innerhalb von Feldern.
 */
function leseDatensaetze(text: string): Datensatz[] {
  const datensaetze: Datensatz[] = [];
  let felder: string[] = [];
  let feldText = "";
  let inAnfuehrung = false;
  let startZeile = 1;
  let zeile = 1;

  const beendeFeld = () => {
    felder.push(feldText);
    feldText = "";
  };
  const beendeDatensatz = () => {
    beendeFeld();
    datensaetze.push({ felder, startZeile, nichtGeschlossen: false });
    felder = [];
    startZeile = zeile + 1;
  };

  for (let i = 0; i < text.length; i++) {
    const zeichen = text[i];
    if (inAnfuehrung) {
      if (zeichen === '"') {
        if (text[i + 1] === '"') {
          feldText += '"';
          i++;
        } else {
          inAnfuehrung = false;
        }
      } else {
        feldText += zeichen;
        if (zeichen === "\n") {
          zeile++;
        } else if (zeichen === "\r") {
          // CR mit nachfolgendem LF ist ein einziger Umbruch; das Feld behält beide Zeichen.
          if (text[i + 1] === "\n") {
            feldText += "\n";
            i++;
          }
          zeile++;
        }
      }
    } else if (zeichen === '"' && feldText === "") {
      inAnfuehrung = true;
    } else if (zeichen === TRENNER) {
      beendeFeld();
    } else if (zeichen === "\n") {
      beendeDatensatz();
      zeile++;
    } else if (zeichen === "\r") {
      if (text[i + 1] === "\n") {
        i++;
      }
      beendeDatensatz();
      zeile++;
    } else {
      feldText += zeichen;
    }
  }
  if (inAnfuehrung) {
    beendeFeld();
    datensaetze.push({ felder, startZeile, nichtGeschlossen: true });
    felder = [];
  } else if (feldText !== "" || felder.length > 0) {
    beendeDatensatz();
  }
  return datensaetze;
}

/** Prüft, ob der Wert ein gültiges ISO-Datum JJJJ-MM-TT ist, auch bei Kalendertagen wie 2026-02-30. */
function istIsoDatum(datum: string): boolean {
  if (!DATUM_MUSTER.test(datum)) {
    return false;
  }
  const teile = datum.split("-");
  const jahr = Number(teile[0]);
  const monat = Number(teile[1]);
  const tag = Number(teile[2]);
  if (monat < 1 || monat > 12 || tag < 1) {
    return false;
  }
  // Tag 0 des Folgemonats ist der letzte Tag des Monats.
  const letzteTag = new Date(Date.UTC(jahr, monat, 0)).getUTCDate();
  return tag <= letzteTag;
}

/** Liest CSV-Text in Karten; beschädigte Zeilen stehen in fehler, die übrigen werden übernommen. */
export function csvZuKarten(text: string, heute: string): CsvErgebnis {
  const karten: Karte[] = [];
  const fehler: CsvFehler[] = [];
  const textOhneBom = text.startsWith(BOM) ? text.slice(1) : text;
  const datensaetze = leseDatensaetze(textOhneBom);

  // Der erste Datensatz muss die Kopfzeile sein; sonst ginge die erste Karte verloren.
  const erste = datensaetze[0];
  if (erste !== undefined && erste.felder.join(TRENNER) !== KOPFZEILE) {
    fehler.push({
      zeile: 1,
      meldung: `Zeile 1: Die Kopfzeile muss "${KOPFZEILE}" lauten.`,
    });
    return { karten, fehler };
  }
  for (const datensatz of datensaetze.slice(1)) {
    // Ein nicht geschlossenes Anführungszeichen verschluckt den Rest der Datei; dieser Datensatz wird nicht übernommen.
    if (datensatz.nichtGeschlossen) {
      fehler.push({
        zeile: datensatz.startZeile,
        meldung: `Zeile ${datensatz.startZeile}: Ein Anführungszeichen wird nicht geschlossen.`,
      });
      continue;
    }
    // Völlig leere Zeilen ohne Trennzeichen überspringen; die Zeilenzählung bleibt unverändert.
    if (datensatz.felder.length === 1 && datensatz.felder[0] === "") {
      continue;
    }
    const zeile = datensatz.startZeile;
    const frage = datensatz.felder[0] ?? "";
    const antwort = datensatz.felder[1] ?? "";
    const fachText = datensatz.felder[2] ?? "";
    const faelligAm = datensatz.felder[3] ?? "";

    if (frage === "" || antwort === "") {
      const was = frage === "" ? "Frage" : "Antwort";
      fehler.push({ zeile, meldung: `Zeile ${zeile}: Die ${was} fehlt.` });
      continue;
    }

    let fach: number;
    if (fachText === "") {
      fach = FACH_MIN;
    } else {
      fach = Number(fachText);
      if (!Number.isInteger(fach) || fach < FACH_MIN || fach > FACH_MAX) {
        fehler.push({
          zeile,
          meldung: `Zeile ${zeile}: Das Fach "${fachText}" liegt außerhalb von ${FACH_MIN} bis ${FACH_MAX}.`,
        });
        continue;
      }
    }

    let faelligGewaehlt = faelligAm;
    if (faelligGewaehlt === "") {
      faelligGewaehlt = heute;
    } else if (!istIsoDatum(faelligGewaehlt)) {
      fehler.push({
        zeile,
        meldung: `Zeile ${zeile}: Das Datum "${faelligGewaehlt}" ist kein gültiges Datum JJJJ-MM-TT.`,
      });
      continue;
    }

    karten.push({
      id: crypto.randomUUID(),
      frage,
      antwort,
      fach,
      faelligAm: faelligGewaehlt,
    });
  }
  return { karten, fehler };
}
