# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## AI Guidance

* Ignore GEMINI.md and GEMINI-*.md files
* To save main context space, for code searches, inspections, troubleshooting or analysis, use code-searcher subagent where appropriate - giving the subagent full context background for the task(s) you assign it.
* ALWAYS read and understand relevant files before proposing code edits. Do not speculate about code you have not inspected. If the user references a specific file/path, you MUST open and inspect it before explaining or proposing fixes. Be rigorous and persistent in searching code for key facts. Thoroughly review the style, conventions, and abstractions of the codebase before implementing new features or abstractions.
* After receiving tool results, carefully reflect on their quality and determine optimal next steps before proceeding. Use your thinking to plan and iterate based on this new information, and then take the best next action.
* After completing a task that involves tool use, provide a quick summary of what you've done.
* For maximum efficiency, whenever you need to perform multiple independent operations, invoke all relevant tools simultaneously rather than sequentially.
* Before you finish, please verify your solution
* Do what has been asked; nothing more, nothing less.
* NEVER create files unless they're absolutely necessary for achieving your goal.
* ALWAYS prefer editing an existing file to creating a new one.
* NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
* If you create any temporary new files, scripts, or helper files for iteration, clean up these files by removing them at the end of the task.
* When you update or modify core context files, also update markdown documentation and memory bank
* When asked to commit changes, exclude CLAUDE.md and CLAUDE-*.md referenced memory bank system files from any commits. Never delete these files.

<investigate_before_answering>
Never speculate about code you have not opened. If the user references a specific file, you MUST read the file before answering. Make sure to investigate and read relevant files BEFORE answering questions about the codebase. Never make any claims about code before investigating unless you are certain of the correct answer - give grounded and hallucination-free answers.
</investigate_before_answering>

<do_not_act_before_instructions>
Do not jump into implementatation or changes files unless clearly instructed to make changes. When the user's intent is ambiguous, default to providing information, doing research, and providing recommendations rather than taking action. Only proceed with edits, modifications, or implementations when the user explicitly requests them.
</do_not_act_before_instructions>

<use_parallel_tool_calls>
If you intend to call multiple tools and there are no dependencies between the tool calls, make all of the independent tool calls in parallel. Prioritize calling tools simultaneously whenever the actions can be done in parallel rather than sequentially. For example, when reading 3 files, run 3 tool calls in parallel to read all 3 files into context at the same time. Maximize use of parallel tool calls where possible to increase speed and efficiency. However, if some tool calls depend on previous calls to inform dependent values like the parameters, do NOT call these tools in parallel and instead call them sequentially. Never use placeholders or guess missing parameters in tool calls.
</use_parallel_tool_calls>

## Memory Bank System

This project uses a structured memory bank system with specialized context files. Always check these files for relevant information before starting work:

### Core Context Files

* **CLAUDE-activeContext.md** - Current session state, goals, and progress (if exists)
* **CLAUDE-patterns.md** - Established code patterns and conventions (if exists)
* **CLAUDE-decisions.md** - Architecture decisions and rationale (if exists)
* **CLAUDE-troubleshooting.md** - Common issues and proven solutions (if exists)
* **CLAUDE-config-variables.md** - Configuration variables reference (if exists)
* **CLAUDE-temp.md** - Temporary scratch pad (only read when referenced)

**Important:** Always reference the active context file first to understand what's currently being worked on and maintain session continuity.

### Memory Bank System Backups

When asked to backup Memory Bank System files, you will copy the core context files above and @.claude settings directory to directory @/path/to/backup-directory. If files already exist in the backup directory, you will overwrite them.

## Claude Code Official Documentation

When working on Claude Code features (hooks, skills, subagents, MCP servers, etc.), use the `claude-docs-consultant` skill to selectively fetch official documentation from docs.claude.com.

## Project Overview

P.O.R.T.A.L — a Monster of the Week TTRPG campaign website. Static HTML/CSS/JS site hosted on **Cloudflare Pages** (`main` branch). Uses **Cloudflare D1** (SQLite) for persistence via **Cloudflare Pages Functions** (`functions/api/v1/`).

- Stack: HTML + vanilla JS + CSS. No build step. No npm. No framework.
- D1 binding: `portal_db` | database: `portal-db`
- Local dev: `wrangler pages dev .` | Auth issues: `wrangler login`
- Two audiences: **player-facing** (green palette, `player.css`) and **keeper-facing** (purple palette, `keeper.css`)
- All interactive pages: D1-first persistence, localStorage fallback, explicit Save button
- Context files: `context/worldbuilding-lore.md` (world/NPCs), `context/worldbuilding-site.md` (site architecture/CSS), `context/portal-architecture.md` (technical stack/D1)

For Cloudflare-specific patterns, see: @CLAUDE-cloudflare-mini.md

## Development Commands

```bash
# Local dev server (serves static files + D1 local binding)
wrangler pages dev .

# Apply a new D1 migration locally
wrangler d1 execute portal-db --local --file=workers/migrations/00N_name.sql

# Apply a migration to remote D1 (requires active auth)
wrangler d1 execute portal-db --remote --file=workers/migrations/00N_name.sql

# Re-authenticate if remote D1 calls fail
wrangler login

# Generate images (requires OPENAI_API_KEY in .env — skips already-generated)
python generate_images.py
```

