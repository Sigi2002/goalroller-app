import { readFileSync } from "node:fs";
import postcss, { type AtRule, type Declaration, type Rule } from "postcss";
import { describe, expect, it } from "vitest";

import { contrastRatio, parseHsl, parseTokens } from "../../../scripts/ux/rules.mjs";

const stylesheet = readFileSync(
  new URL("../../globals.css", import.meta.url),
  "utf8",
);
const stylesheetAst = postcss.parse(stylesheet);
const tokens = parseTokens(stylesheet);
const resultPalette = ["yellow", "green", "red", "blue", "midnight"] as const;

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
  ["goalroller-roll-base", "goalroller-paper"],
  ["goalroller-roll-hover", "goalroller-paper"],
  ["goalroller-roll-dark-hover", "goalroller-paper"],
] as const;

function colorRgb(theme: "light" | "dark", token: string) {
  const value = tokens[theme][token];
  if (!value) throw new Error(`Missing ${theme} color token: ${token}`);

  const rgb = parseHsl(value);
  if (!rgb) throw new Error(`Invalid HSL color token: ${token}`);
  return rgb;
}

function findDeclaration(rule: Rule, property: string) {
  const declaration = rule.nodes.find(
    (node): node is Declaration =>
      node.type === "decl" && node.prop === property,
  );
  if (!declaration) throw new Error(`Missing ${property} declaration`);
  return declaration.value;
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

describe("GoalRoller result frame", () => {
  it.each(["light", "dark"] as const)(
    "defines every result color in %s mode",
    (theme) => {
      for (const color of resultPalette) {
        expect(colorRgb(theme, `goalroller-result-${color}`)).toBeDefined();
      }
    },
  );

  it("uses the five-color gradient with a five-second rotation", () => {
    let frameRule: Rule | undefined;
    stylesheetAst.walkRules(".goalroller-result-frame", (rule) => {
      if (rule.parent?.type === "root") frameRule = rule;
    });
    expect(frameRule).toBeDefined();
    if (!frameRule) throw new Error("Missing result frame rule");

    const background = findDeclaration(frameRule, "background");
    expect(background).toContain("conic-gradient(");
    for (const color of resultPalette) {
      expect(background).toContain(`var(--goalroller-result-${color})`);
    }
    expect(findDeclaration(frameRule, "animation")).toBe(
      "goalroller-result-border-spin 5s linear infinite",
    );
  });

  it("stops the border animation for reduced motion", () => {
    let reducedMotion: AtRule | undefined;
    stylesheetAst.walkAtRules("media", (rule) => {
      if (rule.params.includes("prefers-reduced-motion: reduce")) {
        reducedMotion = rule;
      }
    });
    expect(reducedMotion).toBeDefined();
    if (!reducedMotion) throw new Error("Missing reduced-motion rule");

    let frameRule: Rule | undefined;
    reducedMotion.walkRules(".goalroller-result-frame", (rule) => {
      frameRule = rule;
    });
    expect(frameRule).toBeDefined();
    if (!frameRule) throw new Error("Missing reduced-motion frame rule");
    expect(findDeclaration(frameRule, "animation")).toBe("none");
  });
});
