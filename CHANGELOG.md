# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Dashboard GUI with Electron + React + Zustand + Tailwind
- One-line installer (`setup.sh`)
- Multi-action button logic (1 tap = toggle, 2 taps = copy, 3 taps = paste, hold = Alt+Tab)
- Rotation toggle script (Shift+F10)
- Device connected/disconnected polling in Electron main process
- Comprehensive test suite (69 tests for dashboard)
- CI/CD pipeline with 4 jobs (lint, test, build, dashboard-test)

### Changed
- Enhanced `.wacom_config.sh` with universal device detection
- Improved `.wacom_toggle.sh` with dynamic device name detection
- Updated `.wacom_udev_trigger.sh` with lock file and robust user detection
- Updated `install.sh` with auto keyboard shortcuts for XFCE/Openbox
- Updated README with prominent one-line install section

## [1.0.0] - 2026-03-26

### Added
- Initial release
- Universal Wacom tablet support for Linux (X11)
- TUI installer with whiptail
- Multi-monitor mapping support
- udev rules for automatic configuration on device connection
- XDG autostart integration
- Mode toggle (absolute/relative)
- Button mapping configuration
- Support for XFCE and Openbox keyboard shortcuts

### Security
- Scripts run with user privileges (no unnecessary sudo)
- Context isolation in Electron dashboard
- Secure IPC bridge via preload script

[Unreleased]: https://github.com/carlosindriago/wacom-linux/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/carlosindriago/wacom-linux/releases/tag/v1.0.0
