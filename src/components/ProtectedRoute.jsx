import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';

/**
 * Componente que protege rutas que requieren autenticación
 * Si el usuario no está autenticado o no tiene el rol requerido, redirige a la página correspondiente
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componentes hijos a renderizar si el usuario está autenticado
 * @param {string} [props.requiredRole] - Rol requerido para acceder a la ruta ('admin' o 'user')
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, userRole } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [effectiveRole, setEffectiveRole] = useState(null);
  
  // Función para obtener el rol efectivo (desde localStorage o contexto)
  const getEffectiveRole = () => {
    // Primero intentar obtener el rol del contexto de autenticación
    if (userRole) {
      return userRole;
    }
    
    // Si no hay rol en el contexto, intentar obtenerlo de localStorage
    try {
      const savedUser = localStorage.getItem('authUser');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        if (userData && userData.role) {
          return userData.role;
        }
      }
    } catch (error) {
      console.error('Error al obtener rol de localStorage:', error);
    }
    
    return null;
  };
  
  useEffect(() => {
    const checkAuthentication = () => {
      // Verificar si hay un usuario autenticado en el contexto o en localStorage
      const savedUser = localStorage.getItem('authUser');
      const isUserAuthenticated = !!currentUser || !!savedUser;
      
      if (isUserAuthenticated) {
        console.log('ProtectedRoute: Usuario autenticado');
        setIsAuthenticated(true);
        
        // Obtener y establecer el rol efectivo
        const role = getEffectiveRole();
        setEffectiveRole(role);
        console.log('ProtectedRoute: Rol efectivo:', role);
      } else {
        console.log('ProtectedRoute: No hay usuario autenticado');
        setIsAuthenticated(false);
        setEffectiveRole(null);
      }
      
      setIsLoading(false);
    };
    
    checkAuthentication();
  }, [currentUser, userRole]);
  
  // Mostrar un indicador de carga mientras se verifica la autenticación
  if (isLoading) {
    return <div className="loading">Verificando autenticación...</div>;
  }
  
  // Verificar si hay datos en localStorage que indiquen que el usuario es administrador
  const savedUser = localStorage.getItem('authUser');
  if (savedUser) {
    try {
      const userData = JSON.parse(savedUser);
      if (userData && userData.role === 'admin' && requiredRole === 'admin') {
        console.log('ProtectedRoute: Usuario admin encontrado en localStorage, permitiendo acceso');
        return children;
      } else if (userData && userData.role === 'user' && requiredRole === 'user') {
        console.log('ProtectedRoute: Usuario regular encontrado en localStorage, permitiendo acceso');
        return children;
      }
    } catch (error) {
      console.error('ProtectedRoute: Error al leer localStorage:', error);
    }
  }

  // Si no hay usuario autenticado, verificar una última vez en localStorage
  if (!isAuthenticated) {
    const savedUser = localStorage.getItem('authUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        if (userData && userData.role) {
          console.log('ProtectedRoute: Usuario encontrado en localStorage durante verificación final');
          // Si el usuario tiene el rol requerido, permitir acceso
          if (userData.role === requiredRole) {
            return children;
          }
        }
      } catch (error) {
        console.error('ProtectedRoute: Error al leer localStorage en verificación final:', error);
      }
    }
    
    console.log('ProtectedRoute: Redirigiendo a login por falta de autenticación');
    return <Navigate to="/login" replace />;
  }

  // Si se requiere un rol específico y el usuario no lo tiene
  if (requiredRole && effectiveRole !== requiredRole) {
    // Si es admin intentando acceder a una ruta de usuario, redirigir al panel de admin
    if (effectiveRole === 'admin' && requiredRole === 'user') {
      console.log('ProtectedRoute: Admin intentando acceder a ruta de usuario');
      return <Navigate to="/admin" replace />;
    }
    
    // Si es usuario intentando acceder a ruta de admin, redirigir al panel de usuario
    if (effectiveRole === 'user' && requiredRole === 'admin') {
      console.log('ProtectedRoute: Usuario intentando acceder a ruta de admin');
      return <Navigate to="/user-dashboard" replace />;
    }
    
    // En cualquier otro caso, permitir el acceso (solución temporal)
    console.log('ProtectedRoute: Permitiendo acceso a pesar de rol inadecuado');
    return children;
  }

  return children;
};

/**
 * Componente que protege rutas que requieren rol de administrador
 */
export const AdminRoute = ({ children }) => {
  // Verificar directamente si hay datos de admin en localStorage
  try {
    const savedUser = localStorage.getItem('authUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      if (userData && userData.role === 'admin') {
        console.log('AdminRoute: Usuario admin encontrado en localStorage, permitiendo acceso directo');
        return children;
      }
    }
  } catch (error) {
    console.error('AdminRoute: Error al verificar localStorage:', error);
  }
  
  // Si no hay datos en localStorage, usar el ProtectedRoute normal
  return <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>;
};

/**
 * Componente que protege rutas que requieren rol de usuario regular
 */
export const UserRoute = ({ children }) => {
  return <ProtectedRoute requiredRole="user">{children}</ProtectedRoute>;
};

export default ProtectedRoute;
