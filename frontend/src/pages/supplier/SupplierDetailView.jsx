// src/pages/supplier/SupplierDetailView.jsx
import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
    ArrowLeft, Edit, MapPin, Phone, Mail, User2, Clock, Calendar,
} from "lucide-react";
import { toast } from "sonner";

import PageContainer from "@/components/backoffice/PageContainer";
import PageHeader from "@/components/backoffice/PageHeader";
import LoadingState from "@/components/shared/LoadingState";
import StatusBadge from "@/components/shared/StatusBadge";
import SurfaceCard from "@/components/shared/SurfaceCard";
import { getSupplierById } from "@/services/supplierService";

// ── Info field — hiển thị label + value dạng readonly ────────────────────
function InfoField({ label, children, value }) {
    return (
        <div className="flex flex-col gap-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-bo-muted">{label}</p>
            <div className="flex flex-1 items-start">
                {children ?? (
                    <p className="text-sm font-medium text-bo-foreground">{value || "—"}</p>
                )}
            </div>
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────
export default function SupplierDetailView() {
    const { id }      = useParams();
    const navigate    = useNavigate();
    const [supplier, setSupplier] = useState(null);
    const [loading,  setLoading]  = useState(true);

    const fetchSupplier = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getSupplierById(id);
            setSupplier(data);
        } catch (error) {
            toast.error(error.response?.data?.message || "Không thể tải thông tin nhà cung cấp");
            navigate("/supplier");
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    // Hoãn qua microtask để tránh setState đồng bộ trong effect
    // (react-hooks/set-state-in-effect); request vẫn chạy ngay khi mount.
    useEffect(() => { queueMicrotask(() => fetchSupplier()); }, [fetchSupplier]);

    const formatDate = (dateString) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleString("vi-VN", {
            year: "numeric", month: "2-digit", day: "2-digit",
            hour: "2-digit", minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <PageContainer>
                <div className="overflow-hidden rounded-lg border border-bo-border bg-white shadow-sm">
                    <LoadingState rows={4} label="Đang tải thông tin nhà cung cấp" />
                </div>
            </PageContainer>
        );
    }

    if (!supplier) return null;

    return (
        <PageContainer className="space-y-5">
            {/* ── Page header ── */}
            <PageHeader
                title="Chi tiết nhà cung cấp"
                description="Thông tin hồ sơ, liên hệ và trạng thái hợp tác của nhà cung cấp"
                actions={
                    <>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/supplier")}
                            className="gap-1.5 border-bo-border bg-white text-bo-foreground hover:bg-bo-surface-subtle"
                        >
                            <ArrowLeft className="size-4" />
                            Quay lại danh sách
                        </Button>
                        <Button
                            onClick={() => navigate(`/supplier/${id}`)}
                            className="gap-1.5 bg-bo-primary text-white hover:bg-bo-primary-hover"
                        >
                            <Edit className="size-4" />
                            Chỉnh sửa
                        </Button>
                    </>
                }
            />

            {/* ── Row 1: Định danh ── */}
            <SurfaceCard title="Thông tin cơ bản">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <InfoField label="Mã định danh">
                        <span className="rounded-md border border-bo-border bg-bo-surface-subtle px-2 py-1 font-mono text-sm font-semibold text-bo-foreground">
                            {supplier.maNhaCungCap || "—"}
                        </span>
                    </InfoField>
                    <InfoField label="Tên nhà cung cấp" value={supplier.tenNhaCungCap} />
                    <InfoField label="Trạng thái hoạt động">
                        <StatusBadge
                            label={supplier.trangThai === 1 ? "Hoạt động" : "Ngừng hoạt động"}
                            tone={supplier.trangThai === 1 ? "success" : "neutral"}
                        />
                    </InfoField>
                </div>
            </SurfaceCard>

            {/* ── Row 2: Liên hệ + Địa chỉ & Hệ thống ── */}
            <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">

                {/* Liên hệ */}
                <SurfaceCard title="Thông tin liên hệ" className="h-full">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <InfoField label="Người đại diện">
                            <div className="flex items-center gap-2">
                                <User2 className="size-4 shrink-0 text-slate-400" />
                                <span className="text-sm font-medium text-bo-foreground">
                                    {supplier.nguoiLienHe || "—"}
                                </span>
                            </div>
                        </InfoField>
                        <InfoField label="Số điện thoại hotline">
                            <div className="flex items-center gap-2">
                                <Phone className="size-4 shrink-0 text-slate-400" />
                                <span className="font-mono text-sm font-medium text-bo-foreground">
                                    {supplier.soDienThoai || "—"}
                                </span>
                            </div>
                        </InfoField>
                    </div>
                    <InfoField label="Email liên hệ chính">
                        <div className="flex items-center gap-2">
                            <Mail className="size-4 shrink-0 text-slate-400" />
                            <span className="text-sm font-medium text-bo-foreground">
                                {supplier.email || "—"}
                            </span>
                        </div>
                    </InfoField>
                </SurfaceCard>

                {/* Địa chỉ + Hệ thống xếp chồng */}
                <div className="flex flex-col gap-5">

                    {/* Địa chỉ */}
                    <SurfaceCard title="Địa điểm">
                        <InfoField label="Địa chỉ trụ sở chính / Kho">
                            <div className="flex items-start gap-2">
                                <MapPin className="mt-0.5 size-4 shrink-0 text-slate-400" />
                                <p className="text-sm font-medium leading-relaxed text-bo-foreground">
                                    {supplier.diaChi || "—"}
                                </p>
                            </div>
                        </InfoField>
                    </SurfaceCard>

                    {/* Thông tin hệ thống */}
                    <SurfaceCard title="Thông tin hệ thống" className="bg-bo-surface-subtle">
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <InfoField label="Ngày tạo">
                                <div className="flex items-center gap-2">
                                    <Calendar className="size-4 shrink-0 text-slate-400" />
                                    <span className="text-sm font-medium text-slate-700">
                                        {formatDate(supplier.ngayTao)}
                                    </span>
                                </div>
                            </InfoField>
                            <InfoField label="Cập nhật lần cuối">
                                <div className="flex items-center gap-2">
                                    <Clock className="size-4 shrink-0 text-slate-400" />
                                    <span className="text-sm font-medium text-slate-700">
                                        {formatDate(supplier.ngayCapNhat)}
                                    </span>
                                </div>
                            </InfoField>
                        </div>
                    </SurfaceCard>

                </div>
            </div>
        </PageContainer>
    );
}
