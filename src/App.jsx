import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import ProtectedRoute, { AdminRoute, UserRoute } from './components/ProtectedRoute';
import Home from './pages/Home';
import Contact from './pages/Contact';
import Services from './pages/Services';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import UserDashboard from './pages/UserDashboard';
import CreateAdmin from './pages/CreateAdmin';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/create-admin" element={
              <AdminRoute>
                <CreateAdmin />
              </AdminRoute>
            } />
            <Route path="/user-dashboard" element={
              <UserRoute>
                <UserDashboard />
              </UserRoute>
            } />
            <Route path="*" element={
              <>
                <Navbar />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/contacto" element={<Contact />} />
                  <Route path="/planes" element={<Services />} />
                </Routes>
                <Footer />
                <WhatsAppButton />
              </>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App
