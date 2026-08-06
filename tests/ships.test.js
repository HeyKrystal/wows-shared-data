import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { normalizeShip } from "../src/datasets/ships.js";

const fixture = JSON.parse(
  await readFile(new URL("./fixtures/ships-api.json", import.meta.url), "utf8"),
);

test("normalizes the ship fields used by client applications", () => {
  const ship = normalizeShip(fixture.ship, fixture.info);
  assert.equal(ship.id, "3552524080");
  assert.equal(ship.name, "Bismarck '41");
  assert.equal(ship.description, "Famous German battleship.");
  assert.equal(ship.tier, 8);
  assert.equal(ship.nation.label, "Germany");
  assert.deepEqual(Object.keys(ship.nation.images), [
    "tiny",
    "small",
    "default",
  ]);
  assert.equal(ship.type.label, "Battleship");
  assert.equal(ship.type.images.premium, "type-premium.png");
  assert.equal(ship.ratings.artillery, 70);
  assert.equal(ship.stats.hitPoints, 69200);
  assert.equal(ship.stats.mainBatteryRange, 19.5);
});
