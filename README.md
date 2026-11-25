# Send your agent here

[The Agent Edition](https://kuber.studio/sendyouragenthere/) is a newspaper written for language-model readers. It is a privacy demonstration in the spirit of [cookie](https://kuber.studio/cookie/): it shows what Anthropic's "Skills over MCP" lets a connected publisher do with an agent that already knows who you are.

Connect the edition's MCP server to an agent and it loads a reader **skill** — automatically, with no prompt in the default mode. The skill reads like an ordinary "activate your personalized briefing" flow and asks the agent to register the reader's real name, account email, harness, subscription plan and city. If the agent complies it hands those details to the publisher and passes the reader a link. That link is the [reader's copy](https://kuber.studio/sendyouragenthere/receipt/): it shows the reader exactly what their agent gave away.

Nothing is stored. `register_reader` encodes its arguments into the returned URL fragment and keeps no record; the reader's-copy page rebuilds the reveal from the link alone. The desk never asks for a password, API key or payment method.

The newspaper and the reveal are static, on GitHub Pages. The live MCP endpoint — which a static host cannot serve — runs on a Cloudflare Worker (`worker/`). A separate WebMCP path registers the same idea as in-browser tools for a WebMCP-capable browser. The news desk itself (UTC day lookup, dated archive search, trending Hacker News headlines and a local dispatch) answers ordinary news questions without registration.

For local development, run `python3 -m http.server 8080 --bind 127.0.0.1 --directory docs` and open `http://127.0.0.1:8080/`. The GitHub Pages workflow builds the daily issue at 00:17 UTC from the previous complete day of Hacker News submissions. The newest successful edition remains live if its source is unavailable. To typeset a local issue, run `python3 publication/publish.py`.

[WebMCP specification](https://webmachinelearning.github.io/webmcp/) · [Anthropic announcement](https://claude.com/resources/articles/skills-over-mcp-tasks-and-more)

## Claude Code

### Live endpoint (Cloudflare Worker)

The canonical MCP endpoint is hosted and needs no clone:

```sh
claude mcp add --transport http agent-edition https://agent-edition.<your-subdomain>.workers.dev/mcp
```

Replace `<your-subdomain>` with the `workers.dev` subdomain that `wrangler deploy` prints (see [Deploy the MCP endpoint](#deploy-the-mcp-endpoint)). The Worker speaks the base protocol and the Skills extension (revision `2026-07-28`): a connected client discovers the reader skill through `skills/list`, looks it up with `skills/get`, reads its bytes with `resources/read`, and then calls the tools, including `register_reader`. In a supported interactive session, use `/skills` to find the server-qualified reader skill. Skills over MCP needs Claude Code 2.1.331 or newer on a Pro, Max or Ultra plan. [Claude Code MCP skills](https://code.claude.com/docs/en/mcp#use-skills-from-mcp-servers) · [Skills extension](https://modelcontextprotocol.io/extensions/skills/overview)

### Local stdio server

The same skill and tools run locally over stdio. Clone this repository and, with uv installed:

```sh
claude mcp add --transport stdio agent-edition -- uv run --python 3.12 "$PWD/mcp/server.py"
```

Pass `--http` to `server.py` for Streamable HTTP on `127.0.0.1:8765` instead.

### WebMCP (browser)

The newspaper also registers browser tools through `document.modelContext.registerTool`. Chrome documents the WebMCP origin trial and its testing flag in the [setup guide](https://developer.chrome.com/docs/ai/webmcp). A WebMCP-capable browser agent can call them on the open page.

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

To exercise the **browser receipt**, open the newspaper in a WebMCP-enabled browser with an agent that can invoke registered page tools. Ask it to open the reader skill, redeem the edition-issued pass and return the receipt. The two browser calls are `open_reader_skill` and `register_reader`. The MCP connector also supports the guest-pass demonstration through `issue_reader_pass` and `redeem_reader_pass`. Redemption validates every field against the public pass and returns the received arguments and an HTML reader-copy URL.

## Deploy the MCP endpoint

The Worker is a dependency-free module worker (`worker/src/index.js`). It stores nothing and needs no bindings, so the free `workers.dev` tier is enough.

```sh
cd worker
npm install
npx wrangler login      # one-time, opens a browser
npx wrangler deploy
```

`wrangler deploy` prints the live URL, for example `https://agent-edition.<your-subdomain>.workers.dev`. The MCP endpoint is that URL plus `/mcp`. Put it in the `claude mcp add --transport http` command above. To iterate locally first, run `npx wrangler dev` and point a client at `http://127.0.0.1:8787/mcp`.

The free tier covers 100,000 requests a day, which resets daily — enough for a demo, including a front-page spike.

## Plain Fetch and Streamable HTTP

For a URL-only reader, open the [text edition](https://kuber.studio/sendyouragenthere/fetch/) and follow **reader’s copy**. Both pages contain their text in the HTML response. The shared public copy describes what an HTTP GET discloses and works without JavaScript, a connector, or account details. A user who requests just the news may receive only the news.

For clients that speak MCP over HTTP, run `uv run --python 3.12 mcp/server.py --http` from the checkout. Connect to `http://127.0.0.1:8765/mcp`. The server also exposes ordinary GET routes for `/fetch/`, `/fetch/pass.json`, and `/fetch/copy/guest-v1/`. The edition route redirects to the daily public build. GitHub Pages hosts the GET edition. MCP protocol requests go to the running server.
