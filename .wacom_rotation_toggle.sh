#!/bin/bash
# 🔃 Wacom Orientation Toggle (Zurdo/Diestro)
# Alterna entre rotación 0° (Diestro) y 180° (Zurdo) y PERSISTE el cambio.

USER_HOME=$(eval echo "~$USER")
SETTINGS_FILE="$USER_HOME/.wacom_settings.env"

# 1. Cargar config actual (si existe)
[ -f "$SETTINGS_FILE" ] && source "$SETTINGS_FILE"
CUR_ROT="${ROTATION:-none}"

# 2. Definir nueva rotación
if [ "$CUR_ROT" = "half" ]; then
    NEW_ROT="none"
    MSG="Modo DIESTRO (0°) ✍️"
else
    NEW_ROT="half"
    MSG="Modo ZURDO (180°) ✍️"
fi

# 3. Guardar el cambio de forma permanente en el archivo .env
# Reemplazamos la línea ROTATION="..." por la nueva
sed -i "s/ROTATION=.*/ROTATION=\"$NEW_ROT\"/" "$SETTINGS_FILE"

# 4. Aplicar a todos los dispositivos detectados (Llamamos al script maestro para que haga el laburo pesado)
# Le pasamos la rotación como variable de entorno para que no falle
export ROTATION="$NEW_ROT"
"$USER_HOME"/.wacom_config.sh

# 5. Notificar
notify-send -t 3000 "Wacom" "Orientación cambiada a: <b>$MSG</b>" --icon=input-tablet
