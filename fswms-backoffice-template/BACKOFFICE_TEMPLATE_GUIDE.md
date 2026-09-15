# FS WMS integrated backoffice template

This package is a full source snapshot of ISP492-F-ORWMS at:

- Commit: 7af418f91de052767e1001205ff7f81d13dbe219
- Remote branch checked: origin/main
- Remote HEAD checked: the same commit
- Snapshot time: 2026-09-12 UTC

It is not a synthetic UI demo. Existing frontend pages, services, routes, backend source, production templates, configuration, and lockfiles were copied from the project. Only the backoffice visual foundation described below was changed.

## Foundation changes

- Restyled BackofficeLayout, BackofficeHeader, and BackofficeSidebar.
- Preserved SidebarProvider, React Router navigation, JWT decoding, profile path, store path, logout cleanup, menu configuration, and role filtering.
- Added bo-* Tailwind v4 tokens without replacing legacy tokens.
- Narrowed the old gold dropdown override so the new account menu can use neutral styling while unmigrated dropdowns remain unchanged.
- Added small presentation-only components for gradual migration:
  - PageContainer and PageHeader
  - SurfaceCard and TableShell
  - FilterBar and SearchInput
  - StatusBadge
  - LoadingState, EmptyState, and ErrorState
  - FormSection and FormActions
- Added the fswms-backoffice-redesign skill under skills/.

## Deliberately unchanged

- frontend/src/App.jsx and every route
- frontend/src/services and every API contract
- backend source
- active dashboard dispatch logic
- all feature pages and their forms
- sidebar.config.js role arrays and paths
- access_token, role, and selected_kho_id behavior
- authentication screens and assets
- supplier/public/storefront pages
- print templates
- package.json and package-lock.json

Legacy gold page styling remains temporarily because removing it before migrating its consumers would cause broad regressions. The new shell is the checkpoint from which modules should be redesigned one at a time.

## Run

Use Node 20 or Node 22:

    cd frontend
    npm ci
    npm run dev

Production verification:

    npm run build

The source project currently has pre-existing full-project ESLint failures. For each migration, lint every changed file and ensure the full baseline does not increase.

## Use the skill

Give the skills/fswms-backoffice-redesign folder to the coding AI or install it in its supported skills location. Then invoke:

    Use $fswms-backoffice-redesign to migrate the next FS WMS module.

The skill requires the AI to preserve project contracts, migrate by module, verify all five roles, compare API requests, and stop when a change would require new product or backend authority.

## Important compatibility note

This template matches the inspected project snapshot rather than predicting future commits. If origin/main changes after the commit listed above, compare the newer source first and port only the foundation changes; do not overwrite newer business code with this snapshot.
