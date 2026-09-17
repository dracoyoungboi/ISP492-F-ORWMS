package com.dev.backend.services.impl.entities;

import org.springframework.security.core.context.SecurityContextHolder;
import com.dev.backend.constant.GlobalCache;
import com.dev.backend.constant.enums.OtpType;
import com.dev.backend.constant.variables.IRoleType;
import com.dev.backend.dto.OtpScheduleObj;
import com.dev.backend.dto.request.*;
import com.dev.backend.dto.response.LoginResponse;
import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.dto.response.entities.NguoiDungAuthInfo;
import com.dev.backend.dto.response.entities.NguoiDungDto;
import com.dev.backend.entities.NguoiDung;
import com.dev.backend.entities.PhanQuyenNguoiDungKho;
import com.dev.backend.exception.customize.CommonException;
import com.dev.backend.mapper.NguoiDungMapper;
import com.dev.backend.mapper.PhanQuyenNguoiDungKhoMapper;
import com.dev.backend.repository.NguoiDungRepository;
import com.dev.backend.services.CalcService;
import com.dev.backend.services.EmailService;
import com.dev.backend.services.JwtService;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
public class NguoiDungService extends BaseServiceImpl<NguoiDung, Integer> {
    @Autowired
    private EntityManager entityManager;

    @Autowired
    private PhanQuyenNguoiDungKhoService phanQuyenNguoiDungKhoService;

    @Autowired
    private NguoiDungMapper nguoiDungMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private CalcService calcService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PhanQuyenNguoiDungKhoMapper pqndkMapper;


    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    public NguoiDungService(NguoiDungRepository repository) {
        super(repository);
    }

    private final NguoiDungRepository nguoiDungRepository = (NguoiDungRepository) super.getRepository();


    @Transactional
    public ResponseEntity<ResponseData<LoginResponse>> login(LoginRequest loginRequest) {
        //check thông tin user đã có trong hệ thống hay chưa
        Optional<NguoiDung> findingNguoiDung = nguoiDungRepository.findByTenDangNhapOrEmailOrSoDienThoai(
                loginRequest.getUsername(),
                loginRequest.getUsername(),
                loginRequest.getUsername());
        if (findingNguoiDung.isEmpty()) {
            throw new CommonException("Tên đăng nhập không hợp lệ");
        }
        NguoiDung nguoiDung = findingNguoiDung.get();
        if (!passwordEncoder.matches(loginRequest.getPassword(), nguoiDung.getMatKhauHash())) {
            throw new CommonException("Mật khẩu không chính xác");
        }

        // lấy danh sách phân quyền người dùng để truyền ra token
        List<PhanQuyenNguoiDungKho> phanQuyenNguoiDungKhos = phanQuyenNguoiDungKhoService.findByNguoiDungIdAndActive(nguoiDung.getId());

        // lấy ra danh sách vai trò cho người dùng
        Set<String> vaiTros = new HashSet<>();
        vaiTros.add(nguoiDung.getVaiTro());

        //tạo token người dùng
        String token = jwtService.generateTokenWithPermissions(
                nguoiDung.getId(),
                nguoiDung.getTenDangNhap(),
                nguoiDung.getHoTen(),
                nguoiDung.getEmail(),
                nguoiDung.getSoDienThoai(),
                vaiTros,
                nguoiDung.getTrangThai(),
                nguoiDung.getNgayTao(),
                nguoiDung.getNgayCapNhat(),
                pqndkMapper.toDtoList(phanQuyenNguoiDungKhos),
                "Google"
        );
        return ResponseEntity.ok(
                ResponseData.<LoginResponse>builder()
                        .status(HttpStatus.OK.value())
                        .data(
                                LoginResponse.builder()
                                        .nguoiDung(nguoiDungMapper.toDto(nguoiDung))
                                        .token(token)
                                        .build()
                        )
                        .message("Success")
                        .error(null)
                        .build()
        );
    }


    @Transactional
    public ResponseEntity<ResponseData<NguoiDungDto>> update(UpdateNguoiDungRequest request) {
        NguoiDung nguoiDung = nguoiDungRepository.findById(request.getId())
                .orElseThrow(() -> new CommonException("Không tìm thấy người dùng id: " + request.getId()));
        if (request.getTenDangNhap() != null && !request.getTenDangNhap().isBlank()) {
            nguoiDung.setTenDangNhap(request.getTenDangNhap());
        }
        if (request.getHoTen() != null && !request.getHoTen().isBlank()) {
            nguoiDung.setHoTen(request.getHoTen());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            nguoiDung.setEmail(request.getEmail());
        }
        if (request.getSoDienThoai() != null && !request.getSoDienThoai().isBlank()) {
            nguoiDung.setSoDienThoai(request.getSoDienThoai());
        }
        nguoiDung = nguoiDungRepository.save(nguoiDung);
        return ResponseEntity.ok(
                ResponseData.<NguoiDungDto>builder()
                        .status(HttpStatus.OK.value())
                        .data(nguoiDungMapper.toDto(nguoiDung))
                        .message("Cập nhật thông tin người dùng thành công")
                        .error(null)
                        .build()
        );
    }

