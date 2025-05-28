// Script para crear un usuario administrador en Firebase
import { createAdminUser } from '../firebase/createAdminUser.js';

// Credenciales del administrador
const adminEmail = 'waltermarcelo01@gmail.com';
const adminPassword = '123456789';

// Crear el usuario administrador
createAdminUser(adminEmail, adminPassword)
  .then(() => {
    console.log('✅ Usuario administrador creado exitosamente');
    console.log('Email:', adminEmail);
    console.log('Contraseña:', adminPassword);
    console.log('Puedes usar estas credenciales para iniciar sesión en el panel de administración');
  })
  .catch(error => {
    console.error('❌ Error al crear el usuario administrador:', error.message);
    
    // Si el error es porque el usuario ya existe, mostrar un mensaje más amigable
    if (error.code === 'auth/email-already-in-use') {
      console.log('El usuario administrador ya existe. Puedes usar las credenciales proporcionadas para iniciar sesión.');
    }
  })
  .finally(() => {
    // Salir del proceso después de crear el usuario
    setTimeout(() => process.exit(0), 2000);
  });
