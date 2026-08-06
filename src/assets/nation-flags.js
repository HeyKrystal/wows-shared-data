const NATION_FLAG_URLS = Object.freeze({
  pan_america: Object.freeze({
    tiny:
      "https://wows-gloss-icons.wgcdn.co/icons/nation_flags/tiny/flag_Pan_America_66683fa0d219a205edc85a0afb7155c3746fa17c637393c11ed54e3cc22f3616.png",
  }),
});

export function nationImagesFor(nationId) {
  const images = NATION_FLAG_URLS[String(nationId ?? "")] ?? {};
  return {
    tiny: images.tiny ?? null,
  };
}
