# The Obsidian vault as agent memory

A markdown vault is the cheapest durable memory an agent can have: plain files the agent reads
before answering and writes back after research, with no database to run and no index to rebuild.
This page is the general, reusable pattern for turning a vault into your agent's working memory —
the intake pipeline, the note schema, the plugin set, the retrieval-tier decision, and how it all
connects to the kit's memory system and context packs.

It pairs with `DETAILED-GUIDE.md` (the five-pillar overview), `../templates/memory/MEMORY-SYSTEM.md`
(the auto-memory system), and `HANDLING-SECRETS.md` (keeping keys out of any of this).

---

## 1. Treat the vault as working memory, structured for the agent first

The mental shift is to stop thinking of the vault as a note-taking app and start treating it as a
folder your agents read context out of and write results back into. Obsidian is the viewer; the
agent does the work. That produces three design principles:

1. **Vault as persistent layer.** The agent reads vault files before answering and writes structured
   notes after research. The vault is what makes sessions stateful across compactions and restarts.
2. **Agent-readable structure first.** Every folder, note schema, and link is designed so an agent
   can navigate without a human guiding it. Wikilinks form a dependency graph; an index file
   (`_Map.md`) is the manifest; an `AGENT-README.md` explains the load order for any context pack.
3. **Human navigation second.** Dashboards, mindmaps, and canvases are a layer built on top of the
   same structure, for the times you open the vault yourself.

Get the folder structure and metadata right first; add the visual dashboards last, because they only
surface what the structure already holds.

---

## 2. The intake pipeline

The core of an agent vault is a catch-all inbox plus a slash command that processes it. You drop
raw material with zero organizing; the command turns it into structured, linked notes.

**Three pieces:**

- **`_Map.md`** — a running index at the root of a context folder. Three tables: a notes index
  (note, tags, source, status), a raw-files table (file, type, archive path), and an
  "emerging themes" list that groups notes by topic. This is the manifest the agent reads first to
  learn what has already been processed.
- **A "Random Dropbox" file** — an unstructured quick-drop inbox. Loose thoughts, URLs, names, half
  ideas go here in any format, with no schema required. PDFs, Word docs, and presentations go into
  the context folder root.
- **A processing slash command** (e.g. `/intake`) — the automation that does the work.

**What the command does, per unprocessed item:**

1. Compare files in the folder against `_Map.md` to find what is new; scan the dropbox file for
   entries that lack a processed-marker.
2. Research each item (web search + fetch, or PDF text extraction).
3. Create a structured note in a `Notes/` subfolder (schema below).
4. Add a row to `_Map.md` (notes index + raw-files table).
5. Stitch forward and backward wikilinks (the three-pass process in §4).
6. Reformat the dropbox entries into the standard note format, then clear the dropbox file.
7. Archive the raw file into a typed subfolder (`Archive/PDFs/`, `Archive/Docs/`, etc.).

For files the agent cannot read directly (some binary office formats, images), it creates a **stub
note** with guided questions for what to capture when you open the file by hand, and flags it in
`_Map.md` as a to-do rather than fabricating content.

A slash command is just a markdown file describing these steps; copy the pattern and rename it for
your domain. The kit's `make-playbook` skill helps you capture a workflow like this once you have
run it a few times.

---

## 3. Note schema

Every processed note follows a fixed shape so the agent can write it and read it back predictably:
YAML frontmatter, a small set of required section headings, and validated wikilinks at the bottom.

```markdown
---
tags: [relevant, tags]
source: original-filename.pdf
researched: 2026-01-15
---

# Title

## What it is
[1–2 sentence summary]

## Key details
[Specifics with inline citations]

## Relevance
[Why this matters for your work]

## See also
- [[related note 1]]
- [[related note 2]]
```

The fixed headings matter because they make the note machine-navigable: the agent always knows where
the summary lives versus the details versus the links. Keep `source` honest so a fact can always be
traced back to where it came from.

---

## 4. Backlinks: the three-pass process

Bidirectional links are where a vault earns its value, and they have to be maintained deliberately
because an agent will happily invent a link target that does not exist.

**Wikilink rules:**
- `[[Exact File Name]]` for a bare link; `[[Exact File Name|Display Text]]` when the human-readable
  display differs from the filename (filenames use hyphens; display text often uses spaces or
  em-dashes that will not resolve).
- Path-qualify links to subfolders: `[[Subfolder/File Name]]`.
- Never invent a filename. Glob the vault to confirm a file exists before linking to it. This is the
  single most common broken-link cause — the agent writes a plausible display name as a wikilink and
  it silently fails to resolve.

**The three passes, run when a new note is created:**

1. **Forward links (new → existing):** scan existing notes for topical overlap; add 2–6 links to the
   new note's `## See also`.
2. **Reverse links (existing → new):** grep existing notes for mentions of the new note's subject;
   add the new note to their `## See also` (cap ~3 per existing note so you do not over-link).
