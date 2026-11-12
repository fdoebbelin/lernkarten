---
name: uebernahme
description: Liest die Übergabe eines Branches und bereitet die Weiterarbeit vor. Verwenden zu Beginn einer Sitzung, beim Fortsetzen fremder Arbeit oder wenn ein Branch des anderen Coding-Agenten als Basis dient. Argument ist der Branch-Name; ohne Argument gilt der aktuelle Branch.
---

# Übernahme

1. Branch bestimmen: das Argument, sonst `git branch --show-current`.
2. Übergabedatei lesen. Der Dateiname ist der Branch-Name mit `-` statt `/`:
   - im eigenen Worktree: `uebergaben/<name>.md`
   - von einem fremden Branch: `git show <branch>:uebergaben/<name>.md`
3. Stand prüfen: `git log --oneline main..<branch>` und `git diff --stat main...<branch>`.
   Weicht der Stand von der Übergabe ab, die Abweichung benennen.
4. `npm run test` ausführen, damit der Ausgangszustand bekannt ist.
5. Einen Plan mit höchstens fünf Schritten vorlegen und auf Freigabe warten.

Fehlt die Übergabedatei, das melden und den Stand aus Schritt 3 zusammenfassen.
Den fremden Branch nie auschecken und nie verändern.
