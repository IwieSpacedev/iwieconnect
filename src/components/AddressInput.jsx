import React from 'react';
import '../styles/Contact.css';

const AddressInput = ({ value, error, onMapOpen }) => {
  return (
    <div className="form-group">
      <label htmlFor="direccion">Dirección *</label>
      <div className="address-input-container">
        <input
          type="text"
          id="direccion"
          name="direccion"
          value={value}
          onClick={onMapOpen} // Abre el mapa al hacer clic
          placeholder="Selecciona tu dirección en el mapa"
          required
          readOnly // Evita la edición manual
        />
        <button 
          type="button" 
          className="map-button"
          onClick={onMapOpen}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path fill="none" d="M0 0h24v24H0z"/>
            <path d="M12 20.9l4.95-4.95a7 7 0 1 0-9.9 0L12 20.9zm0 2.828l-6.364-6.364a9 9 0 1 1 12.728 0L12 23.728zM12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 2a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" fill="currentColor"/>
          </svg>
        </button>
      </div>
      <small className="help-text">Ingresa tu dirección o usa el mapa para seleccionarla</small>
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};

export default AddressInput;
