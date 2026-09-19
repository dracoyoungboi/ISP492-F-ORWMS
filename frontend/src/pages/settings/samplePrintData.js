import { toPurchaseRequestPrintModel } from "@/components/print/adapters/purchaseRequestPrintAdapter";

/**
 * Dữ liệu mẫu CHỈ dùng trong editor / bản xem trước — luôn được gắn nhãn
 * "Mẫu minh họa" trên màn hình. Trang in thật chỉ dùng dữ liệu API.
 *
 * purchase_request: giữ nguyên dạng raw của API và chảy qua adapter thật,
 *   để bản xem trước và bản in không bao giờ lệch nhau.
 * Các loại còn lại: sample là view model theo đúng schema của từng loại
 *   (chưa có adapter/API nên chưa có trang in thật).
 *
 * Mọi giá trị đều mang "(Mẫu)" / "MẪU" / example.com — không phải dữ liệu thật.
 */

export const SAMPLE_PURCHASE_REQUEST_RAW = {
    id: 0,
    soYeuCauMuaHang: "MẪU-PR-0001",
    ngayTao: "2026-09-12T08:30:00Z",
    ngayGiaoDuKien: "2026-09-20T00:00:00Z",
    trangThai: 1,
    ghiChu: "Đây là ghi chú mẫu minh họa — không phải dữ liệu thật.",
    khoNhap: {
        tenKho: "Kho trung tâm (Mẫu minh họa)",
        maKho: "MẪU-KHO-01",
        diaChi: "123 Đường Mẫu, Quận 1, TP. Hồ Chí Minh (địa chỉ ví dụ)",
        quanLy: { hoTen: "Nguyễn Văn A (Mẫu)" },
    },
    nguoiTao: {
        hoTen: "Trần Thị B (Mẫu)",
        email: "nguoi.tao@example.com",
    },
    nguoiDuyet: {
        hoTen: "Lê Văn C (Mẫu)",
        email: "nguoi.duyet@example.com",
    },
    chiTietYeuCauMuaHangs: [
        {
            id: 1,
            bienTheSanPham: {
                tenSanPham: "Áo thun nam cổ tròn (Sản phẩm mẫu)",
                maSku: "MẪU-SKU-001",
                mauSac: { tenMau: "Trắng" },
                size: { maSize: "L" },
                chatLieu: { tenChatLieu: "Cotton 100%" },
            },
            soLuongDat: 50,
        },
        {
            id: 2,
            bienTheSanPham: {
                tenSanPham: "Áo thun nam cổ tròn (Sản phẩm mẫu)",
                maSku: "MẪU-SKU-002",
                mauSac: { tenMau: "Đen" },
                size: { maSize: "M" },
                chatLieu: { tenChatLieu: "Cotton 100%" },
            },
            soLuongDat: 30,
        },
        {
            id: 3,
            bienTheSanPham: {
                tenSanPham: "Quần kaki nam ống đứng (Sản phẩm mẫu)",
                maSku: "MẪU-SKU-003",
                mauSac: { tenMau: "Xám" },
                size: { maSize: "XL" },
                chatLieu: { tenChatLieu: "Kaki 4 chiều" },
            },
            soLuongDat: 20,
        },
    ],
};

const SAMPLE_QUOTATION_REQUEST_MODEL = {
    documentNumber: "MẪU-QR-0001",
    createdAt: "12/09/2026",
    deadline: "19/09/2026",
    status: { label: "Chờ báo giá", tone: "warning" },
    warehouse: {
        name: "Kho trung tâm (Mẫu minh họa)",
        manager: "Nguyễn Văn A (Mẫu)",
        address: "123 Đường Mẫu, Quận 1, TP. Hồ Chí Minh (địa chỉ ví dụ)",
    },
    suppliers: [
        { name: "Nhà cung cấp Alpha (Mẫu)", email: "alpha@example.com", phone: "0900 000 001", sentStatus: "Đã gửi" },
        { name: "Nhà cung cấp Beta (Mẫu)", email: "beta@example.com", phone: "0900 000 002", sentStatus: "Đã gửi" },
        { name: "Nhà cung cấp Gamma (Mẫu)", email: "gamma@example.com", phone: "0900 000 003", sentStatus: "Chờ gửi" },
    ],
    products: [
        { name: "Áo thun nam cổ tròn (Sản phẩm mẫu)", sku: "MẪU-SKU-001", color: "Trắng", size: "L", material: "Cotton 100%", quantity: "50" },
        { name: "Quần kaki nam ống đứng (Sản phẩm mẫu)", sku: "MẪU-SKU-003", color: "Xám", size: "XL", material: "Kaki 4 chiều", quantity: "20" },
    ],
    totalQuantity: "70",
    notes: "Ghi chú mẫu minh họa — không phải dữ liệu thật.",
    signatures: {
        creator: { name: "Trần Thị B (Mẫu)", email: "nguoi.tao@example.com" },
        approver: { name: "Lê Văn C (Mẫu)", email: "nguoi.duyet@example.com" },
    },
};

