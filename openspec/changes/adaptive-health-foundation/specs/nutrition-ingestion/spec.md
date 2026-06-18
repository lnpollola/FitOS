## ADDED Requirements

### Requirement: Upload and parse diet PDFs

The system SHALL accept PDF file uploads containing structured diet plans, extract meal names, serving sizes, calorie counts, and macronutrient values, and present the parsed data for user confirmation.

#### Scenario: Successful PDF parse with high confidence

- **WHEN** a user uploads a PDF with clearly tabular diet data (meal name, calories, protein, carbs, fat columns)
- **THEN** the system SHALL extract each meal row and display a preview table with a confidence indicator showing high confidence

#### Scenario: Low-confidence parse flagged for review

- **WHEN** a PDF does not match expected table structures or contains irregular formatting
- **THEN** the system SHALL display extracted data with low-confidence flagging on uncertain fields and require user confirmation before saving

#### Scenario: Unparseable PDF rejected

- **WHEN** a user uploads a scanned/image-based PDF with no extractable text
- **THEN** the system SHALL display an error stating the PDF could not be parsed and suggest manual entry as an alternative

### Requirement: Manual correction of parsed nutrition data

The system SHALL allow users to edit any field of a parsed meal entry (meal name, calories, protein, carbs, fat, serving size) before finalizing the import.

#### Scenario: Edit a parsed nutrition entry

- **WHEN** a user views a parsed meal entry and modifies the calorie value
- **THEN** the system SHALL update the displayed value and mark the entry as manually corrected

### Requirement: Store daily nutrition log from parsed PDFs

The system SHALL save confirmed parsed meal data as a daily nutrition log with date, meal list, total calories, and macronutrient breakdown.

#### Scenario: Confirmed import creates nutrition log

- **WHEN** a user confirms a parsed PDF import for a given date
- **THEN** the system SHALL create a daily nutrition log containing all confirmed meals and their totals

#### Scenario: View daily nutrition summary

- **WHEN** a user selects a date on the nutrition view
- **THEN** the system SHALL display that date's total calories, protein, carbs, and fat with a per-meal breakdown
