import { Link } from 'react-router-dom';
import { SERVICES } from '../data/mockData';
import './Home.css';

export default function Home() {
  return (
    <div className="home">
      {/* Navbar */}
      <nav className="home-nav">
        <div className="nav-inner">
          <div className="nav-brand">
            <div className="nav-logo">BP</div>
            <span>Banque Populaire</span>
          </div>
          <div className="nav-links">
            <Link to="/nos-services">Nos Services</Link>
            <Link to="/horaires">Horaires</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div className="nav-actions">
            <Link to="/login" className="btn btn-primary btn-sm">Se connecter</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">🏆 Banque N°1 au Maroc</div>
          <h1>
            Votre avenir financier<br />
            <span>commence ici.</span>
          </h1>
          <p>
            Banque Populaire Maroc — Agence El Khalil El Jadida.<br />
            Des solutions bancaires adaptées à chaque étape de votre vie.
          </p>
          <div className="hero-actions">
  <button 
    className="btn btn-primary btn-lg"
    onClick={() => {
      const user = JSON.parse(localStorage.getItem('bp_user') || 'null');
      if (user) {
        window.location.href = user.role === 'client' ? '/espace-client' : '/dashboard';
      } else {
        window.location.href = '/login';
      }
    }}
  >
    Accéder à mon espace
  </button>
  <Link to="/nos-services" className="btn btn-secondary btn-lg">
    Nos services
  </Link>
          </div>
          <div className="hero-stats">
            <div className="hstat"><strong>50+</strong><span>Ans d'expérience</span></div>
            <div className="hstat"><strong>3M+</strong><span>Clients actifs</span></div>
            <div className="hstat"><strong>1,800+</strong><span>Agences</span></div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card">
            <div className="card-chip"></div>
            <div className="card-logo">BP</div>
            <div className="card-number">•••• •••• •••• 4821</div>
            <div className="card-info">
              <span>Mohamed Boukhari</span>
              <span>12/28</span>
            </div>
          </div>
          <div className="hero-bubble b1">📈 +12% ce mois</div>
          <div className="hero-bubble b2">✅ Approuvé</div>
          <div className="hero-bubble b3">🔒 Sécurisé SSL</div>
        </div>
      </section>

      {/* Services */}
      <section className="home-services">
        <div className="section-inner">
          <h2>Nos Services</h2>
          <p>Des solutions complètes pour vos besoins bancaires</p>
          <div className="services-grid">
            {SERVICES.map(s => (
              <div key={s.id} className="service-card">
                <span className="service-icon">{s.icon}</span>
                <h3>{s.titre}</h3>
                <p>{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="home-cta">
        <h2>Prêt à rejoindre Banque Populaire ?</h2>
        <p>Ouvrez un compte en ligne ou prenez rendez-vous en agence.</p>
        <Link to="/login" className="btn btn-primary btn-lg">
          Ouvrir un compte
        </Link>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="nav-logo">BP</div>
            <div>
              <strong>Banque Populaire Maroc</strong>
              <p>Agence El Khalil El Jadida</p>
            </div>
          </div>
          <div className="footer-links">
            <Link to="/nos-services">Services</Link>
            <Link to="/horaires">Horaires</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <p className="footer-copy">© 2026 Banque Populaire Maroc. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
