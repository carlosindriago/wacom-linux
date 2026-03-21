# 🎨 Guía de Configuración: Wacom One (Zurdo Edition) - MX Linux LXDE

Esta guía contiene la configuración personalizada para tu **Wacom One**, optimizada para uso con la mano **izquierda** en un entorno liviano como **LXDE**.

---

## 🚀 Resumen de Funcionamiento

### 1. Posición Física (Hardware)
*   **Rotación:** 180 grados (`half`).
*   **Orientación:** Colocá la tableta con el **cable saliendo hacia la derecha**. De esta forma, el área activa coincidirá con tu movimiento natural y el cable no te molestará.

### 2. Botones del Lápiz (Stylus)
Tu lápiz tiene dos botones configurados para máxima productividad:
*   **Botón Inferior (Cerca de la punta):** Actúa como **Click Derecho** del mouse.
*   **Botón Superior:** Es el **Selector de Modo**. Alterna entre modo dibujo y modo navegación.

---

## 🔄 Los Dos Modos de Uso

Cada vez que presiones el **botón superior** del lápiz, verás una notificación en pantalla:

1.  **Modo Tableta (Absoluto):** 
    *   Ideal para: Dibujo, diseño, retoque.
    *   Cómo funciona: El área de la tableta representa exactamente tu pantalla. Donde apoyás el lápiz, ahí aparece el cursor.
2.  **Modo Mouse (Relativo):** 
    *   Ideal para: Navegar por internet, carpetas, uso general.
    *   Cómo funciona: El lápiz se comporta como un touchpad. Podés levantar el lápiz y "remar" para mover el cursor grandes distancias.

---

## 🛠️ Archivos de Configuración (Las Tripas)

Si alguna vez necesitás ajustar algo "bajo el capó", estos son los archivos que creamos:

*   **`~/.wacom_config.sh`**: El script maestro que define la rotación, los botones y la sensibilidad. Se ejecuta automáticamente al iniciar sesión.
*   **`~/.wacom_toggle.sh`**: El script inteligente que hace el cambio entre modo mouse y tableta.
*   **`~/.config/lxsession/LXDE/autostart`**: Aquí añadimos la orden para que tu configuración cargue sola al prender la PC.
*   **`~/.config/openbox/lxde-rc.xml`**: Aquí vinculamos el botón del lápiz (tecla F12 interna) con el cambio de modo.

---

## 🧪 Ajustes Personalizados (Tuning)

Si querés cambiar la sensibilidad de presión, editá el archivo `~/.wacom_config.sh` y buscá la línea:
`xsetwacom --set 9 PressureCurve 0 20 80 100`

*   **Más Sensible (Blando):** `0 30 70 100` (Pintás fuerte sin apretar casi nada).
*   **Lineal (Normal):** `0 0 100 100` (Como viene de fábrica).
*   **Menos Sensible (Duro):** `20 0 100 80` (Tenés que apretar de verdad para trazos oscuros).

---

## 🆘 Solución de Problemas Rápidos

*   **¿El botón de modo no responde?** 
    Ejecutá en una terminal: `openbox --reconfigure`
*   **¿La tableta no está rotada?** 
    Ejecutá en una terminal: `~/.wacom_config.sh`
*   **¿Cambié la tableta de puerto USB y no anda?**
    Revisá si el ID cambió con: `xsetwacom --list devices`. Si el ID ya no es "9", deberás actualizar el número en los scripts `.sh`.

---
*Guía generada para Carlos - MX Linux 2026*
