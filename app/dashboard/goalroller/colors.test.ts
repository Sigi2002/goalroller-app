import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { contrastRatio, parseHsl, parseTokens } from "../../../scripts/ux/rules.mjs";

const tokens = parseTokens(
  readFileSync(new URL("../../globals.css", import.meta.url), "utf8"),
);

const colorPairs = [
  ["muted", "foreground"],
  ["secondary", "secondary-foreground"],
  ["goalroller-mode-active", "goalroller-ink"],
  ["goalroller-team-base", "goalroller-ink"],
  ["goalroller-team-active", "goalroller-paper"],
  ["goalroller-favorite-active", "goalroller-ink"],
  ["goalroller-odds-base", "goalroller-ink"],
  ["goalroller-odds-active", "goalroller-paper"],
  ["goalroller-dice-base", "goalroller-paper"],
  ["goalroller-dice-active", "goalroller-paper"],
] as const;

function colorRgb(theme: "light" | "dark", token: string) {
  const value = tokens[theme][token];
  if (!value) throw new Error(`Missing ${theme} color token: ${token}`);

  const rgb = parseHsl(value);
  if (!rgb) throw new Error(`Invalid HSL color token: ${token}`);
  return rgb;
}

describe("GoalRoller control palette", () => {
  it.each(["light", "dark"] as const)(
    "keeps every control label readable in %s mode",
    (theme) => {
      for (const [surface, foreground] of colorPairs) {
        expect(
          contrastRatio(colorRgb(theme, surface), colorRgb(theme, foreground)),
          `${theme}: ${foreground} on ${surface}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    },
  );
});
