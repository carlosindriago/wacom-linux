# 🤝 Cómo Contribuir

¡Gracias por querer mejorar este proyecto! Seguir estas reglas nos ayuda a mantener el código limpio y profesional.

## Cómo empezar
1. Haz un **Fork** de este repositorio.
2. Crea una **rama** para tu cambio: `git checkout -b feature/mi-mejora` o `git checkout -b fix/problema-encontrado`.
3. Haz tus cambios y **pruébalos** con tu hardware.
4. Haz un **Push** a tu rama: `git push origin feature/mi-mejora`.
5. Abre un **Pull Request** (PR) detallando qué cambiaste y por qué.

## Reglas de estilo
- Mantén los nombres de los scripts claros y con prefijo `.wacom_` si son configuraciones de usuario.
- Usa variables en los scripts en lugar de valores fijos (como IDs de dispositivos).
- Comenta el código, especialmente las partes de `udev` o `xsetwacom` que no sean obvias.

## Reporte de Errores
Si encuentras un bug o tu modelo de Wacom no funciona, por favor abre un **Issue** incluyendo:
- Modelo exacto de Wacom.
- Distribución de Linux que usas.
- Error que aparece en la terminal al ejecutar los scripts.

---
*¡Vamos a hacer que usar una Wacom en Linux sea un placer para todos!*
