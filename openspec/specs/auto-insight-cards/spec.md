# Auto Insight Cards

## Purpose

Generate 5–8 auto-insight cards from already-computed KPIs using deterministic template functions that return null when preconditions are not met.

## Requirements

### Requirement: Auto-insight cards are deterministic heuristic templates

The system SHALL generate 5–8 auto-insight cards from already-computed KPIs using deterministic template functions in `src/renderer/utils/kpi-derivation.js`. Each template function SHALL return a `null` value when its precondition is not met, hiding that insight. The system SHALL compute all templates, sort by severity (`positive` < `info` < `alert`), and return the top 5–8 that produced non-null output.

#### Scenario: Best-week-streak insight
- **WHEN** the user's current ISO-week activity streak is ≥ 4 weeks
- **THEN** an insight card SHALL appear with text: "Llevas N semanas consecutivas con actividad — tu mejor racha desde {month_name}."
- **THEN** the card SHALL have a `flame` icon, severity `positive`, and a "Ver racha" link navigating to the dashboard

#### Scenario: HRV deviation insight
- **WHEN** the 7-day mean HRV is ≥ 10% above or below the 30-day baseline
- **THEN** an insight card SHALL appear with text: "HRV {pct}% {direction} tu promedio de 30 días."
- **THEN** `direction` SHALL be "por encima de" if positive, "por debajo de" if negative
- **THEN** the card SHALL have a `heart-pulse` icon, severity `info` (positive deviation) or `alert` (negative deviation), and a "Ver HRV" link navigating to the dashboard

#### Scenario: Rest-day streak insight
- **WHEN** the user has 5+ consecutive days with no `sport_activities` rows
- **THEN** an insight card SHALL appear with text: "Llevas N días sin actividad — ¿descanso planificado o rutina perdida?"
- **THEN** the card SHALL have a `bed` icon, severity `info`, and a "Ir a Actividad" link navigating to the activity view

#### Scenario: Weight direction match insight
- **WHEN** both weight velocity (28d) and `target_pace` from settings are defined
- **THEN** an insight card SHALL appear with text: "Tu ritmo actual ({velocity} kg/sem) está {relation} tu objetivo ({target} kg/sem)."
- **THEN** `relation` SHALL be "por debajo de" (deficit, on track) or "por encima de" (surplus, off track)
- **THEN** the card SHALL have a `scale` icon, severity `info`

#### Scenario: Sport variety insight
- **WHEN** the user has trained ≥ 4 distinct sport types in the trailing 90 days
- **THEN** an insight card SHALL appear with text: "Has entrenado {N} deportes distintos esta semana. Diversidad alta."
- **THEN** the card SHALL have a `layers` icon, severity `positive`

#### Scenario: Recovery trend insight
- **WHEN** the recovery score has changed by ≥ 10 points in the last 7 days
- **THEN** an insight card SHALL appear with text: "Tu recuperación ha {direction} un {N}% en los últimos 7 días."
- **THEN** `direction` SHALL be "mejorado" or "empeorado"
- **THEN** the card SHALL have a `activity` icon, severity `info` or `alert`

#### Scenario: WHR improvement insight
- **WHEN** the user has WHR data spanning ≥ 12 weeks
- **THEN** an insight card SHALL appear with text: "Tu ratio cintura-cadera ha {direction} de {a} a {b} en 12 semanas."
- **THEN** `direction` SHALL be "mejorado" or "empeorado"
- **THEN** the card SHALL have a `ruler` icon, severity `info`

#### Scenario: PR week insight (sport records only)
- **WHEN** the user has set ≥ 1 sport personal record (5K, 10K, half marathon, etc. from `sport_activities` distance/duration records) in the trailing 7 days
- **THEN** an insight card SHALL appear with text: "Has establecido {N} récords personales en deporte esta semana."
- **THEN** the card SHALL have a `medal` icon, severity `positive`
- **THEN** the card's `navigateTo` SHALL point to the `dashboard` view (where the Phase 1 PR banner lives)

