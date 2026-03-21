#!/bin/bash
# Script puente para configurar la Wacom desde udev
# Este script corre como root pero ejecuta la config como el usuario carlos

# Esperamos un cachito a que X11 reconozca el dispositivo
sleep 2

# Ejecutamos la configuración del usuario carlos
# Le pasamos la información de la pantalla para que pueda usar xsetwacom
export DISPLAY=:0
export XAUTHORITY=/home/carlos/.Xauthority

# Ejecutamos el script de configuración que ya arreglamos
sudo -u carlos /home/carlos/.wacom_config.sh
