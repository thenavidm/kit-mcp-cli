import { describe, expect, it } from "vitest";
import { ALL_TOOLS, compileAll } from "../src/tools/index.js";

// Each schema compiles on its first use, not at load; this compiles every one, as loading once did.
describe("schemas", () => {
  it("compiles every input and body schema with the native validator", () => {
    expect(compileAll()).toBeGreaterThanOrEqual(ALL_TOOLS.length);
  });
});
