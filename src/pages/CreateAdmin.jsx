import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../firebase/authService';
import '../styles/Login.css';

/**
 * Componente para crear usuarios administradores
 * Esta página permite crear nuevos usuarios con rol de administrador
 */
const CreateAdmin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsSuccess(false);

    try {
      // Crear usuario administrador usando el servicio de autenticación
      const result = await authService.createAdminUser(email, password, displayName || email.split('@')[0]);
      
      console.log('Usuario administrador creado:', result);
      setIsSuccess(true);
      setMessage(`Usuario administrador "${displayName || email}" creado exitosamente.`);
      
      // Limpiar el formulario
      setEmail('');
      setPassword('');
      setDisplayName('');
      
      // Mostrar el mensaje de éxito durante 3 segundos antes de redirigir
      setTimeout(() => {
        navigate('/admin');
      }, 3000);
    } catch (error) {
      console.error('Error al crear usuario administrador:', error);
      setIsSuccess(false);
      
      if (error.code === 'auth/email-already-in-use') {
        setMessage('El correo electrónico ya está en uso. Por favor, utiliza otro correo.');
      } else if (error.code === 'auth/invalid-email') {
        setMessage('El formato del correo electrónico no es válido.');
      } else if (error.code === 'auth/weak-password') {
        setMessage('La contraseña es demasiado débil. Debe tener al menos 6 caracteres.');
      } else {
        setMessage(`Error al crear el usuario: ${error.message || error}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-container">
      <section className="login-card">
        <div className="login-header">
          <h1>Crear Usuario Administrador</h1>
          <p>Registra un nuevo usuario con permisos de administración</p>
        </div>
        
        {message && (
          <div className={`message ${isSuccess ? 'success-message' : 'error-message'}`}>
            <p>{message}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="ejemplo@correo.com"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="displayName">Nombre de usuario</label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Nombre del administrador"
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
              minLength="6"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Creando usuario...' : 'Crear Administrador'}
          </button>
          
          <div className="form-footer">
            <button 
              type="button" 
              className="login-button-secondary"
              onClick={() => navigate('/admin')}
            >
              Volver al Panel
            </button>
          </div>
        </form>
      </section>
    </main>
  );
};

export default CreateAdmin;
