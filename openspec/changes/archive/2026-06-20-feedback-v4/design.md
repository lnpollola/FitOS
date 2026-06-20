## Context

Feedback-v3 final verification identified hardcoded Spanish strings in activity view that should use locale keys. Additionally, measurements view enhancements were deferred from v3 scope: compact grid layout, top-5 history, KPI overlays on charts, monthly weight split, multi-chart for chest/neck/shoulders with trendlines, and before/after formatting improvements.

## Goals / Non-Goals

**Goals:**
- Replace all hardcoded Spanish strings in activity.js with locale keys from locales/es.js
- Restructure measurements view history to show only top-5 recent entries with inline delete
- Reduce individual metric chart cards to compact 140px height with KPI overlays (current value + delta)
- Split weight trend chart by calendar months with month-over-month KPIs
- Add combined chest/neck/shoulders chart with trendline and per-metric KPIs
- Improve before/after comparison table with color-coded deltas using shared logic

**Non-Goals:**
- No new IPC handlers or DB schema changes
- No new HealthSync metrics (deferred unless trivial)
- No changes to measurement form, quick weight entry, or body fat estimation sections

## Decisions

1. **Inline KPI overlay instead of canvas plugin**: Render KPI text (current and delta) as absolutely-positioned div overlays on each chart card rather than using Chart.js plugin annotations. Simpler, no extra dependency.

2. **Chart height 140px for compact grid**: Reduces from current ~200px to 140px to fit more cards in viewport. Single metric chart canvas, no legend.

3. **Monthly weight split via chart grouping**: Use existing weight_entries data; render as separate datasets grouped by month label. Weight list table stays unchanged.

4. **Top-5 history**: Show only the 5 most recent date rows in the history table. Provide "Ver todo" toggle button to expand to full list. Remove column-level delete buttons from individual metric columns (keep row-level delete).

5. **Shared delta logic**: Extract the delta formatting (sign, color by metric type) into a shared helper used by both history and before/after comparison.

## Risks / Trade-offs

- Compact charts (140px) may be too small for users with many data points → mitigatable with responsive height fallback
- Hardcoded string fix may miss some strings → review by checking all remaining views for similar patterns
