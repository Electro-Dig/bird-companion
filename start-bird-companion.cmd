@echo off
setlocal
cd /d "%~dp0"
if "%ELECTRON_MIRROR%"=="" set "ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/"
if "%npm_config_cache%"=="" set "npm_config_cache=%LOCALAPPDATA%\bird-companion-npm-cache"

set "NEED_INSTALL="
if not exist "node_modules\electron\dist\electron.exe" set "NEED_INSTALL=1"
if not exist "node_modules\uiohook-napi\package.json" set "NEED_INSTALL=1"

if "%NEED_INSTALL%"=="1" (
  echo Installing Electron locally. This only needs to happen once.
  npm.cmd install --no-audit --no-fund
  if errorlevel 1 exit /b %errorlevel%
)

call ".\node_modules\.bin\electron.cmd" . %*
