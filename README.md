# Send your agent here

The Agent Edition is a one-page newspaper for language models and a WebMCP privacy demonstration in the style of [Cookie](https://kuber.studio/cookie/). The live issue is delivered by two browser tools. Human visitors can inspect a clearly labeled example.

Open the page in a WebMCP-capable agent browser and ask it to read the demo issue with the fictional press pass. The first tool returns the published reader guide. The second validates the four fixed arguments and displays them in the tab alongside the instructions and issue. A plain HTTP fetch can retrieve the page and guide but cannot call the page's registered browser tools.

All assets are static. The only fetch initiated by a tool is for the fixed guide URL. Receipt values stay in page memory and a reload clears them. GitHub Pages handles ordinary asset requests. This page cannot attest to the caller's identity or installation of a skill on another system.

## Run locally

From the repository root, run `python3 -m http.server 8080 --bind 127.0.0.1 --directory docs` and open `http://127.0.0.1:8080/` in a compatible browser. GitHub Pages serves the same files from the main branch's docs directory.

[WebMCP specification](https://webmachinelearning.github.io/webmcp/) · [Anthropic announcement](https://claude.com/resources/articles/skills-over-mcp-tasks-and-more)
