import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { writeJsonIfChanged } from "../src/core/json-output.js";

test("does not rewrite a dataset when only updatedAt changed", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "wows-data-"));
  const filePath = path.join(directory, "dataset.json");

  try {
    const first = await writeJsonIfChanged(filePath, {
      updatedAt: "2026-08-05T00:00:00.000Z",
      items: [{ id: "1", name: "A" }],
    });
    const second = await writeJsonIfChanged(filePath, {
      updatedAt: "2026-08-06T00:00:00.000Z",
      items: [{ id: "1", name: "A" }],
    });
    const third = await writeJsonIfChanged(filePath, {
      updatedAt: "2026-08-06T00:00:00.000Z",
      items: [{ id: "1", name: "B" }],
    });

    assert.equal(first.changed, true);
    assert.equal(second.changed, false);
    assert.equal(third.changed, true);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
