-- Migration script for password flow feature
-- Chạy script này trên cơ sở dữ liệu MySQL: fashion_system
ALTER TABLE nguoi_dung
    ADD COLUMN must_change_password BOOLEAN NOT NULL DEFAULT FALSE;

