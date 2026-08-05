import assert from "node:assert/strict";
import test from "node:test";
import { normalizeCollection } from "../src/datasets/collections.js";

test("preserves the Collection Calculator data contract", () => {
  const sizes = new Map([["4254047152", 16]]);
  const collection = normalizeCollection(
    {
      collection_id: 4254047152,
      name: "'39–'45 Chronicles",
      card_cost: 4,
      image: "collection.png",
    },
    sizes,
  );

  assert.equal(collection.id, 4254047152);
  assert.equal(typeof collection.id, "number");
  assert.equal(collection.size, 16);
  assert.equal(collection.duplicateRate, 4);
  assert.equal(collection.image, "collection.png");
});
