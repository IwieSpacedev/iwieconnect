import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Arreglar el ícono de marcador en Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Coordenadas iniciales centradas en Santiago, Chile
const defaultPosition = [-33.4489, -70.6693];

// Componente para manejar eventos del mapa
function MapEvents({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

const MapSelector = ({ onAddressSelect, initialAddress, initialCoordinates, isMobile = false, readOnly = false }) => {
  const [position, setPosition] = useState(defaultPosition);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const mapRef = useRef(null);
  
  // Función para formatear una dirección amigable a partir de coordenadas
  const formatFriendlyAddress = (lat, lng) => {
    return `Dirección exacta: Lat ${lat.toFixed(6)}, Lng ${lng.toFixed(6)}`;
  };

  // Función para obtener la dirección más precisa posible
  const getAddressFromCoordinates = async (lat, lng) => {
    // Aumentar intentos para dispositivos móviles
    const maxRetries = isMobile ? 3 : 1;
    try {
      setLoading(true);
      
      // Primer intento: Usar Geocoding.Geo.admin.ch (API suiza de alta precisión)
      // Esta API suele funcionar mejor en dispositivos móviles y no tiene restricciones CORS
      try {
        const response = await fetch(
          `https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=${lat},${lng}&type=locations&sr=4326`
        );
        
        if (response.ok) {
          const data = await response.json();
          
          if (data && data.results && data.results.length > 0) {
            const result = data.results[0];
            if (result.attrs && result.attrs.label) {
              const fullAddress = `${result.attrs.label} (${lat.toFixed(6)}, ${lng.toFixed(6)})`;
              setAddress(fullAddress);
              onAddressSelect(fullAddress);
              return;
            }
          }
        }
      } catch (geoAdminError) {
        console.log('Error con Geo.admin.ch, intentando alternativa:', geoAdminError);
      }
      
      // Segundo intento: Usar Nominatim con proxy CORS y más detalle
      try {
        const corsProxy = 'https://corsproxy.io/?';
        // Aumentamos el nivel de zoom para obtener más detalle y solicitamos detalles de dirección
        const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18&namedetails=1`;
        
        const response = await fetch(corsProxy + encodeURIComponent(nominatimUrl), {
          headers: {
            'User-Agent': 'IwieConnect-ContactForm'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data) {
            // Intentar construir una dirección más detallada usando los campos addressdetails
            let detailedAddress = '';
            
            if (data.address) {
              const addr = data.address;
              const parts = [];
              
              // Construir la dirección con el máximo detalle posible
              if (addr.road || addr.pedestrian || addr.footway || addr.path) {
                parts.push(addr.road || addr.pedestrian || addr.footway || addr.path);
              }
              
              // Añadir número de casa si existe
              if (addr.house_number) {
                parts[0] = `${parts[0]} ${addr.house_number}`;
              }
              
              // Añadir barrio/sector
              if (addr.suburb || addr.neighbourhood || addr.residential) {
                parts.push(addr.suburb || addr.neighbourhood || addr.residential);
              }
              
              // Añadir ciudad/comuna
              if (addr.city || addr.town || addr.village || addr.municipality) {
                parts.push(addr.city || addr.town || addr.village || addr.municipality);
              }
              
              // Añadir región/provincia
              if (addr.state || addr.county) {
                parts.push(addr.state || addr.county);
              }
              
              // Añadir país
              if (addr.country) {
                parts.push(addr.country);
              }
              
              // Añadir código postal si existe
              if (addr.postcode) {
                parts.push(`CP: ${addr.postcode}`);
              }
              
              detailedAddress = parts.join(', ');
            }
            
            // Si pudimos construir una dirección detallada, la usamos
            if (detailedAddress) {
              // Añadir coordenadas exactas al final para mayor precisión
              const fullAddress = `${detailedAddress} (${lat.toFixed(6)}, ${lng.toFixed(6)})`;
              setAddress(fullAddress);
              onAddressSelect(fullAddress);
              return;
            } else if (data.display_name) {
              // Si no pudimos construir una dirección detallada, usamos display_name con coordenadas
              const fullAddress = `${data.display_name} (${lat.toFixed(6)}, ${lng.toFixed(6)})`;
              setAddress(fullAddress);
              onAddressSelect(fullAddress);
              return;
            }
          }
        }
      } catch (nominatimError) {
        console.log('Error con Nominatim, intentando alternativa:', nominatimError);
      }
      
      // Segundo intento: Usar un servicio alternativo (BigDataCloud) con más detalle
      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=es`
        );
        
        if (response.ok) {
          const data = await response.json();
          
          if (data) {
            // Crear una dirección detallada con todos los datos disponibles
            let parts = [];
            
            // Intentar construir una dirección más completa
            if (data.road) parts.push(data.road);
            if (data.locality) parts.push(data.locality);
            if (data.city) parts.push(data.city);
            if (data.principalSubdivision) parts.push(data.principalSubdivision);
            if (data.countryName) parts.push(data.countryName);
            
            // Si tenemos al menos algunos datos
            if (parts.length > 0) {
              // Añadir coordenadas exactas para mayor precisión
              const friendlyAddress = `${parts.join(', ')} (${lat.toFixed(6)}, ${lng.toFixed(6)})`;
              setAddress(friendlyAddress);
              onAddressSelect(friendlyAddress);
              return;
            }
          }
        }
      } catch (alternativeError) {
        console.log('Error con servicio alternativo:', alternativeError);
      }
      
      // Si ambos intentos fallan, usar formato amigable de coordenadas
      const genericAddress = formatFriendlyAddress(lat, lng);
      setAddress(genericAddress);
      onAddressSelect(genericAddress);
      
    } catch (error) {
      console.error('Error al obtener la dirección:', error);
      const genericAddress = formatFriendlyAddress(lat, lng);
      setAddress(genericAddress);
      onAddressSelect(genericAddress);
    } finally {
      setLoading(false);
    }
  };
  
  // Manejar clic en el mapa
  const handleMapClick = (coords) => {
    setPosition(coords);
    getAddressFromCoordinates(coords[0], coords[1]);
    
    // Centrar el mapa en la nueva posición
    if (mapRef.current) {
      mapRef.current.setView(coords, 16);
    }
  };
  
  // Efecto para usar coordenadas iniciales si existen o buscar a partir de la dirección
  useEffect(() => {
    // Si tenemos coordenadas iniciales, usarlas directamente
    if (initialCoordinates && Array.isArray(initialCoordinates) && initialCoordinates.length === 2) {
      const [lat, lng] = initialCoordinates;
      setPosition([lat, lng]);
      
      // Si estamos en modo solo lectura, no necesitamos obtener la dirección
      if (!readOnly) {
        getAddressFromCoordinates(lat, lng);
      } else if (initialAddress) {
        setAddress(initialAddress);
      }
      
      // Centrar el mapa en la posición
      if (mapRef.current) {
        mapRef.current.setView([lat, lng], 16);
      }
      return;
    }
    
    // Si no hay coordenadas pero sí dirección inicial, buscar coordenadas
    if (initialAddress && initialAddress.length > 5 && !address) {
      const searchAddress = async () => {
        try {
          setLoading(true);
          // Usar un proxy CORS para evitar problemas de CORS
          const corsProxy = 'https://corsproxy.io/?';
          const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(initialAddress)}&limit=1`;
          
          const response = await fetch(corsProxy + encodeURIComponent(nominatimUrl));
          const data = await response.json();
          
          if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            setPosition([lat, lon]);
            setAddress(data[0].display_name);
            
            // Centrar el mapa en la posición encontrada
            if (mapRef.current) {
              mapRef.current.setView([lat, lon], 16);
            }
          }
        } catch (error) {
          console.error('Error al buscar la dirección:', error);
          // No hacemos nada especial aquí, simplemente dejamos que el usuario seleccione manualmente
        } finally {
          setLoading(false);
        }
      };
      
      // Añadir un pequeño retraso para evitar demasiadas solicitudes a la API
      const timer = setTimeout(() => {
        searchAddress();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [initialAddress, address]);
  
  return (
    <div className="map-selector">
      <h3>{readOnly ? 'Ubicación seleccionada' : 'Selecciona tu ubicación en el mapa'}</h3>
      {!readOnly && <p className="map-instruction">Haz clic en el mapa para seleccionar tu dirección exacta</p>}
      
      <div className={`map-container-wrapper ${isMobile ? 'mobile' : ''}`}>
        <MapContainer 
          center={position} 
          zoom={isMobile ? 16 : 13} 
          style={{ height: '100%', width: '100%', borderRadius: '8px' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} />
          {!readOnly && <MapEvents onMapClick={handleMapClick} />}
        </MapContainer>
      </div>
      
      {loading && <p className="loading-text">Cargando dirección...</p>}
      
      {!readOnly && (
        <div className="map-instructions">
          <small className="help-text">* Haz clic en el mapa para seleccionar tu ubicación exacta</small>
          <small className="help-text">* La dirección se completará automáticamente en el formulario</small>
        </div>
      )}
      
      {address && (
        <div className="selected-address">
          <p><strong>Dirección seleccionada:</strong> {address}</p>
        </div>
      )}
    </div>
  );
};

export default MapSelector;
