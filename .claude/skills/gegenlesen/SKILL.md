---
name: gegenlesen
description: Prüft die Änderungen eines anderen Branches gegen main, ohne Code zu ändern, und liefert eine nummerierte Befundliste. Verwenden für Reviews der Arbeit des anderen Coding-Agenten. Argument ist der zu prüfende Branch, zum Beispiel claude/lernmodus.
---

# Gegenlesen

Du prüfst nur. Du änderst keine Datei und checkst den Branch nicht aus.

1. Änderungen lesen: `git diff main...<branch>` und `git log --oneline main..<branch>`.
2. Übergabe lesen: `git show <branch>:uebergaben/<name>.md` (Branch-Name mit `-` statt `/`).
3. Prüfen, in dieser Reihenfolge:
   - Fehler: falsches Verhalten, Randfälle, Datumsrechnung, Fehlerbehandlung
   - Tests: Deckt ein Test das neue Verhalten ab? Welcher Fall fehlt?
   - Regeln aus AGENTS.md: Fachlogik in `src/domain/`, deutsche Bezeichner, keine neuen Abhängigkeiten
   - Geteilte Dateien: Wurde eine geändert und steht das in der Übergabe?
   - Übergabe: Stimmen ihre Aussagen mit dem Diff überein?
4. Ergebnis als nummerierte Liste ausgeben. Je Befund:
   `Nr. | Schwere (Fehler, Risiko, Hinweis) | Datei:Zeile | Befund | Vorschlag`
5. Mit einem Satz schließen: zusammenführbar, zusammenführbar nach Korrektur der Fehler, oder nicht zusammenführbar.

Nur Befunde nennen, die du am Diff belegen kannst. Keine Geschmacksfragen.
