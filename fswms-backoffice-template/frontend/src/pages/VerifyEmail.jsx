import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { nguoiDungService } from '../services/nguoiDungService';
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import AuthShell from '../components/auth/AuthShell';
import OtpInputs from '../components/auth/OtpInputs';

/* ── Class patterns dùng chung (theo thiết kế modern white/gray) ── */
const LABEL = 'text-sm font-medium leading-none text-gray-900';
const PRIMARY_BTN =
    'inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-md transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
const ERROR_BANNER =
    'flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700';
const SUCCESS_BANNER =
    'flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-800';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const navTimeoutRef = useRef(null);
    const clearMsgTimeoutRef = useRef(null);

    useEffect(() => {
        const emailParam = searchParams.get('email');
        if (emailParam) setEmail(emailParam);
    }, [searchParams]);

    // Cleanup mọi timer khi unmount / chuyển route
    useEffect(() => () => {
        if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
        if (clearMsgTimeoutRef.current) clearTimeout(clearMsgTimeoutRef.current);
    }, []);

    const handleVerify = async (e) => {
        e.preventDefault();
        setErrors({});

        const otpValue = otp.join('');
        if (otpValue.length !== 6) {
            setErrors({ otp: 'Vui lòng nhập đầy đủ mã OTP' });
            return;
        }

        setIsLoading(true);
        try {
            const response = await nguoiDungService.verifyAccount({ email, otp: otpValue });

            if (response && response.status === 200) {
                setSuccess(true);
                navTimeoutRef.current = setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setErrors({ general: response.message || 'Xác thực thất bại' });
            }
        } catch (error) {
            console.error('Verify error:', error);
            setErrors({ general: error.response?.data?.message || 'Có lỗi xảy ra khi xác thực' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setOtp(['', '', '', '', '', '']);
        setErrors({});

        try {
            const response = await nguoiDungService.resendOTP(email);

            if (response && response.status === 200) {
                setErrors({ success: 'Mã OTP đã được gửi lại' });
                clearMsgTimeoutRef.current = setTimeout(() => setErrors({}), 3000);
            } else {
                setErrors({ general: response.message || 'Gửi lại OTP thất bại' });
            }
        } catch (error) {
            console.error('Resend OTP error:', error);
            setErrors({ general: error.response?.data?.message || 'Có lỗi xảy ra khi gửi lại OTP' });
        }
    };

    return (
        <AuthShell>
            {!success ? (
                <>
                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mb-6 fade-in-up"
                    >
                        <ArrowLeft size={16} /> Quay lại đăng nhập
                    </button>

                    <div className="text-center lg:text-left mb-8">
                        <h1 className="text-3xl font-bold tracking-tight mb-3 text-gray-900 fade-in-up delay-1">
                            Xác thực email
                        </h1>
                        <p className="text-gray-500 text-base fade-in-up delay-2">Mã OTP đã được gửi đến email</p>
                        {email && (
                            <p className="text-gray-900 font-semibold mt-1 break-all fade-in-up delay-2">{email}</p>
                        )}
                    </div>

                    <form className="space-y-6 fade-in-up delay-3" onSubmit={handleVerify} noValidate>
                        {errors.general && (
                            <div className={ERROR_BANNER} role="alert">
                                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                <span>{errors.general}</span>
                            </div>
                        )}
                        {errors.otp && (
                            <div className={ERROR_BANNER} role="alert">
                                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                <span>{errors.otp}</span>
                            </div>
                        )}
                        {errors.success && (
                            <div className={SUCCESS_BANNER} role="status">
                                <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                                <span>{errors.success}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label htmlFor="verify-otp-0" className={LABEL}>Mã OTP</label>
                            <OtpInputs
                                value={otp}
                                onChange={setOtp}
                                disabled={isLoading}
                                error={Boolean(errors.otp)}
                                idPrefix="verify-otp"
                            />
                        </div>

                        <button type="submit" className={PRIMARY_BTN} disabled={isLoading}>
                            {isLoading ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Đang xác thực...</>
                            ) : (
                                'Xác nhận'
                            )}
                        </button>

                        <p className="text-center text-sm text-gray-600">
                            Không nhận được mã?{' '}
                            <button
                                type="button"
                                className="font-medium text-black hover:underline"
                                onClick={handleResendOTP}
                                disabled={isLoading}
                            >
                                Gửi lại
                            </button>
                        </p>
                    </form>
                </>
            ) : (
                /* ── TRẠNG THÁI THÀNH CÔNG ── */
                <div className="text-center space-y-6 fade-in-up">
                    <CheckCircle2 className="w-16 h-16 mx-auto text-green-600" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Xác thực thành công!</h2>
                        <p className="mt-2 text-gray-600">Tài khoản của bạn đã được kích hoạt thành công!</p>
                    </div>
                    <p className="text-sm text-gray-500">Đang chuyển hướng đến trang đăng nhập...</p>
                </div>
            )}
        </AuthShell>
    );
}
