import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { rdvAPI, employeAPI } from '../services/api';

const STATUS_LABELS  = { confirme:'Confirmé', en_attente:'En attente', annule:'Annulé' };
const STATUS_CLASSES = { confirme:'badge-green', en_attente:'badge-yellow', annule:'badge-red' };
const MOTIFS = ['Ouverture de compte','Crédit immobilier','Crédit consommation','Prêt voiture','Carte bancaire','Virement international','Assurance habitation','Bilan de compte','Autre'];

// ✅ Créneaux filtrés selon heure actuelle
const getCreneaux = (dateStr) => {
  const tous = ['09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','16:30'];
  const today = new Date().toISOString().split('T')[0];
  if (dateStr !== today) return tous;
  const now = new Date();
  return tous.filter(h => {
    const [hh, mm] = h.split(':').map(Number);
    const c = new Date(); c.setHours(hh, mm, 0, 0);
    return c > now;
  });
};

export default function ClientSpace() {
  const { user } = useAuth();
  const [rdvList,   setRdvList]   = useState([]);
  const [employes,  setEmployes]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState('');
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    date_rdv: '', heure_rdv: '09:00', motif: 'Bilan de compte', employe_id: ''
  });

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 4000); };

  useEffect(() => {
    const load = async () => {
      try {
        const [rdvRes, empRes] = await Promise.all([
          rdvAPI.mesRdv(),
          employeAPI.getAll(),
        ]);
        setRdvList(rdvRes.data);
        setEmployes(empRes.data);
        if (empRes.data.length > 0) {
          setForm(f => ({ ...f, employe_id: empRes.data[0].id }));
        }
      } catch (e) {
        console.error('Erreur:', e);
        showToast('❌ Erreur de chargement.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Créneaux disponibles selon date choisie
  const creneaux = getCreneaux(form.date_rdv || today);

  const openModal = () => {
    const c = getCreneaux(today);
    setForm({ date_rdv: today, heure_rdv: c[0] || '09:00', motif: 'Bilan de compte', employe_id: employes[0]?.id || '' });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.date_rdv) { showToast('⚠️ Choisissez une date.'); return; }
    if (!form.employe_id) { showToast('⚠️ Choisissez un conseiller.'); return; }
    if (creneaux.length === 0) { showToast('⚠️ Aucun créneau disponible. Choisissez une autre date.'); return; }

    setSaving(true);
    try {
      const res = await rdvAPI.clientRdv(form);
      setRdvList(prev => [res.data, ...prev]);
      showToast('✅ Demande envoyée ! Un conseiller confirmera bientôt.');
      setShowModal(false);
    } catch (e) {
      showToast('❌ ' + (e.response?.data?.message || 'Erreur.'));
    } finally { setSaving(false); }
  };

  const cancelRdv = async (id) => {
    try {
      await rdvAPI.clientAnnuler(id);
      setRdvList(prev => prev.map(r => r.id === id ? { ...r, statut:'annule' } : r));
      showToast('✅ Rendez-vous annulé.');
    } catch { showToast('❌ Impossible d\'annuler.'); }
  };

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh'}}>
      <div className="spinner spinner-orange" style={{width:32,height:32,borderWidth:3}}></div>
    </div>
  );

  return (
    <div>
      {toast && (
        <div className={`alert ${toast.startsWith('✅') ? 'alert-success' : toast.startsWith('⚠️') ? 'alert-warning' : 'alert-error'}`}
          style={{position:'fixed',top:20,right:20,zIndex:9999,maxWidth:380,boxShadow:'var(--shadow-lg)'}}>
          {toast}
        </div>
      )}

      <div className="page-header">
        <h1>Bonjour, {user?.prenom} 👋</h1>
        <p>Bienvenue dans votre espace client — Banque Populaire</p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:20,alignItems:'start'}}>
        {/* Profil */}
        <div className="card" style={{textAlign:'center'}}>
          <div style={{width:60,height:60,borderRadius:'50%',background:'var(--orange)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:'20px',fontWeight:700,margin:'0 auto 14px'}}>
            {user?.prenom?.[0]}{user?.nom?.[0]}
          </div>
          <h3 style={{fontSize:'17px',fontWeight:700,color:'var(--gray-900)'}}>{user?.prenom} {user?.nom}</h3>
          <p style={{color:'var(--gray-400)',fontSize:'13px',marginTop:3,marginBottom:14}}>{user?.email}</p>
          <span className="badge badge-orange">Client</span>
          <div style={{marginTop:16,display:'flex',flexDirection:'column',gap:8,textAlign:'left'}}>
            {[
              ['📞 Téléphone', user?.telephone || 'Non renseigné'],
              ['🏦 Agence', 'Agence El Khalil El Jadida'],
              ['📋 Statut', 'Client actif'],
            ].map(([k,v]) => (
              <div key={k} style={{background:'var(--gray-50)',padding:'9px 12px',borderRadius:'var(--radius-sm)',border:'1px solid var(--gray-100)'}}>
                <div style={{fontSize:'11px',color:'var(--gray-400)',fontWeight:700,marginBottom:2}}>{k}</div>
                <div style={{fontSize:'13px',fontWeight:600,color:'var(--gray-700)'}}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Mes RDV */}
        <div className="card">
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
            <div>
              <h3 style={{fontSize:'17px',fontWeight:700,color:'var(--gray-900)'}}>Mes Rendez-vous</h3>
              <p style={{fontSize:'13px',color:'var(--gray-400)',marginTop:2}}>{rdvList.length} rendez-vous</p>
            </div>
            <button className="btn btn-primary" onClick={openModal}>+ Prendre RDV</button>
          </div>

          {rdvList.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📅</div>
              <h3>Aucun rendez-vous</h3>
              <p>Prenez votre premier rendez-vous en agence.</p>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {rdvList.map(rdv => (
                <div key={rdv.id} style={{display:'flex',alignItems:'center',gap:14,padding:'13px 14px',background:'var(--gray-50)',borderRadius:'var(--radius-sm)',border:'1px solid var(--gray-200)'}}>
                  <div style={{textAlign:'center',minWidth:52,flexShrink:0}}>
                    <div style={{fontSize:'10px',color:'var(--gray-400)',fontWeight:700,textTransform:'uppercase'}}>
                      {new Date(rdv.date_rdv + 'T00:00:00').toLocaleDateString('fr-MA',{month:'short'})}
                    </div>
                    <div style={{fontSize:'24px',fontWeight:700,color:'var(--orange)',lineHeight:1.1}}>
                      {new Date(rdv.date_rdv + 'T00:00:00').getDate()}
                    </div>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:600,fontSize:'14px',color:'var(--gray-800)'}}>{rdv.motif}</div>
                    <div style={{fontSize:'12px',color:'var(--gray-400)',marginTop:2}}>
                      {rdv.heure_rdv} · {rdv.employe?.user?.prenom} {rdv.employe?.user?.nom}
                    </div>
                  </div>
                  <span className={`badge ${STATUS_CLASSES[rdv.statut]}`}>{STATUS_LABELS[rdv.statut]}</span>
                  {rdv.statut === 'en_attente' && (
                    <button className="btn btn-danger btn-sm" onClick={() => cancelRdv(rdv.id)}>Annuler</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal RDV */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Prendre un rendez-vous</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="alert alert-info">
                📍 Agence Banque Populaire — El Khalil El Jadida
              </div>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div className="form-group">
                  <label>Date souhaitée *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.date_rdv}
                    min={today}
                    onChange={e => {
                      const newDate = e.target.value;
                      const c = getCreneaux(newDate);
                      setForm({...form, date_rdv: newDate, heure_rdv: c[0] || '09:00'});
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>Heure *</label>
                  {/* ✅ Select créneaux disponibles seulement */}
                  <select
                    className="form-control"
                    value={form.heure_rdv}
                    onChange={e => setForm({...form, heure_rdv: e.target.value})}
                  >
                    {creneaux.length === 0
                      ? <option value="">Aucun créneau disponible</option>
                      : creneaux.map(h => <option key={h} value={h}>{h}</option>)
                    }
                  </select>
                  {creneaux.length === 0 && (
                    <p style={{fontSize:'12px',color:'var(--red)',marginTop:4}}>
                      ⚠️ Tous les créneaux sont passés. Choisissez une autre date.
                    </p>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Motif *</label>
                <select className="form-control" value={form.motif} onChange={e => setForm({...form, motif:e.target.value})}>
                  {MOTIFS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Conseiller *</label>
                <select className="form-control" value={form.employe_id} onChange={e => setForm({...form, employe_id:e.target.value})}>
                  <option value="">Sélectionner un conseiller</option>
                  {employes.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.user?.prenom} {e.user?.nom} — {e.poste}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={saving || creneaux.length === 0}
              >
                {saving ? <><span className="spinner" /> Envoi...</> : 'Envoyer la demande'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
