# Setzt den lokalen Klon nach einer Vorführung auf den Startzustand zurück.
# Entfernt alle Worktrees und Branches mit Präfix claude/ oder opencode/ und setzt main
# hart auf den Stand von GitHub (origin/main). Lokale Commits auf main gehen dabei verloren.
#
# Aufruf im Haupt-Checkout: nu scripts/zuruecksetzen.nu [--ja] [--daten]
# Vorher in herdr die Workspaces der Worktrees schließen und alle Agenten beenden.

# Merges von Agenten-Branches auf der Hauptlinie eines Stands. Die Vorlage darf keine enthalten:
# Sie entstehen nur in einer Probe und gehören nie nach GitHub. Gleiche Funktion in einrichten.nu.
def probe-merges [stand: string] {
  let r = (do { git log --first-parent --merges --format="%h%x09%ad%x09%s" --date=short $stand } | complete)
  if $r.exit_code != 0 { return [] }
  $r.stdout | lines | split column "\t" commit datum betreff
  | where {|m| $m.betreff =~ "^Merge branch '(claude|opencode)/" }
}

def main [
  --ja      # ohne Rückfrage ausführen
  --daten   # zusätzlich lernkarten.json im App-Datenverzeichnis löschen
] {
  let wurzel = (git rev-parse --show-toplevel | str trim)
  let aktuell = (git rev-parse --path-format=absolute --git-common-dir | str trim)
  let eigenes = (git rev-parse --path-format=absolute --git-dir | str trim)
  if $aktuell != $eigenes {
    error make {msg: "Bitte im Haupt-Checkout ausführen, nicht in einem Worktree."}
  }

  let hat_remote = ((git remote | lines) | any {|r| $r == "origin" })
  if not $hat_remote {
    error make {msg: "Kein Remote origin vorhanden. Rücksetzen braucht den Stand auf GitHub."}
  }

  # Worktrees der Agenten aus der Ausgabe von git worktree list --porcelain lesen
  let worktrees = (git worktree list --porcelain
    | split row "\n\n"
    | where {|b| $b | str contains "branch refs/heads/" }
    | each {|b|
        let zeilen = ($b | lines)
        {
          pfad: ($zeilen | where {|z| $z starts-with "worktree " } | first | str substring 9..),
          branch: ($zeilen | where {|z| $z starts-with "branch " } | first | str replace "branch refs/heads/" ""),
        }
      }
    | where {|w| $w.branch =~ '^(claude|opencode)/' })

  let branches = (git branch --format "%(refname:short)" | lines
    | where {|b| $b =~ '^(claude|opencode)/' })

  let lokale_commits = (do { git rev-list --count origin/main..main } | complete)

  print "Das Skript wird:"
  if ($worktrees | is-empty) { print "  keine Worktrees entfernen" } else {
    print "  diese Worktrees entfernen:"
    print ($worktrees | select branch pfad)
  }
  if ($branches | is-empty) { print "  keine Branches löschen" } else {
    print $"  diese Branches löschen: ($branches | str join ', ')"
  }
  print "  Änderungen von GitHub holen und main hart auf origin/main setzen"
  if $lokale_commits.exit_code == 0 and ($lokale_commits.stdout | str trim) != "0" {
    print $"  dabei ($lokale_commits.stdout | str trim) lokale Commits auf main verwerfen"
  }
  if $daten { print "  lernkarten.json im App-Datenverzeichnis löschen" }

  if not $ja {
    let antwort = (input "Fortfahren? (ja/nein) ")
    if $antwort != "ja" {
      print "Abgebrochen, nichts geändert."
      return
    }
  }

  for w in $worktrees {
    git worktree remove --force $w.pfad
  }
  git worktree prune
  for b in $branches {
    git branch -D $b
  }

  git switch main
  git fetch origin
  git reset --hard origin/main

  if $daten {
    let ordner = (if $nu.os-info.name == "windows" {
      $env.APPDATA | path join "de.metarow.lernkarten"
    } else {
      $env.HOME | path join ".local" "share" "de.metarow.lernkarten"
    })
    let datei = ($ordner | path join "lernkarten.json")
    if ($datei | path exists) {
      rm $datei
      print $"Gelöscht: ($datei)"
    } else {
      print $"Keine Datendatei gefunden: ($datei)"
    }
  }

  print $"Zurückgesetzt auf origin/main in ($wurzel)."

  # Zurücksetzen hilft nichts, wenn schon die Vorlage auf GitHub Arbeit aus einer Probe enthält.
  let funde = (probe-merges "origin/main")
  if ($funde | is-not-empty) {
    print ""
    print "Achtung: origin/main enthält Merges von Agenten-Branches. Die Vorlage auf GitHub ist nicht im Startzustand,"
    print "auch dieser Klon ist es deshalb nicht:"
    print $funde
    print "Wahrscheinlich wurde der main einer Probe nach GitHub gepusht. Bereinigen: docs/GITHUB.md, Abschnitt 7."
  }
}
