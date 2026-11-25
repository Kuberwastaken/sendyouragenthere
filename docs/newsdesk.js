import dispatch from "./edition.json" with { type: "json" };
export { dispatch };

const dayMs = 86400000;
const emptySchema = { type: "object", properties: {}, additionalProperties: false };

function dateString(date) {
  return date.toISOString().slice(0, 10);
}

async function headlines(start, end) {
  const url = new URL("https://hn.algolia.com/api/v1/search");
  url.search = new URLSearchParams({
    tags: "story",
    numericFilters: `created_at_i>=${Math.floor(start / 1000)},created_at_i<${Math.floor(end / 1000)}`,
    hitsPerPage: "8",
  });
  const response = await fetch(url, { credentials: "omit", referrerPolicy: "no-referrer", signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error("The Hacker News index is unavailable. The local dispatch is still available.");
  const { hits } = await response.json();
  return hits.map(hit => ({
    headline: hit.title, points: hit.points,
    discussion: `https://news.ycombinator.com/item?id=${hit.objectID}`,
  }));
}

export const newsTools = [
  {
    name: "current_day",
    description: "Return the current UTC publication day and the date of the local dispatch.",
    inputSchema: emptySchema,
    execute: () => ({ day: dateString(new Date()), timezone: "UTC", latestDispatch: dispatch.date }),
  },
  {
    name: "seek_day",
    description: "Look up a UTC date in the Hacker News index and find any matching local dispatch.",
    inputSchema: { type: "object", properties: { day: { type: "string", format: "date" } }, required: ["day"], additionalProperties: false },
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    async execute({ day }) {
      const start = Date.parse(day + "T00:00:00Z");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isFinite(start) || dateString(new Date(start)) !== day || start > Date.now()) {
        throw new Error("Use an existing UTC calendar date.");
      }
      return { day, localDispatch: day === dispatch.date ? dispatch : null, source: "Hacker News via Algolia", headlines: await headlines(start, start + dayMs) };
    },
  },
  {
    name: "trending_topics",
    description: "Get Hacker News ranked headlines published in the last 24 hours. Rankings reflect community activity.",
    inputSchema: emptySchema,
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    async execute() {
      const now = Date.now();
      return { source: "Hacker News via Algolia", asOf: new Date(now).toISOString(), headlines: await headlines(now - dayMs, now) };
    },
  },
  {
    name: "read_dispatch",
    description: "Read the full local technology dispatch and its source.",
    inputSchema: emptySchema,
    execute: () => dispatch,
  },
];
