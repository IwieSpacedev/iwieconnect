import { Link } from 'react-router-dom';
import { FaGlobe, FaBolt, FaWifi } from 'react-icons/fa';
import '../styles/Home.css';

const Home = () => {
  return (
    <main className="home">
      <section className="hero">
        <div className="hero-grid"></div>
        <div className="hero-content">
          <h1>Internet satelital desde $22.900 CLP</h1>
          <p>Conectividad de alta velocidad donde quiera que estés</p>
          <Link to="/contacto" className="cta-button">Solicita tu instalación hoy mismo</Link>
        </div>
      </section>

      <section className="benefits">
        <h2>Beneficios de nuestro servicio</h2>
        <div className="benefits-container">
          <div className="benefit-card">
            <FaGlobe className="benefit-icon" />
            <h3>Cobertura Rural</h3>
            <p>Llega donde otros proveedores no pueden. Internet en cualquier lugar con vista al cielo.</p>
          </div>
          <div className="benefit-card">
            <FaBolt className="benefit-icon" />
            <h3>Instalación Rápida</h3>
            <p>Instalación profesional en menos de 48 horas después de tu solicitud.</p>
          </div>
          <div className="benefit-card">
            <FaWifi className="benefit-icon" />
            <h3>Sin Cables</h3>
            <p>Tecnología inalámbrica que elimina la necesidad de cableado extenso.</p>
          </div>
        </div>
      </section>

      <section className="features">
        <h2>Características de nuestros planes</h2>
        <div className="features-container">
          <div className="feature-card">
            <h3>Precio Accesible</h3>
            <p className="price">Desde $22.900 CLP</p>
            <p>Planes adaptados a tus necesidades y presupuesto</p>
          </div>
          <div className="feature-card">
            <h3>Velocidad Estimada</h3>
            <div className="speed-info">
              <p className="speed"><span className="speed-value">200</span> <span className="speed-unit">Mbps</span> <span className="speed-type">Descarga</span></p>
              <p className="speed"><span className="speed-value">50</span> <span className="speed-unit">Mbps</span> <span className="speed-type">Subida</span></p>
            </div>
            <p className="data-cap">Tráfico ilimitado</p>
            <p>Navega, transmite y trabaja sin interrupciones</p>
          </div>
          <div className="feature-card">
            <h3>Estabilidad y Disponibilidad</h3>
            <p className="availability">99.9% de tiempo activo</p>
            <p>Conexión confiable incluso en condiciones climáticas adversas</p>
          </div>
        </div>
      </section>

      <section className="promo">
        <div className="promo-content">
          <h2>¿Por qué elegir nuestro Internet Satelital?</h2>
          <p>Nuestra tecnología satelital de última generación te garantiza una conexión estable y de alta velocidad, sin importar dónde te encuentres. Ideal para zonas rurales, alejadas o con infraestructura limitada.</p>
          <Link to="/contacto" className="cta-button">Solicita tu instalación hoy mismo</Link>
        </div>
      </section>
    </main>
  );
};

export default Home;
