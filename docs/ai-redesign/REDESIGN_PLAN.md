# FS WMS Backoffice Redesign Plan

Source of truth: `./frontend` (active) · Reference (read-only, never imported): `./fswms-backoffice-template/frontend` · Skill: `./fswms-backoffice-template/skills/fswms-backoffice-redesign/SKILL.md`

## Goal

Migrate every page reachable by `quan_tri_vien` from the legacy gold/ivory system to the FS WMS backoffice design language (baseline = the approved Admin Dashboard at `/dashboard`). Presentation-only: all backend, services, routes, roles, storage, and workflow logic stay unchanged.

## Confirmed scope decisions (2026-09-14)

1. Migrate ALL BackofficeLayout routes, including hidden ones: `/bao-cao/doanh-thu`, `/bao-cao/khach-hang`, `/bao-cao/xuat-nhap`, `/duyet-don-hang`, `/attribute`.
2. Print pages FROZEN: `/goods-receipts/:id/print`, `/goods-issues/:id/print`, `/sales-quotations/:id/print`, `/sales-orders/:id/invoice` (verify only).
3. Fix broken toasts in AssignWarehousePermissionModal: react-toastify → sonner (same messages).
4. Dead code (DashboardByAdmin, RevenueChart, StatCard, root api.js): documented, deleted only in final cleanup with approval.

## Phases

| Phase | Scope | Status |
|---|---|---|
| 0 | Audit + baselines | ✅ done |
| 1 | Shared foundation (shell, tokens, shared components) | ✅ done |
| 2 | Admin & user management | ✅ done |
| 3 | Categories, attributes, products | ✅ done |
| 4 | Suppliers, purchasing, receiving | ✅ done |
| 5 | Warehouse operations | ✅ done |
| 6 | Sales and customers | ✅ done |
| 7 | Reports | ✅ done |
| 9 | Cleanup (dead code + legacy CSS removal, with approval) | ⬜ pending |

## Route inventory (real App.jsx, 2026-09-14)

See MIGRATION_STATUS.md for live per-route status. 64 backoffice routes total: 1 dashboard dispatcher (5 role variants), 5 admin/user pages, 6 product/attribute/category, 1 warehouse, 16 purchasing/receiving (incl. 2 frozen prints), 11 issue/transfer/stock-take (incl. 1 frozen print), 9 sales/customers (incl. 2 frozen prints), 4 reports, 1 hidden approval screen, 1 warehouse history. Frozen outside scope: `/user/:id`, auth, storefront, supplier public pages, 404.

## Design contract → DESIGN_CONTRACT.md
## Live status + gates → MIGRATION_STATUS.md
## History → CHANGELOG.md

## Per-module method (MIGRATION RULES)

1. Locate the real rendered component (never assume by filename).
2. Read its logic fully; separate data/controller code from markup.
3. Rewrite markup with Tailwind + shared components only; keep every service call, payload, state variable, handler, guard, and navigation intact.
4. Watch the `react-hooks/set-state-in-effect` lint rule: fetch-on-mount = `useCallback` loader invoked via `queueMicrotask(() => loader(...))` inside the effect (same pattern as the approved DashboardAdmin). 0 lint problems per changed file.
5. Dropdowns on migrated pages add `backoffice-user-menu` to opt out of the legacy gold dropdown CSS (hook already in index.css; no CSS edit).
6. Real zero/empty data is valid — render explicit zero/empty states; never fake data.
7. Run the module gate (MIGRATION_STATUS.md) before moving on; update docs after every module.
