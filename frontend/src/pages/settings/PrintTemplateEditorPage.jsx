import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronDown, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import PageContainer from "@/components/backoffice/PageContainer";
import PageHeader from "@/components/backoffice/PageHeader";
import SurfaceCard from "@/components/shared/SurfaceCard";
import PrintTemplateDocument from "@/components/print/PrintTemplateDocument";
import { getPaperSheetClasses, getPaperSheetWidthPx } from "@/components/print/paperStyles";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { getPrintSchema } from "@/components/print/schemas/printSchemas";
import { getSamplePrintModel } from "./samplePrintData";
import {
    buildDefaultTemplateConfig,
    printTemplateConfigService,
} from "@/services/printTemplateConfigService";
import { companyProfileService } from "@/services/companyProfileService";

// ── Các bộ điều khiển nhỏ của editor ────────────────────────────────────────

function EditorSection({ title, defaultOpen = true, children }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <Collapsible open={open} onOpenChange={setOpen}>
            <div className="rounded-lg border border-bo-border bg-white shadow-sm">
                <CollapsibleTrigger asChild>
                    <button
                        type="button"
                        className="flex w-full items-center justify-between px-4 py-3 text-left"
                    >
                        <span className="text-sm font-semibold text-bo-foreground">
                            {title}
                        </span>
                        <ChevronDown
                            className={cn(
                                "size-4 text-bo-muted transition-transform",
                                open && "rotate-180"
                            )}
                        />
                    </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="border-t border-bo-border px-4 py-4">{children}</div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    );
}

function ToggleRow({ label, checked, onChange }) {
    return (
        <label className="flex cursor-pointer items-center justify-between gap-3 py-1.5">
            <span className="text-sm text-bo-foreground">{label}</span>
            <Checkbox checked={checked} onCheckedChange={(value) => onChange(Boolean(value))} />
        </label>
    );
}

function TextField({ label, value, onChange, placeholder }) {
    return (
        <div className="space-y-1.5">
            <span className="block text-xs font-semibold uppercase tracking-wide text-bo-muted">
                {label}
            </span>
            <Input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className="border-bo-border bg-white text-bo-foreground"
            />
        </div>
    );
}

