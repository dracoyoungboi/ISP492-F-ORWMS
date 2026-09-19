import { formatDate, formatNumber } from "@/utils/formatters";

/**
 * Adapter cho PHIẾU XUẤT KHO — dữ liệu từ API
 * `GET /api/v1/phieu-xuat-kho/{id}` ({phieu, chiTiet} — không có envelope),
 * lô đã pick từ `GET /api/v1/phieu-xuat-kho/{id}/picked-lots/{chiTietId}` và
 * tên lô từ `GET /api/v1/phieu-xuat-kho/{id}/available-lots?bienTheSanPhamId=`.
 */
export const GOODS_ISSUE_STATUS = {
    0: { label: "Nháp", tone: "warning" },
    1: { label: "Chờ duyệt", tone: "info" },
    2: { label: "Đã duyệt", tone: "info" },
    3: { label: "Đã xuất", tone: "success" },
    4: { label: "Đã huỷ", tone: "danger" },
    5: { label: "Đã xuất", tone: "success" },
};

const dash = (value) => {
    if (value === null || value === undefined) return "—";
    const text = String(value).trim();
    return text === "" ? "—" : text;
};

const dashDate = (value) => (value ? formatDate(value) : "—");
const dashQuantity = (value) =>
    value === null || value === undefined ? "—" : formatNumber(value);

/**
 * @param {{phieu: object, chiTiet: Array, lotNameByLotId?: Record<number, string>,
 *          pickedLotsByDetailId?: Record<number, Array>}} payload
 */
export function toGoodsIssuePrintModel(payload) {
    const phieu = payload?.phieu || {};
    const chiTiet = payload?.chiTiet || [];
    const lotNameByLotId = payload?.lotNameByLotId || {};
    const pickedLotsByDetailId = payload?.pickedLotsByDetailId || {};

    const items = chiTiet.flatMap((item) => {
        const base = {
            name: dash(item.tenBienThe),
            sku: dash(item.sku),
        };
        const picks = pickedLotsByDetailId[item.id] || [];
        if (picks.length > 0) {
            return picks.map((pick) => ({
                ...base,
                lot: dash(lotNameByLotId[pick.loHangId] ?? `#${pick.loHangId}`),
                quantity: dashQuantity(pick.soLuongDaPick),
            }));
        }
        return [
            {
                ...base,
                lot: "—",
                quantity: dashQuantity(item.soLuongDaPick ?? item.soLuongCanXuat),
            },
        ];
    });

    const totalQuantity = items.reduce(
        (sum, row) => sum + (parseFloat(String(row.quantity).replace(/\./g, "")) || 0),
        0
    );

    const status = GOODS_ISSUE_STATUS[phieu.trangThai] || GOODS_ISSUE_STATUS[0];

    return {
        documentNumber: dash(phieu.soPhieuXuat || `#${phieu.id}`),
        issuedDate: dashDate(phieu.ngayXuat),
        salesOrder: dash(phieu.donBanHang?.soDonHang),
        status: { label: status.label, tone: status.tone },
        warehouse: {
            name: dash(phieu.kho?.tenKho),
            code: dash(phieu.kho?.maKho),
        },
        items,
        totalQuantity: formatNumber(totalQuantity),
        notes: dash(phieu.ghiChu),
        signatures: {
            issuer: { name: dash(phieu.nguoiXuat?.hoTen), email: dash(phieu.nguoiXuat?.email) },
        },
    };
}
