#!/bin/bash
# Wacom Configuration Script - UNIVERSAL & DYNAMIC VERSION

# Cargar settings si existen
SETTINGS_FILE="${SETTINGS_FILE:-$HOME/.wacom_settings.env}"
# shellcheck source=/dev/null
[ -f "$SETTINGS_FILE" ] && source "$SETTINGS_FILE"

# --- DETECCIÓN DINÁMICA DE HARDWARE ---
# Buscamos el primer dispositivo de tipo STYLUS que nos devuelva xsetwacom
DEVICE_NAME=$(xsetwacom --list devices | grep -i 'STYLUS' | cut -f 1 | xargs)

if [ -z "$DEVICE_NAME" ]; then
    echo "⚠️ No se detectó ninguna tableta Wacom conectada."
    exit 0
fi

# Valores por defecto si no existen en el .env
ROTATION="${ROTATION:-none}"
BUTTON_2="${BUTTON_2:-3}"
BUTTON_3="${BUTTON_3:-key F12}"
SCREEN="${SCREEN:-next}" # 'next' es un comando especial de xsetwacom o el nombre de la pantalla
PRESSURE_CURVE="${PRESSURE_CURVE:-0 20 80 100}"

# --- APLICAR CONFIGURACIÓN ---
echo "Configurando dispositivo: $DEVICE_NAME"

xsetwacom --set "$DEVICE_NAME" Rotate "$ROTATION"
xsetwacom --set "$DEVICE_NAME" button 2 "$BUTTON_2"
xsetwacom --set "$DEVICE_NAME" button 3 "$BUTTON_3"
xsetwacom --set "$DEVICE_NAME" PressureCurve "$PRESSURE_CURVE"

# Manejo de mapeo de pantalla
if [ "$SCREEN" == "ALL" ]; then
    # Reseteamos el mapeo para que use todo el escritorio
    xsetwacom --set "$DEVICE_NAME" MapToOutput "desktop"
else
    xsetwacom --set "$DEVICE_NAME" MapToOutput "$SCREEN"
fi

xsetwacom --set "$DEVICE_NAME" Mode Absolute

# Notificación visual
notify-send "Wacom Configurada" "Modelo: $DEVICE_NAME\nModo: $ROTATION\nPantalla: $SCREEN" --icon=input-tablet
