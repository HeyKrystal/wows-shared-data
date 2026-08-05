import { asNumber, asText } from "../core/normalization.js";

export function normalizeCollection(collection, sizes) {
  const numericId = Number(collection.collection_id);
  const lookupId = String(collection.collection_id ?? "");

  return {
    id: numericId,
    name: asText(collection.name),
    size: sizes.get(lookupId) ?? 0,
    duplicateRate: asNumber(collection.card_cost),
    image: collection.image ?? collection.images?.small ?? null,
  };
}

export const collectionsDataset = {
  id: "collections",
  outputPath: "v1/collections.json",
  volatileKeys: ["updatedAt"],

  async build({ client, now }) {
    const [collections, cards] = await Promise.all([
      client.getAllPages("collections"),
      client.getAllPages("collectioncards"),
    ]);

    const sizes = new Map();
    for (const card of cards) {
      const collectionId = String(card.collection_id ?? "");
      if (collectionId) {
        sizes.set(collectionId, (sizes.get(collectionId) ?? 0) + 1);
      }
    }

    const normalized = collections
      .map((collection) => normalizeCollection(collection, sizes))
      .filter(
        (collection) =>
          Number.isInteger(collection.id) &&
          collection.name &&
          Number.isInteger(collection.size) &&
          collection.size > 0 &&
          Number.isInteger(collection.duplicateRate) &&
          collection.duplicateRate > 0,
      )
      .sort((left, right) => left.name.localeCompare(right.name));

    return {
      updatedAt: now,
      collections: normalized,
    };
  },

  validate(payload) {
    if (!Array.isArray(payload.collections) || payload.collections.length < 40) {
      throw new Error(
        `Collections dataset is unexpectedly small (${payload.collections?.length ?? 0}).`,
      );
    }

    for (const collection of payload.collections) {
      if (
        !Number.isInteger(collection.id) ||
        !collection.name ||
        !Number.isInteger(collection.size) ||
        collection.size < 1 ||
        !Number.isInteger(collection.duplicateRate) ||
        collection.duplicateRate < 1
      ) {
        throw new Error(`Invalid collection record: ${JSON.stringify(collection)}`);
      }
    }
  },

  count(payload) {
    return payload.collections.length;
  },
};
