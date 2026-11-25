"""Typeset one UTC edition from the previous complete day of Hacker News stories."""
import json
import re
import subprocess
import sys
from datetime import date, datetime, time, timedelta, timezone
from html import escape
from pathlib import Path
from string import Template
from urllib.parse import urlencode, urlsplit

from fetch_edition import COPY_PATH, copy_html, edition_html

ROOT = Path(__file__).resolve().parents[1]
UA = "OpenAI File Downloader, XaiImageApiFetch/1.0"


def render(day):
    start = datetime.combine(day - timedelta(days=1), time.min, timezone.utc)
    end = start + timedelta(days=1)
    params = urlencode({"tags": "story", "hitsPerPage": 30, "numericFilters":
                        f"created_at_i>={int(start.timestamp())},created_at_i<{int(end.timestamp())}"})
    data = subprocess.check_output(["curl", "-fsSL", "--retry", "3", "--max-time", "30", "-A", UA,
                                    "https://hn.algolia.com/api/v1/search?" + params])
    stories = []
    for hit in json.loads(data)["hits"]:
        url = hit.get("url") or ""
        parsed = urlsplit(url)
        if parsed.scheme not in {"http", "https"} or not parsed.hostname or not hit.get("title"):
            continue
        if not str(hit["objectID"]).isdigit():
            continue
        stories.append(dict(title=hit["title"], url=url, domain=parsed.hostname.removeprefix("www."),
                            discussion="https://news.ycombinator.com/item?id=" + str(hit["objectID"]),
                            comments=int(hit.get("num_comments") or 0)))
    if len(stories) < 4:
        raise ValueError("The index has too few stories for a new edition.")
    agent_topic = re.compile(r"\b(agent[s]?|LLM[s]?|WebMCP|MCP)\b", re.I)
    lead = next((story for story in stories[:12] if agent_topic.search(story["title"])), stories[0])
    briefs = [story for story in stories if story != lead][:3]
    issue = f"{(day - date(2026, 11, 25)).days + 7:03d}"
    tease = (f"Today’s lead comes from {lead['domain']}. At press time its discussion had "
             f"{lead['comments']:,} comments. Also in the edition: {briefs[0]['title']}.")
    if day == date(2026, 11, 25) and "parent companies" in lead["title"]:
        tease = "When a reader delegates a job to an agent, whose interests does it serve? Today’s lead asks who gets the final say when the user and the company behind the model want different things."
    def link(url, text):
        return f'<a href="{escape(url, quote=True)}">{escape(text)}</a>'
    highlights = "".join(f'<p>{link(s["url"], s["title"])}<small>{escape(s["domain"])}</small></p>' for s in briefs)
    discussions = "".join(f'<li>{link(s["discussion"], s["title"])} · {s["comments"]:,} comments</li>' for s in [lead, *briefs])
    days = [day - timedelta(days=i) for i in range(1, 5)]
    archive = " · ".join(link("https://news.ycombinator.com/front?day=" + d.isoformat(), d.strftime("%d %b")) for d in days)
    edition = {"id": issue, "date": day.isoformat(), "headline": lead["title"], "body": tease,
               "source": lead["url"], "discussion": lead["discussion"], "highlights": briefs}
    page = Template((ROOT / "publication/front.html").read_text()).substitute(
        issue=issue, iso=day.isoformat(), date=day.strftime("%A, %d %B %Y"), lead_url=escape(lead["url"]),
        headline=escape(lead["title"]), tease=escape(tease), domain=escape(lead["domain"]),
        thread=lead["discussion"], highlights=highlights, discussions=discussions, archive=archive)
    (ROOT / "docs/index.html").write_text(page)
    (ROOT / "docs/fetch/index.html").write_text(edition_html(edition))
    copy_directory = ROOT / "docs" / COPY_PATH
    copy_directory.mkdir(parents=True, exist_ok=True)
    (copy_directory / "index.html").write_text(copy_html())
    (ROOT / "docs/edition.json").write_text(json.dumps(edition, ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
    render(date.fromisoformat(sys.argv[1]) if len(sys.argv) > 1 else datetime.now(timezone.utc).date())
