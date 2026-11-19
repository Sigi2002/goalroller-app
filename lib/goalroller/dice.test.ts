import { describe, expect, it } from "vitest";

import {
  DICE,
  diceForMode,
  duelTipForOutcome,
  faceCounts,
  parseFavoriteOdds,
  tipForOutcome,
} from "./dice";

function luminance(hex: string): number {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)!
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
    );

  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrastRatio(a: string, b: string): number {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

describe("GoalRoller W12", () => {
  it("uses exactly twelve sides with the specified distributions", () => {
    expect(DICE.map((die) => die.faces.length)).toEqual([12, 12, 12, 12, 12]);
    expect(DICE.map(faceCounts)).toEqual([
      { "1": 9, X: 2, "2": 1 },
      { "1": 8, X: 2, "2": 2 },
      { "1": 7, X: 3, "2": 2 },
      { "1": 6, X: 3, "2": 3 },
      { "1": 5, X: 3, "2": 4 },
    ]);
  });

  it("selects the exact die at every quote boundary", () => {
    const boundaries = [
      [125, "yellow"],
      [144, "yellow"],
      [145, "green"],
      [164, "green"],
      [165, "red"],
      [189, "red"],
      [190, "blue"],
      [219, "blue"],
      [220, "black"],
      [290, "black"],
    ] as const;

    for (const [cents, dieId] of boundaries) {
      expect(parseFavoriteOdds(`${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, "0")}`)).toMatchObject({
        ok: true,
        oddsCents: cents,
        die: { id: dieId },
      });
    }

    expect(parseFavoriteOdds("1.24")).toMatchObject({
      ok: false,
      reason: "range",
      minCents: 125,
      maxCents: 290,
    });
    expect(parseFavoriteOdds("2,91")).toMatchObject({
      ok: false,
      reason: "range",
      minCents: 125,
      maxCents: 290,
    });
  });

  it("accepts comma and point decimals without rounding ambiguous odds", () => {
    expect(parseFavoriteOdds("1,65")).toMatchObject({
      ok: true,
      oddsCents: 165,
      die: { id: "red" },
    });
    expect(parseFavoriteOdds(" 1.65 ")).toMatchObject({
      ok: true,
      oddsCents: 165,
      die: { id: "red" },
    });
    expect(parseFavoriteOdds("1.645")).toEqual({
      ok: false,
      reason: "format",
    });
  });

  it("uses only the four duel dice with the specified quote boundaries", () => {
    expect(diceForMode("football").map((die) => die.id)).toEqual([
      "yellow",
      "green",
      "red",
      "blue",
      "black",
    ]);
    expect(diceForMode("duels").map((die) => die.id)).toEqual([
      "yellow",
      "green",
      "red",
      "blue",
    ]);

    const boundaries = [
      ["1.19", "yellow"],
      ["1.31", "yellow"],
      ["1.32", "green"],
      ["1.49", "green"],
      ["1.50", "red"],
      ["1.72", "red"],
      ["1.73", "blue"],
      ["1.99", "blue"],
    ] as const;

    for (const [odds, dieId] of boundaries) {
      expect(parseFavoriteOdds(odds, "duels")).toMatchObject({
        ok: true,
        die: { id: dieId },
      });
    }

    expect(parseFavoriteOdds("1,50", "duels")).toMatchObject({
      ok: true,
      die: { id: "red" },
      range: { minCents: 150, maxCents: 172 },
    });
    expect(parseFavoriteOdds("1.18", "duels")).toMatchObject({
      ok: false,
      reason: "range",
      minCents: 119,
      maxCents: 199,
    });
    expect(parseFavoriteOdds("2.00", "duels")).toMatchObject({
      ok: false,
      reason: "range",
      minCents: 119,
      maxCents: 199,
    });
  });

  it("maps away-favourite outcomes to the correct match tip", () => {
    expect(tipForOutcome("1", "away")).toEqual({
      tip: "2",
      awayNotice: "favoriteWins",
    });
    expect(tipForOutcome("2", "away")).toEqual({
      tip: "1",
      awayNotice: "favoriteLoses",
    });
    expect(tipForOutcome("X", "away")).toEqual({
      tip: "X",
      awayNotice: null,
    });
    expect(tipForOutcome("2", "home")).toEqual({
      tip: "2",
      awayNotice: null,
    });
  });

  it("maps both duel positions to favourite and underdog tips", () => {
    expect(duelTipForOutcome("1", "A")).toEqual({
      tip: "1",
      verdict: "favoriteWin",
    });
    expect(duelTipForOutcome("X", "A")).toEqual({
      tip: "1",
      verdict: "favoriteWin",
    });
    expect(duelTipForOutcome("2", "A")).toEqual({
      tip: "2",
      verdict: "underdogWin",
    });
    expect(duelTipForOutcome("1", "B")).toEqual({
      tip: "2",
      verdict: "favoriteWin",
    });
    expect(duelTipForOutcome("X", "B")).toEqual({
      tip: "2",
      verdict: "favoriteWin",
    });
    expect(duelTipForOutcome("2", "B")).toEqual({
      tip: "1",
      verdict: "underdogWin",
    });
  });

  it("keeps every die label readable against its face colour", () => {
    for (const die of DICE) {
      expect(contrastRatio(die.color, die.textColor)).toBeGreaterThanOrEqual(
        4.5,
      );
    }
  });
});
