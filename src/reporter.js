export function formatTextReport(results, options = {}) {
  const lines = [];
  const color = options.color !== false;
  const failed = results.filter((item) => item.issues.length > 0);

  lines.push("api-contract-checker report");
  lines.push(`Cases: ${results.length}`);
  lines.push(`Result: ${failed.length === 0 ? paint("PASS", "green", color) : paint("FAIL", "red", color)}`);

  for (const result of results) {
    lines.push("");
    lines.push(`${result.issues.length === 0 ? paint("PASS", "green", color) : paint("FAIL", "red", color)} ${result.name}`);
    lines.push(`  contract: ${result.contractPath}`);
    lines.push(`  sample:   ${result.samplePath}`);

    for (const item of result.issues) {
      lines.push(`  - ${item.path}: ${item.message} (${item.code})`);
    }
  }

  return `${lines.join("\n")}\n`;
}

export function formatJsonReport(results) {
  return `${JSON.stringify({ results }, null, 2)}\n`;
}

function paint(value, name, enabled) {
  if (!enabled) {
    return value;
  }

  const codes = {
    green: 32,
    red: 31
  };

  return `\u001B[${codes[name]}m${value}\u001B[0m`;
}

