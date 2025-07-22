@echo off
echo ===============================
echo  Building Markdown Table Exporter
echo ===============================

:: Remove previous builds if they exist
if exist dist rmdir /s /q dist
if exist build rmdir /s /q build
if exist gui_app.spec del gui_app.spec

:: Run PyInstaller with necessary options
pyinstaller --noconfirm --onefile --windowed ^
--add-data "templates;templates" ^
--add-data "static;static" ^
gui_app.py

echo.
echo ======================================
echo  Build completed! Check the dist folder
echo ======================================
pause
