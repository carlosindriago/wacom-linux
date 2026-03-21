#!/bin/bash
# Wacom Configuration Script (Dynamic Version)

# Cargar settings si existen, si no, usar valores por defecto
SETTINGS_FILE="$HOME/.wacom_settings.env"

if [ -f "$SETTINGS_FILE" ]; then
    source "$SETTINGS_FILE"
else
    # Default values (Zurdo mode)
    DEVICE_NAME="Wacom One by Wacom S Pen stylus"
    ROTATION="half"
    BUTTON_2="3"
    BUTTON_3="key F12"
    SCREEN="LVDS-1"
    PRESSURE_CURVE="0 20 80 100"
fi

# Aplicar configuración
xsetwacom --set "$DEVICE_NAME" Rotate "$ROTATION"
xsetwacom --set "$DEVICE_NAME" button 2 "$BUTTON_2"
xsetwacom --set "$DEVICE_NAME" button 3 "$BUTTON_3"
xsetwacom --set "$DEVICE_NAME" PressureCurve "$PRESSURE_CURVE"
xsetwacom --set "$DEVICE_NAME" MapToOutput "$SCREEN"
xsetwacom --set "$DEVICE_NAME" Mode Absolute
