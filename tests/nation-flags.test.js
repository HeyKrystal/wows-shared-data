import assert from "node:assert/strict";
import test from "node:test";

import { nationImagesFor } from "../src/assets/nation-flags.js";

test("resolves an existing nation icon to the shared Pages asset", () => {
  assert.deepEqual(nationImagesFor("germany"), {
    tiny:
      "https://heykrystal.github.io/wows-shared-data/assets/wargaming/nations/icons/germany.png",
    small: null,
    default: null,
  });
});

test("returns null images when no matching nation icon exists", () => {
  assert.deepEqual(nationImagesFor("definitely_not_a_real_nation"), {
    tiny: null,
    small: null,
    default: null,
  });
});

test("normalizes nation IDs before resolving an icon", () => {
  assert.equal(
    nationImagesFor("  GERMANY  ").tiny,
    "https://heykrystal.github.io/wows-shared-data/assets/wargaming/nations/icons/germany.png",
  );
});