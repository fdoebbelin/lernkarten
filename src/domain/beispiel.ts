// Beispieldaten für den ersten Start und für die Entwicklung ohne Backend.

import type { Datenbestand } from "./typen";

export function beispielBestand(heute: string): Datenbestand {
  return {
    version: 1,
    stapel: [
      {
        id: "stapel-netzwerk",
        name: "Netzwerkgrundlagen",
        karten: [
          { id: "n1", frage: "Wie viele Schichten hat das OSI-Modell?", antwort: "Sieben", fach: 1, faelligAm: heute },
          { id: "n2", frage: "Welcher Port ist Standard für HTTPS?", antwort: "443", fach: 1, faelligAm: heute },
          { id: "n3", frage: "Wofür steht DHCP?", antwort: "Dynamic Host Configuration Protocol", fach: 2, faelligAm: heute },
        ],
      },
      {
        id: "stapel-sql",
        name: "SQL",
        karten: [
          { id: "s1", frage: "Welche Klausel filtert Gruppen?", antwort: "HAVING", fach: 1, faelligAm: heute },
          { id: "s2", frage: "Welcher JOIN behält alle Zeilen der linken Tabelle?", antwort: "LEFT JOIN", fach: 3, faelligAm: "2099-01-01" },
        ],
      },
    ],
  };
}
