import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Services.css';

const Services = () => {
  // Datos de los planes
  const plans = [
    {
      id: 1,
      name: "Individual",
      price: "68.000",
      installationCost: "35.000",
      nodes: 1,
      downloadSpeed: "200",
      uploadSpeed: "50",
      features: [
        "200 Mbps de descarga",
        "50 Mbps de subida",
        "Tráfico ilimitado",
        "Soporte técnico",
        "Equipo propiedad de IwieConnect",
        "Instalación profesional"
      ]
    },
    {
      id: 2,
      name: "Pack 2 nodos",
      price: "37.900",
      installationCost: "35.000",
      nodes: 2,
      downloadSpeed: "200",
      uploadSpeed: "50",
      features: [
        "200 Mbps de descarga",
        "50 Mbps de subida",
        "Tráfico ilimitado",
        "Soporte técnico",
        "Equipo propiedad de IwieConnect",
        "Instalación profesional",
        "Precio por nodo"
      ]
    },
    {
      id: 3,
      name: "Pack 3 nodos",
      price: "24.900",
      installationCost: "35.000",
      nodes: 3,
      downloadSpeed: "200",
      uploadSpeed: "50",
      features: [
        "200 Mbps de descarga",
        "50 Mbps de subida",
        "Tráfico ilimitado",
        "Soporte técnico",
        "Equipo propiedad de IwieConnect",
        "Instalación profesional",
        "Precio por nodo"
      ]
    },
    {
      id: 4,
      name: "Pack 4 nodos",
      price: "22.900",
      installationCost: "35.000",
      nodes: 4,
      downloadSpeed: "200",
      uploadSpeed: "50",
      features: [
        "200 Mbps de descarga",
        "50 Mbps de subida",
        "Tráfico ilimitado",
        "Soporte técnico",
        "Equipo propiedad de IwieConnect",
        "Instalación profesional",
        "Precio por nodo"
      ]
    }
  ];

  return (
    <div className="services-container">
      <div className="services-header">
        <h1>Nuestros Planes de Internet Satelital</h1>
        <p>Conectividad de alta velocidad donde quiera que estés</p>
      </div>
      
      <div className="plans-container">
        {plans.map((plan) => (
          <div key={plan.id} className="plan-card">
            <div className="plan-header">
              <h2>{plan.name}</h2>
              <div className="plan-price">
                <span className="price">${plan.price}</span>
                <span className="period">/ mes</span>
              </div>
              <p className="installation-cost">
                + ${plan.installationCost} costo de instalación
                {plan.nodes > 1 ? " por nodo" : ""}
              </p>
            </div>
            
            <div className="plan-speeds">
              <div className="speed-box">
                <div className="speed-value">{plan.downloadSpeed} <span>Mbps</span></div>
                <div className="speed-label">Descarga</div>
              </div>
              <div className="speed-box">
                <div className="speed-value">{plan.uploadSpeed} <span>Mbps</span></div>
                <div className="speed-label">Subida</div>
              </div>
              <div className="data-limit">Tráfico ilimitado</div>
            </div>
            
            <div className="plan-features">
              <ul>
                {plan.features.slice(3).map((feature, index) => (
                  <li key={index}>
                    <span className="check-icon">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            <Link to="/contacto" className="plan-button">
              Solicita tu instalación
            </Link>
          </div>
        ))}
      </div>
      
      <div className="services-cta">
        <h2>¿Necesitas más información?</h2>
        <p>Contáctanos y te ayudaremos a elegir el plan perfecto para ti.</p>
        <Link to="/contacto" className="contact-button">Contactar ahora</Link>
      </div>
    </div>
  );
};

export default Services;
