import { auth, db } from './config';
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
  deleteUser,
  updatePassword,
  updateEmail
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';

/**
 * Servicio para manejar la autenticación y gestión de usuarios con Firebase
 */
const authService = {
  /**
   * Inicia sesión con email y contraseña
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise<UserCredential>} - Credenciales del usuario
   */
  async login(email, password) {
    try {
      console.log('Intentando iniciar sesión con:', email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Inicio de sesión exitoso:', result.user.email);
      return result;
    } catch (error) {
      console.error('Error al iniciar sesión:', error.code, error.message);
      throw error;
    }
  },

  /**
   * Cierra la sesión del usuario actual
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      return await signOut(auth);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  },

  /**
   * Obtiene el usuario actual
   * @returns {User|null} - Usuario actual o null si no hay sesión
   */
  getCurrentUser() {
    return auth.currentUser;
  },

  /**
   * Observa los cambios en el estado de autenticación
   * @param {function} callback - Función que se ejecuta cuando cambia el estado
   * @returns {function} - Función para dejar de observar
   */
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  },

  /**
   * Crea un nuevo usuario con rol especificado sin afectar la sesión actual
   * @param {string} email - Email del nuevo usuario
   * @param {string} password - Contraseña del nuevo usuario
   * @param {string} displayName - Nombre a mostrar del usuario
   * @param {string} role - Rol del usuario ('admin' o 'user')
   * @returns {Promise<Object>} - Datos del usuario creado
   */
  async createUser(email, password, displayName, role = 'user') {
    try {
      console.log(`Creando usuario con email: ${email}, rol: ${role}`);
      
      // Usar la API de Firebase Admin (simulada en cliente)
      // En lugar de crear el usuario directamente, usaremos un enfoque diferente
      // que no afecte la sesión actual del administrador
      
      // Generar un UID único para el nuevo usuario
      const uid = 'user_' + Math.random().toString(36).substr(2, 9);
      
      // Validar que el rol sea válido
      const validRole = ['admin', 'user'].includes(role) ? role : 'user';
      
      // Datos a guardar en Firestore
      const userData = {
        uid: uid,
        email: email,
        displayName: displayName || '',
        role: validRole,
        createdAt: serverTimestamp(),
        password: password // Nota: En producción NUNCA guardaríamos la contraseña en texto plano
      };
      
      console.log('Guardando datos en Firestore:', userData);
      
      // Guardar información en Firestore
      const docRef = await addDoc(collection(db, 'users'), userData);
      console.log('Documento creado en Firestore con ID:', docRef.id);
      
      return {
        uid: uid,
        email: email,
        displayName: displayName || '',
        role: validRole,
        id: docRef.id
      };
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  },
  
  /**
   * Crea un nuevo usuario administrador
   * @param {string} email - Email del nuevo usuario
   * @param {string} password - Contraseña del nuevo usuario
   * @param {string} displayName - Nombre a mostrar del usuario
   * @returns {Promise<Object>} - Datos del usuario creado
   */
  async createAdminUser(email, password, displayName) {
    return this.createUser(email, password, displayName, 'admin');
  },
  
  /**
   * Crea un nuevo usuario normal
   * @param {string} email - Email del nuevo usuario
   * @param {string} password - Contraseña del nuevo usuario
   * @param {string} displayName - Nombre a mostrar del usuario
   * @returns {Promise<Object>} - Datos del usuario creado
   */
  async createRegularUser(email, password, displayName) {
    return this.createUser(email, password, displayName, 'user');
  },
  

  /**
   * Obtiene todos los usuarios
   * @param {string} role - Rol de los usuarios a obtener (opcional)
   * @returns {Promise<Array>} - Lista de usuarios
   */
  async getAllUsers(role = null) {
    try {
      let usersQuery;
      
      if (role) {
        // Si se especifica un rol, filtrar por ese rol
        usersQuery = query(collection(db, 'users'), where('role', '==', role));
      } else {
        // Si no se especifica rol, obtener todos los usuarios
        usersQuery = query(collection(db, 'users'));
      }
      
      console.log('Consultando usuarios en Firestore...');
      const querySnapshot = await getDocs(usersQuery);
      console.log(`Se encontraron ${querySnapshot.docs.length} usuarios`);
      
      const users = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Formatear la fecha si existe
        let formattedDate = 'Fecha desconocida';
        if (data.createdAt) {
          try {
            formattedDate = new Date(data.createdAt.toDate()).toLocaleString();
          } catch (e) {
            console.warn('Error al formatear fecha:', e);
            // Si hay un error al formatear la fecha, usar un valor por defecto
            formattedDate = data.createdAt.toString() || 'Fecha desconocida';
          }
        }
        
        // Eliminar la contraseña de los datos devueltos por seguridad
        const { password, ...userDataWithoutPassword } = data;
        
        return {
          id: doc.id,
          ...userDataWithoutPassword,
          createdAt: formattedDate
        };
      });
      
      console.log('Usuarios recuperados:', users);
      return users;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  },
  
  /**
   * Obtiene todos los usuarios administradores
   * @returns {Promise<Array>} - Lista de usuarios administradores
   */
  async getAdminUsers() {
    return this.getAllUsers('admin');
  },
  
  /**
   * Obtiene todos los usuarios regulares
   * @returns {Promise<Array>} - Lista de usuarios regulares
   */
  async getRegularUsers() {
    return this.getAllUsers('user');
  },
  
  /**
   * Obtiene el rol del usuario actual
   * @returns {Promise<string>} - Rol del usuario ('admin', 'user' o null si no está autenticado)
   */
  async getCurrentUserRole() {
    try {
      // Verificar si hay un usuario autenticado
      const user = auth.currentUser;
      
      if (!user) {
        console.log('getCurrentUserRole: No hay usuario autenticado');
        
        // Verificar si hay datos en localStorage
        const savedUser = localStorage.getItem('authUser');
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            if (userData && userData.role) {
              console.log('getCurrentUserRole: Usando rol desde localStorage:', userData.role);
              return userData.role;
            }
          } catch (error) {
            console.error('getCurrentUserRole: Error al leer localStorage:', error);
          }
        }
        
        return null;
      }
      
      console.log('getCurrentUserRole: Buscando rol para el usuario:', user.uid);
      
      // Buscar el usuario en Firestore
      const usersQuery = query(collection(db, 'users'), where('uid', '==', user.uid));
      const querySnapshot = await getDocs(usersQuery);
      
      if (querySnapshot.empty) {
        console.log('getCurrentUserRole: No se encontró el usuario en Firestore');
        return null;
      }
      
      const userData = querySnapshot.docs[0].data();
      console.log('getCurrentUserRole: Datos del usuario encontrados:', userData);
      
      // Guardar en localStorage para acceso rápido
      if (userData && userData.role) {
        try {
          const localUserData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || '',
            role: userData.role
          };
          localStorage.setItem('authUser', JSON.stringify(localUserData));
        } catch (error) {
          console.error('getCurrentUserRole: Error al guardar en localStorage:', error);
        }
      }
      
      return userData.role || null;
    } catch (error) {
      console.error('getCurrentUserRole: Error al obtener el rol del usuario:', error);
      return null;
    }
  },

  /**
   * Actualiza la información de un usuario
   * @param {string} userId - ID del usuario en Firestore
   * @param {string} uid - UID del usuario en Authentication
   * @param {Object} userData - Datos a actualizar
   * @returns {Promise<void>}
   */
  async updateUser(userId, uid, userData) {
    try {
      // Actualizar en Firestore
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...userData,
        updatedAt: serverTimestamp()
      });
      
      // Si hay cambio de email, actualizar en Authentication
      if (userData.email && auth.currentUser && auth.currentUser.uid === uid) {
        await updateEmail(auth.currentUser, userData.email);
      }
      
      // Si hay cambio de nombre, actualizar en Authentication
      if (userData.displayName && auth.currentUser && auth.currentUser.uid === uid) {
        await updateProfile(auth.currentUser, { displayName: userData.displayName });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  },

  /**
   * Cambia la contraseña de un usuario
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise<void>}
   */
  async changePassword(newPassword) {
    try {
      if (!auth.currentUser) throw new Error('No hay usuario autenticado');
      await updatePassword(auth.currentUser, newPassword);
      return { success: true };
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      throw error;
    }
  },

  /**
   * Elimina un usuario
   * @param {string} userId - ID del usuario en Firestore
   * @param {Object} user - Usuario a eliminar (debe ser el usuario actual)
   * @returns {Promise<void>}
   */
  async deleteUser(userId, user) {
    try {
      // Eliminar de Firestore
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);
      
      // Eliminar de Authentication (solo si es el usuario actual)
      if (auth.currentUser && auth.currentUser.uid === user.uid) {
        await deleteUser(auth.currentUser);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  }
};

export default authService;
