---
title: Spickzettel herdr
date: 2026-11-12
tags: [spickzettel, herdr]
---

# Spickzettel: herdr

Stand 12.11.2026, herdr 0.9.5. Alle Tasten folgen auf das Präfix `Ctrl+B`: erst `Ctrl+B`, dann die Taste. Zeilen mit Stern setzen `herdr/config.beispiel.toml` aus dem Projekt voraus. Siehe auch [[claude-code]] und [[opencode]].

## Aufbau

| Ebene | Inhalt | Im Projekt |
| --- | --- | --- |
| Workspace | Ein Arbeitsbereich, in der Seitenleiste „Spaces“ | `lernkarten` auf `main`, darunter je Agent ein Worktree |
| Tab | Reiter innerhalb eines Workspace | meist einer |
| Pane | Geteilter Bereich innerhalb eines Tabs | Agent links, Shell rechts |

## Workspaces und Worktrees

| Taste | Wirkung |
| --- | --- |
| `Shift+N` | Neuer Workspace, benannt nach dem Ordner |
| `Shift+G` | Neuer Worktree aus dem gewählten Workspace |
| `Shift+O` * | Vorhandenen Worktree öffnen |
| `W` | Workspace-Auswahl |
| `G` | Sitzungsnavigator |
| `Shift+1` … `Shift+9` * | Direkt zu Workspace 1 bis 9 |
| `Shift+W` | Workspace umbenennen |
| `Shift+D` | Workspace schließen |

Worktree löschen: in der Seitenleiste am Workspace „Delete worktree checkout...“ wählen. herdr löscht nur den Ordner, den Branch danach mit `git branch -d name` entfernen.

## Tabs

| Taste | Wirkung |
| --- | --- |
| `C` | Neuer Tab |
| `N` / `P` | Nächster / vorheriger Tab |
| `1` … `9` | Direkt zu Tab 1 bis 9 |
| `Shift+T` | Tab umbenennen |
| `Shift+X` | Tab schließen |

## Panes

| Taste | Wirkung |
| --- | --- |
| `V` | Nebeneinander teilen |
| `-` | Übereinander teilen |
| `H` `J` `K` `L` | Fokus nach links, unten, oben, rechts |
| `Tab` / `Shift+Tab` | Nächstes / vorheriges Pane |
| `Shift+H` `J` `K` `L` | Pane mit dem Nachbarn tauschen |
| `Z` | Pane vergrößern und zurück |
| `R` | Größenmodus |
| `Shift+P` | Pane umbenennen |
| `X` | Pane schließen |

## Agenten und Benachrichtigungen

| Taste | Wirkung |
| --- | --- |
| `O` | Zum Auslöser der letzten Benachrichtigung |
| `A` * | Nächster Agent |
| `B` | Seitenleiste ein- und ausklappen |

Status in der Seitenleiste: blockiert (wartet auf Eingabe oder Freigabe), fertig (noch nicht angesehen), arbeitet. Mit `agent_panel_sort = "priority"` stehen blockierte Agenten oben.

## Werkzeuge

| Taste | Wirkung |
| --- | --- |
| `Alt+G` * | lazygit im Popup |
| `Alt+K` * | Konfliktprüfung im Popup |
| `[` | Kopiermodus mit der Tastatur |
| `E` | Verlauf des Panes im Editor öffnen |
| `Ctrl+V` | Bild aus der Zwischenablage an eine entfernte Sitzung senden (ohne Präfix) |

## Sitzung und Einstellungen

| Taste | Wirkung |
| --- | --- |
| `Q` | Trennen; die Agenten laufen weiter. Erneut `herdr` verbindet wieder. |
| `S` | Einstellungen |
| `Shift+R` | Konfiguration neu laden |
| `?` | Tastenhilfe |

## Befehle in der Shell

| Befehl | Wirkung |
| --- | --- |
| `herdr` | Starten oder mit dem laufenden Server verbinden |
| `herdr update` | Aktualisieren |
| `herdr server reload-config` | Konfiguration neu laden; `"status":"applied"` heißt übernommen |
| `herdr integration install claude` | Integration für Claude Code |
| `herdr integration install opencode` | Integration für opencode |
| `herdr integration status --outdated-only` | Veraltete Integrationen finden |
| `herdr worktree create --branch name --base main` | Worktree anlegen und als Workspace öffnen |
| `herdr worktree list` | Worktrees des Repositories |
| `herdr agent list` | Alle Agenten mit Status |
| `herdr agent rename pane-id name` | Agent benennen |
| `herdr agent prompt name "Auftrag" --wait` | Auftrag senden, auf Ergebnis warten |
| `herdr agent read name --source recent-unwrapped --lines 120` | Ausgabe eines Agenten lesen |
| `herdr plugin list` | Installierte Plugins |

## Im Projekt Lernkarten

| Schritt | Taste oder Befehl |
| --- | --- |
| Agenten anzeigen und benennen | `herdr agent list`, dann `herdr agent rename pane-id leitstand` |
| Auftrag an einen Agenten schicken | `herdr agent prompt claude-ansichten "Auftrag" --wait` |
| Worktree für einen Agenten anlegen | `nu scripts/worktree.nu claude/thema` oder `Shift+G` |
| Zwischen den Workspaces wechseln | `W` |
| Agent meldet sich | `O` |
| Änderungen eines Agenten ansehen | `Alt+G` * |
| Vor dem Zusammenführen prüfen | `Alt+K` * |
| Feierabend, Agenten laufen weiter | `Q` |

Quellen: [Config reference](https://herdr.dev/docs/config-reference/), [Install](https://herdr.dev/tui/docs/install/), [Herdr agents cheatsheet (devhints)](https://devhints.io/herdr-agents)
