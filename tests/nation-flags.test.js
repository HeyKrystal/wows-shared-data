import assert from "node:assert/strict";
import test from "node:test";
import {
  createNationImageResolver,
  loadNationsPayload,
} from "../src/assets/nation-flags.js";

test("resolves committed nation images by nation ID", () => {
  const resolveImages = createNationImageResolver({
    nations: [
      {
        id: "italy",
        images: {
          tiny: "https://cdn.example.test/italy-tiny.png",
          small: "https://cdn.example.test/italy-small.png",
          default: "https://cdn.example.test/italy-default.png",
        },
      },
    ],
  });

  assert.deepEqual(resolveImages("italy"), {
    tiny: "https://cdn.example.test/italy-tiny.png",
    small: "https://cdn.example.test/italy-small.png",
    default: "https://cdn.example.test/italy-default.png",
  });
});

test("returns null images for an unknown nation", () => {
  const resolveImages = createNationImageResolver({ nations: [] });

  assert.deepEqual(resolveImages("new_nation"), {
    tiny: null,
    small: null,
    default: null,
  });
});

test("allows the nation dataset to be absent before its first refresh", () => {
  const payload = loadNationsPayload(
    new URL("./fixtures/does-not-exist.json", import.meta.url),
  );

  assert.deepEqual(payload.nations, []);
});
