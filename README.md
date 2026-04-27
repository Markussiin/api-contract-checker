# api-contract-checker

`api-contract-checker` is a dependency-free CLI for validating saved API response samples against lightweight JSON contracts. It is useful when you want a quick regression check for response shape changes without setting up a full schema toolchain.

I built this project for fun as a practical developer utility: small enough to understand quickly, but structured like something you could expand into CI checks or release gates.

## Features

- Validate JSON response samples against contract files.
- Run one check or a suite of named checks.
- Report missing required fields, type mismatches, unexpected properties, enum failures, and array size issues.
- Supports text and JSON output.
- Uses no third-party runtime dependencies.

## Quick Start

```bash
npm install
npm test
node bin/api-contract-checker.js --help
```

Run a valid example:

```bash
node bin/api-contract-checker.js --contract examples/user.contract.json --sample examples/user.sample.json --name "user response" --no-color
```

Run the suite, which includes one passing sample and one intentionally failing sample:

```bash
node bin/api-contract-checker.js --suite examples/suite.json --no-color
```

## CLI Usage

```bash
api-contract-checker --contract <file> --sample <file>
api-contract-checker --suite <file>
```

| Option | Description |
| --- | --- |
| `--contract <file>` | Contract JSON file for a single check. |
| `--sample <file>` | API response sample JSON file for a single check. |
| `--suite <file>` | Suite JSON file containing multiple named cases. |
| `--name <text>` | Name for a single check. |
| `--json` | Print machine-readable JSON output. |
| `--no-color` | Disable ANSI colors. |
| `-h, --help` | Show help. |

## Contract Format

Contracts intentionally use a compact subset of familiar JSON Schema concepts:

```json
{
  "type": "object",
  "required": ["id", "email"],
  "additionalProperties": false,
  "properties": {
    "id": { "type": "number" },
    "email": { "type": "string" },
    "roles": {
      "type": "array",
      "items": { "type": "string" }
    }
  }
}
```

Supported fields:

| Field | Purpose |
| --- | --- |
| `type` | Expected JSON type: `object`, `array`, `string`, `number`, `boolean`, or `null`. |
| `required` | Required object property names. |
| `properties` | Child contracts for object properties. |
| `additionalProperties` | Set to `false` to reject fields not listed in `properties`. |
| `items` | Contract for array items. |
| `enum` | Allowed literal values. |
| `minItems` / `maxItems` | Array length constraints. |

## Project Layout

```text
bin/api-contract-checker.js   CLI entrypoint
src/cli.js                    argument parsing and orchestration
src/loader.js                 JSON and suite loading
src/validator.js              contract validation engine
src/reporter.js               text and JSON reports
test/                         node:test coverage
examples/                     sample contracts and responses
```

## Development

```bash
npm test
npm run check
```

## Roadmap

- Contract diffing between versions.
- More JSON Schema keywords.
- HTTP capture mode for saving live responses.
- GitHub Action wrapper.

## License

MIT

