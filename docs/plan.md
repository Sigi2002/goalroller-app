# GoalRoller — was noch zu bauen ist

_Das vereinbarte Bild, in einfachen Worten. Eine Zeile hier ist etwas, das der
Kunde tun können wird — keine Aufgabe, Datei oder Tabelle. Sobald es existiert
und seine Tests grün sind, wandert es nach docs/app.md; was hier noch steht,
liegt also wirklich noch vor uns. docs/product-brief.md sagt, was das Produkt
ist; hier steht, was noch fehlt. Diese Notiz hat dein Assistent aus unserem
Gespräch geschrieben — lies sie als Vorschlag zum Prüfen, nicht als ein
Versprechen, das du selbst abgegeben hast._

## Vor der ersten Seite geklärt

- **Verkauft wird:** einmaliger Zugang zur Web-App, getrennt vom physischen
  Würfel-Set; Preis und Digistore24-Produkt sind noch offen.
- **Für:** Tippspiel-Spieler, Hobby-Analysten, Fußball-Communities und
  Betreiber von Tipprunden.
- **Archetyp:** Gated-Tool — der Wurf und der daraus abgeleitete Tipp sind das
  Werkzeug, für das der Webzugang bezahlt wird.
- **Abrechnung:** ein einmaliger Kauf.
- **Look:** docs/design.md — GoalRoller-Marke in sportlichem Blau.
- **Tempo:** in Etappen; nach jeder Etappe hält die App an und wird dir zum
  Öffnen übergeben.

## Was du damit tun können wirst

- [x] dich anmelden und dein eigenes Dashboard finden (AppKit-Grundfunktion,
  vorhanden seit 2026-11-19)
- [x] zwischen 1-X-2-Fußballtipps und Duellen wählen, die Quote und
  Favoritenposition eingeben und den Tipp mit dem passenden GoalRoller-Würfel
  würfeln, sehen und teilen
- [ ] einmalig für den Webzugang bezahlen und dadurch GoalRoller freischalten
- [ ] auf einer deutschen Produktseite GoalRoller kennenlernen und den
  Webzugang kaufen

## Nicht in der ersten Version (bewusst, nicht vergessen)

- Eine frei nutzbare Würfelfunktion auf der öffentlichen Startseite — 2026-11-19:
  der vollständige Wurf bleibt hinter der Anmeldung und dem bezahlten Zugang.
- Ein echter Digistore24-Kauf — Preis und Produkt sind noch nicht festgelegt.
  Das GoalRoller-Angebot ist als Einmalkauf angelegt, aber geparkt; auch das
  wiederkehrende Basic-Beispiel ist geparkt. Vor einem Digistore24-Abgleich
  müssen Preis und Produkt ausdrücklich festgelegt werden.
- KI-Tipps, externe Quoten und eine gespeicherte Tipp-Historie — 2026-11-19:
  GoalRoller würfelt ausschließlich aus den zwölf festgelegten Seiten; außer
  dem Zeitpunkt des ersten Wurfs speichert es weder Eingabe noch Ergebnis.
- Der physische Würfel — 2026-11-19: verkauft wird nur der digitale Webzugang,
  ausdrücklich getrennt vom physischen Set.
