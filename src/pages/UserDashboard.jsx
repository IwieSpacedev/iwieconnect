import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import contactService from '../firebase/contactService';
import '../styles/Admin.css';

const UserDashboard = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser, logout, isUser, userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si el usuario está autenticado y es un usuario regular
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Si es admin, redirigir al panel de administrador
    if (userRole === 'admin') {
      navigate('/admin');
      return;
    }

    // Cargar los contactos
    const loadContacts = async () => {
      try {
        setLoading(true);
        setError('');
        
        const contactsData = await contactService.getAllContacts();
        setContacts(contactsData);
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar los contactos:', error);
        setError('Error al cargar los contactos. Por favor, intenta de nuevo más tarde.');
        setLoading(false);
      }
    };

    loadContacts();
  }, [currentUser, navigate, userRole]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setError('Error al cerrar sesión. Por favor, intenta de nuevo.');
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Cargando datos...</p>
      </div>
    );
  }

  return (
    <main className="admin-container">
      <header className="admin-header">
        <div className="admin-title">
          <h1>Panel de Usuario</h1>
          <p>Bienvenido, {currentUser?.displayName || currentUser?.email}</p>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Cerrar sesión
        </button>
      </header>

      {error && <div className="admin-error">{error}</div>}

      <section className="admin-content">
        <h2>Solicitudes de Contacto</h2>
        
        {contacts.length === 0 ? (
          <div className="no-data">
            <p>No hay solicitudes de contacto todavía.</p>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Mensaje</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.id}>
                    <td>{contact.nombre}</td>
                    <td>{contact.email}</td>
                    <td>{contact.telefono || 'No proporcionado'}</td>
                    <td className="message-cell">
                      <div className="message-content">{contact.mensaje}</div>
                    </td>
                    <td>{contact.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="user-dashboard-note">
          <p>
            <strong>Nota:</strong> Como usuario regular, puedes ver las solicitudes de contacto pero no puedes gestionar usuarios.
            Para obtener permisos de administrador, contacta con el administrador del sistema.
          </p>
        </div>
      </section>
    </main>
  );
};

export default UserDashboard;
