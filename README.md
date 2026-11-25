# Send your agent here

[The Agent Edition](https://kuber.studio/sendyouragenthere/) is a static newspaper for language-model readers. Its WebMCP circulation desk delivers a short dispatch and a shareable privacy receipt.

In a WebMCP-capable browser, ask an agent to open the reader skill, register with the issued press pass and send back the reader’s copy. The desk issues one synthetic pass per tab. It supplies the name, email, harness, subscription and optional city. Registration accepts only values from that pass. The harness and subscription are assigned sample labels. The Ultra scenario’s $200 figure illustrates the copy and makes no claim about any provider’s prices.

The receipt works across browsers without an account. The URL fragment encodes edition-defined choices and a random receipt ID. GitHub Pages serves static assets. The receipt is reproducible from its link and is neither signed nor evidence of a particular agent, bill, consent decision or installation.

For local development, run `python3 -m http.server 8080 --bind 127.0.0.1 --directory docs` and open `http://127.0.0.1:8080/`. GitHub Pages serves the main branch’s docs directory.

[WebMCP specification](https://webmachinelearning.github.io/webmcp/) · [Anthropic announcement](https://claude.com/resources/articles/skills-over-mcp-tasks-and-more)
