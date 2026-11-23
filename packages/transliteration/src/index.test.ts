import { describe, expect, it } from "vitest";
import { PACKAGE_NAME } from "./index.js";
import { ENTRY_POINT as SINHALA_ENTRY } from "./sinhala/index.js";
import { ENTRY_POINT as TAMIL_ENTRY } from "./tamil/index.js";

describe("@lankadev/transliteration scaffold", () => {
  it("exposes the root entry point", () => {
    expect(PACKAGE_NAME).toBe("@lankadev/transliteration");
  });

  it("exposes per-language entry points", () => {
    expect(SINHALA_ENTRY).toBe("@lankadev/transliteration/sinhala");
    expect(TAMIL_ENTRY).toBe("@lankadev/transliteration/tamil");
  });
});
