# Changelog

All notable changes to this project will be documented in this file.

This project follows Semantic Versioning (SemVer) using the format MAJOR.MINOR.PATCH.
- MAJOR: breaking changes
- MINOR: new features, backwards compatible
- PATCH: bug fixes and small improvements

## [Unreleased]
### Changed
- Top navigation is now sticky and keeps content visible on scroll.
- Reduced duplicate "Nueva visita" CTAs by removing the Visitas header action and making secondary buttons non-primary.
- Updated perritas form tab order to follow Nombre → Raza → Fecha → Notas for keyboard navigation.
- Localized date inputs to dd/mm/yyyy with month/year selectors for faster navigation while keeping stored ISO dates.
- Added native date picker triggers for birth date and visit date fields while keeping dd/mm/yyyy inputs.
- Removed month/year dropdowns from date inputs and kept the picker button inline with the date field.
- Added a success toast after saving a perrita so users get immediate confirmation.
- Updated UI copy to use "mascota" and added a pet type field (perro/gato/conejo/otro).
- Added mascota edit flow via modal dialog with full field updates.
- Kept the CLP cost field empty by default and only formatted on user input.
- Made clinic, vet, and notes fields rely on visible labels (with helper text) instead of placeholder-only context.
- Added confirmation before deleting a visit while keeping the undo toast flow.
- Added a clear button for the visit history search input.
- Improved dashboard and history empty-state guidance with clearer CTAs.
- Added a lightweight bar visualization for the Gasto por mascota section.
- Added microcopy clarifying the dashboard range filter affects all metrics.
- Added last backup metadata (date/time and counts) to the Respaldo section.

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
