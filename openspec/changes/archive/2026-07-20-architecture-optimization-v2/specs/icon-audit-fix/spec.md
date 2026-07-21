# Icon Audit Fix

## ADDED Requirements

### Requirement: Every registered icon name has a corresponding Lucide import

The icon registry in `src/renderer/utils/icons.js` SHALL have an import for every icon name used in the registry. Currently missing: `Info`, `AlertTriangle`, `CheckCircle`, `BadgeCheck`, `Pencil`, `Trash2`, `Archive`, `X`. These SHALL be added as named Lucide imports and added to the registry with their correct icon name key.

#### Scenario: Missing icons render correctly
- **WHEN** `icon('info', 16)`, `icon('alert-triangle', 16)`, `icon('check-circle', 16)`, `icon('badge-check', 16)`, `icon('pencil', 16)`, `icon('trash-2', 16)`, `icon('archive', 16)`, `icon('x', 16)` are called
- **THEN** each SHALL return a valid SVG string
- **THEN** each SHALL render visually in the view (goals edit/archive/delete buttons, dashboard info tooltips, strength-insights plateau warnings, PR modal close button)

### Requirement: No unused icon imports

The icon module SHALL NOT import Lucide icon components that are never used. Currently unused: `Download`, `Upload`, `Menu`, `Zap`, `Lightbulb`, `ScanLine`, `ArrowUpRightFromSquare`, `CircleUser`, `AlertCircle`. These SHALL be removed from the import statement.

#### Scenario: No dead icon imports survive
- **WHEN** the module is inspected
- **THEN** the Lucide import statement SHALL NOT include the 9 dead icon names
- **THEN** the built bundle SHALL be measurably smaller (excludes ~2 KB of dead code)
