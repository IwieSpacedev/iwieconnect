import { useEffect } from 'react';
import '../styles/MapModal.css';
import MapSelector from './MapSelector';

const MapModal = ({ isOpen, onClose, onAddressSelect, initialAddress }) => {
  // Evitar scroll en el body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="map-modal-overlay" onClick={onClose}>
      <div className="map-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="map-modal-close" onClick={onClose}>×</button>
        <div className="map-modal-header">
          <h3>Selecciona tu ubicación exacta</h3>
        </div>
        <div className="map-modal-body">
          <MapSelector 
            onAddressSelect={(address) => {
              onAddressSelect(address);
              onClose();
            }}
            initialAddress={initialAddress}
            isMobile={true}
          />
        </div>
        <div className="map-modal-footer">
          <button className="map-modal-button" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default MapModal;
