import { useState, useEffect, useCallback } from "react";
import { nguoiDungService } from "@/services/nguoiDungService";

export function useCheckPasswordStatus() {
    const [mustChangePassword, setMustChangePassword] = useState(false);
    const [loading, setLoading] = useState(true);

    const checkStatus = useCallback(async () => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            setMustChangePassword(false);
            setLoading(false);
            return;
        }

        try {
            const response = await nguoiDungService.getMe();
            // NguoiDungDto trả về mustChangePassword
            if (response?.data?.mustChangePassword === true) {
                setMustChangePassword(true);
            } else {
                setMustChangePassword(false);
            }
        } catch (error) {
            // Không chặn người dùng nếu API lỗi mạng
            console.error("Lỗi kiểm tra trạng thái mật khẩu:", error);
            setMustChangePassword(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkStatus();
    }, [checkStatus]);

    const handlePasswordChangeSuccess = useCallback(() => {
        setMustChangePassword(false);
    }, []);

    return {
        mustChangePassword,
        setMustChangePassword,
        handlePasswordChangeSuccess,
        loading,
        recheckPasswordStatus: checkStatus,
    };
}

export default useCheckPasswordStatus;

