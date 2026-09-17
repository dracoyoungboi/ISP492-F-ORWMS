import apiClient from "./apiClient";

export const nguoiDungService = {

    async getById(id) {
        const res = await apiClient.get(`/api/v1/nguoi-dung/get-by-id/${id}`);
        return res.data; // ResponseData<NguoiDungDto>
    },

    async getMe() {
        // hồ sơ của người đang đăng nhập — BE lấy user từ token, không nhận id
        const res = await apiClient.get("/api/v1/nguoi-dung/me");
        return res.data; // ResponseData<NguoiDungDto>
    },

    async updateMe(payload) {
        // payload: { hoTen, soDienThoai } — không kèm id (BE lấy user từ token)
        const res = await apiClient.put("/api/v1/nguoi-dung/me", payload);
        return res.data; // ResponseData<NguoiDungDto>
    },

    async login(payload) {
        const res = await apiClient.post("/api/v1/nguoi-dung/login", payload, { skipAuth: true });
        const token = res?.data?.data?.token;
        const nguoiDung = res?.data?.data?.nguoiDung;
        if (token) localStorage.setItem("access_token", token);
        if (nguoiDung?.vaiTro) {
            localStorage.setItem("role", nguoiDung.vaiTro);
        }
        return res.data;
    },

    async sendForgotPasswordOTP(usernameOrEmail) {
        // BE expects: { username }
        const res = await apiClient.post(
            "/api/v1/nguoi-dung/forgot-password",
            { username: usernameOrEmail },
            { skipAuth: true }
        );
        return res.data;
    },

    async resetPassword({ username, otp }) {
        // BE expects: { username, otp }; the server generates a temporary password
        const res = await apiClient.post(
            "/api/v1/nguoi-dung/reset-password",
            { username, otp },
            { skipAuth: true }
        );
        return res.data;
    },

    logout() {
        localStorage.removeItem("access_token");
    },

    getToken() {
        return localStorage.getItem("access_token");
    },

    async changePassword(payload) {
        // payload: { currentPassword, newPassword } — không kèm id (BE lấy user từ token)
        const res = await apiClient.post("/api/v1/nguoi-dung/change-password", payload);
        return res.data;
    },

    async updatePermission(payload) {
        // payload: { id, vaiTro }
        const res = await apiClient.put("/api/v1/dieu-hanh-he-thong/vai-tro/gan-vai-tro", payload);
        return res.data;
    },

};