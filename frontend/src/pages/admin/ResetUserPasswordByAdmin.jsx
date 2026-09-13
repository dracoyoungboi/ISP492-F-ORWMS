import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageContainer from "@/components/backoffice/PageContainer";
import SurfaceCard from "@/components/shared/SurfaceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";
import { KeyRound, ArrowLeft } from "lucide-react";

export default function ResetUserPasswordByAdmin() {

    const { id } = useParams();
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [loadingUser, setLoadingUser] = useState(true);

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!password || !confirmPassword) {
            toast.error("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp");
            return;
        }

        try {
            setLoading(true);
            await adminService.resetUserPasswordByAdmin(id, {
                newPassword: password
            });

            toast.success("Reset mật khẩu thành công");
            navigate("/users");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const result = await adminService.getByIdByAdmin(id);

                setUsername(result.data.tenDangNhap);

            } catch {

                toast.error("Không lấy được thông tin người dùng");
            } finally {
                setLoadingUser(false);
            }
        };

        fetchUser();
    }, [id]);

    return (
        <PageContainer className="mx-auto max-w-3xl">
            <div className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-bo-border bg-bo-surface p-4 shadow-sm sm:p-5">
                <div className="min-w-0">
                    <h1 className="text-lg font-bold text-bo-foreground">Cấp lại mật khẩu</h1>
                    <p className="mt-1 text-sm text-bo-muted">
                        Đặt mật khẩu mới cho người dùng{" "}
                        <span className="font-semibold text-bo-foreground">
                            {loadingUser ? "..." : username}
                        </span>
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    className="shrink-0 border-bo-border bg-white text-bo-foreground hover:bg-bo-surface-subtle"
                    onClick={() => navigate("/users")}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại
                </Button>
            </div>

            <SurfaceCard>
                <div className="flex items-center justify-center">
                    <div className="inline-flex size-12 items-center justify-center rounded-full bg-bo-primary-soft text-bo-primary">
                        <KeyRound className="size-5" />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-5 space-y-5">
                    <div className="space-y-2">
                        <Label className="font-medium text-bo-foreground">Mật khẩu mới</Label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Nhập mật khẩu mới"
                            className="h-10 border-bo-border bg-white focus-visible:border-bo-primary focus-visible:ring-bo-primary/20"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="font-medium text-bo-foreground">Xác nhận mật khẩu</Label>
                        <Input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Nhập lại mật khẩu"
                            className="h-10 border-bo-border bg-white focus-visible:border-bo-primary focus-visible:ring-bo-primary/20"
                        />
                    </div>

                    <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            className="border-bo-border bg-white text-bo-foreground hover:bg-bo-surface-subtle"
                            onClick={() => navigate("/users")}
                        >
                            Hủy thao tác
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-bo-primary text-white hover:bg-bo-primary-hover"
                        >
                            {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                        </Button>
                    </div>
                </form>
            </SurfaceCard>
        </PageContainer>
    );
}
