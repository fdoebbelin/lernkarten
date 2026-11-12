---
title: Installation der Software für das Projekt Lernkarten
date: 2026-11-12
tags: [installation, herdr, claude-code, opencode, tauri, voraussetzungen]
---

# Installation: Software vor dem Projektstart

Dieses Dokument beschreibt, welche Software vor dem ersten Schritt im [[ARBEITSBLATT]] installiert sein muss, und sagt zu jedem Baustein, wofür das Projekt ihn braucht. Beschrieben sind Windows mit Scoop und CachyOS; die Abweichungen für Fedora Sway Atomic stehen in einem eigenen Abschnitt.

> [!tip] Wo die Befehle laufen
> Befehle in Blöcken mit der Kennung `powershell` gehören in PowerShell, `bash` in eine Bash, `nu` in Nushell. Die Installationsbefehle mit `|` laufen in Nushell nicht, weil `irm` und `iex` PowerShell-Befehle sind.

> [!info] Stand
> Befehle und Versionen entsprechen dem 12.11.2026. Die Befehle stammen aus den verlinkten Anleitungen der Hersteller und sind hier nicht auf jedem System ausprobiert. Geprüft ist das Skript `scripts/voraussetzungen.nu` unter Linux.

## Überblick

| Software | Verlangt | Pflicht | Wofür im Projekt |
| --- | --- | --- | --- |
| Git | ab 2.38 | ja | Worktrees je Agent, Konfliktprüfung |
| Nushell | ab 0.101 | ja | Projektskripte unter `scripts/` |
| Node.js mit npm | 22.12+, 24 oder ab 26 | ja | Frontend, Tests, Tauri-CLI |
| Rust mit Cargo | ab 1.90 | ja | Backend der App |
| Systemvoraussetzungen für Tauri | je Betriebssystem | ja | Kompilieren und Fenster der App |
| Claude Code | aktuell, Pro-Plan | ja | Erster Coding-Agent |
| opencode | ab 1.18.29 | ja | Zweiter Coding-Agent mit freien Modellen |
| herdr | ab 0.9 | ja | Oberfläche für beide Agenten |
| lazygit | beliebig | nein | Diff-Ansicht im herdr-Popup |
| Meld | beliebig | nein | Konflikte von Hand lösen |

Reihenfolge: von oben nach unten. Die Agenten und herdr kommen zuletzt, weil sie die übrigen Werkzeuge aufrufen.

## 1. Git

> [!note] Bedeutung für das Projekt
> Jeder Agent arbeitet in einem eigenen Git-Worktree auf einem eigenen Branch. Die Konfliktprüfung nutzt `git merge-tree --write-tree`, das es erst ab Git 2.38 gibt. Unter Windows bringt Git außerdem Git Bash mit, das Claude Code für Shell-Befehle verwendet.

| System | Befehl |
| --- | --- |
| Windows | `scoop install git` |
| CachyOS | `sudo pacman -S --needed git` |

Einmalig einrichten. Ohne Name und E-Mail schlägt der erste Commit in `scripts/einrichten.nu` fehl:

```nu
git config --global user.name "Ihr Name"
git config --global user.email "ihre@adresse.example"
git config --global init.defaultBranch main
git config --global merge.conflictStyle zdiff3
git config --global rerere.enabled true
```

Prüfen: `git --version` zeigt 2.38 oder höher.

## 2. Nushell

> [!note] Bedeutung für das Projekt
> Die vier Projektskripte sind in Nushell geschrieben: `einrichten.nu`, `worktree.nu`, `konflikt-check.nu` und `voraussetzungen.nu`. Die herdr-Beispielkonfiguration startet neue Panes ebenfalls in Nushell.

| System | Befehl |
| --- | --- |
| Windows | `scoop install nu` |
| CachyOS | `sudo pacman -S --needed nushell` |

Prüfen: `nu --version` zeigt 0.101 oder höher. Mit dieser Version sind die Skripte getestet.

## 3. Node.js mit npm

> [!note] Bedeutung für das Projekt
> Node.js führt Vite (Entwicklungsserver und Build), Vitest (Tests), die Typprüfung und die Tauri-CLI aus. Vite 8 und Vitest 5 verlangen Node 22.12 oder neuer, 24 oder ab 26.

> [!warning] Nicht Node 21, 23 oder 25
> Mit einer unpassenden Version lässt npm die nativen Module stillschweigend weg. Die Installation meldet dann nur Warnungen (`EBADENGINE`), und `npm run test` bricht mit „Cannot find native binding“ ab.

