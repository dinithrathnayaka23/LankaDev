import { describe, expect, it } from "vitest";
import { ENTRY_POINT as CLIENT_ENTRY } from "./client/index.js";
import { ENTRY_POINT as SERVER_ENTRY } from "./server/index.js";

describe("@lankadev/next scaffold", () => {
  it("exposes separate server and client entry points", () => {
    expect(SERVER_ENTRY).toBe("@lankadev/next/server");
    expect(CLIENT_ENTRY).toBe("@lankadev/next/client");
  });
});
