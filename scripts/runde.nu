# Startzustände der Runden als Git-Tags: aus einer Probe setzen, auflisten, eine Runde neu starten.
# Aufruf im Haupt-Checkout:
#   nu scripts/runde.nu markieren [stand]          Tags aus den Merges einer Probe setzen
#   nu scripts/runde.nu liste                      vorhandene Tags zeigen
#   nu scripts/runde.nu starten <n> [--daten]      Klon zurücksetzen, main auf den Start von Runde n
#
# Runde 1 beginnt immer mit dem Stand von GitHub (origin/main) und braucht kein Tag.
# Die übrigen Startzustände entstehen erst in einer Probe: Der letzte Merge einer Runde
# in main ist der Start der nächsten.

# Welche Branches zu welcher Runde gehören und welches Tag ihr letzter Merge erhält.
def marken [] {
  [
    {tag: "runde-2", abschnitt: "6", bedeutung: "Start Runde 2, nach C1 und O1", branches: ["claude/persistenz", "opencode/csv"]}
    {tag: "runde-3", abschnitt: "7", bedeutung: "Start Runde 3, nach O2, O3 und C3", branches: ["opencode/sitzung", "opencode/bearbeiten", "claude/ansichten"]}
    {tag: "runde-4", abschnitt: "8", bedeutung: "Start Runde 4, nach C4 und O5", branches: ["claude/notiz", "opencode/schlagworte"]}
    {tag: "ende", abschnitt: "9", bedeutung: "Ende Runde 4, nach C5 und O6", branches: ["claude/statistik", "opencode/statistik"]}
  ]
}

# Bricht ab, wenn das Skript nicht im Haupt-Checkout läuft.
def pruefe-haupt-checkout [] {
  let gemeinsam = (git rev-parse --path-format=absolute --git-common-dir | str trim)
  let eigenes = (git rev-parse --path-format=absolute --git-dir | str trim)
  if $gemeinsam != $eigenes {
    error make {msg: "Bitte im Haupt-Checkout ausführen, nicht in einem Worktree."}
  }
}

# Commit, auf den eine Referenz zeigt, oder null.
def commit-von [ref: string] {
  let r = (do { git rev-parse --verify --quiet $"($ref)^{commit}" } | complete)
  if $r.exit_code == 0 { $r.stdout | str trim } else { null }
}

# Ob origin/main im Tag enthalten ist; sonst ist die Vorlage seit der Probe weitergelaufen.
def enthaelt-vorlage [tag: string] {
  if (commit-von "origin/main") == null { return "unbekannt" }
  let r = (do { git merge-base --is-ancestor origin/main $tag } | complete)
  if $r.exit_code == 0 { "ja" } else { "nein" }
}

def main [] {
  print "Aufruf:"
  print "  nu scripts/runde.nu markieren [stand] [--ja] [--erneuern]"
  print "  nu scripts/runde.nu liste"
  print "  nu scripts/runde.nu starten <runde> [--ja] [--daten]"
  print "Einzelheiten: docs/ARBEITSBLATT.md, Abschnitt 9.1."
}

# Setzt die Tags runde-2, runde-3, runde-4 und ende auf die Merges einer Probe.
def "main markieren" [
  stand: string = "main"  # Stand der Probe, etwa main oder ein Hash aus git reflog main
  --ja                    # ohne Rückfrage ausführen
  --erneuern              # vorhandene Tags auf einen anderen Commit versetzen
] {
  if (commit-von $stand) == null {
    error make {msg: $"Unbekannter Stand: ($stand)"}
  }

  let merges = (git log --first-parent --merges --format="%H%x09%h%x09%ad%x09%s" --date=short $stand
    | lines
    | split column "\t" voll kurz datum betreff
    | each {|m|
        let treffer = ($m.betreff | parse --regex "Merge branch '(?P<branch>[^']+)'")
        $m | insert branch (if ($treffer | is-empty) { "" } else { $treffer.0.branch })
      })

  # git log liefert die neuesten Merges zuerst; der erste Treffer ist der letzte Merge der Runde.
  let plan = (marken | each {|r|
    let treffer = ($merges | where {|m| $m.branch in $r.branches })
    if ($treffer | is-empty) {
      {tag: $r.tag, commit: "", datum: "", merge: "nicht gefunden", bisher: "", bedeutung: $r.bedeutung, voll: ""}
    } else {
      let m = ($treffer | first)
      let alt = (commit-von $"refs/tags/($r.tag)")
      let bisher = (if $alt == null { "neu" } else if $alt == $m.voll { "unverändert" } else { "zeigt woanders hin" })
      {tag: $r.tag, commit: $m.kurz, datum: $m.datum, merge: $m.branch, bisher: $bisher, bedeutung: $r.bedeutung, voll: $m.voll}
    }
  })

  print $"Merges in ($stand), zugeordnet zu den Runden:"
  print ($plan | select tag commit datum merge bisher)

  let zu_setzen = ($plan | where {|p| $p.bisher == "neu" or ($p.bisher == "zeigt woanders hin" and $erneuern) })
  let gesperrt = ($plan | where bisher == "zeigt woanders hin")
  if ($gesperrt | is-not-empty) and not $erneuern {
    print $"Diese Tags zeigen schon auf einen anderen Commit und bleiben: ($gesperrt.tag | str join ', '). Versetzen mit --erneuern."
  }
  if ($zu_setzen | is-empty) {
    print "Nichts zu tun."
    return
  }

  if not $ja {
    let antwort = (input $"Tags setzen: ($zu_setzen.tag | str join ', ')? \(ja/nein\) ")
    if $antwort != "ja" {
      print "Abgebrochen, nichts geändert."
      return
    }
  }

  for p in $zu_setzen {
    git tag --annotate --force $p.tag $p.voll -m $"($p.bedeutung). Probe vom ($p.datum)."
  }

  let namen = ($zu_setzen.tag | str join " ")
  print $"Gesetzt: ($namen)"
  print "Auf GitHub sichern; main bleibt dabei unverändert:"
  if $erneuern and ($gesperrt | is-not-empty) {
    print $"  git push --force origin ($namen)"
  } else {
    print $"  git push origin ($namen)"
  }
}

