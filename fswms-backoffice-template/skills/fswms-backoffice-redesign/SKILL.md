---
name: fswms-backoffice-redesign
description: Safely redesign the internal FS WMS React and Tailwind CSS backoffice, including its shell and business modules, while preserving routes, API contracts, role permissions, storage keys, and user workflows. Use for UI migration or review in the ISP492-F-ORWMS frontend; do not use for backend changes or unrelated storefront/auth work.
---

# FS WMS Backoffice Redesign

Redesign the internal warehouse application as a clean, compact business UI inspired by mature SaaS products. Treat visual references as direction, not source code or a request for a pixel-identical copy.

## Required reading

Read these resources before changing code:

1. [Project contract](references/project-contract.md) — always read; it defines behavior that must not change.
2. [Design system](references/design-system.md) — read for shell, component, token, or page styling work.
3. [Migration playbook](references/migration-playbook.md) — read before migrating any route or module.

When this skill is bundled with the integrated template, inspect frontend/src/components/backoffice, frontend/src/components/shared, and the bo-* theme tokens in frontend/src/index.css as implementation examples. Adapt them to the current checkout; do not blindly overwrite newer project code.

## Working method

1. Locate the actual frontend root and inspect the current worktree before editing.
2. Identify the active route and its real importer. Do not redesign an unused duplicate merely because its filename appears relevant.
3. Record a baseline: build result, full lint error count, affected routes, visible actions by role, service calls, and representative screenshots.
4. Separate behavior from presentation. Keep fetching, mutation, validation, authorization, navigation, and domain status mapping in their current owners. Extract reusable presentation only.
5. Migrate one coherent module at a time. Finish its list, detail, create/edit, dialogs, filters, pagination, and states before moving on.
6. Run every gate in the migration playbook. If a gate fails, fix or restore the current module checkpoint; do not continue into another module.
7. Report exactly what changed, what remained untouched, verification performed, known pre-existing failures, and anything not testable because a backend or account was unavailable.

## Non-negotiable implementation rules

- Use the installed Tailwind build and semantic bo-* tokens. Never add Tailwind CDN scripts.
- Do not add embedded style elements or new static React style props. Dedicated CSS is allowed for theme tokens, necessary keyframes, third-party integration, and print rules.
- Use the existing React Router, Radix/shadcn primitives, and lucide-react. Do not add Font Awesome or copy external brand assets.
- Do not assemble Tailwind class names from partial strings. Use complete static class maps or CVA variants.
- Reuse small presentational components. Do not begin with a universal data-table or form-schema abstraction that could alter business behavior.
- Keep responsive layouts usable at 390, 768, 1024, 1280, and 1440 pixels. Tables may scroll inside their container; the page must not overflow horizontally.
- Preserve keyboard access, visible focus, labels, aria state, disabled state, and reduced-motion behavior.
- Do not add fake search, notifications, analytics, real-time claims, demo records, or actions unsupported by the current application.
- Do not install, remove, or upgrade packages unless the user explicitly authorizes it.

## Stop conditions

Stop and ask for direction when a requested visual change requires an API change, route change, permission change, new dependency, destructive cleanup, or an ambiguous product decision. Never silently expand UI redesign into backend, authentication, or data-model work.
