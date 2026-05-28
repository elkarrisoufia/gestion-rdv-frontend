import { useState, useEffect } from 'react';
import api from '../services/api';

const TYPE_LABELS = {
  confirmation_rdv: 'Confirmation RDV',
  information: 'Information',
  commercial: 'Commercial',
  notification: 'Notification'
};

export default function EmailLogs() {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail,  setDetail]  = useState(null);
  const [total,   setTotal]   = useState(0);

  useEffect(() => {
    api.get('/emails/logs')
      .then(r => { setLogs(r.data.emails || []); setTotal(r.data.total || 0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh'}}>
      <div className="spinner spinner-orange" style={{width:32,height:32,borderWidth:3}}></div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1>📬 Emails Envoyés</h1>
        <p>{total} email(s) envoyé(s) avec succès</p>
      </div>

      {logs.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="icon">📭</div>
            <h3>Aucun email envoyé pour l'instant</h3>
            <p>Les emails envoyés apparaîtront ici.</p>
          </div>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {logs.map((log, i) => (
            <div key={i} className="card" style={{cursor:'pointer',transition:'all .15s'}}
              onClick={() => setDetail(detail?.id === log.id && detail?.sujet === log.sujet ? null : log)}>
              <div style={{display:'flex',alignItems:'center',gap:16}}>
                <div style={{width:44,height:44,borderRadius:'50%',background:'var(--orange-mid)',border:'2px solid var(--orange-border)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>
                  ✉️
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:'15px',color:'var(--gray-900)',marginBottom:3}}>{log.sujet}</div>
                  <div style={{fontSize:'13px',color:'var(--gray-500)'}}>
                    <span>À : <strong>{log.a}</strong></span>
                    <span style={{margin:'0 8px'}}>·</span>
                    <span>{log.date}</span>
                  </div>
                </div>
                <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:6}}>
                  <span className="badge badge-green">✓ Envoyé</span>
                  {log.type && <span className="badge badge-blue">{TYPE_LABELS[log.type] || log.type}</span>}
                </div>
              </div>

              {/* Contenu email dépliable */}
              {detail?.sujet === log.sujet && detail?.a === log.a && (
                <div style={{
                  marginTop:16,padding:16,
                  background:'var(--gray-50)',
                  borderRadius:'var(--radius-sm)',
                  border:'1px solid var(--gray-200)'
                }}>
                  <div style={{marginBottom:12,display:'flex',flexDirection:'column',gap:6}}>
                    {[
                      ['📤 De','Banque Populaire Casablanca <noreply@bp.ma>'],
                      ['📥 À', log.a],
                      ['📌 Sujet', log.sujet],
                      ['📅 Date', log.date],
                    ].map(([k,v]) => (
                      <div key={k} style={{display:'flex',gap:8,fontSize:'13px'}}>
                        <span style={{color:'var(--gray-400)',fontWeight:600,width:80,flexShrink:0}}>{k}</span>
                        <span style={{color:'var(--gray-700)'}}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{height:1,background:'var(--gray-200)',margin:'12px 0'}}></div>
                  <pre style={{
                    whiteSpace:'pre-wrap',
                    fontFamily:'var(--font)',
                    fontSize:'14px',
                    color:'var(--gray-700)',
                    lineHeight:1.7
                  }}>{log.contenu}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="alert alert-info" style={{marginTop:20}}>
        ℹ️ Ces emails ont été enregistrés dans le système. En production avec un serveur de messagerie configuré, ils partent directement dans la boîte email du client.
      </div>
    </div>
  );
}
