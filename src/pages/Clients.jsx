import { useState, useEffect } from 'react';
import { clientAPI, employeAPI } from '../services/api';

const TYPE_LABELS  = { courant:'Courant', epargne:'Épargne', professionnel:'Pro' };
const TYPE_CLASSES = { courant:'badge-blue', epargne:'badge-green', professionnel:'badge-orange' };
const AVATAR_COLORS = ['#F97316','#3B82F6','#10B981','#8B5CF6','#EC4899','#06B6D4','#F59E0B','#EF4444'];

const emptyForm = { nom:'', prenom:'', email:'', telephone:'', cin:'', adresse:'', type_compte:'courant', is_vip:false, employe_id:'' };

export default function Clients() {
  const [clients,    setClients]    = useState([]);
  const [employes,   setEmployes]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [showModal,  setShowModal]  = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [editClient, setEditClient] = useState(null);
  const [form,       setForm]       = useState(emptyForm);
  const [saving,     setSaving]     = useState(false);
  const [toast,      setToast]      = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  useEffect(() => {
    Promise.all([clientAPI.getAll(), employeAPI.getAll()])
      .then(([c, e]) => { setClients(c.data); setEmployes(e.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    return !q || c.user?.nom.toLowerCase().includes(q) || c.user?.prenom.toLowerCase().includes(q) || c.user?.email.toLowerCase().includes(q) || c.cin?.toLowerCase().includes(q);
  });

  const openCreate = () => {
    setEditClient(null);
    setForm({ ...emptyForm, employe_id: employes[0]?.id || '' });
    setShowModal(true);
  };
  const openEdit = (client) => {
    setEditClient(client);
    setForm({ nom: client.user?.nom, prenom: client.user?.prenom, email: client.user?.email, telephone: client.user?.telephone || '', cin: client.cin, adresse: client.adresse || '', type_compte: client.type_compte, is_vip: client.is_vip, employe_id: client.employe_id });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.nom || !form.prenom || !form.email || !form.cin) { showToast('⚠️ Remplissez les champs obligatoires.'); return; }
    setSaving(true);
    try {
      if (editClient) {
        const res = await clientAPI.update(editClient.id, form);
        setClients(prev => prev.map(c => c.id === editClient.id ? res.data : c));
        showToast('✅ Client modifié.');
      } else {
        const res = await clientAPI.create(form);
        setClients(prev => [res.data, ...prev]);
        showToast('✅ Client créé.');
      }
      setShowModal(false);
    } catch (e) {
      showToast('❌ ' + (e.response?.data?.message || 'Erreur serveur.'));
    } finally { setSaving(false); }
  };

  const deleteClient = async (id) => {
    if (!confirm('Supprimer ce client ?')) return;
    try {
      await clientAPI.delete(id);
      setClients(prev => prev.filter(c => c.id !== id));
      showToast('🗑️ Client supprimé.');
    } catch { showToast('❌ Impossible de supprimer.'); }
  };

  const getColor = (nom) => AVATAR_COLORS[(nom?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

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
          <h1>Clients</h1>
          <p>{filtered.length} clients enregistrés</p>
        </div>
        <div className="page-actions">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input placeholder="Nom, CIN, email..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={openCreate}>+ Nouveau client</button>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Client</th><th>CIN</th><th>Téléphone</th><th>Type</th><th>Conseiller</th><th>Statut</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="7"><div className="empty-state"><div className="icon">👥</div><h3>Aucun client trouvé</h3></div></td></tr>
            ) : filtered.map(client => {
              const emp = employes.find(e => e.id === client.employe_id);
              return (
                <tr key={client.id}>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{width:34,height:34,borderRadius:'50%',background:getColor(client.user?.nom),display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:'11px',fontWeight:700,flexShrink:0}}>
                        {client.user?.prenom?.[0]}{client.user?.nom?.[0]}
                      </div>
                      <div>
                        <div style={{fontWeight:600,color:'var(--gray-800)'}}>{client.user?.prenom} {client.user?.nom} {client.is_vip && '⭐'}</div>
                        <div style={{fontSize:'12px',color:'var(--gray-400)'}}>{client.user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><code style={{fontSize:'13px',color:'var(--gray-600)',background:'var(--gray-100)',padding:'2px 6px',borderRadius:4}}>{client.cin}</code></td>
                  <td style={{color:'var(--gray-600)'}}>{client.user?.telephone || '—'}</td>
                  <td><span className={`badge ${TYPE_CLASSES[client.type_compte]}`}>{TYPE_LABELS[client.type_compte]}</span></td>
                  <td style={{color:'var(--gray-600)'}}>{emp ? `${emp.user?.prenom} ${emp.user?.nom}` : '—'}</td>
                  <td>{client.is_vip ? <span className="badge badge-yellow">⭐ VIP</span> : <span className="badge badge-gray">Standard</span>}</td>
                  <td>
                    <div style={{display:'flex',gap:5}}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setShowDetail(client)}>👁️</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(client)}>✏️</button>
                      <button className="btn btn-danger btn-sm"    onClick={() => deleteClient(client.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Create/Edit */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editClient ? 'Modifier le client' : 'Nouveau client'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div className="form-group"><label>Prénom *</label><input className="form-control" value={form.prenom} onChange={e => setForm({...form, prenom:e.target.value})} placeholder="Prénom" /></div>
                <div className="form-group"><label>Nom *</label><input className="form-control" value={form.nom} onChange={e => setForm({...form, nom:e.target.value})} placeholder="Nom" /></div>
              </div>
              <div className="form-group"><label>Email *</label><input type="email" className="form-control" value={form.email} onChange={e => setForm({...form, email:e.target.value})} placeholder="email@gmail.com" /></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div className="form-group"><label>Téléphone</label><input className="form-control" value={form.telephone} onChange={e => setForm({...form, telephone:e.target.value})} placeholder="+212..." /></div>
                <div className="form-group"><label>CIN *</label><input className="form-control" value={form.cin} onChange={e => setForm({...form, cin:e.target.value})} placeholder="AB123456" /></div>
              </div>
              <div className="form-group"><label>Adresse</label><input className="form-control" value={form.adresse} onChange={e => setForm({...form, adresse:e.target.value})} placeholder="Adresse complète" /></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div className="form-group">
                  <label>Type de compte</label>
                  <select className="form-control" value={form.type_compte} onChange={e => setForm({...form, type_compte:e.target.value})}>
                    <option value="courant">Courant</option>
                    <option value="epargne">Épargne</option>
                    <option value="professionnel">Professionnel</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Conseiller</label>
                  <select className="form-control" value={form.employe_id} onChange={e => setForm({...form, employe_id:e.target.value})}>
                    {employes.map(e => <option key={e.id} value={e.id}>{e.user?.prenom} {e.user?.nom}</option>)}
                  </select>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <input type="checkbox" id="vip" checked={form.is_vip} onChange={e => setForm({...form, is_vip:e.target.checked})} />
                <label htmlFor="vip" style={{fontSize:'14px',color:'var(--gray-700)',cursor:'pointer'}}>⭐ Client VIP</label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? <><span className="spinner" /> Enregistrement...</> : (editClient ? 'Modifier' : 'Créer le client')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <div className="modal-overlay" onClick={() => setShowDetail(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Fiche client</h2>
              <button className="modal-close" onClick={() => setShowDetail(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{textAlign:'center',marginBottom:22}}>
                <div style={{width:60,height:60,borderRadius:'50%',background:getColor(showDetail.user?.nom),display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:'20px',fontWeight:700,margin:'0 auto 12px'}}>
                  {showDetail.user?.prenom?.[0]}{showDetail.user?.nom?.[0]}
                </div>
                <h3 style={{fontSize:'18px',fontWeight:700}}>{showDetail.user?.prenom} {showDetail.user?.nom} {showDetail.is_vip && '⭐'}</h3>
                <p style={{color:'var(--gray-400)',fontSize:'13px',marginTop:3}}>{showDetail.user?.email}</p>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                {[['CIN',showDetail.cin],['Téléphone',showDetail.user?.telephone||'—'],['Type compte',TYPE_LABELS[showDetail.type_compte]],['Adresse',showDetail.adresse||'—'],['Statut',showDetail.is_vip?'VIP ⭐':'Standard']].map(([k,v]) => (
                  <div key={k} style={{background:'var(--gray-50)',padding:'11px 13px',borderRadius:'var(--radius-sm)',border:'1px solid var(--gray-200)'}}>
                    <div style={{fontSize:'10.5px',color:'var(--gray-400)',fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:3}}>{k}</div>
                    <div style={{fontSize:'14px',fontWeight:600,color:'var(--gray-800)'}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
