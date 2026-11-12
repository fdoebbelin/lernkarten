# Legt einen Worktree für einen Agenten-Branch an.
# In herdr wird er als gruppierter Workspace geöffnet, sonst mit reinem Git angelegt.
# Aufruf: nu scripts/worktree.nu claude/persistenz
#         nu scripts/worktree.nu opencode/editor --basis claude/lernmodus
def main [
  branch: string            # claude/<thema> oder opencode/<thema>
  --basis: string = "main"  # Ausgangspunkt des neuen Branches
] {
  if not ($branch =~ '^(claude|opencode)/[a-z0-9][a-z0-9-]*$') {
    error make {msg: "Branch muss claude/<thema> oder opencode/<thema> heißen (Kleinbuchstaben, Ziffern, Bindestrich)."}
  }

  let repo = (git rev-parse --show-toplevel | str trim)
  let in_herdr = ((which herdr | is-not-empty) and ($env.HERDR_ENV? != null))

  if $in_herdr {
    herdr worktree create --cwd $repo --branch $branch --base $basis --focus
  } else {
    let ziel = ($repo | path dirname | path join $"($repo | path basename).worktrees" ($branch | str replace "/" "-"))
    let vorhanden = (git branch --list $branch | str trim | is-not-empty)
    if $vorhanden {
      git worktree add $ziel $branch
    } else {
      git worktree add -b $branch $ziel $basis
    }
    print $"Worktree angelegt: ($ziel)"
  }
  print "Im neuen Worktree zuerst: npm install"
}
