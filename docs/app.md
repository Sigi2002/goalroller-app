# GoalRoller — was diese App ist

GoalRoller ist ein deutschsprachiges Fußball-Tippwerkzeug. Die Regeln und
Oberfläche liegen im Code; es gibt keine redaktionellen Inhalte. Die
Würfelfunktion ist ein Gated-Tool: Der Webzugang soll einmalig bezahlt werden,
aber Preis und Digistore24-Produkt sind noch nicht festgelegt.

## Das Produkt

- **Verkauft:** einmaliger Zugang zum digitalen GoalRoller-Werkzeug; noch nicht
  zum Verkauf freigegeben.
- **Für:** Tippspiel-Spieler, Hobby-Analysten, Fußball-Communities und Betreiber
  von Tipprunden.
- **Sprache:** Deutsch.
- **Archetyp:** Gated-Tool.
- **Content authority:** developer — Oberfläche und Würfellogik sind im
  Repository gepflegt; es gibt keine redaktionellen Inhalte.
- **Output artifact:** ein teilbarer oder kopierbarer 1-X-2- oder Duell-Tipp auf
  Grundlage der eingegebenen Quote und der gewählten Favoritenposition.
- **Alongside the customer:** GoalRoller wählt je nach Modus den Quotenbereich,
  würfelt aus den zwölf Seiten des passenden GoalRoller-Würfels und ordnet
  das Ergebnis dem Heim-/Auswärtstipp oder dem Tipp für A/B zu. Der gelbe
  GoalRoller zeigt für 1, X und 2 das passende Ergebnisbild. Es gibt keine
  KI-Beratung.
- **Activation:** der erste erfolgreiche Wurf; `goalroller_activations` speichert
  dafür nur den Zeitpunkt.
- **Return:** einmaliges Werkzeug ohne gemessene Wiederkehr; weitere Würfe
  werden nicht gespeichert.

## Features

### GoalRoller-Würfel — `/dashboard/goalroller`

- **Does:** bietet Fußballtipps (1/X/2) und Duelle mit zwei Möglichkeiten an.
  Je nach Modus wählt es den passenden GoalRoller-Würfel und zeigt dessen Bild
  direkt bei einer gültigen Quote sowie die zwölfseitige Verteilung. Nach drei
  Sekunden Animation zeigt es das Bild des gewürfelten Ergebnisses für 1, X
  oder 2. Das Ergebnis lässt sich teilen oder kopieren.
- **Done when:** Ein Nutzer kann den Modus wählen, die Quote und
  Favoritenposition eingeben, mit dem passenden GoalRoller-Würfel würfeln und
  den zugehörigen Tipp sehen und teilen.
- **Access:** `hasPlan(memberId, "goalroller")`
- **Data:** `goalroller_activations` (`db/schema-goalroller.ts`,
  `drizzle/0011_open_junta.sql`); Mannschaftsnamen, Quote,
  Favoritenposition, Ergebnis und Tipp werden nicht gespeichert. Die
  Ergebnisbilder sind in `content/media/goalroller/` deklariert und über
  `content/media-manifest.json` mit `visibility: "entitled"` am Product Key
  `goalroller` gebunden.
- **Costs tokens:** keine.
- **Tests:** `lib/goalroller/dice.test.ts`, `lib/goalroller/config.test.ts`,
  `lib/entitlements/preview.test.ts`, `lib/privacy/export-shape.test.ts`,
  `app/dashboard/overview-links.test.ts`, `app/route-protection.test.ts`.

## Decisions worth remembering

- Keine frei nutzbare Würfelfunktion auf der öffentlichen Startseite: Der
  vollständige Wurf bleibt hinter Anmeldung und Zugang.
- Keine KI-Tipps, externen Quoten oder Wurfhistorie: Das Ergebnis ist ein
  gewichteter Zufallswurf aus den vorgegebenen zwölf Seiten; gespeichert wird
  nur der Zeitpunkt des ersten erfolgreichen Wurfs.
- Der Duell-Modus nutzt dieselben zwölf Würfelseiten mit eigenen Quotenbereichen;
  der schwarze GoalRoller-Würfel ist dort ausgeblendet.
- Der physische Würfel ist nicht Teil dieses Angebots; verkauft werden soll
  ausschließlich der digitale Webzugang.
- Preis und Digistore24-Produkt sind noch offen. Das GoalRoller-Angebot ist
  geparkt; bis zur Festlegung wird weder ein echter Checkout noch eine
  Verkaufsseite fertiggestellt.
