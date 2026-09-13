import { useCallback, useEffect, useRef, useState } from 'react';
import { Activity, Box, Cpu, Package } from 'lucide-react';

const SLIDES = [
    {
        src: '/images/auth/slide-1.jpg',
        fallbackSrc: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2000&auto=format&fit=crop',
        alt: 'Xưởng thiết kế thời trang với máy may và vải vóc',
    },
    {
        src: '/images/auth/slide-2.jpg',
        fallbackSrc: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2000&auto=format&fit=crop',
        alt: 'Cửa hàng thời trang với những kệ quần áo được trưng bày',
    },
    {
        src: '/images/auth/slide-3.jpg',
        fallbackSrc: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=2000&auto=format&fit=crop',
        alt: 'Nhân viên kho đang quản lý hàng hóa trong nhà kho',
    },
];

const AUTOPLAY_MS = 5000;
const TRANSITION_MS = 1200;

export default function AuthImagePanel() {
    const [current, setCurrent] = useState(0);
    const [prev, setPrev] = useState(null);
    // Tier per slide: 0 = local ok, 1 = dùng fallbackSrc (remote), 2 = ẩn ảnh (panel đen)
    const [failedTier, setFailedTier] = useState({});
    const [reducedMotion, setReducedMotion] = useState(
        () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );

    const currentRef = useRef(0);
    const animatingRef = useRef(false);
    const intervalRef = useRef(null);
    const exitTimeoutRef = useRef(null);

    // Theo dõi prefers-reduced-motion (cleanup khi unmount)
    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        const handleChange = (e) => setReducedMotion(e.matches);
        mq.addEventListener('change', handleChange);
        return () => mq.removeEventListener('change', handleChange);
    }, []);

    const clearExitTimer = useCallback(() => {
        if (exitTimeoutRef.current) {
            clearTimeout(exitTimeoutRef.current);
            exitTimeoutRef.current = null;
        }
    }, []);

    const finishTransition = useCallback(() => {
        clearExitTimer();
        animatingRef.current = false;
        setPrev(null);
    }, [clearExitTimer]);

    const goTo = useCallback((index) => {
        if (index === currentRef.current || animatingRef.current) return;
        if (reducedMotion) {
            // Không có animation: chuyển slide trực tiếp
            currentRef.current = index;
            setCurrent(index);
            setPrev(null);
            return;
        }
        animatingRef.current = true;
        setPrev(currentRef.current);
        currentRef.current = index;
        setCurrent(index);
        // Dự phòng nếu onAnimationEnd không chạy (ảnh lỗi bị ẩn...)
        clearExitTimer();
        exitTimeoutRef.current = setTimeout(finishTransition, TRANSITION_MS + 100);
    }, [reducedMotion, clearExitTimer, finishTransition]);

    // Autoplay: interval tự khởi động lại sau mỗi lần đổi slide / bấm dot; cleanup khi unmount
    useEffect(() => {
        if (reducedMotion) return undefined;
        intervalRef.current = setInterval(() => {
            goTo((currentRef.current + 1) % SLIDES.length);
        }, AUTOPLAY_MS);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [goTo, reducedMotion]);

    // Cleanup mọi timer khi unmount / chuyển route
    useEffect(() => () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        clearExitTimer();
    }, [clearExitTimer]);

    const handleDotClick = (index) => {
        goTo(index);
        // Khởi động lại autoplay sau thao tác tay (giống reference)
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (!reducedMotion) {
            intervalRef.current = setInterval(() => {
                goTo((currentRef.current + 1) % SLIDES.length);
            }, AUTOPLAY_MS);
        }
    };

    const handleImgError = (index) => {
        setFailedTier((tiers) => {
            const tier = tiers[index] || 0;
            if (tier === 0) return { ...tiers, [index]: 1 };
            if (tier === 1) return { ...tiers, [index]: 2 };
            return tiers;
        });
    };

    return (
        <div className="hidden lg:flex relative w-1/2 h-full bg-black overflow-hidden">
            {SLIDES.map((slide, index) => {
                const tier = failedTier[index] || 0;
                if (tier === 2) return null;
                const isCurrent = index === current;
                const isPrev = index === prev;
                return (
                    <img
                        key={index}
                        src={tier === 1 ? slide.fallbackSrc : slide.src}
                        alt={slide.alt}
                        draggable={false}
                        className={`absolute top-0 left-0 w-full h-full object-cover opacity-80 ${
                            isCurrent ? 'slide-enter z-[1]' : ''
                        } ${isPrev ? 'slide-exit z-[2]' : ''} ${
                            !isCurrent && !isPrev ? 'hidden' : ''
                        }`}
                        onError={() => handleImgError(index)}
                        onAnimationEnd={isPrev ? finishTransition : undefined}
                    />
                );
            })}

            {/* Lớp phủ tối */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30 z-20 pointer-events-none" />

            {/* Nội dung overlay */}
            <div className="absolute inset-0 z-30 flex flex-col p-12 text-white pointer-events-none">
                <div className="flex items-center gap-3 font-bold text-2xl tracking-tight mb-auto">
                    <div className="w-10 h-10 bg-white text-black rounded-lg flex items-center justify-center">
                        <Box className="w-6 h-6" />
                    </div>
                    FS WMS
                </div>

                <div className="max-w-lg mb-12">
                    <h2 className="text-3xl font-semibold leading-snug mb-6 text-white">
                        Nền tảng quản lý kho thời trang thông minh.
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                                <Activity className="w-4 h-4 text-white" />
                            </div>
                            <p className="text-white/90 font-medium">Dashboard real-time</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                                <Package className="w-4 h-4 text-white" />
                            </div>
                            <p className="text-white/90 font-medium">Quản lý đơn hàng toàn diện</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                                <Cpu className="w-4 h-4 text-white" />
                            </div>
                            <p className="text-white/90 font-medium">AI dự báo tồn kho</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chấm điều hướng */}
            <div className="absolute bottom-12 right-12 z-30 flex gap-3">
                {SLIDES.map((slide, index) => (
                    <button
                        key={index}
                        type="button"
                        aria-label={`Chuyển đến ảnh ${index + 1}: ${slide.alt}`}
                        className={`h-2.5 rounded-full transition-all ${
                            index === current
                                ? 'w-8 bg-white duration-500'
                                : 'w-2.5 bg-white/40 hover:bg-white duration-300'
                        }`}
                        onClick={() => handleDotClick(index)}
                    />
                ))}
            </div>
        </div>
    );
}
