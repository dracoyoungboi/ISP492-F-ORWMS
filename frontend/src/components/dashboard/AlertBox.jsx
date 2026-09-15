export default function AlertBox({ title, subtitle, color }) {

  const colorMap = {
    red: "border-bo-danger/15 bg-bo-danger-soft text-bo-danger",
    yellow: "border-bo-warning/15 bg-bo-warning-soft text-bo-warning",
    gray: "border-bo-border bg-bo-surface-subtle text-bo-muted",
  };

  return (
    <div className={`rounded-lg border p-3 ${colorMap[color] || ""}`}>
      <div className="text-sm font-semibold text-bo-foreground">{title}</div>
      <div className="mt-1 text-xs">{subtitle}</div>
    </div>
  );

}