const SAMPLE_PURCHASE_ORDER_MODEL = {
    supplier: {
        name: "Nhà cung cấp Alpha (Mẫu)",
        code: "MẪU-NCC-01",
        contact: "Nguyễn Văn A (Mẫu)",
        phone: "0900 000 001",
        email: "ncc.alpha@example.com",
        address: "456 Đường Mẫu, Quận 2, TP. Hồ Chí Minh (địa chỉ ví dụ)",
    },
    documentNumber: "MẪU-PO-0001",
    orderDate: "12/09/2026",
    expectedDate: "22/09/2026",
    status: { label: "Đã thanh toán", tone: "success" },
    items: [
        { name: "Áo thun nam cổ tròn (Sản phẩm mẫu)", sku: "MẪU-SKU-001", unitPrice: "150.000 đ", quantity: "50", amount: "7.500.000 đ" },
        { name: "Quần kaki nam ống đứng (Sản phẩm mẫu)", sku: "MẪU-SKU-003", unitPrice: "320.000 đ", quantity: "20", amount: "6.400.000 đ" },
    ],
    totalAmount: "13.900.000 đ",
    totals: { total: "13.900.000 đ" },
    notes: "Ghi chú mẫu minh họa — không phải dữ liệu thật.",
    signatures: {
        creator: { name: "Trần Thị B (Mẫu)", email: "nguoi.tao@example.com" },
        approver: { name: "Lê Văn C (Mẫu)", email: "nguoi.duyet@example.com" },
    },
};

const SAMPLE_GOODS_RECEIPT_MODEL = {
    documentNumber: "MẪU-PNK-0001",
    receivedDate: "15/09/2026",
    partner: "Nhà cung cấp Alpha (Mẫu)",
    status: { label: "Đã nhập kho", tone: "success" },
    warehouse: { name: "Kho trung tâm (Mẫu minh họa)" },
    items: [
        { name: "Áo thun nam cổ tròn (Sản phẩm mẫu)", sku: "MẪU-SKU-001", lot: "MẪU-LÔ-01", productionDate: "01/08/2026", quantity: "50" },
        { name: "Áo thun nam cổ tròn (Sản phẩm mẫu)", sku: "MẪU-SKU-002", lot: "MẪU-LÔ-02", productionDate: "10/08/2026", quantity: "30" },
        { name: "Quần kaki nam ống đứng (Sản phẩm mẫu)", sku: "MẪU-SKU-003", lot: "MẪU-LÔ-03", productionDate: "15/08/2026", quantity: "20" },
    ],
    totalQuantity: "100",
    signatures: {
        receiver: { name: "Nguyễn Văn A (Mẫu)", email: "kho@example.com" },
        deliverer: { name: "Nhà cung cấp Alpha (Mẫu)", email: "" },
    },
};

const SAMPLE_GOODS_ISSUE_MODEL = {
    documentNumber: "MẪU-PXK-0001",
    issuedDate: "16/09/2026",
    salesOrder: "MẪU-SO-0001",
    status: { label: "Đã xuất", tone: "success" },
    warehouse: {
        name: "Kho trung tâm (Mẫu minh họa)",
        code: "MẪU-KHO-01",
    },
    items: [
        { name: "Áo thun nam cổ tròn (Sản phẩm mẫu)", sku: "MẪU-SKU-001", lot: "MẪU-LÔ-01", quantity: "10" },
        { name: "Quần kaki nam ống đứng (Sản phẩm mẫu)", sku: "MẪU-SKU-003", lot: "MẪU-LÔ-03", quantity: "5" },
    ],
    totalQuantity: "15",
    notes: "Ghi chú mẫu minh họa — không phải dữ liệu thật.",
    signatures: {
        issuer: { name: "Nguyễn Văn A (Mẫu)", email: "kho@example.com" },
    },
};

