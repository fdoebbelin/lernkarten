import { describe, expect, it, vi } from "vitest";
import { isProxy } from "vue";
import { beispielBestand } from "../domain/beispiel";
import type { Datenbestand } from "../domain/typen";
import { useBestand } from "./bestand";

const HEUTE = "2026-11-16";

function leer(): Datenbestand {
  return { version: 1, stapel: [] };
}

function vorhanden(): Datenbestand {
  return {
    version: 1,
    stapel: [
      {
        id: "s1",
        name: "Eigener Stapel",
        karten: [{ id: "k1", frage: "Frage", antwort: "Antwort", fach: 1, faelligAm: HEUTE }],
      },
    ],
  };
}

/** Erzeugt die Attrappen für Laden und Speichern. */
function attrappen(geladen: () => Promise<Datenbestand>) {
  const lade = vi.fn(geladen);
  const speichere = vi.fn((_bestand: Datenbestand) => Promise.resolve());
  return { lade, speichere };
}

describe("useBestand: Start", () => {
  it("beginnt im Zustand laden ohne Bestand", async () => {
    const { lade, speichere } = attrappen(() => Promise.resolve(vorhanden()));
    const zugriff = useBestand({ lade, speichere, heute: HEUTE });

    expect(zugriff.zustand.value).toBe("laden");
    expect(zugriff.bestand.value).toBeNull();
    await zugriff.geladen;
  });

  it("übernimmt einen vorhandenen Bestand und speichert nicht", async () => {
    const { lade, speichere } = attrappen(() => Promise.resolve(vorhanden()));
    const zugriff = useBestand({ lade, speichere, heute: HEUTE });
    await zugriff.geladen;

    expect(zugriff.zustand.value).toBe("bereit");
    expect(zugriff.bestand.value).toEqual(vorhanden());
    expect(speichere).not.toHaveBeenCalled();
  });

  it("übernimmt bei leerem Bestand den Beispielbestand und speichert ihn sofort", async () => {
    const { lade, speichere } = attrappen(() => Promise.resolve(leer()));
    const zugriff = useBestand({ lade, speichere, heute: HEUTE });
    await zugriff.geladen;

    expect(zugriff.zustand.value).toBe("bereit");
    expect(zugriff.bestand.value).toEqual(beispielBestand(HEUTE));
    expect(speichere).toHaveBeenCalledTimes(1);
    expect(speichere).toHaveBeenCalledWith(beispielBestand(HEUTE));
  });

  it("meldet einen Ladefehler als Error mit Text und speichert nichts", async () => {
    const { lade, speichere } = attrappen(() => Promise.reject(new Error("Platte weg")));
    const zugriff = useBestand({ lade, speichere, heute: HEUTE });
    await zugriff.geladen;

    expect(zugriff.zustand.value).toBe("fehler");
    expect(zugriff.fehlermeldung.value).toContain("Platte weg");
    expect(zugriff.bestand.value).toBeNull();
    expect(speichere).not.toHaveBeenCalled();
  });

  it("meldet einen Ladefehler als Zeichenkette, wie Tauri ihn liefert", async () => {
    const { lade, speichere } = attrappen(() => Promise.reject("Datei beschädigt: expected value"));
    const zugriff = useBestand({ lade, speichere, heute: HEUTE });
    await zugriff.geladen;

    expect(zugriff.zustand.value).toBe("fehler");
    expect(zugriff.fehlermeldung.value).toBe("Datei beschädigt: expected value");
  });

  it("meldet einen Fehler beim ersten Speichern des Beispielbestands", async () => {
    const lade = vi.fn(() => Promise.resolve(leer()));
    const speichere = vi.fn(() => Promise.reject("Ordner nicht anlegbar"));
    const zugriff = useBestand({ lade, speichere, heute: HEUTE });
    await zugriff.geladen;

    expect(zugriff.zustand.value).toBe("fehler");
    expect(zugriff.fehlermeldung.value).toBe("Speichern fehlgeschlagen: Ordner nicht anlegbar");
    expect(zugriff.bestand.value).toEqual(beispielBestand(HEUTE));
  });
});