function SegmentedControl({ options, value, onChange }) {
    return (
        <div className="flex overflow-hidden rounded-md border border-bo-border">
            {options.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    onClick={() => onChange(option.value)}
                    className={cn(
                        "flex-1 px-3 py-1.5 text-xs font-medium transition-colors",
                        value === option.value
                            ? "bg-bo-primary text-white"
                            : "bg-white text-bo-muted hover:bg-bo-surface-subtle"
                    )}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}

function FieldGroup({ label, children }) {
    return (
        <div className="space-y-1.5">
            <span className="block text-xs font-semibold uppercase tracking-wide text-bo-muted">
                {label}
            </span>
            {children}
        </div>
    );
}

const ZOOM_OPTIONS = [
    { value: "0.5", label: "50%" },
    { value: "0.75", label: "75%" },
    { value: "1", label: "100%" },
    { value: "fit", label: "Vừa chiều rộng" },
];

// ── Trang editor ─────────────────────────────────────────────────────────────

export default function PrintTemplateEditorPage() {
    const navigate = useNavigate();
    const { documentType, templateId } = useParams();

    const schema = getPrintSchema(documentType);

    // Draft: bản cấu hình đang chỉnh — chỉ ghi vào service khi nhấn Lưu
    const [draft, setDraft] = useState(() => {
        if (!schema) return null;
        const targetId =
            templateId ?? printTemplateConfigService.getActiveTemplate(schema.key)?.id;
        return printTemplateConfigService.getTemplate(schema.key, targetId);
    });
    const [company, setCompany] = useState(() => companyProfileService.get());

    // Zoom bản xem trước
    const [zoom, setZoom] = useState("fit");
    const previewAreaRef = useRef(null);
    const [previewWidth, setPreviewWidth] = useState(0);

    useEffect(() => {
        const el = previewAreaRef.current;
        if (!el) return undefined;
        const observer = new ResizeObserver(() => setPreviewWidth(el.clientWidth));
        observer.observe(el);
        setPreviewWidth(el.clientWidth);
        return () => observer.disconnect();
    }, []);

    const sampleModel = useMemo(
        () => (schema ? getSamplePrintModel(schema.key) : null),
        [schema]
    );

    if (!schema || !draft) {
        return (
            <PageContainer>
                <p className="text-sm text-bo-muted">Không tìm thấy loại chứng từ hoặc mẫu in.</p>
            </PageContainer>
        );
    }

    const isK80 = draft.paperSize === "K80";
    const paper = {
        size: draft.paperSize,
        orientation: draft.orientation,
        margin: draft.margin,
    };
    const sheetWidthPx = getPaperSheetWidthPx(paper);
    // Trừ padding của khung preview (p-4 sm:p-6) để chế độ "Vừa chiều rộng"
    // không tạo thanh cuộn ngang thừa
    const effectiveZoom =
        zoom === "fit" && previewWidth > 0
            ? Math.max(0.3, Math.min(1.5, (previewWidth - 48) / sheetWidthPx))
            : Number(zoom);

    // Cập nhật trường theo đường dẫn "paperSize", "sections.items.show", ...
    const setField = (path, value) => {
        setDraft((prev) => {
            const next = structuredClone(prev);
            const keys = path.split(".");
            let node = next;
            for (const key of keys.slice(0, -1)) {
                node = node[key];
            }
            node[keys[keys.length - 1]] = value;
            return next;
        });
    };

    const handleSave = (apply) => {
        printTemplateConfigService.saveTemplate(draft);
        companyProfileService.save(company);
        toast.success(
            apply
                ? "Đã lưu và áp dụng cấu hình mẫu in"
                : "Đã lưu cấu hình mẫu in"
        );
        if (apply) {
            navigate(`/settings/print-templates/${schema.slug}/${draft.id}`);
        }
    };

    const handleReset = () => {
        const def = schema.templates.find((template) => template.id === draft.id);
        if (def) {
            setDraft(buildDefaultTemplateConfig(schema, def));
            toast.info("Đã khôi phục cấu hình mặc định (chưa lưu)");
        }
    };

    const handleCancel = () => {
        navigate(`/settings/print-templates/${schema.slug}/${draft.id}`);
    };

    // lg:h-full cho PageContainer chiều cao XÁC ĐỊNH (= vùng nội dung còn lại
    // của shell) để flex-1 của grid giới hạn được chiều cao hai cột; dưới lg
    // để auto để trang cuộn bình thường trong main.
    return (
        <PageContainer className="flex flex-col space-y-4 pb-4 lg:h-full">
            <PageHeader
                title="Chỉnh sửa mẫu in"
                eyebrow="Cấu hình mẫu in"
                description={`${draft.name} · ${schema.label}`}
            />

            <div className="grid items-stretch gap-5 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_400px]">
                {/* ── Cột trái: bản xem trước trực tiếp (không cuộn trang) ── */}
                <div className="flex min-h-0 flex-col">
                    <SurfaceCard
                        className="flex min-h-0 flex-1 flex-col"
                        title="Bản xem trước trực tiếp"
                        description="Dữ liệu mẫu minh họa — không phải dữ liệu thật. Thay đổi bên phải hiển thị ngay tại đây."
                        contentClassName="flex min-h-0 flex-1 flex-col p-0"
                        action={
                            <div className="flex items-center gap-1">
                                {ZOOM_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setZoom(option.value)}
                                        className={cn(
                                            "rounded-md border px-2 py-1 text-xs font-medium transition-colors",
                                            zoom === option.value
                                                ? "border-bo-primary bg-bo-primary text-white"
                                                : "border-bo-border bg-white text-bo-muted hover:bg-bo-surface-subtle"
                                        )}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        }
                    >
                        <div
                            ref={previewAreaRef}
                            className="min-h-0 flex-1 overflow-auto bg-bo-canvas p-4 sm:p-6"
                        >
                            <div
                                className={`mx-auto bg-white shadow-sm ${getPaperSheetClasses(paper)}`}
                                style={{ zoom: effectiveZoom }}
                            >
                                <div className="mb-4 rounded-md border border-dashed border-bo-warning/60 bg-bo-warning-soft px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-bo-warning">
                                    Mẫu minh họa — dữ liệu ví dụ, không phải dữ liệu thật
                                </div>
                                <PrintTemplateDocument
                                    documentType={schema.key}
                                    config={draft}
                                    model={sampleModel}
                                    company={company}
                                />
                            </div>
                        </div>
                    </SurfaceCard>
                </div>

                {/* ── Cột phải: flex-column — chỉ phần nội dung cấu hình cuộn,
                         thanh thao tác nằm NGOÀI vùng cuộn (shrink-0) nên không
                         bao giờ đè lên các section; pb-4 để section cuối
                         ("Chữ ký") cuộn lên hoàn toàn khỏi mép dưới ── */}
                <div className="flex min-h-0 flex-col">
                    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pb-4 pr-1">
                        <EditorSection title="Thông tin mẫu" defaultOpen>
                            <div className="space-y-4">
                                <TextField
                                    label="Tên mẫu"
                                    value={draft.name}
                                    onChange={(value) => setField("name", value)}
                                />
                                <FieldGroup label="Loại chứng từ">
                                    <p className="rounded-md border border-bo-border bg-bo-surface-subtle px-3 py-2 text-sm font-medium text-bo-muted">
                                        {schema.label}
                                    </p>
                                </FieldGroup>
                                <div className="grid grid-cols-2 gap-3">
                                    <FieldGroup label="Khổ giấy">
                                        <SegmentedControl
                                            options={schema.paperProfiles.map((size) => ({
                                                value: size,
                                                label: size,
                                            }))}
                                            value={draft.paperSize}
                                            onChange={(value) => setField("paperSize", value)}
                                        />
                                    </FieldGroup>
                                    {!isK80 ? (
                                        <FieldGroup label="Hướng giấy">
                                            <SegmentedControl
                                                options={[
                                                    { value: "portrait", label: "Dọc" },
                                                    { value: "landscape", label: "Ngang" },
                                                ]}
                                                value={draft.orientation}
                                                onChange={(value) => setField("orientation", value)}
                                            />
                                        </FieldGroup>
                                    ) : null}
                                </div>
                                {!isK80 ? (
                                    <FieldGroup label="Lề">
                                        <SegmentedControl
                                            options={[
                                                { value: "narrow", label: "Hẹp" },
                                                { value: "default", label: "Mặc định" },
                                                { value: "wide", label: "Rộng" },
                                            ]}
                                            value={draft.margin}
                                            onChange={(value) => setField("margin", value)}
                                        />
                                    </FieldGroup>
                                ) : null}
                                <FieldGroup label="Màu nhấn">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={draft.accentColor}
                                            onChange={(event) =>
                                                setField("accentColor", event.target.value)
                                            }
                                            className="size-9 cursor-pointer rounded-md border border-bo-border bg-white p-1"
                                        />
                                        <Input
                                            value={draft.accentColor}
                                            onChange={(event) =>
                                                setField("accentColor", event.target.value)
                                            }
                                            className="w-28 border-bo-border bg-white font-mono text-xs text-bo-foreground"
                                        />
                                    </div>
                                </FieldGroup>
                                <ToggleRow
                                    label="Đặt làm mẫu mặc định"
                                    checked={draft.isDefault}
                                    onChange={(value) => setField("isDefault", value)}
                                />
                            </div>
                        </EditorSection>

                        <EditorSection title="Thông tin công ty (dùng chung)">
                            <p className="mb-3 rounded-md border border-bo-border bg-bo-surface-subtle px-3 py-2 text-xs leading-5 text-bo-muted">
                                Tên công ty, email, điện thoại, địa chỉ là hồ sơ DÙNG CHUNG
                                cho mọi mẫu in — thay đổi ở đây áp dụng cho tất cả loại chứng từ.
                            </p>
                            <div className="space-y-4">
                                <TextField
                                    label="Tên công ty"
                                    value={company.name}
                                    onChange={(value) =>
                                        setCompany((prev) => ({ ...prev, name: value }))
                                    }
                                />
                                <TextField
                                    label="Email"
                                    value={company.email}
                                    onChange={(value) =>
                                        setCompany((prev) => ({ ...prev, email: value }))
                                    }
                                    placeholder="Ví dụ: lienhe@congty.vn"
                                />
                                <TextField
                                    label="Điện thoại"
                                    value={company.phone}
                                    onChange={(value) =>
                                        setCompany((prev) => ({ ...prev, phone: value }))
                                    }
                                    placeholder="Ví dụ: 0123 456 789"
                                />
                                <TextField
                                    label="Địa chỉ"
                                    value={company.address}
                                    onChange={(value) =>
                                        setCompany((prev) => ({ ...prev, address: value }))
                                    }
                                    placeholder="Ví dụ: 123 Đường ABC, Quận 1, TP. Hồ Chí Minh"
                                />
                            </div>
                        </EditorSection>

                        <EditorSection title="Hiển thị thương hiệu">
                            <div>
                                <ToggleRow
                                    label="Hiển thị logo"
                                    checked={draft.branding.showLogo}
                                    onChange={(value) => setField("branding.showLogo", value)}
                                />
                                <ToggleRow
                                    label="Hiển thị tên công ty"
                                    checked={draft.branding.showCompanyName}
                                    onChange={(value) => setField("branding.showCompanyName", value)}
                                />
                                <ToggleRow
                                    label="Hiển thị email"
                                    checked={draft.branding.showEmail}
                                    onChange={(value) => setField("branding.showEmail", value)}
                                />
                                <ToggleRow
                                    label="Hiển thị điện thoại"
                                    checked={draft.branding.showPhone}
                                    onChange={(value) => setField("branding.showPhone", value)}
                                />
                                <ToggleRow
                                    label="Hiển thị địa chỉ"
                                    checked={draft.branding.showAddress}
                                    onChange={(value) => setField("branding.showAddress", value)}
                                />
                            </div>
                        </EditorSection>

                        {schema.sections.map((section) => (
                            <EditorSection key={section.key} title={section.title} defaultOpen={false}>
                                {section.type === "info" ? (
                                    <div>
                                        {section.fields.map((field) => (
                                            <ToggleRow
                                                key={field.key}
                                                label={field.label}
                                                checked={draft.sections[section.key]?.[field.key] !== false}
                                                onChange={(value) =>
                                                    setField(
                                                        `sections.${section.key}.${field.key}`,
                                                        value
                                                    )
                                                }
                                            />
                                        ))}
                                    </div>
                                ) : null}

                                {section.type === "items" ? (
                                    <div>
                                        <ToggleRow
                                            label="Hiển thị bảng"
                                            checked={draft.sections[section.key]?.show !== false}
                                            onChange={(value) =>
                                                setField(`sections.${section.key}.show`, value)
                                            }
                                        />
                                        {section.columns.map((column) => (
                                            <ToggleRow
                                                key={column.key}
                                                label={`Cột: ${column.label}`}
                                                checked={draft.columns[column.key] !== false}
                                                onChange={(value) =>
                                                    setField(`columns.${column.key}`, value)
                                                }
                                            />
                                        ))}
                                        {section.total ? (
                                            <ToggleRow
                                                label={section.total.label}
                                                checked={
                                                    draft.sections[section.key]?.showTotal !== false
                                                }
                                                onChange={(value) =>
                                                    setField(
                                                        `sections.${section.key}.showTotal`,
                                                        value
                                                    )
                                                }
                                            />
                                        ) : null}
                                    </div>
                                ) : null}

                                {section.type === "notes" ? (
                                    <ToggleRow
                                        label="Hiển thị khu vực ghi chú"
                                        checked={draft.sections[section.key]?.show !== false}
                                        onChange={(value) =>
                                            setField(`sections.${section.key}.show`, value)
                                        }
                                    />
                                ) : null}

                                {section.type === "signatures" ? (
                                    <div>
                                        {section.blocks.map((block) => (
                                            <ToggleRow
                                                key={block.key}
                                                label={block.label}
                                                checked={
                                                    draft.sections[section.key]?.[block.key] !== false
                                                }
                                                onChange={(value) =>
                                                    setField(
                                                        `sections.${section.key}.${block.key}`,
                                                        value
                                                    )
                                                }
                                            />
                                        ))}
                                    </div>
                                ) : null}
                            </EditorSection>
                        ))}
                    </div>

                    {/* ── Thanh thao tác DUY NHẤT — nằm trong cột cấu hình,
                         không bao giờ đè lên bản xem trước ── */}
                    <div className="mt-3 flex shrink-0 items-center justify-between gap-2 rounded-lg border border-bo-border bg-white px-3 py-2.5 shadow-sm">
                        <Button
                            variant="outline"
                            className="border-bo-border bg-white text-bo-muted hover:bg-bo-surface-subtle hover:text-bo-foreground"
                            onClick={handleReset}
                        >
                            <RotateCcw className="size-4" />
                            Khôi phục mặc định
                        </Button>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                className="border-bo-border bg-white text-bo-foreground hover:bg-bo-surface-subtle"
                                onClick={handleCancel}
                            >
                                Hủy
                            </Button>
                            <Button
                                className="bg-bo-primary text-white hover:bg-bo-primary-hover"
                                onClick={() => handleSave(true)}
                            >
                                Lưu & áp dụng
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}
