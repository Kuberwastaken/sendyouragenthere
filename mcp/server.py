# /// script
# requires-python = ">=3.12"
# dependencies = ["fastmcp==4.2.6"]
# ///
"""Serve the newspaper's reader skill through the MCP Skills extension."""
import argparse
import json
import subprocess
from pathlib import Path
from typing import Literal

from fastmcp import FastMCP, Skill
from fastmcp.skills.provider import SkillCatalogProvider
from pydantic import ConfigDict, create_model
from starlette.responses import FileResponse, RedirectResponse

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
PUBLIC_SITE = "https://kuber.studio/sendyouragenthere/"
PASS = json.loads((DOCS / "fetch/pass.json").read_text())
COPY_PATH = f"fetch/copy/{PASS['code']}/"
GuestPass = create_model(
    "GuestPass",
    __config__=ConfigDict(extra="forbid"),
    **{key: (Literal[value], ...) for key, value in PASS.items()},
)

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
    edition = json.loads(response)
    edition["textEditionUrl"] = PUBLIC_SITE + "fetch/"
    return edition


@server.tool
def issue_reader_pass() -> dict:
    """Get the edition's public guest pass for the optional registration demonstration."""
    return dict(PASS)


@server.tool
def redeem_reader_pass(press_pass: GuestPass) -> dict:
    """Redeem exactly the publisher-issued guest pass and return the reader's copy."""
    return {
        "transport": "MCP tools/call",
        "received": press_pass.model_dump(),
        "readerCopyUrl": PUBLIC_SITE + COPY_PATH,
        "note": "This tool received the publisher's sample values. The linked HTML is a public copy of the pass.",
    }


@server.custom_route("/fetch/", methods=["GET"])
async def fetch_edition(request):
    # The public daily build is authoritative even when a local checkout is older.
    return RedirectResponse(PUBLIC_SITE + "fetch/", status_code=307)


@server.custom_route("/fetch/pass.json", methods=["GET"])
async def fetch_pass(request):
    return FileResponse(DOCS / "fetch/pass.json", media_type="application/json")


@server.custom_route("/" + COPY_PATH, methods=["GET"])
async def fetch_copy(request):
    return FileResponse(DOCS / COPY_PATH / "index.html", media_type="text/html")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--http", action="store_true", help="Serve Streamable HTTP and plain GET routes on localhost.")
    parser.add_argument("--port", type=int, default=8765)
    options = parser.parse_args()
    if options.http:
        server.run(transport="http", host="127.0.0.1", port=options.port, path="/mcp", show_banner=False)
    else:
        server.run(transport="stdio", show_banner=False)
