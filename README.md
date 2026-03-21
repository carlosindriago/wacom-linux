# ✍️ Wacom One (CTL-472) Linux Custom Setup

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform: Linux](https://img.shields.io/badge/Platform-Linux-lightgrey.svg)](https://kernel.org)
[![Maintainer: carlosindriago](https://img.shields.io/badge/Maintainer-carlosindriago-blue.svg)](https://github.com/carlosindriago)

A professional, automated configuration suite for **Wacom One (CTL-472)** on Linux environments. Optimized for **left-handed users**, featuring automatic device detection, persistent settings across re-connections, and dynamic mode toggling.

---

## 🌟 Key Features

- **🔄 Left-Handed Optimization:** Native 180-degree rotation (`half`) for a comfortable physical cable orientation.
- **🔌 Plug & Play Persistence:** Custom `udev` rules ensure your configuration is applied instantly whenever the tablet is connected.
- **⚡ Dynamic Mode Toggling:** Switch between **Tablet Mode** (Absolute) and **Mouse Mode** (Relative) using the pen's upper button.
- **🎯 Precise Mapping:** Automatic output mapping to specific displays (defaulting to `LVDS-1`).
- **📈 Custom Pressure Curves:** Fine-tuned sensitivity for a more natural drawing experience.
- **🛠️ Zero-Config Installer:** A robust shell script handles all the complex setup (udev rules, permissions, and autostart).

---

## 📂 Repository Structure

```text
.
├── install.sh              # Master installation script (Main Entry Point)
├── .wacom_config.sh        # Core configuration (Rotation, Mapping, Buttons)
├── .wacom_toggle.sh        # Tablet/Mouse mode switcher logic
├── .wacom_udev_trigger.sh  # Bridge script for system-level udev events
└── README.md               # You are here
```

---

## 🚀 Quick Start

### 1. Prerequisites
Ensure you have the Wacom X11 drivers and `libnotify` installed:
```bash
sudo apt update && sudo apt install xserver-xorg-input-wacom libnotify-bin
```

### 2. Installation
Clone the repository and run the installer:
```bash
git clone https://github.com/carlosindriago/wacom-linux.git
cd wacom-linux
chmod +x install.sh
./install.sh
```

---

## 🛠️ Technical Deep Dive

### Persistent Hardware Detection
Unlike simple startup scripts, this project utilizes a **udev rule** (`99-wacom.rules`) that monitors the USB subsystem for the specific Vendor/Product ID (`056a:037a`). When the device is detected, it triggers a bridge script that correctly identifies the current X11 session and applies the user-level configuration.

### Pen Button Mapping
The stylus is configured with high-productivity mappings:
- **Lower Button:** Right Click.
- **Upper Button:** Mode Toggle (mapped to internal `F12`).

### Openbox / LXDE Integration
To enable the mode toggle via the pen button, add this keybind to your `~/.config/openbox/lxde-rc.xml`:

```xml
<keybind key="F12">
  <action name="Execute">
    <command>~/.wacom_toggle.sh</command>
  </action>
</keybind>
```

---

## 🧪 Customization

Want to change the pressure sensitivity? Edit `~/.wacom_config.sh` and adjust the `PressureCurve`:
- **Softer:** `0 30 70 100`
- **Harder:** `20 0 100 80`
- **Linear:** `0 0 100 100`

---

## 🤝 Contributing
Contributions are welcome! If you have a different Wacom model or use a different Desktop Environment, feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License
Distributed under the **MIT License**. See `LICENSE` for more information.

---
*Created with ❤️ by [carlosindriago](https://github.com/carlosindriago) - 2026*
