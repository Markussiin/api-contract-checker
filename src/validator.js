export function validateContract(contract, value, path = "$") {
  const issues = [];

  validateNode(contract, value, path, issues);
  return issues;
}

function validateNode(contract, value, path, issues) {
  if (!isObject(contract)) {
    issues.push(issue("invalid-contract", path, "Contract node must be an object"));
    return;
  }

  const allowedTypes = normalizeTypes(contract.type);
  const actualType = typeOf(value);

  if (allowedTypes.length > 0 && !allowedTypes.includes(actualType)) {
    issues.push(issue("type-mismatch", path, `Expected ${allowedTypes.join(" or ")}, received ${actualType}`));
    return;
  }

  if (contract.enum && !contract.enum.some((item) => Object.is(item, value))) {
    issues.push(issue("enum-mismatch", path, `Expected one of ${JSON.stringify(contract.enum)}`));
  }

  if (shouldValidateObject(contract, allowedTypes, actualType)) {
    validateObject(contract, value, path, issues);
  }

  if (shouldValidateArray(contract, allowedTypes, actualType)) {
    validateArray(contract, value, path, issues);
  }
}

function shouldValidateObject(contract, allowedTypes, actualType) {
  const hasObjectShape = typeAllows(allowedTypes, "object") || contract.properties || contract.required;
  return hasObjectShape && (allowedTypes.length === 0 || actualType === "object");
}

function shouldValidateArray(contract, allowedTypes, actualType) {
  const hasArrayShape = typeAllows(allowedTypes, "array") || contract.items;
  return hasArrayShape && (allowedTypes.length === 0 || actualType === "array");
}

function validateObject(contract, value, path, issues) {
  if (!isObject(value)) {
    issues.push(issue("type-mismatch", path, `Expected object, received ${typeOf(value)}`));
    return;
  }

  const properties = contract.properties ?? {};
  const required = contract.required ?? [];

  for (const key of required) {
    if (!Object.hasOwn(value, key)) {
      issues.push(issue("missing-required", `${path}.${key}`, "Required property is missing"));
    }
  }

  for (const [key, childContract] of Object.entries(properties)) {
    if (Object.hasOwn(value, key)) {
      validateNode(childContract, value[key], `${path}.${key}`, issues);
    }
  }

  if (contract.additionalProperties === false) {
    for (const key of Object.keys(value)) {
      if (!Object.hasOwn(properties, key)) {
        issues.push(issue("unexpected-property", `${path}.${key}`, "Property is not defined by the contract"));
      }
    }
  }
}

function validateArray(contract, value, path, issues) {
  if (!Array.isArray(value)) {
    issues.push(issue("type-mismatch", path, `Expected array, received ${typeOf(value)}`));
    return;
  }

  if (typeof contract.minItems === "number" && value.length < contract.minItems) {
    issues.push(issue("too-few-items", path, `Expected at least ${contract.minItems} items`));
  }

  if (typeof contract.maxItems === "number" && value.length > contract.maxItems) {
    issues.push(issue("too-many-items", path, `Expected at most ${contract.maxItems} items`));
  }

  if (contract.items) {
    value.forEach((item, index) => validateNode(contract.items, item, `${path}[${index}]`, issues));
  }
}

function normalizeTypes(type) {
  if (!type) {
    return [];
  }

  return Array.isArray(type) ? type : [type];
}

function typeAllows(types, type) {
  return types.includes(type);
}

function typeOf(value) {
  if (Array.isArray(value)) {
    return "array";
  }

  if (value === null) {
    return "null";
  }

  return typeof value;
}

function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function issue(code, path, message) {
  return { code, path, message };
}