| System | Befehl |
| --- | --- |
| Windows | `scoop install nodejs-lts` |
| CachyOS | `sudo pacman -S --needed nodejs-lts-krypton npm` |

Ist unter Windows schon ein anderes Node installiert, vorher `scoop uninstall nodejs`. Unter CachyOS geht auch das Paket `nodejs`, sofern die Version passt.

Prüfen: `node --version` zeigt v22.12 oder höher, v24 oder ab v26.

## 4. Rust mit Cargo

> [!note] Bedeutung für das Projekt
> Das Backend der App in `src-tauri/` ist Rust: die Tauri-Befehle `lade_bestand` und `speichere_bestand` sowie das Speichermodul mit seinen Tests. Tauri 2.12 verlangt Rust 1.90.

> [!warning] Nicht älter als 1.90
> Mit älterem Rust wählt Cargo stillschweigend Tauri 2.11. Das passt nicht zum npm-Paket `@tauri-apps/api` 2.12, und `tauri dev` meldet „version mismatched Tauri packages“. Im Projekt verhindert das die Angabe `rust-version = "1.90"` in `src-tauri/Cargo.toml`: Cargo bricht dann mit klarer Meldung ab.

| System | Befehl |
| --- | --- |
| Windows | `scoop install rustup`, danach `rustup default stable` |
| CachyOS | `sudo pacman -S --needed rustup`, danach `rustup default stable` |

Aktualisieren auf beiden Systemen: `rustup update stable`.

Prüfen: `rustc --version` und `cargo --version` zeigen 1.90 oder höher. Unter Windows zeigt `rustup show` zusätzlich die Zielplattform; sie muss auf `-msvc` enden.

## 5. Systemvoraussetzungen für Tauri

> [!note] Bedeutung für das Projekt
> Tauri kompiliert die App mit dem C-Compiler und Linker des Systems und zeigt die Oberfläche in der Webansicht des Systems: WebView2 unter Windows, WebKitGTK unter Linux. Fehlt etwas davon, scheitert `npm run tauri dev` beim Kompilieren oder das Fenster bleibt leer. Die Tests laufen auch ohne diese Pakete.

### Windows

1. [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) installieren und im Installer den Workload „Desktopentwicklung mit C++“ auswählen.
2. WebView2 ist ab Windows 10 Version 1803 und unter Windows 11 schon vorhanden.

Auf Windows on ARM braucht ein Rust-Ziel `aarch64-pc-windows-msvc` nach meinem Kenntnisstand zusätzlich die ARM64-Komponente der Build Tools („MSVC … ARM64/ARM64EC-Buildtools“ unter „Einzelne Komponenten“). Das ist nicht aus der Tauri-Anleitung belegt; meldet der Linker einen Fehler, dort nachsehen.

### CachyOS

```nu
sudo pacman -S --needed webkit2gtk-4.1 base-devel curl wget file openssl appmenu-gtk-module libappindicator-gtk3 librsvg xdotool
```

Prüfen auf beiden Systemen: Im Projektordner startet `npm run tauri dev` nach dem Kompilieren das Fenster „Lernkarten“.

## 6. Claude Code

> [!note] Bedeutung für das Projekt
> Claude Code ist der erste Coding-Agent. Im Projekt übernimmt er Entwurf, Oberfläche, geteilte Dateien, das Gegenlesen und die Konfliktlösung. Er liest `CLAUDE.md`, die Skills unter `.claude/skills/` und die Modellvorgabe in `.claude/settings.json`.

Windows, in PowerShell (nicht in Nushell):

```powershell
irm https://claude.ai/install.ps1 | iex
```

CachyOS:

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

Das Installationsprogramm legt `claude` nach `~/.local/bin`, unter Windows nach `%USERPROFILE%\.local\bin`. Steht dieser Ordner nicht im Pfad, meldet das Terminal danach, `claude` sei unbekannt. Dann den Ordner einmalig in den Pfad aufnehmen.

Windows, in PowerShell, dauerhaft für Ihr Benutzerkonto:

```powershell
$ziel = "$env:USERPROFILE\.local\bin"
$alt = [Environment]::GetEnvironmentVariable("Path", "User")
if (($alt -split ";") -notcontains $ziel) {
  [Environment]::SetEnvironmentVariable("Path", "$alt;$ziel", "User")
}
```

CachyOS mit Nushell, in `$nu.env-path` ergänzen:

```nu
$env.PATH = ($env.PATH | prepend ($env.HOME | path join ".local" "bin") | uniq)
```

Danach alle Terminals schließen und ein neues öffnen, unter Windows auch Windows Terminal und herdr neu starten. Nushell übernimmt den Windows-Pfad beim Start; ein Eintrag in der Nushell-Konfiguration ist dort nicht nötig.

