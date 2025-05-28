import { useEffect } from 'react';
import React from 'react';
import MapSelector from './MapSelector';
import '../styles/MapModal.css';

const MapModal = ({ isOpen, onClose, onAddressSelect, initialAddress, initialCoordinates, readOnly = false }) => {
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
          <h3>{readOnly ? 'Ver ubicación' : 'Seleccionar ubicación exacta'}</h3>
        </div>
        <div className="map-modal-body">
          <MapSelector 
            onAddressSelect={(address) => {
              if (!readOnly) {
                onAddressSelect(address);
                onClose();
              }
            }}
            initialAddress={initialAddress}
            initialCoordinates={initialCoordinates}
            isMobile={true}
            readOnly={readOnly}
          />
        </div>
        {readOnly ? (
          <div className="map-modal-footer">
            <button className="map-modal-button" onClick={onClose}>Cerrar</button>
          </div>
        ) : (
          <div className="map-modal-footer">
            <button className="map-modal-button" onClick={onClose}>Cerrar</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapModal;
