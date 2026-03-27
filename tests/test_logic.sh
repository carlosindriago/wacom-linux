#!/bin/bash
# 🧪 Wacom Linux Tool - Advanced Logic Tester (CI-Safe)
# shellcheck disable=SC2329

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

# Create settings file in the CORRECT location ($HOME/.wacom_settings.env)
# The config script calculates: SETTINGS_FILE="$USER_HOME/.wacom_settings.env"
cat > "$HOME/.wacom_settings.env" << 'EOF'
ROTATION="half"
BUTTON_2="3"
BUTTON_3="key F10"
SCREEN="ALL"
PRESSURE_CURVE="0 20 80 100"
EOF

# Create mock runner script
cat > /tmp/mock_runner.sh << 'MOCKSCRIPT'
#!/bin/bash

# Mock xsetwacom - captures all calls
xsetwacom() {
    case "$1" in
        --list)
            echo -e "Wacom Intuos Pro M Pen stylus \t id: 10 \t type: STYLUS"
            ;;
        --set)
            echo "SET: $*" >> /tmp/xsetwacom_mock.log
            ;;
        --get)
            echo "Absolute"
            ;;
    esac
}

# Mock notify-send for CI
notify-send() {
    :
}

export -f xsetwacom
export -f notify-send

# Source the config script
source "$1"
MOCKSCRIPT

chmod +x /tmp/mock_runner.sh

# Run the wrapper
/tmp/mock_runner.sh "$CONFIG_SCRIPT" 2>&1 || true

# Check results
if [ -f "$MOCK_LOG" ] && grep -q "Rotate half" "$MOCK_LOG"; then
    echo -e "${GREEN}PASSED${NC}"
else
    echo -e "${RED}FAILED${NC}"
    echo "Expected: Rotate half"
    [ -f "$MOCK_LOG" ] && cat "$MOCK_LOG" || echo "No se generó el log."
    rm -f "$MOCK_LOG" "$HOME/.wacom_settings.env" /tmp/mock_runner.sh
    exit 1
fi

echo -e "\n${GREEN}✅ ¡TODOS LOS TESTS PASARON!${NC}"
rm -f "$MOCK_LOG" "$HOME/.wacom_settings.env" /tmp/mock_runner.sh
