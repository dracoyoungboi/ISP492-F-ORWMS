// src/pages/stock-take/StockTakeList.jsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from "@/components/backoffice/PageContainer";
import FilterBar from "@/components/shared/FilterBar";
import SearchInput from "@/components/shared/SearchInput";
import TableShell from "@/components/shared/TableShell";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import LoadingState from "@/components/shared/LoadingState";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus, Eye, ClipboardList, ChevronDown, ChevronLeft,
  ChevronRight, Filter, RefreshCcw, Play,
  Package, CheckCircle2, Clock, Warehouse,
} from "lucide-react";
import { toast } from "sonner";
import { getStockTakes } from "@/services/stockTakeService";

// ── Trạng thái ────────────────────────────────────────────────────────────
const TRANG_THAI = {
  0: { label: "Đang kiểm kê", tone: "warning" },
  1: { label: "Hoàn thành", tone: "success" },
};

const FILTER_OPTIONS = [
  { value: "all",     label: "Tất cả trạng thái" },
  { value: "ongoing", label: "Đang kiểm kê" },
  { value: "done",    label: "Hoàn thành" },
];

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
const TH_CLASS =
  "h-10 px-4 text-[11px] font-semibold uppercase tracking-wide text-bo-muted whitespace-nowrap";
const DROPDOWN_CONTENT_CLASS =
  "backoffice-user-menu z-50 rounded-lg border border-bo-border bg-white p-1 shadow-lg";
const DROPDOWN_ITEM_CLASS =
  "cursor-pointer rounded-md px-2.5 py-1.5 text-sm text-slate-700 focus:bg-slate-100 focus:text-slate-900";

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

