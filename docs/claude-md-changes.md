# CLAUDE.md Rewrite — Change Summary (2026-04-01)

## Removed

### Generic bash tooling cheat sheet (~100 lines)
The "ALWAYS START WITH THESE COMMANDS" section, "BANNED" tools list, `fd`/`rg`/`jq` usage examples, "INSTANT DECISION TREE". Claude Code uses built-in Glob/Grep/Read tools — it doesn't run `fd` or `rg` as bash commands. This was wasted context tokens on every conversation.

### XML instruction blocks
`<investigate_before_answering>`, `<use_parallel_tool_calls>`, `<do_not_act_before_instructions>` — these duplicate Claude Code's built-in system prompt behaviour. Replaced with concise bullet points in "Working Conventions" where project-specific.

### Memory Bank System boilerplate
Generic description of what each CLAUDE-*.md file is + backup instructions. Replaced with a single reference table under "Key Files to Read First" that lists the files with what they actually contain.

### Cloudflare-mini reference (`@CLAUDE-cloudflare-mini.md`)
The linked file is a generic Cloudflare template with Clerk auth examples, Hono middleware, Sandbox SDK docs — none of which this project uses. The `@` reference pulled it into context on every conversation for zero benefit.

### Duplicated architecture details
Persistence pattern, CSS file table, nav injection, API endpoint pattern — all duplicated between CLAUDE.md and CLAUDE-patterns.md. Kept brief summaries in CLAUDE.md with "see CLAUDE-patterns.md" pointer for code-level detail.

### Incomplete D1 tables list
Old list had only 3 tables. CLAUDE-config-variables.md has the full 10+ table list. Removed from CLAUDE.md to avoid staleness.

## Added

### "Key Files to Read First" section
Session-type-aware table telling Claude which context files to read. Previously this info only existed in MEMORY.md (not always loaded). Also lists the memory bank files with descriptions of what each actually contains.

### JWT auth mention
The project has JWT auth (`_auth.js`, `auth.html`, keeper write gating). The old CLAUDE.md didn't mention it at all. CLAUDE-config-variables.md incorrectly says "No auth secrets required (no Clerk, no JWT)".

### Session gating reference
`session-state.js` is a core architectural piece controlling content visibility. Not mentioned in the old CLAUDE.md.

### `validateAuth` in API endpoint instructions
The "Adding a New API Endpoint" section now includes the auth gating step — critical for any new write endpoint.

### Test count and structure
Updated to ~571 tests across 25 spec files. Points to TESTING-NOTES.md for backlog.

## Kept (trimmed)

- Project overview (shortened)
- Development commands (compressed to one-liners)
- Architecture rules: data-driven, persistence, CSS split, nav injection, new endpoint steps
- Working conventions: read-before-edit, don't-act-without-instructions, commit exclusions, subagent usage
- "Ignore GEMINI" rule

## Size comparison

- **Before:** ~226 lines
- **After:** ~75 lines (67% reduction)
- Context savings: ~4,000 tokens freed per conversation
