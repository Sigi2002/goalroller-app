import { describe, expect, it } from "vitest";

import {
  DICE,
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

    expect(parseFavoriteOdds("1.24")).toEqual({ ok: false, reason: "range" });
    expect(parseFavoriteOdds("2,91")).toEqual({ ok: false, reason: "range" });
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

  it("keeps every die label readable against its face colour", () => {
    for (const die of DICE) {
      expect(contrastRatio(die.color, die.textColor)).toBeGreaterThanOrEqual(
        4.5,
      );
    }
  });
});
