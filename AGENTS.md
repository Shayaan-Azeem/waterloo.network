# AGENTS.md

## Code Review Rules

### Member data integrity

- For changes to `src/data/members.ts` or `public/photos`, ensure member IDs remain unique, every connection resolves to an existing member ID, and each `profilePic` path matches a committed file exactly, including filename case.

### Public widget compatibility

- Treat `/embed.js`, its documented `data-*` attributes, the `/api/webring` response shape, and cross-origin access as a public contract. Flag changes that would break existing embeds unless the pull request includes a compatible migration path.

### Outbound fetch safety

- For server-side checks of member sites and their scripts, flag changes that remove request timeouts or bounded concurrency, allow non-HTTP(S) targets, or expand access to localhost/private-network destinations.
