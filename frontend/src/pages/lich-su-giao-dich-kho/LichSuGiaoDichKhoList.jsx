// src/pages/lich-su-giao-dich-kho/LichSuGiaoDichKhoList.jsx
import { createElement, useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Filter, RefreshCcw, ChevronDown, ChevronLeft, ChevronRight,
    Check, Loader2, History, ArrowDownToLine, ArrowUpFromLine,
    ArrowLeftRight, SlidersHorizontal, Warehouse, Eye,
    CalendarDays, User2, FileText, Hash, Package,
} from "lucide-react";
import { toast } from "sonner";
import PageContainer from "@/components/backoffice/PageContainer";
import FilterBar from "@/components/shared/FilterBar";
import SearchInput from "@/components/shared/SearchInput";
import TableShell from "@/components/shared/TableShell";
import EmptyState from "@/components/shared/EmptyState";
import LoadingState from "@/components/shared/LoadingState";
import { getLichSuGiaoDichKho, getChiTietLichSu } from "@/services/lichSuGiaoDichKhoService";
import { getMineKhoList } from "@/services/khoService";

// ── Constants ─────────────────────────────────────────────────────────────
const LOAI_GIAO_DICH_CONFIG = {
    nhap_kho:   { label: "Nhập kho",   icon: ArrowDownToLine,   badge: "border-bo-success/20 bg-bo-success-soft text-bo-success", dot: "bg-bo-success" },
    xuat_kho:   { label: "Xuất kho",   icon: ArrowUpFromLine,   badge: "border-bo-danger/20 bg-bo-danger-soft text-bo-danger",   dot: "bg-bo-danger"  },
    chuyen_kho: { label: "Chuyển kho", icon: ArrowLeftRight,    badge: "border-bo-primary/20 bg-bo-primary-soft text-bo-primary", dot: "bg-bo-primary" },
    dieu_chinh: { label: "Điều chỉnh", icon: SlidersHorizontal, badge: "border-bo-warning/20 bg-bo-warning-soft text-bo-warning", dot: "bg-bo-warning" },
};

const LOAI_FILTER_OPTIONS = [
    { value: "all",        label: "Tất cả loại giao dịch" },
    { value: "nhap_kho",   label: "Nhập kho"   },
    { value: "xuat_kho",   label: "Xuất kho"   },
    { value: "chuyen_kho", label: "Chuyển kho" },
    { value: "dieu_chinh", label: "Điều chỉnh" },
];

