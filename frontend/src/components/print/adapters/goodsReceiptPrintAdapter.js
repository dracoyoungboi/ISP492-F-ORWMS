import { formatDate, formatNumber } from "@/utils/formatters";

/**
 * Adapter cho PHIẾU NHẬP KHO — dữ liệu từ API
 * `GET /api/v1/phieu-nhap-kho/{id}/detail` (ChiTietPhieuNhapKhoDto — KHÔNG có
 * envelope) + danh sách lô từ `GET /api/v1/phieu-nhap-kho/{id}/bien-the/{variantId}/lo-hang`.
 *
 * Mỗi lô khai báo mở rộng thành một dòng in riêng; chưa khai báo lô thì in
 * lô/ngày sản xuất là "—" và số lượng dự kiến.
 */
export const GOODS_RECEIPT_STATUS = {
    0: { label: "Đang xử lý", tone: "warning" },
    1: { label: "Đang xử lý", tone: "warning" },
    2: { label: "Chờ nhận hàng", tone: "info" },
    3: { label: "Đã nhập kho", tone: "success" },
    4: { label: "Đã huỷ", tone: "danger" },
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
 * @param {{detail: object, lotsByVariantId?: Record<number, Array>}} payload
 */
export function toGoodsReceiptPrintModel(payload) {
    const data = payload?.detail || {};
    const lotsByVariantId = payload?.lotsByVariantId || {};

    const isTransfer = Boolean(data.phieuXuatGocId);
    const partner = isTransfer
        ? dash(data.tenKhoChuyenTu)
        : dash(data.tenNhaCungCap);

    const items = (data.items || []).flatMap((item) => {
        const base = {
            name: dash(item.tenBienThe),
            sku: dash(item.sku),
        };
        const lots = lotsByVariantId[item.bienTheSanPhamId] || [];
        if (lots.length > 0) {
            return lots.map((lot) => ({
                ...base,
                lot: dash(lot.maLo),
                productionDate: dashDate(lot.ngaySanXuat),
                quantity: dashQuantity(lot.soLuongNhap),
            }));
        }
        return [
            {
                ...base,
                lot: "—",
                productionDate: "—",
                quantity: dashQuantity(item.soLuongDaKhaiBao ?? item.soLuongCanNhap),
            },
        ];
    });

    const totalQuantity = items.reduce(
        (sum, row) => sum + (parseFloat(String(row.quantity).replace(/\./g, "")) || 0),
        0
    );

    const status = GOODS_RECEIPT_STATUS[data.trangThai] || GOODS_RECEIPT_STATUS[0];

    return {
        documentNumber: dash(data.soPhieuNhap || `#${data.id}`),
        receivedDate: dashDate(data.ngayNhap),
        partner,
        status: { label: status.label, tone: status.tone },
        warehouse: { name: dash(data.tenKho) },
        items,
        totalQuantity: formatNumber(totalQuantity),
        signatures: {
            receiver: { name: dash(data.tenNguoiNhap), email: "" },
            deliverer: { name: partner, email: "" },
        },
    };
}
