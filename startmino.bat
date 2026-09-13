@echo off
title MinIO Local Server
set MINIO_ROOT_USER=admin
set MINIO_ROOT_PASSWORD=slm123slm123
minio.exe server D:\minio\data --console-address ":9001"
pause