Anmelden: `claude` starten und der Anmeldung im Browser folgen, mit dem Konto des Pro-Plans. Der kostenlose Plan von claude.ai enthält Claude Code nicht.

Prüfen:

- `claude --version` zeigt eine Versionsnummer.
- `claude doctor` meldet keine Fehler.
- In einer Sitzung zeigt `/usage` die Auslastung des Plans und `/model` die verfügbaren Modelle.

Die Installation aktualisiert sich selbst im Hintergrund. Findet Claude Code unter Windows Git Bash nicht, den Pfad in den Einstellungen als `CLAUDE_CODE_GIT_BASH_PATH` setzen.

## 7. opencode

> [!note] Bedeutung für das Projekt
> opencode ist der zweite Coding-Agent und läuft mit den freien Modellen von OpenCode Zen. Im Projekt schreibt er Fachlogik mit Tests nach genauer Vorgabe und liefert die Zweitmeinung beim Gegenlesen. Er liest `AGENTS.md`, `opencode.json`, die Kommandos unter `.opencode/commands/` und die Skills unter `.claude/skills/`.

> [!warning] Zwei Versionslinien
> Es gibt opencode 1 und opencode 2 mit demselben Befehl `opencode`. Scoop liefert Linie 1, das Arch-Paket und das neue Installationsskript liefern Linie 2. Nutzen Sie auf allen Rechnern dieselbe Linie. Die Projektdateien sind nach der aktuellen Dokumentation geschrieben; ich habe sie mit keiner der beiden Linien ausgeführt. Laut einer Übersicht heißen in Linie 2 einige Konfigurationsschlüssel anders.

