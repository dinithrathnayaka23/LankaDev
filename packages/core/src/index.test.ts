import { describe, expect, it } from "vitest";
import { ENTRY_POINT } from "./formatting/index.js";
import { PACKAGE_NAME } from "./index.js";

describe("@lankadev/core scaffold", () => {
  it("exposes the root entry point", () => {
    expect(PACKAGE_NAME).toBe("@lankadev/core");
  });

  it("exposes the formatting entry point", () => {
    expect(ENTRY_POINT).toBe("@lankadev/core/formatting");
  });
});
