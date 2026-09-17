# Kế hoạch mở rộng luồng mật khẩu

## 1. Mục tiêu

Bổ sung và hoàn thiện ba luồng:

1. Đổi mật khẩu trong hồ sơ người dùng bằng mật khẩu hiện tại + OTP + mật khẩu mới.
2. Quên mật khẩu: xác thực OTP, hệ thống tự sinh mật khẩu ngẫu nhiên 6-8 ký tự và gửi qua email.
3. Sau khi đăng nhập bằng mật khẩu ngẫu nhiên, hiển thị popup bắt buộc người dùng đổi mật khẩu.

Frontend hiện đã sử dụng React, Tailwind CSS và có sẵn các component/API liên quan. Backend hiện sử dụng Spring Boot, JWT, BCrypt, DTO, service và repository.

## 2. Quyết định thiết kế

Phương án thống nhất cho feature này:

- Không tạo API reset password mới.
- Không tạo API change password mới.
- Giữ nguyên các URL hiện tại.
- Giữ nguyên `forgotPassword()` vì hàm này đã phù hợp với bước gửi OTP.
- Thay logic bên trong `resetPassword()` để tự sinh mật khẩu random 6-8 ký tự.
- Thay logic bên trong `changePassword()` để xử lý hai bước: gửi OTP và xác nhận đổi mật khẩu.
- Cập nhật DTO và frontend theo request/response mới.
- Không xóa logic cũ ngoài phạm vi cần thay đổi; không tạo endpoint trùng chức năng.
- Email OTP và mật khẩu tạm thời phải dùng HTML template chung theo format email reset mật khẩu, không dùng plain-text email.

Do frontend và backend nằm trong cùng project, việc thay đổi contract API được thực hiện đồng thời ở hai phía.

### Quy tắc email

Các email trong ba luồng phải dùng `EmailService.sendHtmlEmailFromTemplate(...)` và template `templates/password_flow.html`:

- OTP khôi phục mật khẩu.
- OTP đổi mật khẩu trong hồ sơ.
- Mật khẩu tạm thời sau khi reset.

Template nhận các tham số `emailTitle`, `userName`, `credentialLabel`, `credential`, `instruction` và `expiryTime` để giữ cùng giao diện, nhưng thay đổi nội dung theo từng trường hợp.

---

## 3. Hiện trạng code

### Frontend

- `src/pages/ForgotPassword.jsx`
  - Đã có màn hình quên mật khẩu.
  - Đang gồm bốn bước: nhập username/email, nhập OTP, nhập mật khẩu mới, thành công.
- `src/components/ChangePasswordModal.jsx`
  - Đã có popup đổi mật khẩu.
  - Hiện gửi trực tiếp `currentPassword` và `newPassword`.
- `src/pages/UserDetail.jsx`
  - Đã mở `ChangePasswordModal` từ phần hồ sơ và bảo mật tài khoản.
- `src/pages/Login.jsx`
  - Đã có đăng nhập và liên kết `Quên mật khẩu?`.
- `src/services/nguoiDungService.js`
  - Đã có các hàm login, change password, gửi OTP và reset password.
- `src/components/auth/OtpInputs.jsx`
  - Có thể tái sử dụng cho ô nhập OTP.

### Backend

- `controller/NguoiDungController.java`
  - Đã có endpoint login, forgot password, reset password và change password.
- `services/impl/entities/NguoiDungService.java`
  - Đang xử lý các nghiệp vụ mật khẩu.
- `dto/request/ChangePasswordRequest.java`
  - Gồm `currentPassword` và `newPassword`.
- `dto/request/ForgotPasswordRequest.java`
  - Gồm `username`.
- `dto/request/ResetPasswordRequest.java`
  - Gồm `username`, `otp` và `password`.
- `entities/NguoiDung.java`
  - Lưu mật khẩu trong trường `matKhauHash`.
- `repository/NguoiDungRepository.java`
  - Kế thừa `JpaRepository`, dùng `findById()` và `save()`.
