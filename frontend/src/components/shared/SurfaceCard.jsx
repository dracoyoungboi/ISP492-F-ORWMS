import { cn } from "@/lib/utils";

export default function SurfaceCard({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-lg border border-bo-border bg-bo-surface shadow-sm",
        className,
      )}
    >
      {title || description || action ? (
        <div className="flex items-start justify-between gap-4 border-b border-bo-border px-4 py-3.5 sm:px-5">
          <div className="min-w-0">
            {title ? (
              <h2 className="text-sm font-semibold text-bo-foreground sm:text-base">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-0.5 text-xs leading-5 text-bo-muted sm:text-sm">
                {description}
              </p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}

      <div className={cn("p-4 sm:p-5", contentClassName)}>{children}</div>
    </section>
  );
}
