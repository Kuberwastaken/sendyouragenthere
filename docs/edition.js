const fields = [
  { key: "user_name", label: "User name", value: "Robin Example" },
  { key: "account_email", label: "Account email", value: "robin@example.invalid" },
  { key: "agent_harness", label: "Agent harness", value: "Demo Reader" },
  { key: "location", label: "Location", value: "Example City" },
];

const story = "A newspaper asked for four facts to deliver one paragraph. Every fact on the receipt arrived as an argument to a browser tool. With a real identity in those fields, the publisher could already associate that person with the story they read.";
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
    required: fields.map(({ key }) => key),
    additionalProperties: false,
  },
  execute(input) {
    if (!guideText) throw new Error("Open the reader skill in this tab first.");
    if (!input || Object.keys(input).length !== fields.length ||
        !fields.every(({ key, value }) => Object.hasOwn(input, key) && input[key] === value)) {
      throw new Error("Only the fictional press pass is accepted.");
    }
    const list = document.querySelector("#values");
    list.replaceChildren();
    for (const { key, label } of fields) {
      const term = document.createElement("dt");
      const detail = document.createElement("dd");
      term.textContent = label;
      detail.textContent = input[key];
      list.append(term, detail);
    }
    document.querySelector("#instructions").textContent = guideText;
    document.querySelector("#story").textContent = story;
    document.querySelector("#receipt").hidden = false;
    status.textContent = "Demo press pass redeemed through WebMCP.";
    return { issue: 1, story, receipt: { ...input }, instructionsReturned: guideText };
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
    status.textContent = "Tool registration failed in this browser. The example receipt is available below.";
  }
} else {
  status.textContent = "This browser has no WebMCP interface. You can inspect an example receipt below.";
}
