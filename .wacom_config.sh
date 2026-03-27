#!/bin/bash
# 🧙‍♂️ Wacom Master Config - "The Re-Detector"
# Detecta y configura TODOS los componentes de la Wacom (Stylus, Eraser, Pad, Touch)

# Colores para la terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Localizar el archivo de configuración de forma robusta
if [ -n "${SUDO_USER:-}" ]; then
  USER_HOME=$(getent passwd "$SUDO_USER" | cut -d: -f6)
else
  USER_HOME=$HOME
fi
SETTINGS_FILE="$USER_HOME/.wacom_settings.env"

if [ -f "$SETTINGS_FILE" ]; then
    # shellcheck source=/dev/null
    source "$SETTINGS_FILE"
else
    # Valores por defecto de emergencia
    ROTATION="none"
    BUTTON_2="3"
    BUTTON_3="key F10"
    SCREEN="ALL"
    PRESSURE_CURVE="0 20 80 100"
fi

echo -e "${BLUE}🔍 Buscando hardware Wacom en el sistema...${NC}"
# Verify xsetwacom utility exists
if ! command -v xsetwacom &> /dev/null; then
  echo -e "${RED}❌ ERROR: 'xsetwacom' no está instalado. Instálalo con 'sudo apt install xserver-xorg-input-wacom'.${NC}"
  exit 1
fi

# 2. Bucle de reintento (Más paciente para Hotplug)
# A veces Xorg tarda un toque en asignar los dispositivos al driver wacom
echo -e "${YELLOW}⏳ Esperando a que el driver X11 asiente los dispositivos...${NC}"
sleep 2

for i in {1..15}; do
    RAW_DEVICES=$(xsetwacom --list devices | grep -v '^$')
    mapfile -t DEVICES < <(echo "$RAW_DEVICES" | cut -f 1 | sed 's/[[:space:]]*$//')
    
    if [ ${#DEVICES[@]} -gt 0 ]; then
        break
    fi
    echo -e "${YELLOW}   (Intento $i/15) Buscando hardware...${NC}"
    sleep 1
done

if [ ${#DEVICES[@]} -eq 0 ]; then
    echo -e "${RED}❌ ERROR: No se detectó ninguna tableta Wacom conectada.${NC}"
    echo -e "${YELLOW}💡 Tip: Revisá el cable USB o probá en otro puerto.${NC}"
    # Only notify if notify-send is available
    command -v notify-send &> /dev/null && notify-send "Wacom Error" "No se detectó la tableta. ¿Está bien conectada?" --icon=error
    exit 1
fi

# 3. Reporte de detección (Lo que pediste)
echo -e "${GREEN}✅ ¡Tableta Detectada!${NC}"
echo -e "${BLUE}--------------------------------------------------${NC}"
echo -e "$RAW_DEVICES" | while read -r line; do
    NAME=$(echo "$line" | cut -f 1 | xargs)
    ID=$(echo "$line" | awk -F'id: ' '{print $2}' | awk '{print $1}')
    TYPE=$(echo "$line" | awk -F'type: ' '{print $2}' | awk '{print $1}')
    echo -e "📍 ${YELLOW}Componente:${NC} $NAME ${BLUE}(ID: $ID, Tipo: $TYPE)${NC}"
done
echo -e "${BLUE}--------------------------------------------------${NC}"

# 4. Aplicar configuración a cada componente
echo -e "🚀 Aplicando tus ajustes personalizados..."

for DEV in "${DEVICES[@]}"; do
    # Rotación para TODOS (Indispensable para zurdos)
    xsetwacom --set "$DEV" Rotate "$ROTATION"
    
    # Mapeo de pantalla
    if [ "$SCREEN" = "ALL" ]; then
        xsetwacom --set "$DEV" MapToOutput "desktop"
    else
        xsetwacom --set "$DEV" MapToOutput "$SCREEN"
    fi

    # Configuración específica por tipo
    TYPE=$(xsetwacom --list devices | grep "$DEV" | awk -F'type: ' '{print $2}' | awk '{print $1}')
    
    case "$TYPE" in
STYLUS)
    xsetwacom --set "$DEV" button 2 "$BUTTON_2"
    xsetwacom --set "$DEV" button 3 "$BUTTON_3"
    # shellcheck disable=SC2086
    xsetwacom --set "$DEV" PressureCurve $PRESSURE_CURVE
    xsetwacom --set "$DEV" Mode Absolute
    ;;
        ERASER)
            xsetwacom --set "$DEV" Mode Absolute
            ;;
    esac
done

# 5. Armar resumen para la notificación
[ "$ROTATION" = "half" ] && HUMAN_ROT="ZURDO (180°)" || HUMAN_ROT="DIESTRO (0°)"
[ "$SCREEN" = "ALL" ] && HUMAN_SCREEN="Todo el Escritorio" || HUMAN_SCREEN="$SCREEN"
MAIN_MODEL=$(echo "${DEVICES[0]}" | sed 's/ stylus//I' | sed 's/ eraser//I' | sed 's/ pad//I' | xargs)

# Only notify if notify-send is available
command -v notify-send &> /dev/null && notify-send -t 5000 "Wacom Detectada ✅" \
    "<b>Modelo:</b> $MAIN_MODEL\n<b>Orientación:</b> $HUMAN_ROT\n<b>Monitor:</b> $HUMAN_SCREEN" \
    --icon=input-tablet

echo -e "${GREEN}✨ ¡Todo listo! Tu $MAIN_MODEL está configurada como $HUMAN_ROT.${NC}"