describe("useBestand: aendere", () => {
  const umbenennen = (name: string) => (alt: Datenbestand): Datenbestand => ({
    ...alt,
    stapel: alt.stapel.map((s) => ({ ...s, name })),
  });

  it("setzt den neuen Bestand und speichert nach jeder Änderung", async () => {
    const { lade, speichere } = attrappen(() => Promise.resolve(vorhanden()));
    const zugriff = useBestand({ lade, speichere, heute: HEUTE });
    await zugriff.geladen;

    await zugriff.aendere(umbenennen("Erste"));
    expect(zugriff.bestand.value?.stapel[0].name).toBe("Erste");
    expect(speichere).toHaveBeenCalledTimes(1);

    await zugriff.aendere(umbenennen("Zweite"));
    expect(zugriff.bestand.value?.stapel[0].name).toBe("Zweite");
    expect(speichere).toHaveBeenCalledTimes(2);
    expect(speichere.mock.calls[1][0].stapel[0].name).toBe("Zweite");
  });

  it("speichert eine Kopie ohne reaktiven Proxy", async () => {
    const { lade, speichere } = attrappen(() => Promise.resolve(vorhanden()));
    const zugriff = useBestand({ lade, speichere, heute: HEUTE });
    await zugriff.geladen;

    await zugriff.aendere(umbenennen("Neu"));

    const gespeichert = speichere.mock.calls[0][0];
    expect(isProxy(gespeichert)).toBe(false);
    expect(isProxy(gespeichert.stapel)).toBe(false);
    expect(gespeichert).not.toBe(zugriff.bestand.value);
  });

  it("meldet einen Speicherfehler und behält den Bestand im Speicher", async () => {
    const lade = vi.fn(() => Promise.resolve(vorhanden()));
    const speichere = vi.fn(() => Promise.reject(new Error("Schreiben fehlgeschlagen")));
    const zugriff = useBestand({ lade, speichere, heute: HEUTE });
    await zugriff.geladen;

    await zugriff.aendere(umbenennen("Neu"));

    expect(zugriff.zustand.value).toBe("fehler");
    expect(zugriff.fehlermeldung.value).toBe("Speichern fehlgeschlagen: Schreiben fehlgeschlagen");
    expect(zugriff.bestand.value?.stapel[0].name).toBe("Neu");
  });

  it("tut nach einem Ladefehler nichts und überschreibt die Datei nicht", async () => {
    const { lade, speichere } = attrappen(() => Promise.reject("Datei beschädigt: x"));
    const zugriff = useBestand({ lade, speichere, heute: HEUTE });
    await zugriff.geladen;

    await zugriff.aendere(umbenennen("Neu"));

    expect(zugriff.bestand.value).toBeNull();
    expect(speichere).not.toHaveBeenCalled();
  });

  it("tut vor dem Ende des Ladens nichts", async () => {
    const { lade, speichere } = attrappen(() => Promise.resolve(vorhanden()));
    const zugriff = useBestand({ lade, speichere, heute: HEUTE });

    await zugriff.aendere(umbenennen("Zu früh"));
    await zugriff.geladen;

    expect(zugriff.bestand.value).toEqual(vorhanden());
    expect(speichere).not.toHaveBeenCalled();
  });

  it("speichert schnelle Änderungen der Reihe nach, der letzte Stand zuletzt", async () => {
    const reihenfolge: string[] = [];
    const lade = vi.fn(() => Promise.resolve(vorhanden()));
    let aufruf = 0;
    const speichere = vi.fn(async (bestand: Datenbestand) => {
      aufruf += 1;
      // Das erste Speichern dauert länger als das zweite.
      const wartezeit = aufruf === 1 ? 20 : 0;
      await new Promise((fertig) => setTimeout(fertig, wartezeit));
      reihenfolge.push(bestand.stapel[0].name);
    });
    const zugriff = useBestand({ lade, speichere, heute: HEUTE });
    await zugriff.geladen;

    await Promise.all([zugriff.aendere(umbenennen("Erste")), zugriff.aendere(umbenennen("Zweite"))]);

    expect(reihenfolge).toEqual(["Erste", "Zweite"]);
  });
});
