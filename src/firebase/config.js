// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAmeNV0KLkNSDtsKTxmecG3Uk8xNi-aN1Q",
  authDomain: "iwieconnect-3b996.firebaseapp.com",
  projectId: "iwieconnect-3b996",
  storageBucket: "iwieconnect-3b996.firebasestorage.app",
  messagingSenderId: "251069133099",
  appId: "1:251069133099:web:13c56583371a766cd9d56e",
  measurementId: "G-FSK23PB3Z8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// Configurar persistencia local para autenticación
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('Persistencia de autenticación configurada correctamente');
  })
  .catch((error) => {
    console.error('Error al configurar persistencia de autenticación:', error);
  });

// Habilitar persistencia offline para Firestore
enableIndexedDbPersistence(db)
  .then(() => {
    console.log('Persistencia de Firestore habilitada correctamente');
  })
  .catch((error) => {
    if (error.code === 'failed-precondition') {
      console.warn('La persistencia de Firestore no pudo ser habilitada porque múltiples pestañas están abiertas');
    } else if (error.code === 'unimplemented') {
      console.warn('El navegador actual no soporta todas las características necesarias para la persistencia de Firestore');
    } else {
      console.error('Error al habilitar persistencia de Firestore:', error);
    }
  });

export { db, analytics, auth };
