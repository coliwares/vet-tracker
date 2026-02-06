# Changelog

All notable changes to this project will be documented in this file.

This project follows Semantic Versioning (SemVer) using the format MAJOR.MINOR.PATCH.
- MAJOR: breaking changes
- MINOR: new features, backwards compatible
- PATCH: bug fixes and small improvements

## [Unreleased]

## [1.0.0] - 2026-02-06
### Added
- Top navigation with Dashboard, Visitas, Perritas, and Ajustes sections.
- Dashboard range filter (30/90 days, year, all) and summary cards.
- Historial redesign with card layout, expandable details, and chip filters.
- Full-text search, sort, and range filtering utilities for visits.
- Perritas cards with age formatting and "Ver visitas" CTA.
- Nueva visita refactor with reason chips and collapsible details.
- Formatted CLP cost input with parsing utilities.
- Backup import preview with replace/merge options and merge summary.
- Reusable confirm dialog for destructive actions.
- Undo toast for visit deletion.

### Changed
- Respaldo and Mantenimiento moved into Ajustes.
- "Nueva visita" CTA visible in Visitas and Dashboard history.
- Delete perrita action moved into a menu with modal confirmation.
- "Borrar todo" now requires typing "BORRAR" to confirm.
- Improved accessibility and UI consistency (ARIA, focus-visible, spacing, and interaction states).

### Tests
- Unit tests for visit filters, stats utilities, formatAge, and currency helpers.
- Unit tests for backup dedupe and merge utilities.

### CI
- Deploy workflow now runs tests and lint before build.

### Styles
- Updated styles for navigation, dashboard controls, visit cards, and dialogs.
