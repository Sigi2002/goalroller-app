import { describe, expect, it } from "vitest";

import { withMatchLine } from "./share-text";

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
