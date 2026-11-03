# Cambios: playoffs Fase 2, calidad y correos

## 1. Perfil y avatar
- Módulo `src/modules/perfil/` y servicio `src/services/perfilService.ts` (con tests).
- Componente `src/components/AvatarJugador.vue` para mostrar el avatar del jugador.
- Avatares en Storage bajo `usuarios/{uid}/...`.

## 2. Reglas Firestore / Storage
- `storage.rules` (nuevo): avatares solo los escribe su dueño, solo imágenes y máximo 3 MB; `biblioteca/` lectura pública y escritura autenticada; todo lo demás cerrado.
- `firestore.rules` actualizado para las nuevas colecciones (p. ej. `partidos_playoffs`).
- `firebase.json` registra reglas de Storage y el codebase de `functions/`.

## 3. Transmisión EN VIVO
- Store Pinia `src/stores/torneosEnVivo.ts`, que se usa en el `Navbar` para mostrar los torneos en vivo.

## 4. Playoffs Fase 2
- Eliminatorias guardadas en la colección `partidos_playoffs` (`torneoDatabaseService.ts`).
- Algoritmos en `torneoAlgoritmos.ts` (tests: `torneoAlgoritmos.spec.ts`, `torneoAlgoritmos.fase2.spec.ts`).
- `generarEsqueletoPlayoffs`: muestra el cuadro vacío mientras los grupos siguen abiertos y lo llena cuando se cierran.
- La UI `EliminatoriasConcentric.vue` y el composable `usePlayoffs.ts` leen el cuadro guardado.

## 5. Cloud Functions de correo (`functions/`)
- Cloud Functions v2 con nodemailer (Gmail).
- `notificarCorreosTorneo` (Firestore `onDocumentUpdated`) envía un correo cuando arranca la Gran Final y cuando un torneo pasa a EN VIVO.
- Para no enviar el mismo correo dos veces se crea un documento en `correos_enviados`.
- `enviarCorreoPrueba` (callable) envía un correo de prueba.
- Variables (`functions/.env.example`): `GMAIL_USER`, `MAIL_ADMIN_TO`, `MAIL_NOTIFY_PARTICIPANTS`, `MAIL_DRY_RUN`, `APP_URL`.
- La contraseña `GMAIL_APP_PASSWORD` es un secreto y no se guarda en el repo.
- Hace falta el plan Blaze para desplegar las Functions.

## 6. Cómo probar y desplegar
```bash
npm run test                      # tests del frontend (vitest)
cd functions && npm install && npm test
firebase functions:secrets:set GMAIL_APP_PASSWORD
firebase deploy --only functions,firestore:rules,storage
```
- En local: copia `functions/.env.example` a `functions/.env` y pon el secreto en `functions/.secret.local`. Los dos están en `.gitignore`.
- Con `MAIL_DRY_RUN=true` el correo se arma y queda en el log, pero no se envía.
