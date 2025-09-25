import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../firebase/authService';
import '../styles/Login.css';

/**
 * Componente para registro de usuarios regulares
 * Esta página permite a los usuarios registrarse con una cuenta regular
 */
const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');

  // Datos de los planes (extraídos de Services.jsx)
  const plans = [
    { id: 1, name: "Individual" },
    { id: 2, name: "Pack 2 nodos" },
    { id: 3, name: "Pack 3 nodos" },
    { id: 4, name: "Pack 4 nodos" }
  ];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validaciones básicas
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      // Crear usuario regular
      const result = await authService.createUser(email, password, displayName, 'user', selectedPlan);
      console.log('Usuario creado exitosamente:', result);
      
      // Guardar datos en localStorage para persistencia
      const userData = {
        uid: result.uid,
        email: result.email,
        displayName: result.displayName || '',
        role: 'user'
      };
      localStorage.setItem('authUser', JSON.stringify(userData));
      
      // Mostrar mensaje de éxito
      setSuccess(true);
      setError('');
      
      // Limpiar el formulario
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setDisplayName('');
      setSelectedPlan('');
      
      // Redirigir al dashboard de usuario después de 2 segundos
      setTimeout(() => {
        navigate('/user-dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        setError('El correo electrónico ya está en uso. Intenta iniciar sesión.');
      } else if (error.code === 'auth/invalid-email') {
        setError('El formato del correo electrónico no es válido.');
      } else if (error.code === 'auth/weak-password') {
        setError('La contraseña es demasiado débil. Debe tener al menos 6 caracteres.');
      } else {
        setError(`Error al registrar: ${error.message || error.code || 'Error desconocido'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-container">
      <section className="login-card">
        <div className="login-header">
          <h1>Registro de Usuario</h1>
          <p>Crea tu cuenta para acceder a nuestros planes</p>
        </div>
        
        {error && (
          <div className="message error-message">
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="message success-message">
            <p>¡Registro exitoso! Tu cuenta ha sido creada.</p>
            <p>Serás redirigido a tu panel de usuario en unos segundos...</p>
          </div>
        )}
        
        {!success && (
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
              <label htmlFor="displayName">Nombre completo</label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Tu nombre completo"
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
            
            <div className="form-group">
              <label htmlFor="plan">Selecciona un Plan *</label>
              <select
                id="plan"
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                required
              >
                <option value="" disabled>Elige un plan</option>
                {plans.map(plan => (
                  <option key={plan.id} value={plan.name}>{plan.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength="6"
                placeholder="Repite la contraseña"
              />
            </div>
            
            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </button>
            
            <div className="form-footer">
              <p>¿Ya tienes una cuenta? <Link to="/login" className="form-link">Iniciar sesión</Link></p>
            </div>
          </form>
        )}
      </section>
    </main>
  );
};

export default Register;
