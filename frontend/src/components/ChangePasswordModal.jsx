import { useState } from "react";
import { AlertCircle, Eye, EyeOff, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { nguoiDungService } from "@/services/nguoiDungService";
import OtpInputs from "@/components/auth/OtpInputs";

const INPUT_CLASS =
  "border-bo-border bg-white text-bo-foreground focus-visible:border-bo-primary focus-visible:ring-bo-primary/20";

// Toggle nút hiện/ẩn mật khẩu — pattern dùng chung với trang Login.
function PasswordToggle({ show, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-bo-muted transition-colors hover:text-bo-foreground"
    >
      {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
    </button>
  );
}

// Modal đổi mật khẩu của người đang đăng nhập.
// State và submit tách biệt hoàn toàn khỏi form "Thông tin cá nhân".
export default function ChangePasswordModal({ open, onOpenChange, onSuccess, forceDirect = false }) {
  const [step, setStep] = useState(forceDirect ? "new-password" : "current-password");
  const [currentPassword, setCurrentPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [otpChecking, setOtpChecking] = useState(false);

  // Reset toàn bộ trường khi modal mở lại (pattern "adjust state during render").
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setCurrentPassword("");
      setOtp(["", "", "", "", "", ""]);
      setNewPassword("");
      setConfirmPassword("");
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
      setErrorMsg("");
      setStep(forceDirect ? "new-password" : "current-password");
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMsg("");

    if (step === "current-password" && !currentPassword.trim()) {
      setErrorMsg("Vui lòng nhập mật khẩu hiện tại");
      return;
    }
    if (step === "otp" && otp.join("").length !== 6) {
      setErrorMsg("Vui lòng nhập đủ 6 số OTP");
      return;
    }
    if (step === "new-password" && (!newPassword || newPassword.trim().length < 6)) {
      setErrorMsg("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    if (step === "new-password" && confirmPassword !== newPassword) {
      setErrorMsg("Xác nhận mật khẩu không khớp");
      return;
    }

    setSubmitting(true);
    try {
      if (step === "current-password") {
        await nguoiDungService.changePassword({
          step: "REQUEST_OTP",
          currentPassword,
        });
        setStep("otp");
        return;
      }

      await nguoiDungService.changePassword({
        step: forceDirect ? "DIRECT" : "CONFIRM",
        currentPassword,
        otp: otp.join(""),
        newPassword: newPassword.trim(),
      });

      // clear toàn bộ trường sau khi đổi thành công
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.message || err?.message || "Đổi mật khẩu thất bại"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpChange = async (nextOtp) => {
    setOtp(nextOtp);
    setErrorMsg("");
    if (nextOtp.join("").length !== 6 || otpChecking || step !== "otp") return;

    setOtpChecking(true);
    try {
      await nguoiDungService.changePassword({
        step: "CONFIRM",
        otp: nextOtp.join(""),
      });
      setStep("new-password");
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || err?.message || "Mã OTP không hợp lệ");
    } finally {
      setOtpChecking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white text-bo-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Đổi mật khẩu</DialogTitle>
          <DialogDescription className="text-bo-muted">
            {forceDirect
              ? "Bạn đang sử dụng mật khẩu tạm thời. Hãy đổi mật khẩu để tiếp tục."
              : "Cập nhật mật khẩu đăng nhập cho tài khoản của bạn."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step !== "otp" && (
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-bo-muted" />
              Mật khẩu hiện tại
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrent ? "text" : "password"}
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={submitting}
                className={`${INPUT_CLASS} pr-10`}
              />
              <PasswordToggle
                show={showCurrent}
                onClick={() => setShowCurrent((v) => !v)}
                disabled={submitting}
              />
            </div>
          </div>
          )}

          {step === "otp" && (
            <div className="space-y-2">
              <Label htmlFor="change-password-otp">Mã OTP</Label>
              <OtpInputs
                value={otp}
                onChange={handleOtpChange}
                disabled={submitting || otpChecking}
                error={Boolean(errorMsg)}
                idPrefix="change-password-otp"
              />
            </div>
          )}

          {step === "new-password" && (
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-bo-muted" />
              Mật khẩu mới
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNew ? "text" : "password"}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={submitting}
                className={`${INPUT_CLASS} pr-10`}
              />
              <PasswordToggle
                show={showNew}
                onClick={() => setShowNew((v) => !v)}
                disabled={submitting}
              />
            </div>
          </div>
          )}

          {step === "new-password" && (
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-bo-muted" />
              Xác nhận mật khẩu mới
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={submitting}
                className={`${INPUT_CLASS} pr-10`}
              />
              <PasswordToggle
                show={showConfirm}
                onClick={() => setShowConfirm((v) => !v)}
                disabled={submitting}
              />
            </div>
          </div>
          )}

          {errorMsg && (
            <Alert className="border-bo-danger/30 bg-bo-danger-soft">
              <AlertCircle className="h-4 w-4 text-bo-danger" />
              <AlertDescription className="text-bo-danger">
                {errorMsg}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter className="gap-2">
            {!forceDirect && step !== "current-password" && (
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => setStep(step === "new-password" ? "otp" : "current-password")}
              className="border-bo-border bg-white text-bo-foreground hover:bg-bo-surface-subtle"
            >
              Hủy
            </Button>
            )}
            <Button
              type="submit"
              disabled={submitting}
              className="bg-bo-primary text-white hover:bg-bo-primary-hover"
            >
              <Lock className="mr-2 h-4 w-4" />
              {submitting ? "Đang xử lý..." : step === "current-password" ? "Gửi mã OTP" : step === "otp" ? "Xác nhận OTP" : "Đổi mật khẩu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
