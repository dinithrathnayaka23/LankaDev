import { describe, expect, it } from "vitest";
import { PACKAGE_NAME } from "./index.js";

describe("@lankadev/react scaffold", () => {
  it("exposes the root entry point", () => {
    expect(PACKAGE_NAME).toBe("@lankadev/react");
  });

  it("runs tests in a DOM environment", () => {
    document.body.innerHTML = '<p lang="si">සිංහල</p>';
    expect(document.querySelector("p")?.getAttribute("lang")).toBe("si");
  });
});
