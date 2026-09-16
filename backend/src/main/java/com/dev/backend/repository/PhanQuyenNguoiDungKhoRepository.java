package com.dev.backend.repository;

import com.dev.backend.dto.response.entities.KhoPhuTrachInfoDto;
import com.dev.backend.entities.PhanQuyenNguoiDungKho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PhanQuyenNguoiDungKhoRepository extends JpaRepository<PhanQuyenNguoiDungKho, Integer>, JpaSpecificationExecutor<PhanQuyenNguoiDungKho> {


    @Query("""
            SELECT pqndk  FROM PhanQuyenNguoiDungKho pqndk  WHERE 
                        pqndk.nguoiDung.id = :nguoiDungId AND pqndk.trangThai = 1 
                                    AND (pqndk.ngayKetThuc IS NULL OR pqndk.ngayKetThuc > CURRENT_TIMESTAMP)
            """)
    List<PhanQuyenNguoiDungKho> findByNguoiDungIdAndActive(@Param("nguoiDungId") Integer nguoiDungId);

    Optional<PhanQuyenNguoiDungKho> findByNguoiDungIdAndKhoId(Integer nguoiDungId, Integer khoId);

    /**
     * Danh sách kho (chỉ mã + tên) đang phụ trách hiệu lực cho hồ sơ cá nhân:
     * trạng thái hoạt động, chưa hết hạn và đã đến ngày bắt đầu (nếu có).
     * Dùng constructor expression để không serialize toàn bộ entity graph, DISTINCT chống trùng kho.
     */
    @Query("""
            SELECT DISTINCT new com.dev.backend.dto.response.entities.KhoPhuTrachInfoDto(k.maKho, k.tenKho)
            FROM PhanQuyenNguoiDungKho pqndk
            JOIN pqndk.kho k
            WHERE pqndk.nguoiDung.id = :nguoiDungId
              AND pqndk.trangThai = 1
              AND (pqndk.ngayKetThuc IS NULL OR pqndk.ngayKetThuc > CURRENT_TIMESTAMP)
              AND (pqndk.ngayBatDau IS NULL OR pqndk.ngayBatDau <= CURRENT_TIMESTAMP)
            """)
    List<KhoPhuTrachInfoDto> findActiveKhoInfoByNguoiDungId(@Param("nguoiDungId") Integer nguoiDungId);
}