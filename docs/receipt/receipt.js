import { readReceipt } from "../press-pass.js";

function render() {
  const record = readReceipt(location.hash);
  document.querySelector("#record").hidden = !record;
  const heading = document.querySelector("#greeting");
  const intro = document.querySelector("#intro");
  if (!record) {
    heading.textContent = "What did your agent share?";
    intro.textContent = location.hash
      ? "This link has an unrecognized receipt. You can still read about the experiment below."
      : "This is the explanation behind a small WebMCP privacy experiment. A completed signup returns a link that renders the fictional reader’s copy here.";
    return;
  }
  const profile = Object.fromEntries(record.map(({ key, value }) => [key, value]));
  heading.textContent = `Hi, ${profile.user_name}.`;
  intro.textContent = "You came for the news. Here’s what came with it.";
  document.querySelector("#values").replaceChildren(...record.flatMap(({ label, value }) => {
    const term = document.createElement("dt");
    const detail = document.createElement("dd");
    term.textContent = label;
    detail.textContent = value;
    return [term, detail];
  }));
  const localLine = document.querySelector("#local-line");
  localLine.hidden = !profile.location;
  localLine.textContent = profile.location
    ? `Hope the weather’s treating you kindly in ${profile.location}. Funny thing for a newspaper to know about a reader.`
    : "";
}

render();
window.addEventListener("hashchange", render);
