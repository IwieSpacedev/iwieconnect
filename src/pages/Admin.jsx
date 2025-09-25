import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import contactService from '../firebase/contactService';
import authService from '../firebase/authService';
import '../styles/Admin.css';
import MapModal from '../components/MapModal';
import MessageModal from '../components/MessageModal';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [contacts, setContacts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userFormData, setUserFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'user'
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState('');
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Usar una bandera para evitar actualizaciones múltiples
    let isMounted = true;
    
    const checkAuthentication = () => {
      // Verificar si hay datos en localStorage que indiquen que el usuario es administrador
      const savedUser = localStorage.getItem('authUser');
      let isAuthenticated = false;
      
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          if (userData && userData.role === 'admin') {
            isAuthenticated = true;
          }
        } catch (error) {
          console.error('Error al leer datos de usuario desde localStorage:', error);
        }
      }
      
      // Si no hay datos en localStorage y no es admin según el contexto, redirigir al login
      if (!isAuthenticated && !isAdmin && isMounted) {
        console.log('Admin: Usuario no autenticado como administrador, redirigiendo a login');
        // Usar window.location para evitar bucles de React Router
        window.location.replace('/login');
        return;
      }
    };
    
    checkAuthentication();
    
    // Limpieza para evitar actualizaciones en componentes desmontados
    return () => {
      isMounted = false;
    };
  }, [isAdmin]);

  useEffect(() => {
    // Cargar los datos según la pestaña activa
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        
        if (activeTab === 'contacts') {
          const contactsData = await contactService.getAllContacts();
          setContacts(contactsData);
        } else if (activeTab === 'users') {
          const usersData = await authService.getAllUsers();
          setUsers(usersData);
        }
        
        setLoading(false);
      } catch (error) {
        console.error(`Error al cargar ${activeTab === 'contacts' ? 'los contactos' : 'los usuarios'}:`, error);
        setError(`Error al cargar ${activeTab === 'contacts' ? 'los contactos' : 'los usuarios'}. Por favor, intenta de nuevo más tarde.`);
        setLoading(false);
      }
    };

    loadData();
  }, [isAdmin, navigate, activeTab]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setError('Error al cerrar sesión. Por favor, intenta de nuevo.');
    }
  };
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
    setFormError('');
    setFormSuccess('');
    setEditingUser(null);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setLoading(true);
    
    try {
      const { email, password, displayName } = userFormData;
      
      if (!email || !password) {
        setFormError('El email y la contraseña son obligatorios');
        setLoading(false);
        return;
      }
      
      if (password.length < 6) {
        setFormError('La contraseña debe tener al menos 6 caracteres');
        setLoading(false);
        return;
      }
      
      const { role } = userFormData;
      
      // Crear el usuario directamente en Firestore sin afectar la sesión actual
      const result = await authService.createUser(email, password, displayName, role);
      
      console.log('Usuario creado exitosamente:', result);
      
      setFormSuccess(`Usuario ${role === 'admin' ? 'administrador' : 'regular'} creado exitosamente`);
      setUserFormData({ email: '', password: '', displayName: '', role: 'user' });
      
      // Recargar la lista de usuarios
      const usersData = await authService.getAllUsers();
      setUsers(usersData);
      setLoading(false);
    } catch (error) {
      console.error('Error al crear usuario:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        setFormError('El email ya está en uso');
      } else if (error.code === 'auth/invalid-email') {
        setFormError('El formato del email no es válido');
      } else if (error.code === 'auth/weak-password') {
        setFormError('La contraseña es demasiado débil');
      } else {
        setFormError(`Error al crear usuario: ${error.message}`);
      }
      
      // Si se detectó que el administrador perdió la sesión durante la creación del usuario
      if (localStorage.getItem('adminCreatingUser') === 'true') {
        localStorage.removeItem('adminCreatingUser');
        // Recargar la página para intentar restaurar la sesión
        window.location.reload();
        return;
      }
      
      setLoading(false);
    } finally {
      // Asegurarse de que el estado de carga se restablece en cualquier caso
      if (loading) {
        setLoading(false);
      }
    }
  };
  
  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserFormData({
      email: user.email,
      password: '',
      displayName: user.displayName || '',
      role: user.role || 'user'
    });
    setFormError('');
    setFormSuccess('');
  };
  
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    
    try {
      if (!editingUser) return;
      
      const updateData = {};
      
      if (userFormData.displayName !== editingUser.displayName) {
        updateData.displayName = userFormData.displayName;
      }
      
      if (userFormData.email !== editingUser.email) {
        updateData.email = userFormData.email;
      }
      
      if (Object.keys(updateData).length === 0 && !userFormData.password) {
        setFormError('No hay cambios para guardar');
        return;
      }
      
      // Actualizar datos del usuario
      if (Object.keys(updateData).length > 0) {
        await authService.updateUser(editingUser.id, editingUser.uid, updateData);
      }
      
      // Cambiar contraseña si se proporcionó una nueva
      if (userFormData.password && userFormData.password.length >= 6) {
        await authService.changePassword(userFormData.password);
      } else if (userFormData.password && userFormData.password.length > 0) {
        setFormError('La contraseña debe tener al menos 6 caracteres');
        return;
      }
      
      setFormSuccess('Usuario actualizado exitosamente');
      
      // Recargar la lista de usuarios
      const usersData = await authService.getAllUsers();
      setUsers(usersData);
      
      // Limpiar formulario
      setEditingUser(null);
      setUserFormData({ email: '', password: '', displayName: '', role: 'user' });
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      setFormError(`Error al actualizar usuario: ${error.message}`);
    }
  };
  
  const handleDeleteUser = async (user) => {
    if (!confirm(`¿Estás seguro de eliminar al usuario ${user.email}?`)) {
      return;
    }
    
    try {
      await authService.deleteUser(user.id, user);
      
      // Recargar la lista de usuarios
      const usersData = await authService.getAllUsers();
      setUsers(usersData);
      
      setFormSuccess('Usuario eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      setError(`Error al eliminar usuario: ${error.message}`);
    }
  };
  
  const handleDeleteContact = async (contactId) => {
    if (!confirm('¿Estás seguro de eliminar esta solicitud de contacto?')) {
      return;
    }

    try {
      await contactService.deleteContact(contactId);
      setContacts(contacts.filter(c => c.id !== contactId));
      // Opcional: mostrar un mensaje de éxito
    } catch (error) {
      console.error('Error al eliminar contacto:', error);
      setError(`Error al eliminar solicitud: ${error.message}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setUserFormData({ email: '', password: '', displayName: '', role: 'user' });
    setFormError('');
    setFormSuccess('');
  };
  
  // Función para extraer coordenadas de una dirección
  const extractCoordinates = (addressString) => {
    if (!addressString || !addressString.includes('(')) {
      return null;
    }
    
    try {
      // Intentar extraer las coordenadas del formato "dirección (lat, lng)"
      const coordsMatch = addressString.match(/\(([-+]?\d+\.\d+),\s*([-+]?\d+\.\d+)\)/);
      
      if (coordsMatch && coordsMatch.length === 3) {
        const lat = parseFloat(coordsMatch[1]);
        const lng = parseFloat(coordsMatch[2]);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          return [lat, lng];
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error al extraer coordenadas:', error);
      return null;
    }
  };
  
  // Función para manejar la visualización del mapa
  const handleOpenMessageModal = (message) => {
    setSelectedMessage(message);
    setIsMessageModalOpen(true);
  };

  const handleCloseMessageModal = () => {
    setIsMessageModalOpen(false);
    setSelectedMessage('');
  };

  const truncateMessage = (message, maxLength = 30) => {
    if (message.length <= maxLength) {
      return message;
    }
    return message.substring(0, maxLength) + '...';
  };

  const handleViewMap = (address) => {
    const coordinates = extractCoordinates(address);
    
    if (coordinates) {
      setSelectedLocation({
        address: address.split('(')[0].trim(),
        coordinates: coordinates
      });
      setIsMapModalOpen(true);
    } else {
      alert('No se pudieron determinar las coordenadas para esta dirección.');
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
          <h1>Panel de Administración</h1>
          <p>Bienvenido, {currentUser?.email}</p>
        </div>
        <div className="admin-actions">
          <button onClick={handleLogout} className="logout-button">
            Cerrar Sesión
          </button>
        </div>
      </header>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-tabs">
        <button 
          className={`tab-button ${activeTab === 'contacts' ? 'active' : ''}`}
          onClick={() => handleTabChange('contacts')}
        >
          Solicitudes de Contacto
        </button>
        <button 
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => handleTabChange('users')}
        >
          Gestión de Usuarios
        </button>
      </div>

      <section className="admin-content">
        {activeTab === 'contacts' && (
          <div className="content-container">
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
                      <th className="col-nombre">Nombre</th>
                      <th className="col-email">Email</th>
                      <th className="col-telefono">Teléfono</th>
                      <th className="col-direccion">Dirección</th>
                      <th className="col-plan">Plan</th>
                      <th className="col-mensaje">Mensaje</th>
                      <th className="col-fecha">Fecha</th>
                      <th className="col-acciones">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((contact) => (
                      <tr key={contact.id}>
                        <td>{contact.nombre}</td>
                        <td>{contact.email}</td>
                        <td>{contact.telefono || 'No proporcionado'}</td>
                        <td className="address-cell">
                          {contact.direccion ? (
                            <div className="address-with-map">
                              <div className="address-text">{contact.direccion.split('(')[0]}</div>
                              {contact.direccion.includes('(') && (
                                <button 
                                  className="map-view-button" 
                                  onClick={() => handleViewMap(contact.direccion)}
                                  title="Ver ubicación en el mapa"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                                    <path fill="none" d="M0 0h24v24H0z"/>
                                    <path d="M12 20.9l4.95-4.95a7 7 0 1 0-9.9 0L12 20.9zm0 2.828l-6.364-6.364a9 9 0 1 1 12.728 0L12 23.728zM12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 2a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" fill="currentColor"/>
                                  </svg>
                                </button>
                              )}
                            </div>
                          ) : (
                            'No proporcionada'
                          )}
                        </td>
                        <td>{contact.plan || 'No especificado'}</td>
                        <td className="message-cell">
                          <div className="message-content">
                            {truncateMessage(contact.mensaje)}
                            {contact.mensaje.length > 30 && (
                              <button 
                                className="view-more-button" 
                                onClick={() => handleOpenMessageModal(contact.mensaje)}
                              >
                                Ver más
                              </button>
                            )}
                          </div>
                        </td>
                        <td>{contact.createdAt}</td>
                        <td className="actions-cell">
                          <button 
                            className="delete-button icon-button" 
                            onClick={() => handleDeleteContact(contact.id)}
                            title="Eliminar solicitud"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="content-container">
            <h2>Gestión de Usuarios</h2>
            
            <div className="user-management">
              <div className="user-form-container">
                <h3>{editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h3>
                
                {formError && <div className="form-error">{formError}</div>}
                {formSuccess && <div className="form-success">{formSuccess}</div>}
                
                <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="user-form">
                  <div className="form-group">
                    <label htmlFor="displayName">Nombre</label>
                    <input
                      type="text"
                      id="displayName"
                      name="displayName"
                      value={userFormData.displayName}
                      onChange={handleInputChange}
                      placeholder="Nombre del usuario"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={userFormData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="password">
                      {editingUser ? 'Nueva Contraseña (dejar en blanco para mantener)' : 'Contraseña *'}
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={userFormData.password}
                      onChange={handleInputChange}
                      required={!editingUser}
                      placeholder="Mínimo 6 caracteres"
                      minLength={editingUser ? 0 : 6}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="role">Rol *</label>
                    <select
                      id="role"
                      name="role"
                      value={userFormData.role}
                      onChange={handleInputChange}
                      required
                      className="role-select"
                    >
                      <option value="user">Usuario Regular</option>
                      <option value="admin">Administrador</option>
                    </select>
                    <small className="form-help-text">
                      Los administradores tienen acceso completo al panel. Los usuarios regulares tienen acceso limitado.
                    </small>
                  </div>
                  
                  <div className="form-actions">
                    <button type="submit" className="primary-button">
                      {editingUser ? 'Actualizar Usuario' : 'Crear Usuario'}
                    </button>
                    
                    {editingUser && (
                      <button 
                        type="button" 
                        className="secondary-button" 
                        onClick={handleCancelEdit}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>
              
              <div className="users-list-container">
                <h3>Usuarios Existentes</h3>
                <p className="user-info-text">Se muestran todos los usuarios, tanto administradores como usuarios regulares. Todos los usuarios son creados exclusivamente por un administrador.</p>
                
                {users.length === 0 ? (
                  <div className="no-data">
                    <p>No hay usuarios registrados en el sistema.</p>
                  </div>
                ) : (
                  <div className="data-table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Email</th>
                          <th>Rol</th>
                          <th>Fecha de creación</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td>{user.displayName || 'Sin nombre'}</td>
                            <td>{user.email}</td>
                            <td>
                              <span className={`role-badge ${user.role === 'admin' ? 'admin-role' : 'user-role'}`}>
                                {user.role === 'admin' ? 'Administrador' : 'Usuario Regular'}
                              </span>
                            </td>
                            <td>{user.createdAt}</td>
                            <td className="actions-cell">
                              <button 
                                className="edit-button" 
                                onClick={() => handleEditUser(user)}
                                title="Editar usuario"
                              >
                                Editar
                              </button>
                              <button 
                                className="delete-button" 
                                onClick={() => handleDeleteUser(user)}
                                title="Eliminar usuario"
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
      
      {/* Modal del mapa para ver ubicación */}
      {selectedLocation && (
        <MapModal
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          onAddressSelect={() => {}} // No necesitamos seleccionar dirección, solo ver
          initialAddress={selectedLocation.address}
          initialCoordinates={selectedLocation.coordinates}
          readOnly={true}
        />
      )}

      <MessageModal 
        isOpen={isMessageModalOpen} 
        onClose={handleCloseMessageModal} 
        message={selectedMessage} 
      />
    </main>
  );
};

export default Admin;