const SAMPLE_SALES_QUOTATION_MODEL = {
    seller: { name: "Trần Thị B (Mẫu)", email: "nguoi.tao@example.com", phone: "0900 000 009" },
    customer: {
        name: "Khách hàng Delta (Mẫu)",
        code: "MẪU-KH-01",
        contact: "Chị Hoa (Mẫu)",
        phone: "0900 000 010",
        address: "789 Đường Mẫu, Quận 3, TP. Hồ Chí Minh (địa chỉ ví dụ)",
    },
    documentNumber: "MẪU-BG-0001",
    createdAt: "12/09/2026",
    status: { label: "Đang chờ phản hồi", tone: "warning" },
    items: [
        { name: "Áo thun nam cổ tròn / Trắng (Sản phẩm mẫu)", sku: "MẪU-SKU-001", unitPrice: "200.000 đ", quantity: "10", amount: "2.000.000 đ" },
        { name: "Quần kaki nam ống đứng / Xám (Sản phẩm mẫu)", sku: "MẪU-SKU-003", unitPrice: "450.000 đ", quantity: "5", amount: "2.250.000 đ" },
    ],
    totals: {
        items: "4.250.000 đ",
        shipping: "50.000 đ",
        grandTotal: "4.300.000 đ",
    },
    notes: "Điều khoản mẫu minh họa — không phải dữ liệu thật.",
    signatures: {
        creator: { name: "Trần Thị B (Mẫu)", email: "nguoi.tao@example.com" },
        buyer: { name: "Khách hàng Delta (Mẫu)", email: "" },
    },
};

const SAMPLE_SALES_INVOICE_MODEL = {
    seller: { name: "Trần Thị B (Mẫu)", email: "nguoi.tao@example.com", phone: "0900 000 009" },
    buyer: {
        name: "Khách hàng Delta (Mẫu)",
        contact: "Chị Hoa (Mẫu)",
        phone: "0900 000 010",
        address: "789 Đường Mẫu, Quận 3, TP. Hồ Chí Minh (địa chỉ ví dụ)",
    },
    documentNumber: "MẪU-HD-0001",
    issuedDate: "16/09/2026",
    status: { label: "Hoàn thành", tone: "success" },
    paymentStatus: { label: "Chưa thanh toán", tone: "warning" },
    items: [
        { name: "Áo thun nam cổ tròn / Trắng (Sản phẩm mẫu)", sku: "MẪU-SKU-001", unitPrice: "200.000 đ", quantity: "10", amount: "2.000.000 đ" },
        { name: "Quần kaki nam ống đứng / Xám (Sản phẩm mẫu)", sku: "MẪU-SKU-003", unitPrice: "450.000 đ", quantity: "5", amount: "2.250.000 đ" },
    ],
    totals: {
        items: "4.250.000 đ",
        shipping: "50.000 đ",
        grandTotal: "4.300.000 đ",
    },
    notes: "Hóa đơn mẫu minh họa — không phải dữ liệu thật.",
    signatures: {
        creator: { name: "Trần Thị B (Mẫu)", email: "ban.hang@example.com" },
        buyer: { name: "Chị Hoa (Mẫu)", email: "" },
    },
};

/**
 * Lấy model mẫu cho bản xem trước của một loại chứng từ.
 * purchase_request đi qua adapter thật; các loại còn lại dùng
 * view model mẫu theo schema.
 */
export function getSamplePrintModel(documentType) {
    switch (documentType) {
        case "purchase_request":
            return toPurchaseRequestPrintModel(SAMPLE_PURCHASE_REQUEST_RAW);
        case "quotation_request":
            return SAMPLE_QUOTATION_REQUEST_MODEL;
        case "purchase_order":
            return SAMPLE_PURCHASE_ORDER_MODEL;
        case "goods_receipt":
            return SAMPLE_GOODS_RECEIPT_MODEL;
        case "goods_issue":
            return SAMPLE_GOODS_ISSUE_MODEL;
        case "sales_quotation":
            return SAMPLE_SALES_QUOTATION_MODEL;
        case "sales_invoice":
            return SAMPLE_SALES_INVOICE_MODEL;
        default:
            return null;
    }
}
