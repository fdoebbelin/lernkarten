# Übergabe claude/persistenz

- Datum: 2026-11-16
- Agent und Modell: claude sonnet (Sonnet 5.5, Aufwand high, Planmodus)
- Aufgabe: C1 Speichern anbinden

## Stand

`useBestand()` in `src/speicher/bestand.ts` lädt den Bestand beim Start, übernimmt bei leerem Bestand den
Beispielbestand und speichert ihn sofort, bietet `aendere()` mit Speichern nach jeder Änderung und stellt
die Zustände `laden`, `bereit`, `fehler` samt Fehlermeldung bereit. `src/App.vue` nutzt das Composable und
zeigt Lade- und Fehlerzustand.

## Geänderte Dateien

- `src/speicher/bestand.ts`: neu. Lade- und Speicherfunktion kommen als Parameter (Vorgabe: `ladeBestand`,
  `speichereBestand`). Der Bestand liegt in einem `shallowRef` und wird nur als Ganzes ersetzt; Speichern
  läuft über eine Promise-Kette in Reihenfolge und mit einer Kopie (`structuredClone`). Bei einem Ladefehler
  wird nichts gespeichert, `aendere()` ist dann wirkungslos, die beschädigte Datei bleibt erhalten.
  Fehler von Tauri kommen als Zeichenkette an und werden so wie `Error` behandelt.
- `src/speicher/bestand.test.ts`: neu, 12 Tests ohne Tauri (Start, leerer Bestand, Lade- und Speicherfehler
  als `Error` und als Zeichenkette, Reihenfolge, Kopie ohne Proxy, Schutz nach Ladefehler).
- `src/speicher/befehle.ts`: nur der veraltete Kommentar „Noch nicht angebunden" ersetzt.

## Geteilte Dateien

- `src/App.vue` (laut Auftrag erlaubt): Der Beispielbestand im Speicher ist ersetzt durch
  `useBestand({ heute })`. Das Template zeigt „Lade Lernkarten …" im Zustand `laden`, die Fehlermeldung
  (`role="alert"`) im Zustand `fehler`, sonst die `StapelListe`. Kein neues CSS.

Alle anderen geteilten Dateien (`typen.ts`, `stil.css`, `package.json`, `src-tauri/` und so weiter) sind unverändert.

## Tests

- `npm run test`: 2 Dateien, 21 Tests bestanden (9 bisher, 12 neu)
- `npm run typen`: ohne Fehler
- `cargo test`: nicht betroffen, `src-tauri/` unverändert; nicht ausgeführt

## Offen

- Von Hand nicht geprüft: Start mit `npm run tauri dev` und die Abnahme 5.5 (Datei `lernkarten.json` entsteht,
  beschädigte Datei zeigt „Datei beschädigt").
- Ein Speicherfehler setzt den Gesamtzustand auf `fehler`; die App zeigt dann nur die Meldung, der Bestand
  bleibt im Speicher. `aendere()` wird in der App noch nicht benutzt (kommt mit späteren Aufgaben).

## Nächster Schritt

Abnahme C1 nach Arbeitsblatt 5.5 durchführen, dann `/gegenlesen` und Zusammenführen.
