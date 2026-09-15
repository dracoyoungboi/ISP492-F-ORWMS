import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { toast } from "sonner";

// Bảo vệ các trang nội bộ: chưa đăng nhập (không có access_token) thì đưa về trang đăng nhập
export default function ProtectedRoute() {
    const token = localStorage.getItem("access_token");

    useEffect(() => {
        if (!token) {
            // id cố định để StrictMode mount 2 lần không hiện toast trùng
            toast.warning("Bạn cần đăng nhập trước để truy cập trang này", {
                id: "auth-required",
            });
        }
    }, [token]);

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
