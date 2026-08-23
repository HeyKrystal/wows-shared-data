import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";

const CATALOG_URL = new URL(
  "../public/assets/wargaming/resources/catalog.json",
  import.meta.url,
);

const EXPECTED_RESOURCES = [
  ["coal", "Coal", "icons/icon_coal.png"],
  [
    "communityTokens",
    "Community Tokens",
    "icons/icon_recruitment_points.png",
  ],
  ["freeXp", "Free XP", "icons/icon_freeXP.png"],
  ["credits", "Credits", "icons/icon_credits.png"],
  ["eliteCommanderXp", "Elite Commander XP", "icons/icon_eliteXP.png"],
  ["doubloons", "Doubloons", "icons/icon_gold.png"],
];

async function loadCatalog() {
  return JSON.parse(await readFile(CATALOG_URL, "utf8"));
}

test("resource icon catalog exposes the expected stable resources", async () => {
  const catalog = await loadCatalog();

  assert.equal(catalog.schemaVersion, 1);
  assert.deepEqual(
    catalog.resources.map(({ id, label, icon }) => [id, label, icon]),
    EXPECTED_RESOURCES,
  );
});

test("every resource catalog icon points to an existing local asset", async () => {
  const catalog = await loadCatalog();

  for (const resource of catalog.resources) {
    assert.match(resource.icon, /^icons\/[^/]+\.png$/);

    const assetUrl = new URL(resource.icon, CATALOG_URL);
    await assert.doesNotReject(
      access(fileURLToPath(assetUrl)),
      `${resource.id} should resolve to ${assetUrl.pathname}`,
    );
  }
});

test("resource IDs are unique", async () => {
  const catalog = await loadCatalog();
  const ids = catalog.resources.map((resource) => resource.id);

  assert.equal(new Set(ids).size, ids.length);
});
