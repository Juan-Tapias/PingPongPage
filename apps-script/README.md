# Correos automáticos con Google Apps Script (gratis)

Reemplaza a la Cloud Function `notificarCorreosTorneo`, que exige el plan Blaze.

| Correo | Cuándo sale | A quién |
|---|---|---|
| 🏆 Gran Final | Cuando un torneo tiene campeón | Admins + (opcional) inscritos con pago verificado en copia oculta |
| 🔴 EN VIVO | Cuando un torneo pasa a "EN VIVO" con enlace | Admins |

- Revisa Firestore **cada minuto**, así que el correo llega en menos de ~1 minuto.
- Lee Firestore con **tu cuenta de Google** (sin claves ni cuentas de servicio).
- Envía con **tu Gmail**. Límite gratis: ~100 destinatarios por día.
- No repite correos: guarda lo enviado en las *Propiedades del script*.
- El contenido de los correos es el mismo que el de `functions/src/correo.js` (lo comprueba `functions/test/appsScript.test.js`).

## Instalación (una sola vez, ~5 minutos)

> Usa la **misma cuenta de Google que es dueña del proyecto Firebase `spinapptorneo`**.
> Esa cuenta será la que envía los correos.

1. Entra a <https://script.google.com> → **Nuevo proyecto**. Ponle nombre, por ejemplo `PingPongPage Correos`.
2. Borra el contenido de `Código.gs` y pega todo el contenido de [`Correos.gs`](Correos.gs).
3. Ve a **Configuración del proyecto** (engranaje) → activa **"Mostrar el archivo de manifiesto appsscript.json en el editor"**.
4. Vuelve al editor, abre `appsscript.json` y reemplázalo por el contenido de [`appsscript.json`](appsscript.json).
5. Revisa el bloque `CONFIG` al inicio de `Correos.gs`:
   - `ADMINS`: correos extra de admins separados por coma (vacío = solo tu cuenta).
   - `NOTIFICAR_PARTICIPANTES`: `true` para mandar la Gran Final en copia oculta a los inscritos.
   - `DRY_RUN`: pon `true` si quieres probar sin enviar correos reales.
6. Guarda (Ctrl + S).
7. En la barra de arriba elige la función **`enviarCorreoPrueba`** y pulsa **Ejecutar**.
   - Google pedirá permisos. Aparecerá "Google no ha verificado esta aplicación": pulsa
     **Configuración avanzada → Ir a PingPongPage Correos (no seguro)**. Es tu propio script.
   - Te debe llegar el correo "✅ PingPongPage: prueba de correo".
8. Elige la función **`instalar`** y pulsa **Ejecutar**. Esto:
   - crea el activador que corre `revisarTorneos` cada minuto;
   - toma una "foto" de cómo están los torneos ahora, **sin enviar nada**
     (así no se envían correos de finales viejas).

Listo. Desde ahora, cuando un torneo tenga campeón o se active "EN VIVO", llegará el correo.

## Revisar que funciona

- **Ejecuciones** (menú izquierdo): cada minuto aparece `revisarTorneos`. Si hay error, se ve ahí.
- Si un correo falla (por ejemplo, sin cuota), no se marca como enviado y se reintenta en el siguiente minuto.

## Detener

Ejecuta la función **`desinstalar`**.

## Errores comunes

| Mensaje | Qué hacer |
|---|---|
| `Firestore 403` / `PERMISSION_DENIED` | La cuenta del script no tiene acceso al proyecto Firebase. Usa la cuenta dueña o agrégala como Editor en Firebase → Configuración → Usuarios y permisos. |
| `Firestore 404` | Revisa `PROJECT_ID` y `DATABASE_ID` en `CONFIG` (`spinapptorneo` / `default`). |
| `Firestore 400` con "index" | Abre el enlace que trae el error para crear el índice que pide Firestore. |
| `Cuota diaria de Gmail insuficiente` | Se superaron ~100 destinatarios en el día. Se reintenta solo al día siguiente. |

## Despliegue de Firebase

Con esto ya **no hace falta desplegar Cloud Functions** (ni el plan Blaze):

```bash
firebase deploy --only hosting,firestore:rules
```
