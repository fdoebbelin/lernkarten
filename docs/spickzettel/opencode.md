---
title: Spickzettel opencode
date: 2026-11-12
tags: [spickzettel, opencode]
---

# Spickzettel: opencode

Stand 12.11.2026. Es gibt zwei Versionslinien mit demselben Befehl `opencode`; `opencode --version` zeigt, welche installiert ist. Wo sich die Linien unterscheiden, steht es dabei. Siehe auch [[claude-code]] und [[herdr]].

Die Leader-Taste ist `Ctrl+X`: erst `Ctrl+X`, dann innerhalb von zwei Sekunden die zweite Taste.

## Starten

| Befehl | Wirkung |
| --- | --- |
| `opencode` | Oberfläche im aktuellen Ordner starten |
| `opencode pfad` | Oberfläche in einem anderen Ordner starten |
| `opencode run "Auftrag"` | Einmaliger Auftrag ohne Oberfläche |
| `opencode --model opencode/glm-5.3-flash-free` | Mit bestimmtem Modell starten (Linie 1) |
| `opencode -c` | Letzte Sitzung fortsetzen (Linie 1) |
| `opencode models` | Verfügbare Modelle auflisten |
| `opencode --version` | Version und damit Linie anzeigen |
| `opencode upgrade` | Aktualisieren |

## Tasten in der Sitzung

| Taste | Wirkung |
| --- | --- |
| `Enter` | Senden; während opencode arbeitet: nachsteuern (Linie 2) |
| `Shift+Enter` oder `Ctrl+J` | Neue Zeile |
| `Esc` | opencode unterbrechen |
| `Tab` | Agent wechseln, etwa zwischen build und plan (Linie 1) |
| `Shift+Tab` | Agent wechseln (Linie 2); in Linie 1 rückwärts |
| `Ctrl+P` | Befehlspalette |
| `Ctrl+T` | Variante oder Denkaufwand des Modells wechseln |
| `F2` | Zuletzt genutzte Modelle durchschalten (Linie 2) |
| `Ctrl+C` oder `Ctrl+D` | Beenden |
| `Bild auf` / `Bild ab` | Im Verlauf blättern |
| `Pos1` / `Ende` | Zum ersten oder letzten Beitrag |

## Leader-Tasten

| Tasten | Befehl | Wirkung |
| --- | --- | --- |
| `Ctrl+X` `N` | `/new` | Neue Sitzung |
| `Ctrl+X` `L` | `/sessions` | Frühere Sitzung öffnen |
| `Ctrl+X` `M` | `/models` | Modell wählen |
| `Ctrl+X` `A` | `/agents` | Agent wählen (Linie 2) |
| `Ctrl+X` `C` | `/compact` | Verlauf zusammenfassen |
| `Ctrl+X` `U` | `/undo` | Letzten Auftrag samt Änderungen zurücknehmen |
| `Ctrl+X` `R` | `/redo` | Zurückgenommenes wiederherstellen |
| `Ctrl+X` `E` | `/editor` | Eingabe im Editor bearbeiten |
| `Ctrl+X` `Y` | | Nachricht kopieren |
| `Ctrl+X` `X` | `/export` | Unterhaltung exportieren (Linie 1) |
| `Ctrl+X` `T` | `/themes` | Farbschema (Linie 1) |
| `Ctrl+X` `Q` | `/exit` | Beenden |

## Zeichen am Zeilenanfang

| Zeichen | Wirkung |
| --- | --- |
| `/` | Befehl, auch eigene Kommandos aus `.opencode/commands/` |
| `!` | Shell-Befehl ausführen; Ausgabe geht an opencode. `Esc` verlässt den Shell-Modus. |
| `@` | Datei suchen und anhängen; `@datei.ts#20-45` hängt nur die Zeilen 20 bis 45 an (Linie 2) |

## Weitere Befehle

| Befehl | Wirkung |
| --- | --- |
| `/connect` | Anbieter verbinden, falls die freien Modelle fehlen |
| `/init` | `AGENTS.md` für ein neues Projekt anlegen (Linie 1) |
| `/btw Frage` | Nebenfrage, Antwort in einem eigenen Fenster (Linie 2) |
| `/help` | Hilfe (Linie 1) |

## Agenten build und plan

In Linie 1 gibt es zwei eingebaute Agenten: build arbeitet mit allen Werkzeugen, plan liest und plant nur. `Tab` wechselt zwischen beiden. Für Linie 2 nennt die Dokumentation keine Namen; `/agents` zeigt, was vorhanden ist.

## Im Projekt Lernkarten

| Befehl | Wirkung | Modell |
| --- | --- | --- |
| `/uebergabe` | Übergabedatei schreiben und committen | Vorgabe |
| `/uebernahme branch` | Übergabe lesen, Plan vorlegen | Vorgabe |
| `/gegenlesen branch` | Fremden Branch prüfen, ohne zu ändern | `deepseek-v4.1-flash-free`, vom Kommando gesetzt |
| `/konfliktcheck` | Konfliktprüfung ausführen und deuten | `glm-5.3-flash-free`, vom Kommando gesetzt |
| `/rebase-main` | Eigenen Branch auf `main` rebasen | Vorgabe |

| Modell | Einsatz |
| --- | --- |
| `opencode/glm-5.3-flash-free` | Vorgabe in `opencode.json`: O1, O2, O5, O6 |
| `opencode/deepseek-v4.1-flash-free` | O3 parallel zu O2, Gegenlesen |
| `opencode/minimax-m3.1-flash-free` | Ausweichmodell, wenn ein anderes hängt oder entfällt |

Aufträge an opencode immer mit Funktionsnamen, Dateiliste und Testfällen. Erst Tests schreiben lassen, dann den Code.

Quellen: [TUI (Linie 1)](https://opencode.ai/en/docs/tui), [TUI (aktuell)](https://opencode.ai/docs/cli/tui/), [Keybinds (Linie 1)](https://opencode.ai/en/docs/keybinds), [Keybinds (Linie 2)](https://opencode.ai/v2/docs/cli/keybinds)

Die Startoptionen `--model` und `-c` sowie die Agenten build und plan stammen aus meinem Kenntnisstand zu Linie 1, nicht aus den Quellen.
