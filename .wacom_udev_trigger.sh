#!/bin/bash
# 🔌 Wacom Hotplug Trigger (Robust Version)
# Este script es el "puente" entre el USB y tu sesión de pantalla.

LOG_FILE="/tmp/wacom_hotplug.log"
LOCK_FILE="/tmp/wacom_config.lock"

# Evitar disparos múltiples seguidos (udev manda uno por cada componente de la tableta)
# Si el archivo de lock se creó hace menos de 5 segundos, no hacemos nada.
if [ -f "$LOCK_FILE" ]; then
    NOW=$(date +%s)
    LAST=$(stat -c %Y "$LOCK_FILE")
    DIFF=$((NOW - LAST))
    if [ "$DIFF" -lt 5 ]; then
        echo "Evento ignorado (ya se está configurando la tableta hace $DIFF segundos)." >> "$LOG_FILE"
        exit 0
    fi
fi

touch "$LOCK_FILE"
echo "--- Evento USB detectado a las $(date) ---" > "$LOG_FILE"

# 1. Detectar al usuario activo (método robusto)
# - Preferimos el login name del usuario gráfico (logname)
# - Si falla, usamos 'who' filtrando la pantalla X
# - Como último recurso, empleamos 'loginctl' para la primera sesión no‑root
REAL_USER=$(logname 2>/dev/null || true)
if [ -z "$REAL_USER" ]; then
    # Fallback: quien está conectado a una X11 display
    REAL_USER=$(who | grep '(:[0-9])' | awk '{print $1}' | head -n 1)
fi
if [ -z "$REAL_USER" ]; then
    # Fallback: primera sesión no‑root listada por loginctl
    REAL_USER=$(loginctl list-sessions --no-legend | awk '$3 != "root" {print $3; exit}')
fi
if [ -z "$REAL_USER" ]; then
    echo "ERROR: No se pudo determinar el usuario activo" >&2
    exit 1
fi

# Resolución segura del home sin eval
USER_HOME=$(getent passwd "$REAL_USER" | cut -d: -f6)
XAUTH="$USER_HOME/.Xauthority"

# shellcheck disable=SC2046
[ ! -f "$XAUTH" ] && XAUTH=$(find /run/user/$(id -u "$REAL_USER") -name "Xauthority" 2>/dev/null | head -n 1)

# 2. Lanzar la configuración en SEGUNDO PLANO
(
# Un toque de espera para que X11 asiente el hardware
sleep 5
# shellcheck disable=SC2024
sudo -u "$REAL_USER" DISPLAY=:0 XAUTHORITY="$XAUTH" "$USER_HOME/.wacom_config.sh" >> "$LOG_FILE" 2>&1
# Borrar el lock después de configurar (por las dudas)
rm -f "$LOCK_FILE"
) &

echo "Proceso de configuración lanzado para el usuario: $REAL_USER" >> "$LOG_FILE"
