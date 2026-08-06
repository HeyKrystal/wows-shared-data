import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  buildNationsPayload,
  normalizeNation,
  validateNationsPayload,
} from "../src/datasets/nations.js";

const fixture = JSON.parse(
  await readFile(new URL("./fixtures/nations-vortex.json", import.meta.url), "utf8"),
);

test("normalizes protocol-relative nation icon URLs", () => {
  const nation = normalizeNation(fixture.data.nations[0]);
  assert.equal(nation.id, "usa");
  assert.equal(nation.label, "U.S.A.");
  assert.equal(nation.images.tiny, "https://cdn.example.test/usa-tiny.png");
});

test("builds and validates the nation dataset", () => {
  const payload = buildNationsPayload(fixture, {
    now: "2026-08-06T03:00:00.000Z",
    language: "en",
  });

  validateNationsPayload(payload);
  assert.equal(payload.schemaVersion, 1);
  assert.equal(payload.source, "wargaming-vortex-glossary");
  assert.equal(payload.nations.length, 11);
  assert.equal(payload.nations[0].id, "commonwealth");
});
