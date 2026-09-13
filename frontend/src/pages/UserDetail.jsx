import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { nguoiDungService } from "@/services/nguoiDungService";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import EmptyState from "@/components/shared/EmptyState";
import PageContainer from "@/components/backoffice/PageContainer";

import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    Clock3,
    Edit,
    IdCard,
    Mail,
    Phone,
    Save,
    Shield,
    User,
    UserCog,
    X,
    AlertCircle,
} from "lucide-react";

export default function UserDetail() {
    const { id } = useParams(); // string
    const navigate = useNavigate();

    // UI state
    const [loadingUser, setLoadingUser] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // User data
    const [userData, setUserData] = useState({
        id: null,
        tenDangNhap: "",
        hoTen: "",
        email: "",
        soDienThoai: "",
        vaiTro: "",
        trangThai: 0,
        ngayTao: "",
        ngayCapNhat: "",
    });

    const [editedData, setEditedData] = useState({ ...userData });

    const vaiTroOptions = useMemo(
        () => [
            { value: "quan_tri_vien", label: "Quản trị viên" },
            { value: "quan_ly_kho", label: "Quản lý kho" },
            { value: "nhan_vien_kho", label: "Nhân viên kho" },
            { value: "nhan_vien_ban_hang", label: "Nhân viên bán hàng" },
            { value: "nhan_vien_mua_hang", label: "Nhân viên mua hàng" },
            { value: "khach_hang", label: "Khách hàng" },
        ],
        []
    );

    const getVaiTroLabel = (value) => vaiTroOptions.find((opt) => opt.value === value)?.label || value || "—";
    const isActive = useMemo(() => Number(userData.trangThai) === 1, [userData.trangThai]);

    const initials = useMemo(() => {
        const name = userData.hoTen?.trim();
        if (!name) return "U";
        const parts = name.split(/\s+/).slice(0, 2);
        return parts.map((p) => p[0]?.toUpperCase()).join("") || "U";
    }, [userData.hoTen]);

    const formatDateTime = (iso) => {
        if (!iso) return "—";
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return iso;
        return d.toLocaleString();
    };

    // ===== Fetch user =====
    useEffect(() => {
        const fetchUser = async () => {
            if (!id) return;
            setErrorMsg("");
            setLoadingUser(true);

            try {
                const res = await nguoiDungService.getById(id);
                const dto = res?.data; // ResponseData.data
                if (!dto) throw new Error("Không nhận được data người dùng từ server");

                setUserData(dto);
                setEditedData(dto);
            } catch (err) {
                const msg = err?.response?.data?.message || err?.message || "Lỗi tải dữ liệu người dùng";
                setErrorMsg(msg);
            } finally {
                setLoadingUser(false);
            }
        };

        fetchUser();
    }, [id]);

    // ===== Edit handlers =====
    const handleEdit = () => {
        setIsEditing(true);
        setEditedData({ ...userData });
        setErrorMsg("");
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedData({ ...userData });
        setErrorMsg("");
    };

    const handleInputChange = (field, value) => {
        setEditedData((prev) => ({ ...prev, [field]: value }));
    };

    // ✅ build body theo UpdateNguoiDungRequest (id bắt buộc)
    const buildUpdatePayload = () => ({
        id: Number(userData.id), // hoặc Number(id)
        tenDangNhap: editedData.tenDangNhap?.trim(),
        hoTen: editedData.hoTen?.trim(),
        email: editedData.email?.trim(),
        soDienThoai: editedData.soDienThoai?.trim(),
    });

    const handleSave = async () => {
        if (!userData?.id) return;

        setSaving(true);
        setErrorMsg("");

        try {
            const payload = buildUpdatePayload();

            // validate FE nhẹ
            if (!payload.tenDangNhap) throw new Error("Tên đăng nhập không được để trống");
            if (!payload.hoTen) throw new Error("Họ tên không được để trống");
            if (editedData.password && editedData.password.length < 6) {
                throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự");
            }

            // 1. Update info
            const res = await nguoiDungService.updateUser(payload);
            const updatedDto = res?.data; // ResponseData.data
            if (!updatedDto) throw new Error("Cập nhật thành công nhưng response thiếu data");

            // 2. Change password if entered
            if (editedData.password && editedData.password.trim().length > 0) {
                // Assuming BE needs { id, password } or similar
                await nguoiDungService.changePassword({
                    id: Number(userData.id),
                    password: editedData.password.trim()
                });
            }

            setUserData(updatedDto);
            // reset editedData, clear password
            setEditedData({ ...updatedDto, password: "" });
            setIsEditing(false);

            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2500);
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || "Cập nhật thất bại";
            setErrorMsg(msg);
        } finally {
            setSaving(false);
        }
    };

    const quickStats = [
        { icon: <UserCog className="h-4 w-4 text-bo-primary" />, label: "Vai trò", value: getVaiTroLabel(userData.vaiTro) },
        { icon: <Shield className="h-4 w-4 text-bo-primary" />, label: "Trạng thái", value: isActive ? "Đang hoạt động" : "Không hoạt động" },
        { icon: <IdCard className="h-4 w-4 text-bo-primary" />, label: "Mã người dùng", value: userData.id ?? "—" },
        { icon: <Clock3 className="h-4 w-4 text-bo-primary" />, label: "Cập nhật gần nhất", value: formatDateTime(userData.ngayCapNhat) },
    ];

    return (
        <PageContainer className="mx-auto max-w-5xl space-y-5">
                {/* Header */}
                <div className="rounded-lg border border-bo-border bg-bo-surface p-4 shadow-sm sm:p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-4">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => navigate(-1)}
                                className="shrink-0 border-bo-border bg-white text-bo-muted hover:bg-bo-surface-subtle hover:text-bo-foreground"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-wide text-bo-primary">Tài khoản / Hồ sơ</p>
                                <h1 className="text-xl font-bold text-bo-foreground sm:text-2xl">Chi tiết người dùng</h1>
                                <p className="mt-1 text-sm text-bo-muted">Quản lý thông tin tài khoản và lịch sử thay đổi</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {!isEditing ? (
                                <Button
                                    onClick={handleEdit}
                                    disabled={loadingUser}
                                    className="bg-bo-primary text-white hover:bg-bo-primary-hover"
                                >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Chỉnh sửa
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={handleCancel}
                                        disabled={saving}
                                        className="border-bo-border bg-white text-bo-foreground hover:bg-bo-surface-subtle"
                                    >
                                        <X className="mr-2 h-4 w-4" />
                                        Hủy
                                    </Button>
                                    <Button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="bg-bo-primary text-white hover:bg-bo-primary-hover"
                                    >
                                        <Save className="mr-2 h-4 w-4" />
                                        {saving ? "Đang lưu..." : "Lưu thay đổi"}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {quickStats.map((item) => (
                        <OverviewTile
                            key={item.label}
                            icon={item.icon}
                            label={item.label}
                            value={item.value}
                        />
                    ))}
                </div>

                {/* Alerts */}
                {showSuccess && (
                    <Alert className="border-bo-success/30 bg-bo-success-soft">
                        <CheckCircle2 className="h-4 w-4 text-bo-success" />
                        <AlertDescription className="text-bo-success">
                            Cập nhật thông tin người dùng thành công!
                        </AlertDescription>
                    </Alert>
                )}

                {errorMsg && (
                    <Alert className="border-bo-danger/30 bg-bo-danger-soft">
                        <AlertCircle className="h-4 w-4 text-bo-danger" />
                        <AlertDescription className="text-bo-danger">{errorMsg}</AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-3">
                    {/* Left - Summary */}
                    <div className="space-y-5 lg:col-span-1">
                        <div className="overflow-hidden rounded-lg border border-bo-border bg-bo-surface shadow-sm">
                            <div className="flex flex-col items-center p-6 text-center">
                                <Avatar className="mb-4 h-24 w-24">
                                    <AvatarFallback className="bg-bo-primary-soft text-2xl font-bold text-bo-primary">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>

                                <h3 className="break-all text-xl font-bold text-bo-foreground">
                                    {loadingUser ? "Loading..." : userData.hoTen || "—"}
                                </h3>

                                <p className="mb-2 text-bo-muted">@{userData.tenDangNhap || "—"}</p>

                                <Badge variant="outline" className="mb-4 border-bo-border bg-bo-surface-subtle text-bo-foreground">
                                    <Shield className="mr-1 h-3 w-3" />
                                    {getVaiTroLabel(userData.vaiTro)}
                                </Badge>

                                <div className="mb-6 flex items-center gap-2">
                                    <div className={`h-2 w-2 rounded-full ${isActive ? "bg-bo-success" : "bg-slate-400"}`} />
                                    <span className={`text-sm font-medium ${isActive ? "text-bo-success" : "text-bo-muted"}`}>
                                        {isActive ? "Đang hoạt động" : "Không hoạt động"}
                                    </span>
                                </div>

                                <div className="w-full space-y-3 border-t border-bo-border pt-4 text-left">
                                    <div className="flex items-center gap-2 text-sm text-bo-muted">
                                        <Calendar className="h-4 w-4" />
                                        <span>Ngày tạo: {formatDateTime(userData.ngayTao)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-bo-muted">
                                        <Clock className="h-4 w-4" />
                                        <span>Cập nhật: {formatDateTime(userData.ngayCapNhat)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-bo-border bg-bo-surface shadow-sm">
                            <div className="border-b border-bo-border px-4 py-3">
                                <h2 className="text-sm font-semibold text-bo-foreground">Thông tin hệ thống</h2>
                                <p className="mt-0.5 text-xs text-bo-muted">Thông tin quan trọng</p>
                            </div>
                            <div className="space-y-2 p-4 text-sm text-bo-foreground">
                                <div className="flex justify-between gap-3">
                                    <span className="text-bo-muted">ID</span>
                                    <span className="font-medium">{userData.id ?? "—"}</span>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <span className="text-bo-muted">Vai trò</span>
                                    <span className="text-right font-medium">{getVaiTroLabel(userData.vaiTro)}</span>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <span className="text-bo-muted">Trạng thái</span>
                                    <span className="font-medium">{isActive ? "Hoạt động" : "Không hoạt động"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right - Tabs */}
                    <div className="lg:col-span-2">
                        <Tabs defaultValue="info" className="space-y-4">
                            <TabsList className="grid w-full grid-cols-2 rounded-lg border border-bo-border bg-bo-surface-subtle">
                                <TabsTrigger
                                    value="info"
                                    className="data-[state=active]:bg-white data-[state=active]:text-bo-foreground data-[state=active]:shadow-sm"
                                >
                                    Thông tin
                                </TabsTrigger>
                                <TabsTrigger
                                    value="activity"
                                    className="data-[state=active]:bg-white data-[state=active]:text-bo-foreground data-[state=active]:shadow-sm"
                                >
                                    Hoạt động
                                </TabsTrigger>
                            </TabsList>

                            {/* Tab: Thông tin */}
                            <TabsContent value="info">
                                <div className="overflow-hidden rounded-lg border border-bo-border bg-bo-surface shadow-sm">
                                    <div className="border-b border-bo-border px-4 py-3">
                                        <h2 className="text-sm font-semibold text-bo-foreground">Thông tin người dùng</h2>
                                    </div>

                                    <div className="space-y-6 p-4 sm:p-5">
                                        {/* tenDangNhap */}
                                        <div className="space-y-2">
                                            <Label htmlFor="tenDangNhap" className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-bo-muted" />
                                                Tên đăng nhập
                                            </Label>
                                            <Input
                                                id="tenDangNhap"
                                                value={userData.tenDangNhap}
                                                readOnly
                                                disabled
                                                className="border-bo-border bg-bo-surface-subtle text-bo-foreground"
                                            />
                                        </div>

                                        {/* hoTen */}
                                        <div className="space-y-2">
                                            <Label htmlFor="hoTen">Họ và tên</Label>
                                            <Input
                                                id="hoTen"
                                                value={isEditing ? editedData.hoTen : userData.hoTen}
                                                onChange={(e) => handleInputChange("hoTen", e.target.value)}
                                                disabled={!isEditing || loadingUser}
                                                className={!isEditing
                                                    ? "border-bo-border bg-bo-surface-subtle text-bo-foreground"
                                                    : "border-bo-border bg-white text-bo-foreground focus-visible:border-bo-primary focus-visible:ring-bo-primary/20"}
                                            />
                                        </div>

                                        {/* email */}
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-bo-muted" />
                                                Email
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={userData.email}
                                                readOnly
                                                disabled
                                                className="border-bo-border bg-bo-surface-subtle text-bo-foreground"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="soDienThoai" className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-bo-muted" />
                                                Số điện thoại
                                            </Label>
                                            <Input
                                                id="soDienThoai"
                                                value={isEditing ? editedData.soDienThoai : userData.soDienThoai}
                                                onChange={(e) => handleInputChange("soDienThoai", e.target.value)}
                                                disabled={!isEditing || loadingUser}
                                                className={!isEditing
                                                    ? "border-bo-border bg-bo-surface-subtle text-bo-foreground"
                                                    : "border-bo-border bg-white text-bo-foreground focus-visible:border-bo-primary focus-visible:ring-bo-primary/20"}
                                            />
                                        </div>

                                        {/* password - only writable in edit mode */}
                                        <div className="space-y-2">
                                            <Label htmlFor="password" className="flex items-center gap-2">
                                                <Shield className="h-4 w-4 text-bo-muted" />
                                                Mật khẩu
                                            </Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                value={isEditing ? (editedData.password || "") : "********"}
                                                placeholder={isEditing ? "Nhập mật khẩu mới" : ""}
                                                onChange={(e) => handleInputChange("password", e.target.value)}
                                                disabled={!isEditing || loadingUser}
                                                className={!isEditing
                                                    ? "border-bo-border bg-bo-surface-subtle text-bo-foreground"
                                                    : "border-bo-border bg-white text-bo-foreground focus-visible:border-bo-primary focus-visible:ring-bo-primary/20"}
                                            />
                                        </div>

                                        {/* read-only fields */}
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label>Vai trò</Label>
                                                <Input value={getVaiTroLabel(userData.vaiTro)} disabled className="border-bo-border bg-bo-surface-subtle text-bo-foreground" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Trạng thái</Label>
                                                <Input value={isActive ? "Hoạt động" : "Không hoạt động"} disabled className="border-bo-border bg-bo-surface-subtle text-bo-foreground" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Tab: Hoạt động */}
                            <TabsContent value="activity">
                                <div className="overflow-hidden rounded-lg border border-bo-border bg-bo-surface shadow-sm">
                                    <div className="border-b border-bo-border px-4 py-3">
                                        <h2 className="text-sm font-semibold text-bo-foreground">Lịch sử hoạt động</h2>
                                    </div>

                                    <EmptyState
                                        title="Chưa có hoạt động"
                                        description="Lịch sử hoạt động của tài khoản sẽ hiển thị tại đây khi có dữ liệu."
                                    />
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
        </PageContainer>
    );
}

function OverviewTile({ icon, label, value }) {
    return (
        <div className="rounded-lg border border-bo-border bg-bo-surface px-4 py-3 shadow-sm">
            <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-bo-primary-soft">
                {icon}
            </div>
            <p className="text-[11px] uppercase tracking-wide text-bo-muted">{label}</p>
            <p className="mt-1 break-words text-sm font-semibold text-bo-foreground">{value}</p>
        </div>
    );
}
