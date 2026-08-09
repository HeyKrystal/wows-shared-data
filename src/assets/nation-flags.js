import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const NATION_ASSET_BASE_URL =
  "https://heykrystal.github.io/wows-shared-data/public/assets/wargaming/nations/icons";

const NATION_ASSET_DIRECTORY = new URL(
  "../../public/assets/wargaming/nations/icons/",
  import.meta.url,
);

const EMPTY_IMAGES = Object.freeze({
  tiny: null,
  small: null,
  default: null,
});

/**
 * Resolves manually maintained Wargaming nation artwork hosted by this
 * repository's GitHub Pages site.
 *
 * The local asset directory is the source of truth. If a matching icon exists,
 * its public Pages URL is included in the normalized ship data. Unknown nations
 * remain null until their asset is manually reviewed and added.
 */
export function nationImagesFor(nationId) {
  const normalizedId = String(nationId ?? "")
    .trim()
    .toLowerCase();

  if (!normalizedId) {
    return { ...EMPTY_IMAGES };
  }

  const assetFile = new URL(
    `${normalizedId}.png`,
    NATION_ASSET_DIRECTORY,
  );

  if (!existsSync(fileURLToPath(assetFile))) {
    return { ...EMPTY_IMAGES };
  }

  return {
    tiny: `${NATION_ASSET_BASE_URL}/${normalizedId}.png`,
    small: null,
    default: null,
  };
}