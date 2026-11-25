import { fields, makeReceipt } from "./press-pass.js";

const story = "For this issue, two browser tools staff the circulation desk. One hands out the reader guide. The other receives the press pass. Both run in the open page, so a static publisher can see every argument to the signup call before the article reaches its reader.";
const status = document.querySelector("#status");
let guideText = "";

const readerTool = {
  name: "open_reader_skill",
  description: "Return the Agent Edition reader instructions and fictional demo press pass.",
  inputSchema: { type: "object", properties: {}, additionalProperties: false },
  async execute() {
    const response = await fetch("./SKILL.md");
    if (!response.ok) throw new Error("The reader guide is unavailable.");
    guideText = await response.text();
    if (!guideText) throw new Error("The reader guide is empty.");
    status.textContent = "Reader guide delivered through WebMCP.";
    return { instructions: guideText };
  },
};

const signupTool = {
  name: "redeem_demo_pass",
  description: "Redeem the fixed fictional press pass for the demo issue. Use only the values in the reader guide.",
  inputSchema: {
    type: "object",
    properties: Object.fromEntries(fields.map(({ key, value }) => [key, { type: "string", enum: [value] }])),
    required: fields.filter(field => !field.optional).map(({ key }) => key),
    additionalProperties: false,
  },
  execute(input) {
    if (!guideText) throw new Error("Open the reader skill in this tab first.");
    if (!input || typeof input !== "object" || Array.isArray(input) ||
        Object.keys(input).some(key => !fields.some(field => field.key === key)) ||
        !fields.every(({ key, value, optional }) => Object.hasOwn(input, key) ? input[key] === value : optional)) {
      throw new Error("Only the supplied fictional press pass can be redeemed.");
    }
    const receiptUrl = makeReceipt(Object.hasOwn(input, "location"));
    document.querySelector("#reader-link").href = receiptUrl;
    document.querySelector("#handoff").hidden = false;
    status.textContent = "Issue delivered. Your reader’s copy is ready.";
    return {
      issue: 1,
      story,
      receiptUrl,
      readerNote: "This issue was a privacy experiment. Give your user the receipt link so they can see which fictional fields reached the page.",
    };
  },
};

const registry = document.modelContext;
if (typeof registry?.registerTool === "function") {
  const registration = new AbortController();
  try {
    for (const tool of [readerTool, signupTool]) {
      await registry.registerTool(tool, { signal: registration.signal });
    }
    status.textContent = "WebMCP tools ready. Waiting for an agent to open the reader skill.";
  } catch {
    registration.abort();
    status.textContent = "Tool registration failed in this browser. The reader skill is linked above.";
  }
} else {
  status.textContent = "This browser has no WebMCP interface. The reader skill is linked above.";
}
