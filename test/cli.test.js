import assert from "node:assert/strict";
import test from "node:test";
import { parseArgs } from "../src/cli.js";

test("parses single contract options", () => {
  const options = parseArgs(["--contract", "contract.json", "--sample", "sample.json", "--name", "users", "--json", "--no-color"]);

  assert.equal(options.contract, "contract.json");
  assert.equal(options.sample, "sample.json");
  assert.equal(options.name, "users");
  assert.equal(options.json, true);
  assert.equal(options.color, false);
});

test("requires suite or contract/sample pair", () => {
  assert.throws(() => parseArgs(["--contract", "contract.json"]), /Provide --suite/);
});

