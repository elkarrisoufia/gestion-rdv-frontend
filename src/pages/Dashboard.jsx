import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { rdvAPI, statsAPI } from '../services/api';
import './Dashboard.css';

const STATUS_LABELS  = { confirme: 'Confirmé', en_attente: 'En attente', annule: 'Annulé' };
const STATUS_CLASSES = { confirme: 'badge-green', en_attente: 'badge-yellow', annule: 'badge-red' };

export default function Dashboard() {
  const { user, isManager } = useAuth();
  const [rdvToday, setRdvToday] = useState([]);
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [rdvRes, statsRes] = await Promise.all([
          rdvAPI.getToday(),
          statsAPI.index(),
        ]);
        setRdvToday(rdvRes.data);
        setStats(statsRes.data);
      } catch (e) {
        console.error('Dashboard error:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const rdvConfirmes = rdvToday.filter(r => r.statut === 'confirme').length;
  const rdvAttente   = rdvToday.filter(r => r.statut === 'en_attente').length;

  // ✅ Date en français
  const today = new Date().toLocaleDateString('fr-MA', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh'}}>
      <div style={{textAlign:'center'}}>
        <div className="spinner spinner-orange" style={{width:32,height:32,borderWidth:3,margin:'0 auto 12px'}}></div>
        <p className="text-muted">Chargement...</p>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1>Bonjour, {user?.prenom} 👋</h1>
        <p style={{textTransform:'capitalize'}}>{today}</p>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon orange">📅</div>
          <div className="kpi-content">
            <span className="kpi-label">RDV aujourd'hui</span>
            <strong className="kpi-value">{rdvToday.length}</strong>
            <span className="kpi-sub">{rdvConfirmes} confirmés · {rdvAttente} en attente</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon green">👥</div>
          <div className="kpi-content">
            <span className="kpi-label">Nouveaux clients</span>
            <strong className="kpi-value">{stats?.nouveaux_clients ?? 0}</strong>
            <span className="kpi-sub">Ce mois-ci</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon blue">📧</div>
          <div className="kpi-content">
            <span className="kpi-label">Emails envoyés</span>
            <strong className="kpi-value">{stats?.emails_envoyes ?? 0}</strong>
            <span className="kpi-sub">Ce mois-ci</span>
          </div>
        </div>
        {isManager && (
          <div className="kpi-card">
            <div className="kpi-icon yellow">📊</div>
            <div className="kpi-content">
              <span className="kpi-label">Taux confirmation</span>
              <strong className="kpi-value">{stats?.taux_confirmation ?? 0}%</strong>
              <span className="kpi-sub">Ce mois-ci</span>
            </div>
          </div>
        )}
      </div>

      <div className="dashboard-grid">
        {/* RDV du jour */}
        <div className="card">
          <div className="card-title-row">
            <h3>Rendez-vous du jour</h3>
            <Link to="/rendez-vous" className="btn btn-secondary btn-sm">Voir tous →</Link>
          </div>
          {rdvToday.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📅</div>
              <h3>Aucun RDV aujourd'hui</h3>
              <p>Profitez de votre journée !</p>
            </div>
          ) : (
            <div className="rdv-list">
              {rdvToday.map(rdv => (
                <div key={rdv.id} className="rdv-item">
                  <div className="rdv-time">{rdv.heure_rdv}</div>
                  <div className="rdv-info">
                    <strong>{rdv.client?.user?.prenom} {rdv.client?.user?.nom}</strong>
                    <span>{rdv.motif}</span>
                  </div>
                  <span className={`badge ${STATUS_CLASSES[rdv.statut]}`}>
                    {STATUS_LABELS[rdv.statut]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions rapides */}
        <div className="card">
          <h3 style={{fontSize:'15px',fontWeight:700,color:'var(--gray-800)',marginBottom:'16px'}}>
            Actions rapides
          </h3>
          <div className="quick-actions">
            {[
              { to:'/rendez-vous', icon:'📅', title:'Nouveau RDV',       desc:'Créer un rendez-vous' },
              { to:'/clients',     icon:'👤', title:'Ajouter client',    desc:'Enregistrer un nouveau client' },
              { to:'/emails',      icon:'✉️',  title:'Rédiger un email', desc:'Avec assistance IA' },
              { to:'/chatbot',     icon:'🤖', title:'Chatbot IA',        desc:'Générer un email automatiquement' },
            ].map(a => (
              <Link key={a.to} to={a.to} className="quick-action">
                <span>{a.icon}</span>
                <div>
                  <strong>{a.title}</strong>
                  <p>{a.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
