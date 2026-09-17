import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { toast } from "sonner";
import { nguoiDungService } from "../../services/nguoiDungService";
import LoadingState from "../shared/LoadingState";

// Bảo vệ các trang nội bộ: chưa đăng nhập (không có access_token) thì đưa về trang đăng nhập.
// Có token thì xác thực lại phiên qua /me — tài khoản bị khóa giữa phiên sẽ bị chặn trước khi render nội dung.
export default function ProtectedRoute() {
    const token = localStorage.getItem("access_token");
    const [verified, setVerified] = useState(false);

    useEffect(() => {
        if (!token) {
            // id cố định để StrictMode mount 2 lần không hiện toast trùng
            toast.warning("Bạn cần đăng nhập trước để truy cập trang này", {
                id: "auth-required",
            });
            return;
        }
        let cancelled = false;
        nguoiDungService
            .getMe()
            .then(() => {
                if (!cancelled) setVerified(true);
            })
            .catch((err) => {
                // ACCOUNT_DISABLED: apiClient đã xóa session + redirect — giữ loading, không render nội dung
                // Lỗi khác (mạng, 500): fail-open để không khóa ứng dụng
                if (!cancelled && err?.response?.data?.error !== "ACCOUNT_DISABLED") {
                    setVerified(true);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [token]);

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (!verified) {
        return <LoadingState rows={4} label="Đang xác thực phiên đăng nhập" className="p-6" />;
    }

    return <Outlet />;
}
