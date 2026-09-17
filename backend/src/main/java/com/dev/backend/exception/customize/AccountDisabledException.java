package com.dev.backend.exception.customize;

import org.springframework.http.HttpStatus;

public class AccountDisabledException extends CommonException {

    public AccountDisabledException() {
        super("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
        setHttpStatus(HttpStatus.FORBIDDEN);
    }
}
