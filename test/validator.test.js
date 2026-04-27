import assert from "node:assert/strict";
import test from "node:test";
import { validateContract } from "../src/validator.js";

test("passes a valid object contract", () => {
  const issues = validateContract(
    {
      type: "object",
      required: ["id", "email"],
      additionalProperties: false,
      properties: {
        id: { type: "number" },
        email: { type: "string" },
        roles: {
          type: "array",
          items: { type: "string" }
        }
      }
    },
    {
      id: 1,
      email: "person@example.com",
      roles: ["admin"]
    }
  );

  assert.deepEqual(issues, []);
});

test("reports missing, unexpected, and type mismatch issues", () => {
  const issues = validateContract(
    {
      type: "object",
      required: ["id", "email"],
      additionalProperties: false,
      properties: {
        id: { type: "number" },
        email: { type: "string" }
      }
    },
    {
      id: "1",
      extra: true
    }
  );

  assert.deepEqual(
    issues.map((item) => item.code),
    ["missing-required", "type-mismatch", "unexpected-property"]
  );
});

test("validates array item contracts and enum values", () => {
  const issues = validateContract(
    {
      type: "array",
      minItems: 2,
      items: {
        type: "object",
        required: ["status"],
        properties: {
          status: { type: "string", enum: ["open", "closed"] }
        }
      }
    },
    [{ status: "pending" }]
  );

  assert.deepEqual(
    issues.map((item) => item.code),
    ["too-few-items", "enum-mismatch"]
  );
});

