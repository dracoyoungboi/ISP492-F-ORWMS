import { useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { AVATAR_EVENT, getInitials, resolveAvatarSrc } from "@/utils/avatar";

const SIZE_MAP = {
  xs: { root: "size-8", fallback: "text-xs" },
  sm: { root: "size-10", fallback: "text-sm" },
  md: { root: "size-14", fallback: "text-base" },
  lg: { root: "h-24 w-24", fallback: "text-2xl" },
};

// Shared user avatar: saved localStorage choice → deterministic default
// (hash of userId) → initials fallback (Radix shows it on image error).
export default function UserAvatar({ userId, name, size = "sm", className = "" }) {
  const [, setVersion] = useState(0);

  // Re-read the saved choice whenever any avatar change is broadcast.
  useEffect(() => {
    const handleAvatarEvent = (event) => {
      const eventUserId = event?.detail?.userId;
      if (eventUserId == null || userId == null || String(eventUserId) === String(userId)) {
        setVersion((v) => v + 1);
      }
    };
    window.addEventListener(AVATAR_EVENT, handleAvatarEvent);
    return () => window.removeEventListener(AVATAR_EVENT, handleAvatarEvent);
  }, [userId]);

  const sizeClasses = SIZE_MAP[size] || SIZE_MAP.sm;

  return (
    <Avatar className={cn(sizeClasses.root, className)}>
      <AvatarImage
        src={resolveAvatarSrc(userId)}
        alt={name ? `Ảnh đại diện của ${name}` : "Ảnh đại diện"}
      />
      <AvatarFallback
        className={cn("bg-bo-primary-soft font-bold text-bo-primary", sizeClasses.fallback)}
      >
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
