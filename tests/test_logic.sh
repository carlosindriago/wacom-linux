#!/bin/bash
# 🧪 Wacom Linux Tool - Logic Tester (Mocks) - ROBUST VERSION
# Verifica que los scripts generen los comandos xsetwacom correctos

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Rutas locales
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_SCRIPT="$REPO_DIR/.wacom_config.sh"
TEMP_SETTINGS="/tmp/.wacom_settings_test.env"
MOCK_LOG="/tmp/xsetwacom_mock.log"

# Función para ejecutar el test
run_test() {
    local settings_path="$1"
    rm -f "$MOCK_LOG"
    
    # Ejecutamos en un entorno limpio inyectando el mock de xsetwacom
    # Usamos env -i para ignorar el entorno actual del usuario
    env -i SETTINGS_FILE="$settings_path" HOME="$HOME" bash --noprofile --norc -c "
        xsetwacom() { echo \"xsetwacom \$*\" >> \"$MOCK_LOG\"; };
        export -f xsetwacom;
        bash \"$CONFIG_SCRIPT\"
    "
}

echo "--- 🧪 INICIANDO UNIT TESTS ---"

# TEST 1: Verificar carga de settings personalizados
echo -n "Test 1: Carga de settings personalizados... "
cat <<EOF > "$TEMP_SETTINGS"
DEVICE_NAME="Test Device"
ROTATION="half"
BUTTON_2="3"
BUTTON_3="key F12"
SCREEN="HDMI-1"
PRESSURE_CURVE="0 20 80 100"
EOF

run_test "$TEMP_SETTINGS"

if [ -f "$MOCK_LOG" ] && grep -q "xsetwacom --set Test Device Rotate half" "$MOCK_LOG" && \
   grep -q "xsetwacom --set Test Device MapToOutput HDMI-1" "$MOCK_LOG"; then
    echo -e "${GREEN}PASSED${NC}"
else
    echo -e "${RED}FAILED${NC}"
    [ -f "$MOCK_LOG" ] && cat "$MOCK_LOG" || echo "No se generó el log de xsetwacom"
    exit 1
fi

# TEST 2: Verificar carga de valores por defecto
echo -n "Test 2: Carga de valores por defecto... "
run_test "/tmp/no_existe_file"

if [ -f "$MOCK_LOG" ] && grep -q "Rotate half" "$MOCK_LOG"; then
    echo -e "${GREEN}PASSED${NC}"
else
    echo -e "${RED}FAILED${NC}"
    [ -f "$MOCK_LOG" ] && cat "$MOCK_LOG" || echo "No se generó el log de xsetwacom"
    exit 1
fi

echo -e "\n${GREEN}✅ ¡TODOS LOS UNIT TESTS PASARON!${NC}"
rm -f "$MOCK_LOG" "$TEMP_SETTINGS"
