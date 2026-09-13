import { cn } from "@/lib/utils";

export default function TableShell({
  title,
  description,
  toolbar,
  children,
  footer,
  className,
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-lg border border-bo-border bg-white shadow-sm",
        className,
      )}
    >
      {title || description ? (
        <div className="border-b border-bo-border px-4 py-3.5 sm:px-5">
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
      ) : null}

      {toolbar}
      <div className="w-full overflow-x-auto">{children}</div>
      {footer ? (
        <div className="border-t border-bo-border px-4 py-3">{footer}</div>
      ) : null}
    </section>
  );
}
