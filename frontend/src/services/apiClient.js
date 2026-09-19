import axios from 'axios';
import { toast } from 'sonner';

// Chặn xử lý trùng lặp khi nhiều request đồng thời cùng trả về ACCOUNT_DISABLED
let accountDisabledHandled = false;

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
    headers: { "Content-Type": "application/json" },
});

// Mặc định tự động truyền token và kho vào header
// Nếu needToken = false hoặc needKho = false thì không truyền thông tin đó
apiClient.interceptors.request.use(
    (config) => {
        if (config.skipAuth) return config;

        // Mặc định cần truyền token và kho (trừ khi được set thành false)
        const needToken = config.needToken !== false;
        const needKho = config.needKho !== false;

        const token = localStorage.getItem("access_token");
        const khoId = localStorage.getItem("selected_kho_id");
        
        if (token && needToken) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        if (khoId && needKho) {
            config.headers = config.headers || {};
            config.headers['kho_id'] = khoId;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Tài khoản bị khóa: xóa session và đưa về /login.
        // KHÔNG ảnh hưởng các lỗi 403 thông thường (thiếu quyền) — chỉ xử lý ACCOUNT_DISABLED.
        const data = error.response?.data;
        const isAccountDisabled =
            data?.error === "ACCOUNT_DISABLED" ||
            (typeof data?.message === "string" && data.message.includes("bị khóa"));
        if (
            isAccountDisabled &&
            error.config?.skipAccountDisabledHandling !== true &&
            !accountDisabledHandled
        ) {
            accountDisabledHandled = true;
            const message =
                data?.message || "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.";
            localStorage.removeItem("access_token");
            localStorage.removeItem("role");
            localStorage.removeItem("selected_kho_id");
            Object.keys(localStorage)
                .filter((key) => key.startsWith("fcentrics_avatar_"))
                .forEach((key) => localStorage.removeItem(key));
            sessionStorage.setItem("account_locked_message", message);
            toast.error(message, { id: "account-disabled" });
            window.location.href = "/login"; // token đã xóa trước khi redirect → Login không tự bounce về /dashboard
        }
        return Promise.reject(error);
    }
);

export default apiClient;
