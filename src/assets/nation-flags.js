import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const DEFAULT_NATIONS_FILE_URL = new URL(
  "../../public/v1/nations.json",
  import.meta.url,
);

const EMPTY_IMAGES = Object.freeze({
  tiny: null,
  small: null,
  default: null,
});

/**
 * Loads the committed nation dataset used by the nightly ship normalizer.
 *
 * A missing file is valid before the first committed nation refresh. Ships
 * still build, but their nation image fields remain null until nations.json
 * exists.
 */
export function loadNationsPayload(fileUrl = DEFAULT_NATIONS_FILE_URL) {
  try {
    const contents = readFileSync(fileURLToPath(fileUrl), "utf8");
    return JSON.parse(contents);
  } catch (error) {
    if (error?.code === "ENOENT") {
      return {
        schemaVersion: 1,
        nations: [],
      };
    }

    throw new Error(`Unable to load nation icon data: ${error.message}`, {
      cause: error,
    });
  }
}

export function createNationImageResolver(payload) {
  const nationsById = new Map(
    (payload?.nations ?? []).map((nation) => [String(nation.id), nation]),
  );

  return function resolveNationImages(nationId) {
    const nation = nationsById.get(String(nationId ?? ""));

    if (!nation) {
      return { ...EMPTY_IMAGES };
    }

    return {
      tiny: nation.images?.tiny ?? null,
      small: nation.images?.small ?? null,
      default: nation.images?.default ?? null,
    };
  };
}

/**
 * This resolver is created once for each Node process. The nightly data job
 * starts in a fresh process after checkout, so it always reads the latest
 * committed public/v1/nations.json before normalizing ships.
 */
export const nationImagesFor = createNationImageResolver(
  loadNationsPayload(),
);
