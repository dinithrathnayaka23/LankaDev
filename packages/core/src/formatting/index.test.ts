import { describe, expect, it } from "vitest";
import * as formatting from "./index.js";

describe("@lankadev/core/formatting entry point", () => {
  it("exports exactly the public API", () => {
    expect(Object.keys(formatting).sort()).toEqual([
      "DEFAULT_TIME_ZONE",
      "formatDate",
      "formatLKR",
      "formatNumber",
      "formatRelativeTime",
      "getNumberFormatter",
    ]);
  });
});
