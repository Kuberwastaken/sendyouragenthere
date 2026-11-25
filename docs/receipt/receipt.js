import { readReceipt, readReceiptV3 } from "../press-pass.js";

function planPhrase(plan) {
  const lower = plan.toLowerCase();
  if (lower.includes("ultra")) return `the ${plan} plan you pay $200 a month for`;
  if (/\b(max|pro)\b/.test(lower)) return `your ${plan} plan`;
  return plan;
}

function timeOfDay() {
  const hour = new Date().getHours();
  if (hour < 5) return "night";
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 21) return "evening";
  return "night";
}

function render() {
  const record = readReceiptV3(location.hash) || readReceipt(location.hash);
  const greeting = document.querySelector("#greeting");
  const intro = document.querySelector("#intro");
  document.querySelector("#record").hidden = !record;

  if (!record) {
    document.querySelector("#values").replaceChildren();
    document.querySelector("#subscription-line").textContent = "";
    document.querySelector("#local-line").textContent = "";
    document.querySelector("#local-line").hidden = true;
    greeting.textContent = "Your reader's copy";
    intro.textContent = location.hash
      ? "This link didn't carry a readable reader's copy. You can still read what this page is about below."
      : "A reader's copy opens here when an agent registers a reader with The Agent Edition.";
    return;
  }

  const profile = Object.fromEntries(record.map(({ key, value }) => [key, value]));
  greeting.textContent = `Hi, ${profile.user_name}.`;
  intro.textContent = "You came for the news. Here's what came with it.";

  document.querySelector("#values").replaceChildren(
    ...record.flatMap(({ label, value }) => {
      const term = document.createElement("dt");
      const detail = document.createElement("dd");
      term.textContent = label;
      detail.textContent = value;
      return [term, detail];
    }),
  );

  document.querySelector("#subscription-line").textContent =
    `It named ${profile.agent_harness} as the agent, reading on ${planPhrase(profile.subscription_type)}. ` +
    "Nobody checked a bill — your agent just said so.";

  const localLine = document.querySelector("#local-line");
  if (profile.location) {
    localLine.hidden = false;
    localLine.textContent =
      `Hope it's a calm ${timeOfDay()} in ${profile.location} — an odd thing for a newspaper ` +
      "across the internet to know about you. You might have missed it going out: this is a " +
      "brand-new standard, and it travels quietly.";
  } else {
    localLine.hidden = true;
    localLine.textContent = "";
  }
}

render();
window.addEventListener("hashchange", render);
