---
title: Spickzettel Claude Code
date: 2026-11-12
tags: [spickzettel, claude-code]
---

# Spickzettel: Claude Code

Stand 12.11.2026. Unter Windows gilt `Alt`, wo macOS `Option` nutzt. Siehe auch [[opencode]] und [[herdr]].

## Starten

| Befehl | Wirkung |
| --- | --- |
| `claude` | Sitzung im aktuellen Ordner starten |
| `claude "Auftrag"` | Sitzung mit erstem Auftrag starten |
| `claude -c` | Letzte Sitzung in diesem Ordner fortsetzen |
| `claude -r name` | Sitzung nach Name oder ID fortsetzen; ohne Name Auswahlliste |
| `claude -n name` | Sitzung mit Namen starten |
| `claude --model haiku` | Modell für diese Sitzung: `sonnet`, `haiku`, `opus` |
| `claude --effort high` | Denkaufwand für diese Sitzung: `low`, `medium`, `high` … |
| `claude --permission-mode plan` | Direkt im Planmodus starten |
| `claude -p "Frage"` | Einmalige Antwort ohne Sitzung, danach Ende |
| `claude -v` | Version anzeigen |
| `claude doctor` | Installation und Einstellungen prüfen |
| `claude update` | Sofort aktualisieren |

## Tasten in der Sitzung

| Taste | Wirkung |
| --- | --- |
| `Enter` | Senden |
| `Shift+Enter` oder `\` + `Enter` | Neue Zeile |
| `Esc` | Claude unterbrechen; die bisherige Arbeit bleibt |
| `Esc` `Esc` | Bei Text: Eingabe leeren. Bei leerer Eingabe: Zurückspulen-Menü |
| `Shift+Tab` | Modus wechseln: Manuell, Änderungen annehmen, Planmodus |
| `Alt+M` | Wie `Shift+Tab`, falls das unter Windows nicht reagiert |
| `Alt+P` | Modell wechseln, ohne die Eingabe zu verlieren |
| `Ctrl+C` | Unterbrechen; bei leerer Eingabe zweimal: beenden |
| `Ctrl+D` | Beenden (zweimal) |
| `Ctrl+R` | Frühere Eingaben durchsuchen |
| `Ctrl+O` | Ausführliche Ansicht der Werkzeugaufrufe |
| `Ctrl+T` | Aufgabenliste von Claude ein- und ausblenden |
| `Ctrl+G` | Eingabe im Editor bearbeiten, etwa in Helix über `$EDITOR` |
| `Ctrl+S` | Eingabe beiseitelegen und später zurückholen |
| `Alt+V` | Bild aus der Zwischenablage einfügen (Windows) |
| `Ctrl+L` | Bildschirm neu zeichnen |
| `?` | Tastenhilfe, bei leerer Eingabe |

> [!warning] In herdr
> herdr nutzt `Ctrl+B` als Präfix. Das Claude-Kürzel `Ctrl+B` (Befehl in den Hintergrund schicken) erreicht Claude Code darum nicht direkt. Ob zweimaliges Drücken es durchreicht, ist nicht geprüft.

## Zeichen am Zeilenanfang

| Zeichen | Wirkung |
| --- | --- |
| `/` | Befehl oder Skill |
| `!` | Shell-Befehl direkt ausführen; Ausgabe geht an Claude |
| `@` | Datei auswählen und in den Auftrag aufnehmen |

## Modi

| Modus | Verhalten | Einsatz im Projekt |
| --- | --- | --- |
| Manuell | Fragt vor jeder Änderung und jedem Befehl | Normalfall |
| Änderungen annehmen | Schreibt Dateien ohne Rückfrage, fragt bei Befehlen | Nach freigegebenem Plan |
| Planmodus | Liest und plant nur, ändert nichts | C1 und größere Aufgaben |

## Befehle

### Kontext und Kontingent

| Befehl | Wirkung |
| --- | --- |
| `/clear` | Neue Unterhaltung mit leerem Kontext. Nach jeder Aufgabe. |
| `/compact Hinweis` | Verlauf zusammenfassen, Hinweis sagt, was bleiben soll |
| `/context` | Belegung des Kontexts anzeigen |
| `/usage` | Auslastung des Pro-Plans, Sitzungs- und Wochenlimit |
| `/btw Frage` | Nebenfrage, die nicht in den Verlauf eingeht |

### Modell und Verhalten

| Befehl | Wirkung |
| --- | --- |
| `/model` | Modell wählen; Pfeil links und rechts ändert den Aufwand |
| `/effort high` | Denkaufwand setzen: `low`, `medium`, `high` |
| `/plan Auftrag` | Planmodus einschalten und gleich mit dem Auftrag beginnen |
| `/permissions` | Erlaubte und verbotene Befehle verwalten |
| `/config` | Einstellungen |

### Sitzungen und Änderungen

| Befehl | Wirkung |
| --- | --- |
| `/rename name` | Sitzung benennen |
| `/resume` | Frühere Sitzung öffnen |
| `/rewind` | Unterhaltung und Code auf einen früheren Stand zurücksetzen |
| `/diff` | Änderungen im Arbeitsverzeichnis ansehen |
| `/copy` | Letzte Antwort in die Zwischenablage |
| `/export datei.md` | Unterhaltung als Text speichern |

### Projekt und Werkzeuge

| Befehl | Wirkung |
| --- | --- |
| `/init` | `CLAUDE.md` für ein neues Projekt anlegen |
| `/memory` | `CLAUDE.md` bearbeiten |
| `/skills` | Verfügbare Skills auflisten |
| `/mcp` | MCP-Server verwalten |
| `/status` | Version, Modell, Konto |
| `/doctor` | Einrichtung prüfen und Korrekturen vorschlagen |
| `/help` | Hilfe |
| `/exit` | Beenden |

## Im Projekt Lernkarten

| Befehl | Wirkung |
| --- | --- |
| `/uebergabe` | Übergabedatei unter `uebergaben/` schreiben und committen |
| `/uebernahme branch` | Übergabe eines Branches lesen, Plan vorlegen |
| `/gegenlesen branch` | Fremden Branch prüfen, ohne zu ändern |
| `/konfliktcheck` | Konfliktprüfung ausführen und deuten |
| `/rebase-main` | Eigenen Branch auf `main` rebasen, Konflikte lösen |

| Aufgabe | Einstellung |
| --- | --- |
| Entwurf über mehrere Dateien (C1) | `sonnet`, `/effort high`, Planmodus |
| Umsetzung, Rebase (C3, C5) | `sonnet`, `/effort medium` (Vorgabe) |
| Gegenlesen (C2) | `sonnet`, `/effort high` |
| Kleine mechanische Änderung (C4) | `claude --model haiku` |

Leitstand: eine Claude-Code-Sitzung im Workspace `lernkarten` auf `main`, die prüft und Aufträge mit `herdr agent prompt` an die anderen Agenten schickt. Sie startet keinen eigenen opencode-Prozess und committet nichts.

Kontingent schonen: nach jeder Aufgabe `/clear`, Aufträge konkret halten, `/usage` im Blick behalten.

Quellen: [Interactive mode](https://code.claude.com/docs/en/interactive-mode.md), [Commands](https://code.claude.com/docs/en/commands.md), [CLI reference](https://code.claude.com/docs/en/cli-reference.md)
