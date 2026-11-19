import { describe, expect, it } from "vitest";

import {
  GOALROLLER_PRODUCT_KEY,
  previewProductKeysFor,
} from "./config";

describe("GoalRoller preview access", () => {
  it("adds the parked product only to development owner previews", () => {
    expect(previewProductKeysFor(true, ["another"])).toEqual([
      "another",
      GOALROLLER_PRODUCT_KEY,
    ]);
    expect(previewProductKeysFor(false, ["another"])).toEqual(["another"]);
  });

  it("does not duplicate the product if it is later offered", () => {
    expect(previewProductKeysFor(true, [GOALROLLER_PRODUCT_KEY])).toEqual([
      GOALROLLER_PRODUCT_KEY,
    ]);
  });
});
