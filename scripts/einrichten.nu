# Richtet das Projekt nach dem Entpacken ein: Git-Repository, Abhängigkeiten, Testlauf.
# Aufruf im Projektordner: nu scripts/einrichten.nu
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
  }

  if not $ohne_npm {
    npm install
    npm run test
  }

  print "Fertig. Nächster Schritt: docs/ARBEITSBLATT.md, Abschnitt 3.1, Schritt 3."
}
