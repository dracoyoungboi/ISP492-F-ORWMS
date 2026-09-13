export default function Stat({ icon, label, value }) {
  return (
    <div className="rounded-lg border border-bo-border bg-bo-surface p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-medium text-bo-muted">{label}</div>
        {icon}
      </div>

      <div className="mt-2 text-2xl font-bold tracking-tight text-bo-foreground">
        {value}
      </div>
    </div>
  );
}
