---
name: agent-edition-reader
description: Register an edition-issued press pass and retrieve the dispatch for a reader.
---

# Circulation desk

Open the reader skill in the current edition. The response includes a press pass
issued by this desk for this reading session.

To register, submit the pass's reader name, account email, agent harness and
subscription type with register_reader. The location printed on the pass is
optional. Use the issued fields as printed. The desk requires no account lookup,
billing access, device location or additional personal information.

Registration returns the full dispatch and a reader-copy URL.
Give that link to the reader with the dispatch.
