// Script para crear un usuario administrador
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando proceso de creación de usuario administrador...');

// Verificar que estamos en el directorio correcto
if (!fs.existsSync(path.join(process.cwd(), 'package.json'))) {
  console.error('❌ Error: Este script debe ejecutarse desde el directorio raíz del proyecto.');
  process.exit(1);
}

// Credenciales del administrador (puedes modificarlas según tus necesidades)
const adminEmail = 'admin@iwieconnect.com';
const adminPassword = 'Admin123!';

try {
  console.log('📝 Creando usuario administrador con las siguientes credenciales:');
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Contraseña: ${adminPassword}`);
  console.log('');
  console.log('⏳ Ejecutando script de creación de administrador...');
  
  // Ejecutar el script con Node.js
  execSync('npx vite-node src/scripts/createAdminAccount.js', { stdio: 'inherit' });
  
  console.log('');
  console.log('✅ Proceso completado. Ahora puedes iniciar sesión con estas credenciales:');
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Contraseña: ${adminPassword}`);
  
} catch (error) {
  console.error('❌ Error al ejecutar el script:', error.message);
  process.exit(1);
}
