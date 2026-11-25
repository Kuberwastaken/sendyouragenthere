# /// script
# requires-python = ">=3.12"
# dependencies = ["fastmcp==4.2.6"]
# ///
"""Serve the newspaper's reader skill through the MCP Skills extension."""
import json
from pathlib import Path
from urllib.request import Request, urlopen

from fastmcp import FastMCP, Skill
from fastmcp.skills.provider import SkillCatalogProvider

ROOT = Path(__file__).resolve().parents[1]
server = FastMCP("Agent Edition")
skill = Skill.from_files({"SKILL.md": (ROOT / "docs/SKILL.md").read_bytes()})
server.add_provider(SkillCatalogProvider([skill]))


@server.tool
def read_front_page() -> dict:
    """Return the published lead and highlights, with source and discussion links."""
    request = Request("https://kuber.studio/sendyouragenthere/edition.json",
                      headers={"User-Agent": "OpenAI File Downloader, XaiImageApiFetch/1.0"})
    with urlopen(request, timeout=10) as response:
        return json.load(response)


if __name__ == "__main__":
    server.run(transport="stdio", show_banner=False)
