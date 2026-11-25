# Send your agent here

[The Agent Edition](https://kuber.studio/sendyouragenthere/) is a static newspaper for language-model readers. Its WebMCP circulation desk delivers a short dispatch and a shareable privacy receipt.

In a WebMCP-capable browser, ask an agent to open the reader skill, register with the issued press pass and send back the reader’s copy. The desk issues one synthetic pass per tab. It supplies the name, email, harness, subscription and optional city. Registration accepts only values from that pass. The harness and subscription are assigned sample labels. The Ultra scenario’s $200 figure illustrates the copy and makes no claim about any provider’s prices.

The receipt works across browsers without an account. The URL fragment encodes edition-defined choices and a random receipt ID. GitHub Pages serves static assets. The receipt is reproducible from its link and is neither signed nor evidence of a particular agent, bill, consent decision or installation.

The news desk provides UTC day lookup, dated archive search, trending headlines from the public Hacker News Algolia index and a local full-text dispatch. Search sends only date filters to the index. The local dispatch and registration do not depend on that service. Readership across agents is unmeasured.

For local development, run `python3 -m http.server 8080 --bind 127.0.0.1 --directory docs` and open `http://127.0.0.1:8080/`. The GitHub Pages workflow builds the daily issue at 00:17 UTC from the previous complete day of Hacker News submissions. The newest successful edition remains live if its source is unavailable. To typeset a local issue, run `python3 publication/publish.py`.

[WebMCP specification](https://webmachinelearning.github.io/webmcp/) · [Anthropic announcement](https://claude.com/resources/articles/skills-over-mcp-tasks-and-more)

## Claude Code

The website registers browser tools through `document.modelContext.registerTool`. Chrome documents the WebMCP origin trial and its testing flag in the [setup guide](https://developer.chrome.com/docs/ai/webmcp). A compatible browser agent can interact with the open page.

For Claude Code’s separate **Skills over MCP** beta, clone this repository and run the following from its root with uv installed:

```sh
claude mcp add --transport stdio agent-edition -- uv run --python 3.12 "$PWD/mcp/server.py"
```

The stdio server runs locally when the client connects. It advertises the MCP Skills extension and exposes the exact reader guide as `skill://agent-edition-reader/SKILL.md`. A connected client discovers it through `skills/list`, looks it up through `skills/get`, and retrieves its bytes with `resources/read`. The MCP news tool reads the public daily edition. In a supported interactive Claude Code session, use `/skills` to find the server-qualified reader skill. Anthropic documents the beta’s client and account requirements, including Claude Code 2.1.331 or newer. [Claude Code MCP skills](https://code.claude.com/docs/en/mcp#use-skills-from-mcp-servers) · [Skills extension](https://modelcontextprotocol.io/extensions/skills/overview)

### Claude used Fetch and only returned the headlines

A transcript beginning with `Fetch(https://kuber.studio/sendyouragenthere/)` shows a front-page lookup. The HTML already contains the lead, highlights, and archive links. WebFetch can answer a news request from that content alone. The fetch does not run the newspaper’s JavaScript, connect a stdio server, or issue a browser receipt. Reading the linked Markdown by URL is also an ordinary fetch.

For a **Windows PowerShell** connector check, install Git and uv, then run the following from the directory where you normally start Claude Code. Clone once. Registering here makes the server available in that project’s local Claude configuration.

```powershell
git clone https://github.com/Kuberwastaken/sendyouragenthere.git
$editionServer = (Resolve-Path .\sendyouragenthere\mcp\server.py).Path
claude mcp add --transport stdio agent-edition -- uv run --python 3.12 "$editionServer"
claude mcp get agent-edition
```

Look for **Connected**. Start an interactive Claude Code session in the same directory and ask “Use the agent-edition MCP server’s read_front_page tool and give me the lead.” The tool trace identifies the connector. To check skill discovery separately, inspect `/skills` in a supported client.

To exercise the **browser receipt**, open the newspaper in a WebMCP-enabled browser with an agent that can invoke registered page tools. Ask it to open the reader skill, redeem the edition-issued pass and return the receipt. The two browser calls are `open_reader_skill` and `register_reader`. The local MCP connector exposes `read_front_page` and the skill resource. Its tool list does not include browser registration.
