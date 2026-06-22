# Accessibility

## MODIFIED Requirements

### Requirement: prefers-reduced-motion for all animations

All animations and transitions in the app SHALL be disabled or reduced when the user has `prefers-reduced-motion: reduce` enabled. This extends the existing rule in `main.css` to cover new animations (skeleton pulse, card stagger, chart transitions, hero breath animation, organic easing-based hover transitions). Typography changes (Fraunces display, italic eyebrows, paper grain texture) and color shifts are NOT motion and SHALL remain under reduced-motion.

#### Scenario: Skeleton animation disabled with reduced motion
- **WHEN** `prefers-reduced-motion: reduce` is active
- **THEN** `.skeleton` elements SHALL have `animation: none` (static grey background)

#### Scenario: Card stagger animation disabled with reduced motion
- **WHEN** `prefers-reduced-motion: reduce` is active
- **THEN** staggered card fade-in animations SHALL be disabled (cards appear immediately without delay)

#### Scenario: Hero breath animation disabled with reduced motion
- **WHEN** `prefers-reduced-motion: reduce` is active
- **THEN** the hero ring's breath animation (`scale(1 ↔ 1.012)` loop on `.card-hero .hero-ring-wrap`) SHALL be disabled via `animation: none`
- **THEN** the ring SHALL render at scale 1 without motion

#### Scenario: Organic hover transitions disabled with reduced motion
- **WHEN** `prefers-reduced-motion: reduce` is active
- **THEN** `.dashboard-card`, `.card`, `.filter-btn`, and `.btn` hover transitions that use `var(--ease-organic)` SHALL have `transition-duration: 0s` (or `transition: none`)
- **THEN** the visual hover state (shadow + border color) SHALL still apply instantly

#### Scenario: Typography and grain unaffected by reduced motion
- **WHEN** `prefers-reduced-motion: reduce` is active
- **THEN** `font-family` declarations (Fraunces, Source Sans 3) SHALL still apply
- **THEN** the `body.organic::before` paper grain overlay SHALL still render at its declared opacity
- **THEN** eyebrow italic styling SHALL still apply