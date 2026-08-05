export function asNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function asText(value) {
  const text = String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
  return text || null;
}

export function firstNumber(...values) {
  for (const value of values) {
    const number = asNumber(value);
    if (number !== null) {
      return number;
    }
  }
  return null;
}

export function readRating(value) {
  if (typeof value === "number") {
    return value;
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  return firstNumber(value.total, value.rating, value.score, value.value);
}
