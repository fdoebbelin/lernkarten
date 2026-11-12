---
title: Entwicklungsleitfaden herdr mit Claude Code und opencode
date: 2026-11-11
tags: [herdr, claude-code, opencode, git-worktree, leitfaden]
---

# Entwicklungsleitfaden: Projekte mit Claude Code und opencode in herdr

Die konkreten Aufgaben für dieses Projekt stehen im [[ARBEITSBLATT]]. Dieser Leitfaden beschreibt Einrichtung, Arbeitsweise, Konfliktüberwachung und Konfliktlösung. Stand: herdr 0.9.5.

## Zielbild

Jedes Projekt bekommt in herdr einen eigenen Workspace, jeder Agent darin einen eigenen Git-Worktree auf einem eigenen Branch. Claude Code und opencode schreiben damit nie in dasselbe Verzeichnis, und Konflikte entstehen nur an einer Stelle: beim Zusammenführen in den Integrationsbranch.

Die Seitenleiste von herdr zeigt für alle Projekte gleichzeitig, welcher Agent arbeitet, fertig ist oder auf eine Eingabe wartet.

Vorausgesetzt werden Git ab 2.38 (für `git merge-tree --write-tree`), installierte und angemeldete CLIs `claude` und `opencode` sowie ein Repository mit sauberem Hauptbranch.

## Installation und Grundeinrichtung

