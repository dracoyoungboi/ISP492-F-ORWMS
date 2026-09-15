import { useEffect, useRef, useState } from "react";
import { ImagePlus, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  clearSavedAvatar,
  getDefaultAvatarPath,
  getSavedAvatarChoice,
  saveAvatarChoice,
} from "@/utils/avatar";

const DEFAULT_OPTIONS = [
  { value: "default-1", label: "Ảnh mặc định 1" },
  { value: "default-2", label: "Ảnh mặc định 2" },
];

// Editor dialog for the logged-in user's avatar. Defaults are saved to
// localStorage; uploads are preview-only because the backend has no avatar
// storage (see the notice below — never pretend the upload was saved).
export default function AvatarEditorModal({ open, onOpenChange, userId }) {
  const [choice, setChoice] = useState(null); // "default-1" | "default-2" | null
  const [previewUrl, setPreviewUrl] = useState(null); // object URL of upload
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

  // Reset draft state when the dialog opens — the React "adjust state
  // during render" pattern instead of a setState-in-effect cascading render.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setChoice(getSavedAvatarChoice(userId));
      setPreviewUrl(null);
      setFileName("");
    }
  }

  // Revoke object URLs on replace and on unmount.
  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl]
  );

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setFileName(file.name);
    setChoice(null);
    event.target.value = "";
  };

  const selectDefault = (value) => {
    setChoice(value);
    setPreviewUrl(null);
    setFileName("");
  };

  const handleSave = () => {
    if (!choice || previewUrl || userId == null) return;
    saveAvatarChoice(userId, choice); // persists + broadcasts AVATAR_EVENT
    onOpenChange(false);
  };

  const handleReset = () => {
    clearSavedAvatar(userId); // back to deterministic default + broadcast
    setChoice(null);
    setPreviewUrl(null);
    setFileName("");
  };

  // Big preview: upload → chosen default → deterministic default.
  const previewSrc = previewUrl
    || (choice ? `/images/avatars/${choice}.jpg` : getDefaultAvatarPath(userId));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white text-bo-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thay đổi ảnh đại diện</DialogTitle>
          <DialogDescription className="text-bo-muted">
            Chọn một trong hai ảnh mặc định hoặc tải lên ảnh cá nhân của bạn.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          {/* Preview */}
          <img
            src={previewSrc}
            alt={previewUrl ? `Xem trước ảnh tải lên (${fileName})` : "Ảnh đại diện"}
            className="size-24 rounded-full border border-bo-border object-cover"
          />

          {/* Default options */}
          <div className="flex gap-3">
            {DEFAULT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => selectDefault(option.value)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-lg border border-bo-border bg-white p-2 text-xs text-bo-muted transition-colors hover:border-bo-primary hover:text-bo-primary",
                  choice === option.value &&
                    "border-bo-primary text-bo-primary ring-2 ring-bo-primary/30"
                )}
              >
                <img
                  src={`/images/avatars/${option.value}.jpg`}
                  alt={option.label}
                  className="size-16 rounded-full"
                />
                {option.label}
              </button>
            ))}
          </div>

          {/* Upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            className="border-bo-border bg-white text-bo-foreground hover:bg-bo-surface-subtle"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="mr-2 size-4" />
            Tải ảnh lên
          </Button>

          {/* Upload notice — backend has no avatar storage */}
          {previewUrl && (
            <div className="w-full rounded-lg border border-bo-warning/30 bg-bo-warning-soft p-3 text-xs leading-relaxed text-bo-warning">
              <p className="mb-1 font-semibold">
                Ảnh tải lên ({fileName}) chỉ được xem trước, chưa thể lưu.
              </p>
              <p>
                Backend hiện chưa có lưu trữ ảnh đại diện (bảng{" "}
                <code>nguoi_dung</code> không có cột avatar). Để lưu được ảnh cá
                nhân, cần bổ sung ở phía backend:
              </p>
              <ol className="mt-1 list-decimal space-y-0.5 pl-4">
                <li>
                  Thêm cột <code>avatar</code> (varchar) cho bảng{" "}
                  <code>nguoi_dung</code> để lưu URL công khai hoặc tên object
                  MinIO.
                </li>
                <li>
                  Thêm trường <code>avatar</code> vào <code>NguoiDungDto</code>,{" "}
                  <code>UpdateNguoiDungRequest</code>, <code>LoginResponse</code>{" "}
                  và claim JWT.
                </li>
                <li>
                  Thêm endpoint upload ảnh đại diện:{" "}
                  <code>POST /api/v1/nguoi-dung/{"{id}"}/avatar</code>{" "}
                  (multipart/form-data), dùng lại <code>MinioServiceImpl</code>{" "}
                  (upload + <code>getPublicUrl</code>), tương tự endpoint upload
                  ảnh sản phẩm hiện có.
                </li>
                <li>
                  Trả về URL công khai trong response; frontend sẽ lưu URL đó
                  làm lựa chọn avatar của người dùng.
                </li>
              </ol>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            className="border-bo-border bg-white text-bo-foreground hover:bg-bo-surface-subtle"
            onClick={handleReset}
          >
            <RefreshCw className="mr-2 size-4" />
            Đặt lại về mặc định
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-bo-border bg-white text-bo-foreground hover:bg-bo-surface-subtle"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            type="button"
            disabled={!choice || Boolean(previewUrl)}
            onClick={handleSave}
            className="bg-bo-primary text-white hover:bg-bo-primary-hover"
          >
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
