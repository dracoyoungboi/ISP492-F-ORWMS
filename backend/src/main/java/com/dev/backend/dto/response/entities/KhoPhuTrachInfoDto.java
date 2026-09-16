package com.dev.backend.dto.response.entities;

import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * Thông tin kho tối giản cho hồ sơ cá nhân (GET/PUT /api/v1/nguoi-dung/me).
 * Chỉ gồm mã kho và tên kho — không lộ id, quyền chi tiết hay dữ liệu phân quyền liên quan.
 * Constructor (maKho, tenKho) được dùng bởi JPQL constructor expression trong repository.
 */
@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
@EqualsAndHashCode
public class KhoPhuTrachInfoDto {
    String maKho;
    String tenKho;
}
