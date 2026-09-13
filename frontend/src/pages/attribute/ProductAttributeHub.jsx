import { useCallback, useEffect, useState } from 'react';
import {
    AlignLeft, ChevronDown, ChevronLeft, ChevronRight, Edit, Eye, Filter,
    Hash, Layers, Palette, Pipette, Plus, RefreshCcw, RotateCcw, Ruler,
    Save, SortAsc, Tag, Trash2,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ConfirmModal from "@/components/ui/confirm-modal";
import PageContainer from "@/components/backoffice/PageContainer";
import SurfaceCard from "@/components/shared/SurfaceCard";
import TableShell from "@/components/shared/TableShell";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import LoadingState from "@/components/shared/LoadingState";
import SearchInput from "@/components/shared/SearchInput";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { mauSacService, sizeService } from "@/services/attributeService";
import { getAllChatLieu, deleteChatLieu, createChatLieu, updateChatLieu } from "@/services/chatLieuService";

const formSchema = z.object({
    ten: z.string().min(1, "Tên không được để trống"),
    ma: z.string().min(1, "Mã không được để trống"),
    maMauHex: z.string().optional(),
    loaiSize: z.string().optional(),
    thuTuSapXep: z.coerce.number().optional(),
    moTa: z.string().optional(),
});

const TAB_ICONS = { color: Palette, size: Ruler, material: Layers };
const TAB_LABELS = { color: 'màu sắc', size: 'kích cỡ', material: 'chất liệu' };
const TAB_NAMES = { color: 'Màu sắc', size: 'Kích cỡ', material: 'Chất liệu' };

/* ══════════════════════════════════════════════════════
   VIEW MODAL — Chi tiết thuộc tính
══════════════════════════════════════════════════════ */
const ViewModal = ({ viewItem, activeTab, onClose, onEdit }) => {
    if (!viewItem) return null;

    const TabIcon = TAB_ICONS[activeTab];
    const tabLabel = TAB_NAMES[activeTab];

    const getCode = (item) => item.maMau || item.maSize || item.maChatLieu || '—';
    const getName = (item) => item.tenMau || item.tenSize || item.tenChatLieu || '—';

    return (
        <Dialog open={!!viewItem} onOpenChange={o => !o && onClose()}>
            <DialogContent className="rounded-lg border border-bo-border bg-white text-bo-foreground shadow-lg sm:max-w-md">
                {/* ── Header ── */}
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-bo-primary-soft text-bo-primary">
                            <TabIcon className="size-5" />
                        </span>
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-bo-muted">
                                Chi tiết thuộc tính
                            </p>
                            <DialogTitle className="text-base font-semibold text-bo-foreground">
                                {tabLabel}
                            </DialogTitle>
                        </div>
                    </div>
                    <DialogDescription className="sr-only">Hồ sơ dữ liệu thuộc tính {tabLabel}</DialogDescription>
                </DialogHeader>

                {/* ── Body ── */}
                <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <InfoTile icon={<Hash className="size-3.5" />} label="Mã định danh" value={getCode(viewItem)} mono />
                        <InfoTile icon={<Tag className="size-3.5" />} label="Tên hiển thị" value={getName(viewItem)} />
                    </div>

                    {/* ── COLOR specific ── */}
                    {activeTab === 'color' && (
                        <InfoTile
                            icon={<Pipette className="size-3.5" />}
                            label="Mã màu Hex"
                            value={viewItem.maMauHex || '—'}
                            mono
                        />
                    )}

                    {/* ── SIZE specific ── */}
                    {activeTab === 'size' && (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="rounded-lg border border-bo-border bg-bo-surface-subtle p-3">
                                <TileLabel icon={<Ruler className="size-3.5" />} label="Loại kích cỡ" />
                                {viewItem.loaiSize ? (
                                    <StatusBadge
                                        label={viewItem.loaiSize}
                                        tone="neutral"
                                        dot={false}
                                        className="mt-1.5 uppercase"
                                    />
                                ) : (
                                    <p className="mt-1.5 text-sm italic text-bo-muted">—</p>
                                )}
                            </div>
                            <InfoTile
                                icon={<SortAsc className="size-3.5" />}
                                label="Thứ tự ưu tiên"
                                value={viewItem.thuTuSapXep ?? '—'}
                                mono
                            />
                        </div>
                    )}

                    {/* ── Description (material & size) ── */}
                    {(activeTab === 'material' || activeTab === 'size') && (
                        <div className="rounded-lg border border-bo-border bg-bo-surface-subtle p-3">
                            <TileLabel icon={<AlignLeft className="size-3.5" />} label="Mô tả chi tiết" />
                            {viewItem.moTa ? (
                                <p className="mt-1.5 text-sm leading-6 text-bo-foreground">{viewItem.moTa}</p>
                            ) : (
                                <p className="mt-1.5 border-l-2 border-bo-border pl-2.5 text-sm italic text-bo-muted">
                                    Không có mô tả chi tiết cho thuộc tính này.
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Footer ── */}
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="border-bo-border bg-white text-bo-foreground hover:bg-bo-surface-subtle"
                    >
                        Đóng
                    </Button>
                    <Button
                        onClick={() => { onEdit(viewItem); onClose(); }}
                        className="gap-1.5 bg-bo-primary text-white hover:bg-bo-primary-hover"
                    >
                        <Edit className="size-4" />
                        Chỉnh sửa
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const ProductAttributeHub = () => {
    const [activeTab, setActiveTab] = useState('color');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [filters, setFilters] = useState({ keyword: "", page: 0, size: 10 });
    const [modalConfig, setModalConfig] = useState({ open: false, mode: 'add', item: null });
    const [deleteConfig, setDeleteConfig] = useState({ open: false, item: null });
    const [isDeleting, setIsDeleting] = useState(false);
    const [viewItem, setViewItem] = useState(null);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: { ten: "", ma: "", maMauHex: "#000000", loaiSize: "", thuTuSapXep: 0, moTa: "" },
    });

    const mapToForm = (item) => {
        if (activeTab === 'color') return { ma: item.maMau, ten: item.tenMau, maMauHex: item.maMauHex || "#000000" };
        if (activeTab === 'size') return { ma: item.maSize, ten: item.tenSize, loaiSize: item.loaiSize, thuTuSapXep: item.thuTuSapXep, moTa: item.moTa };
        if (activeTab === 'material') return { ma: item.maChatLieu, ten: item.tenChatLieu, moTa: item.moTa };
    };

    const mapToPayload = (values) => {
        if (activeTab === 'color') return { maMau: values.ma, tenMau: values.ten, maMauHex: values.maMauHex };
        if (activeTab === 'size') return { maSize: values.ma, tenSize: values.ten, loaiSize: values.loaiSize, thuTuSapXep: values.thuTuSapXep, moTa: values.moTa };
        if (activeTab === 'material') return { maChatLieu: values.ma, tenChatLieu: values.ten, moTa: values.moTa };
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const filterList = [];
            if (filters.keyword?.trim()) {
                const kw = filters.keyword.trim();
                const fields = activeTab === 'color' ? ['tenMau', 'maMau'] : activeTab === 'size' ? ['tenSize', 'maSize'] : ['tenChatLieu', 'maChatLieu'];
                fields.forEach(f => filterList.push({ fieldName: f, operation: "LIKE", value: kw, logicType: "OR" }));
            }
            const payload = { page: filters.page, size: filters.size, filters: filterList, sorts: [{ fieldName: "id", direction: "DESC" }] };
            if (activeTab === 'color') {
                const res = await mauSacService.filter(payload);
                setData(res.data.content || []); setTotal(res.data.totalElements || 0);
            } else if (activeTab === 'size') {
                const res = await sizeService.filter(payload);
                setData(res.data.content || []); setTotal(res.data.totalElements || 0);
            } else {
                const res = await getAllChatLieu(filters.keyword);
                setData(res || []); setTotal(res?.length || 0);
            }
        } catch { toast.error("Lỗi tải dữ liệu"); }
        finally { setLoading(false); }
    }, [activeTab, filters]);

    // Hoãn qua microtask để tránh setState đồng bộ trong effect
    // (react-hooks/set-state-in-effect); vẫn tải lại ngay mỗi khi tab/bộ lọc đổi.
    useEffect(() => { queueMicrotask(() => fetchData()); }, [fetchData]);

    const handleReset = () => setFilters({ keyword: "", page: 0, size: 10 });
    const generateAutoCode = () => {
        const r = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return activeTab === 'color' ? `MS-${r}` : activeTab === 'material' ? `CL-${r}` : '';
    };

    const handleOpenModal = (mode, item = null) => {
        if (mode === 'view') { setViewItem(item); return; }
        setModalConfig({ open: true, mode, item });
        if (item) form.reset(mapToForm(item));
        else {
            const autoCode = mode === 'add' && (activeTab === 'color' || activeTab === 'material') ? generateAutoCode() : '';
            form.reset({ ten: "", ma: autoCode, maMauHex: "#000000", loaiSize: "", thuTuSapXep: 0, moTa: "" });
        }
    };

    const onSubmit = async (values) => {
        try {
            const payload = mapToPayload(values);
            if (modalConfig.mode === 'add') {
                activeTab === 'color' ? await mauSacService.create(payload) : activeTab === 'size' ? await sizeService.create(payload) : await createChatLieu(payload);
                toast.success("Thêm mới thành công");
            } else {
                const id = modalConfig.item.id;
                activeTab === 'color' ? await mauSacService.update({ id, ...payload }) : activeTab === 'size' ? await sizeService.update({ id, ...payload }) : await updateChatLieu(id, payload);
                toast.success("Cập nhật thành công");
            }
            setModalConfig({ open: false, mode: 'add', item: null });
            fetchData();
        } catch { toast.error("Thao tác thất bại"); }
    };

    const confirmDelete = async () => {
        if (!deleteConfig.item) return;
        setIsDeleting(true);
        try {
            activeTab === 'color' ? await mauSacService.delete(deleteConfig.item.id) : activeTab === 'size' ? await sizeService.delete(deleteConfig.item.id) : await deleteChatLieu(deleteConfig.item.id);
            toast.success("Xóa thành công");
            setDeleteConfig({ open: false, item: null });
            fetchData();
        } catch { toast.error("Xóa thất bại"); }
        finally { setIsDeleting(false); }
    };

    const totalPages = Math.max(1, Math.ceil(total / filters.size));
    const startItem = total === 0 ? 0 : filters.page * filters.size + 1;
    const endItem = Math.min((filters.page + 1) * filters.size, total);
    const TabIcon = TAB_ICONS[activeTab];

    return (
        <PageContainer className="space-y-5">
            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); handleReset(); }}>
                <TabsList className="h-auto w-fit flex-wrap items-center justify-start gap-1 rounded-lg border border-bo-border bg-bo-surface-subtle p-1">
                    {['color', 'size', 'material'].map(tab => {
                        const Icon = TAB_ICONS[tab];
                        return (
                            <TabsTrigger
                                key={tab}
                                value={tab}
                                className="rounded-md px-3 py-1.5 text-sm font-medium text-bo-muted data-[state=active]:bg-white data-[state=active]:text-bo-primary data-[state=active]:shadow-sm"
                            >
                                <Icon className="mr-2 size-3.5" />
                                {TAB_NAMES[tab]}
                            </TabsTrigger>
                        );
                    })}
                </TabsList>
            </Tabs>

            <SurfaceCard
                title={
                    <span className="flex items-center gap-2">
                        <Filter className="size-4 text-bo-primary" />
                        Bộ lọc tìm kiếm
                    </span>
                }
            >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <SearchInput
                        value={filters.keyword}
                        onChange={e => setFilters(p => ({ ...p, keyword: e.target.value, page: 0 }))}
                        placeholder="Tìm kiếm theo mã hoặc tên..."
                    />
                    <Button
                        variant="outline"
                        onClick={handleReset}
                        className="h-9 shrink-0 gap-1.5 border-bo-border bg-white text-bo-foreground hover:bg-bo-surface-subtle"
                    >
                        <RefreshCcw className="size-4" />
                        Đặt lại
                    </Button>
                </div>
            </SurfaceCard>

            <div className="flex items-center justify-end">
                <Button
                    onClick={() => handleOpenModal('add')}
                    className="h-9 gap-1.5 bg-bo-primary text-white hover:bg-bo-primary-hover"
                >
                    <Plus className="size-4" />
                    Thêm {TAB_LABELS[activeTab]} mới
                </Button>
            </div>

            {loading ? (
                <SurfaceCard contentClassName="p-0 sm:p-0">
                    <LoadingState rows={5} />
                </SurfaceCard>
            ) : data.length === 0 ? (
                <SurfaceCard contentClassName="p-0 sm:p-0">
                    <EmptyState
                        icon={TabIcon}
                        title={`Chưa có ${TAB_LABELS[activeTab]}`}
                        description="Danh mục này hiện đang trống. Hãy bắt đầu bằng cách thêm mới một mục."
                    />
                </SurfaceCard>
            ) : (
                <TableShell
                    footer={
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-center gap-2">
                                <Label className="whitespace-nowrap text-xs text-bo-muted">Hiển thị:</Label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="h-8 w-[120px] justify-between border-bo-border bg-white px-2.5 text-xs font-normal text-bo-foreground hover:bg-bo-surface-subtle"
                                        >
                                            {filters.size} dòng
                                            <ChevronDown className="size-3.5 opacity-60" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="start"
                                        className="backoffice-user-menu z-50 w-[120px] rounded-lg border border-bo-border bg-white p-1 shadow-lg"
                                    >
                                        {[5, 10, 20, 50, 100].map(size => (
                                            <DropdownMenuItem
                                                key={size}
                                                onClick={() => setFilters((p) => ({ ...p, size, page: 0 }))}
                                                className="cursor-pointer rounded-md px-2.5 py-1.5 text-sm text-slate-700 focus:bg-slate-100 focus:text-slate-900"
                                            >
                                                {size} dòng
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <p className="text-xs text-bo-muted">
                                Hiển thị <span className="font-semibold text-bo-foreground">{startItem}</span>
                                {" "}-{" "}
                                <span className="font-semibold text-bo-foreground">{endItem}</span>
                                {" "}trong tổng số <span className="font-semibold text-bo-primary">{total}</span> kết quả
                            </p>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}
                                    disabled={filters.page === 0}
                                    className="h-8 gap-1 border-bo-border bg-white px-2.5 text-xs text-bo-foreground hover:bg-bo-surface-subtle disabled:opacity-50"
                                >
                                    <ChevronLeft className="size-3.5" /> Trước
                                </Button>

                                <div className="hidden items-center gap-1 sm:flex">
                                    {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                                        let pageNum;
                                        if (totalPages <= 5) pageNum = idx;
                                        else if (filters.page < 3) pageNum = idx;
                                        else if (filters.page > totalPages - 4) pageNum = totalPages - 5 + idx;
                                        else pageNum = filters.page - 2 + idx;
                                        return (
                                            <Button
                                                key={idx}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setFilters(p => ({ ...p, page: pageNum }))}
                                                className={
                                                    filters.page === pageNum
                                                        ? "h-8 border-bo-primary bg-bo-primary px-2.5 text-xs text-white hover:bg-bo-primary-hover"
                                                        : "h-8 border-bo-border bg-white px-2.5 text-xs text-bo-foreground hover:bg-bo-surface-subtle"
                                                }
                                            >
                                                {pageNum + 1}
                                            </Button>
                                        );
                                    })}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}
                                    disabled={filters.page >= totalPages - 1}
                                    className="h-8 gap-1 border-bo-border bg-white px-2.5 text-xs text-bo-foreground hover:bg-bo-surface-subtle disabled:opacity-50"
                                >
                                    Sau <ChevronRight className="size-3.5" />
                                </Button>
                            </div>
                        </div>
                    }
                >
                    <div className="max-h-[520px] overflow-y-auto">
                        <table className="w-full min-w-[720px] text-sm">
                            <thead className="sticky top-0 z-10">
                                <tr className="border-b border-bo-border bg-bo-surface-subtle">
                                    <th className="h-11 w-14 px-3 text-center text-[11px] font-semibold uppercase tracking-wide text-bo-muted">STT</th>
                                    <th className="h-11 px-3 text-left text-[11px] font-semibold uppercase tracking-wide text-bo-muted">Mã</th>
                                    <th className="h-11 px-3 text-left text-[11px] font-semibold uppercase tracking-wide text-bo-muted">Tên hiển thị</th>
                                    {activeTab === 'color' && <th className="h-11 px-3 text-left text-[11px] font-semibold uppercase tracking-wide text-bo-muted">Màu sắc</th>}
                                    {activeTab === 'size' && <th className="h-11 px-3 text-left text-[11px] font-semibold uppercase tracking-wide text-bo-muted">Phân loại</th>}
                                    {activeTab === 'material' && <th className="h-11 px-3 text-left text-[11px] font-semibold uppercase tracking-wide text-bo-muted">Mô tả</th>}
                                    <th className="h-11 px-3 text-center text-[11px] font-semibold uppercase tracking-wide text-bo-muted">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-bo-border">
                                {data.map((item, index) => (
                                    <tr
                                        key={item.id}
                                        className="cursor-pointer transition-colors hover:bg-bo-surface-subtle"
                                        onClick={() => handleOpenModal('edit', item)}
                                    >
                                        <td className="w-14 px-3 py-3 text-center font-mono text-xs text-bo-muted">
                                            {filters.page * filters.size + index + 1}
                                        </td>
                                        <td className="px-3 py-3">
                                            <span className="font-mono font-semibold tracking-wide text-bo-primary">
                                                {item.maMau || item.maSize || item.maChatLieu}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 font-semibold text-bo-foreground">
                                            {item.tenMau || item.tenSize || item.tenChatLieu}
                                        </td>
                                        {activeTab === 'color' && (
                                            <td className="px-3 py-3">
                                                <span className="inline-flex items-center rounded-md border border-bo-border bg-bo-surface-subtle px-2 py-0.5 font-mono text-xs text-bo-foreground">
                                                    {item.maMauHex || '—'}
                                                </span>
                                            </td>
                                        )}
                                        {activeTab === 'size' && (
                                            <td className="px-3 py-3">
                                                <StatusBadge
                                                    label={item.loaiSize || '—'}
                                                    tone="neutral"
                                                    dot={false}
                                                    className="uppercase"
                                                />
                                            </td>
                                        )}
                                        {activeTab === 'material' && (
                                            <td className="min-w-[320px] max-w-[520px] whitespace-normal break-words px-3 py-3 italic text-bo-muted">
                                                {item.moTa || '—'}
                                            </td>
                                        )}
                                        <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    type="button"
                                                    title="Xem chi tiết"
                                                    className="inline-flex size-8 items-center justify-center rounded-md border border-bo-border text-bo-muted transition-colors hover:border-bo-primary hover:text-bo-primary"
                                                    onClick={() => handleOpenModal('view', item)}
                                                >
                                                    <Eye className="size-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    title="Chỉnh sửa"
                                                    className="inline-flex size-8 items-center justify-center rounded-md border border-bo-border text-bo-muted transition-colors hover:border-bo-primary hover:text-bo-primary"
                                                    onClick={() => handleOpenModal('edit', item)}
                                                >
                                                    <Edit className="size-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    title="Xóa"
                                                    className="inline-flex size-8 items-center justify-center rounded-md border border-bo-border text-bo-muted transition-colors hover:border-bo-danger hover:text-bo-danger"
                                                    onClick={() => setDeleteConfig({ open: true, item })}
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </TableShell>
            )}

            {/* ── Form Modal ── */}
            <Dialog open={modalConfig.open} onOpenChange={o => setModalConfig({ ...modalConfig, open: o })}>
                <DialogContent className="rounded-lg border border-bo-border bg-white text-bo-foreground shadow-lg sm:max-w-xl">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-bo-primary-soft text-bo-primary">
                                <Edit className="size-5" />
                            </span>
                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-bo-muted">
                                    {modalConfig.mode === 'add' ? 'Khởi tạo thuộc tính' : 'Chỉnh sửa thuộc tính'}
                                </p>
                                <DialogTitle className="text-base font-semibold text-bo-foreground">
                                    {modalConfig.mode === 'add' ? 'Thêm mới' : 'Chỉnh sửa'} {TAB_NAMES[activeTab]}
                                </DialogTitle>
                            </div>
                        </div>
                        <DialogDescription className="sr-only">Biểu mẫu cập nhật thuộc tính</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-semibold uppercase tracking-wide text-bo-muted">Mã định danh *</Label>
                                <div className="flex gap-2">
                                    <Input
                                        {...form.register("ma")}
                                        className="h-9 border-bo-border bg-white font-mono font-semibold text-bo-primary focus-visible:border-bo-primary focus-visible:ring-bo-primary/20"
                                        placeholder="VD: 42"
                                    />
                                    {(activeTab === 'color' || activeTab === 'material') && (
                                        <button
                                            type="button"
                                            className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-bo-border bg-white text-bo-muted transition-colors hover:border-bo-primary hover:text-bo-primary"
                                            onClick={() => form.setValue('ma', generateAutoCode())}
                                            title="Tạo mã tự động"
                                        >
                                            <RotateCcw className="size-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-semibold uppercase tracking-wide text-bo-muted">Tên hiển thị *</Label>
                                <Input
                                    {...form.register("ten")}
                                    className="h-9 border-bo-border bg-white font-semibold text-bo-foreground focus-visible:border-bo-primary focus-visible:ring-bo-primary/20"
                                    placeholder="Nhập tên hiển thị"
                                />
                            </div>
                        </div>

                        {activeTab === 'color' && (
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-semibold uppercase tracking-wide text-bo-muted">Mã màu Hex</Label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        className="h-9 w-16 cursor-pointer rounded-md border border-bo-border bg-white p-1"
                                        {...form.register("maMauHex")}
                                    />
                                    <Input
                                        {...form.register("maMauHex")}
                                        className="h-9 flex-1 border-bo-border bg-white font-mono uppercase text-bo-foreground focus-visible:border-bo-primary focus-visible:ring-bo-primary/20"
                                        placeholder="#000000"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'size' && (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-semibold uppercase tracking-wide text-bo-muted">Loại kích cỡ</Label>
                                    <Input
                                        {...form.register("loaiSize")}
                                        className="h-9 border-bo-border bg-white text-bo-foreground focus-visible:border-bo-primary focus-visible:ring-bo-primary/20"
                                        placeholder="VD: Số, Chữ"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-semibold uppercase tracking-wide text-bo-muted">Thứ tự ưu tiên</Label>
                                    <Input
                                        type="number"
                                        {...form.register("thuTuSapXep")}
                                        className="h-9 border-bo-border bg-white font-mono text-bo-foreground focus-visible:border-bo-primary focus-visible:ring-bo-primary/20"
                                    />
                                </div>
                            </div>
                        )}

                        {(activeTab === 'material' || activeTab === 'size') && (
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-semibold uppercase tracking-wide text-bo-muted">Mô tả chi tiết</Label>
                                <Textarea
                                    {...form.register("moTa")}
                                    rows={3}
                                    className="min-h-[88px] resize-none border-bo-border bg-white text-bo-foreground focus-visible:border-bo-primary focus-visible:ring-bo-primary/20"
                                    placeholder="Nhập mô tả ngắn"
                                />
                            </div>
                        )}

                        <DialogFooter className="border-t border-bo-border pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setModalConfig({ ...modalConfig, open: false })}
                                className="border-bo-border bg-white text-bo-foreground hover:bg-bo-surface-subtle"
                            >
                                Đóng
                            </Button>
                            <Button
                                type="submit"
                                className="gap-1.5 bg-bo-primary text-white hover:bg-bo-primary-hover"
                            >
                                <Save className="size-4" />
                                {modalConfig.mode === 'add' ? 'Khởi tạo' : 'Chỉnh sửa'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── View Modal ── */}
            <ViewModal
                viewItem={viewItem}
                activeTab={activeTab}
                onClose={() => setViewItem(null)}
                onEdit={(item) => handleOpenModal('edit', item)}
            />

            {/* ── Delete Modal ── */}
            <ConfirmModal
                isOpen={deleteConfig.open}
                onClose={() => !isDeleting && setDeleteConfig({ open: false, item: null })}
                onConfirm={confirmDelete}
                title="Xác nhận xóa"
                description={
                    <>
                        Bạn có chắc chắn muốn xóa vĩnh viễn {TAB_LABELS[activeTab]}{" "}
                        <strong className="font-semibold text-bo-foreground">
                            "{deleteConfig.item?.tenMau || deleteConfig.item?.tenSize || deleteConfig.item?.tenChatLieu}"
                        </strong>?
                        <span className="mt-1 block text-xs font-medium text-bo-muted">
                            Cẩn trọng: Thao tác này không thể hoàn tác
                        </span>
                    </>
                }
                confirmText="Xóa dữ liệu"
                cancelText="Hủy bỏ"
                variant="danger"
                isLoading={isDeleting}
            />
        </PageContainer>
    );
};

/* ══════════════════════════════════════════════════
   SUB-COMPONENTS
══════════════════════════════════════════════════ */
function TileLabel({ icon, label }) {
    return (
        <div className="flex items-center gap-1.5">
            <span className="text-bo-muted">{icon}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-bo-muted">{label}</span>
        </div>
    );
}

function InfoTile({ icon, label, value, mono = false }) {
    return (
        <div className="rounded-lg border border-bo-border bg-bo-surface-subtle p-3">
            <TileLabel icon={icon} label={label} />
            <p className={`mt-1.5 break-words text-sm font-semibold text-bo-foreground ${mono ? 'font-mono' : ''}`}>
                {value}
            </p>
        </div>
    );
}

export default ProductAttributeHub;
