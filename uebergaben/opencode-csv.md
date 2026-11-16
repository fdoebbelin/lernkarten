# Übergabe opencode/csv

- Datum: 2026-11-16
- Agent und Modell: opencode opencode/glm-5.3-flash-free
- Aufgabe: O1 CSV-Import und -Export aus docs/ARBEITSBLATT.md

## Stand

Fertig: `src/domain/csv.ts` mit `kartenZuCsv` (Kopfzeile `frage;antwort;fach;faelligAm`, Trennzeichen Semikolon, Felder mit Semikolon, Anführungszeichen oder Zeilenumbruch in Anführungszeichen, Anführungszeichen verdoppelt) und `csvZuKarten` (fehlendes fach und faelligAm ergibt Fach 1 und heute; Zeilen ohne Frage oder Antwort und fach außerhalb 1 bis 5 sind Fehler mit Zeilennummer, die übrigen Zeilen werden übernommen; neue ids über `crypto.randomUUID()`). Der vorgegebene Rundreise-Test steht wörtlich unverändert in `src/domain/csv.test.ts` und läuft grün. Erwartete `zeile`-Nummer: Die Kopfzeile zählt als Zeile 1.

## Geänderte Dateien

- `src/domain/csv.ts`: neu; CSV-Export über `feld()` und CSV-Import über eine Zustandsmaschine in `leseDatensaetze()`, die Anführungszeichen, verdoppelte Anführungszeichen und Zeilenumbrüche in Feldern liest.
- `src/domain/csv.test.ts`: neu; 14 Tests, darunter die im Auftrag verlangten Fälle Semikolon und Anführungszeichen im Feld, leere Datei, Zeile ohne Antwort, fach 0, fach 6 und der vorgegebene Rundreise-Test; dazu Zeilenumbruch im Feld, ergänzte Standarwerte, Zeile ohne Frage, neue ids und Kopfzeile allein.

## Geteilte Dateien

keine

## Tests

- `npm run test`: 2 Test Files passed, 23 Tests passed (14 davon in csv.test.ts)
- `npm run typen`: fehlerfrei (ein erster Lauf schlug an `replaceAll` gegen das alte lib-Target fehl; ersetzt durch `split`/`join`)
- `cargo test`: nicht betroffen

## Offen

- nichts

## Nächster Schritt

Gegenlesen durch Claude Code (`/gegenlesen opencode/csv`), danach Zusammenführen wie in Abschnitt 5.9 des Arbeitsblatts.