    // lấy người dùng đang đăng nhập từ context (token) — không tin tưởng id từ frontend
    private NguoiDung getCurrentUserFromContext() {
        NguoiDungAuthInfo info = com.dev.backend.config.SecurityContextHolder.getUser();
        if (info == null || info.getId() == null) {
            throw new CommonException("Phiên đăng nhập không hợp lệ");
        }
        return nguoiDungRepository.findById(info.getId())
                .orElseThrow(() -> new CommonException("Không tìm thấy người dùng"));
    }

    // Vai trò được hiển thị mục "Kho phụ trách" trên hồ sơ cá nhân.
    // quan_tri_vien và khach_hang luôn ẩn — phân quyền kho thực tế (hoạt động + còn hiệu lực) mới là nguồn đúng.
    private static final Set<String> EMPLOYEE_ROLES = Set.of(
            IRoleType.quan_ly_kho,
            IRoleType.nhan_vien_kho,
            IRoleType.nhan_vien_ban_hang,
            IRoleType.nhan_vien_mua_hang
    );

    // Điền danh sách kho phụ trách (chỉ mã + tên, đã lọc hoạt động/hiệu lực/ngày bắt đầu) vào DTO hồ sơ
    private void fillKhoPhuTrachActive(NguoiDungDto dto, NguoiDung nguoiDung) {
        String vaiTro = nguoiDung.getVaiTro();
        if (vaiTro == null || !EMPLOYEE_ROLES.contains(vaiTro)) {
            dto.setKhoPhuTrachActive(Collections.emptyList());
            return;
        }
        dto.setKhoPhuTrachActive(
                phanQuyenNguoiDungKhoService.findActiveKhoInfoByNguoiDungId(nguoiDung.getId())
        );
    }

    public ResponseEntity<ResponseData<NguoiDungDto>> getMe() {
        NguoiDung nguoiDung = getCurrentUserFromContext();
        NguoiDungDto dto = nguoiDungMapper.toDto(nguoiDung);
        fillKhoPhuTrachActive(dto, nguoiDung);
        return ResponseEntity.ok(
                ResponseData.<NguoiDungDto>builder()
                        .status(HttpStatus.OK.value())
                        .data(dto)
                        .message("Success")
                        .error(null)
                        .build()
        );
    }

    @Transactional
    public ResponseEntity<ResponseData<NguoiDungDto>> updateMe(UpdateMeRequest request) {
        if (request.getHoTen() == null || request.getHoTen().isBlank()) {
            throw new CommonException("Họ tên không được để trống");
        }

        NguoiDung nguoiDung = getCurrentUserFromContext();
        nguoiDung.setHoTen(request.getHoTen().trim());
        // cho phép xóa số điện thoại: rỗng -> null (giống createInternalUserByAdmin)
        String soDienThoai = request.getSoDienThoai();
        nguoiDung.setSoDienThoai(
                soDienThoai != null && !soDienThoai.isBlank() ? soDienThoai.trim() : null
        );

        nguoiDung = nguoiDungRepository.save(nguoiDung); // ngayCapNhat tự cập nhật (@Generated UPDATE)

        NguoiDungDto dto = nguoiDungMapper.toDto(nguoiDung);
        fillKhoPhuTrachActive(dto, nguoiDung);

        return ResponseEntity.ok(
                ResponseData.<NguoiDungDto>builder()
                        .status(HttpStatus.OK.value())
                        .data(dto)
                        .message("Cập nhật hồ sơ thành công")
                        .error(null)
                        .build()
        );
    }

    public Optional<NguoiDung> findByEmail(String email) {
        return nguoiDungRepository.findByEmail(email);
    }