const STAT_TILES = [
    { key: "nhap_kho",   label: "Nhập kho",   iconClass: "bg-bo-success-soft text-bo-success" },
    { key: "xuat_kho",   label: "Xuất kho",   iconClass: "bg-bo-danger-soft text-bo-danger"   },
    { key: "chuyen_kho", label: "Chuyển kho", iconClass: "bg-bo-primary-soft text-bo-primary" },
    { key: "dieu_chinh", label: "Điều chỉnh", iconClass: "bg-bo-warning-soft text-bo-warning" },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const TH_CLASS =
    "h-10 px-4 text-[11px] font-semibold uppercase tracking-wide text-bo-muted whitespace-nowrap";
const DROPDOWN_CONTENT_CLASS =
    "backoffice-user-menu z-50 rounded-lg border border-bo-border bg-white p-1 shadow-lg";
const DROPDOWN_ITEM_CLASS =
    "cursor-pointer rounded-md px-2.5 py-1.5 text-sm text-slate-700 focus:bg-slate-100 focus:text-slate-900";

const formatDate = (val) =>
    val ? new Date(val).toLocaleString("vi-VN", {
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit",
    }) : "—";

// ── Loại Badge ────────────────────────────────────────────────────────────
function LoaiBadge({ loai }) {
    const cfg = LOAI_GIAO_DICH_CONFIG[loai] ?? {
        label: loai,
        badge: "border-bo-border bg-bo-surface-subtle text-slate-600",
        dot: "bg-slate-400",
    };
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${cfg.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

// ── Stat tile ─────────────────────────────────────────────────────────────
function StatTile({ icon, iconClass, label, value }) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-bo-border bg-bo-surface p-4 shadow-sm">
            <div className="min-w-0">
                <p className="text-xs font-medium text-bo-muted">{label}</p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-bo-foreground">{value}</p>
            </div>
            <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${iconClass}`}>
                {icon}
            </span>
        </div>
    );
}

// ── Action button ─────────────────────────────────────────────────────────
function ActionBtn({ title, onClick, children }) {
    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            className="inline-flex size-8 items-center justify-center rounded-md border border-bo-border bg-white text-bo-muted transition-colors hover:border-bo-primary hover:text-bo-primary"
        >
            {children}
        </button>
    );
}

// ── Field helper ──────────────────────────────────────────────────────────
function LightField({ icon: Icon, label, value, mono = false }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-bo-muted">{label}</span>
            <div className="flex items-center gap-1.5">
                {createElement(Icon, { className: "size-3.5 shrink-0 text-bo-muted" })}
                <span className={`text-sm font-medium text-slate-800 ${mono ? "font-mono" : ""}`}>
                    {value || "—"}
                </span>
            </div>
        </div>
    );
}

// ── Detail Modal ──────────────────────────────────────────────────────────
function DetailModal({ open, onClose, item, loading }) {
    const soLuong = Number(item?.soLuong ?? 0);
    const isXuatKho = item?.loaiGiaoDich === "xuat_kho";
    const displaySoLuong = isXuatKho ? -Math.abs(soLuong) : soLuong;
    const soLuongColor  = displaySoLuong > 0 ? "text-bo-success" : displaySoLuong < 0 ? "text-bo-danger" : "text-slate-600";
    const soLuongBg     = displaySoLuong > 0 ? "bg-bo-success-soft" : displaySoLuong < 0 ? "bg-bo-danger-soft" : "bg-bo-surface-subtle";
    const soLuongPrefix = displaySoLuong > 0 ? "+" : displaySoLuong < 0 ? "-" : "";

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg overflow-hidden rounded-lg border border-bo-border bg-white p-0 shadow-lg [&>button]:text-slate-500 [&>button]:hover:text-slate-700">

                {/* ── Header ── */}
                <div className="flex items-center justify-between gap-3 border-b border-bo-border bg-bo-surface-subtle px-5 pb-4 pt-5">
                    <DialogTitle className="flex items-center gap-2 text-base font-semibold text-bo-foreground">
                        <span className="flex size-8 items-center justify-center rounded-lg bg-bo-primary-soft">
                            <History className="size-4 text-bo-primary" />
                        </span>
                        Chi tiết giao dịch {item ? (
                            <span className="font-mono text-bo-primary">#{item.id}</span>
                        ) : ""}
                    </DialogTitle>
                    {item && <LoaiBadge loai={item.loaiGiaoDich} />}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center gap-2 bg-white py-14">
                        <Loader2 className="size-5 animate-spin text-bo-primary" />
                        <span className="text-sm text-bo-muted">Đang tải...</span>
                    </div>
                ) : item ? (
                    <div className="space-y-4 bg-white px-5 py-4">

                        {/* Ngày giao dịch */}
                        <div className="flex items-center gap-2 rounded-lg border border-bo-border bg-bo-surface-subtle px-4 py-2.5 text-sm text-slate-700">
                            <CalendarDays className="size-4 shrink-0 text-bo-muted" />
                            <span className="font-medium">{formatDate(item.ngayGiaoDich)}</span>
                        </div>

                        {/* Grid fields */}
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-lg border border-bo-border bg-bo-surface-subtle px-4 py-4">
                            <LightField icon={Package}      label="Sản phẩm"        value={item.tenSanPham} />
                            <LightField icon={Hash}         label="SKU"             value={item.maSku} mono />
                            <LightField icon={FileText}     label="Lô hàng"         value={item.maLo} mono />
                            <LightField icon={Warehouse}    label="Kho"             value={item.tenKho} />
                            <LightField icon={User2}        label="Người thực hiện" value={item.nguoiDungTen} />
                            <LightField icon={FileText}     label="Loại tham chiếu" value={item.loaiThamChieu} />
                            {item.idThamChieu && (
                                <LightField icon={Hash}     label="ID tham chiếu"   value={`#${item.idThamChieu}`} mono />
                            )}
                            {item.tenKhoChuyenDen && (
                                <LightField icon={ArrowLeftRight} label="Kho chuyển đến" value={item.tenKhoChuyenDen} />
                            )}
                        </div>

                        {/* Số lượng 3 ô */}
                        <div className="grid grid-cols-3 divide-x divide-bo-border overflow-hidden rounded-lg border border-bo-border bg-white shadow-sm">
                            {[
                                { label: "TRƯỚC",    value: item.soLuongTruoc ?? 0, color: "text-slate-700", bg: "bg-white",    prefix: "" },
                                { label: "THAY ĐỔI", value: Math.abs(displaySoLuong), color: soLuongColor,     bg: soLuongBg,     prefix: soLuongPrefix },
                                { label: "SAU",      value: item.soLuongSau ?? 0,   color: "text-slate-700", bg: "bg-white",    prefix: "" },
                            ].map(({ label, value, color, bg, prefix }) => (
                                <div key={label} className={`flex flex-col items-center py-4 ${bg}`}>
                                    <span className="mb-1 text-[10px] font-bold uppercase tracking-widest text-bo-muted">{label}</span>
                                    <span className={`text-xl font-bold ${color}`}>{prefix}{value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Ghi chú */}
                        {item.ghiChu && (
                            <div className="rounded-lg border border-bo-warning/20 bg-bo-warning-soft px-4 py-3">
                                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-bo-warning">Ghi chú</p>
                                <p className="text-sm text-slate-700">{item.ghiChu}</p>
                            </div>
                        )}

                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}

// ── Main Component ────────────────────────────────────────────────────────
export default function LichSuGiaoDichKhoList() {
    const [data,           setData]           = useState([]);
    const [loading,        setLoading]        = useState(true);
    const [search,         setSearch]         = useState("");
    const [filterLoai,     setFilterLoai]     = useState("all");
    const [pageNumber,     setPageNumber]      = useState(0);
    const [pageSize,       setPageSize]       = useState(10);
    const [selectedId,     setSelectedId]     = useState(null);
    const [chiTiet,        setChiTiet]        = useState(null);
    const [loadingDetail,  setLoadingDetail]  = useState(false);
    const [myWarehouseIds, setMyWarehouseIds] = useState([]);

    // Phân quyền — giống PhieuChuyenKhoDetail
    const role     = localStorage.getItem("role");
    const isAdmin  = role === "quan_tri_vien";
    const isQuanLy = role === "quan_ly_kho" || isAdmin;

    // ── Fetch ──────────────────────────────────────────────────────────
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const list = await getLichSuGiaoDichKho();
            setData(list);
            setPageNumber(0);
        } catch {
            toast.error("Không thể tải lịch sử giao dịch kho");
        } finally {
            setLoading(false);
        }
    }, []);

    // Lấy danh sách kho mình có quyền — cùng pattern PhieuChuyenKhoDetail
    const fetchMyWarehouses = useCallback(async () => {
        try {
            const listKho = await getMineKhoList();
            setMyWarehouseIds(listKho.map((k) => k.id));
        } catch (err) {
            console.error("Lỗi khi tải danh sách kho phân quyền:", err);
        }
    }, []);

    // Hoãn qua microtask để tránh setState đồng bộ trong effect
    // (react-hooks/set-state-in-effect); dữ liệu vẫn tải ngay khi mount.
    useEffect(() => {
        queueMicrotask(() => {
            fetchData();
            fetchMyWarehouses();
        });
    }, [fetchData, fetchMyWarehouses]);

    useEffect(() => { setPageNumber(0); }, [filterLoai, search]);

    // ── Filter ─────────────────────────────────────────────────────────
    // Phân quyền lọc danh sách: admin thấy tất, còn lại chỉ thấy kho mình có quyền
    const visibleData = useMemo(() => {
        if (isAdmin) return data;
        return data.filter((item) => myWarehouseIds.includes(item.khoId));
    }, [data, myWarehouseIds, isAdmin]);

    const filtered = useMemo(() => {
        return visibleData.filter((item) => {
            const q = search.toLowerCase().trim();
            const matchSearch = !q ||
                item.tenSanPham?.toLowerCase().includes(q) ||
                item.maSku?.toLowerCase().includes(q) ||
                item.maLo?.toLowerCase().includes(q) ||
                item.tenKho?.toLowerCase().includes(q) ||
                item.nguoiDungTen?.toLowerCase().includes(q);
            const matchLoai = filterLoai === "all" || item.loaiGiaoDich === filterLoai;
            return matchSearch && matchLoai;
        });
    }, [visibleData, search, filterLoai]);

    // ── Stats ──────────────────────────────────────────────────────────
    const stats = useMemo(() => ({
        nhap_kho:   visibleData.filter(i => i.loaiGiaoDich === "nhap_kho").length,
        xuat_kho:   visibleData.filter(i => i.loaiGiaoDich === "xuat_kho").length,
        chuyen_kho: visibleData.filter(i => i.loaiGiaoDich === "chuyen_kho").length,
        dieu_chinh: visibleData.filter(i => i.loaiGiaoDich === "dieu_chinh").length,
    }), [visibleData]);

    // ── Pagination ─────────────────────────────────────────────────────
    const totalElements = filtered.length;
    const totalPages    = Math.max(1, Math.ceil(totalElements / pageSize));
    const safePage      = Math.min(pageNumber, totalPages - 1);
    const pageItems     = filtered.slice(safePage * pageSize, (safePage + 1) * pageSize);
    const handlePageChange = (p) => { if (p >= 0 && p < totalPages) setPageNumber(p); };
    const handleReset = () => { setSearch(""); setFilterLoai("all"); };

    // ── Detail ─────────────────────────────────────────────────────────
    const handleViewDetail = async (item) => {
        // Phân quyền: admin luôn xem được; còn lại phải thuộc kho đó
        const hasPermission = isAdmin || myWarehouseIds.includes(item.khoId);
        if (!hasPermission) {
            toast.error("Bạn không có quyền xem chi tiết giao dịch này");
            return;
        }
        setSelectedId(item.id);
        setChiTiet(null);
        setLoadingDetail(true);
        try {
            const detail = await getChiTietLichSu(item.id);
            setChiTiet(detail);
        } catch {
            toast.error("Không thể tải chi tiết");
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleCloseModal = () => { setSelectedId(null); setChiTiet(null); };

    const currentLoaiLabel = LOAI_FILTER_OPTIONS.find(o => o.value === filterLoai)?.label ?? "Tất cả";

    return (
        <PageContainer className="space-y-5">

            <DetailModal open={!!selectedId} onClose={handleCloseModal} item={chiTiet} loading={loadingDetail} />

            {/* ── Stats ── */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {STAT_TILES.map(({ key, label, iconClass }) => (
                    <StatTile
                        key={key}
                        icon={createElement(LOAI_GIAO_DICH_CONFIG[key].icon, { className: "size-5" })}
                        iconClass={iconClass}
                        label={label}
                        value={stats[key]}
                    />
                ))}
            </section>

            {/* ── Filter bar ── */}
            <div className="overflow-hidden rounded-lg border border-bo-border bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-bo-border px-4 py-3 sm:px-5">
                    <div className="flex items-center gap-2">
                        <Filter className="size-4 text-bo-primary" />
                        <h2 className="text-sm font-semibold text-bo-foreground sm:text-base">
                            Bộ lọc tìm kiếm
                        </h2>
                    </div>
                    <span className="text-xs font-normal text-bo-muted">
                        {isAdmin ? "Hiển thị toàn bộ giao dịch" : isQuanLy ? "Kho bạn phụ trách" : "Giao dịch bạn thực hiện"}
                    </span>
                </div>
                <FilterBar
                    primary={
                        <SearchInput
                            label="Tìm kiếm"
                            placeholder="Tìm theo sản phẩm, SKU, lô, kho, người thực hiện..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onClear={() => setSearch("")}
                        />
                    }
                    filters={
                        <>
                            <DropdownMenu modal={false}>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="h-9 w-full justify-between gap-2 border-bo-border bg-white px-3 text-sm font-normal text-bo-foreground hover:bg-bo-surface-subtle sm:w-[220px]"
                                    >
                                        <span className="truncate">{currentLoaiLabel}</span>
                                        <ChevronDown className="size-4 shrink-0 opacity-70" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className={`${DROPDOWN_CONTENT_CLASS} w-[220px]`}>
                                    {LOAI_FILTER_OPTIONS.map((opt) => (
                                        <DropdownMenuItem
                                            key={opt.value}
                                            onClick={() => setFilterLoai(opt.value)}
                                            className={`${DROPDOWN_ITEM_CLASS} gap-2`}
                                        >
                                            {opt.value !== "all" && (
                                                <span className={`h-2 w-2 shrink-0 rounded-full ${LOAI_GIAO_DICH_CONFIG[opt.value]?.dot}`} />
                                            )}
                                            <span className="flex-1">{opt.label}</span>
                                            {filterLoai === opt.value && <Check className="size-4" />}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button
                                variant="outline"
                                onClick={handleReset}
                                className="h-9 gap-2 border-bo-border bg-white px-3 text-sm font-normal text-bo-foreground hover:bg-bo-surface-subtle"
                            >
                                <RefreshCcw className="size-4" />
                                Đặt lại
                            </Button>
                        </>
                    }
                />
            </div>

            {/* ── Table / Loading / Empty ── */}
            {loading ? (
                <div className="overflow-hidden rounded-lg border border-bo-border bg-white shadow-sm">
                    <LoadingState rows={6} label="Đang tải lịch sử giao dịch kho" />
                </div>
            ) : pageItems.length === 0 ? (
                <div className="overflow-hidden rounded-lg border border-bo-border bg-white shadow-sm">
                    <EmptyState
                        icon={History}
                        title="Không có giao dịch nào"
                        description="Chưa có dữ liệu phù hợp. Hãy thay đổi bộ lọc tìm kiếm."
                    />
                </div>
            ) : (
                <TableShell
                    title="Lịch sử giao dịch kho"
                    description={`Tổng ${totalElements} giao dịch`}
                    footer={totalElements > 0 ? (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                            {/* Page size */}
                            <div className="flex items-center gap-2">
                                <span className="whitespace-nowrap text-xs text-bo-muted">Hiển thị</span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="h-8 w-[110px] justify-between border-bo-border bg-white px-2.5 text-xs font-normal text-bo-foreground hover:bg-bo-surface-subtle"
                                        >
                                            {pageSize} dòng
                                            <ChevronDown className="size-3.5 opacity-60" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className={`${DROPDOWN_CONTENT_CLASS} w-[110px]`}>
                                        {PAGE_SIZE_OPTIONS.map((size) => (
                                            <DropdownMenuItem
                                                key={size}
                                                onClick={() => { setPageSize(size); setPageNumber(0); }}
                                                className="cursor-pointer rounded-md px-2.5 py-1.5 text-xs text-slate-700 focus:bg-slate-100 focus:text-slate-900"
                                            >
                                                {size} dòng
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Page info */}
                            <p className="text-xs text-bo-muted">
                                Hiển thị{" "}
                                <span className="font-semibold text-bo-foreground">{safePage * pageSize + 1}</span>
                                {" – "}
                                <span className="font-semibold text-bo-foreground">
                                    {Math.min((safePage + 1) * pageSize, totalElements)}
                                </span>
                                {" trong tổng số "}
                                <span className="font-semibold text-bo-primary">{totalElements}</span> kết quả
                            </p>

                            {/* Nav */}
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(safePage - 1)}
                                    disabled={safePage === 0}
                                    className="h-8 gap-1 border-bo-border bg-white px-2.5 text-xs text-bo-foreground hover:bg-bo-surface-subtle disabled:opacity-50"
                                >
                                    <ChevronLeft className="size-3.5" /> Trước
                                </Button>

                                <div className="hidden items-center gap-1 sm:flex">
                                    {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                                        let pageNum;
                                        if (totalPages <= 5)                pageNum = idx;
                                        else if (safePage < 3)              pageNum = idx;
                                        else if (safePage > totalPages - 4) pageNum = totalPages - 5 + idx;
                                        else                                pageNum = safePage - 2 + idx;
                                        return (
                                            <Button
                                                key={idx}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(pageNum)}
                                                className={
                                                    safePage === pageNum
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
                                    onClick={() => handlePageChange(safePage + 1)}
                                    disabled={safePage >= totalPages - 1}
                                    className="h-8 gap-1 border-bo-border bg-white px-2.5 text-xs text-bo-foreground hover:bg-bo-surface-subtle disabled:opacity-50"
                                >
                                    Sau <ChevronRight className="size-3.5" />
                                </Button>
                            </div>
                        </div>
                    ) : null}
                >
                    <table className="w-full min-w-[1080px] text-sm">
                        <thead>
                            <tr className="border-b border-bo-border bg-bo-surface-subtle">
                                {["STT", "Ngày giao dịch", "Loại", "Sản phẩm", "SKU", "Lô hàng", "Kho", "Số lượng", "Người thực hiện", ""].map((h, i) => (
                                    <th
                                        key={i}
                                        className={`${TH_CLASS} ${i === 9 ? "text-center" : "text-left"} ${i === 0 ? "w-14" : ""}`}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-bo-border">
                            {pageItems.map((item, index) => {
                                const soLuong = Number(item.soLuong);
                                const isXuatKho = item.loaiGiaoDich === "xuat_kho";
                                const displaySoLuong = isXuatKho ? -Math.abs(soLuong) : soLuong;
                                const soLuongColor =
                                    displaySoLuong > 0 ? "text-bo-success" :
                                    displaySoLuong < 0 ? "text-bo-danger" :
                                    "text-slate-700";
                                const soLuongPrefix = displaySoLuong > 0 ? "+" : displaySoLuong < 0 ? "-" : "";

                                return (
                                    <tr key={item.id} className="transition-colors hover:bg-bo-surface-subtle">

                                        <td className="px-4 py-3.5 align-middle text-xs text-bo-muted">
                                            {safePage * pageSize + index + 1}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3.5 align-middle">
                                            <span className="text-xs text-bo-muted">{formatDate(item.ngayGiaoDich)}</span>
                                        </td>

                                        <td className="px-4 py-3.5 align-middle">
                                            <LoaiBadge loai={item.loaiGiaoDich} />
                                        </td>

                                        <td className="max-w-[180px] px-4 py-3.5 align-middle">
                                            <span className="font-semibold leading-snug text-bo-foreground">
                                                {item.tenSanPham || "—"}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3.5 align-middle">
                                            <span className="rounded-md border border-bo-primary/20 bg-bo-primary-soft px-2 py-0.5 font-mono text-xs font-semibold text-bo-primary">
                                                {item.maSku || "—"}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3.5 align-middle">
                                            <span className="font-mono text-xs text-bo-muted">
                                                {item.maLo || "—"}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3.5 align-middle">
                                            <span className="font-medium text-bo-foreground">{item.tenKho || "—"}</span>
                                        </td>

                                        <td className="px-4 py-3.5 align-middle">
                                            <span className={`text-base font-bold ${soLuongColor}`}>
                                                {soLuongPrefix}{Math.abs(displaySoLuong)}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3.5 align-middle">
                                            <span className="font-medium text-bo-foreground">{item.nguoiDungTen || "—"}</span>
                                        </td>

                                        <td className="px-4 py-3.5 text-center align-middle">
                                            <ActionBtn title="Xem chi tiết" onClick={() => handleViewDetail(item)}>
                                                <Eye className="size-4" />
                                            </ActionBtn>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </TableShell>
            )}
        </PageContainer>
    );
}
