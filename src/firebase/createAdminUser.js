import { auth } from './config';
import { createUserWithEmailAndPassword } from 'firebase/auth';

/**
 * Crea un usuario administrador en Firebase Authentication
 * @param {string} email - Email del administrador
 * @param {string} password - Contraseña del administrador
 * @returns {Promise<UserCredential>} - Credenciales del usuario creado
 */
export const createAdminUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('Usuario administrador creado con éxito:', userCredential.user.email);
    return userCredential;
  } catch (error) {
    console.error('Error al crear usuario administrador:', error.message);
    throw error;
  }
};

// Ejemplo de uso:
// Para crear un usuario administrador, descomentar estas líneas y ejecutar este archivo
// createAdminUser('admin@iwieconnect.com', 'Admin123!')
//   .then(() => console.log('Usuario creado exitosamente'))
//   .catch(error => console.error('Error:', error.message));
