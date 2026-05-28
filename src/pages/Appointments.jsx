import { useState, useEffect } from 'react';
import { rdvAPI, clientAPI, employeAPI } from '../services/api';

const STATUS_LABELS  = { confirme: 'Confirmé', en_attente: 'En attente', annule: 'Annulé' };
const STATUS_CLASSES = { confirme: 'badge-green', en_attente: 'badge-yellow', annule: 'badge-red' };
const MOTIFS = ['Ouverture de compte','Crédit immobilier','Crédit consommation','Prêt voiture','Carte bancaire','Virement international','Assurance habitation','Bilan de compte','Autre'];

const emptyForm = { client_id:'', employe_id:'', date_rdv:'', heure_rdv:'09:00', motif:'Ouverture de compte', statut:'en_attente' };

// ✅ Créneaux disponibles selon l'heure actuelle
const getCreneaux = (dateStr) => {
  const tous = ['09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','16:30'];
  const today = new Date().toISOString().split('T')[0];
  if (dateStr !== today) return tous;
  const now = new Date();
  return tous.filter(h => {
    const [hh, mm] = h.split(':').map(Number);
    const creneau = new Date();
    creneau.setHours(hh, mm, 0, 0);
    return creneau > now;
  });
};

export default function Appointments() {
  const [rdvList,   setRdvList]   = useState([]);
  const [clients,   setClients]   = useState([]);
  const [employes,  setEmployes]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [filter,    setFilter]    = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editRdv,   setEditRdv]   = useState(null);
  const [form,      setForm]      = useState(emptyForm);
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState('');

  const today = new Date().toISOString().split('T')[0];

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 4000); };

  useEffect(() => {
    Promise.all([rdvAPI.getAll(), clientAPI.getAll(), employeAPI.getAll()])
      .then(([r, c, e]) => { setRdvList(r.data); setClients(c.data); setEmployes(e.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = rdvList.filter(r => {
    const q = search.toLowerCase();
    const matchQ = !q || r.client?.user?.nom?.toLowerCase().includes(q) || r.client?.user?.prenom?.toLowerCase().includes(q) || r.motif?.toLowerCase().includes(q);
    return matchQ && (!filter || r.statut === filter);
  });

  const openCreate = () => {
    setEditRdv(null);
    setForm({ ...emptyForm, heure_rdv: getCreneaux(today)[0] || '09:00' });
    setShowModal(true);
  };

  const openEdit = (rdv) => {
    setEditRdv(rdv);
    setForm({ client_id: rdv.client_id, employe_id: rdv.employe_id, date_rdv: rdv.date_rdv, heure_rdv: rdv.heure_rdv, motif: rdv.motif, statut: rdv.statut });
    setShowModal(true);
  };

  // ✅ Validation heure passée côté frontend
  const validateHeure = (dateStr, heureStr) => {
    if (dateStr !== today) return true;
    const [hh, mm] = heureStr.split(':').map(Number);
    const creneau = new Date();
    creneau.setHours(hh, mm, 0, 0);
    return creneau > new Date();
  };

  const handleSubmit = async () => {
    if (!form.client_id || !form.employe_id || !form.date_rdv) {
      showToast('⚠️ Remplissez tous les champs.'); return;
    }
    if (!validateHeure(form.date_rdv, form.heure_rdv)) {
      showToast('⚠️ L\'heure ' + form.heure_rdv + ' est déjà passée. Choisissez un créneau futur.'); return;
    }
    setSaving(true);
    try {
      if (editRdv) {
        const res = await rdvAPI.update(editRdv.id, form);
        setRdvList(prev => prev.map(r => r.id === editRdv.id ? res.data : r));
        showToast('✅ Rendez-vous modifié.');
      } else {
        const res = await rdvAPI.create(form);
        setRdvList(prev => [res.data, ...prev]);
        showToast('✅ Rendez-vous créé.');
      }
      setShowModal(false);
    } catch (e) {
      showToast('❌ ' + (e.response?.data?.message || 'Erreur.'));
    } finally { setSaving(false); }
  };

  const changeStatut = async (id, statut) => {
    try {
      statut === 'confirme' ? await rdvAPI.confirmer(id) : await rdvAPI.annuler(id);
      setRdvList(prev => prev.map(r => r.id === id ? { ...r, statut } : r));
      showToast(statut === 'confirme' ? '✅ RDV confirmé.' : '❌ RDV annulé.');
    } catch { showToast('❌ Erreur réseau.'); }
  };

  const deleteRdv = async (id) => {
    try {
      await rdvAPI.delete(id);
      setRdvList(prev => prev.filter(r => r.id !== id));
      showToast('🗑️ RDV supprimé.');
    } catch { showToast('❌ Impossible de supprimer.'); }
  };

  // Créneaux selon la date sélectionnée
  const creneaux = getCreneaux(form.date_rdv || today);

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh'}}>
      <div className="spinner spinner-orange" style={{width:32,height:32,borderWidth:3}}></div>
    </div>
  );

  return (
    <div>
      {toast && (
        <div className={`alert ${toast.startsWith('✅') ? 'alert-success' : toast.startsWith('⚠️') ? 'alert-warning' : 'alert-error'}`}
          style={{position:'fixed',top:20,right:20,zIndex:9999,maxWidth:360,boxShadow:'var(--shadow-lg)'}}>
          {toast}
        </div>
      )}

      <div className="page-top">
        <div className="page-header" style={{marginBottom:0}}>
          <h1>Rendez-vous</h1>
          <p>{filtered.length} rendez-vous</p>
        </div>
        <div className="page-actions">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-control" style={{width:'auto'}} value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">Tous les statuts</option>
            <option value="confirme">Confirmé</option>
            <option value="en_attente">En attente</option>
            <option value="annule">Annulé</option>
          </select>
          <button className="btn btn-primary" onClick={openCreate}>+ Nouveau RDV</button>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Client</th><th>Conseiller</th><th>Date</th><th>Heure</th><th>Motif</th><th>Statut</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="7"><div className="empty-state"><div className="icon">📅</div><h3>Aucun rendez-vous trouvé</h3></div></td></tr>
            ) : filtered.map(rdv => (
              <tr key={rdv.id}>
                <td>
                  <div style={{fontWeight:600,color:'var(--gray-800)'}}>{rdv.client?.user?.prenom} {rdv.client?.user?.nom}</div>
                  <div style={{fontSize:'12px',color:'var(--gray-400)'}}>{rdv.client?.user?.telephone}</div>
                </td>
                <td style={{color:'var(--gray-600)'}}>{rdv.employe?.user?.prenom} {rdv.employe?.user?.nom}</td>
                <td style={{fontWeight:600}}>{new Date(rdv.date_rdv + 'T00:00:00').toLocaleDateString('fr-MA',{day:'2-digit',month:'short',year:'numeric'})}</td>
                <td><span className="badge badge-orange">{rdv.heure_rdv}</span></td>
                <td style={{color:'var(--gray-600)'}}>{rdv.motif}</td>
                <td><span className={`badge ${STATUS_CLASSES[rdv.statut]}`}>{STATUS_LABELS[rdv.statut]}</span></td>
                <td>
                  <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                    {rdv.statut === 'en_attente' && <button className="btn btn-success btn-sm" onClick={() => changeStatut(rdv.id,'confirme')}>✓</button>}
                    {rdv.statut !== 'annule'     && <button className="btn btn-danger btn-sm"  onClick={() => changeStatut(rdv.id,'annule')}>✕</button>}
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(rdv)}>✏️</button>
                    <button className="btn btn-danger btn-sm"    onClick={() => deleteRdv(rdv.id)}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editRdv ? 'Modifier le RDV' : 'Nouveau Rendez-vous'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Client *</label>
                <select className="form-control" value={form.client_id} onChange={e => setForm({...form, client_id: e.target.value})}>
                  <option value="">Sélectionner un client</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.user?.prenom} {c.user?.nom}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Conseiller *</label>
                <select className="form-control" value={form.employe_id} onChange={e => setForm({...form, employe_id: e.target.value})}>
                  <option value="">Sélectionner un conseiller</option>
                  {employes.map(e => <option key={e.id} value={e.id}>{e.user?.prenom} {e.user?.nom} — {e.poste}</option>)}
                </select>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div className="form-group">
                  <label>Date *</label>
                  <input type="date" className="form-control" value={form.date_rdv} min={today}
                    onChange={e => {
                      const newDate = e.target.value;
                      const newCreneaux = getCreneaux(newDate);
                      setForm({...form, date_rdv: newDate, heure_rdv: newCreneaux[0] || '09:00'});
                    }} />
                </div>
                <div className="form-group">
                  <label>Heure *</label>
                  {/* ✅ Select des créneaux disponibles uniquement */}
                  <select className="form-control" value={form.heure_rdv} onChange={e => setForm({...form, heure_rdv: e.target.value})}>
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
                <select className="form-control" value={form.motif} onChange={e => setForm({...form, motif: e.target.value})}>
                  {MOTIFS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Statut</label>
                <select className="form-control" value={form.statut} onChange={e => setForm({...form, statut: e.target.value})}>
                  <option value="en_attente">En attente</option>
                  <option value="confirme">Confirmé</option>
                  <option value="annule">Annulé</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={saving || creneaux.length === 0}>
                {saving ? <><span className="spinner" /> Enregistrement...</> : (editRdv ? 'Modifier' : 'Créer le RDV')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