#### Scenario: PR week insight does not include exercise (strength) PRs
- **WHEN** the user has set 0 sport PRs but ≥ 1 exercise PR (1RM, volume PR) in the trailing 7 days
- **THEN** the sport PR week template SHALL return null (no insight fires)
- **THEN** the user SHALL NOT see this insight card
- **THEN** Phase 3 (`strength-training-insights`) owns the exercise-PR insight template; this spec SHALL NOT define a competing template for exercise PRs

### Requirement: Auto-insight cards have icon, text, severity, and navigation

The system SHALL render each auto-insight card as a horizontal card with: a Lucide icon (left, 18px), the insight text (center, 1-2 lines), a severity chip (right, color-coded: positive=moss, info=lichen, alert=ember), and a "Ver detalle" link at the bottom that navigates to the linked view. Each card SHALL have `role="article"` and `aria-label` summarizing the insight.

#### Scenario: Card renders with all elements
- **WHEN** an insight card is generated
- **THEN** the card SHALL display the icon, text, severity chip, and "Ver detalle" link
- **THEN** the card SHALL have `aria-label="Insight: {text}"`
- **THEN** the card SHALL be a `<button>` for keyboard activation (Enter/Space)
- **THEN** clicking the card or pressing Enter/Space SHALL navigate via `electronAPI.navigate(viewName)`

#### Scenario: Card severity colors
- **WHEN** a card has severity `positive`
- **THEN** the chip background SHALL be `var(--moss)` with white text
- **WHEN** a card has severity `info`
- **THEN** the chip background SHALL be `var(--moss-mist)` with `var(--ink)` text
- **WHEN** a card has severity `alert`
- **THEN** the chip background SHALL be `var(--ember)` with white text

### Requirement: Auto-insight generation runs client-side from already-fetched KPIs

The system SHALL provide a pure function `generateAutoInsights(input)` in `src/renderer/utils/kpi-derivation.js` that accepts a payload `{ weekStreak, recoveryScore, weightVelocity, sportDistribution, restDayStreak, hrvDeviation, recentPRs, whrTrend, recoveryTrend }` and returns an array of `{ icon, text, severity, navigateTo }` cards. The function SHALL be called by `views/insights.js` after all 7 IPC calls have resolved, using the already-fetched data — no separate IPC.

#### Scenario: Function returns 5-8 cards
- **WHEN** `generateAutoInsights` is called with a complete payload where 7 templates return non-null
- **THEN** the function SHALL return 7 cards, sorted by severity (`positive` first, then `info`, then `alert`)
- **THEN** the 8 templates SHALL be exactly: `bestWeekStreak`, `hrvDeviation`, `restDayStreak`, `weightDirectionMatch`, `sportVariety`, `recoveryTrend`, `whrImprovement`, `sportPRWeek` (sport PRs only, distinct from any future exercise-PR template in Phase 3)
- **WHEN** only 3 templates return non-null
- **THEN** the function SHALL return 3 cards
- **WHEN** 0 templates return non-null
- **THEN** the function SHALL return an empty array and the renderer SHALL show the empty state

#### Scenario: Function is deterministic
- **WHEN** `generateAutoInsights` is called twice with the same payload
- **THEN** the output SHALL be byte-for-byte identical
- **THEN** no randomness, no timestamps in the output, no LLM calls

#### Scenario: Minimum thresholds suppress marginal signals
- **WHEN** HRV deviation is 5% (below the 10% threshold)
- **THEN** the HRV template SHALL return null
- **WHEN** the streak is 2 weeks (below the 4-week threshold)
- **THEN** the best-week-streak template SHALL return null
- **WHEN** the weight velocity is -0.1 kg/week and target is -0.5 kg/week
- **THEN** the weight direction match template SHALL return null (no significant divergence)