# Zeigt die Tags der Runden mit Commit, Datum und ob sie den aktuellen Stand der Vorlage enthalten.
def "main liste" [] {
  let tags = (marken | get tag | append ["konflikt-notiz", "konflikt-schlagworte"])
  let zeilen = ($tags | each {|t|
    let c = (commit-von $"refs/tags/($t)")
    if $c == null { null } else {
      {
        tag: $t,
        commit: (git rev-parse --short $c | str trim),
        datum: (git log -1 --format=%ad --date=short $c | str trim),
        betreff: (git log -1 --format=%s $c | str trim),
        "enthält Vorlage": (enthaelt-vorlage $t),
      }
    }
  } | compact)

  if ($zeilen | is-empty) {
    print "Keine Tags der Runden vorhanden. Holen mit: git fetch origin --tags"
    print "Setzen nach einer Probe mit: nu scripts/runde.nu markieren"
    return
  }
  print $zeilen
  if ($zeilen | any {|z| $z."enthält Vorlage" == "nein" }) {
    print "„nein“: Die Vorlage auf GitHub hat sich seit der Probe geändert. Ein Neustart dort nutzt die alte Fassung von Doku, Skills und Skripten."
  }
}

# Setzt den Klon zurück und stellt main auf den Startzustand einer Runde.
def "main starten" [
  runde: int  # 1 bis 4
  --ja        # ohne Rückfrage ausführen
  --daten     # zusätzlich lernkarten.json im App-Datenverzeichnis löschen
] {
  if $runde < 1 or $runde > 4 {
    error make {msg: "Runde muss 1, 2, 3 oder 4 sein."}
  }
  pruefe-haupt-checkout
  let wurzel = (git rev-parse --show-toplevel | str trim)

  # Ein lokal versetztes, noch nicht gepushtes Tag lässt git fetch --tags scheitern;
  # dann gilt das lokale Tag, und es geht trotzdem weiter.
  print "Hole den Stand von GitHub mit allen Tags ..."
  let abruf = (do { git fetch origin --tags } | complete)
  if $abruf.exit_code != 0 {
    print $"Hinweis: git fetch --tags meldet ($abruf.stderr | str trim)"
  }

  let tag = (if $runde == 1 { "origin/main" } else { $"runde-($runde)" })
  if (commit-von $tag) == null {
    error make {msg: $"Tag ($tag) fehlt, auch auf GitHub. Erst eine Probe durchlaufen und mit nu scripts/runde.nu markieren setzen."}
  }
  let abschnitt = ($runde + 4)

  print $"Startzustand Runde ($runde): ($tag) = (git log -1 --format='%h %ad %s' --date=short $tag | str trim)"
  if $runde > 1 and (enthaelt-vorlage $tag) == "nein" {
    print "Achtung: Die Vorlage auf GitHub ist neuer als dieses Tag. Doku, Skills und Skripte stammen aus der Probe."
  }
  print "Ablauf: erst scripts/zuruecksetzen.nu, dann main auf diesen Stand."

  if not $ja {
    let antwort = (input "Fortfahren? (ja/nein) ")
    if $antwort != "ja" {
      print "Abgebrochen, nichts geändert."
      return
    }
  }

  let argumente = (if $daten { ["--ja", "--daten"] } else { ["--ja"] })
  let r = (do { ^$nu.current-exe ($wurzel | path join "scripts" "zuruecksetzen.nu") ...$argumente } | complete)
  print $r.stdout
  if $r.exit_code != 0 {
    print $r.stderr
    error make {msg: "zuruecksetzen.nu ist fehlgeschlagen; main wurde nicht versetzt."}
  }

  if $runde > 1 {
    git reset --hard $tag
    let vorsprung = (git rev-list --count origin/main..main | str trim)
    print ""
    print $"main steht auf ($tag), ($vorsprung) Commits vor origin/main."
    print "Diesen Stand nie pushen: git push würde ihn ohne Rückfrage zur Vorlage machen."
    print "Zurück zum Stand von GitHub: nu scripts/zuruecksetzen.nu"
  }
  print $"Weiter mit npm install und im Arbeitsblatt bei Abschnitt ($abschnitt)."
}
