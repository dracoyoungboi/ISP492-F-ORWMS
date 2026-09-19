/**
 * Hồ sơ công ty DÙNG CHUNG cho mọi mẫu in.
 *
 * Tên công ty, logo, email, điện thoại, địa chỉ nằm ở đây (một nơi duy nhất);
 * từng mẫu in chỉ quyết định CÓ HIỂN THỊ từng trường hay không (cấu hình
 * `branding` của mẫu), không lưu trùng dữ liệu công ty.
 *
 * MVP frontend-only: lưu localStorage. Có thể thay bằng API công ty
 * phía backend sau mà không cần sửa renderer/editor.
 */
const STORAGE_KEY = "fcentric.companyProfile.v1";
const PROFILE_VERSION = 1;

export const DEFAULT_COMPANY_PROFILE = {
    version: PROFILE_VERSION,
    name: "FCentric",
    logoAsset: "/branding/f-centric-icon.svg",
    email: "",
    phone: "",
    address: "",
};

const readStorage = () => {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const companyProfileService = {
    /** Hồ sơ đã lưu (bù field thiếu từ default) hoặc default nếu chưa có. */
    get() {
        const saved = readStorage();
        if (!saved || saved.version !== PROFILE_VERSION) {
            return structuredClone(DEFAULT_COMPANY_PROFILE);
        }
        return { ...structuredClone(DEFAULT_COMPANY_PROFILE), ...saved };
    },

    save(profile) {
        window.localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ ...profile, version: PROFILE_VERSION })
        );
    },
};
