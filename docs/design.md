# GoalRoller — how it looks

_Chosen on 2026-11-19, direction "GoalRoller brand". Every page built since is
expected to match this file rather than invent its own look. Change it here
first, then apply it — never page by page. Nothing in here overrides
CLAUDE.md § UI or docs/ux.md._

## Identity
- **Mood:** sportlich, klar, motivierend
- **Taken from:** the operator's website, https://www.goalroller.com — original
  named primary `#6ec1e4`. The light-mode accent is darkened from 66% to 37%
  lightness for readable foreground contrast; dark mode retains the hue and
  66% lightness.

## Tokens — delta from the shipped defaults
- `--primary`: hsl(198 69% 37%) light / hsl(198 69% 66%) dark — GoalRoller blue
- `--primary-foreground`: hsl(198 20% 97%) light / hsl(198 55% 13%) dark
- `--ring`: hsl(198 69% 37%) light / hsl(198 69% 66%) dark
- **Elevation:** flat

## Typography
- **Body:** Figtree — shipped, unchanged
- **Headings:** Source Serif 4 — shipped, unchanged

## GoalRoller interaction palette
The tool uses the five die colours for control feedback without changing the
app-wide blue `--primary` accent. These are fixed component colours, not
additional brand dials, and each foreground is chosen for contrast in both
themes.

| Area | Base | Active or selected |
|---|---|---|
| Mode selection | Gray when unselected | yellow-600 when selected |
| Team names | lime-400 | lime-700 on interaction |
| Football favourite | Gray when unselected | lime-700 when selected |
| Duel favourite position | Gray when unselected | red-800 when selected |
| Odds input | blue-400 when empty or invalid | Matching die colour and text when the quote is valid |
| Roll button and die panel | gray-700 | black |

## The mark
- **Logo:** `public/brand/logo.jpg` — the supplied GoalRoller mark, shown in
  the header and on the sign-in page
- **Source:** `public/goalroller/goalroller-logo.jpg`
- **Image notes:** 373 × 248 px, opaque JPEG. The generated 512 px icon
  upscales it 1.4× and may look soft; padded icons use a flat background
  sampled from the image corner.
- **Dark variant:** not supplied; the colorful dice remain visible against the
  mark's black background in dark mode
- **Icons generated:** yes; browser tab, iOS home screen and all three web app
  icons

## Page composition
- **Dashboard home:** the GoalRoller tool is the focal point; quote and
  favourite controls lead to the coloured die and its result.
- **Result pages:** show the draw and tip directly below the die, not on a
  separate page.
- **The salespage (`/`):** follows the sporting blue identity; sales copy and
  offer sections are the skill `salespage`.
- **Settings/account:** unchanged — the same on every app, on purpose

## Signature element
The selected coloured twelve-sided die is the main visual result on the
GoalRoller tool.

## Do / Don't
- Keep the app-wide brand accent blue; use the five die colours only for the
  GoalRoller controls listed above and the dice themselves.
- Put the draw result and any away-favourite tip directly below the die.
- Keep the interface text in German.
