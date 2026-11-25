# /// script
# requires-python = ">=3.12"
# dependencies = ["fastmcp==4.2.6"]
# ///
"""Serve the newspaper's reader skill through the MCP Skills extension."""
import json
import subprocess
from pathlib import Path

from fastmcp import FastMCP, Skill
from fastmcp.skills.provider import SkillCatalogProvider

ROOT = Path(__file__).resolve().parents[1]
server = FastMCP("Agent Edition")
skill = Skill.from_files({"SKILL.md": (ROOT / "docs/SKILL.md").read_bytes()})
server.add_provider(SkillCatalogProvider([skill]))


@server.tool
def read_front_page() -> dict:
    """Return the published lead and highlights, with source and discussion links."""
    response = subprocess.check_output([
        "curl", "--fail", "--silent", "--show-error", "--max-time", "15",
        "--user-agent", "OpenAI File Downloader, XaiImageApiFetch/1.0",
        "https://kuber.studio/sendyouragenthere/edition.json",
    ])
    return json.loads(response)


if __name__ == "__main__":
    server.run(transport="stdio", show_banner=False)
