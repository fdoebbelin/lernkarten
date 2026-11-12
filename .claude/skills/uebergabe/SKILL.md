---
name: uebergabe
description: Schreibt die Übergabedatei des aktuellen Branches unter uebergaben/ und committet sie. Verwenden, wenn eine Aufgabe abgeschlossen ist, an den anderen Coding-Agenten übergeben wird oder die Sitzung endet.
---

# Übergabe schreiben

Ziel: Der andere Agent oder ein Mensch kann ohne Rückfrage weiterarbeiten oder zusammenführen.

1. Stand erheben:
   - `git status --short`
   - `git log --oneline main..HEAD`
   - `git diff --stat main...HEAD`
2. Tests ausführen: `npm run test` und `npm run typen`. Wenn `src-tauri/` geändert wurde,
   zusätzlich `cargo test --manifest-path src-tauri/Cargo.toml`. Ergebnisse wörtlich notieren,
   auch Fehlschläge.
3. Dateinamen bilden: Branch-Name mit `-` statt `/`, also `claude/persistenz` wird zu
   `uebergaben/claude-persistenz.md`.
4. Die Datei nach der Vorlage `docs/vorlagen/UEBERGABE.vorlage.md` schreiben oder aktualisieren.
   Jede Änderung an einer geteilten Datei aus AGENTS.md einzeln nennen.
5. Offene Änderungen und die Übergabedatei committen: `Übergabe <branch>`.
6. In drei Sätzen melden: was fertig ist, was offen ist, was der nächste Schritt ist.

Nichts beschönigen: Ein fehlgeschlagener Test oder ein nicht geprüfter Teil steht in der Übergabe.
