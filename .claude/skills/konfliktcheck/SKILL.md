---
name: konfliktcheck
description: Führt die Konfliktprüfung über alle Agenten-Branches aus und deutet das Ergebnis. Verwenden vor jedem Zusammenführen, nach jedem Merge in main und wenn gefragt wird, ob sich die Branches von Claude Code und opencode überschneiden.
---

# Konfliktprüfung

Die Prüfung rechnet Probe-Merges im Speicher und verändert nichts.

1. `nu scripts/konflikt-check.nu` ausführen. Rückgabewert 1 bedeutet: mindestens ein Konflikt.
2. Die Ausgabe deuten:
   - Mehrfach geänderte Datei ohne Konflikt: Warnung. Die Datei in beiden Branches ansehen
     (`git diff main...<branch> -- <datei>`) und sagen, ob die Änderungen inhaltlich zusammenpassen.
   - Konflikt nur zwischen zwei Agenten-Branches: Der erste Merge geht glatt, der zweite Branch muss danach rebasen.
   - Konflikt gegen `main`: Der Branch muss vor weiterer Arbeit rebasen.
3. Eine Reihenfolge für das Zusammenführen empfehlen: der Branch mit weniger Änderungen an geteilten Dateien zuerst.

Nichts zusammenführen und nichts rebasen. Das Ergebnis ist ein Bericht.
