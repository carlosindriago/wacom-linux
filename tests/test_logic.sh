#!/bin/bash
# 🧪 Wacom Linux Tool - Advanced Logic Tester (CI-Safe)

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

# Create settings file with test values
cat > /tmp/.test_settings.env << 'EOF'
ROTATION="half"
BUTTON_2="3"
BUTTON_3="key F10"
SCREEN="ALL"
PRESSURE_CURVE="0 20 80 100"
EOF

# Run the config script with mocked commands
# We need to export the mock functions and run in a subshell
(
    # Mock xsetwacom command
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
        return 0
    }
    export -f xsetwacom
    
    # Mock notify-send (not available in CI)
    notify-send() {
        return 0
    }
    export -f notify-send
    
    export SETTINGS_FILE="/tmp/.test_settings.env"
    
    # Run the config script
    bash "$CONFIG_SCRIPT"
) > /dev/null 2>&1

# Check results
if [ -f "$MOCK_LOG" ] && grep -q "Rotate half" "$MOCK_LOG"; then
    echo -e "${GREEN}PASSED${NC}"
else
    echo -e "${RED}FAILED${NC}"
    [ -f "$MOCK_LOG" ] && cat "$MOCK_LOG" || echo "No se generó el log."
    rm -f "$MOCK_LOG" /tmp/.test_settings.env
    exit 1
fi

echo -e "\n${GREEN}✅ ¡TODOS LOS TESTS PASARON!${NC}"
rm -f "$MOCK_LOG" /tmp/.test_settings.env
