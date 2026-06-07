import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [init, setInit]       = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('bp_token');
    const saved = localStorage.getItem('bp_user');
    if (token && saved) {
      authAPI.me().then(res => {
        setUser(res.data);
        localStorage.setItem('bp_user', JSON.stringify(res.data));
      }).catch(() => {
        localStorage.removeItem('bp_token');
        localStorage.removeItem('bp_user');
        setUser(null);
      }).finally(() => setInit(false));
    } else {
      setInit(false);
    }
}, []);

  const login = async (email, password) => {
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.login({ email, password });
      const { token, user: userData } = res.data;
      localStorage.setItem('bp_token', token);
      localStorage.setItem('bp_user', JSON.stringify(userData));
      setUser(userData);
      setLoading(false);
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur de connexion. Vérifiez vos identifiants.';
      setError(msg);
      setLoading(false);
      return false;
    }
  };

const logout = async () => {
    try { await authAPI.logout(); } catch {}
    localStorage.removeItem('bp_token');
    localStorage.removeItem('bp_user');
    setUser(null);
    window.location.replace('/login');
};

  const isManager = user?.role === 'manager';
  const isEmploye = user?.role === 'employe' || user?.role === 'manager';
  const isClient  = user?.role === 'client';

  if (init) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'#F5F6FA'}}>
      <div style={{textAlign:'center'}}>
        <div style={{width:42,height:42,background:'#F97316',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:15,margin:'0 auto 12px'}}>BP</div>
        <div style={{fontSize:13,color:'#9CA3AF'}}>Chargement...</div>
      </div>
    </div>
  );

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error, setError, isManager, isEmploye, isClient }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
