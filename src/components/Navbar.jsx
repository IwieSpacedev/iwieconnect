import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import authService from '../firebase/authService';
import MobileMenu from './MobileMenu';
import '../styles/Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkAuthStatus = () => {
      // Verificar si hay un usuario autenticado o datos en localStorage
      const savedUser = localStorage.getItem('authUser');
      
      if (currentUser || savedUser) {
        setIsLoggedIn(true);
        
        // Determinar el rol del usuario
        if (userRole) {
          setUserRole(userRole);
          console.log('Navbar: Usuario autenticado con rol desde contexto:', userRole);
        } else if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            if (userData && userData.role) {
              setUserRole(userData.role);
              console.log('Navbar: Usuario autenticado con rol desde localStorage:', userData.role);
            }
          } catch (error) {
            console.error('Navbar: Error al leer localStorage:', error);
          }
        }
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
        console.log('Navbar: Usuario no autenticado');
      }
    };
    
    checkAuthStatus();
  }, [currentUser, userRole]);
  
  const handleLoginClick = () => {
    setIsOpen(false);
    navigate('/login');
  };
  
  const handleDashboardClick = () => {
    setIsOpen(false);
    
    // Forzar redirección directa al panel de administración
    console.log('Navbar: Forzando redirección al panel de administración');
    window.location.href = '/admin';
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    
    // Controlar la clase del body para prevenir el scroll
    if (!isOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  };
  
  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, []);

  return (
    <>
      {/* Componente de menú móvil */}
      <MobileMenu 
        isOpen={isOpen}
        toggleMenu={toggleMenu}
        isLoggedIn={isLoggedIn}
        handleLoginClick={handleLoginClick}
        handleDashboardClick={handleDashboardClick}
        handleLogout={handleLogout}
      />
      
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="logo">
            <h1>IwieConnect</h1>
          </Link>
          
          {/* Menú de navegación para escritorio */}
          <ul className="nav-menu">
            <li className="nav-item">
              <Link to="/" className="nav-link">
                Inicio
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/servicios" className="nav-link">
                Servicios
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/contacto" className="nav-link">
                Contacto
              </Link>
            </li>
            {isLoggedIn ? (
              <>
                <li className="nav-item">
                  <button className="nav-button" onClick={handleDashboardClick}>
                    Panel de Control
                  </button>
                </li>
                <li className="nav-item">
                  <button className="nav-button logout" onClick={handleLogout}>
                    Cerrar Sesión
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <button className="nav-button login" onClick={handleLoginClick}>
                  Iniciar Sesión
                </button>
              </li>
            )}
          </ul>
          
          {/* Botón hamburguesa para móvil */}
          <div className="menu-icon" onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
