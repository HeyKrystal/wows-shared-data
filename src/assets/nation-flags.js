import nationsPayload from "../../public/v1/nations.json" with { type: "json" };

const nationsById = new Map(
  (nationsPayload.nations ?? []).map((nation) => [String(nation.id), nation]),
);

export function nationImagesFor(nationId) {
  const nation = nationsById.get(String(nationId ?? ""));
  return {
    tiny: nation?.images?.tiny ?? null,
    small: nation?.images?.small ?? null,
    default: nation?.images?.default ?? null,
  };
}
