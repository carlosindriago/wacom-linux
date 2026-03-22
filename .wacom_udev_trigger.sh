#!/bin/bash
# Script puente para configurar la Wacom desde udev
# Este script corre como root pero ejecuta la config como el usuario carlos

# Esperamos un cachito a que X11 reconozca el dispositivo
sleep 2

# Ejecutamos la configuración del usuario carlos
# Le pasamos la información de la pantalla para que pueda usar xsetwacom
# Ejecutamos el script de configuración pasando las variables de entorno en la misma línea
sudo -u carlos DISPLAY=:0 XAUTHORITY=/home/carlos/.Xauthority /home/carlos/.wacom_config.sh
