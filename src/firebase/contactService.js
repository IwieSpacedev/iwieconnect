import { db } from './config';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from 'firebase/firestore';

/**
 * Servicio para manejar las operaciones relacionadas con los contactos en Firestore
 */
const contactService = {
  /**
   * Guarda un nuevo contacto en Firestore
   * @param {Object} contactData - Datos del contacto
   * @returns {Promise} - Promesa que se resuelve con el ID del documento creado
   */
  async saveContact(contactData) {
    try {
      // Añadir timestamp al contacto
      const contactWithTimestamp = {
        ...contactData,
        createdAt: serverTimestamp()
      };
      
      // Guardar en la colección 'contacts'
      const docRef = await addDoc(collection(db, 'contacts'), contactWithTimestamp);
      return docRef.id;
    } catch (error) {
      console.error('Error al guardar el contacto:', error);
      throw error;
    }
  },

  /**
   * Obtiene todos los contactos ordenados por fecha de creación (más recientes primero)
   * @returns {Promise<Array>} - Promesa que se resuelve con un array de contactos
   */
  async getAllContacts() {
    try {
      const contactsQuery = query(
        collection(db, 'contacts'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(contactsQuery);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convertir el timestamp a una fecha legible si existe
        createdAt: doc.data().createdAt ? new Date(doc.data().createdAt.toDate()).toLocaleString() : 'Fecha desconocida'
      }));
    } catch (error) {
      console.error('Error al obtener los contactos:', error);
      throw error;
    }
  }
};

export default contactService;