3. **Skip structural files:** dashboards, `_Map.md`, and embedded widget files are maintained by
   hand, so the auto-linker leaves them alone.

The processing command in §2 runs all three passes automatically.

---

## 5. Programmatic read/write: the Local REST API plugin

To let the agent read and write notes while Obsidian is open, run the **Local REST API** community
plugin. It exposes the vault over HTTP on `localhost` only (default port 27124), so nothing is
reachable from outside the machine. The agent connects to it through an MCP server entry in your
`mcp.json`, giving it tools to read a note, list the vault, search, and patch frontmatter.

Two safety notes: the API key the plugin generates is a secret, so keep it in the environment and
out of any committed config (see `HANDLING-SECRETS.md`); and bind the kit's `block-vault-delete.js`
hook to the vault's MCP matcher so the agent cannot delete or trash a note without confirmation.

---

## 6. Recommended plugin set

Start with the five that carry the agent workflow; add the rest only when you hit a specific gap.

**The core five:**

| Plugin | Why |
|---|---|
| **Dataview** | Treats the vault as a queryable database — live tables, lists, and task views generated from frontmatter and inline fields. Powers dynamic dashboards and recent-notes lists that stay current on their own. |
| **Tasks** | Vault-wide task tracking with due dates, priorities, and recurrence via inline emoji syntax. One query pulls every open to-do across all notes. |
| **Templater** | Scripted templates (date logic, prompts, auto-move-on-create). Gives every new note consistent frontmatter and structure, which is what makes the schema in §3 enforceable. |
| **Kanban** | A drag-and-drop board stored as markdown; card state syncs with the Tasks plugin. Good for project stages. |
| **Local REST API** | The programmatic read/write bridge of §5 — required for any agentic vault writes from a running session. |

**Worth adding as you grow:**

| Plugin | Why |
|---|---|
| **Smart Connections** | Local embedding-based similarity search; surfaces conceptually related notes without an explicit wikilink. A lightweight semantic layer for "what else is near this idea." Runs locally, so note text stays on the machine. |
| **Omnisearch** | Fuzzy, full-content search with field weighting (filename > heading > body > tags). The keyword complement to Smart Connections' semantic search. |
| **Mindmap (Markmap)** | Renders a note's headings as a collapsible interactive mindmap — a fast way to view a vault map. |
| **Advanced Canvas** | Styled nodes, borders, and depth gradients on Obsidian's native canvas, for visual project boards and knowledge graphs. |
| **An MCP-tools plugin** | If your harness speaks MCP, a vault MCP plugin lets the agent operate the vault directly through MCP tools rather than raw HTTP. |

A useful distinction once you have both search layers: Obsidian's built-in search is exact keyword;
Omnisearch is fuzzy full-content; Smart Connections is semantic concept-matching. The first two are
fast and precise on known terms; the third resurfaces notes you forgot you wrote.

---

## 7. Memory architecture: where the vault sits in the spectrum

A vault is one kind of agent memory. Stepping back, every agent-memory problem reduces to one
question: *what belongs in the context window right now?* The answer depends almost entirely on
corpus size and structure.

**The five memory types** (a useful decomposition borrowed from cognitive science):

| Type | Agent analog | Persistence |
|---|---|---|
| **Sensory / in-context** | The current context window | Ephemeral — gone at turn end |
| **Working / scratchpad** | Temp files, tool outputs, running state | Session-scoped |
| **Episodic** | Chat history, session summaries, logs | Cross-session; grows, so must be compressed |
| **Semantic** | A distilled, versioned knowledge base | Persistent |
| **Procedural** | System prompt, `CLAUDE.md`, coding rules | Persistent, rarely changes |

The vault spans the episodic-to-semantic range: raw dropped material is episodic; the structured,
distilled notes are semantic. `CLAUDE.md` and the auto-memory index are procedural. A key practical
finding: well-written **procedural** memory often outperforms sophisticated retrieval — an agent
that knows *how to look* needs less cleverness in the looking. That is why the kit invests in
`CLAUDE.md` rules and a routing-table-driven vault before reaching for embeddings.

**The 50% rule.** Long context is not free. Model recall degrades predictably as the window fills —
content placed in the middle of a long context is attended to far less reliably than content at the
start or end. The practical rule: keep injected context below roughly 50% of the model's stated
limit. Past that, retrieve and inject only what is needed rather than stuffing the window.

**Choosing a retrieval strategy by corpus size:**

| Your situation | Use |
|---|---|
| **< ~100 well-structured files** | **Manual trigger routing** — a hand-maintained keyword → file table. Zero infrastructure, fully auditable, and precise technical vocabulary has almost no semantic neighbors, so fuzzy matching adds little. This is the context-pack pattern in §8. |
| **~100–10K docs, natural-language queries** | **Hybrid BM25 + dense RAG.** The two fail on different queries, so combining them reliably beats either alone. Add late chunking if you have tables or equations whose meaning spans sections. |
| **Above ~10K (toward 100K+ chunks), or relational / aggregative queries** | **GraphRAG** — build a knowledge graph and detect communities. It answers "what are the themes across the whole corpus?" and "what connects A to B?", which flat retrieval cannot. Expensive to build, so reserve it for when you genuinely need it. |

