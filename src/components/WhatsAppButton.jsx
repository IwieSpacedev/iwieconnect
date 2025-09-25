import { FaWhatsapp } from 'react-icons/fa';
import '../styles/WhatsAppButton.css';

const WhatsAppButton = () => {
  const phoneNumber = '56958108312'; // Número actualizado
  const message = 'Hola, estoy interesado en el servicio de internet satelital.';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a 
      href={whatsappUrl} 
      className="whatsapp-button" 
      target="_blank" 
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
    >
      <FaWhatsapp />
      <span>Contáctanos por WhatsApp</span>
    </a>
  );
};

export default WhatsAppButton;
