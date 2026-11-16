# Übergabe opencode/csv

- Datum: 2026-11-16
- Agent und Modell: opencode opencode/glm-5.3-flash-free
- Aufgabe: O1 CSV-Import und -Export aus docs/ARBEITSBLATT.md

## Stand

Fertig: `src/domain/csv.ts` mit `kartenZuCsv` (Kopfzeile `frage;antwort;fach;faelligAm`, Trennzeichen Semikolon, Felder mit Semikolon, Anführungszeichen oder Zeilenumbruch in Anführungszeichen, Anführungszeichen verdoppelt) und `csvZuKarten` (fehlendes fach und faelligAm ergibt Fach 1 und heute; Zeilen ohne Frage oder Antwort, fach außerhalb 1 bis 5 und ein nichtleeres faelligAm ohne gültiges ISO-Datum JJJJ-MM-TT sind Fehler mit Zeilennummer, die übrigen Zeilen werden übernommen; völlig leere Zeilen werden übersprungen; die Kopfzeile wird geprüft, ein führendes Byte-Order-Mark wird ignoriert; neue ids über `crypto.randomUUID()`). Der vorgegebene Rundreise-Test steht wörtlich unverändert in `src/domain/csv.test.ts` und läuft grün. Erwartete `zeile`-Nummer: Die Kopfzeile zählt als Zeile 1; Zeilenumbrüche innerhalb von Anführungszeichen zählen mit (LF, CRLF und einzelnes CR).

## Geänderte Dateien

- `src/domain/csv.ts`: neu; CSV-Export über `feld()` und CSV-Import über eine Zustandsmaschine in `leseDatensaetze()`, die Anführungszeichen, verdoppelte Anführungszeichen und Zeilenumbrüche in Feldern liest. Nach den Befunden des Gegenlesens: zählen Zeilenumbrüche innerhalb von Anführungszeichen bei der gemeldeten `zeile` mit (LF, CRLF und einzelnes CR), wird ein nichtleeres faelligAm mit `istIsoDatum()` auf Format und Kalenderdatum geprüft, werden völlig leere Zeilen ohne Fehler übersprungen und wird die erste Zeile als Kopfzeile geprüft (falsche Kopfzeile ergibt genau einen Fehler mit zeile 1 und keine Karten; führendes Byte-Order-Mark, Code 65279, wird entfernt).
- `src/domain/csv.test.ts`: neu; 21 Tests, darunter die im Auftrag verlangten Fälle Semikolon und Anführungszeichen im Feld, leere Datei, Zeile ohne Antwort, fach 0, fach 6 und der vorgegebene Rundreise-Test; dazu Zeilenumbruch im Feld, ergänzte Standardwerte, Zeile ohne Frage, neue ids, Kopfzeile allein, je Befund: zwei Tests zur Zeilenzählung nach einem Feld mit Zeilenumbruch (LF und CRLF), je zwei Tests zu faelligAm „kaputt“ und Kalendertag 2026-02-30, ein Test zur Leerzeile mitten in der Datei mit weiterlaufender Zählung und zwei Tests zur falschen Kopfzeile und zum Byte-Order-Mark.

## Geteilte Dateien

keine

## Tests

- `npm run test`: 2 Test Files passed, 30 Tests passed (21 davon in csv.test.ts)
- `npm run typen`: fehlerfrei (ein erster Lauf schlug an `replaceAll` gegen das alte lib-Target fehl; ersetzt durch `split`/`join`)
- `cargo test`: nicht betroffen

## Offen

- nichts

## Nächster Schritt

Erneutes Gegenlesen durch Claude Code (`/gegenlesen opencode/csv`), danach Zusammenführen wie in Abschnitt 5.9 des Arbeitsblatts.
