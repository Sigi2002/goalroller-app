import { describe, expect, it } from "vitest";

import {
  displayOutcomeText,
  favoriteLabelForShare,
  withMatchLine,
} from "./share-text";

describe("GoalRoller shared match line", () => {
  it("adds trimmed team names as a prominent match line", () => {
    expect(withMatchLine("Result: 1", " FC Bayern ", " BVB ")).toBe(
      "FC Bayern vs. BVB\nResult: 1",
    );
  });

  it("includes a single team name without a separator", () => {
    expect(withMatchLine("Result: X", "Home team", "  ")).toBe(
      "Home team\nResult: X",
    );
    expect(withMatchLine("Result: 2", " ", "Away team")).toBe(
      "Away team\nResult: 2",
    );
  });

  it("does not add a match line when both names are blank", () => {
    expect(withMatchLine("Result: X", " ", "\n\t")).toBe("Result: X");
  });
});

describe("GoalRoller shared favorite label", () => {
  it("uses the selected named team or its localized fallback", () => {
    expect(
      favoriteLabelForShare("football", "home", "A", " FC Bayern ", "BVB", {
        home: "Home team",
        away: "Away team",
      }),
    ).toBe("FC Bayern");
    expect(
      favoriteLabelForShare("football", "away", "A", "  ", "  ", {
        home: "Home team",
        away: "Away team",
      }),
    ).toBe("Away team");
  });

  it("uses the selected duel position as the favorite", () => {
    expect(
      favoriteLabelForShare("duels", "home", "B", "Home", "Away", {
        home: "Home team",
        away: "Away team",
      }),
    ).toBe("B");
  });
});

describe("GoalRoller displayed outcome text", () => {
  it("explains X only when the result is from duels", () => {
    const duelDrawResult = "X oder 1 = beim Duell ein Sieg des Favoriten.";

    expect(displayOutcomeText("duels", "X", duelDrawResult)).toBe(
      "X oder 1 = beim Duell ein Sieg des Favoriten.",
    );
    expect(displayOutcomeText("duels", "1", duelDrawResult)).toBe("1");
    expect(displayOutcomeText("duels", "2", duelDrawResult)).toBe("2");
    expect(displayOutcomeText("football", "X", duelDrawResult)).toBe("X");
    expect(displayOutcomeText("football", "1", duelDrawResult)).toBe("1");
    expect(displayOutcomeText("football", "2", duelDrawResult)).toBe("2");
  });
});
