#!/bin/bash
# 🎨 Instalador Wacom One (Zurdo Edition) para MX Linux LXDE
# Creado para Carlos - 2026

set -e

# Colores para la terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================================${NC}"
echo -e "${GREEN}   🚀 INSTALADOR WACOM ONE (ZURDO EDITION)          ${NC}"
echo -e "${BLUE}====================================================${NC}"

# 1. Copiar scripts al HOME
echo -e "\n${BLUE}[1/4] Instalando scripts en el HOME...${NC}"
cp .wacom_config.sh "$HOME/.wacom_config.sh"
cp .wacom_toggle.sh "$HOME/.wacom_toggle.sh"
cp .wacom_udev_trigger.sh "$HOME/.wacom_udev_trigger.sh"

chmod +x "$HOME/.wacom_config.sh"
chmod +x "$HOME/.wacom_toggle.sh"
chmod +x "$HOME/.wacom_udev_trigger.sh"

echo "✅ Scripts instalados y con permisos de ejecución."

# 2. Configurar Regla de udev (Requiere SUDO)
echo -e "\n${BLUE}[2/4] Configurando regla de sistema (udev)...${NC}"
echo "Se pedirá contraseña de sudo para escribir en /etc/udev/rules.d/"

RULE_PATH="/etc/udev/rules.d/99-wacom.rules"
# Usamos el ID de la Wacom detectado (056a:037a)
echo 'ACTION=="add", SUBSYSTEM=="usb", ATTR{idVendor}=="056a", ATTR{idProduct}=="037a", RUN+="'"$HOME"/.wacom_udev_trigger.sh'"' | sudo tee "$RULE_PATH" > /dev/null

sudo udevadm control --reload-rules
sudo udevadm trigger

echo "✅ Regla de udev configurada y activada."

# 3. Configurar Autostart de LXDE (Opcional pero recomendado)
echo -e "\n${BLUE}[3/4] Configurando inicio automático en LXDE...${NC}"
AUTOSTART_FILE="$HOME/.config/lxsession/LXDE/autostart"

if [ -f "$AUTOSTART_FILE" ]; then
    if ! grep -q ".wacom_config.sh" "$AUTOSTART_FILE"; then
        echo "@$HOME/.wacom_config.sh" >> "$AUTOSTART_FILE"
        echo "✅ Script añadido al autostart de LXDE."
    else
        echo "ℹ️ El script ya estaba en el autostart."
    fi
else
    echo "⚠️ No se encontró el archivo de autostart de LXDE en $AUTOSTART_FILE"
fi

# 4. Configurar Atajo de Teclado en Openbox (Para el botón del lápiz)
echo -e "\n${BLUE}[4/4] Recordatorio de Openbox...${NC}"
echo "Recordá que para que el botón de arriba del lápiz funcione como 'Toggle',"
echo "debés tener en tu ~/.config/openbox/lxde-rc.xml vinculado la tecla F12"
echo "al script ~/.wacom_toggle.sh."

echo -e "\n${GREEN}====================================================${NC}"
echo -e "${GREEN}   🎉 ¡INSTALACIÓN COMPLETADA!                      ${NC}"
echo -e "${BLUE}====================================================${NC}"
echo "Desconectá y reconectá tu Wacom para verificar."
