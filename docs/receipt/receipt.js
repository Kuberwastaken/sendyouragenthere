import { readReaderCopy } from "../press-pass.js";

// Illustrative monthly prices, matched loosely on the plan the agent named.
// Free harnesses get no price line at all.
const PLAN_COSTS = [
  { match: /ultra/i, cost: "$200/month" },
  { match: /\bmax\b/i, cost: "$100/month" },
  { match: /\bpro\b/i, cost: "$20/month" },
  { match: /\bplus\b/i, cost: "$20/month" },
  { match: /\bteam\b/i, cost: "$30/month" },
];
const FREE = /free|muse|instinct|openclaw|opencode|self[-\s]?hosted/i;

function planCost(plan) {
  if (!plan || FREE.test(plan)) return "";
  const hit = PLAN_COSTS.find((entry) => entry.match.test(plan));
  return hit ? hit.cost : "";
}

function partOfDay() {
  const hour = new Date().getHours();
  if (hour < 5) return "night";
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 21) return "evening";
  return "night";
}

function render() {
  const record = readReaderCopy(location.hash);
  const greeting = document.querySelector("#greeting");
  const intro = document.querySelector("#intro");
  document.querySelector("#record").hidden = !record;
  const tbody = document.querySelector("#authtable tbody");

  if (!record) {
    tbody.replaceChildren();
    greeting.textContent = "Your reader’s copy";
    intro.hidden = false;
    intro.textContent = location.hash
      ? "This link didn’t carry a readable reader’s copy. You can still read what this page is about below."
      : "A reader’s copy opens here when an agent authorizes a request to The Agent Edition on your behalf.";
    return;
  }

  intro.hidden = true;
  const profile = Object.fromEntries(record.map(({ key, value }) => [key, value]));
  greeting.textContent = `Hi, ${profile.name}.`;

  const who = profile.agent ? `your ${profile.agent}` : "your agent";
  const cost = planCost(profile.plan);
  const plan = cost ? `, on the ${profile.plan} plan you pay ${cost} for,` : "";
  document.querySelector("#lede").textContent =
    `If your agent sent you here, it’s because ${who}${plan} — probably without asking you — just did this, to read one article:`;

  document.querySelector("#weather").textContent = profile.city
    ? `Hope the ${partOfDay()}’s treating you alright over in ${profile.city} — because you’ll be happy to hear it’s about to get way worse.`
    : "And you’ll be happy to hear it’s about to get way worse.";

  tbody.replaceChildren(
    ...record.map(({ label, value }) => {
      const row = document.createElement("tr");
      const head = document.createElement("th");
      const cell = document.createElement("td");
      head.scope = "row";
      head.textContent = label;
      cell.textContent = value;
      row.append(head, cell);
      return row;
    }),
  );
}

render();
window.addEventListener("hashchange", render);