    public ResponseEntity<ResponseData<String>> forgotPassword(ForgotPasswordRequest fpRequest) {
        NguoiDung nguoiDung = nguoiDungRepository.findByTenDangNhapOrEmailOrSoDienThoai(
                fpRequest.getUsername(),
                fpRequest.getUsername(),
                fpRequest.getUsername()).orElseThrow(
                () -> new CommonException("Không tìm thấy tài khoản")
        );

        //Tạo OTP
        String otp = calcService.getRandomActiveCode(6L);
        GlobalCache.OTP_SCHEDULE_OBJS.add(
                OtpScheduleObj.builder()
                        .email(nguoiDung.getEmail())
                        .otp(otp)
                        .createdAt(Instant.now())
                        .type(OtpType.RESET_PASSWORD)
                        .build()
        );

        //truyền dữ liệu qua email
        Map<String, Object> params = new HashMap<>();

        params.put("userName", nguoiDung.getHoTen());
        params.put("emailTitle", "Khôi phục mật khẩu");
        params.put("credentialLabel", "Mã OTP của bạn");
        params.put("credential", otp);
        params.put("instruction", "Bạn đã yêu cầu khôi phục mật khẩu. Hãy nhập mã OTP này vào màn hình khôi phục mật khẩu.");
        params.put("expiryTime", "5 phút");

        //gửi email
        emailService.sendHtmlEmailFromTemplate(nguoiDung.getEmail(), "Lấy lại mật khẩu", "password_flow.html", params);

        return ResponseEntity.ok(
                ResponseData.<String>builder()
                        .status(HttpStatus.OK.value())
                        .data("Success")
                        .message("Success")
                        .build()

        );
    }

    @Transactional
    public ResponseEntity<ResponseData<String>> resetPassword(ResetPasswordRequest rpRequest) {
       // tìm xem thông tin người dùng có trong hệ thống hay chưa
        NguoiDung nguoiDung = nguoiDungRepository.findByTenDangNhapOrEmailOrSoDienThoai(
                rpRequest.getUsername(),
                rpRequest.getUsername(),
                rpRequest.getUsername()).orElseThrow(
                () -> new CommonException("Không tìm thấy tài khoản")
        );

        //tìm otp của người dùng có tồn tại trong danh sách OTP đã gửi hay ko
        OtpScheduleObj findingResetOtp = GlobalCache.OTP_SCHEDULE_OBJS.stream().filter(otpScheduleObj ->
                otpScheduleObj.getEmail().equals(nguoiDung.getEmail()) && otpScheduleObj.getType().equals(OtpType.RESET_PASSWORD)).findFirst().orElseThrow(
                () -> new CommonException("Mã xác nhận không tồn tại hoặc đã hết hạn")
        );

        if (!findingResetOtp.getOtp().equals(rpRequest.getOtp())) {
            throw new CommonException("Mã xác nhận không tồn tại hoặc đã hết hạn");
        }

        Instant now = Instant.now();
        //kiểm tra otp còn hạn hay không(trong vòng 5p)
        if (now.isAfter(findingResetOtp.getCreatedAt().plusSeconds(300))) {
            throw new CommonException("Mã xác nhận không tồn tại hoặc đã hết hạn");
        }

        //sau khi thoả mãn các dk trên thì cấp mật khẩu tạm thời ngẫu nhiên
        String temporaryPassword = generateTemporaryPassword();
        nguoiDung.setMatKhauHash(passwordEncoder.encode(temporaryPassword));
        nguoiDung.setMustChangePassword(true);
        nguoiDungRepository.save(nguoiDung);

        Map<String, Object> temporaryPasswordParams = new HashMap<>();
        temporaryPasswordParams.put("emailTitle", "Mật khẩu tạm thời");
        temporaryPasswordParams.put("userName", nguoiDung.getHoTen());
        temporaryPasswordParams.put("credentialLabel", "Mật khẩu tạm thời của bạn");
        temporaryPasswordParams.put("credential", temporaryPassword);
        temporaryPasswordParams.put("instruction", "Mật khẩu cũ đã được thay thế. Hãy đăng nhập bằng mật khẩu tạm thời này và đổi sang mật khẩu riêng của bạn.");
        temporaryPasswordParams.put("expiryTime", "lần đăng nhập đầu tiên");
        emailService.sendHtmlEmailFromTemplate(nguoiDung.getEmail(), "Mật khẩu tạm thời - Fashion System", "password_flow.html", temporaryPasswordParams);

        //Xoá OTP của người dùng khỏi danh sách OTP trong bộ nhớ đệm
        GlobalCache.OTP_SCHEDULE_OBJS.remove(findingResetOtp);

        return ResponseEntity.ok(
                ResponseData.<String>builder()
                        .status(HttpStatus.OK.value())
                        .data("Mật khẩu tạm thời đã được gửi qua email")
                        .message("Mật khẩu tạm thời đã được gửi qua email")
                        .build()

        );
    }

