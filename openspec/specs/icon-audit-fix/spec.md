# Icon Audit Fix

## Purpose

Reparar iconos rotos en la interfaz causados por imports faltantes en el sistema de iconos Lucide, y eliminar imports muertos que inflaban el bundle.

## Requirements

### Requirement: Every registered icon name has a corresponding Lucide import

The icon registry in `src/renderer/utils/icons.js` SHALL have an import for every icon name used in the registry. Missing icons (`Info`, `AlertTriangle`, `CheckCircle`, `BadgeCheck`, `Pencil`, `Trash2`, `Archive`, `X`) SHALL be added as named Lucide imports and registered with their correct icon name key.

#### Scenario: Missing icons render correctly
- **WHEN** `icon('info')`, `icon('alert-triangle')`, `icon('check-circle')`, `icon('badge-check')`, `icon('pencil')`, `icon('trash-2')`, `icon('archive')`, `icon('x')` are called
- **THEN** each SHALL return a valid SVG string
- **THEN** each SHALL render visually in the view

### Requirement: No unused icon imports

The icon module SHALL NOT import Lucide icon components that are never used. Unused imports (`Download`, `Upload`, `Menu`, `Zap`, `Lightbulb`, `ScanLine`, `ArrowUpRightFromSquare`, `CircleUser`, `AlertCircle`) SHALL be removed from the import statement.

#### Scenario: No dead icon imports survive
- **WHEN** the module is inspected
- **THEN** the Lucide import statement SHALL NOT include the 9 dead icon names
- **THEN** the built bundle SHALL be measurably smaller
