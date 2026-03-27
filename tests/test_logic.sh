#!/bin/bash
# 🧪 Wacom Linux Tool - Advanced Logic Tester (SUPER CLEAN)

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_SCRIPT="$REPO_DIR/.wacom_config.sh"
MOCK_LOG="/tmp/xsetwacom_mock.log"

echo "--- 🧪 INICIANDO ADVANCED LOGIC TESTS ---"

# TEST 1: Detección dinámica (Intuos Pro)
echo -n "Test 1: Detección dinámica de modelo... "
rm -f "$MOCK_LOG"
cat <<EOF > /tmp/.test_settings.env
DEVICE_NAME="Test Device"
ROTATION="half"
SCREEN="HDMI-1"
EOF

# Inyectamos el mock directamente en el comando bash
bash --noprofile --norc -c "
    xsetwacom() {
        if [ \"\$1\" = '--list' ]; then
            echo -e \"Wacom Intuos Pro M Pen stylus \t id: 10 \t type: STYLUS\"
        elif [ \"\$1\" = '--set' ]; then
            echo \"SET: \$*\" >> \"$MOCK_LOG\"
        fi
    }
    export -f xsetwacom
    export SETTINGS_FILE=\"/tmp/.test_settings.env\"
    bash \"$CONFIG_SCRIPT\" > /dev/null
"

if [ -f "$MOCK_LOG" ] && grep -q "Wacom Intuos Pro M Pen stylus Rotate half" "$MOCK_LOG"; then
    echo -e "${GREEN}PASSED${NC}"
else
    echo -e "${RED}FAILED${NC}"
    [ -f "$MOCK_LOG" ] && cat "$MOCK_LOG" || echo "No se generó el log."
    exit 1
fi

echo -e "\n${GREEN}✅ ¡TODOS LOS TESTS PASARON!${NC}"
rm -f "$MOCK_LOG" /tmp/.test_settings.env