- `config/SecurityConfig.java`
  - Đăng ký `BCryptPasswordEncoder` và JWT decoder.
- `constant/enums/OtpType.java`
  - Đang có loại OTP `RESET_PASSWORD`.
- `constant/GlobalCache.java`
  - Đang lưu OTP tạm thời trong `OTP_SCHEDULE_OBJS`.

---

## 4. Luồng đổi mật khẩu trong hồ sơ

### Luồng mong muốn

```text
Mở popup đổi mật khẩu
        ↓
Nhập mật khẩu hiện tại
        ↓
Backend kiểm tra mật khẩu hiện tại
        ↓
Backend tạo và gửi OTP qua email
        ↓
Hiện ô nhập OTP
        ↓
OTP hợp lệ
        ↓
Hiện mật khẩu mới và xác nhận mật khẩu mới
        ↓
Backend cập nhật mật khẩu
```

### Backend

Giữ nguyên endpoint hiện tại:

```text
POST /api/v1/nguoi-dung/change-password
```

Endpoint được gọi hai lần và dùng trường `step` để phân biệt giai đoạn xử lý.

Request bước 1:

```json
{
        "step": "REQUEST_OTP",
        "currentPassword": "mat-khau-cu"
}
```

Request bước 2:

```json
{
        "step": "CONFIRM",
        "otp": "123456",
        "newPassword": "mat-khau-moi"
}
```

Thay đổi `ChangePasswordRequest.java` để bổ sung `step` và `otp`. Không tạo endpoint mới.

Service cần thực hiện:

1. Lấy người dùng từ JWT/security context.
2. Không nhận user ID từ frontend.
3. Dùng `PasswordEncoder.matches()` để kiểm tra mật khẩu cũ.
4. Sinh OTP bằng `SecureRandom`.
5. Lưu OTP, user/email, loại OTP và thời gian tạo.
6. Gửi OTP qua `EmailService`.
7. Kiểm tra OTP và thời hạn khi xác nhận.
8. Encode mật khẩu mới bằng BCrypt.
9. Lưu vào `NguoiDung.matKhauHash`.

Nên thêm loại OTP riêng:

```java
CHANGE_PASSWORD
```

vào `OtpType` để phân biệt OTP đổi mật khẩu và OTP reset mật khẩu.

### Frontend

Cập nhật `ChangePasswordModal.jsx` theo trạng thái bước:

```text
current-password
otp
new-password
```

Có thể thêm các state:

```javascript
const [step, setStep] = useState("current");
const [otp, setOtp] = useState(["", "", "", "", "", ""]);
```

Các hàm cần thêm:

```javascript
handleRequestChangePasswordOtp()
handleConfirmChangePassword()
handleBackStep()
```

Tái sử dụng:

```text
components/auth/OtpInputs.jsx
```

Thay đổi `nguoiDungService.js` để gọi cùng URL hai lần:

```javascript
changePassword(payload)
```

`UserDetail.jsx` đã có chỗ mở modal, nên chỉ cần giữ cách tích hợp hiện tại.

---

## 5. Luồng quên mật khẩu bằng mật khẩu ngẫu nhiên

### Luồng mong muốn

```text
Nhập username/email
        ↓
Nhận OTP qua email
        ↓
Nhập OTP
        ↓
Backend kiểm tra OTP
        ↓
Sinh mật khẩu ngẫu nhiên 6-8 ký tự
        ↓
Encode và lưu mật khẩu
        ↓
Gửi mật khẩu mới qua email
        ↓
Đăng nhập bằng mật khẩu mới
```

Frontend hiện đã có `ForgotPassword.jsx`, vì vậy không cần tạo màn hình mới.

### Backend

Giữ nguyên endpoint hiện tại:

```text
POST /api/v1/nguoi-dung/reset-password
```

Request:

```json
{
  "username": "user01",
  "otp": "123456"
}
```

Không nhận mật khẩu mới từ frontend.

