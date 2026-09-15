import { useCallback, useEffect, useState } from "react";
import { quyenHanService } from "@/services/quyenHan";

/**
 * PermissionMatrix
 * - Hiển thị toàn bộ quyền từ API, group theo `nhomQuyen`
 * - Điều khiển bằng props: selectedPermissions (map id -> boolean)
 */
export default function PermissionMatrix({
  selectedPermissions,
  setSelectedPermissions,
}) {
  const [quyenHan, setQuyenHan] = useState([]);

  const fetchQuyenHan = useCallback(async () => {
    const res = await quyenHanService.getAllQuyenHan();
    setQuyenHan(res.data.data || []);
  }, []);

  // Hoãn qua microtask để tránh setState đồng bộ trong effect
  // (react-hooks/set-state-in-effect).
  useEffect(() => {
    queueMicrotask(() => fetchQuyenHan());
  }, [fetchQuyenHan]);

  const toggle = (id) => {
    setSelectedPermissions((prev) => ({
      ...prev,
      [id]: !prev?.[id],
    }));
  };

  const grouped = quyenHan.reduce((groups, item) => {
    const groupKey = item.nhomQuyen || "khac";
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([groupKey, permissions]) => (
        <div key={groupKey} className="rounded-lg border border-bo-border p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-bo-foreground">
            {groupKey.toUpperCase()}
          </p>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {permissions.map((p) => (
              <label
                key={p.id}
                className="flex cursor-pointer items-center gap-2 text-sm text-bo-foreground"
              >
                <input
                  type="checkbox"
                  checked={!!selectedPermissions?.[p.id]}
                  onChange={() => toggle(p.id)}
                  className="size-4 rounded border-bo-border accent-bo-primary"
                />
                {p.tenQuyen}
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
