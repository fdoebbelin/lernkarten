import { describe, expect, it } from "vitest";
import { csvZuKarten, kartenZuCsv } from "./csv";
import type { Karte } from "./typen";

describe("kartenZuCsv", () => {
  it("schreibt die Kopfzeile und einfache Felder ohne Anführungszeichen", () => {
    const karten: Karte[] = [
      { id: "a", frage: "Was ist 2+3?", antwort: "5", fach: 1, faelligAm: "2026-11-12" },
    ];
    expect(kartenZuCsv(karten)).toBe("frage;antwort;fach;faelligAm\nWas ist 2+3?;5;1;2026-11-12");
  });

  it("setzt Felder mit Semikolon, Anführungszeichen und Zeilenumbruch in Anführungszeichen und verdoppelt Anführungszeichen im Feld", () => {
    const karten: Karte[] = [
      {
        id: "a",
        frage: 'Was ist 2;3 und "mehr"?',
        antwort: "Zeile\nzwei",
        fach: 3,
        faelligAm: "2026-11-20",
      },
    ];
    expect(kartenZuCsv(karten)).toBe(
      'frage;antwort;fach;faelligAm\n"Was ist 2;3 und ""mehr""?";"Zeile\nzwei";3;2026-11-20',
    );
  });

  it("lässt die leere Karteiliste nur die Kopfzeile ergeben", () => {
    expect(kartenZuCsv([])).toBe("frage;antwort;fach;faelligAm");
  });
});

