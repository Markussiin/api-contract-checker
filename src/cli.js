import path from "node:path";
import { loadJson, loadSuite } from "./loader.js";
import { formatJsonReport, formatTextReport } from "./reporter.js";
import { validateContract } from "./validator.js";

export async function runCli(args, io) {
  const options = parseArgs(args);

  if (options.help) {
    io.stdout.write(helpText());
    return;
  }

  const cases = options.suite ? loadCasesFromSuite(io.cwd, options.suite) : [loadSingleCase(io.cwd, options)];
  const results = cases.map((item) => {
    const contract = loadJson(io.cwd, item.contract);
    const sample = loadJson(io.cwd, item.sample);

    return {
      name: item.name,
      contractPath: path.relative(io.cwd, contract.path).replaceAll(path.sep, "/"),
      samplePath: path.relative(io.cwd, sample.path).replaceAll(path.sep, "/"),
      issues: validateContract(contract.value, sample.value)
    };
  });

  io.stdout.write(options.json ? formatJsonReport(results) : formatTextReport(results, { color: options.color }));

  if (results.some((item) => item.issues.length > 0)) {
    process.exitCode = 1;
  }
}

export function parseArgs(args) {
  const options = {
    contract: undefined,
    sample: undefined,
    suite: undefined,
    name: "contract check",
    json: false,
    color: !process.env.NO_COLOR,
    help: false
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "-h" || arg === "--help") {
      options.help = true;
    } else if (arg === "--contract") {
      options.contract = readValue(args, ++index, arg);
    } else if (arg === "--sample") {
      options.sample = readValue(args, ++index, arg);
    } else if (arg === "--suite") {
      options.suite = readValue(args, ++index, arg);
    } else if (arg === "--name") {
      options.name = readValue(args, ++index, arg);
    } else if (arg === "--json") {
      options.json = true;
    } else if (arg === "--no-color") {
      options.color = false;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.help && !options.suite && (!options.contract || !options.sample)) {
    throw new Error("Provide --suite or both --contract and --sample");
  }

  return options;
}

function loadCasesFromSuite(cwd, suitePath) {
  const suite = loadSuite(cwd, suitePath);
  const suiteDir = path.dirname(path.relative(cwd, suite.path));

  return suite.cases.map((item) => ({
    name: item.name,
    contract: path.join(suiteDir, item.contract),
    sample: path.join(suiteDir, item.sample)
  }));
}

function loadSingleCase(cwd, options) {
  return {
    name: options.name,
    contract: path.relative(cwd, path.resolve(cwd, options.contract)),
    sample: path.relative(cwd, path.resolve(cwd, options.sample))
  };
}

function readValue(args, index, flag) {
  const value = args[index];

  if (!value || value.startsWith("--")) {
    throw new Error(`${flag} requires a value`);
  }

  return value;
}

function helpText() {
  return `api-contract-checker

Validate saved API response samples against lightweight JSON contracts.

Usage:
  api-contract-checker --contract <file> --sample <file>
  api-contract-checker --suite <file>

Options:
  --contract <file>  Contract JSON file
  --sample <file>    API response sample JSON file
  --suite <file>     Suite JSON file with multiple cases
  --name <text>      Name for a single check
  --json             Print JSON instead of text
  --no-color         Disable ANSI colors
  -h, --help         Show help

Contract fields:
  type, required, properties, items, enum, minItems, maxItems, additionalProperties
`;
}

