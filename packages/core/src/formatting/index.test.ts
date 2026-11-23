import { describe, expect, it } from "vitest";
import { ENTRY_POINT } from "./index.js";

describe("@lankadev/core/formatting scaffold", () => {
  it("exposes the formatting entry point", () => {
    expect(ENTRY_POINT).toBe("@lankadev/core/formatting");
  });
});