    public Page<NguoiDung> getUserListByAdmin(Pageable pageable) {
        return nguoiDungRepository.findAll(pageable);
    }

    public NguoiDung getDetailByAdmin(Integer id) {
        NguoiDung nguoiDung = nguoiDungRepository.findById(id)
                .orElseThrow(() -> new CommonException("Không tìm thấy người dùng"));

        //Lấy danh sách phân quyền kho
        List<PhanQuyenNguoiDungKho> dsPhanQuyen = phanQuyenNguoiDungKhoService.findByNguoiDungIdAndActive(id);

        //Gán danh sách này vào trường @Transient vừa tạo
        if (dsPhanQuyen != null) {
            nguoiDung.setKhoPhuTrach(dsPhanQuyen);
        }

        return nguoiDung;
    }

    @Transactional
    public NguoiDung toggleStatusByAdmin(Integer userId) {

        //lay current id
        Integer currentUserId = null;

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
            Object userIdClaim = jwt.getClaim("id");
            if (userIdClaim != null) {
                currentUserId = Integer.valueOf(userIdClaim.toString());
            }
        }

        //lay id bi thao tac
        NguoiDung nguoiDung = nguoiDungRepository.findById(userId)
                .orElseThrow(() -> new CommonException("Không tìm thấy người dùng"));

        //chan tu khoa
        if (nguoiDung.getId().equals(currentUserId)) {
            throw new CommonException("Không thể tự khóa tài khoản của chính mình");
        }

        //toggle trang thai
        if (nguoiDung.getTrangThai() != null && nguoiDung.getTrangThai() == 1) {
            nguoiDung.setTrangThai(0);
        } else {
            nguoiDung.setTrangThai(1);
        }

        nguoiDung.setNgayCapNhat(Instant.now());