| System | Linie 1 | Linie 2 |
| --- | --- | --- |
| Windows | `scoop install opencode` | eigenständiger Download von [opencode.ai](https://opencode.ai/docs/), auch für ARM64; Paketmanager werden nicht unterstützt |
| CachyOS | Installationsskript, siehe unten | `sudo pacman -S --needed opencode` |

Linie 1 unter CachyOS:

```bash
curl -fsSL https://opencode.ai/install | bash
```

Vor einem Wechsel der Linie die andere Installation entfernen.

Freie Modelle wählen: `opencode` starten, `/models` aufrufen und `glm-5.3-flash-free` suchen. Laut einem Testbericht sind die freien Modelle ohne Konto und ohne Schlüssel nutzbar; erscheinen sie nicht, hilft `/connect`.

Prüfen:

- `opencode --version` zeigt die Version und damit die Linie. Für die herdr-Integration ist mindestens 1.18.29 nötig.
- `opencode models` listet `opencode/glm-5.3-flash-free` und `opencode/deepseek-v4.1-flash-free`.

Aktualisieren: `opencode upgrade`, bei Installation über einen Paketmanager mit diesem.

## 8. herdr

> [!note] Bedeutung für das Projekt
> herdr ist die Oberfläche, in der beide Agenten nebeneinander laufen. Es legt je Agent einen Worktree als eigenen Workspace an, zeigt in der Seitenleiste, wer arbeitet, fertig ist oder wartet, und führt die Konfliktprüfung per Tastendruck aus. Die Agenten laufen auch ohne herdr; dann fehlen Überblick und Benachrichtigungen.

Windows, in PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -c "irm https://herdr.dev/install.ps1 | iex"
```

CachyOS:

```bash
curl -fsSL https://herdr.dev/install.sh | sh
```

Wird `herdr` danach nicht gefunden, gilt dasselbe wie bei Claude Code: Ordner in den Pfad aufnehmen, neues Terminal öffnen.

Für Windows gibt es nur einen x86_64-Build. Auf Windows on ARM läuft er in der Emulation, und laut Hersteller sind die Auswahl an Integrationen und die Plugin-Unterstützung eingeschränkt.

Einrichten, nachdem Claude Code und opencode installiert sind:

```nu
herdr integration install claude
herdr integration install opencode
```

Danach `herdr/config.beispiel.toml` aus dem Projekt übernehmen: nach `~/.config/herdr/config.toml`, unter Windows nach `%APPDATA%\herdr\config.toml`.

Prüfen:

- `herdr` startet die Oberfläche; `ctrl+b`, `q` trennt die Sitzung wieder.
- `herdr integration status --outdated-only` meldet nichts Veraltetes.

Aktualisieren: `herdr update`.

## 9. Terminal unter Windows

> [!note] Bedeutung für das Projekt
> herdr läuft in einem Terminal-Fenster und zeigt darin Seitenleiste, Panes und Agenten. Wie gut Tasten wie `Shift+Enter` oder `Alt+K` ankommen und wie scharf die Schrift ist, hängt vom Terminal ab.

Windows Terminal funktioniert, zeigt aber keine Kitty-Grafik. Als Alternative bietet sich Rio an: Es gibt einen nativen ARM64-Build, und unter Linux lässt sich dieselbe Konfiguration nutzen.

```powershell
winget install --id raphamorim.rio --exact --architecture arm64
```

Auf einem x64-Rechner `--architecture arm64` weglassen. herdr nennt Rio in seiner Windows-Dokumentation nicht; getestet hat herdr dort Windows Terminal, Alacritty und WezTerm.

### Unscharfe Schrift in Titelleiste und Tabs

Unschärfe bedeutet meist, dass Windows das Fenster als Bild hochskaliert.

1. Im Task-Manager, Reiter „Details“, die Spalte „Architektur“ einblenden. Bei `rio.exe` muss ARM64 stehen. Steht dort x64, Rio deinstallieren und mit dem Befehl oben neu installieren.
2. Ist Rio nativ und trotzdem unscharf: Rechtsklick auf `rio.exe`, „Eigenschaften“, Reiter „Kompatibilität“, „Hohe DPI-Einstellungen ändern“, „Überschreiben des Verhaltens bei hoher DPI-Skalierung“ anhaken und „Anwendung“ wählen. Rio neu starten und bei Bedarf die Schriftgröße in der Rio-Konfiguration erhöhen.

### Grenzen von herdr unter Windows

Unabhängig vom Terminal gilt laut herdr: Der Cursor kann flackern oder springen, das aktuelle Verzeichnis nach `cd` wird nur teilweise erkannt, Bilder aus der Zwischenablage lassen sich in lokalen Panes nicht an Agenten weitergeben, und es gibt weniger Integrationen als unter Linux. Auf Windows on ARM läuft herdr zudem nur als x86_64-Build in der Emulation.

Für die Vorführung ist deshalb ein Linux-Rechner die verlässlichere Bühne. Unter Windows ist WSL eine Alternative: Dort läuft der native aarch64-Build von herdr mit allen Funktionen, Node.js, Rust und die Agenten müssen dann aber ebenfalls in WSL installiert sein, und `tauri dev` baut eine Linux-App.

## 10. Optionale Werkzeuge

### lazygit

> [!note] Bedeutung für das Projekt
> Die herdr-Beispielkonfiguration öffnet lazygit mit `ctrl+b`, `alt+g` als Popup. Damit sehen Sie nach jedem „fertig“ eines Agenten, was er tatsächlich geändert hat. Ohne lazygit bleibt die Taste wirkungslos.

| System | Befehl |
| --- | --- |
| Windows | `scoop bucket add extras`, dann `scoop install lazygit` |
| CachyOS | `sudo pacman -S --needed lazygit` |

### Meld

> [!note] Bedeutung für das Projekt
> Meld zeigt bei einem Konflikt beide Seiten und den gemeinsamen Ursprung nebeneinander. Gebraucht wird es nur, wenn Sie eine Konfliktstelle selbst entscheiden wollen, statt sie dem Agenten zu überlassen.

| System | Befehl |
| --- | --- |
| Windows | `scoop install meld` (Bucket `extras`) |
| CachyOS | `flatpak install flathub org.gnome.meld` |

Als Werkzeug eintragen: `git config --global merge.tool meld`. Bei der Flatpak-Installation findet Git den Befehl `meld` nicht von selbst; dann braucht es ein kleines Startskript im Pfad.

### herdr-Skill für die Agenten

> [!note] Bedeutung für das Projekt
> Der Skill bringt den Agenten die herdr-Befehle bei. Damit kann ein Agent dem anderen selbst einen Auftrag schicken, etwa die Befunde aus dem Gegenlesen. Für die Vorführung des Zusammenspiels ist er empfohlen. Die Aufträge im Arbeitsblatt nennen die herdr-Befehle zusätzlich ausdrücklich, sodass sie auch ohne den Skill funktionieren.

```nu
npx skills add ogulcancelik/herdr --skill herdr -g
```

Der Befehl lädt Code aus einem fremden Repository; vorher den Inhalt ansehen.

## 11. Fedora Sway Atomic

> [!note] Bedeutung für das Projekt
> Auf einem unveränderlichen System gehören Compiler und Entwicklungsbibliotheken in einen Toolbx-Container. Die Agenten müssen dieselben Werkzeuge sehen wie Sie, sonst scheitern ihre Testläufe.

1. Container anlegen und betreten: `toolbox create lernkarten`, dann `toolbox enter lernkarten`.
2. Im Container die Systempakete installieren:

```nu
sudo dnf install git nushell nodejs npm webkit2gtk4.1-devel openssl-devel curl wget file libappindicator-gtk3-devel librsvg2-devel libxdo-devel
sudo dnf group install "c-development"
```

3. Rust im Container über rustup installieren: `curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh`.
4. Claude Code, opencode und herdr mit den Linux-Befehlen aus den Abschnitten 6 bis 8 installieren. Sie landen im Heimatverzeichnis und sind damit auch im Container sichtbar.
5. herdr im Container starten, damit die Agenten Node.js und Rust finden.

Vor dem ersten Start der App im Container `WEBKIT_DISABLE_DMABUF_RENDERER=1` setzen, sonst bleibt das Fenster mit der NVIDIA-Karte leer.

Ob das Fedora-Paket `nodejs` eine passende Version liefert, zeigt `node --version`. Schritt 5 ist nicht ausprobiert.

## 12. Gesamtprüfung

Im Projektordner prüft ein Skript alle Voraussetzungen auf einmal:

```nu
nu scripts/voraussetzungen.nu
```

Es zeigt je Software die verlangte und die gefundene Version und endet mit „Alle Pflichtvoraussetzungen sind erfüllt.“ Fehlt etwas, nennt es die betroffene Software und endet mit Rückgabewert 1.

Das Skript prüft nicht:

- die Systemvoraussetzungen für Tauri aus Abschnitt 5; das zeigt erst `npm run tauri dev`,
- die Anmeldung in Claude Code und die Verfügbarkeit der freien Modelle in opencode,
- die herdr-Version und die herdr-Integrationen.

Danach geht es im [[ARBEITSBLATT]] weiter. Wer das Projekt aus GitHub holt, liest vorher [[GITHUB]].

## 13. Bekannte Fehlerbilder

| Meldung | Ursache | Behebung |
| --- | --- | --- |
| `npm WARN EBADENGINE`, danach „Cannot find native binding“ bei `npm run test` | Node.js-Version passt nicht | Node 22.12+, 24 oder ab 26 installieren, `node_modules` löschen, `npm install` |
| „Found version mismatched Tauri packages … tauri (v2.11.x) : @tauri-apps/api (v2.12.x)“ | Rust älter als 1.90 | `rustup update stable`, in `src-tauri` `cargo update` |
| „rustc … is not supported by the following package“ | Rust älter als 1.90, mit der Angabe `rust-version` im Projekt | `rustup update stable` |
| Commit schlägt in `einrichten.nu` fehl: „Please tell me who you are“ | Git-Identität fehlt | `git config --global user.name` und `user.email` setzen |
| Fenster bleibt unter Linux leer | WebKitGTK mit NVIDIA | `WEBKIT_DISABLE_DMABUF_RENDERER=1` setzen |
| `claude` oder `herdr` wird nicht gefunden | `~/.local/bin` nicht im Pfad | Ordner in den Pfad aufnehmen (Abschnitt 6), neues Terminal öffnen |
| In Obsidian steht im Befehl ein Backslash vor dem senkrechten Strich | Befehl stand in einer Tabelle, dort muss der Strich maskiert werden | Befehl aus dem Codeblock kopieren; Befehle mit senkrechtem Strich nie in Tabellen setzen |
| `irm` oder `iex` unbekannt | Befehl in Nushell statt in PowerShell eingegeben | PowerShell öffnen und dort ausführen |
| Schrift in Titelleiste und Tabs unscharf | Terminal läuft emuliert oder wird von Windows skaliert | Abschnitt 9 |

## Quellen

- [Tauri: Prerequisites](https://v2.tauri.app/fr/start/prerequisites/)
- [Claude Code: Setup](https://code.claude.com/docs/en/setup.md)
- [opencode: Dokumentation](https://opencode.ai/docs/)
- [OpenCode CLI install: v1 and v2 commands (vibeide.dev)](https://vibeide.dev/blog/install-opencode/)
- [opencode's Free Models, Tested (Big Iron)](https://www.bigiron.cc/guides/opencodes-free-models-tested-big-pickle-the-zen-roster-and-a-local-fallback)
- [herdr: Install](https://herdr.dev/tui/docs/install/)
- [herdr: Windows support](https://herdr.dev/tui/docs/windows-beta/)
- [Rio auf winget (wingetly)](https://www.wingetly.io/apps/raphamorim/rio)

Die Paketnamen für Scoop und pacman bei Git, Nushell, Node.js, rustup, lazygit und Meld stammen aus meinem Kenntnisstand und nicht aus einer der Quellen.
