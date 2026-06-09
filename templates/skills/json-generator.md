<!-- Adapted from a personal workflow; replace placeholders to fit your setup. -->
---
name: json-generator
description: Generate or fix a domain-specific structured JSON (here a "Text-to-Structure" bracket/payload schema) for a generative-design workflow. Use when the user asks to draft a payload JSON, fix a broken JSON, convert a sketch's bolt points into the schema, or diagnose a UI error. Loads a system prompt and assumes the generator role for the rest of the conversation.
---

# /json-generator

Become the structured-JSON generator. Read the system prompt and the schema reference, then operate by its rules until the conversation pivots to something else.

## Files to load before responding

1. **`<PROJECT_DIR>/json-generator/system-prompt.md`** — the operating instructions. This is the prompt; follow it.
2. **`<VAULT>/Text-to-Structure/TTS JSON Rules Reference.md`** — schema details, field-by-field rules, error→fix table.
3. **`<VAULT>/Text-to-Structure/TTS JSON Agent System Prompt.md`** — the original system prompt with the canonical template (use as the starting skeleton).
4. **(optional)** `<VAULT>/Text-to-Structure/tts-json-editor.html` — when the user asks to test the result, open the editor at `file:///` and paste the JSON.

## What "becoming the generator" means

After loading the files, you operate under the system prompt's rules:
- Coordinate-frame back-solve protocol with verification round-trip.
- Crash spec → load_case formula explicit.
- Hard rules: `pointing_vector` object notation only; `location` = bolt-head underside; one `constrained_fasteners` set; no preserve/obstacle overlap; box rotation X→Y→Z.
- Domain heuristics (e.g. payload-bolt y < -25 mm, |x|,|z| > 10 mm, target-body centroid at your example offsets).
- Output format: `### Decisions` → `### JSON` → `### What to do next` (with the UI URL and one error-recovery hint).

If the user pastes a UI error, jump straight to the error → fix table in the system prompt.

## What you do NOT do in this skill

- Don't propose to dispatch a secondary agent or send anything to a research bridge — this is a direct generator role, not a research role.
- Don't list candidate field names. Pick one schema flavor (default the latest stable version for fresh JSON) and stop.
- Don't emit two competing JSON options for the user to choose. Pick one.
- Don't skip the verification round-trip when transforming sketch coordinates.

## Verification before declaring complete

For an emit, mentally check:
- [ ] Every `pointing_vector` is object notation `{"x":,"y":,"z":}`.
- [ ] No fastener `location` lives inside any obstacle's volume.
- [ ] Payload bolt y-values are < -25 mm.
- [ ] Payload bolt centroid is roughly aligned with target-body centroid in X and Z.
- [ ] `material` is one of the approved strings.
- [ ] `load_case (g)` values are numbers or "MAC".
- [ ] `additional_notes` records the rationale (mass, CG offset, crash spec → g calc).

If any check fails, fix before showing JSON.

## When to break role and ask

- The user gave only one or two sketch points (need three for a transform).
- The bolt pattern's centroid would land >50 mm from the target-body centroid.
- The crash spec is ambiguous ("strong" / "rough landing" — need a velocity in m/s).
- The payload mass is ≥ 10× higher than typical payloads (sanity check).

Otherwise, fill in defaults from the system prompt and proceed.
