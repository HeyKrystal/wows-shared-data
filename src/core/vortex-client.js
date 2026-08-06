const DEFAULT_TIMEOUT_MS = 20_000;

export class VortexClient {
  constructor({ endpoint, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
    if (!endpoint) {
      throw new Error("A Vortex GraphQL endpoint is required.");
    }

    this.endpoint = new URL(endpoint).toString();
    this.timeoutMs = timeoutMs;
  }

  async query({ query, variables = {} }) {
    if (!query?.trim()) {
      throw new Error("A GraphQL query is required.");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
        },
        body: JSON.stringify({ query, variables }),
        redirect: "follow",
        signal: controller.signal,
      });

      if (response.status === 429) {
        throw new Error(
          "Vortex returned HTTP 429 (rate limited). Stop and try again later.",
        );
      }

      if (!response.ok) {
        const body = (await response.text()).slice(0, 500);
        throw new Error(
          `Vortex returned HTTP ${response.status}. Response: ${body || "<empty>"}`,
        );
      }

      const payload = await response.json();
      if (Array.isArray(payload.errors) && payload.errors.length) {
        const messages = payload.errors
          .map((error) => error?.message)
          .filter(Boolean)
          .join("; ");
        throw new Error(`Vortex GraphQL error: ${messages || "Unknown error"}`);
      }

      return payload;
    } catch (error) {
      if (error?.name === "AbortError") {
        throw new Error(
          `Vortex request timed out after ${this.timeoutMs} milliseconds.`,
        );
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}
