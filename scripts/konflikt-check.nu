# Prüft Agenten-Branches auf Überschneidungen und Merge-Konflikte, ohne etwas zu verändern.
# Aufruf: nu scripts/konflikt-check.nu [basis] [--warten]
# Rückgabewert 1, wenn mindestens ein Probe-Merge einen Konflikt ergibt.
def main [
  base: string = "main"
  --warten  # vor dem Ende auf Enter warten, etwa im herdr-Popup
] {
  let branches = (git branch --format "%(refname:short)" | lines
    | where {|b| $b =~ '^(claude|opencode)/' })

  if ($branches | is-empty) {
    print "Keine Branches mit Präfix claude/ oder opencode/ gefunden."
    if $warten { input "Enter schließt das Fenster. " | ignore }
    return
  }

  # 1. Dateien, die mehr als ein Branch seit der Abzweigung geändert hat
  let changed = ($branches
    | each {|b| git diff --name-only $"($base)...($b)" | lines | each {|f| {datei: $f, branch: $b} } }
    | flatten)
  let overlap = (if ($changed | is-empty) { [] } else {
    $changed
    | group-by datei --to-table
    | where {|g| ($g.items | length) > 1 }
    | each {|g| {datei: $g.datei, branches: ($g.items.branch | str join ", ")} } })

  # 2. Probe-Merge jedes Branches gegen die Basis und gegen jeden anderen Branch
  let targets = ($branches | each {|b| {a: $base, b: $b} })
  let pairs = ($branches | enumerate | each {|x|
      $branches | skip ($x.index + 1) | each {|y| {a: $x.item, b: $y} } } | flatten)
  let merges = ($targets | append $pairs | each {|p|
      let r = (do { git merge-tree --write-tree --name-only $p.a $p.b } | complete)
      { paar: $"($p.a) <- ($p.b)",
        konflikt: ($r.exit_code != 0),
        dateien: (if $r.exit_code != 0 { $r.stdout | lines | skip 1 | take while {|l| $l != "" } | str join ", " } else { "" }) }
    })

  print "Mehrfach geänderte Dateien:"
  print (if ($overlap | is-empty) { "  keine" } else { $overlap })
  print "Probe-Merges:"
  print $merges

  if $warten { input "Enter schließt das Fenster. " | ignore }
  if ($merges | any {|m| $m.konflikt }) { exit 1 }
}
