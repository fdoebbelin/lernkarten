---
name: rebase-main
description: Bringt den eigenen Branch per Rebase auf den Stand von main und löst dabei Konflikte nach den Projektregeln. Verwenden, wenn main weitergelaufen ist, die Konfliktprüfung einen Konflikt meldet oder vor dem Zusammenführen des eigenen Branches.
---

# Rebase auf main

Nur im eigenen Worktree und nur auf dem eigenen Branch.

1. Voraussetzung prüfen: `git status --short` muss leer sein. Sonst erst committen.
2. Ausgangspunkt merken: `git rev-parse HEAD` ausgeben.
3. `git rebase main` ausführen.
4. Bei jedem Konflikt:
   - Beide Seiten lesen und verstehen, was jede erreichen wollte.
   - So lösen, dass beide Absichten erhalten bleiben. Bei `src/domain/typen.ts` heißt das
     in der Regel: beide neuen Felder behalten.
   - Die Entscheidung in einem Satz notieren.
   - `git add <datei>` und `git rebase --continue`.
5. Ist eine Stelle nicht eindeutig lösbar: `git rebase --abort`, die Stelle beschreiben und fragen.
6. Nach dem Rebase: `npm run test`, `npm run typen`, bei Rust-Änderungen `cargo test --manifest-path src-tauri/Cargo.toml`.
7. Berichten: gelöste Konflikte mit Entscheidung, Testergebnis, der gemerkte Ausgangspunkt für den Notfall.

Nie `git push --force`, nie nach `main` zusammenführen.
