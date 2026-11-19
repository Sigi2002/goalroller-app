import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  GOALROLLER_ROLL_IMAGE_ASSETS,
  goalrollerPreviewImageFor,
  goalrollerRollImagePath,
} from "./roll-images";

describe("GoalRoller result images", () => {
  it("maps all five dice and their three outcomes to the matching images", () => {
    const expectedPaths = [
      ["yellow", "1", "goalroller/goalroller-gelb-1.png"],
      ["yellow", "X", "goalroller/goalroller-gelb-x.png"],
      ["yellow", "2", "goalroller/goalroller-gelb-2.png"],
      ["green", "1", "goalroller/goalroller-gruen-1.png"],
      ["green", "X", "goalroller/goalroller-gruen-x.png"],
      ["green", "2", "goalroller/goalroller-gruen-2.png"],
      ["red", "1", "goalroller/goalroller-rot-1.png"],
      ["red", "X", "goalroller/goalroller-rot-x.png"],
      ["red", "2", "goalroller/goalroller-rot-2.png"],
      ["blue", "1", "goalroller/goalroller-blau-1.png"],
      ["blue", "X", "goalroller/goalroller-blau-x.png"],
      ["blue", "2", "goalroller/goalroller-blau-2.png"],
      ["black", "1", "goalroller/goalroller-schwarz-1.png"],
      ["black", "X", "goalroller/goalroller-schwarz-x.png"],
      ["black", "2", "goalroller/goalroller-schwarz-2.png"],
    ] as const;

    expect(GOALROLLER_ROLL_IMAGE_ASSETS).toHaveLength(expectedPaths.length);
    for (const [dieId, outcome, path] of expectedPaths) {
      expect(goalrollerRollImagePath(dieId, outcome)).toBe(path);
    }
  });

  it("uses each PNG's native dimensions for its displayed proportions", () => {
    for (const asset of GOALROLLER_ROLL_IMAGE_ASSETS) {
      const image = readFileSync(
        join(process.cwd(), "content", "media", asset.path),
      );

      expect(image.toString("ascii", 1, 4)).toBe("PNG");
      expect(image.readUInt32BE(16)).toBe(asset.width);
      expect(image.readUInt32BE(20)).toBe(asset.height);
    }
  });

  it("previews the selected die's 1 image before a roll", () => {
    for (const dieId of ["yellow", "green", "red", "blue", "black"] as const) {
      expect(goalrollerPreviewImageFor(dieId, null)).toEqual({
        dieId,
        outcome: "1",
      });
      expect(goalrollerRollImagePath(dieId, "1")).not.toBeNull();
    }

    expect(goalrollerPreviewImageFor(null, null)).toBeNull();
    expect(goalrollerPreviewImageFor("blue", "X")).toEqual({
      dieId: "blue",
      outcome: "X",
    });
  });
});
