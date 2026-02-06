# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]
- Added top navigation with Dashboard, Visitas, Perritas, and Ajustes sections.
- Moved Respaldo and Mantenimiento into Ajustes.
- Added primary "Nueva visita" CTA in Visitas and Dashboard history.
- Added dashboard range filter (30/90 days, year, all) and summary cards.
- Added visit utilities and dashboard stats helper.
- Added unit tests for visit utilities and dashboard stats.
- Added Vitest configuration for running tests.
- Added tests and lint steps to the deploy workflow.
- Updated styles for navigation, sections, dashboard controls, and cards.
- Replaced Perritas list with cards showing name, breed, and formatted age.
- Added "Ver visitas" CTA to open Visitas filtered by perrita.
- Moved delete action into a menu with confirmation.
- Added formatAge utility and unit tests.
- Refactored Nueva visita form with reordered fields, reason chips, and details section.
- Added formatted CLP cost input with parsing utilities and tests.
- Added toast confirmation and quick "Agregar otra visita" action.
- Redesigned Historial with card layout, expandable details, and chip filters.
- Added search/sort/filter utilities for visits with unit tests.
