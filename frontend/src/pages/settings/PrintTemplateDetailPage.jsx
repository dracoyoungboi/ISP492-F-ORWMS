import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Printer } from "lucide-react";
import PageContainer from "@/components/backoffice/PageContainer";
import PageHeader from "@/components/backoffice/PageHeader";
import SurfaceCard from "@/components/shared/SurfaceCard";
import StatusBadge from "@/components/shared/StatusBadge";
import PrintTemplateDocument from "@/components/print/PrintTemplateDocument";
import { getPaperPageCss, getPaperSheetClasses } from "@/components/print/paperStyles";
import { Button } from "@/components/ui/button";
import { getPrintSchema } from "@/components/print/schemas/printSchemas";
import { getSamplePrintModel } from "./samplePrintData";
import { printTemplateConfigService } from "@/services/printTemplateConfigService";
import { companyProfileService } from "@/services/companyProfileService";

// Chỉ ảnh hưởng trang xem trước này khi in từ bên trong BackofficeLayout:
// shell `h-dvh overflow-hidden` sẽ cắt bản in, và sidebar là <div>
// (không phải <nav>) nên print.css không tự ẩn được — cần quy tắc
// :has() phạm vi hẹp. Băng "Mẫu minh họa" cố tình GIỮ LẠI khi in để
// bản in mẫu không bao giờ bị nhầm là chứng từ thật.
const PREVIEW_PRINT_STYLES = `
@media print {
  [data-backoffice-shell]:has(.print-template-preview) { height: auto !important; overflow: visible !important; }
  [data-backoffice-shell]:has(.print-template-preview) [data-slot="sidebar"] { display: none !important; }
  [data-backoffice-shell]:has(.print-template-preview) #backoffice-main-content { height: auto !important; overflow: visible !important; }
  [data-backoffice-shell]:has(.print-template-preview) .print-template-preview-page { max-width: none !important; padding: 0 !important; }
  [data-backoffice-shell]:has(.print-template-preview) .print-preview-scroll { overflow: visible !important; padding: 0 !important; }
  [data-backoffice-shell]:has(.print-template-preview) .print-preview-sheet { width: 100% !important; min-height: 0 !important; padding: 0 !important; box-shadow: none !important; }
}
`;

export default function PrintTemplateDetailPage() {
    const navigate = useNavigate();
    const { documentType, templateId } = useParams();

    const schema = getPrintSchema(documentType);
    const [config] = useState(() => {
        if (!schema) return null;
        return printTemplateConfigService.getTemplate(
            schema.key,
            templateId ?? printTemplateConfigService.getActiveTemplate(schema.key)?.id
        );
    });
    const [company] = useState(() => companyProfileService.get());

    const sampleModel = useMemo(
        () => (schema ? getSamplePrintModel(schema.key) : null),
        [schema]
    );

    if (!schema || !config) {
        return (
            <PageContainer>
                <p className="text-sm text-bo-muted">Không tìm thấy loại chứng từ hoặc mẫu in.</p>
            </PageContainer>
        );
    }

    const paper = {
        size: config.paperSize,
        orientation: config.orientation,
        margin: config.margin,
    };

    const orientationLabel =
        config.paperSize === "K80"
            ? "Khổ nhiệt"
            : config.orientation === "landscape"
                ? "Ngang"
                : "Dọc";

    return (
        <PageContainer className="print-template-preview-page space-y-5 pb-24">
            <style>
                {PREVIEW_PRINT_STYLES}
                {getPaperPageCss(paper)}
            </style>

            <PageHeader
                className="no-print"
                eyebrow="Cấu hình mẫu in"
                title={config.name}
                description={`Loại chứng từ: ${schema.label} · Khổ giấy: ${config.paperSize} (${orientationLabel})`}
                actions={
                    <>
                        <Button
                            variant="outline"
                            className="border-bo-border bg-white text-bo-foreground hover:bg-bo-surface-subtle"
                            onClick={() => navigate("/settings/print-templates")}
                        >
                            <ArrowLeft className="size-4" />
                            Quay lại
                        </Button>
                        <Button
                            variant="outline"
                            className="border-bo-border bg-white text-bo-foreground hover:bg-bo-surface-subtle"
                            onClick={() => window.print()}
                        >
                            <Printer className="size-4" />
                            Xem bản in mẫu
                        </Button>
                        <Button
                            className="bg-bo-primary text-white hover:bg-bo-primary-hover"
                            onClick={() =>
                                navigate(
                                    `/settings/print-templates/${schema.slug}/${config.id}/edit`
                                )
                            }
                        >
                            <Pencil className="size-4" />
                            Chỉnh sửa mẫu
                        </Button>
                    </>
                }
            />

            <SurfaceCard className="no-print" title="Thông tin mẫu">
                <dl className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-bo-muted">
                            Tên mẫu
                        </dt>
                        <dd className="mt-0.5 text-sm font-semibold text-bo-foreground">
                            {config.name}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-bo-muted">
                            Loại chứng từ
                        </dt>
                        <dd className="mt-0.5 text-sm font-semibold text-bo-foreground">
                            {schema.label}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-bo-muted">
                            Khổ giấy
                        </dt>
                        <dd className="mt-0.5 text-sm font-semibold text-bo-foreground">
                            {config.paperSize} ({orientationLabel})
                        </dd>
                    </div>
                    <div>
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-bo-muted">
                            Trạng thái
                        </dt>
                        <dd className="mt-0.5">
                            <StatusBadge
                                label={config.isDefault ? "Đang sử dụng" : "Không áp dụng"}
                                tone={config.isDefault ? "success" : "neutral"}
                            />
                        </dd>
                    </div>
                </dl>
            </SurfaceCard>

            <SurfaceCard
                className="print-template-preview"
                title="Bản xem trước"
                description={
                    schema.hasRealPrintRoute
                        ? "Dữ liệu mẫu minh họa — không phải dữ liệu thật. Bản xem trước áp dụng đúng cấu hình mẫu đã lưu."
                        : "Dữ liệu mẫu minh họa — loại chứng từ này chưa có bản in thật."
                }
                contentClassName="p-0"
            >
                <div className="print-preview-scroll overflow-x-auto bg-bo-canvas p-4 sm:p-6">
                    <div
                        className={`print-preview-sheet mx-auto bg-white shadow-sm ${getPaperSheetClasses(paper)}`}
                    >
                        <PrintTemplateDocument
                            documentType={schema.key}
                            config={config}
                            model={sampleModel}
                            company={company}
                        />
                    </div>
                </div>
            </SurfaceCard>
        </PageContainer>
    );
}
