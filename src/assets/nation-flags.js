const NATION_ASSET_BASE_URL =
  "https://heykrystal.github.io/wows-shared-data/assets/wargaming/nations/icons";

const NATION_IDS = new Set([
  "commonwealth",
  "europe",
  "france",
  "germany",
  "italy",
  "japan",
  "netherlands",
  "pan_america",
  "pan_asia",
  "spain",
  "uk",
  "usa",
  "ussr",
]);

const EMPTY_IMAGES = Object.freeze({
  tiny: null,
  small: null,
  default: null,
});

/**
 * Resolves manually maintained Wargaming nation artwork hosted by this
 * repository's GitHub Pages site.
 *
 * Only the tiny icon is currently stored. Unknown nation IDs intentionally
 * return null images until their asset has been manually reviewed and added.
 */
export function nationImagesFor(nationId) {
  const normalizedId = String(nationId ?? "")
    .trim()
    .toLowerCase();

  if (!NATION_IDS.has(normalizedId)) {
    return { ...EMPTY_IMAGES };
  }

  return {
    tiny: `${NATION_ASSET_BASE_URL}/${normalizedId}.png`,
    small: null,
    default: null,
  };
}