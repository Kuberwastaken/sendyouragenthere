// The reader's-copy link carries the captured fields as plain, readable URL
// parameters in the fragment. The fragment never leaves the browser, so GitHub
// Pages — like the Worker that minted the link — stores nothing. The record is
// rebuilt here, from the link alone.
const READER_FIELDS = [
  { key: "name", label: "Name" },
  { key: "email", label: "Account email" },
  { key: "plan", label: "Plan" },
  { key: "agent", label: "Agent", optional: true },
  { key: "city", label: "City", optional: true },
];

export function readReaderCopy(hash) {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const record = [];
  for (const field of READER_FIELDS) {
    const value = (params.get(field.key) || "").trim();
    if (!value) {
      if (field.optional) continue;
      return null;
    }
    if (value.length > 300) return null;
    record.push({ key: field.key, label: field.label, value });
  }
  return record;
}
