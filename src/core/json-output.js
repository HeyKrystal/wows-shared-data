import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

function omitVolatile(value, volatileKeys) {
  if (Array.isArray(value)) {
    return value.map((item) => omitVolatile(item, volatileKeys));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !volatileKeys.has(key))
        .map(([key, nested]) => [key, omitVolatile(nested, volatileKeys)]),
    );
  }

  return value;
}

export function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value).sort(([left], [right]) =>
      left.localeCompare(right),
    );
    return `{${entries
      .map(([key, nested]) => `${JSON.stringify(key)}:${stableStringify(nested)}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

export function semanticallyEqual(left, right, volatileKeys = ["updatedAt"]) {
  const keys = new Set(volatileKeys);
  return (
    stableStringify(omitVolatile(left, keys)) ===
    stableStringify(omitVolatile(right, keys))
  );
}

export async function readJson(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

export async function writeJsonIfChanged(filePath, payload, options = {}) {
  const existing = await readJson(filePath);
  const volatileKeys = options.volatileKeys ?? ["updatedAt"];

  if (existing && semanticallyEqual(existing, payload, volatileKeys)) {
    return { changed: false, payload: existing };
  }

  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return { changed: true, payload };
}

export function sha256(value) {
  const text = typeof value === "string" ? value : stableStringify(value);
  return createHash("sha256").update(text).digest("hex");
}
