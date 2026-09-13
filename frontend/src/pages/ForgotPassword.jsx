import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { nguoiDungService } from '../services/nguoiDungService';
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
import AuthShell from '../components/auth/AuthShell';
import AuthProgress from '../components/auth/AuthProgress';
import OtpInputs from '../components/auth/OtpInputs';

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
const SUCCESS_BANNER =
    'flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-800';
const FIELD_ERROR = 'mt-1.5 flex items-center gap-1.5 text-sm text-red-600';
const EYE_BTN =
    'absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 transition-colors';

const STEP_TITLES = {
    1: 'Khôi phục mật khẩu',
    2: 'Xác thực OTP',
    3: 'Đặt mật khẩu mới',
    4: 'Thành công!',
};
const STEP_SUBS = {
    1: 'Nhập email hoặc tên đăng nhập của bạn để nhận mã OTP.',
    2: 'Nhập mã 6 số đã được gửi về email của bạn',
    3: 'Nhập mật khẩu mới và xác nhận để hoàn tất',
    4: 'Mật khẩu đã được đặt lại thành công',
};

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    const [username, setUsername] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const otpValue = otp.join('');
    const clearMsgTimeoutRef = useRef(null);

    // Cleanup timer tự xoá thông báo khi unmount / chuyển route
    useEffect(() => () => {
        if (clearMsgTimeoutRef.current) clearTimeout(clearMsgTimeoutRef.current);
    }, []);

    const clearErrors = () => setErrors({});
    const setFieldError = (key, msg) => setErrors((prev) => ({ ...prev, [key]: msg }));

    const isLikelyEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

    const handleSendOTP = async (e) => {
        e.preventDefault();
        clearErrors();
        const trimmed = username.trim();
        if (!trimmed) return setFieldError('username', 'Vui lòng nhập email / tên đăng nhập');
        if (trimmed.includes('@') && !isLikelyEmail(trimmed)) return setFieldError('username', 'Email không hợp lệ');
        setIsLoading(true);
        try {
            const res = await nguoiDungService.sendForgotPasswordOTP(trimmed);
            if (res?.status === 200) {
                setUsername(trimmed);
                setOtp(['', '', '', '', '', '']);
                setStep(2);
            } else setFieldError('username', res?.message || 'Gửi OTP thất bại');
        } catch (err) {
            setFieldError('username', err?.response?.data?.message || 'Có lỗi xảy ra khi gửi OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoStep3 = (e) => {
        e.preventDefault();
        clearErrors();
        if (otpValue.length !== 6) return setFieldError('otp', 'Vui lòng nhập đủ 6 số OTP');
        setStep(3);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        clearErrors();
        const trimmed = username.trim();
        if (!trimmed) return setFieldError('general', 'Thiếu username/email');
        if (otpValue.length !== 6) return setFieldError('general', 'Thiếu OTP');
        if (!newPassword) return setFieldError('newPassword', 'Vui lòng nhập mật khẩu mới');
        if (newPassword.length < 6) return setFieldError('newPassword', 'Mật khẩu tối thiểu 6 ký tự');
        if (newPassword !== confirmPassword) return setFieldError('confirmPassword', 'Mật khẩu xác nhận không khớp');
        setIsLoading(true);
        try {
            const res = await nguoiDungService.resetPassword({ username: trimmed, otp: otpValue, password: newPassword });
            if (res?.status === 200) setStep(4);
            else setFieldError('general', res?.message || 'Đặt lại mật khẩu thất bại');
        } catch (err) {
            setFieldError('general', err?.response?.data?.message || 'Có lỗi xảy ra khi đặt lại mật khẩu');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        clearErrors();
        const trimmed = username.trim();
        if (!trimmed) return setFieldError('general', 'Vui lòng nhập email/username trước');
        setIsLoading(true);
        try {
            const res = await nguoiDungService.sendForgotPasswordOTP(trimmed);
            if (res?.status === 200) {
                setOtp(['', '', '', '', '', '']);
                setFieldError('success', 'OTP đã được gửi lại');
                clearMsgTimeoutRef.current = setTimeout(() => setErrors({}), 2500);
            } else setFieldError('general', res?.message || 'Gửi lại OTP thất bại');
        } catch (err) {
            setFieldError('general', err?.response?.data?.message || 'Có lỗi xảy ra khi gửi lại OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        if (step === 1) navigate('/login');
        else setStep((s) => s - 1);
    };

    return (
        <AuthShell>
            {step !== 4 && (
                <button
                    type="button"
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mb-6 fade-in-up"
                    onClick={handleBack}
                >
                    <ArrowLeft size={16} /> Quay lại
                </button>
            )}

            <div className="text-center lg:text-left mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-3 text-gray-900 fade-in-up delay-1">
                    {STEP_TITLES[step]}
                </h1>
                <p className="text-gray-500 text-base fade-in-up delay-2">{STEP_SUBS[step]}</p>
            </div>

            {step !== 4 && <AuthProgress currentStep={Math.min(step, 3)} />}

            {/* ── STEP 1: EMAIL / USERNAME ── */}
            {step === 1 && (
                <form className="space-y-5 fade-in-up delay-4" onSubmit={handleSendOTP} noValidate>
                    {errors.username && (
                        <div className={ERROR_BANNER} role="alert">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            <span>{errors.username}</span>
                        </div>
                    )}
                    <div className="space-y-2">
                        <label htmlFor="forgot-username" className={LABEL}>Email / Tên đăng nhập</label>
                        <input
                            id="forgot-username"
                            type="text"
                            placeholder="example@gmail.com hoặc username"
                            className={`${INPUT_BASE} ${errors.username ? INPUT_ERROR : INPUT_NORMAL}`}
                            value={username}
                            onChange={(e) => { setUsername(e.target.value); clearErrors(); }}
                            autoComplete="username"
                            aria-invalid={Boolean(errors.username)}
                        />
                    </div>
                    <button type="submit" className={`${PRIMARY_BTN} mt-4`} disabled={isLoading}>
                        {isLoading ? (
                            <><Loader2 size={16} className="animate-spin" /> Đang gửi...</>
                        ) : (
                            'Gửi mã OTP'
                        )}
                    </button>
                </form>
            )}

            {/* ── STEP 2: OTP ── */}
            {step === 2 && (
                <form className="space-y-5 fade-in-up delay-4" onSubmit={handleGoStep3} noValidate>
                    {errors.general && (
                        <div className={ERROR_BANNER} role="alert">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            <span>{errors.general}</span>
                        </div>
                    )}
                    {errors.success && (
                        <div className={SUCCESS_BANNER} role="status">
                            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                            <span>{errors.success}</span>
                        </div>
                    )}
                    {errors.otp && (
                        <div className={ERROR_BANNER} role="alert">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            <span>{errors.otp}</span>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="forgot-otp-0" className={LABEL}>Mã OTP 6 số</label>
                        <OtpInputs
                            value={otp}
                            onChange={setOtp}
                            disabled={isLoading}
                            error={Boolean(errors.otp)}
                            idPrefix="forgot-otp"
                        />
                        <p className="text-sm text-gray-600 pt-1">
                            Không nhận được mã?{' '}
                            <button
                                type="button"
                                className="font-medium text-black hover:underline"
                                onClick={handleResendOTP}
                                disabled={isLoading}
                            >
                                Gửi lại OTP
                            </button>
                        </p>
                    </div>

                    <button
                        type="submit"
                        className={`${PRIMARY_BTN} mt-4`}
                        disabled={isLoading || otpValue.length !== 6}
                    >
                        {isLoading ? (
                            <><Loader2 size={16} className="animate-spin" /> Đang xử lý...</>
                        ) : (
                            'Tiếp tục'
                        )}
                    </button>
                </form>
            )}

            {/* ── STEP 3: MẬT KHẨU MỚI ── */}
            {step === 3 && (
                <form className="space-y-5 fade-in-up delay-4" onSubmit={handleResetPassword} noValidate>
                    {errors.general && (
                        <div className={ERROR_BANNER} role="alert">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            <span>{errors.general}</span>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="forgot-new-password" className={LABEL}>Mật khẩu mới</label>
                        <div className="relative">
                            <input
                                id="forgot-new-password"
                                type={showNewPassword ? 'text' : 'password'}
                                placeholder="Tối thiểu 6 ký tự"
                                className={`${INPUT_BASE} ${errors.newPassword ? INPUT_ERROR : INPUT_NORMAL} pr-10`}
                                value={newPassword}
                                onChange={(e) => { setNewPassword(e.target.value); clearErrors(); }}
                                autoComplete="new-password"
                                aria-invalid={Boolean(errors.newPassword)}
                                aria-describedby={errors.newPassword ? 'forgot-new-password-error' : undefined}
                            />
                            <button
                                type="button"
                                className={EYE_BTN}
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                aria-label={showNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                            >
                                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors.newPassword && (
                            <p id="forgot-new-password-error" className={FIELD_ERROR}>
                                <AlertCircle size={13} className="shrink-0" />{errors.newPassword}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="forgot-confirm-password" className={LABEL}>Xác nhận mật khẩu</label>
                        <div className="relative">
                            <input
                                id="forgot-confirm-password"
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Nhập lại mật khẩu mới"
                                className={`${INPUT_BASE} ${errors.confirmPassword ? INPUT_ERROR : INPUT_NORMAL} pr-10`}
                                value={confirmPassword}
                                onChange={(e) => { setConfirmPassword(e.target.value); clearErrors(); }}
                                autoComplete="new-password"
                                aria-invalid={Boolean(errors.confirmPassword)}
                                aria-describedby={errors.confirmPassword ? 'forgot-confirm-password-error' : undefined}
                            />
                            <button
                                type="button"
                                className={EYE_BTN}
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                            >
                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p id="forgot-confirm-password-error" className={FIELD_ERROR}>
                                <AlertCircle size={13} className="shrink-0" />{errors.confirmPassword}
                            </p>
                        )}
                    </div>

                    <button type="submit" className={`${PRIMARY_BTN} mt-4`} disabled={isLoading}>
                        {isLoading ? (
                            <><Loader2 size={16} className="animate-spin" /> Đang xử lý...</>
                        ) : (
                            'Đặt lại mật khẩu'
                        )}
                    </button>
                </form>
            )}

            {/* ── STEP 4: THÀNH CÔNG ── */}
            {step === 4 && (
                <div className="text-center space-y-6 fade-in-up delay-4">
                    <CheckCircle2 className="w-16 h-16 mx-auto text-green-600" />
                    <div>
                        <p className="text-lg font-semibold text-gray-900">Mật khẩu đã được đặt lại thành công!</p>
                        <p className="mt-2 text-gray-600">Bạn có thể đăng nhập với mật khẩu mới ngay bây giờ.</p>
                    </div>
                    <button
                        type="button"
                        className={PRIMARY_BTN}
                        onClick={() => navigate('/login')}
                    >
                        Đăng nhập ngay
                    </button>
                </div>
            )}
        </AuthShell>
    );
}
