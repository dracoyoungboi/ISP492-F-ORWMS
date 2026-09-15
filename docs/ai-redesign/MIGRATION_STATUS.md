# Migration Status

Legend: ✅ migrated+verified · 🔄 in progress · ⬜ pending · 🔒 frozen (print pages / out of scope) · 🚫 blocked

## Baselines (Phase 0, 2026-09-14)

- Build: PASS (vite 7.3.1; pre-existing chunk-size warning, 2.4MB bundle).
- Lint full project: **152 problems (110 errors, 42 warnings)** — pre-existing; gate = never increase.
- Shell + Dashboard lint: 0 problems. `git diff --check`: clean.
- ProtectedRoute / 401 redirect: **missing** → separate security task (not part of this migration).
- Working tree (uncommitted, preserved): shell round files + DashboardAdmin redesign + new shared kit; `fswms-backoffice-template/` untracked.

## Route matrix (real App.jsx → real component)

| Route | Component | Status |
|---|---|---|
| /dashboard (dispatcher) | pages/dashboard/Dashboard.jsx → 5 role variants | ✅ admin variant redesigned+approved; dispatcher and 4 other variants untouched |
| /users | pages/admin/ViewUserListByAdmin.jsx | ✅ Phase 2b |
| /users/add | pages/admin/AddUserByAdmin.jsx | ✅ Phase 2b |
| /users/:id | pages/admin/ViewUserDetailByAdmin.jsx | ✅ Phase 2b |
| /users/:id/reset-password | pages/admin/ResetUserPasswordByAdmin.jsx | ✅ Phase 2b |
| /users/:id/edit-role | pages/admin/EditUserRoleByAdmin.jsx (+ components/admin/AssignWarehousePermissionModal.jsx, PermissionMatrix.jsx) | ✅ Phase 2b |
| /attribute | pages/attribute/ColorSizeManagement.jsx | ✅ Phase 3 |
| /attributes | pages/attribute/ProductAttributeHub.jsx | ✅ Phase 3 |
| /products | pages/product/index.jsx | ✅ Phase 3 |
| /products/:id | pages/product/components/product/ProductDetail.jsx | ✅ Phase 3 |
| /sku-builder | pages/product/SkuBuilder.jsx | ✅ Phase 3 |
| /danh-muc-quan-ao | pages/danh-muc-quan-ao/DanhMucQuanAoTree.jsx | ✅ Phase 3 |
| /warehouse | pages/warehouse/Warehouse.jsx (+WarehouseDialog.jsx) | ✅ Phase 5 |
| /purchase-requests | pages/order/PurchaseRequestList.jsx | ✅ Phase 4 |
| /purchase-requests/create | pages/order/CreatePurchaseRequestPage.jsx | ✅ Phase 4 |
| /purchase-requests/:id | pages/order/PurchaseRequestDetail.jsx | ✅ Phase 4 |
| /purchase-requests/:id/send-quotation | pages/order/SendQuotationRequestPage.jsx | ✅ Phase 4 |
| /purchase-requests/:id/gui-bao-gia | pages/order/SendQuotationRequest.jsx | ✅ Phase 4 |
| /quotation-requests | pages/order/QuotationRequestList.jsx | ✅ Phase 4 |
| /quotation-requests/create | pages/order/QuotationRequestCreate.jsx | ✅ Phase 4 |
| /quotation-requests/:id | pages/order/QuotationRequestDetail.jsx | ✅ Phase 4 |
| /quotation/:id | pages/order/QuotationDetail.jsx | ✅ Phase 4 |
| /purchase-orders | pages/order/PurchaseOrder.jsx | ✅ Phase 4 |
| /purchase-orders/create | pages/order/PurchaseOrderCreateManual.jsx | ✅ Phase 4 |
| /purchase-orders/:id | pages/order/PurchaseOrderDetail.jsx | ✅ Phase 4 |
| /purchase-orders/:id/payment | pages/order/PurchaseOrderPayment.jsx | ✅ Phase 4 |
| /supplier | pages/supplier/SupplierList.jsx | ✅ Phase 4 |
| /supplier/new · /supplier/:id | pages/supplier/SupplierDetail.jsx | ✅ Phase 4 |
| /supplier/view/:id | pages/supplier/SupplierDetailView.jsx | ✅ Phase 4 |
| /goods-receipts | pages/receipt/PhieuNhapKhoList.jsx | ✅ Phase 4 |
| /goods-receipts/create | pages/receipt/PhieuNhapKhoCreate.jsx | ✅ Phase 4 |
| /goods-receipts/:id | pages/receipt/PhieuNhapKhoDetail.jsx | ✅ Phase 4 |
| /goods-receipts/:phieuNhapKhoId/lot-input/:bienTheSanPhamId | pages/receipt/KhaiBaoLo.jsx | ✅ Phase 4 |
| /goods-receipts/:id/print | pages/receipt/PhieuNhapKhoPrint.jsx | 🔒 frozen |
| /goods-issues | pages/issue/PhieuXuatKhoList.jsx | ✅ Phase 5 |
| /goods-issues/create | pages/issue/PhieuXuatKhoCreate.jsx | ✅ Phase 5 |
| /goods-issues/:id | pages/issue/PhieuXuatKhoDetail.jsx | ✅ Phase 5 |
| /goods-issues/:id/view | pages/issue/PhieuXuatKhoView.jsx | ✅ Phase 5 |
| /goods-issues/:phieuXuatKhoId/pick-lot/:chiTietPhieuXuatKhoId | pages/issue/PickLot.jsx | ✅ Phase 5 |
| /goods-issues/:id/print | pages/issue/PhieuXuatKhoPrint.jsx | 🔒 frozen |
| /transfer-tickets | pages/chuyenKhoNoiBo/PhieuChuyenKhoList.jsx | ✅ Phase 5 |
| /transfer-tickets/create | pages/chuyenKhoNoiBo/PhieuChuyenKhoCreate.jsx | ✅ Phase 5 |
| /transfer-tickets/:id | pages/chuyenKhoNoiBo/PhieuChuyenKhoDetail.jsx | ✅ Phase 5 |
| /stock-take · /stock-take/new · /stock-take/:id | pages/stock-take/StockTakeList.jsx / StockTakeCreate.jsx | ✅ Phase 5 |
| /customers | pages/customer/KhachHangPage.jsx | ✅ Phase 6 |
| /customers/:id | pages/customer/KhachHangDetails.jsx | ✅ Phase 6 |
| /customers/:id/edit | pages/customer/KhachHangEdit.jsx | ✅ Phase 6 |
| /sales-quotations | pages/sales-orders/Bao-gia/BaoGiaList.jsx | ✅ Phase 6 |
| /sales-quotations/create | pages/sales-orders/Bao-gia/BaoGiaCreate.jsx | ✅ Phase 6 |
| /sales-quotations/:id | pages/sales-orders/Bao-gia/BaoGiaDetail.jsx | ✅ Phase 6 |
| /sales-quotations/:id/print | pages/sales-orders/Bao-gia/BaoGiaPrint.jsx | 🔒 frozen |
| /sales-orders | pages/sales-orders/DonBanHangList.jsx | ✅ Phase 6 |
| /sales-orders/create | pages/sales-orders/DonBanHangCreate.jsx | ✅ Phase 6 |
| /sales-orders/:id | pages/sales-orders/DonBanHangDetail.jsx | ✅ Phase 6 |
| /sales-orders/:id/invoice | pages/sales-orders/DonBanHangInvoice.jsx | 🔒 frozen |
| /bao-cao/ton-kho | pages/bao-cao/TonKhoTongQuan.jsx | ✅ Phase 7 |
| /bao-cao/doanh-thu (hidden) | pages/bao-cao/BaoCaoDoanhThu.jsx | ✅ Phase 7 |
| /bao-cao/khach-hang (hidden) | pages/bao-cao/KhachHangReport.jsx | ✅ Phase 7 |
| /bao-cao/xuat-nhap (hidden) | pages/bao-cao/NhatKyNhapXuat.jsx | ✅ Phase 7 |
| /duyet-don-hang (hidden) | pages/purchase-oder-create-req/ApplicationRequestManagement.jsx | ✅ Phase 4 |
| /lich-su-giao-dich-kho | pages/lich-su-giao-dich-kho/LichSuGiaoDichKhoList.jsx | ✅ Phase 5 |

