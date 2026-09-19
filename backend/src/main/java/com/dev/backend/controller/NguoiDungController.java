package com.dev.backend.controller;

import com.dev.backend.constant.variables.IRoleType;
import com.dev.backend.customizeanotation.RequireAuth;
import com.dev.backend.dto.request.*;
import com.dev.backend.dto.response.LoginResponse;
import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.dto.response.entities.NguoiDungDto;
import com.dev.backend.entities.NguoiDung;
import com.dev.backend.exception.customize.CommonException;
import com.dev.backend.mapper.NguoiDungMapper;
import com.dev.backend.services.impl.entities.NguoiDungService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.beans.Transient;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/nguoi-dung")
public class NguoiDungController {

    @Autowired
    private NguoiDungService nguoiDungService;

    @Autowired
    private NguoiDungMapper nguoiDungMapper;

    // call api này để lấy danh sách người dùng quản lý kho(lấy dc thông tin danh sách kho mà user đó quản lý)
    @GetMapping("/get-by-id/{id}")
    public ResponseEntity<ResponseData<NguoiDungDto>> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(
                ResponseData.<NguoiDungDto>builder()
                        .status(HttpStatus.OK.value())
                        .data(
                                nguoiDungMapper.toDto(nguoiDungService.getDetailByAdmin(id))
                        )
                        .message("Success")
                        .error(null)
                        .build()
        );
    }

    //đăng nhập hệ thống
    @PostMapping("/login")
    public ResponseEntity<ResponseData<LoginResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        return nguoiDungService.login(loginRequest);
    }

    //update thông tin người dùng
    @PutMapping("/update")
    @RequireAuth(roles = {IRoleType.all})
    public ResponseEntity<ResponseData<NguoiDungDto>> update(@Valid @RequestBody UpdateNguoiDungRequest request) {
        return nguoiDungService.update(request);
    }

    // lấy thông tin người dùng đang đăng nhập (id lấy từ token, không nhận id từ frontend)
    @GetMapping("/me")
    @RequireAuth(roles = {IRoleType.all})
    public ResponseEntity<ResponseData<NguoiDungDto>> getMe() {
        return nguoiDungService.getMe();
    }

    // cập nhật thông tin người dùng đang đăng nhập (id lấy từ token)
    @PutMapping("/me")
    @RequireAuth(roles = {IRoleType.all})
    public ResponseEntity<ResponseData<NguoiDungDto>> updateMe(@RequestBody UpdateMeRequest request) {
        return nguoiDungService.updateMe(request);
    }

    // gửi yêu cầu đổi mật khẩu
    @PostMapping("/forgot-password")
    public ResponseEntity<ResponseData<String >> forgotPassword(@RequestBody ForgotPasswordRequest fpRequest) {
        return nguoiDungService.forgotPassword(fpRequest);

    }

    // sau khi gửi yêu cầu đổi mk thì api này để đổi mk với otp
    @PostMapping("reset-password")
    public ResponseEntity<ResponseData<String >> resetPassword(@RequestBody ResetPasswordRequest rpRequest){
        return nguoiDungService.resetPassword(rpRequest);

    }

    @PostMapping("/filter")
    public ResponseEntity<ResponseData<Page<NguoiDungDto>>> filter(@RequestBody BaseFilterRequest filter) {
        return ResponseEntity.ok(
                ResponseData.<Page<NguoiDungDto>>builder()
                        .status(HttpStatus.OK.value())
                        .data(
                                nguoiDungMapper.toDtoPage(nguoiDungService.filter(filter))
                        )
                        .message("Success")
                        .build()
        );
    }


    @PostMapping("/change-password")
    @RequireAuth(
            roles = {IRoleType.all}
    )
    public ResponseEntity<ResponseData<String>> changePassword(@RequestBody ChangePasswordRequest changePass){
        return nguoiDungService.changePassword(changePass);
    }
}






