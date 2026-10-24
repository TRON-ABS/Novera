@echo off
setlocal EnableExtensions DisableDelayedExpansion
chcp 65001 >nul
title Compilation Novera

rem ============================================================
rem VARIANTES : 1 = activee, 0 = desactivee
rem Seule Novera-Desktop Windows x64 est activee actuellement.
rem Les autres plateformes demandent leur environnement natif.
rem ============================================================
set "NOVERA_BUILD_DESKTOP=1"
set "NOVERA_BUILD_SETUP=0"
set "NOVERA_BUILD_MSI=0"
set "NOVERA_BUILD_PORTABLE=0"
set "NOVERA_BUILD_ARM64=0"
set "NOVERA_BUILD_LINUX=0"
set "NOVERA_BUILD_MACOS=0"
set "NOVERA_BUILD_ANDROID=0"
set "NOVERA_BUILD_IOS=0"
set "NOVERA_BUILD_WEB=0"
set "NOVERA_BUILD_CLI=0"

rem Ce fichier fonctionne dans le dossier parent ou dans Novera\scripts.
set "NOVERA_BUILD_REPO=%~dp0Novera"
if exist "%~dp0..\src-tauri\Cargo.toml" set "NOVERA_BUILD_REPO=%~dp0.."
set "NOVERA_BUILD_ACTION=%~1"
set "NOVERA_BUILD_OPTION=%~2"
if not defined NOVERA_BUILD_ACTION set "NOVERA_BUILD_ACTION=desktop"

if not exist "%NOVERA_BUILD_REPO%\scripts\distribution\build-novera-local.ps1" (
    echo ERREUR : depot Novera introuvable a cote du fichier BAT.
    set "NOVERA_BUILD_EXIT=2"
    goto :finish
)
set "NOVERA_BUILD_SHELL=powershell.exe"
where pwsh.exe >nul 2>nul
if not errorlevel 1 set "NOVERA_BUILD_SHELL=pwsh.exe"
"%NOVERA_BUILD_SHELL%" -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%NOVERA_BUILD_REPO%\scripts\distribution\build-novera-local.ps1"
set "NOVERA_BUILD_EXIT=%ERRORLEVEL%"

:finish
if /i "%NOVERA_BUILD_ACTION%"=="/list" goto :done
if /i "%NOVERA_BUILD_ACTION%"=="/help" goto :done
if /i "%NOVERA_BUILD_ACTION%"=="/plan" goto :done
if /i "%NOVERA_BUILD_ACTION%"=="/android-check" goto :done
if "%NOVERA_BUILD_NO_PAUSE%"=="1" goto :done
echo.
pause
:done
exit /b %NOVERA_BUILD_EXIT%
