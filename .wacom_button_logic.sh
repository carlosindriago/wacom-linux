#!/bin/bash
# 🧠 Wacom Multi-Action Controller
# Maneja: 1 tap (Toggle), 2 taps (Copy), 3 taps (Paste), Hold (Alt+Tab)

# Archivos temporales para el estado
COUNT_FILE="/tmp/wacom_button_count"
TIMER_PID_FILE="/tmp/wacom_timer_pid"
LAST_CLICK_FILE="/tmp/wacom_last_click"

# Configuraciones
TAP_TIMEOUT=0.4 # Tiempo máximo entre clicks (segundos)
HOLD_THRESHOLD=0.5 # A partir de cuánto es un "hold" (segundos)

NOW=$(date +%s.%N)

# 1. Detectar si es un "Hold" (Llamada repetida por la repetición de tecla del sistema)
if [ -f "$LAST_CLICK_FILE" ]; then
    LAST_CLICK=$(cat "$LAST_CLICK_FILE")
    DIFF=$(echo "$NOW - $LAST_CLICK" | bc)
    # Si la diferencia es ínfima, es una repetición de tecla (Hold)
    if (( $(echo "$DIFF < 0.1" | bc -l) )); then
        # Solo ejecutamos Alt+Tab una vez por cada ráfaga de repetición
        if [ ! -f "/tmp/wacom_hold_active" ]; then
            touch "/tmp/wacom_hold_active"
            xdotool key alt+tab
        fi
        echo "$NOW" > "$LAST_CLICK_FILE"
        exit 0
    fi
fi

# 2. Lógica de Multi-Tap
echo "$NOW" > "$LAST_CLICK_FILE"
rm -f "/tmp/wacom_hold_active"

# Incrementar contador
COUNT=$(cat "$COUNT_FILE" 2>/dev/null || echo 0)
COUNT=$((COUNT + 1))
echo "$COUNT" > "$COUNT_FILE"

# Matar el timer anterior si existe (con verificación segura)
if [ -f "$TIMER_PID_FILE" ]; then
    PREV_PID=$(cat "$TIMER_PID_FILE")
    # Verificar que el PID corresponda al proceso sleep que lanzamos
    if ps -p "$PREV_PID" -o cmd= | grep -q "^sleep $TAP_TIMEOUT$"; then
        kill "$PREV_PID" 2>/dev/null
    else
        echo "[WARN] PID $PREV_PID no corresponde a nuestro timer; no se mata." >&2
    fi
    rm -f "$TIMER_PID_FILE"
fi

# Iniciar nuevo timer
(
    sleep $TAP_TIMEOUT
    FINAL_COUNT=$(cat "$COUNT_FILE")
    
    case $FINAL_COUNT in
        1)
            # 1 Tap: Toggle Modo Mouse/Tableta
            "$HOME/.wacom_toggle.sh"
            ;;
        2)
            # 2 Taps: Copiar (Ctrl+C)
            xdotool key ctrl+c
            notify-send -t 1000 "Wacom" "<b>COPIADO</b> 📋" --icon=edit-copy
            ;;
        3)
            # 3 Taps: Pegar (Ctrl+V)
            xdotool key ctrl+v
            notify-send -t 1000 "Wacom" "<b>PEGADO</b> 📥" --icon=edit-paste
            ;;
    esac
    
    # Resetear contador
    echo 0 > "$COUNT_FILE"
) &
echo $! > "$TIMER_PID_FILE"
