# ✍️ Wacom Linux Tool (Universal Setup)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform: Linux](https://img.shields.io/badge/Platform-Linux-lightgrey.svg)](https://kernel.org)
[![Maintainer: carlosindriago](https://img.shields.io/badge/Maintainer-carlosindriago-blue.svg)](https://github.com/carlosindriago)

An automated, professional configuration suite for **Wacom One (CTL-472)** on Linux environments. Features an interactive wizard to customize orientation (Left/Right handed), button mappings, and display settings with persistent plug-and-play support.

---

## 🌟 Key Features

- **🔄 Universal Orientation:** Support for both Left-Handed (180° rotation) and Right-Handed users.
- **🔌 Plug & Play Persistence:** Custom `udev` rules apply your saved settings instantly upon connection.
- **⌨️ Interactive Wizard:** Easily configure pen buttons (Right Click, Middle Click, Undo, Mode Toggle).
- **🎯 Smart Mapping:** Visual detection of active monitors for precise tablet-to-screen mapping.
- **🛠️ Persistent Profiles:** Settings are stored in `~/.wacom_settings.env` for easy manual adjustment or restoration.

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
