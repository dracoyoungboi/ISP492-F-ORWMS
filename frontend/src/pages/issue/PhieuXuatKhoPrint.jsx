import PrintRoutePage from "@/components/print/PrintRoutePage";
import { toGoodsIssuePrintModel } from "@/components/print/adapters/goodsIssuePrintAdapter";
import { phieuXuatKhoService } from '@/services/phieuXuatKhoService';

/**
 * Trang in thật của phiếu xuất kho — dữ liệu API thật
 * (`GET /api/v1/phieu-xuat-kho/{id}` + lô đã pick / tên lô)
 * + mẫu đang hoạt động của goods_issue.
 * Thay thế trang in kiểu gold/ivory cũ bằng hệ thống in FCentric chung.
 */
export default function PhieuXuatKhoPrint() {
    return (
        <PrintRoutePage
            documentType="goods_issue"
            fetcher={async (id) => {
                const detail = await phieuXuatKhoService.getDetail(id);
                if (!detail) return null;
                const { phieu, chiTiet = [] } = detail;

                // Lô đã pick của từng dòng + bảng tên lô (loHangId -> maLo)
                const pickedLotsByDetailId = {};
                const lotNameByLotId = {};

                await Promise.all(
                    chiTiet.map(async (item) => {
                        try {
                            const picks = await phieuXuatKhoService.getPickedLots(id, item.id);
                            pickedLotsByDetailId[item.id] = Array.isArray(picks) ? picks : [];
                        } catch {
                            pickedLotsByDetailId[item.id] = [];
                        }
                        if (!item.bienTheSanPhamId) return;
                        try {
                            const lots = await phieuXuatKhoService.getAvailableLots(
                                id,
                                item.bienTheSanPhamId
                            );
                            (lots || []).forEach((lot) => {
                                if (lot.loHangId && lot.maLo) {
                                    lotNameByLotId[lot.loHangId] = lot.maLo;
                                }
                            });
                        } catch {
                            // bỏ qua nếu không lấy được danh sách lô khả dụng
                        }
                    })
                );

                return { phieu, chiTiet, pickedLotsByDetailId, lotNameByLotId };
            }}
            adapter={toGoodsIssuePrintModel}
            backPath="/goods-issues/:id"
            loadingLabel="Đang tải dữ liệu phiếu xuất kho"
            titleFallback="In phiếu xuất kho"
            notFoundTitle="Không tìm thấy phiếu xuất kho"
            notFoundDescription="Phiếu có thể đã bị xoá hoặc bạn không có quyền truy cập."
        />
    );
}
