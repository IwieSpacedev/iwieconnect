import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import authService from '../firebase/authService';
import { onAuthStateChanged } from 'firebase/auth';

// Crear el contexto de autenticación
const AuthContext = createContext();

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  return useContext(AuthContext);
};

// Proveedor del contexto de autenticación
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función para cargar el rol del usuario
  const loadUserRole = async (user) => {
    if (!user) {
      console.log('loadUserRole: No hay usuario, estableciendo rol como null');
      setUserRole(null);
      return;
    }
    
    try {
      console.log('loadUserRole: Obteniendo rol para usuario:', user.email);
      const role = await authService.getCurrentUserRole();
      console.log('loadUserRole: Rol obtenido:', role);
      setUserRole(role);
    } catch (error) {
      console.error('Error al cargar el rol del usuario:', error);
      setUserRole(null);
    }
  };

  useEffect(() => {
    console.log('AuthContext: Configurando listener de autenticación');
    
    // Cargar el estado de autenticación desde localStorage si existe
    const savedUser = localStorage.getItem('authUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        console.log('AuthContext: Usuario cargado desde localStorage:', userData.email);
        setCurrentUser(userData);
        setUserRole(userData.role);
      } catch (error) {
        console.error('Error al cargar usuario desde localStorage:', error);
        localStorage.removeItem('authUser');
      }
    }
    
    // Suscribirse a los cambios en el estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('AuthContext: Estado de autenticación cambiado:', user ? user.email : 'No autenticado');
      
      if (user) {
        setCurrentUser(user);
        
        // Obtener el rol del usuario
        try {
          const role = await authService.getCurrentUserRole();
          console.log('AuthContext: Rol obtenido:', role);
          setUserRole(role);
          
          // Guardar en localStorage para persistencia
          const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            role: role
          };
          localStorage.setItem('authUser', JSON.stringify(userData));
        } catch (error) {
          console.error('Error al obtener el rol del usuario:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
        localStorage.removeItem('authUser');
        setLoading(false);
      }
    });

    // Limpiar la suscripción al desmontar el componente
    return () => unsubscribe();
  }, []);

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem('authUser');
      setCurrentUser(null);
      setUserRole(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };
  
  // Valores que se proporcionarán a través del contexto
  const value = {
    currentUser,
    userRole,
    login: authService.login,
    logout: handleLogout,
    isAdmin: userRole === 'admin',
    isUser: userRole === 'user',
    isAuthenticated: currentUser !== null,
    loadUserRole // Exponer la función para poder recargar el rol cuando sea necesario
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
