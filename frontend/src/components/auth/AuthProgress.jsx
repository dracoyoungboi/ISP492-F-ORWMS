import { Check } from 'lucide-react';

const STEPS = ['Email', 'OTP', 'Mật khẩu'];

/**
 * Thanh tiến trình "Email → OTP → Mật khẩu" của luồng quên mật khẩu.
 * currentStep: 1..3. Bước đã xong = tròn đen có dấu tick, bước hiện tại = tròn đen có số,
 * bước chưa tới = viền xám. Bước 3 bị ẩn dưới sm (giống thiết kế reference).
 */
export default function AuthProgress({ currentStep }) {
    return (
        <div className="flex items-center gap-3 sm:gap-4 mb-8 fade-in-up delay-3">
            {STEPS.map((label, i) => {
                const s = i + 1;
                const isDone = s < currentStep;
                const isActive = s === currentStep;
                const isLast = i === STEPS.length - 1;
                return (
                    <div key={label} className={`flex items-center gap-3 sm:gap-4 ${isLast ? 'hidden sm:flex' : ''}`}>
                        <div className="flex items-center gap-2">
                            <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                                    isDone || isActive
                                        ? 'bg-gray-900 text-white'
                                        : 'border border-gray-300 text-gray-400'
                                }`}
                            >
                                {isDone ? <Check className="w-3.5 h-3.5" /> : s}
                            </span>
                            <span
                                className={`text-sm whitespace-nowrap ${
                                    isDone || isActive
                                        ? 'font-semibold text-gray-900'
                                        : 'font-medium text-gray-400'
                                }`}
                            >
                                {label}
                            </span>
                        </div>
                        {!isLast && (
                            <div className={`w-6 sm:w-8 h-px shrink-0 ${isDone ? 'bg-gray-900' : 'bg-gray-200'}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
