# AGENTS.md

Behavioral guidelines to reduce common LLM coding mistakes.
Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed.
For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them. Don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?"
If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it. Don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" -> "Write tests for invalid inputs, then make them pass"
- "Fix the bug" -> "Write a test that reproduces it, then make it pass"
- "Refactor X" -> "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
1. [Step] -> verify: [check]
2. [Step] -> verify: [check]
3. [Step] -> verify: [check]

Strong success criteria let you loop independently.
Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs,
fewer rewrites due to overcomplication, and clarifying questions come
before implementation rather than after mistakes.

## 5. Project Context: Open PhilGEPS

This project is the Open PhilGEPS project: an open-source government
procurement analytics dashboard for the Philippines Government Electronic
Procurement System (PhilGEPS).

PhilGEPS is the centralized electronic portal for Philippine government
procurement. Treat it as a public-interest transparency and analytics domain,
not a generic sales or finance dashboard. The dashboard should help users
understand procurement activity, competition, contract awards, agency behavior,
supplier participation, categories, geography, timelines, and possible outliers.

Relevant product context:
- PhilGEPS is used for government bid opportunities, notices, awards, supplier
  participation, common-use supplies, marketplace/Virtual Store activity, and
  e-bidding-related procurement workflows.
- Modernized PhilGEPS / mPhilGEPS and the Open Data Portal emphasize public
  access, transparency, search/filter functions, downloadable machine-readable
  datasets, and dashboards/visualization tools.
- Public procurement data should be handled carefully: distinguish facts in the
  dataset from interpretations, avoid unsupported corruption claims, and label
  suspicious patterns as "signals", "outliers", or "requires review" unless a
  reliable source proves otherwise.

## 6. Research Before Building

Before choosing metrics or implementing dashboard views, research the domain.
Prefer official or primary sources first:
- PS-DBM / PhilGEPS
- Government Procurement Policy Board (GPPB)
- official procurement laws, rules, manuals, and public notices
- official open data portal documentation or dataset notes

Use secondary sources only to supplement context. Record key assumptions and
source links in the working notes, project README, or implementation summary
when they affect product decisions.

Research questions to answer before dashboard design:
- What procurement lifecycle stages are represented in the dataset?
- What fields identify procuring entity, supplier, procurement category,
  location, dates, approved budget, award amount, procurement mode, status, and
  reference numbers?
- What questions would public users, journalists, researchers, civil society,
  suppliers, and oversight bodies ask of this data?
- What metrics are responsible and defensible from the available fields?
- What data quality limitations, missing fields, duplicates, or inconsistent
  naming issues should be surfaced?

## 7. Dataset-To-Dashboard Workflow

Use the relevant skills when available:
- `vibe-testing` for validating the spec and dashboard assumptions.
- `csv-data-summarizer`, `xlsx`, and `exploratory-data-analysis` for profiling
  the dataset before design.
- `polars` for fast tabular processing; use `dask` or `vaex` only if the data is
  too large for memory.
- `statistical-analysis` for careful statistical summaries.
- `dashboard-creator`, `frontend-design`, and `shadcn` for the web dashboard.
- `d3js-visualization` only when custom charts are genuinely needed.
- `webapp-testing` for browser verification, screenshots, responsive checks, and
  console/error inspection.

Always inspect the real dataset before deciding KPI cards, filters, charts, or
tables. Do not hard-code assumptions that can be inferred from the data.

Expected dashboard capabilities, when supported by the data:
- KPI overview: total opportunities, total awarded value, number of agencies,
  number of suppliers, average award size, competition indicators.
- Time trends: opportunities, awards, budgets, award amounts, and procurement
  modes over time.
- Entity analysis: top procuring entities, suppliers, sectors/categories, and
  locations.
- Competition and transparency signals: single-bid patterns, repeated winners,
  budget-vs-award ratios, late/short posting windows, cancelled/failed bids,
  missing values, and other outliers.
- Filters: date range, agency, supplier, procurement mode, category, region or
  location, status, and amount ranges.
- Record inspection: sortable/searchable table with links or identifiers for
  source records when available.

## 8. Todo And Planning Expectations

Yes: set up a todo plan for this project. For dataset dashboard work, planning is
part of the task, not overhead.

At the start of non-trivial work:
- Create or update a short todo list.
- Include verification steps in the todo list.
- Keep exactly one item actively in progress.
- Update the todo as discoveries change the plan.

Recommended default plan:
1. Research PhilGEPS/domain context -> verify with source links.
2. Inspect dataset schema and quality -> verify with row counts, field types, and
   missing-value notes.
3. Define dashboard questions and success criteria -> verify against available
   fields.
4. Build data parsing and aggregation -> verify with spot checks.
5. Build the dashboard UI -> verify desktop and mobile layouts.
6. Test the running app -> verify console, interactions, filters, and chart
   totals.
7. Summarize results, assumptions, and next steps.

Ask questions only when genuinely blocked. Otherwise, make reasonable,
documented assumptions and continue.
