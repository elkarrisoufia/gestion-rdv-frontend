// ===== MOCK DATA STORE — Banque Populaire =====
// Toutes les données fictives mais réalistes pour la démo

export const USERS = [
  { id: 1, nom: 'Benali', prenom: 'Laila', email: 'laila@bp.ma', role: 'manager', telephone: '+212661000001', is_active: true },
  { id: 2, nom: 'Alaoui', prenom: 'Sara', email: 'sara@bp.ma', role: 'employe', telephone: '+212661000002', is_active: true },
  { id: 3, nom: 'Oulhaj', prenom: 'Ahmed', email: 'ahmed@bp.ma', role: 'employe', telephone: '+212661000003', is_active: true },
  { id: 4, nom: 'Boukhari', prenom: 'Mohamed', email: 'mb@gmail.com', role: 'client', telephone: '+212662000001', is_active: true },
];

export const EMPLOYES = [
  { id: 1, user_id: 1, matricule: 'EMP0001', poste: 'Manager Agence', agence: 'Casablanca Centre', user: USERS[0] },
  { id: 2, user_id: 2, matricule: 'EMP0002', poste: 'Conseiller Clientèle', agence: 'Casablanca Centre', user: USERS[1] },
  { id: 3, user_id: 3, matricule: 'EMP0003', poste: 'Conseiller Clientèle', agence: 'Casablanca Centre', user: USERS[2] },
];

export const CLIENTS = [
  { id: 1, user_id: 4, cin: 'AB123456', adresse: '12 Bd Anfa, Casablanca', type_compte: 'courant', is_vip: true, employe_id: 2, user: { nom: 'Boukhari', prenom: 'Mohamed', email: 'mb@gmail.com', telephone: '+212662000001' } },
  { id: 2, user_id: 5, cin: 'CD789012', adresse: '45 Rue Hassan II, Casablanca', type_compte: 'epargne', is_vip: false, employe_id: 2, user: { nom: 'Tazi', prenom: 'Fatima', email: 'ftazi@gmail.com', telephone: '+212662000002' } },
  { id: 3, user_id: 6, cin: 'EF345678', adresse: '8 Av Mohammed V, Casablanca', type_compte: 'courant', is_vip: true, employe_id: 3, user: { nom: 'Mansouri', prenom: 'Karim', email: 'kmansouri@gmail.com', telephone: '+212662000003' } },
  { id: 4, user_id: 7, cin: 'GH901234', adresse: '23 Rue Zerktouni, Casablanca', type_compte: 'epargne', is_vip: false, employe_id: 3, user: { nom: 'Chraibi', prenom: 'Nadia', email: 'nadia@gmail.com', telephone: '+212662000004' } },
  { id: 5, user_id: 8, cin: 'IJ567890', adresse: '67 Bd Ziraoui, Casablanca', type_compte: 'professionnel', is_vip: true, employe_id: 2, user: { nom: 'El Idrissi', prenom: 'Youssef', email: 'youssef@gmail.com', telephone: '+212662000005' } },
  { id: 6, user_id: 9, cin: 'KL123789', adresse: '15 Rue Ibn Rochd, Casablanca', type_compte: 'courant', is_vip: false, employe_id: 3, user: { nom: 'Berrada', prenom: 'Amina', email: 'amina@gmail.com', telephone: '+212662000006' } },
];

export const RENDEZ_VOUS = [
  { id: 1, client_id: 1, employe_id: 2, date_rdv: '2026-05-12', heure_rdv: '09:00', motif: 'Ouverture de compte', statut: 'confirme', client: CLIENTS[0], employe: EMPLOYES[1] },
  { id: 2, client_id: 2, employe_id: 2, date_rdv: '2026-05-12', heure_rdv: '10:30', motif: 'Crédit immobilier', statut: 'en_attente', client: CLIENTS[1], employe: EMPLOYES[1] },
  { id: 3, client_id: 3, employe_id: 3, date_rdv: '2026-05-12', heure_rdv: '11:00', motif: 'Carte bancaire', statut: 'confirme', client: CLIENTS[2], employe: EMPLOYES[2] },
  { id: 4, client_id: 4, employe_id: 3, date_rdv: '2026-05-12', heure_rdv: '14:00', motif: 'Virement international', statut: 'en_attente', client: CLIENTS[3], employe: EMPLOYES[2] },
  { id: 5, client_id: 5, employe_id: 2, date_rdv: '2026-05-13', heure_rdv: '09:30', motif: 'Assurance habitation', statut: 'confirme', client: CLIENTS[4], employe: EMPLOYES[1] },
  { id: 6, client_id: 6, employe_id: 3, date_rdv: '2026-05-13', heure_rdv: '11:00', motif: 'Crédit consommation', statut: 'annule', client: CLIENTS[5], employe: EMPLOYES[2] },
  { id: 7, client_id: 1, employe_id: 2, date_rdv: '2026-05-14', heure_rdv: '10:00', motif: 'Bilan de compte', statut: 'en_attente', client: CLIENTS[0], employe: EMPLOYES[1] },
  { id: 8, client_id: 3, employe_id: 3, date_rdv: '2026-05-14', heure_rdv: '15:00', motif: 'Prêt voiture', statut: 'confirme', client: CLIENTS[2], employe: EMPLOYES[2] },
];

