import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const nationsFileUrl = new URL(
  "../../public/v1/nations.json",
  import.meta.url,
);

function loadNationsPayload() {
  try {
    const contents = readFileSync(
      fileURLToPath(nationsFileUrl),
      "utf8",
    );

    return JSON.parse(contents);
  } catch (error) {
    if (error.code === "ENOENT") {
      return {
        schemaVersion: 1,
        nations: [],
      };
    }

    throw new Error(
      `Unable to load nation icon data: ${error.message}`,
      {
        cause: error,
      },
    );
  }
}

const nationsPayload = loadNationsPayload();

const nationsById = new Map(
  (nationsPayload.nations ?? []).map((nation) => [
    String(nation.id),
    nation,
  ]),
);

export function nationImagesFor(nationId) {
  const nation = nationsById.get(
    String(nationId ?? ""),
  );

  return {
    tiny: nation?.images?.tiny ?? null,
    small: nation?.images?.small ?? null,
    default: nation?.images?.default ?? null,
  };
}