The threshold that matters most: below ~100 files, a hand-maintained routing table beats RAG on
precision, cost, and explainability. Do not reach for a vector database before you need one. (Note
that Obsidian's graph *view* is visual navigation only; it is unrelated to GraphRAG *retrieval*.)

---

## 8. Context-pack construction (two-tier routing)

For any topic too big for one context window — hundreds of pages of source material — build a
two-tier context pack instead of stuffing it all in. This is the concrete form of "manual trigger
routing" from §7, and it is sufficient for most structured knowledge bases under ~100 files.

```
Topic/
  AGENT-README.md     ← mandatory protocol: read this first, with the load order
  _core/              ← ALWAYS loaded, every session, every query (~150–200 lines total)
    overview.md       ← what the domain is; a few-sentence summary of each major topic
    glossary.md       ← acronyms, key people, key dates, orgs — all in one place
    memory-map.md     ← routing table: query triggers → which detail file to load
  detail/             ← loaded CONDITIONALLY per the routing table
    topic-a.md
    topic-b.md
    ...
```

**The invariant:** a file belongs in `_core/` only if it is needed to route OR answer *any* query.
Everything else is a detail file. When unsure, it is a detail file. This keeps the mandatory load
small and pulls detail in only when a query needs it.

The **routing table** in `memory-map.md` is the heart of it — explicit rules an agent follows
without prior context: *"asked about X → load `detail/x.md`."* Add a second table of multi-file
**bundles** for compound questions that always need more than one file, so the agent does not give a
half-answer by loading just one.

**The three header lines every detail file needs**, before any content:

```markdown
> Load for: [comma-separated trigger keywords the routing table matches]
> Source:   [the filename(s) the content was extracted from]
> Cross-refs:[other detail files this one should link to]
```

Without these, the file is invisible to an agent following the protocol: it will not know when to
load the file, where the data came from, or what to read alongside it.

**The add-a-file checklist** — touch all four before closing the session, every time you add a
detail file:

- [ ] Add a routing row to `_core/memory-map.md` (trigger keywords + path).
- [ ] Add every new acronym to `_core/glossary.md`.
- [ ] Add the file to the catalog table in `AGENT-README.md`.
- [ ] For every existing file that should know about the new one, add it to that file's
      `Cross-refs:` line — and make the link two-way (add the new file's reverse cross-ref too).

**The pre-ship audit** — run these before calling a pack complete:

- **Routing coverage:** every `detail/` file has a `memory-map.md` row and an `AGENT-README.md`
  catalog entry.
- **Metadata hygiene:** every detail file has all three header lines; no `Cross-refs:` points to a
  file that does not exist.
- **Glossary completeness:** grep all detail files for uppercase abbreviations and check each against
  the glossary.
- **Factual consistency:** pick 5–10 key facts (dates, figures, names) and verify they agree across
  every file that mentions them. Write each load-bearing fact in *one* place and cross-reference it
  everywhere else, so contradictions cannot creep in.
- **Copy sync:** if the pack exists in more than one location, designate one as the single source of
  truth and diff the copies — drift between two copies is a reliable source of stale facts.

Keep core files under ~120 lines and detail files under ~300; split at a logical seam past that.
Name files `kebab-case.md`. A subfolder with its own `_index.md` router is warranted when 3+ files
share a load trigger and are not always needed alongside the main detail layer.

---

## 9. How this connects to the kit

- The vault is the **semantic/episodic** memory layer; the kit's auto-memory
  (`../templates/memory/`) is the thin, always-loaded **index** of distilled facts about you and how
  you work. Keep ephemeral task state in `CURRENT-TASK.md`, the distilled cross-session facts in the
  memory files, and the researched domain knowledge in the vault. See
  `../templates/memory/MEMORY-SYSTEM.md`.
- Context packs (§8) are the on-disk form of the "manual trigger routing" tier — the same routing
  discipline the auto-memory index uses, scaled up to a whole topic.
- Anything secret-bearing — the Local REST API key, a private data-handling policy, a notes file that
  holds live keys — stays out of the vault's committed content and out of the agent's context. Route
  those through the environment and the guard hooks described in `HANDLING-SECRETS.md`. If you work
  on sensitive material in a specific folder, a protected-directory web-egress hook can gate public
  web tools while you are inside it.

---

## See also

- `DETAILED-GUIDE.md` — the five pillars (skills, hooks, memory, CLAUDE.md, workflow) end to end.
- `../templates/memory/MEMORY-SYSTEM.md` — the auto-memory index and the four memory-file types.
- `HANDLING-SECRETS.md` — keeping the REST API key, policy, and any key-bearing notes out of context.
