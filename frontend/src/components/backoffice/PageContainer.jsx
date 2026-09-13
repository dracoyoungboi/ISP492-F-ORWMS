import { cn } from "@/lib/utils";

export default function PageContainer({ className, children }) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1600px] p-4 sm:p-5 lg:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