Thay đổi `ResetPasswordRequest.java` để `password` không còn bắt buộc hoặc không sử dụng trong flow mới. Không tạo endpoint mới.

Service cần:

1. Tìm user theo username, email hoặc số điện thoại.
2. Tìm OTP loại `RESET_PASSWORD`.
3. Kiểm tra OTP chính xác.
4. Kiểm tra OTP chưa quá 5 phút.
5. Sinh mật khẩu ngẫu nhiên 6-8 ký tự bằng `SecureRandom`.
6. Encode bằng `PasswordEncoder`.
7. Lưu vào `matKhauHash`.
8. Gửi mật khẩu mới qua email.
9. Xóa OTP khỏi `GlobalCache`.

Không dùng `Math.random()` hoặc timestamp làm mật khẩu.

### Frontend

Trong `ForgotPassword.jsx`:

- Giữ bước nhập username/email.
- Giữ bước nhập OTP.
- Bỏ bước nhập mật khẩu mới.
- Sau khi OTP đúng, gọi endpoint reset random.
- Hiển thị thông báo mật khẩu mới đã được gửi qua email.
- Chuyển người dùng về màn hình login.

Hàm cần thêm hoặc thay đổi flow:

```javascript
handleResetWithRandomPassword()
```

---

## 6. Popup bắt đổi mật khẩu sau đăng nhập

### Luồng mong muốn

```text
Người dùng reset mật khẩu
        ↓
Nhận mật khẩu ngẫu nhiên qua email
        ↓
Đăng nhập bằng mật khẩu ngẫu nhiên
        ↓
Backend trả cờ bắt đổi mật khẩu
        ↓
Frontend mở ChangePasswordModal
        ↓
Nhập mật khẩu hiện tại
        ↓
Nhập mật khẩu mới và xác nhận
        ↓
Đổi thành công
```

Popup sau login không cần OTP. Nó dùng xác thực mật khẩu hiện tại bằng flow `changePassword`.

### Backend cần đánh dấu tài khoản

Backend cần biết user nào đang dùng mật khẩu được cấp lại.

Có thể thêm vào `NguoiDung`:

```java
boolean mustChangePassword;
```

Database cần thêm cột tương ứng:

```sql
must_change_password BOOLEAN NOT NULL DEFAULT FALSE
```

Khi reset random:

```text
mustChangePassword = true
```

Khi đổi mật khẩu thành công:

```text
mustChangePassword = false
```

Login response cần trả thêm cờ này, ví dụ:

```json
{
  "token": "...",
  "nguoiDung": {
    "mustChangePassword": true
  }
}
```

### Frontend

Trong `Login.jsx`:

```text
login thành công
        ↓
đọc mustChangePassword
        ↓
lưu trạng thái cần thiết
        ↓
đi đến dashboard
        ↓
mở ChangePasswordModal
```

Có thể dùng lại `ChangePasswordModal.jsx` thay vì tạo popup mới.

Nếu yêu cầu bắt buộc, người dùng không nên đóng popup khi chưa đổi mật khẩu thành công.

---

## 7. Các file cần thêm hoặc cập nhật

### Backend

Không tạo DTO, service hoặc controller mới cho endpoint mới. Các file hiện tại cần cập nhật:

```text
NguoiDung.java
LoginResponse.java
OtpType.java
NguoiDungController.java
NguoiDungService.java
```

### Frontend

Có thể thêm:

```text
components/auth/PasswordOtpStep.jsx
components/auth/RandomPasswordNotice.jsx
```

Các file hiện tại cần tích hợp để feature thực sự hoạt động:

```text
components/ChangePasswordModal.jsx
pages/ForgotPassword.jsx
pages/Login.jsx
services/nguoiDungService.js
```

`UserDetail.jsx` hiện đã tích hợp modal nên có thể không cần đổi cấu trúc.

---

## 8. Mâu thuẫn với rule không sửa code cũ

Yêu cầu hiện tại là:

```text
Chỉ viết thêm hàm.
Không xóa code cũ.
Không sửa code cũ.
Không động vào các file khác ở frontend.
```

