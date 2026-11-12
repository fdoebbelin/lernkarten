import { describe, expect, it } from "vitest";
import { bewerte, faelligeKarten, heuteIso, istFaellig, plusTage } from "./leitner";
import type { Karte, Stapel } from "./typen";

function karte(fach: number, faelligAm: string): Karte {
  return { id: "k1", frage: "Frage", antwort: "Antwort", fach, faelligAm };
}

describe("plusTage", () => {
  it("geht über Monats- und Jahresgrenzen", () => {
    expect(plusTage("2026-11-30", 1)).toBe("2026-12-01");
    expect(plusTage("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("verliert an der Zeitumstellung keinen Tag", () => {
    expect(plusTage("2026-10-24", 2)).toBe("2026-10-26");
  });
});

describe("bewerte", () => {
  it("schiebt eine gewusste Karte ein Fach weiter", () => {
    const neu = bewerte(karte(1, "2026-11-11"), true, "2026-11-11");
    expect(neu.fach).toBe(2);
    expect(neu.faelligAm).toBe("2026-11-13");
  });

  it("lässt eine gewusste Karte im letzten Fach", () => {
    const neu = bewerte(karte(5, "2026-11-11"), true, "2026-11-11");
    expect(neu.fach).toBe(5);
    expect(neu.faelligAm).toBe("2026-12-11");
  });

  it("legt eine nicht gewusste Karte zurück in Fach 1", () => {
    const neu = bewerte(karte(4, "2026-11-11"), false, "2026-11-11");
    expect(neu.fach).toBe(1);
    expect(neu.faelligAm).toBe("2026-11-12");
  });

  it("verändert die übergebene Karte nicht", () => {
    const alt = karte(2, "2026-11-11");
    bewerte(alt, true, "2026-11-11");
    expect(alt.fach).toBe(2);
  });
});

describe("Fälligkeit", () => {
  it("zählt heute und früher als fällig", () => {
    expect(istFaellig(karte(1, "2026-11-11"), "2026-11-11")).toBe(true);
    expect(istFaellig(karte(1, "2026-11-10"), "2026-11-11")).toBe(true);
    expect(istFaellig(karte(1, "2026-11-12"), "2026-11-11")).toBe(false);
  });

  it("filtert die fälligen Karten eines Stapels", () => {
    const stapel: Stapel = {
      id: "s1",
      name: "Test",
      karten: [karte(1, "2026-11-01"), karte(3, "2026-12-01")],
    };
    expect(faelligeKarten(stapel, "2026-11-11")).toHaveLength(1);
  });
});

describe("heuteIso", () => {
  it("formatiert in Ortszeit mit führenden Nullen", () => {
    expect(heuteIso(new Date(2026, 0, 5, 23, 30))).toBe("2026-01-05");
  });
});
