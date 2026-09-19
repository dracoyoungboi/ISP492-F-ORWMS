package com.dev.backend.config;

import com.dev.backend.dto.response.entities.NguoiDungAuthInfo;
import com.dev.backend.entities.NguoiDung;
import com.dev.backend.exception.customize.AccountDisabledException;
import com.dev.backend.repository.NguoiDungRepository;
import com.dev.backend.services.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private NguoiDungRepository nguoiDungRepository;

    @Override
    public boolean preHandle(HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler) {
        String authHeader = request.getHeader("Authorization");
        String khoId = request.getHeader("kho_id");
        SecurityContextHolder.setPath(request.getRequestURI());
        if (authHeader != null) {
            String token = jwtService.getTokenFromAuthHeader(authHeader);
            NguoiDungAuthInfo nguoiDungAuthInfo = jwtService.getNguoiDungAuthInfoFromToken(token);
            SecurityContextHolder.setUser(nguoiDungAuthInfo);

            // Kiểm tra trangThai hiện tại từ DB — KHÔNG tin claim trong token (có thể đã cũ)
            if (nguoiDungAuthInfo != null && nguoiDungAuthInfo.getId() != null) {
                Integer trangThai = nguoiDungRepository.findById(nguoiDungAuthInfo.getId())
                        .map(NguoiDung::getTrangThai)
                        .orElse(null);
                if (trangThai == null || trangThai != 1) {
                    SecurityContextHolder.clear(); // preHandle throw → afterCompletion không chạy, phải tự clear
                    throw new AccountDisabledException();
                }
            }
        }
        if (khoId != null) {
            SecurityContextHolder.setKhoId(Integer.parseInt(khoId));
        }
        return true;
    }

    @Override
    public void afterCompletion(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler, Exception ex) {
        SecurityContextHolder.clear(); // Xóa sau khi xử lý xong
    }
}
