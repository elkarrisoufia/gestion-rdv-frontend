import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { statsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Stats.css';

export default function Stats() {
  const { isManager } = useAuth();
  const [overview,  setOverview]  = useState(null);
  const [rdvStats,  setRdvStats]  = useState(null);
  const [empStats,  setEmpStats]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [period,    setPeriod]    = useState('Ce mois');

  const COLORS = ['#F97316','#3B82F6','#10B981','#8B5CF6','#F59E0B','#6B7280'];

  useEffect(() => {
    if (!isManager) return;
    Promise.all([statsAPI.index(), statsAPI.rdv(), statsAPI.employes()])
      .then(([o, r, e]) => { setOverview(o.data); setRdvStats(r.data); setEmpStats(e.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (!isManager) return (
    <div className="empty-state" style={{paddingTop:100}}>
      <div className="icon">🔒</div>
      <h3>Accès réservé au Manager</h3>
      <p>Seul le manager peut accéder aux statistiques.</p>
    </div>
  );

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh'}}>
      <div className="spinner spinner-orange" style={{width:32,height:32,borderWidth:3}}></div>
    </div>
  );

  const exportCSV = () => {
    const rows = rdvStats?.rdv_par_jour?.map(d => `${d.jour},${d.rdv}`).join('\n') || '';
    const blob = new Blob([`Jour,RDV\n${rows}`], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'stats_bp.csv'; a.click();
  };

  const motifsWithColor = (rdvStats?.motifs_rdv || []).map((m, i) => ({ ...m, color: COLORS[i % COLORS.length] }));

  return (
    <div>
      <div className="page-top">
        <div className="page-header" style={{marginBottom:0}}>
          <h1>Statistiques</h1>
          <p>Tableau de bord analytique — Agence Casablanca Centre</p>
        </div>
        <div className="page-actions">
          {['Ce mois','Trimestre','Année'].map(p => (
            <button key={p} className={`btn ${period===p ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setPeriod(p)}>{p}</button>
          ))}
          <button className="btn btn-secondary" onClick={exportCSV}>📥 Export CSV</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="stats-kpi-grid">
        {[
          { label:'RDV ce mois',       value: overview?.total_rdv_mois    ?? 0, icon:'📅', color:'orange', sub:'Rendez-vous total' },
          { label:'Emails envoyés',    value: overview?.emails_envoyes    ?? 0, icon:'📧', color:'blue',   sub:'Via SMTP Gmail' },
          { label:'Nouveaux clients',  value: overview?.nouveaux_clients  ?? 0, icon:'👥', color:'green',  sub:'Ce mois-ci' },
          { label:'Taux confirmation', value: `${overview?.taux_confirmation ?? 0}%`, icon:'✅', color:'yellow', sub:'Des rendez-vous' },
        ].map(kpi => (
          <div key={kpi.label} className={`stats-kpi-card kpi-${kpi.color}`}>
            <div className="kpi-top">
              <span className="kpi-icon-big">{kpi.icon}</span>
              <div className="kpi-trend">↑</div>
            </div>
            <div className="kpi-big-value">{kpi.value}</div>
            <div className="kpi-big-label">{kpi.label}</div>
            <div className="kpi-big-sub">{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div className="stats-grid">
        {/* Barres RDV par jour */}
        <div className="card stats-chart-card">
          <h3>Rendez-vous par jour</h3>
          <p className="chart-sub">Évolution quotidienne ce mois</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={rdvStats?.rdv_par_jour || []} margin={{top:10,right:10,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="jour" tick={{fontSize:12,fill:'#9CA3AF'}} />
              <YAxis tick={{fontSize:12,fill:'#9CA3AF'}} />
              <Tooltip contentStyle={{background:'white',border:'1px solid #E5E7EB',borderRadius:8,boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}} formatter={v => [`${v} RDV`,'Rendez-vous']} />
              <Bar dataKey="rdv" fill="#F97316" radius={[5,5,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut motifs */}
        <div className="card stats-chart-card">
          <h3>Motifs des rendez-vous</h3>
          <p className="chart-sub">Répartition par type de demande</p>
          {motifsWithColor.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={motifsWithColor} dataKey="count" nameKey="motif" cx="45%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {motifsWithColor.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v,n) => [`${v} RDV`, n]} contentStyle={{borderRadius:8,border:'1px solid #E5E7EB'}} />
                <Legend layout="vertical" align="right" verticalAlign="middle" formatter={v => <span style={{fontSize:'12px',color:'#4B5563'}}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{padding:'30px 0'}}><div className="icon">📊</div><h3>Pas de données</h3></div>
          )}
        </div>

        {/* Top conseillers */}
        <div className="card stats-chart-card">
          <h3>Top conseillers</h3>
          <p className="chart-sub">Rendez-vous traités par conseiller</p>
          {(empStats?.top_employes || []).length > 0 ? (
            <div className="top-employes">
              {empStats.top_employes.map((emp, i) => {
                const max = empStats.top_employes[0]?.rdv || 1;
                return (
                  <div key={emp.nom} className="employe-bar-row">
                    <div className="employe-rank">{i+1}</div>
                    <div className="employe-bar-info">
                      <div className="employe-bar-top">
                        <span className="employe-bar-name">{emp.nom}</span>
                        <span className="employe-bar-val">{emp.rdv} RDV · {emp.emails} emails</span>
                      </div>
                      <div className="employe-bar-track">
                        <div className="employe-bar-fill" style={{width:`${Math.round((emp.rdv/max)*100)}%`, background: ['#F97316','#3B82F6','#10B981'][i] || '#6B7280'}} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state" style={{padding:'30px 0'}}><div className="icon">👥</div><h3>Pas de données</h3></div>
          )}
        </div>

        {/* Emails par type */}
        <div className="card stats-chart-card">
          <h3>Emails par type</h3>
          <p className="chart-sub">Répartition des communications</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={empStats?.emails_par_type || []} layout="vertical" margin={{top:0,right:20,left:20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
              <XAxis type="number" tick={{fontSize:12,fill:'#9CA3AF'}} />
              <YAxis type="category" dataKey="type" tick={{fontSize:11,fill:'#6B7280'}} width={120} />
              <Tooltip contentStyle={{borderRadius:8,border:'1px solid #E5E7EB'}} formatter={v => [`${v}`,'Emails']} />
              <Bar dataKey="count" fill="#3B82F6" radius={[0,5,5,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
