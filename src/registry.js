import { collectionsDataset } from "./datasets/collections.js";
import { shipsDataset } from "./datasets/ships.js";

/**
 * Add a future dataset by importing its module and appending it here.
 * A dataset supplies: id, outputPath, build(), validate(), and count().
 */
export const datasets = [collectionsDataset, shipsDataset];
