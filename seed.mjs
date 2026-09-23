import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc } from 'firebase/firestore'
import * as dotenv from 'dotenv'
import fs from 'fs'

const envConfig = dotenv.parse(fs.readFileSync('.env'))

const firebaseConfig = {
  apiKey: envConfig.VITE_FIREBASE_API_KEY,
  authDomain: envConfig.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: envConfig.VITE_FIREBASE_PROJECT_ID,
  storageBucket: envConfig.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: envConfig.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: envConfig.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const dbId = envConfig.VITE_FIREBASE_DATABASE_ID || 'default'
const db = dbId && dbId !== '(default)' ? getFirestore(app, dbId) : getFirestore(app)

const TORNEO_ID = 'hoashjlskjlskljsjkls'

const nombres = [
  'Carlos', 'Ana', 'Luis', 'Maria', 'Jose', 'Carmen', 'Jorge', 'Elena',
  'Pedro', 'Marta', 'Miguel', 'Lucia', 'Raul', 'Laura', 'Diego', 'Sofia',
  'Andres', 'Paula'
]

async function seed() {
  console.log('Seeding 18 users...')
  for (let i = 0; i < 18; i++) {
    const userId = `user_seed_${i + 1}`
    const nombre = nombres[i]
    
    // Inscription
    const inscripcionId = `${TORNEO_ID}_${userId}`
    await setDoc(doc(db, 'inscripciones', inscripcionId), {
      id: inscripcionId,
      torneoId: TORNEO_ID,
      jugadorId: userId,
      jugadorNombre: `${nombre} Test`,
      iniciales: nombre.substring(0,2).toUpperCase(),
      fechaInscripcion: new Date().toISOString(),
      estado: 'aprobado',
      subestado: 'INSCRITO',
      pagoValidado: true,
      monto: 6000
    })
    console.log(`Created user ${userId}`)
  }
  console.log('Done.')
}

seed().catch(console.error)
