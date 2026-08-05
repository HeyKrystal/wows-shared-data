const DEFAULT_API_ROOT = "https://api.worldofwarships.com/wows/encyclopedia";
const DEFAULT_PAGE_SIZE = 100;
const MAX_PAGES = 100;

export class WargamingClient {
  constructor({ applicationId, apiRoot = DEFAULT_API_ROOT, language = "en" }) {
    if (!applicationId) {
      throw new Error("WG_APPLICATION_ID is required.");
    }

    this.applicationId = applicationId;
    this.apiRoot = apiRoot.replace(/\/$/, "");
    this.language = language;
  }

  async get(path, parameters = {}) {
    const url = new URL(`${this.apiRoot}/${path.replace(/^\//, "")}/`);
    const query = {
      application_id: this.applicationId,
      language: this.language,
      ...parameters,
    };

    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      throw new Error(`Wargaming API returned HTTP ${response.status} for ${path}.`);
    }

    const payload = await response.json();
    if (payload.status !== "ok") {
      const error = payload.error ?? {};
      throw new Error(
        `Wargaming API error for ${path}: ${error.message ?? "unknown error"}`,
      );
    }

    return payload;
  }

  async getAllPages(path, parameters = {}) {
    const items = [];

    for (let page = 1; page <= MAX_PAGES; page += 1) {
      const payload = await this.get(path, {
        limit: DEFAULT_PAGE_SIZE,
        page_no: page,
        ...parameters,
      });

      items.push(...Object.values(payload.data ?? {}));

      const pageTotal = Number(payload.meta?.page_total ?? 1);
      if (page >= pageTotal) {
        return items;
      }
    }

    throw new Error(`${path} exceeded the ${MAX_PAGES}-page safety limit.`);
  }
}
