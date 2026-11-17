---
title: Projekt Lernkarten auf GitHub
date: 2026-11-17
tags: [github, claude-code, gh, vorführung]
---

# Projekt Lernkarten auf GitHub

Das Repository `lernkarten` auf GitHub enthält die Vorlage: den Startzustand der App mit Dokumentation, Skripten, Skills und Konfiguration. Gepflegt wird die Vorlage über Claude Code im Web, vorgeführt wird in einem lokalen Klon, der mit `gh` synchron gehalten wird.

## Drei Rollen

| Ort | Zweck | Regel |
| --- | --- | --- |
| GitHub, Branch `main` | Die Vorlage im Startzustand | Ändert sich nur über Pull Requests |
| Claude Code im Web | Pflege der Vorlage: Dokumentation, Skripte, Skills, Fehlerbehebungen | Arbeitet auf eigenem Branch und öffnet einen Pull Request |
| Lokaler Klon mit herdr | Vorführung und Probe | Wird nie nach GitHub gepusht; nach der Vorführung zurückgesetzt |

Die App selbst wird nur in der Vorführung weiterentwickelt. Auf GitHub bleibt sie im Startzustand, damit jede Vorführung am selben Punkt beginnt. `AGENTS.md` sagt den Agenten das im Abschnitt „Pflege der Vorlage“.

## 1. Repository einmalig anlegen

Voraussetzung: Die Software aus [[INSTALLATION]] ist installiert, dazu die GitHub-CLI `gh`.

| System | Befehl |
| --- | --- |
| Windows | `scoop install gh` |
| CachyOS | `sudo pacman -S --needed github-cli` |

Bei GitHub anmelden und prüfen:

```nu
gh auth login
gh auth status
```

Dann das Archiv in einen neuen Ordner entpacken, nicht in den Ordner einer früheren Probe, und dort:

```nu
cd ~/Projects/lernkarten
nu scripts/voraussetzungen.nu
nu scripts/einrichten.nu
gh repo create lernkarten --private --source . --remote origin --push
```

| Schritt | Ergebnis |
| --- | --- |
| `einrichten.nu` | Git-Repository mit Branch `main` und dem Commit „Startzustand Lernkarten“, Abhängigkeiten, 9 bestandene Tests |
| `gh repo create` | Repository `lernkarten` in Ihrem GitHub-Konto, Remote `origin`, `main` hochgeladen |

`--private` macht das Repository privat. Soll es öffentlich sein, `--public` verwenden; die Sichtbarkeit lässt sich später unter „Settings“ ändern.

Prüfen:

```nu
gh repo view --web
git status
```

`git status` zeigt „Your branch is up to date with 'origin/main'“.

## 2. Claude Code im Web einrichten

1. claude.ai/code öffnen und das Repository `lernkarten` auswählen. Erscheint es nicht in der Liste, braucht die GitHub-App von Claude Zugriff auf das neue Repository; der Dialog bietet das an.
2. Den ersten Auftrag mit einem Hinweis auf die Art der Arbeit beginnen, etwa:

```text
Pflege der Vorlage: Ergänze im Spickzettel für herdr die Taste für den Kopiermodus
mit einem Beispiel. Halte dich an die Konventionen für die Dokumentation in AGENTS.md.
```

3. Claude arbeitet auf einem eigenen Branch, pusht ihn und öffnet einen Pull Request.

Claude Code im Web liest `CLAUDE.md`, `AGENTS.md` und `.claude/settings.json` aus dem Repository. Die Projekt-Skills wie `/uebergabe` gehören zur Vorführung und werden in der Pflege nicht gebraucht.

> [!warning] Grenzen der Web-Umgebung
> Die Tests mit `npm run test` kann Claude dort in der Regel ausführen, nachdem es `npm install` aufgerufen hat. Ob Rust und Nushell in der Web-Umgebung vorhanden sind, ist nicht geprüft. Fehlen sie, sagt Claude das; Änderungen an `src-tauri/` und an den Skripten dann lokal testen, bevor Sie den Pull Request zusammenführen.

## 3. Pull Requests prüfen und übernehmen

Im lokalen Klon, im Haupt-Checkout:

```nu
gh pr list
gh pr view 3
gh pr diff 3
```

Passt der Pull Request:

```nu
gh pr merge 3 --squash --delete-branch
```

