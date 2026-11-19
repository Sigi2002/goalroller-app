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
- **Output artifact:** ein teilbarer oder kopierbarer 1-X-2-Tipp auf Grundlage
  der eingegebenen Favoritenquote und der gewählten Favoritenposition.
- **Alongside the customer:** GoalRoller wählt den Quotenbereich, würfelt aus
  dessen zwölf Seiten und ordnet das Ergebnis bei einem Auswärtsfavoriten dem
  Heim-/Auswärtstipp zu. Es gibt keine KI-Beratung.
- **Activation:** der erste erfolgreiche Wurf; `goalroller_activations` speichert
  dafür nur den Zeitpunkt.
- **Return:** einmaliges Werkzeug ohne gemessene Wiederkehr; weitere Würfe
  werden nicht gespeichert.

## Features

### GoalRoller-Würfel — `/dashboard/goalroller`

- **Does:** wählt anhand der Quote den passenden farbigen W12, zeigt seine
  zwölfseitige 1-X-2-Verteilung, würfelt animiert und bietet den Tipp zum Teilen
  oder Kopieren an.
- **Done when:** Ein Nutzer kann die Favoritenquote eingeben, Heim- oder
  Auswärtsfavorit wählen, mit dem passenden W12 würfeln und das Ergebnis sehen
  und teilen.
- **Access:** `hasPlan(memberId, "goalroller")`
- **Data:** `goalroller_activations` (`db/schema-goalroller.ts`,
  `drizzle/0011_open_junta.sql`); Quote, Favoritenposition, Ergebnis und Tipp
  werden nicht gespeichert.
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
- Der physische Würfel ist nicht Teil dieses Angebots; verkauft werden soll
  ausschließlich der digitale Webzugang.
- Preis und Digistore24-Produkt sind noch offen. Das GoalRoller-Angebot ist
  geparkt; bis zur Festlegung wird weder ein echter Checkout noch eine
  Verkaufsseite fertiggestellt.
