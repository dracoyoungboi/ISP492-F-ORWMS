import { cn } from "@/lib/utils";

/** Khối đề mục trong bản in: tiêu đề chữ hoa + đường kẻ nhẹ. */
export default function PrintSection({ title, children, className, accentColor, compact = false }) {
    return (
        <section className={cn(compact ? "mt-3" : "mt-5", className)}>
            {title ? (
                <h3
                    className={cn(
                        "mb-2 border-b border-bo-border pb-1.5 font-semibold uppercase tracking-wide text-bo-primary",
                        compact ? "text-[10px]" : "text-xs"
                    )}
                    style={accentColor ? { color: accentColor } : undefined}
                >
                    {title}
                </h3>
            ) : null}
            {children}
        </section>
    );
}