herdr ist ein einzelnes Binary mit stabilen Builds für Linux, macOS und Windows ([Install](https://herdr.dev/tui/docs/install/)).

Linux, Aktualisierung danach mit `herdr update`:

```bash
curl -fsSL https://herdr.dev/install.sh | sh
```

Linux, alternativ über einen Paketmanager, der dann auch aktualisiert: `mise use -g herdr` oder `brew install herdr`.

Windows, in der Eingabeaufforderung; nur x86_64-Build, auf Windows on ARM läuft er in der Emulation:

```bat
curl.exe -fsSLo install.cmd https://herdr.dev/install.cmd && install.cmd && del install.cmd
```

Die ausführliche Installation aller Werkzeuge beschreibt [[INSTALLATION]].

> [!warning] Windows
> Unter Windows ist die Auswahl an Integrationen kleiner, und Plugins laufen nur nach bestem Bemühen ([Windows support](https://herdr.dev/tui/docs/windows-beta/)). Ein Linux-Rechner ist die verlässlichere Basis.

Nach der Installation:

1. `herdr` starten. Das Programm startet einen Hintergrundserver oder verbindet sich mit dem laufenden.
2. Den Einrichtungsdialog durchlaufen. Er endet im Einstellungsreiter für Integrationen; dort `claude` und `opencode` installieren.
3. Die Beispielkonfiguration dieses Projekts übernehmen: `herdr/config.beispiel.toml` nach `~/.config/herdr/config.toml` (Windows: `%APPDATA%\herdr\config.toml`).
4. Nach jeder Änderung `herdr server reload-config` ausführen oder `ctrl+b`, dann `shift+r` drücken.

## Oberfläche einrichten

Die Oberfläche besteht aus drei Ebenen: Workspaces (in der Seitenleiste „Spaces“), darin Tabs, darin Panes. Alle Befehle beginnen mit dem Präfix `ctrl+b`; `ctrl+b ?` zeigt die aktiven Tasten.

### Aufbau je Projekt

| Ebene | Inhalt | Zweck |
| --- | --- | --- |
| Eltern-Workspace `<projekt>` | Haupt-Checkout auf `main` | Integration: Merges, Tests, Konfliktprüfung. Hier schreibt kein Agent. |
| Kind-Workspace `claude/<thema>` | Worktree mit Claude Code links, Shell rechts | Arbeitsbereich von Claude Code |
| Kind-Workspace `opencode/<thema>` | Worktree mit opencode links, Shell rechts | Arbeitsbereich von opencode |

herdr gruppiert Worktree-Workspaces in der Seitenleiste unter dem Workspace, aus dem sie erzeugt wurden. Mehrere Projekte stehen damit als Gruppen untereinander, jeweils mit Branch und Agentenstatus.

### Ein Projekt anlegen

1. In einer Shell ins Repository wechseln und `ctrl+b`, `shift+n` drücken: neuer Workspace, benannt nach dem Repo.
2. `ctrl+b`, `shift+g` drücken und als Branch `claude/<thema>` eingeben. herdr legt den Branch und den Checkout an und öffnet ihn als gruppierten Workspace.
3. Dort `claude` starten, mit `ctrl+b`, `v` eine Shell daneben öffnen.
4. Mit `ctrl+b`, `w` zum Eltern-Workspace zurück, Schritt 2 und 3 mit `opencode/<thema>` und `opencode` wiederholen.

Dasselbe erledigt in diesem Projekt ein Skript; es prüft den Branch-Namen und arbeitet auch ohne herdr:

```nu
nu scripts/worktree.nu claude/login
nu scripts/worktree.nu opencode/login-tests
```

Die Checkouts liegen unter `<worktrees.directory>/<repo>/<branch-slug>`.

### Konfiguration

Die vollständige Datei liegt in `herdr/config.beispiel.toml` ([Configuration](https://herdr.dev/tui/docs/configuration/), [Config reference](https://herdr.dev/docs/config-reference/)). Die wichtigsten Einstellungen:

| Einstellung | Wirkung |
| --- | --- |
| `terminal.default_shell = "nu"` | Neue Panes starten in Nushell |
| `worktrees.directory` | Ablageort der Worktrees |
| `ui.agent_panel_sort = "priority"` | Blockierte Agenten stehen oben |
| `ui.toast.delivery = "system"` | Desktop-Benachrichtigung bei „fertig“ und „wartet“ |
| `ui.sidebar.spaces.rows` mit `branch`, `git_status` | Branch und Vorsprung je Workspace |
| `keys.command` `prefix+alt+g` | lazygit im Popup |
| `keys.command` `prefix+alt+k` | Konfliktprüfung im Popup |

Benachrichtigungen kommen nur für Tabs im Hintergrund; `ctrl+b`, `o` springt zum Auslöser. Prüfen Sie mit `ctrl+b ?`, ob `prefix+a` und `prefix+shift+o` in Ihrer Version noch frei sind.

## Integrationen und Plugins

Notwendig sind nur die beiden Integrationen und der Agent-Skill; alles Weitere ist Komfort. herdr unterscheidet Integrationen (Anbindung eines Agenten) von Plugins (Erweiterungen der Oberfläche und der Abläufe).

### Notwendig

| Baustein | Installation | Wirkung |
| --- | --- | --- |
| [Integration Claude Code](https://herdr.dev/tui/docs/integrations/) | `herdr integration install claude` | Hook in `~/.claude`; meldet die Sitzung, damit herdr sie nach einem Serverneustart mit `claude --resume` fortsetzt. Der Status kommt aus der Bildschirmerkennung. |
| [Integration opencode](https://herdr.dev/tui/docs/integrations/) | `herdr integration install opencode` | Plugin in `~/.config/opencode/plugins/`; meldet Sitzung und Status. Verlangt opencode ab 1.18.29, das Konfigurationsverzeichnis muss existieren. |
| [herdr-Skill für Agenten](https://github.com/herdrdev/herdr) | `npx skills add ogulcancelik/herdr --skill herdr -g` | Bringt den Agenten die herdr-CLI bei: Panes teilen, den anderen Agenten starten, ihm eine Aufgabe schicken, auf sein Ergebnis warten. |

Nach jedem herdr-Update `herdr integration status --outdated-only` ausführen; veraltete Integrationen verhindern die Wiederherstellung der Sitzungen.

### Empfehlenswert

| Plugin | Installation | Nutzen |
| --- | --- | --- |
| [herdr-reviewr](https://github.com/persiyanov/herdr-reviewr/wiki) | `herdr plugin install persiyanov/herdr-reviewr` | Diff-Seitenleiste neben dem Agenten: Änderungen lesen, Zeilen kommentieren, Anmerkungen an den Agenten zurückgeben. |
| [herdr-plus](https://github.com/cloudmanic/herdr-plus/wiki) | `herdr plugin install cloudmanic/herdr-plus` | Projektliste mit festen Layouts; legt beim Anlegen eines Worktrees Tabs und Panes an. Verlangt herdr ab 0.7.0. |
| [herdr-worktree-setup](https://github.com/tdi/herdr-worktree-setup/releases) | `herdr plugin install tdi/herdr-worktree-setup --ref v0.3.0` | Führt in neuen Worktrees Einrichtungsschritte aus, hier `npm install`, und zeigt den Fortschritt in der Seitenleiste. |
| [herdr-quick-actions](https://github.com/enekos/herdr-quick-actions) | siehe Projektseite | Unscharfe Suche über alle herdr-Aktionen. |

Die Angaben zu den Community-Plugins stammen aus deren Projektbeschreibungen und sind nicht getestet.

> [!warning] Sicherheit
> Plugins laufen ungeschützt mit Ihren Benutzerrechten. Der Marktplatz ist ein automatischer Index öffentlicher GitHub-Repositories und keine Sicherheitsprüfung ([Plugin-Leitfaden](https://flaviocopes.com/herdr-plugins.md)). Vor der Installation den Quelltext ansehen, mit `--ref <tag>` eine geprüfte Version festlegen und bei der ersten Installation `--yes` weglassen.

## Projektstruktur

Drei Vereinbarungen im Repository machen die Zusammenarbeit berechenbar: feste Branch-Namen, eine gemeinsame Regeldatei und Übergabedateien.

### Branches und Worktrees

- `main` ist der Integrationsbranch. Dort wird nur zusammengeführt und getestet.
- Jeder Agent arbeitet auf `claude/<thema>` oder `opencode/<thema>` in seinem eigenen Worktree. Das Präfix zeigt in der Seitenleiste, wem ein Branch gehört, und das Prüfskript findet die Branches darüber.
- Alle Worktrees teilen sich ein Repository. Ein Commit des einen Agenten ist für den anderen sofort sichtbar, ohne Push oder Fetch.
- Ein Branch kann nur in einem Worktree ausgecheckt sein. Soll der zweite Agent auf der Arbeit des ersten aufbauen, bekommt er einen eigenen Branch mit dem fremden Branch als Basis.
- Nicht versionierte Dateien fehlen in einem neuen Worktree. In diesem Projekt heißt das: in jedem neuen Worktree einmal `npm install`.

### Gemeinsame Regeln

opencode liest `AGENTS.md`, Claude Code liest `CLAUDE.md`. Die Regeln stehen nur in `AGENTS.md`; `CLAUDE.md` bindet sie mit `@AGENTS.md` ein. Dort stehen auch die geteilten Dateien, die ein Agent nur mit ausdrücklichem Auftrag ändert.

### Projektlokale Skills

Die Skills liegen in `.claude/skills/`. Claude Code lädt sie von dort, opencode liest dasselbe Verzeichnis als kompatiblen Projektpfad ([opencode Skills](https://opencode.ai/docs/skills.md), [Claude Code Skills](https://code.claude.com/docs/en/skills.md)). Für opencode stehen zusätzlich gleichnamige Kommandos in `.opencode/commands/`, die den Skill laden und teils ein Modell festlegen.

| Skill | Aufruf in beiden Agenten | Zweck |
| --- | --- | --- |
| `uebergabe` | `/uebergabe` | Übergabedatei schreiben und committen |
| `uebernahme` | `/uebernahme <branch>` | Übergabe lesen, Plan vorlegen |
| `gegenlesen` | `/gegenlesen <branch>` | Fremden Branch prüfen, ohne zu ändern |
| `konfliktcheck` | `/konfliktcheck` | Konfliktprüfung ausführen und deuten |
| `rebase-main` | `/rebase-main` | Eigenen Branch auf `main` rebasen, Konflikte lösen |

Die Namen weichen bewusst von global installierten Skills wie `/handoff` und `/pickup` ab: Bei gleichem Namen hat in Claude Code der persönliche Skill Vorrang vor dem des Projekts.

Liest Ihre opencode-Version `.claude/skills/` nicht, kopieren Sie das Verzeichnis nach `.opencode/skills/`.

### Übergabedateien

Jeder Branch schreibt seine eigene Datei `uebergaben/<branch mit - statt />.md`. Eine gemeinsame `HANDOFF.md` würde beim Zusammenführen zweier Branches immer einen Konflikt erzeugen.

## Workflows zur wechselseitigen Entwicklung

| Muster | Wann | Konfliktrisiko |
| --- | --- | --- |
| A: Umsetzen und Prüfen | Eine Aufgabe, zweite Meinung erwünscht | gering, nur ein Agent schreibt |
| B: Parallel | Zwei klar getrennte Aufgaben | mittel, hängt vom Zuschnitt ab |
| C: Staffel | Ein Agent kommt nicht weiter oder das Kontingent ist erschöpft | gering, nacheinander |

### Muster A: Umsetzen und Prüfen

1. Agent 1 setzt die Aufgabe in seinem Branch um und schließt mit `/uebergabe`.
2. Agent 2 ruft in seinem eigenen Worktree `/gegenlesen <branch>` auf. Er liest den Diff gegen `main`, ohne den Branch auszuchecken.
3. Die Befundliste geht an Agent 1 zurück, von Hand, über herdr-reviewr oder per Befehl.
4. Agent 1 arbeitet die Befunde ab. Schritt 2 bis 4 wiederholen, bis kein Fehler mehr gemeldet wird.
5. Bei der nächsten Aufgabe die Rollen tauschen. So prüft jedes Modell die Arbeit des anderen.

### Muster B: Parallel

1. Die Aufgabe so teilen, dass sich die betroffenen Dateien nicht überschneiden.
2. Beiden Agenten im Auftrag ausdrücklich nennen, welche Dateien ihnen gehören.
3. Beide arbeiten gleichzeitig. Die Seitenleiste meldet, wer fertig ist oder wartet.
4. Vor dem Zusammenführen die Konfliktprüfung ausführen.
5. Den kleineren Branch zuerst nach `main` bringen, den zweiten darauf rebasen, dann zusammenführen.

### Muster C: Staffel

1. Agent 1 schließt mit `/uebergabe`.
2. Für Agent 2 einen Worktree auf Basis des fremden Branches anlegen:

```nu
nu scripts/worktree.nu opencode/login --basis claude/login
```

3. Agent 2 startet mit `/uebernahme claude/login` und arbeitet nach Freigabe des Plans weiter.
4. Am Ende wird nur der Branch von Agent 2 zusammengeführt; er enthält die Arbeit beider.

### Agenten per Befehl steuern

Mit der herdr-CLI lassen sich Aufträge zwischen den Panes verschicken, von Ihnen oder von einem Agenten mit installiertem herdr-Skill ([Agent automation](https://herdr.dev/tui/docs/agent-automation/), [Spickzettel](https://devhints.io/herdr-agents)):

```nu
herdr agent list                                   # Namen und Status aller Agenten
herdr agent rename <pane-id> pruefer               # sprechenden Namen vergeben
herdr agent prompt pruefer "/gegenlesen claude/login" --wait --timeout 600000
herdr agent read pruefer --source recent-unwrapped --lines 120
```

`--wait` kehrt zurück, sobald der Agent fertig ist oder eine Rückfrage hat. An einen blockierten Agenten sendet herdr nichts; erst dessen Rückfrage beantworten.

> [!warning] Nur an die laufende Sitzung
> Ein Agent, der den anderen beauftragen soll, darf dafür keinen eigenen Prozess starten, etwa `opencode run` im Hintergrund. In der Probe hat Claude Code genau das getan, als der Auftrag nur „gib das an opencode“ lautete. Der Hintergrundprozess war in herdr unsichtbar, konnte Rückfragen nicht stellen und hätte gleichzeitig mit der sichtbaren opencode-Sitzung in denselben Worktree schreiben können. Außerdem hat Claude den Auftrag als Datei auf `main` committet. `AGENTS.md` verbietet beides; im Auftrag an Claude trotzdem ausdrücklich `herdr agent prompt` und den Namen des Ziel-Agenten nennen.

## Konfliktüberwachung

herdr selbst erkennt keine Konflikte zwischen Branches; es zeigt nur Branch und Vorsprung je Workspace. Die Überwachung hat deshalb drei Ebenen.

| Ebene | Mittel | Zeigt |
| --- | --- | --- |
| Dauerhaft im Blick | Seitenleiste mit `branch` und `git_status` | Wie viele Commits ein Branch vor oder hinter seinem Gegenstück liegt |
| Bei jedem „fertig“ | herdr-reviewr oder lazygit im Popup | Was der Agent tatsächlich geändert hat, auch in geteilten Dateien |
| Vor jedem Zusammenführen | `scripts/konflikt-check.nu` | Mehrfach geänderte Dateien und echte Merge-Konflikte |

### Prüfskript

`nu scripts/konflikt-check.nu` führt für alle Branches mit dem Präfix `claude/` oder `opencode/` Probe-Merges aus: jeden gegen `main` und alle untereinander. Es nutzt `git merge-tree --write-tree`, das im Speicher rechnet und weder Arbeitsverzeichnis noch Branches verändert. Der Rückgabewert ist 1, wenn mindestens ein Probe-Merge einen Konflikt ergibt.

In herdr liegt die Prüfung auf `ctrl+b`, `alt+k`. Das Popup läuft im Verzeichnis des aktiven Panes und bleibt bis zum Tastendruck offen.

Beispielausgabe:

```text
Mehrfach geänderte Dateien:
╭───┬─────────────────────┬────────────────────────────────────╮
│ # │        datei        │              branches              │
├───┼─────────────────────┼────────────────────────────────────┤
│ 0 │ src/domain/typen.ts │ claude/notiz, opencode/schlagworte │
╰───┴─────────────────────┴────────────────────────────────────╯
Probe-Merges:
╭───┬──────────────────────────────────────┬──────────┬─────────────────────╮
│ # │                 paar                 │ konflikt │       dateien       │
├───┼──────────────────────────────────────┼──────────┼─────────────────────┤
│ 0 │ main <- claude/notiz                 │ false    │                     │
│ 1 │ main <- opencode/schlagworte         │ false    │                     │
│ 2 │ claude/notiz <- opencode/schlagworte │ true     │ src/domain/typen.ts │
╰───┴──────────────────────────────────────┴──────────┴─────────────────────╯
```

### Lesart der Ausgabe

- Eine mehrfach geänderte Datei ohne Konflikt ist eine Warnung: Git kann die Änderungen zusammenführen, inhaltlich passen sie nicht zwingend zusammen. Diese Dateien gezielt ansehen.
- Ein Konflikt zwischen den beiden Agenten-Branches bei konfliktfreiem `main` heißt: Der erste Merge geht glatt, der zweite Branch muss danach rebasen.
- Ein Konflikt gegen `main` heißt: `main` ist dem Branch davongelaufen. Der Branch rebased, bevor weitergearbeitet wird.

## Konfliktlösung

Konflikte löst immer der Agent, dem der Branch gehört, in seinem eigenen Worktree per Rebase auf `main`. Der Haupt-Checkout bleibt dadurch jederzeit sauber, und der Agent kennt die Absicht seiner eigenen Änderungen.

### Einmalige Git-Einstellungen

```nu
git config --global merge.conflictStyle zdiff3   # zeigt auch den gemeinsamen Ursprung
git config --global rerere.enabled true          # merkt sich gelöste Konflikte
git config --global merge.tool meld
```

### Ablauf

1. Im Eltern-Workspace den ersten Branch zusammenführen und testen: `git merge --no-ff --no-edit claude/login`. `--no-edit` übernimmt die vorgeschlagene Nachricht, statt einen Editor zu öffnen.
2. In den Workspace des zweiten Branches wechseln und `/rebase-main` aufrufen. Der Skill löst Konflikte so, dass die Absicht beider Seiten erhalten bleibt, führt die Tests aus und berichtet jede Entscheidung.
3. Den Bericht lesen und den Diff prüfen, in herdr-reviewr oder mit `git diff main...opencode/login-tests`.
4. Bei heiklen Stellen den anderen Agenten mit `/gegenlesen` prüfen lassen. Er kennt die Gegenseite des Konflikts.
5. Im Eltern-Workspace die Konfliktprüfung wiederholen, dann zusammenführen und testen.
6. Aufräumen: Agenten und laufende `tauri dev` im Kind-Workspace beenden, dann in der Seitenleiste `Delete worktree checkout...` wählen, danach `git branch -d <branch>`. herdr löscht nur den Checkout, nie den Branch. Unter Windows lässt sich ein Ordner nicht löschen, solange ein Programm darin läuft.

### Wenn der Agent sich verrennt

- `git rebase --abort` im Worktree stellt den Zustand vor dem Rebase wieder her.
- Einzelne Stellen selbst entscheiden: `git mergetool` öffnet Meld mit beiden Seiten und dem Ursprung.
- Ist ein Branch nach einem missglückten Rebase beschädigt, findet `git reflog` den letzten guten Stand.

### Konflikte vermeiden

- Aufgaben nach Dateien zuschneiden, nicht nach Themen.
- Kurze Branches: lieber dreimal am Tag zusammenführen als einmal in der Woche.
- Nach jedem Merge in `main` den noch laufenden Branch zeitnah rebasen lassen.
- Änderungen an geteilten Dateien nur einem Agenten zuweisen und in der Übergabe vermerken.

## Projekt auf GitHub

Die Vorlage liegt in einem GitHub-Repository. Gepflegt wird sie über Claude Code im Web, vorgeführt wird in einem lokalen Klon. Wie beides zusammenspielt und wie der Klon nach einer Vorführung zurückgesetzt wird, beschreibt [[GITHUB]].

## Spickzettel

Ausführlicher: [[spickzettel/claude-code]], [[spickzettel/opencode]], [[spickzettel/herdr]].


Alle Tasten folgen auf das Präfix `ctrl+b`. Die Zeilen mit Stern setzen `herdr/config.beispiel.toml` voraus.

| Taste | Aktion |
| --- | --- |
| `shift+n` | Neuer Workspace |
| `shift+g` | Neuer Worktree aus dem gewählten Workspace |
| `shift+o` * | Vorhandenen Worktree öffnen |
| `w` | Workspace-Auswahl |
| `g` | Sitzungsnavigator |
| `shift+1..9` * | Direkt zu Workspace 1 bis 9 |
| `a` * | Nächster Agent |
| `o` | Zum Auslöser der letzten Benachrichtigung |
| `c` / `n` / `p` | Neuer Tab / nächster / vorheriger |
| `v` / `-` | Pane nebeneinander / übereinander teilen |
| `h` `j` `k` `l` | Pane-Fokus wechseln |
| `z` | Pane vergrößern und zurück |
| `x` | Pane schließen |
| `b` | Seitenleiste ein- und ausklappen |
| `alt+g` * | lazygit im Popup |
| `alt+k` * | Konfliktprüfung im Popup |
| `shift+r` | Konfiguration neu laden |
| `q` | Trennen; die Agenten laufen weiter |
| `?` | Tastenhilfe |

| Befehl | Zweck |
| --- | --- |
| `nu scripts/worktree.nu <branch> [--basis <ref>]` | Worktree anlegen |
| `nu scripts/konflikt-check.nu` | Konfliktprüfung |
| `nu scripts/zuruecksetzen.nu` | Klon nach der Vorführung auf den Stand von GitHub zurücksetzen |
| `herdr worktree list` | Worktrees des Repositories |
| `herdr agent list` | Agenten mit Status |
| `herdr agent prompt <name> "<auftrag>" --wait` | Auftrag senden und auf das Ergebnis warten |
| `herdr agent read <name> --source recent-unwrapped --lines 120` | Ausgabe eines Agenten lesen |
| `herdr integration status --outdated-only` | Veraltete Integrationen finden |
| `herdr server reload-config` | Konfiguration neu laden |

## Quellen

- [herdr: Install](https://herdr.dev/tui/docs/install/)
- [herdr: Configuration](https://herdr.dev/tui/docs/configuration/)
- [herdr: Config reference](https://herdr.dev/docs/config-reference/)
- [herdr: Integrations](https://herdr.dev/tui/docs/integrations/)
- [herdr: Windows support](https://herdr.dev/tui/docs/windows-beta/)
- [Herdr agents cheatsheet (devhints)](https://devhints.io/herdr-agents)
- [A practical guide to Herdr plugins (Flavio Copes)](https://flaviocopes.com/herdr-plugins.md)
- [opencode: Skills](https://opencode.ai/docs/skills.md), [Commands](https://opencode.ai/docs/commands), [Config](https://opencode.ai/docs/config), [Zen](https://opencode.ai/docs/zen)
- [Claude Code: Skills](https://code.claude.com/docs/en/skills.md), [Model configuration](https://code.claude.com/docs/en/model-config.md)
