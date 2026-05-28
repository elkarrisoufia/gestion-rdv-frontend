import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

export default function Sidebar() {
  const { user, logout, isManager, isClient } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  const employeLinks = [
    { to: '/dashboard',    label: 'Tableau de bord', icon: '⊞' },
    { to: '/rendez-vous',  label: 'Rendez-vous',     icon: '📅' },
    { to: '/clients',      label: 'Clients',          icon: '👥' },
    { to: '/emails',       label: 'Emails',           icon: '✉️'  },
    { to: '/chatbot',      label: 'Chatbot IA',       icon: '🤖' },
  ];

  const managerExtra = [
    { to: '/statistiques', label: 'Statistiques', icon: '📊' },
    { to: '/employes',     label: 'Employés',     icon: '👔' },
  ];

  // ✅ Client — seulement espace client, PAS de page mes-rdv
  const clientLinks = [
    { to: '/espace-client', label: 'Mon Espace', icon: '🏠' },
  ];

  const links = isClient ? clientLinks : [...employeLinks, ...(isManager ? managerExtra : [])];

  const COLORS = ['#F97316','#3B82F6','#10B981','#8B5CF6','#EC4899','#06B6D4'];
  const colorIdx = (user?.nom?.charCodeAt(0) || 0) % COLORS.length;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">BP</div>
        <div className="logo-text">
          <span className="logo-name">Banque Populaire</span>
          <span className="logo-sub">Agence El Khalil El Jadida</span>
        </div>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar" style={{ background: COLORS[colorIdx] }}>
          {user?.prenom?.[0]}{user?.nom?.[0]}
        </div>
        <div className="user-info">
          <span className="user-name">{user?.prenom} {user?.nom}</span>
          <span className={`user-role role-${user?.role}`}>
            {user?.role === 'manager' ? 'Manager' : user?.role === 'employe' ? 'Employé' : 'Client'}
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Navigation</div>
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{link.icon}</span>
            <span className="nav-label">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-divider" />
      <button className="sidebar-logout" onClick={handleLogout}>
        <span style={{fontSize:'16px'}}>⎋</span>
        <span>Déconnexion</span>
      </button>
    </aside>
  );
}