Tuy nhiên để feature hoạt động hoàn chỉnh, bắt buộc phải tích hợp vào những file đang render hoặc gọi API:

```text
ChangePasswordModal.jsx
ForgotPassword.jsx
Login.jsx
nguoiDungService.js
```

Nếu chỉ tạo file mới mà không import hoặc gọi chúng từ code hiện tại, component mới sẽ không được sử dụng.

Phạm vi tối thiểu nên cho phép:

- Không xóa logic cũ.
- Không refactor phần không liên quan.
- Chỉ thêm state, hàm, endpoint và JSX cần thiết.
- Không thay đổi các file frontend ngoài nhóm trên.

---

## 9. Thứ tự triển khai

### Giai đoạn 1: Đổi mật khẩu có OTP

1. Thêm DTO request OTP.
2. Thêm endpoint gửi OTP.
3. Thêm endpoint xác nhận đổi mật khẩu.
4. Thêm loại `CHANGE_PASSWORD` vào `OtpType`.
5. Thêm state và bước OTP vào modal.
6. Tái sử dụng `OtpInputs`.
7. Kiểm tra mật khẩu cũ, OTP và mật khẩu mới.

### Giai đoạn 2: Reset mật khẩu random

1. Thêm DTO reset random.
2. Thêm endpoint reset random.
3. Sinh mật khẩu bằng `SecureRandom`.
4. Encode và lưu mật khẩu.
5. Gửi mật khẩu qua email.
6. Bỏ bước nhập mật khẩu mới trong flow quên mật khẩu.
7. Kiểm tra OTP sai và hết hạn.

### Giai đoạn 3: Bắt đổi mật khẩu sau login

1. Thêm cờ `mustChangePassword`.
2. Đặt cờ khi reset random.
3. Trả cờ trong login response.
4. Xóa cờ khi đổi mật khẩu thành công.
5. Mở lại `ChangePasswordModal` sau login.
6. Ngăn người dùng bỏ qua nếu đang bị bắt đổi mật khẩu.

### Giai đoạn 4: Kiểm thử

#### Đổi mật khẩu

- Mật khẩu cũ bị bỏ trống.
- Mật khẩu cũ sai.
- Mật khẩu cũ đúng.
- OTP sai.
- OTP hết hạn.
- Mật khẩu mới dưới 6 ký tự.
- Hai mật khẩu mới không khớp.
- Đổi thành công.

#### Quên mật khẩu

- Tài khoản không tồn tại.
- OTP sai.
- OTP hết hạn.
- Nhận mật khẩu ngẫu nhiên qua email.
- Đăng nhập bằng mật khẩu ngẫu nhiên.

#### Popup sau login

- User bình thường không bị popup.
- User vừa reset random bị popup.
- Nhập mật khẩu hiện tại đúng.
- Đổi mật khẩu thành công thì popup đóng.
- Đăng nhập lại không còn bị popup.

---

## 10. Luồng tổng quát

```text
Frontend
    ↓
nguoiDungService.js
    ↓
apiClient.js
    ↓
NguoiDungController
    ↓
@RequireAuth / JWT nếu là flow cần đăng nhập
    ↓
NguoiDungService
    ↓
PasswordEncoder / EmailService / GlobalCache
    ↓
NguoiDungRepository
    ↓
bảng nguoi_dung
```

### Đổi mật khẩu đã đăng nhập

```text
JWT + mật khẩu cũ
    ↓
kiểm tra BCrypt
    ↓
OTP
    ↓
mật khẩu mới
    ↓
matKhauHash
```

### Quên mật khẩu

```text
username/email + OTP
    ↓
SecureRandom password
    ↓
BCrypt encode
    ↓
email mật khẩu mới
    ↓
mustChangePassword = true
```

### Sau login

```text
login response
    ↓
mustChangePassword = true
    ↓
ChangePasswordModal
    ↓
đổi mật khẩu thật
    ↓
mustChangePassword = false
```
