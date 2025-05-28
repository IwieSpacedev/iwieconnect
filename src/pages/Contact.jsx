import { useState } from 'react';
import '../styles/Contact.css';
import contactService from '../firebase/contactService';

const Contact = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    mensaje: ''
  });
  const [errors, setErrors] = useState({});
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    success: false,
    message: '',
    loading: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Validar campos cuando cambian
    if (name === 'telefono') {
      validateChileanPhone(value);
    } else if (name === 'direccion') {
      validateAddress(value);
    }
  };

  const validateChileanPhone = (phone) => {
    // Validar formato de teléfono chileno (móvil o fijo)
    // Formatos válidos: +56912345678, +5621234567, 912345678, etc.
    const chileanPhoneRegex = /^(\+?56)?([2-9])\d{8}$/;
    
    if (!phone) {
      setErrors({...errors, telefono: 'El teléfono es obligatorio'});
      return false;
    } else if (!chileanPhoneRegex.test(phone.replace(/\s+/g, ''))) {
      setErrors({...errors, telefono: 'Ingrese un número de teléfono chileno válido'});
      return false;
    } else {
      setErrors({...errors, telefono: ''});
      return true;
    }
  };
  
  const validateAddress = (address) => {
    // Validación básica de dirección (al menos 10 caracteres y contiene números)
    if (!address) {
      setErrors({...errors, direccion: 'La dirección es obligatoria'});
      return false;
    } else if (address.length < 10) {
      setErrors({...errors, direccion: 'La dirección debe tener al menos 10 caracteres'});
      return false;
    } else if (!/\d/.test(address)) {
      setErrors({...errors, direccion: 'La dirección debe incluir un número'});
      return false;
    } else {
      setErrors({...errors, direccion: ''});
      return true;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar campos antes de enviar
    const isPhoneValid = validateChileanPhone(formData.telefono);
    const isAddressValid = validateAddress(formData.direccion);
    
    if (!isPhoneValid || !isAddressValid) {
      return; // Detener el envío si algún campo no es válido
    }
    
    // Establecer estado de carga
    setFormStatus({
      ...formStatus,
      loading: true
    });
    
    try {
      // Guardar el contacto en Firebase
      await contactService.saveContact(formData);
      
      // Actualizar estado con éxito
      setFormStatus({
        submitted: true,
        success: true,
        loading: false,
        message: '¡Gracias por contactarnos! Te responderemos a la brevedad.'
      });
      
      // Resetear el formulario después de enviar
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        direccion: '',
        mensaje: ''
      });
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
      
      // Actualizar estado con error
      setFormStatus({
        submitted: true,
        success: false,
        loading: false,
        message: 'Ha ocurrido un error al enviar tu mensaje. Por favor, intenta nuevamente.'
      });
    }
  };

  return (
    <main className="contact">
      <section className="contact-header">
        <div className="contact-header-grid"></div>
        <h1>Contáctanos</h1>
        <p>Completa el formulario y nos pondremos en contacto contigo a la brevedad.</p>
      </section>

      <section className="contact-form-container">
        {formStatus.submitted ? (
          formStatus.success ? (
            <div className="success-message">
              <h2>¡Mensaje enviado!</h2>
              <p>{formStatus.message}</p>
            </div>
          ) : (
            <div className="error-message">
              <h2>Error</h2>
              <p>{formStatus.message}</p>
              <button 
                onClick={() => setFormStatus({...formStatus, submitted: false})}
                className="retry-button"
              >
                Intentar nuevamente
              </button>
            </div>
          )
        ) : (
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nombre">Nombre *</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Correo electrónico *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="telefono">Teléfono *</label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="+56912345678"
                required
              />
              {errors.telefono && <span className="error-text">{errors.telefono}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="direccion">Dirección *</label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Av. Ejemplo 123, Comuna, Ciudad"
                required
              />
              {errors.direccion && <span className="error-text">{errors.direccion}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="mensaje">Mensaje *</label>
              <textarea
                id="mensaje"
                name="mensaje"
                value={formData.mensaje}
                onChange={handleChange}
                rows="5"
                required
              ></textarea>
            </div>
            <button 
              type="submit" 
              className="submit-button"
              disabled={formStatus.loading}
            >
              {formStatus.loading ? 'Enviando...' : 'Enviar mensaje'}
            </button>
          </form>
        )}
      </section>

      <section className="contact-info">
        <h2>Información de contacto</h2>
        <div className="contact-details">
          <div className="contact-item">
            <h3>Dirección</h3>
            <p>Av. Providencia 1234, Santiago, Chile</p>
          </div>
          <div className="contact-item">
            <h3>Correo electrónico</h3>
            <p>info@iwieconnect.cl</p>
          </div>
          <div className="contact-item">
            <h3>Teléfono</h3>
            <p>+56 9 1234 5678</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
