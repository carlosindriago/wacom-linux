# ✍️ Wacom Linux Tool (Universal & Multi-Monitor Edition)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Wacom Linux CI](https://github.com/carlosindriago/wacom-linux/actions/workflows/ci.yml/badge.svg)](https://github.com/carlosindriago/wacom-linux/actions/workflows/ci.yml)

A professional, automated configuration suite for **ANY Wacom Tablet** on Linux. Features dynamic device detection, advanced multi-monitor mapping, and a professional TUI installer.

---

## 🌟 Key Features

- **🚀 Universal Device Support:** Automatically detects any Wacom stylus device (Intuos, One, Pro, etc.) using dynamic X11 sensing.
- **🖥️ Multi-Monitor Mapping:** Choose to map your tablet to a specific monitor or the entire extended desktop.
- **🔌 Vendor-Level Persistence:** Custom `udev` rules detect any Wacom hardware by Vendor ID (`056a`) for instant configuration.
- **🖱️ Tablet/Mouse Mode Toggle:** Seamlessly switch between absolute (drawing) and relative (navigation) modes.
- **🛠️ Professional TUI:** Interactive installer built with `whiptail` for a guided experience.

---

## 🚀 Quick Start

### 1. Prerequisites
Ensure you have the Wacom X11 drivers and `whiptail` installed:
```bash
sudo apt update && sudo apt install xserver-xorg-input-wacom libnotify-bin whiptail x11-xserver-utils
```

### 2. Installation & Configuration
```bash
git clone https://github.com/carlosindriago/wacom-linux.git
cd wacom-linux
chmod +x install.sh
./install.sh
```
The installer will list your active monitors and let you choose the mapping target.

---

## 🧪 Advanced Features

### Dynamic Hardware Discovery
Unlike static scripts, this tool queries the X11 subsystem to find the active STYLUS device name. This means you can swap Wacom models without re-running the installer; the system will adapt to the new hardware automatically on the next connection.

### Screen Mapping Logic
You can map the tablet's active area to:
- **Individual Monitor:** (e.g., `HDMI-1`, `LVDS-1`) for precise drawing.
- **Full Desktop:** Map across all connected monitors (ideal for large multi-head setups).

---

## 🚀 Quick Start

### 1. Prerequisites
Ensure you have the Wacom X11 drivers and `whiptail` installed:
```bash
sudo apt update && sudo apt install xserver-xorg-input-wacom libnotify-bin whiptail
```

### 2. Installation & Configuration
Clone the repository and run the professional TUI installer:
```bash
git clone https://github.com/carlosindriago/wacom-linux.git
cd wacom-linux
chmod +x install.sh
./install.sh
```
Follow the visual prompts to configure your tablet preferences.

### 3. Uninstallation
To remove all scripts, configurations, and system rules:
```bash
chmod +x uninstall.sh
./uninstall.sh
```

---

## 🧪 Testing

This project includes a test suite to ensure configuration logic and system integration are correct.

### 1. Unit Tests (Logic Validation)
Verify that the configuration scripts generate the correct `xsetwacom` commands without needing the hardware connected:
```bash
./tests/test_logic.sh
```

### 2. System Verification (Post-Install)
After running the installer, you can verify that all files, permissions, and udev rules are correctly placed in your system:
```bash
./tests/verify_install.sh
```

### Universal Autostart
Instead of environment-specific configuration files, this tool uses the **XDG Autostart specification**. By placing a `.desktop` file in `~/.config/autostart/`, your settings are applied on login regardless of whether you use GNOME, KDE, XFCE, or LXDE.

### Desktop-Specific Shortcuts
The mode-toggle script (`.wacom_toggle.sh`) is triggered by an internal key event (default `F12`). The installer provides instructions on how to bind this key in popular Desktop Environments.

---

## 📂 Repository Structure

```text
.
├── install.sh              # Master interactive installer (Main Entry Point)
├── .wacom_config.sh        # Core configuration (Loads dynamic settings)
├── .wacom_toggle.sh        # Tablet/Mouse mode switcher logic
├── .wacom_udev_trigger.sh  # Bridge script for system-level udev events
├── LICENSE                 # MIT License
└── README.md               # Documentation
```

---

## 🚀 Quick Start

### 1. Prerequisites
Ensure you have the Wacom X11 drivers and `libnotify` installed:
```bash
sudo apt update && sudo apt install xserver-xorg-input-wacom libnotify-bin
```

### 2. Installation & Configuration
Clone the repository and run the interactive installer:
```bash
git clone https://github.com/carlosindriago/wacom-linux.git
cd wacom-linux
chmod +x install.sh
./install.sh
```
Follow the on-screen prompts to configure your tablet preferences.

---

## 🛠️ Technical Deep Dive

### Persistent Hardware Detection
This project uses a **udev rule** (`99-wacom.rules`) that monitors the USB subsystem for the specific Vendor/Product ID (`056a:037a`). When the device is detected, it triggers a bridge script that applies your personalized profile stored in `~/.wacom_settings.env`.

### Environment-Based Settings
All your preferences are saved in a hidden environment file: `~/.wacom_settings.env`. This allows the scripts to remain generic and portable while your settings persist across re-installs or updates.

---

## 🧪 Customization

Want to fine-tune your settings manually? You can edit `~/.wacom_settings.env` directly:
- **ROTATION:** `half` (left-handed) or `none` (right-handed).
- **BUTTONS:** Use `3` for right-click, `2` for middle-click, or `key +ctrl +z -z -ctrl` for shortcuts.
- **SCREEN:** Use the name of your monitor (e.g., `HDMI-1`).

---

## 🤝 Contributing
Contributions are welcome! If you have a different Wacom model or want to add support for more Desktop Environments, feel free to submit a Pull Request.

---

## 📄 License
Distributed under the **MIT License**. See `LICENSE` for more information.

---
*Created with ❤️ by [carlosindriago](https://github.com/carlosindriago) - 2026*
