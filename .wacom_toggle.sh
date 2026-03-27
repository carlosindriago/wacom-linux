#!/bin/bash
# 🖱️ Wacom Mode Toggle (Dynamic Version)
RED='\033[0;31m'
NC='\033[0m'
# Alterna entre modo Tableta (Absoluto) y Mouse (Relativo)

# 1. Cargar settings para saber el monitor preferido
SETTINGS_FILE="$HOME/.wacom_settings.env"

# Verify xsetwacom is available
if ! command -v xsetwacom &> /dev/null; then
    echo -e "${RED}❌ ERROR: 'xsetwacom' no está instalado. Instálalo con 'sudo apt install xserver-xorg-input-wacom'.${NC}"
    exit 1
fi

# shellcheck source=/dev/null
[ -f "$SETTINGS_FILE" ] && source "$SETTINGS_FILE"
SCREEN="${SCREEN:-ALL}"

# 2. Detectar el STYLUS dinámicamente
DEVICE=$(xsetwacom --list devices | grep -i 'STYLUS' | cut -f 1 | xargs)

if [ -z "$DEVICE" ]; then
    command -v notify-send &> /dev/null && notify-send "Wacom" "No se detectó el lápiz para cambiar de modo." --icon=error
    exit 1
fi

# 3. Alternar Modo
CUR_MODE=$(xsetwacom --get "$DEVICE" Mode)

if [ "$CUR_MODE" = "Absolute" ]; then
    xsetwacom --set "$DEVICE" Mode Relative
    command -v notify-send &> /dev/null && notify-send -t 2000 "Wacom" "<b>MODO MOUSE</b> (Relativo) 🖱️" --icon=input-mouse
else
    xsetwacom --set "$DEVICE" Mode Absolute
    # Re-aplicar el mapeo de pantalla para que no se pierda
    if [ "$SCREEN" = "ALL" ]; then
        xsetwacom --set "$DEVICE" MapToOutput "desktop"
    else
        xsetwacom --set "$DEVICE" MapToOutput "$SCREEN"
    fi
    command -v notify-send &> /dev/null && notify-send -t 2000 "Wacom" "<b>MODO TABLETA</b> (Absoluto) ✍️" --icon=input-tablet
fi
