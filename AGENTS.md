# Lernkarten

Desktop-App für Lernkarten mit Lernkartei nach Leitner. Das Repository dient einer Vorführung:
Zwei Coding-Agenten, Claude Code und opencode, entwickeln die App in herdr gemeinsam weiter.
Diese Datei gilt für beide Agenten.

## Zwei Arten von Arbeit

| Art | Woran erkennbar | Es gilt |
| --- | --- | --- |
| Vorführung | Der Auftrag nennt eine Aufgabe aus `docs/ARBEITSBLATT.md`, etwa C1 oder O2 | Abschnitt „Vorführung“ |
| Pflege der Vorlage | Alle anderen Aufträge, etwa über Claude Code im Web | Abschnitt „Pflege der Vorlage“ |

## Technik

- Tauri 2, Vue 3, TypeScript, Vite; Tests mit Vitest und `cargo test`
- Frontend in `src/`, Rust-Backend in `src-tauri/`
- Daten: eine JSON-Datei `lernkarten.json` im App-Datenverzeichnis, Formatversion 1
- Node.js 22.12+, 24 oder ab 26; Rust ab 1.90

## Befehle

| Zweck | Befehl |
| --- | --- |
| Abhängigkeiten | `npm install` |
| Frontend-Tests | `npm run test` |
| Typprüfung | `npm run typen` |
| Frontend bauen | `npm run build` |
| App starten | `npm run tauri dev` |
| Rust-Tests | `cargo test --manifest-path src-tauri/Cargo.toml` |
| Konfliktprüfung | `nu scripts/konflikt-check.nu` |
| Voraussetzungen prüfen | `nu scripts/voraussetzungen.nu` |

## Aufbau

| Pfad | Inhalt |
| --- | --- |
| `src/domain/` | Datenmodell und Lernlogik, ohne Vue und ohne Tauri, vollständig getestet |
| `src/speicher/` | Aufrufe der Tauri-Befehle |
| `src/ansichten/` | Vue-Komponenten, eine Datei je Ansicht |
| `src-tauri/src/speicher.rs` | Laden und Speichern, ohne Tauri-Abhängigkeit, mit Tests |
| `src-tauri/src/lib.rs` | Tauri-Befehle `lade_bestand` und `speichere_bestand` |
| `scripts/` | Nushell-Skripte für Einrichtung, Worktrees, Konfliktprüfung, Rücksetzen |
| `uebergaben/` | Übergabedateien, eine je Branch; in der Vorlage nur die README |
| `docs/` | Installation, Arbeitsblatt, Entwicklungsleitfaden, GitHub, Spickzettel |

## Konventionen für Code

- Fachbegriffe, Bezeichner der Fachlogik und Kommentare sind deutsch: `Karte`, `Stapel`, `bewerte`, `lade_bestand`.
- Umlaute in Bezeichnern werden umschrieben: `faelligAm`, nicht `fälligAm`.
- Rust-Strukturen tragen `#[serde(rename_all = "camelCase")]`, damit JSON und TypeScript dieselben Feldnamen haben.
- Fachlogik gehört nach `src/domain/` und bekommt Tests. Komponenten enthalten keine Lernlogik.
- Datumswerte sind ISO-Zeichenketten `JJJJ-MM-TT`. Rechnen nur über `plusTage` aus `src/domain/leitner.ts`.
- Vue Router, falls er eingeführt wird, nur mit `createWebHashHistory`.
- Keine neuen Abhängigkeiten ohne ausdrücklichen Auftrag.

## Konventionen für die Dokumentation

Die Dokumente unter `docs/` werden in Obsidian gelesen.

- Deutsch, Obsidian-Markdown: YAML-Kopf mit `title`, `date`, `tags`; Hinweise als `> [!note]`, `> [!warning]` und so weiter; Verweise zwischen Dokumenten als Wikilink, etwa `[[ARBEITSBLATT]]`.
- Kein `|` in Tabellenzellen, auch nicht in Code. Obsidian zeigt sonst den maskierenden Backslash an. Befehle mit `|` stehen in einem eigenen Codeblock.
- Jeder Codeblock trägt die Shell als Kennung: `nu`, `powershell`, `bash`, `bat`. Unter Windows laufen `irm` und `iex` nur in PowerShell, nicht in Nushell.
- Versionen und Befehle von Fremdwerkzeugen tragen eine Stand-Angabe und eine Quelle. Nicht Geprüftes wird als solches gekennzeichnet.
- Ändert sich ein Wert, der in mehreren Dokumenten steht, etwa die Zahl der Tests oder eine Mindestversion, werden alle Stellen angepasst.

## Vorführung

### Zusammenarbeit der Agenten

- Arbeite nur in deinem eigenen Worktree und auf deinem eigenen Branch
  (`claude/<thema>` oder `opencode/<thema>`).
