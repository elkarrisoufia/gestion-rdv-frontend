import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  withCredentials: false,
});

// Attacher le token automatiquement
api.interceptors.request.use(config => {
  const token = localStorage.getItem('bp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Si 401 → déconnexion
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace('/login');
    }
    return Promise.reject(err);
  }
);

// ===== AUTH =====
export const authAPI = {
  login:          (data) => api.post('/auth/login', data),
  logout:         ()     => api.post('/auth/logout'),
  me:             ()     => api.get('/auth/me'),
  registerClient: (data) => api.post('/auth/register-client', data),
};

// ===== RENDEZ-VOUS =====
export const rdvAPI = {
  getAll:    ()      => api.get('/rdv'),
  getToday:  ()      => api.get('/rdv/today'),
  create:    (data)  => api.post('/rdv', data),
  update:    (id, d) => api.put(`/rdv/${id}`, d),
  confirmer: (id)    => api.put(`/rdv/${id}/confirmer`),
  annuler:   (id)    => api.put(`/rdv/${id}/annuler`),
  delete:    (id)    => api.delete(`/rdv/${id}`),
  creneaux:  (date, employe_id) => api.get('/rdv/creneaux', { params: { date, employe_id } }),
  // Client
  mesRdv:    ()      => api.get('/client/rdv'),
  clientRdv: (data)  => api.post('/client/rdv', data),
  clientAnnuler: (id) => api.put(`/client/rdv/${id}/annuler`),
};

// ===== CLIENTS =====
export const clientAPI = {
  getAll:  ()        => api.get('/clients'),
  getOne:  (id)      => api.get(`/clients/${id}`),
  create:  (data)    => api.post('/clients', data),
  update:  (id, d)   => api.put(`/clients/${id}`, d),
  delete:  (id)      => api.delete(`/clients/${id}`),
};

// ===== EMAILS =====
export const emailAPI = {
  getAll:   ()       => api.get('/emails'),
  create:   (data)   => api.post('/emails', data),
  envoyer:  (id)     => api.post(`/emails/${id}/envoyer`),
  delete:   (id)     => api.delete(`/emails/${id}`),
  genererIA:(data)   => api.post('/chatbot/generer', data),
};

// ===== EMPLOYES =====
export const employeAPI = {
  getAll:  ()        => api.get('/employes'),
  create:  (data)    => api.post('/employes', data),
  update:  (id, d)   => api.put(`/employes/${id}`, d),
  delete:  (id)      => api.delete(`/employes/${id}`),
};

// ===== STATISTIQUES =====
export const statsAPI = {
  index:    () => api.get('/statistiques'),
  rdv:      () => api.get('/statistiques/rdv'),
  employes: () => api.get('/statistiques/employes'),
};

export default api;
