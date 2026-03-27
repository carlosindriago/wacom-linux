# ✍️ Wacom Linux Tool (X11 & Multi-Monitor Edition)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Wacom Linux CI](https://github.com/carlosindriago/wacom-linux/actions/workflows/ci.yml/badge.svg)](https://github.com/carlosindriago/wacom-linux/actions/workflows/ci.yml)

A professional, automated configuration suite for **ANY Wacom Tablet** on Linux. Features dynamic device detection, advanced multi-monitor mapping, an interactive TUI installer, and a **modern Electron Dashboard GUI**.

> ⚠️ **CRITICAL REQUIREMENT: X11 ONLY**
> This tool relies on `xsetwacom` and `xrandr`. It **DOES NOT** support Wayland (which is the default in modern GNOME and KDE). If you are on Wayland, this script will not work. Wayland support via adapter pattern is planned for a future release.

---

## ⚡ Instalación Rápida (Un Comando)

```bash
# Con wget
wget -qO- https://raw.githubusercontent.com/carlosindriago/wacom-linux/main/setup.sh | bash

# O con curl
curl -fsSL https://raw.githubusercontent.com/carlosindriago/wacom-linux/main/setup.sh | bash
```

Esto instalará automáticamente:
- ✅ Scripts de configuración universal
- ✅ Integración con tu sesión X11
- ✅ Atajos de teclado para XFCE/Openbox
- ✅ Dashboard GUI (opcional)

---

## 🌟 Key Features

- **🖥️ Modern Dashboard GUI:** Electron-based dashboard with dark mode, real-time configuration, and visual pressure curve preview.
- **🚀 Universal Device Support (X11):** Automatically detects any Wacom stylus device (Intuos, One, Pro, etc.) using dynamic X11 sensing.
- **🖥️ Multi-Monitor Mapping:** Choose to map your tablet to a specific monitor or the entire extended desktop.
- **🔌 Vendor-Level Persistence:** Custom `udev` rules detect any Wacom hardware by Vendor ID (`056a`) for instant configuration.
- **🖱️ Tablet/Mouse Mode Toggle:** Seamlessly switch between absolute (drawing) and relative (navigation) modes.
- **🛠️ Professional TUI:** Interactive installer built with `whiptail` for a guided experience.
- **✏️ 60+ Button Actions:** Comprehensive button mapping with categorized options for tools, editing, navigation, and more.

---

## 🚀 Quick Start

### 1. Verify Display Server
Ensure you are running an X11 session. You can check this by running:
```bash
echo $XDG_SESSION_TYPE
```
*(It must output `x11`)*

### 2. One-Line Installation
```bash
wget -qO- https://raw.githubusercontent.com/carlosindriago/wacom-linux/main/setup.sh | bash
```

### 3. Manual Installation (Alternative)
If you prefer manual installation:
```bash
git clone https://github.com/carlosindriago/wacom-linux.git
cd wacom-linux
chmod +x install.sh
./install.sh
```

### 4. Dashboard GUI (Optional)
Launch the modern Electron dashboard for real-time configuration:
```bash
cd ~/.wacom-linux/dashboard
npm install
npm run dev
```

### 5. Uninstallation
To remove all scripts, configurations, and system rules:
```bash
chmod +x uninstall.sh
./uninstall.sh
```

---

## 🖥️ Dashboard GUI Features

The Electron dashboard provides a modern, user-friendly interface for Wacom tablet configuration:

### Interface
- **Dark Mode Elegance:** Professional dark theme with subtle gradients and modern styling
- **Frameless Window:** Custom title bar without system menus
- **Scrollable Content:** Smooth scrolling for all configuration options
- **Real-time Updates:** Device connection status and configuration changes

### Configuration Options
- **Orientation:** Normal, Rotated 90°, Rotated -90°, Flipped 180°
- **Positioning Mode:** Absolute (drawing) or Relative (mouse-like)
- **Screen Mapping:** All monitors or specific display selection
- **Pressure Curve:** 5 presets with visual SVG preview

### Button Mapping (60+ Actions)
Organized by categories:
- **Mouse:** Clicks, scroll, navigation buttons
- **Editing:** Undo, redo, copy, paste, save
- **View:** Zoom controls, fullscreen
- **Tools:** Brush, eraser, pan, fill, select
- **System:** Alt+Tab, close window, escape
- **Brush Size:** Increase/decrease size and opacity
- **Layers:** Layer selection 1-5, new layer, merge
- **Special:** No action, disabled

---

## 🧪 Advanced Features

### Dynamic Hardware Discovery
Unlike static scripts, this tool queries the X11 subsystem to find the active STYLUS device name. This means you can swap Wacom models without re-running the installer; the system will adapt to the new hardware automatically on the next connection.

### Screen Mapping Logic
You can map the tablet's active area to:
- **Individual Monitor:** (e.g., `HDMI-1`, `LVDS-1`) for precise drawing.
- **Full Desktop:** Map across all connected monitors (ideal for large multi-head setups).

### Universal Autostart
Instead of environment-specific configuration files, this tool uses the **XDG Autostart specification**. By placing a `.desktop` file in `~/.config/autostart/`, your settings are applied on login regardless of whether you use XFCE, LXDE, Mate, or an X11 session of GNOME/KDE.

### Desktop-Specific Shortcuts
The mode-toggle script (`.wacom_toggle.sh`) is triggered by an internal key event (default `F12`). The installer provides instructions on how to bind this key in popular Desktop Environments.

---

## 📂 Repository Structure

```text
.
├── install.sh              # Master interactive installer (Main Entry Point)
├── uninstall.sh            # Complete uninstallation script
├── .wacom_config.sh        # Core configuration (Loads dynamic settings)
├── .wacom_toggle.sh        # Tablet/Mouse mode switcher logic
├── .wacom_udev_trigger.sh  # Bridge script for system-level udev events
├── dashboard/              # Electron Dashboard GUI
│   ├── src/
│   │   ├── main/           # Electron main process + IPC handlers
│   │   │   └── services/   # WacomService, ConfigService
│   │   ├── preload/        # IPC bridge (contextBridge)
│   │   ├── renderer/       # React UI components
│   │   │   ├── components/ # WacomDashboard
│   │   │   ├── store/      # Zustand state management
│   │   │   └── styles/     # Tailwind CSS
│   │   └── shared/         # Shared types and contracts
│   ├── package.json
│   └── tailwind.config.js
├── LICENSE                 # MIT License
└── README.md               # Documentation
```

---

## 🛠️ Technical Deep Dive

### Persistent Hardware Detection
This project uses a **udev rule** (`99-wacom.rules`) that monitors the USB subsystem for the specific Vendor ID (`056a`). When the device is detected, it triggers a bridge script that applies your personalized profile stored in `~/.wacom_settings.env`.

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
Contributions are welcome! If you want to help build the Wayland compatibility layer or add support for more Desktop Environments, feel free to submit a Pull Request.

---

## 📄 License
Distributed under the **MIT License**. See `LICENSE` for more information.

---
*Created with ❤️ by [carlosindriago](https://github.com/carlosindriago) - 2026*
