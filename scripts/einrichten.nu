# Richtet das Projekt nach dem Entpacken ein: Git-Repository, Abhängigkeiten, Testlauf.
# Aufruf im Projektordner: nu scripts/einrichten.nu

# Merges von Agenten-Branches auf der Hauptlinie eines Stands. Die Vorlage darf keine enthalten:
# Sie entstehen nur in einer Probe und gehören nie nach GitHub. Gleiche Funktion in zuruecksetzen.nu.
def probe-merges [stand: string] {
  let r = (do { git log --first-parent --merges --format="%h%x09%ad%x09%s" --date=short $stand } | complete)
  if $r.exit_code != 0 { return [] }
  $r.stdout | lines | split column "\t" commit datum betreff
  | where {|m| $m.betreff =~ "^Merge branch '(claude|opencode)/" }
}

# Warnt, wenn ein Stand der Vorlage Merges aus einer Probe enthält.
def warne-vor-probe [stand: string] {
  let funde = (probe-merges $stand)
  if ($funde | is-not-empty) {
    print $"Achtung: ($stand) enthält Merges von Agenten-Branches und ist damit nicht im Startzustand der Vorlage:"
    print $funde
    print "Wahrscheinlich wurde der main einer Probe nach GitHub gepusht. Bereinigen: docs/GITHUB.md, Abschnitt 7."
  }
}

def main [
  --ohne-npm  # Abhängigkeiten nicht installieren und keine Tests ausführen
] {
  if not ("package.json" | path exists) {
    error make {msg: "Bitte im Projektordner ausführen (package.json fehlt)."}
  }

  # Vite 8 und Vitest 5 verlangen Node 22.12+, 24 oder 26+. Mit anderen Versionen
  # lässt npm die nativen Module stillschweigend weg, und die Tests starten nicht.
  if not $ohne_npm {
    let v = (node --version | str trim | str replace "v" "" | split row "." | each {|x| $x | into int })
    let passt = (($v.0 == 22 and $v.1 >= 12) or $v.0 == 24 or $v.0 >= 26)
    if not $passt {
      error make {msg: $"Node (node --version | str trim) passt nicht. Gebraucht wird 22.12 oder neuer, 24 oder ab 26."}
    }
  }

  if not (".git" | path exists) {
    git init -b main
    git add .
    git commit -m "Startzustand Lernkarten"
    print "Git-Repository mit Branch main angelegt."
  } else {
    print "Git-Repository ist schon vorhanden."
    let hat_origin = ((do { git rev-parse --verify --quiet "origin/main^{commit}" } | complete).exit_code == 0)
    warne-vor-probe (if $hat_origin { "origin/main" } else { "main" })
  }

  if not $ohne_npm {
    npm install
    npm run test
  }

  print "Fertig. Nächster Schritt: docs/ARBEITSBLATT.md, Abschnitt 3.1, Schritt 3."
}