- In einem neuen Worktree fehlen die Abhängigkeiten: zuerst `npm install`.
- Ändere nur die Dateien, die dein Auftrag nennt. Brauchst du eine weitere, frage vorher.
- Wechsle nie den Branch, merge nie selbst nach `main`, pushe nicht.
- Auf `main` committest du nichts. Das gilt auch für Auftragsdateien, Notizen und Übergaben.
- Committe kleine, abgeschlossene Schritte mit deutscher, aussagekräftiger Nachricht.
- Vor dem Abschluss: Tests ausführen, Übergabe schreiben (Skill `uebergabe`), committen.
- Bei einem Rebase-Konflikt: Absicht beider Seiten erhalten, nichts stillschweigend
  verwerfen, unklare Stellen melden statt raten.

### Aufträge an den anderen Agenten

Beide Agenten laufen sichtbar in herdr, jeder in seinem Workspace. Aufträge gehen nur an
diese laufenden Sitzungen:

- Verwende `herdr agent list`, um den Namen des anderen Agenten zu finden.
- Sende mit `herdr agent prompt <name> "<auftrag>" --wait` und lies das Ergebnis mit
  `herdr agent read <name> --source recent-unwrapped --lines 120`.
- Starte keinen eigenen Prozess des anderen Agenten, weder `opencode run` noch `claude -p`.
  Ein solcher Prozess ist in herdr unsichtbar, kann Rückfragen nicht stellen und schreibt
  womöglich gleichzeitig mit der sichtbaren Sitzung in dieselben Dateien.
- Lege für einen Auftrag keine Datei an. Der Text des Auftrags steht im Befehl.
- Ist der andere Agent blockiert, weil er auf eine Antwort wartet, sende nichts und melde es.

### Arbeitsteilung

Claude Code läuft im Pro-Plan mit knappem Kontingent, opencode mit freien Modellen.

- Claude Code: Entwurf, Oberfläche, geteilte Dateien, Gegenlesen, Konfliktlösung.
- opencode: Fachlogik mit Tests nach genauer Vorgabe, mechanische Änderungen, Zweitmeinung.
- Arbeit von opencode wird vor dem Zusammenführen von Claude Code gegengelesen.

### Geteilte Dateien

Diese Dateien änderst du nur, wenn der Auftrag es ausdrücklich verlangt, und du nennst
jede Änderung daran in der Übergabe:

- `src/domain/typen.ts`
- `src/App.vue`, `src/stil.css`
- `package.json`, `package-lock.json`
- `src-tauri/Cargo.toml`, `src-tauri/Cargo.lock`, `src-tauri/tauri.conf.json`, `src-tauri/capabilities/`
- `AGENTS.md`, `CLAUDE.md`, `opencode.json`, `.claude/`, `.opencode/`

### Tests, die im Auftrag verlangt sind

Ein im Auftrag beschriebener Test muss unter einem Namen existieren, der den Zweck nennt,
etwa „Rundreise“. Ein vorgegebener Testtext wird unverändert übernommen; schlägt er fehl,
wird der Code angepasst, nicht der Test.

### Fertig heißt

1. `npm run test` und `npm run typen` laufen ohne Fehler.
2. Bei Änderungen in `src-tauri/`: `cargo test` läuft ohne Fehler.
3. Neue Fachlogik hat Tests, verlangte Tests sind vorhanden.
4. Die Übergabe unter `uebergaben/` ist aktuell und committet.

## Pflege der Vorlage

Die Vorlage ist der Startzustand der Vorführung. Wer sie pflegt, verbessert Dokumentation,
Skripte, Skills und Konfiguration, nicht die App.

- Setze keine Aufgabe aus dem Arbeitsblatt um. Die App bleibt im Startzustand: Sie zeigt die
  Beispielstapel an und kann sonst nichts. Fehlerbehebungen am vorhandenen Code sind erlaubt.
- Arbeite auf dem Branch, den die Sitzung vorgibt, committe, pushe ihn und öffne einen Pull
  Request gegen `main`. In der Vorführung gilt dagegen das Push-Verbot oben.
- `uebergaben/` enthält in der Vorlage nur die README.
- Nach Änderungen an Code oder Skripten: `npm run test`, `npm run typen` und, bei Rust,
  `cargo test` ausführen. Ändert sich die Zahl der Tests, die Erwartungswerte in
  `docs/ARBEITSBLATT.md` anpassen.
- Nushell-Skripte müssen mit Nushell 0.101 laufen, unter Linux und Windows.

## Skills

Die projektlokalen Skills liegen in `.claude/skills/` und gelten für beide Agenten:
`uebergabe`, `uebernahme`, `gegenlesen`, `konfliktcheck`, `rebase-main`.
Sie gehören zur Vorführung.
