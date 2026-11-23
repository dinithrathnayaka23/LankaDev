import { describe, expect, it } from "vitest";
import { PACKAGE_NAME } from "./index.js";

describe("@lankadev/unicode scaffold", () => {
  it("exposes the root entry point", () => {
    expect(PACKAGE_NAME).toBe("@lankadev/unicode");
  });
});
