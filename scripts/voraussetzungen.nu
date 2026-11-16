# Prüft, ob die für das Projekt nötige Software vorhanden ist und die Mindestversion erfüllt.
# Aufruf: nu scripts/voraussetzungen.nu
# Rückgabewert 1, wenn eine Pflichtvoraussetzung fehlt oder zu alt ist.

# Liefert die erste Versionsnummer aus der Ausgabe eines Befehls, oder null, wenn er fehlt.
def lies-version [befehl: string, ...argumente: string] {
  if (which $befehl | is-empty) { return null }
  let r = (do { ^$befehl ...$argumente } | complete)
  let treffer = ($"($r.stdout)($r.stderr)" | parse --regex '(?P<a>\d+)\.(?P<b>\d+)')
  if ($treffer | is-empty) { return {text: "unbekannt", a: 0, b: 0} }
  let t = ($treffer | first)
  {text: $"($t.a).($t.b)", a: ($t.a | into int), b: ($t.b | into int)}
}

def mindestens [v, a: int, b: int] {
  $v.a > $a or ($v.a == $a and $v.b >= $b)
}

def zeile [name: string, verlangt: string, pflicht: bool, v, passt: bool] {
  {
    software: $name,
    verlangt: $verlangt,
    gefunden: (if $v == null { "fehlt" } else { $v.text }),
    pflicht: (if $pflicht { "ja" } else { "nein" }),
    ergebnis: (if $v == null { "fehlt" } else if $passt { "ok" } else { "zu alt oder unpassend" }),
  }
}

def main [] {
  let git = (lies-version git "--version")
  let node = (lies-version node "--version")
  let npm = (lies-version npm "--version")
  let rustc = (lies-version rustc "--version")
  let cargo = (lies-version cargo "--version")
  let claude = (lies-version claude "--version")
  let opencode = (lies-version opencode "--version")
  let herdr_da = (which herdr | is-not-empty)
  let lazygit_da = (which lazygit | is-not-empty)
  let meld_da = (which meld | is-not-empty)

  let node_passt = ($node != null and (($node.a == 22 and $node.b >= 12) or $node.a == 24 or $node.a >= 26))

  let tabelle = [
    (zeile "Git" "ab 2.38" true $git ($git != null and (mindestens $git 2 38)))
    (zeile "Node.js" "22.12+, 24 oder ab 26" true $node $node_passt)
    (zeile "npm" "mit Node.js" true $npm ($npm != null))
    (zeile "Rust (rustc)" "ab 1.90" true $rustc ($rustc != null and (mindestens $rustc 1 90)))
    (zeile "Cargo" "mit Rust" true $cargo ($cargo != null))
    (zeile "Claude Code" "aktuell" true $claude ($claude != null))
    (zeile "opencode" "ab 1.18.29 für herdr, nicht geprüft" true $opencode ($opencode != null))
    (zeile "herdr" "ab 0.9, nicht geprüft" true (if $herdr_da { {text: "vorhanden", a: 0, b: 0} } else { null }) $herdr_da)
    (zeile "lazygit" "beliebig" false (if $lazygit_da { {text: "vorhanden", a: 0, b: 0} } else { null }) $lazygit_da)
    (zeile "Meld" "beliebig" false (if $meld_da { {text: "vorhanden", a: 0, b: 0} } else { null }) $meld_da)
  ]

  print $"Nushell (version | get version) führt dieses Skript aus."
  print $tabelle

  let offen = ($tabelle | where pflicht == "ja" and ergebnis != "ok")
  if ($offen | is-empty) {
    print "Alle Pflichtvoraussetzungen sind erfüllt."
  } else {
    print $"Es fehlen oder passen nicht: ($offen | get software | str join ', '). Siehe docs/INSTALLATION.md."
    exit 1
  }
}
