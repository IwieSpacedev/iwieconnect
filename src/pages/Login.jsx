import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import authService from '../firebase/authService';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, currentUser, userRole, isAuthenticated, loadUserRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Verificar si el usuario ya está autenticado y redirigir directamente al panel de administración
  useEffect(() => {
    // Usar una bandera para evitar actualizaciones múltiples
    let isMounted = true;
    
    // Verificar si la URL actual ya es /admin o /user-dashboard para evitar bucles
    if (window.location.pathname === '/admin' || window.location.pathname === '/user-dashboard') {
      console.log(`Login: Ya estamos en ${window.location.pathname}, no redirigir`);
      return;
    }
    
    const checkAuthStatus = async () => {
      // Verificar si hay datos en localStorage
      const savedUser = localStorage.getItem('authUser');

      if ((savedUser || isAuthenticated) && isMounted) {
        try {
          // Si hay datos en localStorage, verificar el rol y redirigir según corresponda
          if (savedUser) {
            const userData = JSON.parse(savedUser);
            if (userData) {
              if (userData.role === 'admin') {
                console.log('Login: Usuario admin encontrado en localStorage, redirigiendo al panel');
                // Usar window.location para forzar una recarga completa y evitar bucles
                window.location.replace('/admin');
                return;
              } else if (userData.role === 'user') {
                console.log('Login: Usuario regular encontrado en localStorage, redirigiendo al dashboard');
                // Usar window.location para forzar una recarga completa y evitar bucles
                window.location.replace('/user-dashboard');
                return;
              }
            }
          }
        } catch (error) {
          console.error('Login: Error al verificar autenticación:', error);
        }
      }
    };

    checkAuthStatus();
    
    // Limpieza para evitar actualizaciones en componentes desmontados
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Iniciar sesión
      const result = await login(email, password);
      console.log('Inicio de sesión exitoso:', result);
      
      // Obtener el rol del usuario para redirigir correctamente
      const userRole = await authService.getCurrentUserRole();
      console.log('Rol del usuario obtenido:', userRole);
      
      // Guardar datos en localStorage para persistencia
      const userData = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName || '',
        role: userRole
      };
      localStorage.setItem('authUser', JSON.stringify(userData));
      console.log('Datos de usuario guardados en localStorage');
      
      // Redirigir según el rol del usuario
      if (userRole === 'admin') {
        console.log('Redirigiendo al panel de administración');
        navigate('/admin');
      } else {
        console.log('Redirigiendo al dashboard de usuario');
        navigate('/user-dashboard');
      }
      // Evitar que se ejecute cualquier otro código después
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      console.error('Detalles del error:', JSON.stringify(error));
      setLoading(false);
      
      // Mostrar información detallada sobre el error para depuración
      if (error.code === 'auth/invalid-credential') {
        setError('Credenciales incorrectas. Verifica que el email y la contraseña sean correctos.');
        console.log('Credenciales utilizadas - Email:', email, 'Password:', '*'.repeat(password.length));
      } else if (error.code === 'auth/invalid-email') {
        setError('El formato del correo electrónico no es válido.');
      } else if (error.code === 'auth/user-not-found') {
        setError('No existe una cuenta con este correo electrónico. Verifica tus datos.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Contraseña incorrecta. Por favor, inténtalo de nuevo.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Demasiados intentos fallidos. Por favor, intenta más tarde.');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Error de conexión. Verifica tu conexión a internet.');
      } else {
        setError(`Error al iniciar sesión: ${error.message || error.code || 'Error desconocido'}`);
      }
    }
  };

  return (
    <main className="login-container">
      <section className="login-card">
        <div className="login-header">
          <h1>Panel de Administración</h1>
          <p>Ingresa tus credenciales para acceder</p>
        </div>
        
        {error && <div className="login-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>
      </section>
    </main>
  );
};

export default Login;
