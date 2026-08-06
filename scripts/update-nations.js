import { appendFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  readJson,
  semanticallyEqual,
  sha256,
  writeJsonIfChanged,
} from "../src/core/json-output.js";
import { VortexClient } from "../src/core/vortex-client.js";
import {
  buildNationsPayload,
  countNations,
  NATIONS_QUERY,
  validateNationsPayload,
} from "../src/datasets/nations.js";

const DEFAULT_ENDPOINT =
  "https://vortex.worldofwarships.com/api/graphql/glossary/";
const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const nationsPath = path.join(projectRoot, "public", "v1", "nations.json");
const manifestPath = path.join(projectRoot, "public", "v1", "manifest.json");
const dryRun = process.argv.includes("--dry-run");
const endpoint = process.env.VORTEX_GLOSSARY_URL || DEFAULT_ENDPOINT;
const language = process.env.NATION_LANGUAGE || "en";
const now = new Date().toISOString();

const client = new VortexClient({ endpoint });
console.log(`Requesting nation metadata from ${endpoint}`);
console.log(`Language: ${language}`);
console.log(`Mode: ${dryRun ? "dry run" : "write changes"}`);

const response = await client.query({
  query: NATIONS_QUERY,
  variables: { lang: language },
});
const payload = buildNationsPayload(response, { now, language });
validateNationsPayload(payload);

const existing = await readJson(nationsPath);
const changed = !existing || !semanticallyEqual(existing, payload, ["updatedAt"]);
const imageCounts = payload.nations.reduce(
  (counts, nation) => {
    for (const size of ["tiny", "small", "default"]) {
      if (nation.images[size]) {
        counts[size] += 1;
      }
    }
    return counts;
  },
  { tiny: 0, small: 0, default: 0 },
);

console.log(`Received ${payload.nations.length} nations.`);
console.log(
  `Image coverage: tiny=${imageCounts.tiny}, small=${imageCounts.small}, default=${imageCounts.default}`,
);
console.log(`Nation data: ${changed ? "changed" : "unchanged"}`);
console.log(`IDs: ${payload.nations.map((nation) => nation.id).join(", ")}`);

if (!dryRun) {
  const result = await writeJsonIfChanged(nationsPath, payload, {
    volatileKeys: ["updatedAt"],
  });

  if (result.changed) {
    const previousManifest = (await readJson(manifestPath)) ?? {
      schemaVersion: 1,
      updatedAt: null,
      datasets: {},
    };

    await writeJsonIfChanged(
      manifestPath,
      {
        schemaVersion: 1,
        updatedAt: now,
        datasets: {
          ...previousManifest.datasets,
          nations: {
            path: "v1/nations.json",
            count: countNations(payload),
            updatedAt: now,
            sha256: sha256(payload),
          },
        },
      },
      { volatileKeys: [] },
    );
  }
}

if (process.env.GITHUB_OUTPUT) {
  await appendFile(
    process.env.GITHUB_OUTPUT,
    `changed=${changed}\ncount=${payload.nations.length}\n`,
    "utf8",
  );
}

if (process.env.GITHUB_STEP_SUMMARY) {
  const rows = payload.nations
    .map(
      (nation) =>
        `| \`${nation.id}\` | ${nation.label} | ${nation.images.tiny ? "Yes" : "No"} | ${nation.images.small ? "Yes" : "No"} | ${nation.images.default ? "Yes" : "No"} |`,
    )
    .join("\n");

  await appendFile(
    process.env.GITHUB_STEP_SUMMARY,
    [
      "## Nation icon refresh",
      "",
      `- Mode: **${dryRun ? "Dry run" : "Write changes"}**`,
      `- Endpoint: \`${endpoint}\``,
      `- Nations received: **${payload.nations.length}**`,
      `- Meaningful change detected: **${changed ? "Yes" : "No"}**`,
      "",
      "| ID | Label | Tiny | Small | Default |",
      "|---|---|---:|---:|---:|",
      rows,
      "",
    ].join("\n"),
    "utf8",
  );
}

if (dryRun) {
  console.log("Dry run complete. No files were written.");
} else if (changed) {
  console.log("Nation data and manifest were updated.");
} else {
  console.log("No nation files needed updating.");
}
