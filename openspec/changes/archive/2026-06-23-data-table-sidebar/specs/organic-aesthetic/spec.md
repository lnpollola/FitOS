## MODIFIED Requirements

### Requirement: Tables use organic typography and palette

The system SHALL apply the organic design tokens (Fraunces for headers, Source Sans 3 for body, moss/bone/ember palette, moss-mist accents) to all data tables via the `.data-table` component. Tables SHALL NOT use the pre-organic default styling (Inter, uppercase headers, solid border-bottom).

#### Scenario: Organic table headers
- **WHEN** a `.data-table` renders
- **THEN** headers SHALL use Fraunces italic 500 at 12px in moss-ink
- **THEN** header background SHALL be moss-mist
- **THEN** no uppercase text-transform SHALL be applied

#### Scenario: Organic table body
- **WHEN** a `.data-table` body renders
- **THEN** cells SHALL use Source Sans 3 at 13px in moss-ink
- **THEN** even rows SHALL use smoke background
- **THEN** odd rows SHALL use paper background

### Requirement: Sidebar sections use organic typography

The system SHALL style sidebar section headers (`.nav-section`) with Fraunces italic at 10px in lichen color, uppercase with `letter-spacing: 0.08em`, consistent with the organic aesthetic's treatment of label text.

#### Scenario: Section header typography
- **WHEN** the sidebar renders with sections
- **THEN** section headers SHALL use Fraunces italic 500
- **THEN** section headers SHALL be uppercase
- **THEN** section headers SHALL use lichen color