describe("csvZuKarten", () => {
  it("liest eine Datei mit Semikolon und Anführungszeichen im Feld", () => {
    const text = 'frage;antwort;fach;faelligAm\n"Was ist 2;3?";"Ein ""Paar""";3;2026-11-20';
    const { karten, fehler } = csvZuKarten(text, "2026-11-12");
    expect(fehler).toEqual([]);
    expect(karten).toHaveLength(1);
    expect(karten[0].frage).toBe("Was ist 2;3?");
    expect(karten[0].antwort).toBe('Ein "Paar"');
    expect(karten[0].fach).toBe(3);
    expect(karten[0].faelligAm).toBe("2026-11-20");
  });

  it("liest einen Zeilenumbruch im Feld", () => {
    const text = 'frage;antwort;fach;faelligAm\n"Zeile\nzwei";ok;5;2026-12-31';
    const { karten, fehler } = csvZuKarten(text, "2026-11-12");
    expect(fehler).toEqual([]);
    expect(karten).toHaveLength(1);
    expect(karten[0].frage).toBe("Zeile\nzwei");
  });

  it("ergänzt fehlendes fach und faelligAm mit Fach 1 und heute", () => {
    const { karten, fehler } = csvZuKarten("frage;antwort;fach;faelligAm\nF;A;;", "2026-11-12");
    expect(fehler).toEqual([]);
    expect(karten).toHaveLength(1);
    expect(karten[0].fach).toBe(1);
    expect(karten[0].faelligAm).toBe("2026-11-12");
  });

  it("liefert bei leerer Datei keine Karten und keine Fehler", () => {
    const { karten, fehler } = csvZuKarten("", "2026-11-12");
    expect(karten).toEqual([]);
    expect(fehler).toEqual([]);
  });

  it("liefert bei einer Datei ohne Zeilenumbruch keine Karten und keine Fehler", () => {
    const { karten, fehler } = csvZuKarten("frage;antwort;fach;faelligAm", "2026-11-12");
    expect(karten).toEqual([]);
    expect(fehler).toEqual([]);
  });

  it("meldet eine Zeile ohne Antwort als Fehler und übernimmt die übrigen Zeilen", () => {
    const text =
      "frage;antwort;fach;faelligAm\nF1;A1;1;2026-11-12\nNur Frage;;1;2026-11-12\nF2;A2;2;2026-11-13";
    const { karten, fehler } = csvZuKarten(text, "2026-11-12");
    expect(karten).toHaveLength(2);
    expect(karten[0].frage).toBe("F1");
    expect(karten[1].frage).toBe("F2");
    expect(fehler).toHaveLength(1);
    expect(fehler[0].zeile).toBe(3);
    expect(fehler[0].meldung).toContain("Antwort");
  });

  it("zählt einen Zeilenumbruch im Feld bei der gemeldeten zeile mit", () => {
    const text = 'frage;antwort;fach;faelligAm\n"a\nb";x;1;2026-01-01\nF;;1;2026-01-01';
    const { karten, fehler } = csvZuKarten(text, "2026-01-01");
    expect(karten).toHaveLength(1);
    expect(fehler).toHaveLength(1);
    expect(fehler[0].zeile).toBe(4);
  });

  it("zählt einen Zeilenumbruch im Feld mit, auch CRLF", () => {
    const text = 'frage;antwort;fach;faelligAm\r\n"a\r\nb";x;1;2026-01-01\r\nF;;1;2026-01-01';
    const { karten, fehler } = csvZuKarten(text, "2026-01-01");
    expect(karten).toHaveLength(1);
    expect(fehler).toHaveLength(1);
    expect(fehler[0].zeile).toBe(4);
  });

  it("meldet ein faelligAm, das kein ISO-Datum ist, als Fehler", () => {
    const text = "frage;antwort;fach;faelligAm\nF;A;1;kaputt";
    const { karten, fehler } = csvZuKarten(text, "2026-01-01");
    expect(karten).toEqual([]);
    expect(fehler).toHaveLength(1);
    expect(fehler[0].zeile).toBe(2);
    expect(fehler[0].meldung).toContain("Datum");
  });

  it("meldet ein faelligAm mit unzulässigem Kalendertag als Fehler", () => {
    const text = "frage;antwort;fach;faelligAm\nF;A;1;2026-02-30";
    const { karten, fehler } = csvZuKarten(text, "2026-01-01");
    expect(karten).toEqual([]);
    expect(fehler).toHaveLength(1);
    expect(fehler[0].zeile).toBe(2);
  });

  it("meldet eine Zeile ohne Frage als Fehler", () => {
    const text = "frage;antwort;fach;faelligAm\n;Nur Antwort;1;2026-11-12";
    const { karten, fehler } = csvZuKarten(text, "2026-11-12");
    expect(karten).toHaveLength(0);
    expect(fehler).toHaveLength(1);
    expect(fehler[0].zeile).toBe(2);
    expect(fehler[0].meldung).toContain("Frage");
  });

  it("meldet fach 0 als Fehler", () => {
    const text = "frage;antwort;fach;faelligAm\nF;A;0;2026-11-12";
    const { karten, fehler } = csvZuKarten(text, "2026-11-12");
    expect(karten).toEqual([]);
    expect(fehler).toHaveLength(1);
    expect(fehler[0].zeile).toBe(2);
  });

  it("meldet fach 6 als Fehler", () => {
    const text = "frage;antwort;fach;faelligAm\nF;A;6;2026-11-12";
    const { karten, fehler } = csvZuKarten(text, "2026-11-12");
    expect(karten).toEqual([]);
    expect(fehler).toHaveLength(1);
    expect(fehler[0].zeile).toBe(2);
  });

  it("gibt jeder Karte eine neue id", () => {
    const { karten } = csvZuKarten("frage;antwort;fach;faelligAm\nF1;A1;1;2026-11-12\nF2;A2;2;2026-11-13", "2026-11-12");
    expect(karten).toHaveLength(2);
    expect(karten[0].id).not.toBe(karten[1].id);
    expect(karten[0].id).toMatch(/[0-9a-f-]{36}/);
  });

  it("Rundreise ergibt dieselben Karten", () => {
    const karten: Karte[] = [
      { id: "a", frage: "Was ist 2;3?", antwort: 'Ein "Paar"', fach: 3, faelligAm: "2026-11-20" },
      { id: "b", frage: "Zeile\nzwei", antwort: "ok", fach: 5, faelligAm: "2026-12-31" },
    ];
    const { karten: zurueck, fehler } = csvZuKarten(kartenZuCsv(karten), "2026-11-12");

    const ohneId = (k: Karte) => ({ frage: k.frage, antwort: k.antwort, fach: k.fach, faelligAm: k.faelligAm });
    expect(fehler).toEqual([]);
    expect(zurueck.map(ohneId)).toEqual(karten.map(ohneId));
  });
});
