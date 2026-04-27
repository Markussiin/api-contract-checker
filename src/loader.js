import fs from "node:fs";
import path from "node:path";

export function loadJson(cwd, filePath) {
  const absolutePath = path.resolve(cwd, filePath);

  try {
    return {
      path: absolutePath,
      value: JSON.parse(fs.readFileSync(absolutePath, "utf8"))
    };
  } catch (error) {
    throw new Error(`Could not load JSON from ${filePath}: ${error.message}`);
  }
}

export function loadSuite(cwd, suitePath) {
  const suite = loadJson(cwd, suitePath);

  if (!Array.isArray(suite.value.cases)) {
    throw new Error("Suite file must contain a cases array");
  }

  return {
    path: suite.path,
    cases: suite.value.cases.map((item, index) => {
      if (!item.name || !item.contract || !item.sample) {
        throw new Error(`Suite case ${index + 1} must include name, contract, and sample`);
      }

      return item;
    })
  };
}

