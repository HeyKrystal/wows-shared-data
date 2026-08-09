import assert from "node:assert/strict";
import test from "node:test";

import { nationImagesFor } from "../src/assets/nation-flags.js";

test("resolves a known nation to the shared Pages asset", () => {
  assert.deepEqual(nationImagesFor("italy"), {
    tiny:
      "https://heykrystal.github.io/wows-shared-data/assets/wargaming/nations/italy.png",
    small: null,
    default: null,
  });
});

test("returns null images for an unknown nation", () => {
  assert.deepEqual(nationImagesFor("new_nation"), {
    tiny: null,
    small: null,
    default: null,
  });
});

test("normalizes nation IDs before resolving an asset", () => {
  assert.equal(
    nationImagesFor("  GERMANY  ").tiny,
    "https://heykrystal.github.io/wows-shared-data/assets/wargaming/nations/germany.png",
  );
});