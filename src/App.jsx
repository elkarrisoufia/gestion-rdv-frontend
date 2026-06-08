import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import Clients from './pages/Clients';
import Emails from './pages/Emails';
import Chatbot from './pages/Chatbot';
import Stats from './pages/Stats';
import Employes from './pages/Employes';
import ClientSpace from './pages/ClientSpace';
import PublicPages from './pages/PublicPages';
import './styles/global.css';
import './App.css';

function PrivateRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return user.role === 'client'
      ? <Navigate to="/espace-client" replace />
      : <Navigate to="/dashboard" replace />;
  }
  return children;
}

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">{children}</main>
    </div>
  );
}

function LoginRoute() {
  const { user } = useAuth();
  if (user) {
    return <Navigate to={user.role === 'client' ? '/espace-client' : '/dashboard'} replace />;
  }
  return <Login />;
}
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/register" element={<Register />} />
      <Route path="/nos-services" element={<PublicPages page="services" />} />
      <Route path="/horaires" element={<PublicPages page="horaires" />} />
      <Route path="/contact" element={<PublicPages page="contact" />} />

      <Route path="/dashboard"     element={<PrivateRoute allowedRoles={['employe','manager']}><AppLayout><Dashboard /></AppLayout></PrivateRoute>} />
      <Route path="/rendez-vous"   element={<PrivateRoute allowedRoles={['employe','manager']}><AppLayout><Appointments /></AppLayout></PrivateRoute>} />
      <Route path="/clients"       element={<PrivateRoute allowedRoles={['employe','manager']}><AppLayout><Clients /></AppLayout></PrivateRoute>} />
      <Route path="/emails"        element={<PrivateRoute allowedRoles={['employe','manager']}><AppLayout><Emails /></AppLayout></PrivateRoute>} />
      <Route path="/chatbot"       element={<PrivateRoute allowedRoles={['employe','manager']}><AppLayout><Chatbot /></AppLayout></PrivateRoute>} />
      <Route path="/statistiques"  element={<PrivateRoute allowedRoles={['manager']}><AppLayout><Stats /></AppLayout></PrivateRoute>} />
      <Route path="/employes"      element={<PrivateRoute allowedRoles={['manager']}><AppLayout><Employes /></AppLayout></PrivateRoute>} />
      <Route path="/espace-client" element={<PrivateRoute allowedRoles={['client']}><AppLayout><ClientSpace /></AppLayout></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
