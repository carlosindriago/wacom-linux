#!/bin/bash
# 🛠️ Wacom Linux Tool - System Verifier
# Verifica que la instalación en el sistema fue exitosa

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "--- 🛠️ INICIANDO SYSTEM VERIFICATION ---\n"

# 1. Verificar Scripts
echo -n "Chequeando scripts en HOME... "
if [ -x "$HOME/.wacom_config.sh" ] && [ -x "$HOME/.wacom_toggle.sh" ] && [ -x "$HOME/.wacom_udev_trigger.sh" ]; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}MISSING OR NO EXEC PERMISSIONS${NC}"
fi

# 2. Verificar udev rule
echo -n "Chequeando udev rule... "
if [ -f "/etc/udev/rules.d/99-wacom.rules" ]; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}MISSING${NC}"
fi

# 3. Verificar Autostart
echo -n "Chequeando autostart... "
if [ -f "$HOME/.config/autostart/wacom-config.desktop" ]; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}MISSING${NC}"
fi

# 4. Verificar Settings
echo -n "Chequeando perfil de usuario... "
if [ -f "$HOME/.wacom_settings.env" ]; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}MISSING${NC}"
fi

echo -e "\n${GREEN}✅ VERIFICACIÓN COMPLETADA${NC}"