`--squash` fasst die Commits des Pull Requests zu einem zusammen, `--delete-branch` löscht den Branch auf GitHub und lokal. Wollen Sie eine Änderung vorher lokal ausprobieren, `gh pr checkout 3`; danach mit `git switch main` zurück und den lokalen Branch mit `git branch -D <name>` löschen.

> [!warning] Branches aus dem Web vor der Vorführung löschen
> Claude Code im Web benennt seine Branches mit `claude/…`, genau wie die Branches der Vorführung. Ein lokal ausgecheckter Web-Branch erscheint deshalb in der Konfliktprüfung. Vor der Vorführung zeigt `git branch`, ob noch einer da ist.

## 4. Lokalen Klon synchronisieren

Vor jeder Probe und vor der Vorführung, im Haupt-Checkout auf `main`:

```nu
git switch main
gh repo sync
npm install
```

`gh repo sync` holt den Stand von GitHub und spult `main` vor. `npm install` ist nötig, falls ein Pull Request Abhängigkeiten geändert hat. Gleichwertig zu `gh repo sync` ist `git pull --ff-only`.

Meldet `gh repo sync`, dass es nicht vorspulen kann, liegen auf dem lokalen `main` noch Commits aus einer Probe, auch nach `nu scripts/runde.nu starten`. Dann zuerst zurücksetzen, Abschnitt 6.

Auf einem zweiten Rechner, etwa dem XPS, einmalig klonen:

```nu
cd ~/Projects
gh repo clone lernkarten
cd lernkarten
nu scripts/einrichten.nu
```

`einrichten.nu` erkennt das vorhandene Git-Repository und installiert nur die Abhängigkeiten.

## 5. Vorführung

Die Vorführung läuft vollständig lokal nach dem [[ARBEITSBLATT]]. Die Agenten mergen in den lokalen `main`; gepusht wird nichts. `AGENTS.md` verbietet den Agenten in der Vorführung das Pushen.

Ergebnis einer Probe aufheben, etwa um das fertige Zusammenspiel später zu zeigen:

```nu
git push origin main:probe/2026-11-12
```

Das legt auf GitHub einen Branch `probe/2026-11-12` mit dem Stand an, ohne `main` zu verändern. Die Konfliktprüfung beachtet nur Branches mit `claude/` und `opencode/` und lässt ihn in Ruhe.

Um einzelne Runden später erneut vorzuführen, die Startzustände der Runden als Tags sichern, vor dem Zurücksetzen:

```nu
nu scripts/runde.nu markieren
git push origin runde-1 runde-2 runde-3 runde-4 ende
```

Eine Runde startet dann mit `nu scripts/runde.nu starten <n> --daten` von ihrem Startzustand. Ablauf, Grenzen und Warnungen im [[ARBEITSBLATT]], Abschnitt 9.1. Nach Runde 2 bis 4 steht der lokale `main` vor GitHub: nie pushen, sondern mit `zuruecksetzen.nu` zurück zur Vorlage.

> [!warning] Den `main` einer Probe nie nach GitHub pushen
> Nach einer Probe enthält der lokale `main` die Merges der Agenten. Ein `git push` überträgt sie ohne Rückfrage in die Vorlage, und jeder neue Klon beginnt dann mit dieser Arbeit statt mit dem Startzustand. Ergebnisse nur als Branch `probe/…` oder als Tags sichern. `einrichten.nu` und `zuruecksetzen.nu` warnen, wenn `origin/main` Merges von `claude/…` oder `opencode/…` enthält; dann Abschnitt 7.

## 6. Nach der Vorführung zurücksetzen

1. In herdr alle Agenten beenden und die Workspaces der Worktrees schließen (`ctrl+b`, `shift+d`). Laufende `tauri dev` stoppen.
2. Im Haupt-Checkout:

```nu
nu scripts/zuruecksetzen.nu --daten
```

Das Skript zeigt zuerst, was es tun wird, und fragt nach:

| Schritt | Wirkung |
| --- | --- |
| Worktrees entfernen | Alle Worktrees auf Branches `claude/…` und `opencode/…` |
| Branches löschen | Alle lokalen Branches `claude/…` und `opencode/…` |
| `main` zurücksetzen | Hart auf `origin/main`; lokale Commits auf `main` gehen verloren |
| `--daten` | Löscht `lernkarten.json` im App-Datenverzeichnis, damit die App wieder mit den Beispielstapeln startet |

