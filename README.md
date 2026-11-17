# Lernkarten

Desktop-App für Lernkarten mit Lernkartei nach Leitner, gebaut mit Tauri 2, Vue 3 und
TypeScript. Das Repository ist die Vorlage für eine Vorführung: Claude Code und opencode
entwickeln die App in herdr gemeinsam weiter, beauftragen und prüfen sich gegenseitig.

Die App ist hier im Startzustand. Sie zeigt zwei Beispielstapel an und kann sonst nichts;
Speichern, Lernen und Bearbeiten entstehen erst in der Vorführung.

## Schnellstart

```nu
gh repo clone lernkarten
cd lernkarten
nu scripts/voraussetzungen.nu   # prüft die installierte Software
nu scripts/einrichten.nu        # Abhängigkeiten, Tests; ohne Git-Repository auch git init
npm run tauri dev               # App starten
```

Voraussetzungen: Node.js 22.12 oder neuer, 24 oder ab 26 (nicht 21, 23 oder 25), Rust ab 1.90
mit den Tauri-Voraussetzungen, Git ab 2.38, Nushell, dazu Claude Code, opencode und herdr.
Einzelheiten in `docs/INSTALLATION.md`.

## Wo steht was

| Datei | Inhalt |
| --- | --- |
| `docs/INSTALLATION.md` | Benötigte Software, ihre Bedeutung für das Projekt, Installation, Fehlerbilder |
| `docs/ARBEITSBLATT.md` | Ablauf der Vorführung in vier Runden, Schritt für Schritt |
| `docs/ENTWICKLUNGSLEITFADEN.md` | herdr einrichten, Workflows, Konfliktüberwachung und -lösung |
| `docs/GITHUB.md` | Pflege über Claude Code im Web, lokaler Klon mit `gh`, Rücksetzen nach der Vorführung |
| `docs/spickzettel/` | Spickzettel für Claude Code, opencode und herdr |
| `AGENTS.md` | Regeln für beide Agenten, getrennt nach Vorführung und Pflege der Vorlage |
| `CLAUDE.md` | Bindet `AGENTS.md` ein, dazu Hinweise nur für Claude Code |
| `.claude/skills/` | Projektlokale Skills, gelesen von Claude Code und opencode |
| `.opencode/commands/` | Gleichnamige Kommandos für opencode, teils mit festem Modell |
| `.claude/settings.json`, `opencode.json` | Modellvorgabe und Rechte je Agent |
| `herdr/config.beispiel.toml` | herdr-Konfiguration zum Übernehmen |
| `scripts/` | `voraussetzungen.nu`, `einrichten.nu`, `worktree.nu`, `konflikt-check.nu`, `zuruecksetzen.nu`, `runde.nu` |
| `uebergaben/` | Übergabedateien, eine je Branch; in der Vorlage leer |

## Änderungen an der Vorlage

Änderungen an Dokumentation, Skripten und Konfiguration laufen über Claude Code im Web und
Pull Requests gegen `main`. Der lokale Klon wird mit `gh repo sync` nachgezogen und nach einer
Vorführung mit `nu scripts/zuruecksetzen.nu --daten` zurückgesetzt. Ablauf in `docs/GITHUB.md`.

Einzelne Runden lassen sich wiederholen: `nu scripts/runde.nu markieren` hält nach einer Probe
die Startzustände als Tags fest, `nu scripts/runde.nu starten <n>` stellt einen davon wieder her.
Ablauf in `docs/ARBEITSBLATT.md`, Abschnitt 9.1.

## Geprüft und nicht geprüft

Geprüft beim Erstellen der Vorlage: `npm run test` (9 Tests), `npm run typen`, `npm run build`,
die Tests des Rust-Moduls `speicher.rs` (5 Tests) und alle Nushell-Skripte mit Nushell 0.101
und Git 2.43 unter Linux. In einer Probe unter Windows on ARM liefen Einrichtung, Tests,
`npm run tauri dev` und Runde 1 bis zur Konfliktprüfung.

`scripts/runde.nu` ist mit Nushell 0.101 unter Linux an einer nachgestellten Probe geprüft,
seit dem 17.11.2026 einschließlich `runde-1` und `starten 1 --vorlage`:
Markieren, auch aus dem Reflog, Versetzen mit `--erneuern`, Liste, Neustart der Runden 1 und 4
samt `--daten` und die Fehlerfälle.

Nicht geprüft: der herdr-Zweig von `scripts/worktree.nu`, die Aufträge über `herdr agent prompt`,
die Runden 2 bis 4, `scripts/zuruecksetzen.nu` und `scripts/runde.nu` unter Windows und die
Rückfragen von `runde.nu` im Terminal. Die Modellwahl ist auf Claude
Code im Pro-Plan (`sonnet`, `haiku`) und auf die freien Modelle von OpenCode Zen ausgelegt
(Stand 12.11.2026); die freien Modelle sind befristet, `opencode models` zeigt den aktuellen Bestand.
