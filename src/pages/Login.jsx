import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const DEMO_ACCOUNTS = [
  { label:'Manager',      email:'laila@bp.ma',  color:'orange' },
  { label:'Employé Sara', email:'sara@bp.ma',   color:'blue'   },
  { label:'Employé Ahmed',email:'ahmed@bp.ma',  color:'blue'   },
  { label:'Client',       email:'mb@gmail.com', color:'green'  },
];

export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error, setError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = await login(email, password);
    if (userData) {
      // ✅ useNavigate — pas de rechargement de page
      navigate(userData.role === 'client' ? '/espace-client' : '/dashboard', { replace: true });
    }
  };

  const fillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <Link to="/" className="login-logo">
          <div className="logo-mark">BP</div>
          <span>Banque Populaire</span>
        </Link>
        <div className="login-hero">
          <h1>Bienvenue sur votre<br /><span>espace bancaire</span></h1>
          <p>Gérez vos rendez-vous, clients et communications depuis une interface unifiée et sécurisée.</p>
          <div className="login-features">
            {['🔒 Connexion sécurisée SSL','📅 Gestion des RDV en ligne','🤖 Chatbot IA intégré','📊 Statistiques en temps réel'].map(f => (
              <div key={f} className="login-feature">{f}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-box">
          <h2>Se connecter</h2>
          <p className="login-sub">Entrez vos identifiants pour accéder à votre espace</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" required />
            </div>
            <div className="form-group">
              <label>Mot de passe</label>
              <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
              {loading ? <><span className="spinner" /> Connexion...</> : 'Se connecter'}
            </button>
          </form>

          <p style={{textAlign:'center',marginTop:16,fontSize:'13px',color:'var(--gray-500)'}}>
            Nouveau client ? <Link to="/register" style={{color:'var(--orange)',fontWeight:600}}>Créer un compte</Link>
          </p>

          <div className="demo-section">
            <p className="demo-label">Comptes de démonstration (password123)</p>
            <div className="demo-accounts">
              {DEMO_ACCOUNTS.map(a => (
                <button key={a.email} className={`demo-btn demo-${a.color}`} onClick={() => fillDemo(a.email)}>
                  <strong>{a.label}</strong>
                  <span>{a.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