// ── Main component ────────────────────────────────────────────────────────
export default function StockTakeList() {
  const navigate = useNavigate();

  const [stockTakes,   setStockTakes]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [searchTerm,   setSearchTerm]   = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [pageNumber,   setPageNumber]   = useState(0);
  const [pageSize,     setPageSize]     = useState(10);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getStockTakes();
      setStockTakes(data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể tải danh sách kiểm kê");
    } finally {
      setLoading(false);
    }
  }, []);

  // Hoãn qua microtask để tránh setState đồng bộ trong effect
  // (react-hooks/set-state-in-effect); dữ liệu vẫn tải ngay khi mount.
  useEffect(() => {
    queueMicrotask(() => fetchData());
  }, [fetchData]);

  // Reset về trang 0 khi filter/search thay đổi
  useEffect(() => { setPageNumber(0); }, [searchTerm, filterStatus]);

  const handleReset = () => {
    setSearchTerm("");
    setFilterStatus("all");
  };

  // ── Client-side filter ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return stockTakes.filter((item) => {
      const matchSearch =
        !searchTerm.trim() ||
        item.maDotKiemKe?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tenDotKiemKe?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.kho?.tenKho?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        filterStatus === "all" ||
        (filterStatus === "ongoing" && item.trangThai === 0) ||
        (filterStatus === "done"    && item.trangThai === 1);

      return matchSearch && matchStatus;
    });
  }, [stockTakes, searchTerm, filterStatus]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const ongoing = filtered.filter((i) => i.trangThai === 0).length;
    const done = filtered.filter((i) => i.trangThai === 1).length;
    const warehouses = new Set(
      filtered
        .map((i) => i.kho?.id ?? i.kho?.tenKho)
        .filter(Boolean)
    ).size;
    return { total, ongoing, done, warehouses };
  }, [filtered]);

  // ── Pagination ────────────────────────────────────────────────────────
  const totalElements = filtered.length;
  const totalPages    = Math.max(1, Math.ceil(totalElements / pageSize));
  const safePage      = Math.min(pageNumber, totalPages - 1);
  const pageItems     = filtered.slice(safePage * pageSize, (safePage + 1) * pageSize);

  const handlePageChange = (p) => {
    if (p >= 0 && p < totalPages) setPageNumber(p);
  };

  const currentFilterLabel = FILTER_OPTIONS.find(o => o.value === filterStatus)?.label ?? "Tất cả trạng thái";

  return (
    <PageContainer className="space-y-5">

      {/* ── Stats ── */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          icon={<Package className="size-5" />}
          iconClass="bg-bo-primary-soft text-bo-primary"
          label="Tổng đợt kiểm kê"
          value={stats.total}
        />
        <StatTile
          icon={<Clock className="size-5" />}
          iconClass="bg-bo-warning-soft text-bo-warning"
          label="Đang kiểm kê"
          value={stats.ongoing}
        />
        <StatTile
          icon={<CheckCircle2 className="size-5" />}
          iconClass="bg-bo-success-soft text-bo-success"
          label="Hoàn thành"
          value={stats.done}
        />
        <StatTile
          icon={<Warehouse className="size-5" />}
          iconClass="bg-purple-50 text-purple-600"
          label="Kho tham gia"
          value={stats.warehouses}
        />
      </section>

      {/* ── Filter bar ── */}
      <div className="overflow-hidden rounded-lg border border-bo-border bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-bo-border px-4 py-3 sm:px-5">
          <Filter className="size-4 text-bo-primary" />
          <h2 className="text-sm font-semibold text-bo-foreground sm:text-base">
            Bộ lọc tìm kiếm
          </h2>
        </div>
        <FilterBar
          primary={
            <SearchInput
              placeholder="Tìm theo mã đợt, tên đợt, kho..."
              label="Tìm kiếm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm("")}
            />
          }
          filters={
            <>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-9 w-full justify-between gap-2 border-bo-border bg-white px-3 text-sm font-normal text-bo-foreground hover:bg-bo-surface-subtle sm:w-[200px]"
                  >
                    <span className="truncate">{currentFilterLabel}</span>
                    <ChevronDown className="size-4 shrink-0 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className={`${DROPDOWN_CONTENT_CLASS} w-[200px]`}>
                  {FILTER_OPTIONS.map((opt) => (
                    <DropdownMenuItem
                      key={opt.value}
                      onClick={() => setFilterStatus(opt.value)}
                      className={DROPDOWN_ITEM_CLASS}
                    >
                      {opt.label}
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
          actions={
            <Button
              onClick={() => navigate("/stock-take/new")}
              className="h-9 gap-2 bg-bo-primary text-white hover:bg-bo-primary-hover"
            >
              <Plus className="size-4" />
              Tạo đợt kiểm kê
            </Button>
          }
        />
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="overflow-hidden rounded-lg border border-bo-border bg-white shadow-sm">
          <LoadingState rows={6} label="Đang tải danh sách đợt kiểm kê" />
        </div>
      ) : pageItems.length === 0 ? (
        <div className="overflow-hidden rounded-lg border border-bo-border bg-white shadow-sm">
          <EmptyState
            icon={ClipboardList}
            title="Chưa có đợt kiểm kê nào"
            description="Hãy tạo đợt kiểm kê đầu tiên để bắt đầu theo dõi tồn kho thực tế."
            action={
              <Button
                onClick={() => navigate("/stock-take/new")}
                className="gap-2 bg-bo-primary text-white hover:bg-bo-primary-hover"
              >
                <Plus className="size-4" />
                Tạo đợt đầu tiên
              </Button>
            }
          />
        </div>
      ) : (
        <TableShell
          title="Danh sách đợt kiểm kê"
          description={`Tổng ${totalElements} đợt kiểm kê`}
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
          <table className="w-full min-w-[1020px] text-sm">
            <thead>
              <tr className="border-b border-bo-border bg-bo-surface-subtle">
                <th className={`${TH_CLASS} w-14 text-center`}>STT</th>
                <th className={`${TH_CLASS} text-left`}>Mã đợt</th>
                <th className={`${TH_CLASS} text-left`}>Tên đợt</th>
                <th className={`${TH_CLASS} text-left`}>Kho</th>
                <th className={`${TH_CLASS} text-left`}>Người chủ trì</th>
                <th className={`${TH_CLASS} text-left`}>Ngày bắt đầu</th>
                <th className={`${TH_CLASS} text-left`}>Trạng thái</th>
                <th className={`${TH_CLASS} text-left`}>Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bo-border">
              {pageItems.map((item, index) => {
                const tt        = TRANG_THAI[item.trangThai] ?? TRANG_THAI[0];
                const isOngoing = item.trangThai === 0;
                return (
                  <tr key={item.id} className="transition-colors hover:bg-bo-surface-subtle">

                    <td className="px-4 py-3.5 text-center align-middle text-xs text-bo-muted">
                      {safePage * pageSize + index + 1}
                    </td>

                    {/* Mã đợt */}
                    <td className="px-4 py-3.5 align-middle">
                      <span className="rounded-md bg-bo-primary-soft px-2 py-0.5 font-mono text-xs font-semibold tracking-wide text-bo-primary">
                        {item.maDotKiemKe}
                      </span>
                    </td>

                    {/* Tên đợt */}
                    <td className="max-w-[200px] px-4 py-3.5 align-middle">
                      <span className="font-semibold leading-snug text-bo-foreground">
                        {item.tenDotKiemKe || "—"}
                      </span>
                    </td>

                    {/* Kho */}
                    <td className="px-4 py-3.5 align-middle">
                      <span className="font-medium text-bo-foreground">
                        {item.kho?.tenKho || "—"}
                      </span>
                    </td>

                    {/* Người chủ trì */}
                    <td className="px-4 py-3.5 align-middle">
                      <span className="font-medium text-bo-foreground">
                        {item.nguoiChuTri?.hoTen || "—"}
                      </span>
                    </td>

                    {/* Ngày bắt đầu */}
                    <td className="px-4 py-3.5 align-middle">
                      <span className="text-xs text-bo-muted">
                        {item.ngayBatDau
                          ? new Date(item.ngayBatDau).toLocaleDateString("vi-VN")
                          : "—"}
                      </span>
                    </td>

                    {/* Trạng thái */}
                    <td className="px-4 py-3.5 align-middle">
                      <StatusBadge label={tt.label} tone={tt.tone} />
                    </td>

                    {/* Thao tác */}
                    <td className="px-4 py-3.5 align-middle">
                      <button
                        type="button"
                        title={isOngoing ? "Tiếp tục" : "Xem chi tiết"}
                        aria-label={isOngoing ? "Tiếp tục đợt kiểm kê" : "Xem chi tiết đợt kiểm kê"}
                        onClick={() => navigate(`/stock-take/${item.id}`)}
                        className={`inline-flex size-8 items-center justify-center rounded-md border transition-colors ${isOngoing
                          ? "border-bo-primary/30 bg-bo-primary-soft text-bo-primary hover:bg-bo-primary-soft/70"
                          : "border-bo-border bg-white text-bo-muted hover:border-bo-primary hover:text-bo-primary"
                          }`}
                      >
                        {isOngoing ? (
                          <Play className="size-3.5 fill-current" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
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
