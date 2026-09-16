package com.dev.backend.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

// Request cho PUT /api/v1/nguoi-dung/me: chỉ chứa các trường cá nhân được phép tự sửa.
// Không có id/tenDangNhap/email/vaiTro/trangThai — BE lấy danh tính từ token.
@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
@ToString
public class UpdateMeRequest {
    String hoTen;
    String soDienThoai;
}