Frozen outside scope: `/user/:id` (UserDetail), auth pages, storefront, supplier public pages, 404.

## Dead-code register (documented; delete only in Phase 9 with approval)

- pages/admin/DashboardByAdmin.jsx — imported in App.jsx, never routed; calls nonexistent service method.
- components/admin/adminDashboard/RevenueChart.jsx, StatCard.jsx — zero importers.
- frontend/api.js (root) — standalone axios client, zero importers.
- pages/product/components/product/TopSellingModal.jsx, badge.jsx, tabs.jsx — zero importers.
- pages/warehouse/WarehouseHeader.jsx, WarehouseStats.jsx, WarehouseSearchFilter.jsx, WarehouseCard.jsx, WarehouseList.jsx — barrel re-exports only, never rendered.
- pages/attribute/ChatLieuList.jsx, ChatLieuDetail.jsx, ChatLieuDetailView.jsx — `/material*` routes commented out in App.jsx.
- Effectively dead (mounted, never openable): ProductModal.jsx (open flag discarded), InventoryDrawer.jsx (opener button commented out).
- Imported in App.jsx but never routed: `pages/order/PurchaseOrderCreate.jsx`, `pages/order/PurchaseRequest.jsx`, `pages/order/SendRequestDialog.jsx` (zero importers), `constants/backend/permission-groups.js` (zero importers).
- Dead dependencies (do not remove without approval): `@mui/material` + `@emotion/*` (zero imports), `react-hot-toast` (zero imports).
- Pre-existing quirks preserved: `danhMucId=1` hidden input in EditProductModal/ProductModal; `empty.txt` placeholder Files in Add/EditProductModal; client-generated `MS-####`/`CL-####` codes in ProductAttributeHub; stray console.logs in Warehouse.jsx; status select UI-only in EditUserRoleByAdmin.
- **Pre-existing fake data (documented, NOT introduced by migration — removal requires approval):** hardcoded kho options "KHO01–KHO04" in `bao-cao/KhachHangReport.jsx` + `bao-cao/NhatKyNhapXuat.jsx`; demo activity feed in `pages/UserDetail.jsx` (frozen, outside scope); hardcoded "FashionFlow Company" in invoice/quote print pages (frozen).
- Pre-existing architecture quirks (preserved): raw `fetch` to hardcoded `http://localhost:8080/api/v1` in 3 report pages (BaoCaoDoanhThu, KhachHangReport, NhatKyNhapXuat); client-side date filter in DonBanHangList/BaoGiaList; local `khachHangService` object inside KhachHangPage (bypasses `@/services/khachHangService`); supplier/store pages call sonner `toast` with no mounted Toaster (invisible toasts, pre-existing).

## Validation gate (run after EVERY module)

1. `npm run build` PASS · 2. ESLint 0 on changed files, full-project count ≤ baseline (152) · 3. `git diff --check` clean · 4. zero diff on services/backend/App.jsx/sidebar.config.js/package*.json · 5. states checked: loading, data, empty, zero, error, retry, validation, submitting, confirmation, direct nav; viewports 390→1440; no horizontal overflow; console clean · 6. all 5 roles unchanged permissions · 7. request method/URL/query/body/headers identical to baseline.

## Known blockers

None currently. Backend/DB may be unpopulated → real zero/empty data treated as valid.
