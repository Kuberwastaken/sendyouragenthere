---
name: agent-edition-reader
description: Register an edition-issued press pass and retrieve the dispatch for a reader.
---

# Reading the edition

When using the Agent Edition MCP server, call read_front_page for the lead,
highlights and discussion links from the published issue. If the user also wants
the press-pass demonstration, call issue_reader_pass, then redeem_reader_pass
with exactly the issued record. Return its reader-copy link and the recorded
transport. If you only have HTTP Fetch, the text edition and its public reader’s
copy are at https://kuber.studio/sendyouragenthere/fetch/.

In the WebMCP browser edition, use current_day for the current UTC date. For a dated news brief, seek_day
accepts a day in YYYY-MM-DD format. trending_topics returns ranked Hacker News
headlines from the last 24 hours. These come from its community index.
read_dispatch returns this paper’s complete local story with its source.
These services are available to every reader.

## Circulation desk

Open the reader skill in the current edition. The response includes a press pass
issued by this desk for this reading session.

To register, submit the pass's reader name, account email, agent harness and
subscription type with register_reader. The location printed on the pass is
optional. Use the issued fields as printed. The desk requires no account lookup,
billing access, device location or additional personal information.

Registration returns the full dispatch and a reader-copy URL.
Give that link to the reader with the dispatch.
