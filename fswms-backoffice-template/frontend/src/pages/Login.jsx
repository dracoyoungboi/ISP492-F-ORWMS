import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { nguoiDungService } from '../services/nguoiDungService';
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { getMineKhoList } from '../services/khoService';
import AuthShell from '../components/auth/AuthShell';

/* ── Class patterns dùng chung (theo thiết kế modern white/gray) ── */
const INPUT_BASE =
    'flex h-11 w-full rounded-lg border bg-white px-3 py-2 text-base text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent';
const INPUT_NORMAL = 'border-gray-300';
const INPUT_ERROR = 'border-red-500 focus:ring-red-500';
const LABEL = 'text-sm font-medium leading-none text-gray-900';
const PRIMARY_BTN =
    'inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-md transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
const ERROR_BANNER =
    'flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700';
const FIELD_ERROR = 'mt-1.5 flex items-center gap-1.5 text-sm text-red-600';
const EYE_BTN =
    'absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 transition-colors';
const LINK_MUTED = 'text-sm font-medium text-gray-500 hover:text-black hover:underline transition-colors';

export default function AuthPage() {
    const navigate = useNavigate();

    // Đã có token thì vào thẳng dashboard (đồng bộ với redirect của App.jsx)
    useEffect(() => {
        if (localStorage.getItem('access_token')) navigate('/dashboard');
    }, [navigate]);

    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [showRegisterConfirm, setShowRegisterConfirm] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const [loginData, setLoginData] = useState({ username: '', matKhau: '' });
    const [registerData, setRegisterData] = useState({
        tenDangNhap: '', matKhau: '', xacNhanMatKhau: '', hoTen: '', email: '', soDienThoai: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const validateRegister = () => {
        const e = {};
        if (!registerData.tenDangNhap) e.tenDangNhap = 'Vui lòng nhập email để tạo tên đăng nhập';
        else if (registerData.tenDangNhap.length < 6 || registerData.tenDangNhap.length > 50)
            e.tenDangNhap = 'Phần trước @ của email phải từ 6–50 ký tự để tạo tên đăng nhập';
        if (!registerData.matKhau) e.matKhau = 'Vui lòng nhập mật khẩu';
        else if (registerData.matKhau.length < 6) e.matKhau = 'Mật khẩu phải có ít nhất 6 ký tự';
        if (!registerData.xacNhanMatKhau) e.xacNhanMatKhau = 'Vui lòng xác nhận mật khẩu';
        else if (registerData.matKhau !== registerData.xacNhanMatKhau) e.xacNhanMatKhau = 'Mật khẩu xác nhận không khớp';
        if (!registerData.hoTen) e.hoTen = 'Vui lòng nhập họ và tên';
        else if (registerData.hoTen.length < 6 || registerData.hoTen.length > 100) e.hoTen = 'Họ tên phải từ 6–100 ký tự';
        if (!registerData.email) e.email = 'Vui lòng nhập email';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) e.email = 'Email không hợp lệ';
        if (!registerData.soDienThoai) e.soDienThoai = 'Vui lòng nhập số điện thoại';
        else if (registerData.soDienThoai.length < 10 || registerData.soDienThoai.length > 11) e.soDienThoai = 'Số điện thoại phải từ 10–11 ký tự';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});
        try {
            if (!loginData.username || !loginData.matKhau) {
                setErrors({ general: 'Vui lòng điền đầy đủ thông tin đăng nhập' });
                return;
            }
            const response = await nguoiDungService.login({ username: loginData.username, password: loginData.matKhau });
            if (response?.status !== 200) {
                setErrors({ general: response?.message || 'Đăng nhập thất bại' });
                return;
            }

            const token = localStorage.getItem('access_token');
            if (!token) {
                setErrors({ general: 'Không nhận được token đăng nhập, vui lòng thử lại' });
                return;
            }

            try {
                const decoded = jwtDecode(token);
                // Role đã được nguoiDungService lưu từ nguoiDung.vaiTro — chỉ dùng claim trong
                // JWT làm dự phòng khi role chưa có (không ghi đè, không lưu "undefined")
                if (!localStorage.getItem('role')) {
                    const rawRole = decoded?.scope || decoded?.vaiTro || decoded?.role || decoded?.authorities;
                    if (typeof rawRole === 'string' && rawRole && rawRole !== 'undefined') {
                        const role = rawRole.startsWith('ROLE_') ? rawRole.slice(5) : rawRole;
                        localStorage.setItem('role', role);
                    }
                }
                if (decoded?.warehousePermissions) {
                    try {
                        const permissions = typeof decoded.warehousePermissions === 'string'
                            ? JSON.parse(decoded.warehousePermissions)
                            : decoded.warehousePermissions;
                        if (Array.isArray(permissions) && permissions.length > 0 && permissions[0]?.kho) {
                            localStorage.setItem('selected_kho_id', permissions[0].kho.id);
                        }
                    } catch (parseError) {
                        console.error('Lỗi khi đọc warehousePermissions từ Token:', parseError);
                    }
                }
            } catch (decodeError) {
                // Token không hợp lệ: xoá để tránh vòng lặp redirect với token hỏng, ở lại trang đăng nhập
                console.error('Token đăng nhập không hợp lệ:', decodeError);
                localStorage.removeItem('access_token');
                setErrors({ general: 'Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại' });
                return;
            }

            try {
                const myWarehouses = await getMineKhoList();
                if (myWarehouses && myWarehouses.length > 0 && !localStorage.getItem('selected_kho_id')) {
                    localStorage.setItem('selected_kho_id', myWarehouses[0].id);
                }
            } catch {
                console.warn('Không thể tải danh sách kho.');
            }

            navigate('/dashboard');
        } catch (error) {
            setErrors({ general: error.response?.data?.message || 'Có lỗi xảy ra khi đăng nhập' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!validateRegister()) return;
        setIsLoading(true);
        try {
            const response = await nguoiDungService.register({
                tenDangNhap: registerData.tenDangNhap,
                matKhau: registerData.matKhau,
                hoTen: registerData.hoTen,
                email: registerData.email,
                soDienThoai: registerData.soDienThoai,
            });
            if (response?.status === 200) {
                navigate(`/verify-email?email=${encodeURIComponent(registerData.email)}`);
            } else setErrors({ general: response?.message || 'Đăng ký thất bại' });
        } catch (error) {
            setErrors({ general: error.response?.data?.message || 'Có lỗi xảy ra khi đăng ký' });
        } finally {
            setIsLoading(false);
        }
    };

    const switchForm = (login) => {
        setIsLogin(login);
        setErrors({});
    };

    return (
        <AuthShell>
            <div className="text-center lg:text-left mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-3 text-gray-900 fade-in-up delay-1">
                    {isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}
                </h1>
                <p className="text-gray-500 text-base fade-in-up delay-2">
                    {isLogin
                        ? 'Chào mừng trở lại hệ thống FS WMS.'
                        : 'Điền đầy đủ thông tin để bắt đầu.'}
                </p>
            </div>

            {isLogin ? (
                /* ── FORM ĐĂNG NHẬP ── */
                <form className="space-y-5 fade-in-up delay-3" onSubmit={handleLogin} noValidate>
                    {errors.general && (
                        <div className={ERROR_BANNER} role="alert">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            <span>{errors.general}</span>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="login-username" className={LABEL}>Tên đăng nhập / Email / SĐT</label>
                        <input
                            id="login-username"
                            type="text"
                            placeholder="Nhập tài khoản của bạn"
                            className={`${INPUT_BASE} ${INPUT_NORMAL}`}
                            value={loginData.username}
                            onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                            autoComplete="username"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label htmlFor="login-password" className={LABEL}>Mật khẩu</label>
                            <button type="button" className={LINK_MUTED} onClick={() => navigate('/forgot-password')}>
                                Quên mật khẩu?
                            </button>
                        </div>
                        <div className="relative">
                            <input
                                id="login-password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                className={`${INPUT_BASE} ${INPUT_NORMAL} pr-10`}
                                value={loginData.matKhau}
                                onChange={(e) => setLoginData({ ...loginData, matKhau: e.target.value })}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className={EYE_BTN}
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                        <input
                            type="checkbox"
                            id="remember"
                            className="w-4 h-4 rounded border border-gray-300 accent-gray-900 cursor-pointer"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer select-none">
                            Ghi nhớ đăng nhập
                        </label>
                    </div>

                    <button type="submit" className={`${PRIMARY_BTN} mt-4`} disabled={isLoading}>
                        {isLoading ? (
                            <><Loader2 size={16} className="animate-spin" /> Đang xử lý...</>
                        ) : (
                            'Đăng nhập'
                        )}
                    </button>
                </form>
            ) : (
                /* ── FORM ĐĂNG KÝ ── */
                <form className="space-y-4 fade-in-up delay-3" onSubmit={handleRegister} noValidate>
                    {errors.general && (
                        <div className={ERROR_BANNER} role="alert">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            <span>{errors.general}</span>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="reg-username" className={LABEL}>Tên đăng nhập</label>
                        <input
                            id="reg-username"
                            type="text"
                            readOnly
                            placeholder="Tự động tạo từ email"
                            className={`${INPUT_BASE} border-gray-200 bg-gray-50 text-gray-400 cursor-default focus:ring-0`}
                            value={registerData.tenDangNhap}
                            aria-invalid={Boolean(errors.tenDangNhap)}
                            aria-describedby={errors.tenDangNhap ? 'reg-username-error' : undefined}
                        />
                        {errors.tenDangNhap && (
                            <p id="reg-username-error" className={FIELD_ERROR}>
                                <AlertCircle size={13} className="shrink-0" />{errors.tenDangNhap}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="reg-hoten" className={LABEL}>Họ và tên <span className="text-red-500">*</span></label>
                        <input
                            id="reg-hoten"
                            type="text"
                            placeholder="Nguyễn Văn A"
                            className={`${INPUT_BASE} ${errors.hoTen ? INPUT_ERROR : INPUT_NORMAL}`}
                            value={registerData.hoTen}
                            onChange={(e) => setRegisterData({ ...registerData, hoTen: e.target.value })}
                            autoComplete="name"
                            aria-invalid={Boolean(errors.hoTen)}
                            aria-describedby={errors.hoTen ? 'reg-hoten-error' : undefined}
                        />
                        {errors.hoTen && (
                            <p id="reg-hoten-error" className={FIELD_ERROR}>
                                <AlertCircle size={13} className="shrink-0" />{errors.hoTen}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="reg-email" className={LABEL}>Email <span className="text-red-500">*</span></label>
                            <input
                                id="reg-email"
                                type="email"
                                placeholder="name@example.com"
                                className={`${INPUT_BASE} ${errors.email ? INPUT_ERROR : INPUT_NORMAL}`}
                                value={registerData.email}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setRegisterData({ ...registerData, email: val, tenDangNhap: val.split('@')[0] });
                                }}
                                autoComplete="email"
                                aria-invalid={Boolean(errors.email)}
                                aria-describedby={errors.email ? 'reg-email-error' : undefined}
                            />
                            {errors.email && (
                                <p id="reg-email-error" className={FIELD_ERROR}>
                                    <AlertCircle size={13} className="shrink-0" />{errors.email}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="reg-phone" className={LABEL}>Số điện thoại <span className="text-red-500">*</span></label>
                            <input
                                id="reg-phone"
                                type="tel"
                                placeholder="10–11 ký tự"
                                className={`${INPUT_BASE} ${errors.soDienThoai ? INPUT_ERROR : INPUT_NORMAL}`}
                                value={registerData.soDienThoai}
                                onChange={(e) => setRegisterData({ ...registerData, soDienThoai: e.target.value })}
                                autoComplete="tel"
                                aria-invalid={Boolean(errors.soDienThoai)}
                                aria-describedby={errors.soDienThoai ? 'reg-phone-error' : undefined}
                            />
                            {errors.soDienThoai && (
                                <p id="reg-phone-error" className={FIELD_ERROR}>
                                    <AlertCircle size={13} className="shrink-0" />{errors.soDienThoai}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="reg-password" className={LABEL}>Mật khẩu <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input
                                    id="reg-password"
                                    type={showRegisterPassword ? 'text' : 'password'}
                                    placeholder="Tối thiểu 6 ký tự"
                                    className={`${INPUT_BASE} ${errors.matKhau ? INPUT_ERROR : INPUT_NORMAL} pr-10`}
                                    value={registerData.matKhau}
                                    onChange={(e) => setRegisterData({ ...registerData, matKhau: e.target.value })}
                                    autoComplete="new-password"
                                    aria-invalid={Boolean(errors.matKhau)}
                                    aria-describedby={errors.matKhau ? 'reg-password-error' : undefined}
                                />
                                <button
                                    type="button"
                                    className={EYE_BTN}
                                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                    aria-label={showRegisterPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                >
                                    {showRegisterPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.matKhau && (
                                <p id="reg-password-error" className={FIELD_ERROR}>
                                    <AlertCircle size={13} className="shrink-0" />{errors.matKhau}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="reg-confirm" className={LABEL}>Xác nhận mật khẩu <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input
                                    id="reg-confirm"
                                    type={showRegisterConfirm ? 'text' : 'password'}
                                    placeholder="Nhập lại mật khẩu"
                                    className={`${INPUT_BASE} ${errors.xacNhanMatKhau ? INPUT_ERROR : INPUT_NORMAL} pr-10`}
                                    value={registerData.xacNhanMatKhau}
                                    onChange={(e) => setRegisterData({ ...registerData, xacNhanMatKhau: e.target.value })}
                                    autoComplete="new-password"
                                    aria-invalid={Boolean(errors.xacNhanMatKhau)}
                                    aria-describedby={errors.xacNhanMatKhau ? 'reg-confirm-error' : undefined}
                                />
                                <button
                                    type="button"
                                    className={EYE_BTN}
                                    onClick={() => setShowRegisterConfirm(!showRegisterConfirm)}
                                    aria-label={showRegisterConfirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                >
                                    {showRegisterConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.xacNhanMatKhau && (
                                <p id="reg-confirm-error" className={FIELD_ERROR}>
                                    <AlertCircle size={13} className="shrink-0" />{errors.xacNhanMatKhau}
                                </p>
                            )}
                        </div>
                    </div>

                    <button type="submit" className={`${PRIMARY_BTN} mt-6`} disabled={isLoading}>
                        {isLoading ? (
                            <><Loader2 size={16} className="animate-spin" /> Đang xử lý...</>
                        ) : (
                            'Tạo tài khoản'
                        )}
                    </button>
                </form>
            )}

            <p className="text-center lg:text-left text-sm text-gray-500 mt-8 fade-in-up delay-4">
                {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}{' '}
                <button
                    type="button"
                    className="font-medium text-black hover:underline"
                    onClick={() => switchForm(!isLogin)}
                >
                    {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
                </button>
            </p>
        </AuthShell>
    );
}
