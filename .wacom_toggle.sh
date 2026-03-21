#!/bin/bash
# Script para alternar entre modo Tableta (Absolute) y Mouse (Relative)
# Dispositivo: Wacom One by Wacom S Pen stylus

DEVICE="Wacom One by Wacom S Pen stylus"
CUR_MODE=$(xsetwacom --get "$DEVICE" Mode)

if [ "$CUR_MODE" = "Absolute" ]; then
    xsetwacom --set "$DEVICE" Mode Relative
    notify-send "Wacom" "Modo Mouse (Relativo) ACTIVADO" --icon=input-mouse
else
    xsetwacom --set "$DEVICE" Mode Absolute
    xsetwacom --set "$DEVICE" MapToOutput LVDS-1
    notify-send "Wacom" "Modo Tableta (Absoluto) ACTIVADO" --icon=input-tablet
fi
