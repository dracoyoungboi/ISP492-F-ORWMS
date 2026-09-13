import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function LoadingState({
  rows = 5,
  className,
  label = "Đang tải dữ liệu",
}) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn("space-y-3 p-4 sm:p-5", className)}
    >
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 rounded-md border border-bo-border p-3"
        >
          <Skeleton className="size-9 shrink-0 rounded-md" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3 w-2/5" />
            <Skeleton className="h-3 w-3/5" />
          </div>
          <Skeleton className="hidden h-7 w-20 sm:block" />
        </div>
      ))}
    </div>
  );
}
