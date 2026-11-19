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

## The mark
- **Logo:** none supplied — the letter tile
- **Dark variant:** not needed
- **Icons generated:** no; no logo file was supplied

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
- Keep the five die colours distinct from the brand accent.
- Put the draw result and any away-favourite tip directly below the die.
- Keep the interface text in German.
