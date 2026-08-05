import path from "node:path";
import { fileURLToPath } from "node:url";
import { WargamingClient } from "../src/core/wargaming-client.js";
import {
  readJson,
  sha256,
  writeJsonIfChanged,
} from "../src/core/json-output.js";
import { datasets } from "../src/registry.js";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(projectRoot, "public");
const manifestPath = path.join(publicRoot, "v1", "manifest.json");
const selectedIds = new Set(
  String(process.env.DATASETS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
);
const selectedDatasets = selectedIds.size
  ? datasets.filter((dataset) => selectedIds.has(dataset.id))
  : datasets;

if (!selectedDatasets.length) {
  throw new Error("No registered datasets matched the DATASETS filter.");
}

const now = new Date().toISOString();
const client = new WargamingClient({
  applicationId: process.env.WG_APPLICATION_ID,
});

console.log(`Building datasets: ${selectedDatasets.map((item) => item.id).join(", ")}`);

const builds = [];
for (const dataset of selectedDatasets) {
  const payload = await dataset.build({ client, now });
  dataset.validate(payload);
  builds.push({ dataset, payload });
}

const results = new Map();
for (const { dataset, payload } of builds) {
  const outputPath = path.join(publicRoot, dataset.outputPath);
  const result = await writeJsonIfChanged(outputPath, payload, {
    volatileKeys: dataset.volatileKeys,
  });
  results.set(dataset.id, result);
  console.log(`${dataset.id}: ${result.changed ? "updated" : "unchanged"}`);
}

const previousManifest = (await readJson(manifestPath)) ?? {
  schemaVersion: 1,
  updatedAt: null,
  datasets: {},
};
const manifestDatasets = { ...previousManifest.datasets };
let anyChanged = false;

for (const { dataset } of builds) {
  const result = results.get(dataset.id);
  const payload = result.payload;
  const changed = result.changed;
  anyChanged ||= changed;
  manifestDatasets[dataset.id] = {
    path: dataset.outputPath,
    count: dataset.count(payload),
    updatedAt:
      payload.updatedAt ??
      previousManifest.datasets?.[dataset.id]?.updatedAt ??
      null,
    sha256: sha256(payload),
  };
}

if (anyChanged) {
  await writeJsonIfChanged(
    manifestPath,
    {
      schemaVersion: 1,
      updatedAt: now,
      datasets: manifestDatasets,
    },
    { volatileKeys: [] },
  );
  console.log("manifest: updated");
} else {
  console.log("manifest: unchanged");
}
