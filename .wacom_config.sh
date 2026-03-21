#!/bin/bash
# Configuración ZURDO para Wacom One en MX-LXDE
# Dispositivo: Wacom One by Wacom S Pen stylus

# Buscamos el nombre exacto del Stylus para no depender de IDs
DEVICE="Wacom One by Wacom S Pen stylus"

chmod +x /home/carlos/.wacom_toggle.sh

# 1. ROTACIÓN: 180 grados para zurdos (half)
xsetwacom --set "$DEVICE" Rotate half

# 2. BOTÓN 2 (Abajo): Click Derecho (Número 3 en X11)
xsetwacom --set "$DEVICE" button 2 3

# 3. BOTÓN 3 (Arriba): Cambiar de modo (Usamos una tecla fantasma para el script)
xsetwacom --set "$DEVICE" button 3 "key F12"

# 4. SENSIBILIDAD: Presión suave
xsetwacom --set "$DEVICE" PressureCurve 0 20 80 100

# 5. MAPEO: Que el área de dibujo coincida con tu pantalla LVDS-1
xsetwacom --set "$DEVICE" MapToOutput LVDS-1

# 6. MODO INICIAL: Absoluto (Tableta)
xsetwacom --set "$DEVICE" Mode Absolute
