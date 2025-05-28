import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/MobileMenu.css';

const MobileMenu = ({ isOpen, toggleMenu, isLoggedIn, handleLoginClick, handleDashboardClick, handleLogout }) => {
  return (
    <>
      {/* Overlay para bloquear el fondo cuando el menú está abierto */}
      <div 
        className={`mobile-overlay ${isOpen ? 'active' : ''}`} 
        onClick={toggleMenu}
      />
      
      {/* Menú móvil */}
      <div className={`mobile-menu ${isOpen ? 'active' : ''}`}>
        <div className="mobile-menu-header">
          <h2>Menú</h2>
          <button className="close-button" onClick={toggleMenu}>
            <span>&times;</span>
          </button>
        </div>
        
        <div className="mobile-menu-content">
          <ul className="mobile-nav-links">
            <li className="mobile-nav-item">
              <Link to="/" className="mobile-nav-link" onClick={toggleMenu}>
                Inicio
              </Link>
            </li>
            <li className="mobile-nav-item">
              <Link to="/servicios" className="mobile-nav-link" onClick={toggleMenu}>
                Servicios
              </Link>
            </li>
            <li className="mobile-nav-item">
              <Link to="/contacto" className="mobile-nav-link" onClick={toggleMenu}>
                Contacto
              </Link>
            </li>
          </ul>
          
          <div className="mobile-nav-buttons">
            {isLoggedIn ? (
              <>
                <button className="mobile-nav-button" onClick={() => {
                  handleDashboardClick();
                  toggleMenu();
                }}>
                  Panel de Control
                </button>
                <button className="mobile-nav-button logout" onClick={() => {
                  handleLogout();
                  toggleMenu();
                }}>
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <button className="mobile-nav-button login" onClick={() => {
                handleLoginClick();
                toggleMenu();
              }}>
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