Danach ist der Klon im selben Zustand wie GitHub und bereit für die nächste Vorführung. Wer ein Ergebnis aufheben will, pusht es vorher nach Abschnitt 5. Tags lässt das Skript unverändert.

Enthält schon `origin/main` Merges aus einer Probe, warnt das Skript am Ende: Dann ist auch der zurückgesetzte Klon nicht im Startzustand. Weiter mit Abschnitt 7.

## 7. Probe versehentlich auf GitHub

So sieht es aus: Ein frischer Klon enthält schon Arbeit aus den Runden, etwa `src/domain/csv.ts` oder Dateien unter `uebergaben/` neben der README, und `einrichten.nu` oder `zuruecksetzen.nu` melden „origin/main enthält Merges von Agenten-Branches“. Ursache ist fast immer ein `git push` aus dem `main` einer Probe. Am 16.11.2026 lagen so die Merges von `opencode/csv` und `claude/persistenz` aus Runde 1 auf GitHub.

Bereinigt wird, indem `main` ohne die Merges der Probe neu aufgebaut und per Force-Push ersetzt wird. Die Pflege-Commits aus Pull Requests bleiben erhalten. Ein Revert per Pull Request reicht nicht: Die Merges blieben in der Geschichte von `main`, und `scripts/runde.nu markieren` würde sie bei jeder späteren Probe als Runde 1 mitzählen.

1. Im Haupt-Checkout den Stand holen und die Merges der Probe ansehen:

   ```nu
   git switch main
   git fetch origin
   git log --first-parent --oneline origin/main
   ```

   Den letzten Commit vor dem ersten Merge der Probe notieren, hier `<sauber>`, und die Merges der Probe, hier `<merge-1>` und `<merge-2>`.

2. Den Stand der Probe sichern, bevor er aus `main` verschwindet. `markieren` setzt `runde-1` auf `<sauber>` und die Tags der fertigen Runden auf die Merges:

   ```nu
   nu scripts/runde.nu markieren origin/main
   git push origin runde-1 runde-2
   ```

3. Die Pflege-Commits ohne die Arbeit der Agenten auflisten. `^2` ist jeweils der Agenten-Branch eines Merges:

   ```nu
   git log --oneline --no-merges --reverse <sauber>..origin/main --not <merge-1>^2 <merge-2>^2
   ```

4. Eine bereinigte Linie aufbauen und die Commits aus Schritt 3 in dieser Reihenfolge übernehmen:

   ```nu
   git switch -c bereinigt <sauber>
   git cherry-pick <commit-1> <commit-2> <commit-3>
   ```

5. Prüfen. Der erste Befehl zeigt nur Dateien der Probe, der zweite nichts, die Tests ergeben die Zahl des Startzustands:

   ```nu
   git diff --stat bereinigt origin/main
   git diff --stat <sauber> bereinigt -- src src-tauri uebergaben package.json
   npm run test
   ```

6. `main` auf GitHub ersetzen. `--force-with-lease` bricht ab, wenn `main` inzwischen weitergelaufen ist; `<alt>` ist der aktuelle Stand von `origin/main`:

   ```nu
   git push --force-with-lease=main:<alt> origin bereinigt:main
   ```

   Ist `main` auf GitHub geschützt, die Regel dafür kurz lockern.

7. Jeden Klon zurücksetzen, auch auf einem zweiten Rechner. Die Warnung am Ende darf nicht mehr erscheinen:

   ```nu
   nu scripts/zuruecksetzen.nu --daten
   git branch -D bereinigt
   ```

> [!tip] Vorbeugen
> Auf GitHub für `main` eine Schutzregel anlegen, unter „Settings“, „Branches“ oder „Rules“: Änderungen nur über Pull Requests, Force-Push gesperrt. Dann scheitert ein versehentliches `git push` aus einer Probe. Die Bezeichnungen der GitHub-Oberfläche sind nicht geprüft (Stand 17.11.2026).

## Ihre bisherige Probe

Der Ordner, in dem Sie bisher geprobt haben, ist kein Klon des GitHub-Repositorys. Legen Sie das Repository aus einem frisch entpackten Archiv an, wie in Abschnitt 1. Den alten Ordner können Sie behalten, um die Ergebnisse von Runde 1 nachzusehen, oder löschen.
