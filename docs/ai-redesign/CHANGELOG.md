# Changelog

## 2026-09-14 — Profile integration fix: `/user/:id` inside BackofficeLayout ✅

3 files: `App.jsx` — `/user/:id` route MOVED from PUBLIC ROUTES into the `<Route element={<BackofficeLayout />}>` group (URL unchanged, exactly one occurrence, no duplicate); `BackofficeLayout.jsx` — added `USER_PROFILE` PAGE_META entry (`/^\/user\/\d+$/` → "Hồ sơ cá nhân / Thông tin tài khoản của bạn"); `UserDetail.jsx` — standalone wrapper swapped for `PageContainer` (shell now provides canvas/typography/scroll). Everything else preserved: component, `useParams id`, all `nguoiDungService` calls/payloads, edit/save/cancel, validation, 2.5s success alert, `navigate(-1)` back, Hoạt động EmptyState, header dropdown link target.
Gate: build PASS; ESLint 0 on the 3 files; full-project lint 35 unchanged; diff --check clean; services/backend/package zero diff.

## 2026-09-14 — Final sync: role dashboards + personal profile + sidebar label ✅

9 files: 4 non-admin role dashboards (warehouse-manager/staff, sales-staff, purchase-staff) restyled to the approved baseline (PageContainer/PageHeader/Stat grid, bo tokens; fetch contract `getDashboard().then(res => setData(res.data.data))` + `if (!data) return null` gate preserved verbatim, including the no-catch error path and the pre-existing `revenueToday.toLocaleString()` null-crash risk — both documented, not silently changed); shared `components/dashboard/Stat.jsx` + `AlertBox.jsx` restyled to bo tokens (props `icon/label/value` and `title/subtitle/color` unchanged; consumers verified = only these dashboards); dispatcher fallback div restyled (text "Không có quyền truy cập" + DASHBOARD_MAP untouched); `pages/UserDetail.jsx` (`/user/:id`, public route) fully restyled + **demo activity feed removed** (user-approved: `activities` state, `fetchActivities` TODO, "Demo UI — cắm API sau" label → real shared EmptyState on the Hoạt động tab; all service calls, edit/save/cancel flow, password change, validation, 2.5s success alert, `navigate(-1)` preserved); sidebar label `Dashboard` → `Tổng quan` (only that one line; icon/to/roles arrays untouched — verified by diff).
Gate: build PASS; ESLint 0 on all 9 changed files; full-project lint 35 (26E/9W) unchanged vs previous round (these files were already lint-clean); diff --check clean; App.jsx/services/backend/package zero diff.

## 2026-09-14 — Phase 1: Shared backoffice foundation ✅

Modified: `frontend/src/components/backoffice/BackofficeLayout.jsx`, `BackofficeHeader.jsx`, `BackofficeSidebar.jsx`, `frontend/src/index.css` (added `@theme` bo-* tokens + `[data-backoffice-shell]` vars; scoped legacy gold dropdown CSS to `:not(.backoffice-user-menu)`).
Added: `frontend/src/components/backoffice/PageContainer.jsx`, `PageHeader.jsx`, `frontend/src/components/shared/` (FilterBar, SearchInput, TableShell, StatusBadge, EmptyState, LoadingState, ErrorState, SurfaceCard, FormSection, FormActions).
Preserved: PAGE_META_CONFIG, role filtering, collapse/mobile drawer, JWT decode, logout (clear both storages → /login), profile/store links, print.css import, sonner Toaster. Gates: build PASS, ESLint 0 on changed files, diff --check clean, frozen files untouched.

## 2026-09-14 — Phase 2a: Admin Dashboard `/dashboard` (quan_tri_vien) ✅ approved baseline

Modified: `frontend/src/pages/dashboard/admin/DashboardAdmin.jsx` only. Removed 420-line embedded `<style>`, gold palette, fake "real-time" badge; new KPI row, bar chart, alert tiles, users table + pagination with shared components. API contract identical (see audit): 2 calls on mount, same params, mapping, calculations, error handling, loading gate, navigation. Gates: build PASS, ESLint 0, diff --check clean.

## 2026-09-14 — Phase 2b: Admin & user management ✅

Migrated 7 files: `pages/admin/ViewUserListByAdmin.jsx`, `AddUserByAdmin.jsx`, `ViewUserDetailByAdmin.jsx`, `ResetUserPasswordByAdmin.jsx`, `EditUserRoleByAdmin.jsx`, `components/admin/AssignWarehousePermissionModal.jsx`, `PermissionMatrix.jsx`.
Preserved: filter payload builder (`fieldName/operation/value/logicType` + `sorts ngayTao DESC`), search-as-you-type fetch with page reset, page sizes [5,10,20,50,100] (defaults 5/10 kept), row click → `/users/:id` + stopPropagation Reset, success toast via `location.state` + `navigate(replace)`, native required validation + default role `nhan_vien_kho`, toggle-status + re-fetch, per-warehouse `gan-quyen` loop with `kho_id` header override, delete-permission AlertDialog, infinite-scroll warehouse picker (pageSize 20, 80px), PermissionMatrix `nhomQuyen` grouping, UI-only status select, 1000ms delayed navigation.
Fixed (user-approved): AssignWarehousePermissionModal toasts react-toastify → sonner (same messages; previously invisible — no ToastContainer was mounted).
Gates: build PASS; ESLint 0 on changed files; full-project lint 145 (106E/39W) vs baseline 152 — decreased; diff --check clean; frozen files zero diff.

