const MINIMUM_EXPECTED_NATIONS = 10;

export const NATIONS_QUERY = `
  query Nation($lang: String) {
    nations(lang: $lang) {
      title
      name
      icons {
        small
        tiny
        default
      }
    }
  }
`;

function asText(value) {
  const text = String(value ?? "").trim();
  return text || null;
}

function normalizeUrl(value) {
  const url = asText(value);
  if (!url) {
    return null;
  }
  if (url.startsWith("//")) {
    return `https:${url}`;
  }
  return url;
}

export function normalizeNation(nation) {
  return {
    id: asText(nation?.name),
    label: asText(nation?.title) ?? asText(nation?.name),
    images: {
      tiny: normalizeUrl(nation?.icons?.tiny),
      small: normalizeUrl(nation?.icons?.small),
      default: normalizeUrl(nation?.icons?.default),
    },
  };
}

export function buildNationsPayload(response, { now, language = "en" } = {}) {
  const sourceNations = response?.data?.nations;
  if (!Array.isArray(sourceNations)) {
    throw new Error("Vortex response did not contain data.nations.");
  }

  const nations = sourceNations
    .map(normalizeNation)
    .filter((nation) => nation.id && nation.label)
    .sort((left, right) => left.id.localeCompare(right.id));

  return {
    schemaVersion: 1,
    updatedAt: now ?? new Date().toISOString(),
    source: "wargaming-vortex-glossary",
    language,
    nations,
  };
}

export function validateNationsPayload(payload) {
  if (!Array.isArray(payload?.nations)) {
    throw new Error("Nations payload must contain a nations array.");
  }

  if (payload.nations.length < MINIMUM_EXPECTED_NATIONS) {
    throw new Error(
      `Nations dataset is unexpectedly small (${payload.nations.length}).`,
    );
  }

  const ids = new Set();
  for (const nation of payload.nations) {
    if (!nation.id || !nation.label || !nation.images?.tiny) {
      throw new Error(`Invalid nation record: ${JSON.stringify(nation)}`);
    }

    if (ids.has(nation.id)) {
      throw new Error(`Duplicate nation ID ${nation.id}.`);
    }
    ids.add(nation.id);

    for (const [size, url] of Object.entries(nation.images)) {
      if (url !== null && !url.startsWith("https://")) {
        throw new Error(
          `Nation ${nation.id} has a non-HTTPS ${size} image URL: ${url}`,
        );
      }
    }
  }
}

export function countNations(payload) {
  return payload.nations.length;
}
