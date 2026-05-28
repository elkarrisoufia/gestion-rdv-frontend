import { useState, useEffect } from 'react';
import { employeAPI } from '../services/api';

const POSTES = ['Conseiller Clientèle','Directeur Agence','Chargé de Clientèle','Responsable Commercial','Analyste Crédit'];
const COLORS  = ['#F97316','#3B82F6','#10B981','#8B5CF6','#EC4899','#06B6D4'];
const emptyForm = { prenom:'', nom:'', email:'', telephone:'', poste:'Conseiller Clientèle', agence:'Casablanca Centre' };

export default function Employes() {
  const [employes,  setEmployes]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editEmp,   setEditEmp]   = useState(null);
  const [form,      setForm]      = useState(emptyForm);
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };
  const getColor  = (nom) => COLORS[(nom?.charCodeAt(0) || 0) % COLORS.length];

  useEffect(() => {
    employeAPI.getAll()
      .then(r => setEmployes(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = employes.filter(e => {
    const q = search.toLowerCase();
    return !q || e.user?.nom.toLowerCase().includes(q) || e.user?.prenom.toLowerCase().includes(q) || e.matricule?.toLowerCase().includes(q);
  });

  const openCreate = () => { setEditEmp(null); setForm(emptyForm); setShowModal(true); };
  const openEdit   = (emp) => {
    setEditEmp(emp);
    setForm({ prenom: emp.user?.prenom, nom: emp.user?.nom, email: emp.user?.email, telephone: emp.user?.telephone||'', poste: emp.poste, agence: emp.agence });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.nom || !form.prenom || !form.email) { showToast('⚠️ Remplissez les champs obligatoires.'); return; }
    setSaving(true);
    try {
      if (editEmp) {
        const res = await employeAPI.update(editEmp.id, form);
        setEmployes(prev => prev.map(e => e.id === editEmp.id ? res.data : e));
        showToast('✅ Employé modifié.');
      } else {
        const res = await employeAPI.create(form);
        setEmployes(prev => [...prev, res.data]);
        showToast('✅ Employé créé. Mot de passe : password123');
      }
      setShowModal(false);
    } catch (e) {
      showToast('❌ ' + (e.response?.data?.message || 'Erreur serveur.'));
    } finally { setSaving(false); }
  };

  const deleteEmp = async (id) => {
    if (!confirm('Supprimer cet employé ?')) return;
    try {
      await employeAPI.delete(id);
      setEmployes(prev => prev.filter(e => e.id !== id));
      showToast('🗑️ Employé supprimé.');
    } catch { showToast('❌ Impossible de supprimer.'); }
  };

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh'}}>
      <div className="spinner spinner-orange" style={{width:32,height:32,borderWidth:3}}></div>
    </div>
  );

  return (
    <div>
      {toast && <div className={`alert ${toast.startsWith('✅') ? 'alert-success' : toast.startsWith('⚠️') ? 'alert-warning' : 'alert-error'}`} style={{position:'fixed',top:20,right:20,zIndex:9999,maxWidth:340,boxShadow:'var(--shadow-lg)'}}>{toast}</div>}

      <div className="page-top">
        <div className="page-header" style={{marginBottom:0}}>
          <h1>Employés</h1>
          <p>{filtered.length} employés dans l'agence</p>
        </div>
        <div className="page-actions">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input placeholder="Nom, matricule..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={openCreate}>+ Nouvel employé</button>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(290px, 1fr))',gap:14}}>
        {filtered.map(emp => (
          <div key={emp.id} className="card card-hover">
            <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:14}}>
              <div style={{width:50,height:50,borderRadius:'50%',background:getColor(emp.user?.nom),display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:'16px',fontWeight:700,flexShrink:0}}>
                {emp.user?.prenom?.[0]}{emp.user?.nom?.[0]}
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:'15px',color:'var(--gray-900)'}}>{emp.user?.prenom} {emp.user?.nom}</div>
                <div style={{fontSize:'13px',color:'var(--orange)',fontWeight:600}}>{emp.poste}</div>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7,marginBottom:14}}>
              {[['Matricule',emp.matricule],['Agence',emp.agence],['Email',emp.user?.email],['Tél.',emp.user?.telephone||'—']].map(([k,v]) => (
                <div key={k} style={{background:'var(--gray-50)',padding:'8px 10px',borderRadius:'var(--radius-sm)',border:'1px solid var(--gray-100)'}}>
                  <div style={{fontSize:'10px',color:'var(--gray-400)',fontWeight:700,textTransform:'uppercase',marginBottom:2}}>{k}</div>
                  <div style={{fontSize:'12px',fontWeight:600,color:'var(--gray-700)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:8}}>
              <button className="btn btn-secondary btn-sm" style={{flex:1}} onClick={() => openEdit(emp)}>✏️ Modifier</button>
              <button className="btn btn-danger btn-sm" onClick={() => deleteEmp(emp.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editEmp ? 'Modifier l\'employé' : 'Nouvel employé'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div className="form-group"><label>Prénom *</label><input className="form-control" value={form.prenom} onChange={e => setForm({...form,prenom:e.target.value})} placeholder="Prénom" /></div>
                <div className="form-group"><label>Nom *</label><input className="form-control" value={form.nom} onChange={e => setForm({...form,nom:e.target.value})} placeholder="Nom" /></div>
              </div>
              <div className="form-group"><label>Email *</label><input type="email" className="form-control" value={form.email} onChange={e => setForm({...form,email:e.target.value})} placeholder="employe@bp.ma" /></div>
              <div className="form-group"><label>Téléphone</label><input className="form-control" value={form.telephone} onChange={e => setForm({...form,telephone:e.target.value})} placeholder="+212661..." /></div>
              <div className="form-group">
                <label>Poste</label>
                <select className="form-control" value={form.poste} onChange={e => setForm({...form,poste:e.target.value})}>
                  {POSTES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Agence</label><input className="form-control" value={form.agence} onChange={e => setForm({...form,agence:e.target.value})} /></div>
              {!editEmp && <div className="alert alert-info">🔑 Mot de passe par défaut : <strong>password123</strong></div>}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? <><span className="spinner" /> Enregistrement...</> : (editEmp ? 'Modifier' : 'Créer')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