## 2026-09-14 — Phase 3: Categories, attributes, products ✅ (module gate passed)

Gate: build PASS; full-project lint **129 (94E/35W)** vs baseline 152 — decreased; diff --check clean; frozen files zero diff; changed-file ESLint 0 everywhere.

## 2026-09-14 — Phase 4: Suppliers, purchasing, receiving ✅ (module gate passed)

21 files migrated: supplier list/detail/view; purchase-request list/create/detail + 2 send-quotation screens + /duyet-don-hang; quotation-request list/create/detail + quotation detail; purchase-order list/create-manual/detail + VietQR payment (20s polling, click-to-copy, exact VietQR URL builder preserved; dark-neon styles object fully replaced); goods-receipts list/create/detail/lot-input (3-source PO/TRANSFER/RETURN eligibility + ghiChu-based return dedup + isAllDuLo complete gate preserved verbatim; broken dead CSS block in KhaiBaoLo removed after verifying no references). Print page frozen (zero diff). Dead-code cleanup (zero runtime effect, replaces eslint-disable): removed unused canApprove/canCreateQuotation/userRoles/actionLoading/loadingAuth/showApproveActions/rejectReason/formatCurrency in 5 order files; auth get-by-id fetches KEPT firing (request count unchanged), their results now discarded with explanatory comments.
Gate: build PASS; full-project lint **78 (56E/22W)** vs baseline 152 — decreased; diff --check clean; frozen files + print pages zero diff; no eslint-disable comments in any migrated file.

## 2026-09-14 — Phase 5 + Phase 6: Warehouse ops + Sales/customers ✅ (combined gate passed)

Phase 5 (13 files): Warehouse + WarehouseDialog (250ms debounce, current-page stats quirk, maKho uppercase, min-5-chars); goods-issues list/create/detail/view + PickLot (router `state` payload contract, per-lot validations, isReadOnly gate); transfer list/create/detail (workflow ladder by status + warehouse ownership, relatedIssue/relatedReceipt dedup, nhan_vien_kho create-button hide, master-cancel createPortal kept); stock-take list/create (dual route, 2-step wizard, uncontrolled defaultValue quirk kept); LichSuGiaoDichKhoList (the only direct localStorage-role page — isAdmin/isQuanLy visibility filter, TRƯỚC/THAY ĐỔI/SAU triptych kept). Phase 6 (9 files): customers list/detail/edit (local khachHangService kept verbatim, VN phone regex, RadioGroup/Switch); sales-orders list/create/detail (JWT role gates, client-side date filter, ±10% pricing guard, portal return modal, convert-to-order flow); Bao-gia list/create/detail. Dead-code cleanup without eslint-disable across both agents (unused imports/states/helpers, file-local duplicates). Print pages + dead warehouse files: zero diff.
Gate: build PASS; full-project lint **44 (33E/11W)** vs baseline 152 — decreased; diff --check clean; frozen files + print pages + dead files zero diff.

## 2026-09-14 — Phase 7: Reports ✅ (final module gate passed)

4 files: TonKhoTongQuan (3-step auth, ALLOWED_ROLES gate + exact denial text, canNhapKho, all 3 `selected_kho_id` setItem/removeItem sites byte-identical, status buckets, footer aggregates, <style> block deleted), BaoCaoDoanhThu (raw fetch API_BASE localhost:8080 kept exactly, manual "Xem báo cáo", auto-load trigger [loai,khoId] preserved via ref bridge, recharts configs kept with bo palette), KhachHangReport + NhatKyNhapXuat (raw fetches, 7 tabs, year selects, compare month, LoaiGdBadge; hardcoded fake kho options KHO01–KHO04 kept exactly as-shipped per fake-data rule). Zero eslint-disable; dead code removed (tab/setTab, unused imports, removed one pre-existing disable by restructuring).
Gate: build PASS; full-project lint **35 (26E/9W)** vs baseline 152 — decreased; diff --check clean; frozen files zero diff.

## 2026-09-14 — Phase 3 detail

Migrated `pages/product/index.jsx` (/products): filter payload builder verbatim, 500ms keyword debounce / 0ms other filters, 3 parallel stats calls (size:1 per status), client-side statusOrder sort (1,0,2), delete confirm flow, success-toast via location.state, windowed pagination sizes [5,10,20,50,100], table max-h 520px internal scroll, all modals mounted as before (incl. dead-but-mounted ProductModal + InventoryDrawer, commented-out inventory button kept commented).
Migrated `pages/danh-muc-quan-ao/DanhMucQuanAoTree.jsx`, `pages/attribute/ProductAttributeHub.jsx`, `pages/attribute/ColorSizeManagement.jsx` (agent-verified: ESLint 0, zero legacy markers, zero inline styles). Tree: full HTML5 drag&drop reparent + isDescendant cycle guard, expand/collapse Set pruning, inline edit/create preserved; indentation via static level-class map. AttributeHub: 3-tab payload verbatim, client material tab, RHF+zod, auto-code generator kept, luxury ViewModal → clean bo dialog, delete → ConfirmModal. ColorSizeManagement: `<style>` block deleted, server paging + "x / y" PaginationBar shape kept, hex picker kept, 4 pre-existing lint errors resolved (unused destructures/state now driving UI).
In progress (agent): ProductDetail, SkuBuilder, AddProductModal, EditProductModal. Frozen: BarcodePrint.jsx (print label — skill separate track).
