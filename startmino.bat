@echo off
title MinIO Local Server
cd /d "%~dp0"

set MINIO_ROOT_USER=admin
set MINIO_ROOT_PASSWORD=slm123slm123

"D:\MinIO\minio.exe" server "D:\MinIO\Data" --console-address ":9001"

pause