        return nguoiDungRepository.save(nguoiDung);
    }


    @Transactional
    public void updateUserByAdmin(Integer userId, AdminUpdateRequest request) {

        NguoiDung nguoiDung = nguoiDungRepository.findById(userId)
                .orElseThrow(() -> new CommonException("Không tìm thấy người dùng"));

        // reset password
        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            nguoiDung.setMatKhauHash(
                    passwordEncoder.encode(request.getNewPassword())
            );
        }

        nguoiDung.setNgayCapNhat(Instant.now());
        nguoiDungRepository.save(nguoiDung);
    }


    @Transactional
    public NguoiDung createInternalUserByAdmin(NguoiDungCreating request) {

        if (nguoiDungRepository.existsByTenDangNhap(request.getTenDangNhap())) {
            throw new CommonException("Tên đăng nhập đã tồn tại");
        }

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            if (nguoiDungRepository.existsByEmail(request.getEmail())) {
                throw new CommonException("Email đã tồn tại");
            }
        }

        if (request.getSoDienThoai() != null && !request.getSoDienThoai().isBlank()) {
            if (nguoiDungRepository.existsBySoDienThoai(request.getSoDienThoai())) {
                throw new CommonException("Số điện thoại đã tồn tại");
            }
        }

        NguoiDung nguoiDung = new NguoiDung();
        nguoiDung.setTenDangNhap(request.getTenDangNhap());
        nguoiDung.setEmail(
                request.getEmail() != null && !request.getEmail().isBlank()
                        ? request.getEmail()
                        : null
        );
        nguoiDung.setHoTen(request.getHoTen());
        nguoiDung.setSoDienThoai(
                request.getSoDienThoai() != null && !request.getSoDienThoai().isBlank()
                        ? request.getSoDienThoai()
                        : null
        );
        nguoiDung.setVaiTro(request.getVaiTro().toString());
        nguoiDung.setTrangThai(1);
        nguoiDung.setMatKhauHash(passwordEncoder.encode(request.getMatKhau()));

        return create(nguoiDung);
    }

    @Transactional
    public ResponseEntity<ResponseData<String>> changePassword(ChangePasswordRequest changePass) {
        String step = changePass.getStep() == null || changePass.getStep().isBlank()
                ? "DIRECT"
                : changePass.getStep().trim().toUpperCase();
        NguoiDung nguoiDung = getCurrentUserFromContext();

        if ("REQUEST_OTP".equals(step)) {
            validateCurrentPassword(changePass.getCurrentPassword(), nguoiDung);
            String otp = calcService.getRandomActiveCode(6L);
            GlobalCache.OTP_SCHEDULE_OBJS.add(OtpScheduleObj.builder()
                    .email(nguoiDung.getEmail()).otp(otp).createdAt(Instant.now())
                    .type(OtpType.CHANGE_PASSWORD).build());
                Map<String, Object> changePasswordOtpParams = new HashMap<>();
                changePasswordOtpParams.put("emailTitle", "Xác nhận đổi mật khẩu");
                changePasswordOtpParams.put("userName", nguoiDung.getHoTen());
                changePasswordOtpParams.put("credentialLabel", "Mã OTP đổi mật khẩu");
                changePasswordOtpParams.put("credential", otp);
                changePasswordOtpParams.put("instruction", "Bạn đã yêu cầu đổi mật khẩu. Hãy nhập mã OTP này vào cửa sổ đổi mật khẩu.");
                changePasswordOtpParams.put("expiryTime", "5 phút");
                emailService.sendHtmlEmailFromTemplate(nguoiDung.getEmail(), "Mã OTP đổi mật khẩu - Fashion System", "password_flow.html", changePasswordOtpParams);
            return ResponseEntity.ok(ResponseData.<String>builder()
                    .status(HttpStatus.OK.value()).data("OTP đã được gửi qua email")
                    .message("OTP đã được gửi qua email").build());
        }

        if ("CONFIRM".equals(step)) {
            OtpScheduleObj otpObj = GlobalCache.OTP_SCHEDULE_OBJS.stream()
                    .filter(item -> nguoiDung.getEmail().equals(item.getEmail())
                            && item.getType() == OtpType.CHANGE_PASSWORD)
                    .findFirst()
                    .orElseThrow(() -> new CommonException("Mã OTP không tồn tại hoặc đã hết hạn"));
            if (otpObj.getCreatedAt().plusSeconds(300).isBefore(Instant.now())
                    || !otpObj.getOtp().equals(changePass.getOtp())) {
                throw new CommonException("Mã OTP không tồn tại hoặc đã hết hạn");
            }

            if (changePass.getNewPassword() == null || changePass.getNewPassword().isBlank()) {
                return ResponseEntity.ok(ResponseData.<String>builder()
                        .status(HttpStatus.OK.value())
                        .data("OTP hợp lệ")
                        .message("OTP hợp lệ")
                        .build());
            }

            validateNewPassword(changePass.getNewPassword());
            nguoiDung.setMatKhauHash(passwordEncoder.encode(changePass.getNewPassword().trim()));
            nguoiDung.setMustChangePassword(false);
            nguoiDungRepository.save(nguoiDung);
            GlobalCache.OTP_SCHEDULE_OBJS.remove(otpObj);
            return passwordChangedResponse();
        }

        if (!"DIRECT".equals(step)) {
            throw new CommonException("Bước đổi mật khẩu không hợp lệ");
        }

        validateCurrentPassword(changePass.getCurrentPassword(), nguoiDung);
        validateNewPassword(changePass.getNewPassword());
        nguoiDung.setMatKhauHash(passwordEncoder.encode(changePass.getNewPassword().trim()));
        nguoiDung.setMustChangePassword(false);
        nguoiDungRepository.save(nguoiDung);
        return passwordChangedResponse();
    }

    private void validateCurrentPassword(String currentPassword, NguoiDung nguoiDung) {
        // validate trước khi chạm tới passwordEncoder (tránh encode/matches null -> 500)
        if (currentPassword == null || currentPassword.isBlank()) {
            throw new CommonException("Mật khẩu hiện tại không được để trống");
        }
        if (!passwordEncoder.matches(currentPassword, nguoiDung.getMatKhauHash())) {
            throw new CommonException("Mật khẩu hiện tại không đúng");
        }
    }

    private void validateNewPassword(String newPassword) {
        if (newPassword == null || newPassword.isBlank()
                || newPassword.trim().length() < 6) {
            throw new CommonException("Mật khẩu mới phải có ít nhất 6 ký tự");
        }
    }

    private ResponseEntity<ResponseData<String>> passwordChangedResponse() {
        return ResponseEntity.ok(
                ResponseData.<String>builder()
                        .status(HttpStatus.OK.value())
                        .message("Thay đổi mật khẩu thành công!")
                        .build()
        );
    }

    private String generateTemporaryPassword() {
        final String characters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
        StringBuilder password = new StringBuilder(8);
        java.security.SecureRandom random = new java.security.SecureRandom();
        for (int i = 0; i < 8; i++) {
            password.append(characters.charAt(random.nextInt(characters.length())));
        }
        return password.toString();
    }

    private void sendPlainEmail(String to, String subject, String content) {
        try {
            emailService.sendEmail(to, subject, content);
        } catch (Exception e) {
            throw new CommonException("Không thể gửi email đến tài khoản", e);
        }
    }
}


