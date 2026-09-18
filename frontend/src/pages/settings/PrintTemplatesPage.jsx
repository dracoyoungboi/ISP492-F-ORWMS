import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil } from "lucide-react";
import PageContainer from "@/components/backoffice/PageContainer";
import PageHeader from "@/components/backoffice/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import SurfaceCard from "@/components/shared/SurfaceCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PRINT_DOCUMENT_TYPES } from "@/components/print/schemas/printSchemas";
import { groupPrintTemplates } from "@/components/print/templateGrouping";
import { printTemplateConfigService } from "@/services/printTemplateConfigService";

export default function PrintTemplatesPage() {
    const navigate = useNavigate();
    const [selectedId, setSelectedId] = useState(PRINT_DOCUMENT_TYPES[0].key);

    const selected =
        PRINT_DOCUMENT_TYPES.find((type) => type.key === selectedId) ??
        PRINT_DOCUMENT_TYPES[0];

    // Đếm THẺ mẫu trực quan cho từng loại chứng từ: A4/A5 là hai biến thể
    // khổ giấy của một mẫu trực quan nên chỉ tính 1 thẻ. Chỉ ảnh hưởng hiển
    // thị — không xoá/sửa cấu hình nào.
    const visibleCounts = useMemo(() => {
        const counts = {};
        for (const type of PRINT_DOCUMENT_TYPES) {
            counts[type.key] = groupPrintTemplates(
                printTemplateConfigService.getTemplates(type.key)
            ).length;
        }
        return counts;
    }, []);

    // Một thẻ = một mẫu trực quan; các khổ giấy là biến thể bên trong thẻ.
    const allTemplates = printTemplateConfigService.getTemplates(selected.key);
    const templateGroups = groupPrintTemplates(allTemplates);

    return (
        <PageContainer className="space-y-5">
            <PageHeader
                title="Cấu hình mẫu in"
                description="Mỗi loại chứng từ có bộ mẫu in và cấu hình riêng. Chọn loại chứng từ để xem các mẫu của nó."
            />

            <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
                {/* Danh sách loại chứng từ — chỉ chọn, không điều hướng */}
                <SurfaceCard title="Loại chứng từ" contentClassName="p-0">
                    <div className="flex flex-col">
                        {PRINT_DOCUMENT_TYPES.map((type) => {
                            const isSelected = type.key === selectedId;
                            return (
                                <button
                                    key={type.key}
                                    type="button"
                                    onClick={() => setSelectedId(type.key)}
                                    className={cn(
                                        "flex w-full items-center justify-between gap-2 border-l-2 px-4 py-3 text-left text-sm font-medium transition-colors",
                                        isSelected
                                            ? "border-bo-primary bg-bo-primary-soft font-semibold text-bo-primary"
                                            : "border-transparent text-bo-foreground hover:bg-bo-surface-subtle"
                                    )}
                                >
                                    <span className="truncate">{type.label}</span>
                                    <span
                                        className={cn(
                                            "shrink-0 text-xs",
                                            isSelected ? "text-bo-primary" : "text-bo-muted"
                                        )}
                                    >
                                        {visibleCounts[type.key] ?? type.templates.length} mẫu
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </SurfaceCard>

                {/* Thẻ mẫu trực quan của loại đang chọn */}
                <div className="space-y-5">
                    {templateGroups.map((group) => {
                        const { primary, variants } = group;
                        // Badge khổ giấy DUY NHẤT (không lặp lại khổ nào)
                        const paperSizes = [...new Set(variants.map((variant) => variant.paperSize))];
                        const orientationLabel =
                            primary.paperSize === "K80"
                                ? "Khổ nhiệt"
                                : primary.orientation === "landscape"
                                    ? "Ngang"
                                    : "Dọc";
                        const isActive = variants.some((variant) => variant.isDefault);
                        return (
                            <SurfaceCard
                                key={group.key}
                                title={group.name}
                                description={`${selected.label} · Khổ giấy ${paperSizes.join(", ")}${variants.length === 1 ? ` (${orientationLabel})` : ""}`}
                                action={
                                    isActive ? (
                                        <StatusBadge label="Đang sử dụng" tone="success" />
                                    ) : (
                                        <StatusBadge label="Không áp dụng" tone="neutral" />
                                    )
                                }
                            >
                                <p className="mb-3 text-xs text-bo-muted">
                                    {selected.hasRealPrintRoute
                                        ? "Đã kết nối bản in thật — cấu hình được áp dụng khi in phiếu."
                                        : "Chưa có bản in thật — bản xem trước dùng dữ liệu mẫu minh họa."}
                                </p>
                                <div className="mb-3 flex flex-wrap items-center gap-1.5">
                                    {paperSizes.map((size) => (
                                        <span
                                            key={size}
                                            className="rounded-full border border-bo-border bg-bo-surface-subtle px-2 py-0.5 text-[11px] font-semibold text-bo-muted"
                                        >
                                            {size}
                                        </span>
                                    ))}
                                    {variants.length > 1 ? (
                                        <span className="text-[11px] text-bo-muted">
                                            — các khổ giấy dùng chung một mẫu trực quan
                                        </span>
                                    ) : null}
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Button
                                        className="bg-bo-primary text-white hover:bg-bo-primary-hover"
                                        onClick={() =>
                                            navigate(
                                                `/settings/print-templates/${selected.slug}/${primary.id}/edit`
                                            )
                                        }
                                    >
                                        <Pencil className="size-4" />
                                        Chỉnh sửa
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="border-bo-border bg-white text-bo-foreground hover:bg-bo-surface-subtle"
                                        onClick={() =>
                                            navigate(
                                                `/settings/print-templates/${selected.slug}/${primary.id}`
                                            )
                                        }
                                    >
                                        <Eye className="size-4" />
                                        Xem trước
                                    </Button>
                                </div>
                            </SurfaceCard>
                        );
                    })}
                </div>
            </div>
        </PageContainer>
    );
}