export const EMAILS = [
  { id: 1, employe_id: 2, client_id: 1, sujet: 'Confirmation de votre rendez-vous', contenu: 'Cher M. Boukhari,\n\nNous confirmons votre rendez-vous du 12 mai 2026 à 09h00 à l\'agence Casablanca Centre.\n\nCordialement,\nSara Alaoui\nConseillère Clientèle', type: 'confirmation_rdv', statut: 'envoye', created_at: '2026-05-10' },
  { id: 2, employe_id: 2, client_id: 2, sujet: 'Information sur votre dossier crédit immobilier', contenu: 'Chère Mme Tazi,\n\nConcernant votre demande de crédit immobilier, nous avons besoin de documents supplémentaires...\n\nCordialement,\nSara Alaoui', type: 'information', statut: 'brouillon', created_at: '2026-05-10' },
  { id: 3, employe_id: 3, client_id: 3, sujet: 'Votre nouvelle carte bancaire est disponible', contenu: 'Cher M. Mansouri,\n\nVotre carte bancaire Gold est prête à être retirée à l\'agence...\n\nCordialement,\nAhmed Oulhaj', type: 'notification', statut: 'envoye', created_at: '2026-05-09' },
  { id: 4, employe_id: 2, client_id: 5, sujet: 'Offre spéciale client VIP — Assurance Premium', contenu: 'Cher M. El Idrissi,\n\nEn tant que client VIP, nous vous proposons notre offre d\'assurance habitation Premium avec des tarifs exclusifs...\n\nCordialement,\nSara Alaoui', type: 'commercial', statut: 'envoye', created_at: '2026-05-08' },
];

export const STATISTIQUES = {
  total_rdv_mois: 48,
  emails_generes: 127,
  nouveaux_clients: 14,
  taux_confirmation: 78,
  rdv_par_jour: [
    { jour: '1', rdv: 4 }, { jour: '2', rdv: 6 }, { jour: '3', rdv: 3 },
    { jour: '5', rdv: 8 }, { jour: '6', rdv: 5 }, { jour: '7', rdv: 7 },
    { jour: '8', rdv: 6 }, { jour: '9', rdv: 9 }, { jour: '12', rdv: 7 },
    { jour: '13', rdv: 5 }, { jour: '14', rdv: 6 }, { jour: '15', rdv: 8 },
  ],
  motifs_rdv: [
    { motif: 'Crédit', count: 32, color: '#E8620A' },
    { motif: 'Ouverture compte', count: 24, color: '#F47C2F' },
    { motif: 'Carte bancaire', count: 18, color: '#3B82F6' },
    { motif: 'Assurance', count: 12, color: '#10B981' },
    { motif: 'Virement', count: 8, color: '#F59E0B' },
    { motif: 'Autre', count: 6, color: '#6B7280' },
  ],
  top_employes: [
    { nom: 'Sara Alaoui', rdv: 28, emails: 45 },
    { nom: 'Ahmed Oulhaj', rdv: 22, emails: 38 },
    { nom: 'Laila Benali', rdv: 8, emails: 12 },
  ],
  emails_par_type: [
    { type: 'Confirmation RDV', count: 48 },
    { type: 'Information', count: 31 },
    { type: 'Commercial', count: 27 },
    { type: 'Notification', count: 21 },
  ],
};

export const HORAIRES = [
  { jour: 'Lundi', ouverture: '08:30', fermeture: '15:45' },
  { jour: 'Mardi', ouverture: '08:30', fermeture: '15:45' },
  { jour: 'Mercredi', ouverture: '08:30', fermeture: '15:45' },
  { jour: 'Jeudi', ouverture: '08:30', fermeture: '15:45' },
  { jour: 'Vendredi', ouverture: '08:30', fermeture: '15:45' },
  { jour: 'Samedi', ouverture: null, fermeture: null},
  { jour: 'Dimanche', ouverture: null, fermeture: null },
];

export const SERVICES = [
  { id: 1, icon: '🏦', titre: 'Comptes bancaires', description: 'Comptes courants, épargne, et professionnels adaptés à vos besoins.' },
  { id: 2, icon: '💳', titre: 'Cartes bancaires', description: 'Carte Visa, Mastercard et Gold avec des avantages exclusifs.' },
  { id: 3, icon: '🏠', titre: 'Crédit immobilier', description: 'Financez votre projet immobilier avec des taux compétitifs.' },
  { id: 4, icon: '🚗', titre: 'Crédit auto', description: 'Réalisez votre projet automobile avec nos offres de financement.' },
  { id: 5, icon: '📊', titre: 'Épargne & Investissement', description: 'Faites fructifier votre argent avec nos produits d\'épargne.' },
  { id: 6, icon: '🛡️', titre: 'Assurances', description: 'Protection complète pour vous, votre famille et vos biens.' },
];

// Helper: today's date as string
export const TODAY = new Date().toISOString().split('T')[0];

// Helper: get today's RDV
export const getRdvToday = (allRdv) =>
  allRdv.filter(r => r.date_rdv === TODAY || r.date_rdv === '2026-05-12'); // demo uses fixed date
