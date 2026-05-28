import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import './Login.css';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep]     = useState(1); // 2 étapes
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [form, setForm]     = useState({
    prenom:'', nom:'', email:'', password:'', password_confirmation:'',
    telephone:'', cin:'', adresse:''
  });

  const handleNext = (e) => {
    e.preventDefault();
    if (!form.prenom || !form.nom || !form.email || !form.password) {
      setError('Remplissez tous les champs obligatoires.');
      return;
    }
    if (form.password !== form.password_confirmation) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.cin) { setError('Le CIN est obligatoire.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.registerClient(form);
      // Sauvegarder token + user
      localStorage.setItem('bp_token', res.data.token);
      localStorage.setItem('bp_user', JSON.stringify(res.data.user));
      // Rediriger vers espace client
      navigate('/espace-client');
      window.location.reload(); // Recharger pour que AuthContext prenne le user
    } catch (e) {
      const errors = e.response?.data?.errors;
      if (errors) {
        const first = Object.values(errors)[0];
        setError(Array.isArray(first) ? first[0] : first);
      } else {
        setError(e.response?.data?.message || 'Erreur lors de l\'inscription.');
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <Link to="/" className="login-logo">
          <div className="logo-mark">BP</div>
          <span>Banque Populaire</span>
        </Link>
        <div className="login-hero">
          <h1>Ouvrez votre<br /><span>compte en ligne</span></h1>
          <p>Rejoignez la Banque Populaire Maroc et accédez à tous nos services bancaires depuis chez vous.</p>
          <div className="login-features">
            {['✅ Inscription gratuite et rapide','🔒 Données sécurisées SSL','📅 Prenez vos RDV en ligne','💳 Gestion de compte 24h/24'].map(f => (
              <div key={f} className="login-feature">{f}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-box" style={{maxWidth:440}}>
          {/* Indicateur étapes */}
          <div style={{display:'flex',gap:8,marginBottom:24}}>
            {[1,2].map(s => (
              <div key={s} style={{flex:1,height:4,borderRadius:99,background: s <= step ? 'var(--orange)' : 'var(--gray-200)',transition:'background .3s'}} />
            ))}
          </div>
          <h2>{step === 1 ? 'Créer un compte' : 'Informations bancaires'}</h2>
          <p className="login-sub">
            {step === 1 ? 'Étape 1/2 — Informations personnelles' : 'Étape 2/2 — Informations bancaires'}
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          {step === 1 ? (
            <form onSubmit={handleNext}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div className="form-group">
                  <label>Prénom *</label>
                  <input className="form-control" value={form.prenom} onChange={e => setForm({...form,prenom:e.target.value})} placeholder="Mohamed" required />
                </div>
                <div className="form-group">
                  <label>Nom *</label>
                  <input className="form-control" value={form.nom} onChange={e => setForm({...form,nom:e.target.value})} placeholder="Alami" required />
                </div>
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" className="form-control" value={form.email} onChange={e => setForm({...form,email:e.target.value})} placeholder="votre@email.com" required />
              </div>
              <div className="form-group">
                <label>Téléphone</label>
                <input className="form-control" value={form.telephone} onChange={e => setForm({...form,telephone:e.target.value})} placeholder="+212 6XX XXX XXX" />
              </div>
              <div className="form-group">
                <label>Mot de passe *</label>
                <input type="password" className="form-control" value={form.password} onChange={e => setForm({...form,password:e.target.value})} placeholder="Min. 6 caractères" required />
              </div>
              <div className="form-group">
                <label>Confirmer mot de passe *</label>
                <input type="password" className="form-control" value={form.password_confirmation} onChange={e => setForm({...form,password_confirmation:e.target.value})} placeholder="Répétez le mot de passe" required />
              </div>
              <button type="submit" className="btn btn-primary btn-lg w-full">Continuer →</button>
            </form>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Numéro CIN *</label>
                <input className="form-control" value={form.cin} onChange={e => setForm({...form,cin:e.target.value})} placeholder="AB123456" required />
              </div>
              <div className="form-group">
                <label>Adresse</label>
                <input className="form-control" value={form.adresse} onChange={e => setForm({...form,adresse:e.target.value})} placeholder="Votre adresse complète" />
              </div>
              <div className="alert alert-info" style={{marginBottom:16}}>
                ℹ️ Un compte courant sera créé par défaut. Vous pourrez le modifier en agence.
              </div>
              <div style={{display:'flex',gap:10}}>
                <button type="button" className="btn btn-secondary" style={{flex:1}} onClick={() => setStep(1)}>← Retour</button>
                <button type="submit" className="btn btn-primary" style={{flex:2}} disabled={loading}>
                  {loading ? <><span className="spinner" /> Création...</> : '✅ Créer mon compte'}
                </button>
              </div>
            </form>
          )}

          <p style={{textAlign:'center',marginTop:20,fontSize:'13px',color:'var(--gray-500)'}}>
            Déjà un compte ? <Link to="/login" style={{color:'var(--orange)',fontWeight:600}}>Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
