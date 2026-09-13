# Safe migration playbook

## Phase 0 — Baseline

- Inspect git status and preserve unrelated user changes.
- Use the Node version declared by package.json, preferably Node 22 for the inspected baseline.
- Install from the existing lockfile.
- Record npm run build and the full-project lint error count.
- Record affected routes, roles, actions, browser console output, requests, and representative screenshots.
- Create a reversible local checkpoint. Do not commit or push unless authorized.

## Phase 1 — Foundation

- Keep the bo-* semantic tokens scoped to new work.
- Use or extend the provided backoffice and shared presentation components.
- Do not globally recolor generic utility selectors or add new important overrides.
- Verify auth, dropdown, dialog, storefront, and print screens before continuing.

## Phase 2 — Application shell

- Restyle the active Layout, Header, and Sidebar without replacing routing or permission logic.
- Preserve role filtering, active-route matching, submenu expansion, desktop collapse, mobile drawer, profile link, store link, and logout.
- Do not add placeholder search, help, notification, or analytics controls.

## Phase 3 — Active dashboards

- Identify the real dashboard dispatcher and all five role-specific components.
- Preserve services, calculations, and loading behavior. A one-time fetch must not be labeled real time.
- Migrate all role dashboards, run the full gate, and stop for visual approval.

## Phase 4 — Master data

Migrate coherent groups:

1. Users, warehouses, suppliers, and customers.
2. Categories, attributes, products, SKU, and pricing.

Complete list, detail, create/edit, modal, filters, pagination, and role behavior for one group before starting the next.

## Phase 5 — Procurement

Migrate purchase requests, quotation requests, quotation details, purchase orders, payments, approvals, and rejections as one connected workflow. Compare requests and state transitions before and after.

## Phase 6 — Warehouse operations

Migrate receipts, lot declaration, issues, lot picking, internal transfers, stock takes, inventory overview, and transaction history. Verify selected warehouse context on every relevant request.

## Phase 7 — Sales and reports

Migrate quotations, sales orders, details, invoices, and reports. Preserve calculations, date ranges, filters, export and print behavior, and chart semantics.

## Phase 8 — Separate tracks

Handle public supplier pages, storefront pages, and print templates only when explicitly included. They do not inherit the backoffice shell merely for visual consistency.

## Phase 9 — Cleanup

Search for remaining legacy markers:

    rg "lux-sync|warehouse-unified|gold-text-sync" frontend/src
    rg "<style|style=\\{\\{" frontend/src
    rg "!important" frontend/src

Delete only confirmed unused CSS in small patches. Never use broad search-and-replace for colors or class names.

## Per-module gate

A module is complete only when every applicable check passes:

- Production build succeeds.
- Changed files have zero ESLint errors and warnings.
- Full-project lint error count does not increase from baseline.
- No dependency or lockfile change.
- No new console error, blank page, redirect loop, or page-level horizontal overflow.
- Layout is checked at 1440, 1280, 1024, 768, and 390 pixels.
- All five roles show the same permitted routes and actions as before.
- Loading, data, empty, no-result, error, validation, submitting, and unauthorized states are checked.
- Request method, URL, query, body, authorization, warehouse header, call count, and trigger match baseline.
- Keyboard navigation, focus, dropdown and dialog behavior, pagination, filters, browser history, and logout remain usable.
- Print preview is checked whenever a printable workflow changes.

If any gate fails, repair or restore the current module checkpoint. Do not hide failures by weakening lint, changing API behavior, adding important rules, or mocking production code.

## Completion report

Report:

1. Files changed and the purpose of each.
2. Routes and roles tested.
3. API and network contracts compared.
4. Build and lint results, clearly separating pre-existing failures.
5. Viewports and UI states tested.
6. Deliberately untouched scope.
7. Limitations, including unavailable backend services or credentials.
