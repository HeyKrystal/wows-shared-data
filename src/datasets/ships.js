import { nationImagesFor } from "../assets/nation-flags.js";
import {
  asNumber,
  asText,
  firstNumber,
  readRating,
} from "../core/normalization.js";

function typeImagesFor(info, typeId) {
  const images = info.ship_type_images ?? {};
  const entry = images[typeId] ?? {};
  return {
    default: entry.image ?? null,
    premium: entry.image_premium ?? null,
    special: entry.image_elite ?? null,
  };
}

function normalizeRatings(profile) {
  const weaponry = profile.weaponry ?? {};
  return {
    survivability: readRating(profile.armour),
    artillery: readRating(weaponry.artillery),
    torpedoes: readRating(weaponry.torpedoes),
    antiAircraft: readRating(weaponry.anti_aircraft),
    maneuverability: readRating(profile.mobility),
    concealment: readRating(profile.concealment),
    aircraft: readRating(weaponry.aircraft),
  };
}

function normalizeStats(profile) {
  return {
    hitPoints: firstNumber(profile.hull?.health, profile.armour?.health),
    maxSpeed: firstNumber(profile.engine?.max_speed, profile.mobility?.max_speed),
    turningRadius: firstNumber(profile.mobility?.turning_radius),
    rudderShiftTime: firstNumber(profile.mobility?.rudder_time),
    surfaceDetectability: firstNumber(
      profile.concealment?.detect_distance_by_ship,
    ),
    airDetectability: firstNumber(
      profile.concealment?.detect_distance_by_plane,
    ),
    mainBatteryRange: firstNumber(profile.artillery?.distance),
  };
}

export function normalizeShip(ship, info) {
  const id = String(ship.ship_id ?? "");
  const typeId = String(ship.type ?? "");
  const nationId = String(ship.nation ?? "");
  const profile = ship.default_profile ?? {};

  return {
    id,
    name: asText(ship.name),
    description: asText(ship.description),
    tier: asNumber(ship.tier),
    nation: {
      id: nationId,
      label: asText(info.ship_nations?.[nationId]) ?? nationId,
      images: nationImagesFor(nationId),
    },
    type: {
      id: typeId,
      label: asText(info.ship_types?.[typeId]) ?? typeId,
      images: typeImagesFor(info, typeId),
    },
    premium: Boolean(ship.is_premium),
    special: Boolean(ship.is_special),
    images: {
      contour: ship.images?.contour ?? null,
      small: ship.images?.small ?? null,
      medium: ship.images?.medium ?? null,
      large: ship.images?.large ?? null,
    },
    ratings: normalizeRatings(profile),
    stats: normalizeStats(profile),
  };
}

export const shipsDataset = {
  id: "ships",
  outputPath: "v1/ships.json",
  volatileKeys: ["updatedAt"],

  async build({ client, now }) {
    const [infoPayload, ships] = await Promise.all([
      client.get("info"),
      client.getAllPages("ships"),
    ]);
    const info = infoPayload.data ?? {};

    const normalized = ships
      .map((ship) => normalizeShip(ship, info))
      .filter((ship) => ship.id && ship.name)
      .sort((left, right) => {
        const tierDifference = (left.tier ?? 0) - (right.tier ?? 0);
        return tierDifference || left.name.localeCompare(right.name);
      });

    return {
      schemaVersion: 1,
      updatedAt: now,
      ships: normalized,
    };
  },

  validate(payload) {
    if (!Array.isArray(payload.ships) || payload.ships.length < 500) {
      throw new Error(
        `Ships dataset is unexpectedly small (${payload.ships?.length ?? 0}).`,
      );
    }

    const ids = new Set();
    for (const ship of payload.ships) {
      if (!ship.id || !ship.name || !ship.tier || !ship.type?.id || !ship.nation?.id) {
        throw new Error(`Invalid ship record: ${JSON.stringify(ship)}`);
      }
      if (ids.has(ship.id)) {
        throw new Error(`Duplicate ship ID ${ship.id}.`);
      }
      ids.add(ship.id);
    }
  },

  count(payload) {
    return payload.ships.length;
  },
};