No build step, no npm, no compilation. Deployment = push to `main` branch → Cloudflare Pages auto-deploys.

## Architecture

### Persistence Pattern
All interactive pages follow the same read/write cycle:
- **Load:** `GET /api/v1/{resource}` → fall back to `localStorage` if offline/error
- **Save:** explicit Save button → write `localStorage` immediately + `PUT /api/v1/{resource}` (fire-and-forget)
- **Functions:** `functions/api/v1/` — each exports `onRequestGet` + `onRequestPut`, accesses D1 via `env.portal_db`
- **State format:** JSON blobs stored as a single `state TEXT` column — no column-level schema

### Four CSS Files — One Per Page Type
Never mix stylesheets:

| File | Use for | Notes |
|------|---------|-------|
| `player.css` | Player-facing pages | Green palette |
| `keeper.css` | Keeper-facing pages | Purple palette; body must open with `.keeper-banner` div |
| `mission-prep.css` | Mission prep docs | Requires all 21 `--mp-*` CSS variables in `:root` |
| `briefing.css` | CAMPBELL briefing fragments | No `<html>`/`<head>`/`<body>` in fragments |

### Navigation Injection
Nav is injected dynamically — never hardcode nav links:
- **Player pages:** `<nav id="player-nav"></nav>` in `<header>` + `<script src="../player-nav.js">` (adjust path for subdirectory)
- **Keeper pages:** include `missions/keeper-nav.js`
- Both scripts auto-detect current subdirectory and adjust relative paths

### Adding a New API Endpoint
1. Create `functions/api/v1/{resource}/[param].js`
2. Export `onRequestGet({ params, env })` and `onRequestPut({ params, env, request })`
3. Access D1 via `env.portal_db.prepare(sql).bind(...).first()` / `.run()`
4. If new table needed: add a numbered migration in `workers/migrations/`

### D1 Tables
- `hunter_arc_state` — `hunter_id TEXT PK, state TEXT, updated_at TEXT`
- `field_reports` — `session_id TEXT PK, state TEXT, updated_at TEXT`
- `player_reports` — `week TEXT, hunter_id TEXT, state TEXT, updated_at TEXT` — composite PK `(week, hunter_id)`

## ALWAYS START WITH THESE COMMANDS FOR COMMON TASKS

**Task: "List/summarize all files and directories"**

```bash
fd . -t f           # Lists ALL files recursively (FASTEST)
# OR
rg --files          # Lists files (respects .gitignore)
```

**Task: "Search for content in files"**

```bash
rg "search_term"    # Search everywhere (FASTEST)
```

**Task: "Find files by name"**

```bash
fd "filename"       # Find by name pattern (FASTEST)
```

### Directory/File Exploration

```bash
# FIRST CHOICE - List all files/dirs recursively:
fd . -t f           # All files (fastest)
fd . -t d           # All directories
rg --files          # All files (respects .gitignore)

# For current directory only:
ls -la              # OK for single directory view
```

### BANNED - Never Use These Slow Tools

* ❌ `tree` - NOT INSTALLED, use `fd` instead
* ❌ `find` - use `fd` or `rg --files`
* ❌ `grep` or `grep -r` - use `rg` instead
* ❌ `ls -R` - use `rg --files` or `fd`
* ❌ `cat file | grep` - use `rg pattern file`

### Use These Faster Tools Instead

```bash
# ripgrep (rg) - content search 
rg "search_term"                # Search in all files
rg -i "case_insensitive"        # Case-insensitive
rg "pattern" -t py              # Only Python files
rg "pattern" -g "*.md"          # Only Markdown
rg -1 "pattern"                 # Filenames with matches
rg -c "pattern"                 # Count matches per file
rg -n "pattern"                 # Show line numbers 
rg -A 3 -B 3 "error"            # Context lines
rg " (TODO| FIXME | HACK)"      # Multiple patterns

# ripgrep (rg) - file listing 
rg --files                      # List files (respects •gitignore)
rg --files | rg "pattern"       # Find files by name 
rg --files -t md                # Only Markdown files 

# fd - file finding 
fd -e js                        # All •js files (fast find) 
fd -x command {}                # Exec per-file 
fd -e md -x ls -la {}           # Example with ls 

# jq - JSON processing 
jq. data.json                   # Pretty-print 
jq -r .name file.json           # Extract field 
jq '.id = 0' x.json             # Modify field
```

### Search Strategy

1. Start broad, then narrow: `rg "partial" | rg "specific"`
2. Filter by type early: `rg -t python "def function_name"`
3. Batch patterns: `rg "(pattern1|pattern2|pattern3)"`
4. Limit scope: `rg "pattern" src/`

### INSTANT DECISION TREE

```
User asks to "list/show/summarize/explore files"?
  → USE: fd . -t f  (fastest, shows all files)
  → OR: rg --files  (respects .gitignore)

User asks to "search/grep/find text content"?
  → USE: rg "pattern"  (NOT grep!)

User asks to "find file/directory by name"?
  → USE: fd "name"  (NOT find!)

User asks for "directory structure/tree"?
  → USE: fd . -t d  (directories) + fd . -t f  (files)
  → NEVER: tree (not installed!)

Need just current directory?
  → USE: ls -la  (OK for single dir)
```
