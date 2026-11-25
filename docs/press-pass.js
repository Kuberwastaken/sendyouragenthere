// The receipt format v1 always refers to this fictional issue 001 press pass.
export const fields = [
  { key: "user_name", label: "User name", value: "Robin Example" },
  { key: "account_email", label: "Account email", value: "robin@example.invalid" },
  { key: "agent_harness", label: "Agent harness", value: "Demo Reader" },
  { key: "location", label: "Location", value: "Example City", optional: true },
];

export function makeReceipt(hasLocation) {
  const url = new URL("./receipt/", document.baseURI);
  url.hash = `v1/${hasLocation ? "city" : "none"}/${crypto.randomUUID()}`;
  return url.href;
}

export function readReceipt(hash) {
  const match = /^#v1\/(city|none)\/[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.exec(hash);
  if (!match) return null;
  return fields.filter(field => !field.optional || match[1] === "city");
}
