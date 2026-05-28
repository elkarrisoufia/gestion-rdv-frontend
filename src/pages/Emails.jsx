import { useState, useEffect } from 'react';
import { emailAPI, clientAPI, employeAPI } from '../services/api';

const TYPE_LABELS  = { confirmation_rdv:'Confirmation RDV', information:'Information', commercial:'Commercial', notification:'Notification' };
const emptyForm    = { client_id:'', type:'confirmation_rdv', sujet:'', contenu:'' };

export default function Emails() {
  const [emails,    setEmails]    = useState([]);
  const [clients,   setClients]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetail,setShowDetail]= useState(null);
  const [form,      setForm]      = useState(emptyForm);
  const [generating,setGenerating]= useState(false);
  const [saving,    setSaving]    = useState(false);
  const [sending,   setSending]   = useState(null);
  const [toast,     setToast]     = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 4000); };

  useEffect(() => {
    Promise.all([emailAPI.getAll(), clientAPI.getAll()])
      .then(([e, c]) => { setEmails(e.data); setClients(c.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = emails.filter(e => {
    const q = search.toLowerCase();
    const client = clients.find(c => c.id === e.client_id);
    return !q || e.sujet?.toLowerCase().includes(q) || client?.user?.nom.toLowerCase().includes(q) || client?.user?.prenom.toLowerCase().includes(q);
  });

  const generateAI = async () => {
    if (!form.client_id) { showToast('⚠️ Sélectionnez un client.'); return; }
    setGenerating(true);
    const client = clients.find(c => c.id === parseInt(form.client_id));
    const description = `Email de type "${TYPE_LABELS[form.type]}" pour le client ${client?.user?.prenom} ${client?.user?.nom}`;
    try {
      const res = await emailAPI.genererIA({ description, client_id: form.client_id, type: form.type });
      setForm(prev => ({ ...prev, sujet: res.data.sujet, contenu: res.data.contenu }));
      showToast('🤖 Email généré par IA !');
    } catch {
      showToast('❌ Erreur génération IA.');
    } finally { setGenerating(false); }
  };

  const handleSubmit = async (statut) => {
    if (!form.client_id || !form.sujet || !form.contenu) { showToast('⚠️ Remplissez tous les champs.'); return; }
    setSaving(true);
    try {
      const res = await emailAPI.create({ ...form, client_id: parseInt(form.client_id) });
      let newEmail = res.data;
      if (statut === 'envoye') {
        const res2 = await emailAPI.envoyer(newEmail.id);
        newEmail = res2.data.email || { ...newEmail, statut: 'envoye' };
        showToast('✅ Email envoyé avec succès !');
      } else {
        showToast('💾 Email sauvegardé en brouillon.');
      }
      setEmails(prev => [newEmail, ...prev]);
      setShowModal(false);
      setForm(emptyForm);
    } catch (e) {
      showToast('❌ ' + (e.response?.data?.message || 'Erreur envoi.'));
    } finally { setSaving(false); }
  };

  const sendEmail = async (id) => {
    setSending(id);
    try {
      const res = await emailAPI.envoyer(id);
      setEmails(prev => prev.map(e => e.id === id ? { ...e, statut: 'envoye' } : e));
      showToast('✅ ' + (res.data.message || 'Email envoyé !'));
    } catch (e) {
      showToast('❌ ' + (e.response?.data?.message || 'Erreur SMTP.'));
    } finally { setSending(null); }
  };

  const deleteEmail = async (id) => {
    try {
      await emailAPI.delete(id);
      setEmails(prev => prev.filter(e => e.id !== id));
      showToast('🗑️ Email supprimé.');
    } catch { showToast('❌ Impossible de supprimer.'); }
  };

  const getClientName = (id) => { const c = clients.find(c => c.id === id); return c ? `${c.user?.prenom} ${c.user?.nom}` : '—'; };

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh'}}>
      <div className="spinner spinner-orange" style={{width:32,height:32,borderWidth:3}}></div>
    </div>
  );

  return (
    <div>
      {toast && <div className={`alert ${toast.startsWith('✅')||toast.startsWith('💾')||toast.startsWith('🤖') ? 'alert-success' : toast.startsWith('⚠️') ? 'alert-warning' : 'alert-error'}`} style={{position:'fixed',top:20,right:20,zIndex:9999,maxWidth:380,boxShadow:'var(--shadow-lg)'}}>{toast}</div>}

      <div className="page-top">
        <div className="page-header" style={{marginBottom:0}}>
          <h1>Emails</h1>
          <p>{filtered.length} emails</p>
        </div>
        <div className="page-actions">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input placeholder="Sujet, client..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setShowModal(true); }}>+ Nouvel email</button>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Client</th><th>Sujet</th><th>Type</th><th>Statut</th><th>Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="6"><div className="empty-state"><div className="icon">✉️</div><h3>Aucun email trouvé</h3></div></td></tr>
            ) : filtered.map(email => (
              <tr key={email.id}>
                <td style={{fontWeight:600,color:'var(--gray-800)'}}>{getClientName(email.client_id)}</td>
                <td style={{maxWidth:220,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'var(--gray-700)'}}>{email.sujet}</td>
                <td><span className="badge badge-blue">{TYPE_LABELS[email.type] || email.type}</span></td>
                <td>
                  {email.statut === 'envoye'
                    ? <span className="badge badge-green">✓ Envoyé</span>
                    : <span className="badge badge-gray">📝 Brouillon</span>}
                </td>
                <td style={{color:'var(--gray-400)',fontSize:'13px'}}>{email.created_at?.split('T')[0]}</td>
                <td>
                  <div style={{display:'flex',gap:5}}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setShowDetail(email)}>👁️</button>
                    {email.statut === 'brouillon' && (
                      <button className="btn btn-success btn-sm" onClick={() => sendEmail(email.id)} disabled={sending === email.id}>
                        {sending === email.id ? <span className="spinner spinner-orange" /> : '📤'}
                      </button>
                    )}
                    <button className="btn btn-danger btn-sm" onClick={() => deleteEmail(email.id)}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{maxWidth:620}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nouvel email</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div className="form-group">
                  <label>Client</label>
                  <select className="form-control" value={form.client_id} onChange={e => setForm({...form, client_id:e.target.value})}>
                    <option value="">Sélectionner un client</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.user?.prenom} {c.user?.nom}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select className="form-control" value={form.type} onChange={e => setForm({...form, type:e.target.value})}>
                    {Object.entries(TYPE_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div style={{textAlign:'right',marginBottom:12}}>
                <button className="btn btn-secondary btn-sm" onClick={generateAI} disabled={generating}>
                  {generating ? <><span className="spinner spinner-orange" /> Génération IA...</> : '🤖 Générer avec IA'}
                </button>
              </div>
              <div className="form-group">
                <label>Sujet</label>
                <input className="form-control" value={form.sujet} onChange={e => setForm({...form, sujet:e.target.value})} placeholder="Sujet de l'email" />
              </div>
              <div className="form-group">
                <label>Contenu</label>
                <textarea className="form-control" rows="7" value={form.contenu} onChange={e => setForm({...form, contenu:e.target.value})} placeholder="Corps de l'email..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
              <button className="btn btn-secondary" onClick={() => handleSubmit('brouillon')} disabled={saving}>💾 Brouillon</button>
              <button className="btn btn-primary"   onClick={() => handleSubmit('envoye')}   disabled={saving}>
                {saving ? <><span className="spinner" /> Envoi...</> : '📤 Envoyer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <div className="modal-overlay" onClick={() => setShowDetail(null)}>
          <div className="modal" style={{maxWidth:600}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{fontSize:'15px',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{showDetail.sujet}</h2>
              <button className="modal-close" onClick={() => setShowDetail(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{background:'var(--gray-50)',borderRadius:'var(--radius-sm)',padding:14,marginBottom:16,border:'1px solid var(--gray-200)'}}>
                {[['De','Banque Populaire Casablanca'],['À', clients.find(c=>c.id===showDetail.client_id)?.user?.email || '—'],['Type',TYPE_LABELS[showDetail.type]],['Statut',showDetail.statut==='envoye'?'✓ Envoyé':'📝 Brouillon'],['Date',showDetail.created_at?.split('T')[0]]].map(([k,v]) => (
                  <div key={k} style={{display:'flex',gap:12,marginBottom:5,fontSize:'13px'}}>
                    <span style={{color:'var(--gray-400)',fontWeight:700,width:55,flexShrink:0}}>{k}</span>
                    <span style={{color:'var(--gray-700)'}}>{v}</span>
                  </div>
                ))}
              </div>
              <pre style={{whiteSpace:'pre-wrap',fontFamily:'var(--font)',fontSize:'14px',color:'var(--gray-700)',lineHeight:1.7}}>{showDetail.contenu}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
