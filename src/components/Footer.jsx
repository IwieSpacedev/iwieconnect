import { Link } from 'react-router-dom';
import '../styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-logo">
          <h2>IwieConnect</h2>
          <p>Internet Satelital de Alta Velocidad</p>
        </div>
        <div className="footer-links">
          <h3>Enlaces Rápidos</h3>
          <ul>
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/contacto">Contacto</Link></li>
          </ul>
        </div>
        <div className="footer-contact">
          <h3>Contacto</h3>
          <p>Email: info@iwieconnect.cl</p>
          <p>Teléfono: +56 9 5810 8312</p>
          <p>Dirección: Estero Lluanco 3311, Chillán</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {currentYear} IwieConnect. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
