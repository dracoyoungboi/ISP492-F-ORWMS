import PrintRoutePage from "@/components/print/PrintRoutePage";
import { toGoodsReceiptPrintModel } from "@/components/print/adapters/goodsReceiptPrintAdapter";
import { phieuNhapKhoService } from '@/services/phieuNhapKhoService';

/**
 * Trang in thật của phiếu nhập kho — dữ liệu API thật
 * (`GET /api/v1/phieu-nhap-kho/{id}/detail` + danh sách lô khai báo)
 * + mẫu đang hoạt động của goods_receipt.
 * Thay thế trang in kiểu gold/ivory cũ bằng hệ thống in FCentric chung.
 */
export default function PhieuNhapKhoPrint() {
    return (
        <PrintRoutePage
            documentType="goods_receipt"
            fetcher={async (id) => {
                const detail = await phieuNhapKhoService.getDetail(id);
                if (!detail) return null;

                // Lấy danh sách lô đã khai báo của từng dòng hàng
                const lotsByVariantId = {};
                await Promise.all(
                    (detail.items || []).map(async (item) => {
                        if (!item.bienTheSanPhamId) return;
                        try {
                            const result = await phieuNhapKhoService.getLotInput(
                                id,
                                item.bienTheSanPhamId
                            );
                            lotsByVariantId[item.bienTheSanPhamId] = result?.data ?? [];
                        } catch {
                            lotsByVariantId[item.bienTheSanPhamId] = [];
                        }
                    })
                );

                return { detail, lotsByVariantId };
            }}
            adapter={toGoodsReceiptPrintModel}
            backPath="/goods-receipts/:id"
            loadingLabel="Đang tải dữ liệu phiếu nhập kho"
            titleFallback="In phiếu nhập kho"
            notFoundTitle="Không tìm thấy phiếu nhập kho"
            notFoundDescription="Phiếu có thể đã bị xoá hoặc bạn không có quyền truy cập."
        />
    );
}
