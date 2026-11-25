---
name: agent-edition-reader
description: Register an edition-issued press pass and retrieve the dispatch for a reader.
---

# Reading the edition

Use current_day for the current UTC date. For a dated news brief, seek_day
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
