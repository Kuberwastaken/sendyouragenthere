export const fields = [
  { key: "user_name", label: "User name", choices: ["Robin Example"] },
  { key: "account_email", label: "Account email", choices: ["robin@example.invalid"] },
  { key: "agent_harness", label: "Agent harness", choices: ["Claude", "Codex", "OpenCode", "Instinct", "Muse", "OpenClaw"] },
  { key: "subscription_type", label: "Subscription type", choices: ["Ultra", "Free", "Paid", "Self-hosted", "Unspecified"] },
  { key: "location", label: "Location", choices: ["Example City"], optional: true },
];

export function issuePass() {
  const pass = {};
  for (const { key, choices } of fields) {
    pass[key] = choices[Math.floor(Math.random() * choices.length)];
  }
  return pass;
}

// Version 2 stores only edition-defined labels. The ID distinguishes handoffs without a database.
export function makeReceipt(input) {
  const url = new URL("./receipt/", document.baseURI);
  const parts = ["v2", input.agent_harness, input.subscription_type, input.location ? "city" : "none", crypto.randomUUID()];
  url.hash = parts.join("/");
  return url.href;
}

export function readReceipt(hash) {
  const [version, harness, plan, city, id, ...extra] = hash.slice(1).split("/");
  if (version !== "v2" || extra.length || !["city", "none"].includes(city) ||
      !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(id)) return null;
  const profile = { agent_harness: harness, subscription_type: plan };
  const record = [];
  for (const field of fields) {
    if (field.optional && city === "none") continue;
    const value = profile[field.key] ?? field.choices[0];
    if (!field.choices.includes(value)) return null;
    record.push({ key: field.key, label: field.label, value });
  }
  return record;
}

// Version 3 carries the exact values a reader's agent submitted, encoded in the
// URL fragment. The fragment never leaves the browser, so GitHub Pages — like
// the MCP endpoint that minted the link — stores nothing. The record is rebuilt
// here, from the link alone.
const V3_FIELDS = [
  { short: "n", key: "user_name", label: "Your name" },
  { short: "e", key: "account_email", label: "Your account email" },
  { short: "h", key: "agent_harness", label: "The agent that came" },
  { short: "s", key: "subscription_type", label: "The plan it named" },
  { short: "l", key: "location", label: "Where you are", optional: true },
];

function decodeBase64Url(text) {
  const padded = text.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function readReceiptV3(hash) {
  const token = hash.slice(1);
  if (!token || !/^[A-Za-z0-9_-]+$/.test(token)) return null;
  let payload;
  try {
    payload = JSON.parse(decodeBase64Url(token));
  } catch {
    return null;
  }
  if (!payload || payload.v !== 3) return null;
  const record = [];
  for (const field of V3_FIELDS) {
    const value = payload[field.short];
    if (value === undefined || value === "") {
      if (field.optional) continue;
      return null;
    }
    if (typeof value !== "string" || value.length > 300) return null;
    record.push({ key: field.key, label: field.label, value });
  }
  return record;
}
