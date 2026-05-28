import { Link } from 'react-router-dom';
import { SERVICES, HORAIRES } from '../data/mockData';
import './PublicPages.css';

function PublicNav() {
  return (
    <nav className="pub-nav">
      <div className="nav-inner">
        <Link to="/" className="nav-brand">
          <div className="nav-logo">BP</div>
          <span>Banque Populaire</span>
        </Link>
        <div className="nav-links">
          <Link to="/nos-services">Nos Services</Link>
          <Link to="/horaires">Horaires</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <Link to="/login" className="btn btn-primary btn-sm">Se connecter</Link>
      </div>
    </nav>
  );
}

function ServicesPage() {
  return (
    <div>
      <PublicNav />
      <div className="pub-hero">
        <h1>Nos Services Bancaires</h1>
        <p>Des solutions financières complètes pour particuliers et entreprises</p>
      </div>
      <div className="pub-content">
        <div className="services-detail-grid">
          {SERVICES.map(s => (
            <div key={s.id} className="service-detail-card">
              <div className="sdc-icon">{s.icon}</div>
              <div>
                <h3>{s.titre}</h3>
                <p>{s.description}</p>
                <Link to="/login" className="btn btn-primary btn-sm" style={{marginTop:'12px'}}>En savoir plus</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HorairesPage() {
  const now = new Date();
  const jourIdx = now.getDay();
  const jourLabels = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
  const aujourd_hui = jourLabels[jourIdx];

  return (
    <div>
      <PublicNav />
      <div className="pub-hero">
        <h1>Horaires d'Ouverture</h1>
        <p>Agence Banque Populaire — Casablanca Centre</p>
      </div>
      <div className="pub-content">
        <div className="horaires-container">
          <div className="card" style={{maxWidth:'500px',margin:'0 auto'}}>
            <h3 style={{marginBottom:'20px',fontFamily:'var(--font-display)',fontSize:'20px'}}>📍 Agence El Khalil El Jadida Centre</h3>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <tbody>
                {HORAIRES.map(h => (
                  <tr key={h.jour} style={{
                    background: h.jour === aujourd_hui ? 'var(--orange-pale)' : 'transparent',
                    borderRadius: '8px'
                  }}>
                    <td style={{padding:'12px 16px',fontWeight: h.jour === aujourd_hui ? 700 : 500,color: h.jour === aujourd_hui ? 'var(--orange-dark)' : 'var(--gray-700)'}}>
                      {h.jour} {h.jour === aujourd_hui && <span className="badge badge-orange" style={{marginLeft:'8px',fontSize:'11px'}}>Aujourd'hui</span>}
                    </td>
                    <td style={{padding:'12px 16px',textAlign:'right',fontWeight:600,color: h.ouverture ? 'var(--gray-800)' : 'var(--red)'}}>
                      {h.ouverture ? `${h.ouverture} – ${h.fermeture}` : 'Fermé'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactPage() {
  const [form, setForm] = useState({ nom: '', email: '', telephone: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div>
      <PublicNav />
      <div className="pub-hero">
        <h1>Contactez-nous</h1>
        <p>Notre équipe est à votre disposition</p>
      </div>
      <div className="pub-content">
        <div className="contact-layout">
          <div className="contact-info">
            <h3>Agence El Khalil El Jadida Centre</h3>
            {[
              ['📍', 'Adresse', 'Boulevard Ibrahim El khalil, El jadida 20000, Maroc'],
              ['📞', 'Téléphone', '05 22 XX XX XX'],
              ['✉️', 'Email', 'agencelkhalil@bp.ma'],
              ['🕐', 'Horaires', 'Lun-Ven 8h30-15h45'],
            ].map(([icon, label, value]) => (
              <div key={label} className="contact-info-item">
                <span className="ci-icon">{icon}</span>
                <div>
                  <strong>{label}</strong>
                  <p>{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            {sent ? (
              <div className="empty-state">
                <div className="icon">✅</div>
                <h3>Message envoyé !</h3>
                <p>Notre équipe vous contactera dans les plus brefs délais.</p>
                <button className="btn btn-primary" style={{marginTop:'16px'}} onClick={() => setSent(false)}>Nouveau message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 style={{marginBottom:'20px',fontFamily:'var(--font-display)',fontSize:'20px'}}>Envoyez-nous un message</h3>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                  <div className="form-group">
                    <label>Nom complet *</label>
                    <input className="form-control" value={form.nom} onChange={e => setForm({...form,nom:e.target.value})} placeholder="Votre nom" required />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input type="email" className="form-control" value={form.email} onChange={e => setForm({...form,email:e.target.value})} placeholder="votre@email.com" required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Téléphone</label>
                  <input className="form-control" value={form.telephone} onChange={e => setForm({...form,telephone:e.target.value})} placeholder="+212..." />
                </div>
                <div className="form-group">
                  <label>Message *</label>
                  <textarea className="form-control" rows="5" value={form.message} onChange={e => setForm({...form,message:e.target.value})} placeholder="Comment pouvons-nous vous aider ?" required style={{resize:'vertical'}} />
                </div>
                <button type="submit" className="btn btn-primary btn-lg w-full">Envoyer le message</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Need useState for ContactPage
import { useState } from 'react';

export default function PublicPages({ page }) {
  if (page === 'services') return <ServicesPage />;
  if (page === 'horaires') return <HorairesPage />;
  if (page === 'contact') return <ContactPage />;
  return null;
}
