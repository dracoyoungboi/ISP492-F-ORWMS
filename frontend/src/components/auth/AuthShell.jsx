import { Box } from 'lucide-react';
import AuthImagePanel from './AuthImagePanel';

/**
 * Khung layout chung cho các màn hình xác thực:
 * - Desktop (lg+): 2 cột 50/50 — trái là panel ảnh slider, phải là form trên nền trắng.
 * - Mobile (< lg): ẩn panel ảnh, logo hiển thị phía trên form, trang cuộn dọc tự do.
 */
export default function AuthShell({ children }) {
    return (
        <div
            data-auth-page
            className="min-h-dvh w-full flex flex-col lg:flex-row bg-white lg:h-dvh lg:overflow-hidden"
        >
            <AuthImagePanel />

            <div className="relative z-30 w-full lg:w-1/2 lg:h-full overflow-y-auto bg-white flex flex-col shadow-[-20px_0_40px_-15px_rgba(0,0,0,0.1)]">
                {/* my-auto thay cho justify-center: không cắt phần đầu form khi nội dung dài hơn màn hình */}
                <div className="w-full max-w-md mx-auto my-auto px-6 py-10 sm:px-12 lg:px-0 lg:py-24">
                    {/* Logo trên mobile */}
                    <div className="lg:hidden flex items-center gap-2 font-bold text-xl tracking-tight mb-10 fade-in-up">
                        <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center">
                            <Box className="w-5 h-5" />
                        </div>
                        FS WMS
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
