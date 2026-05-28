# 🏦 Banque Populaire — Frontend React.js

> Frontend complet pour le projet de stage — Banque Populaire Maroc, Agence Casablanca Centre

## 🚀 Lancer le projet

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
# → http://localhost:5173
```

## 🔑 Comptes de démonstration

| Rôle | Email | Mot de passe | Accès |
|------|-------|-------------|-------|
| Manager | laila@bp.ma | password123 | Complet (Stats, Employés) |
| Employé | sara@bp.ma | password123 | RDV, Clients, Emails, Chatbot |
| Employé | ahmed@bp.ma | password123 | RDV, Clients, Emails, Chatbot |
| Client | mb@gmail.com | password123 | Espace client, RDV en ligne |

## 📋 Pages disponibles

### Pages publiques
- `/` — Page d'accueil (landing page)
- `/nos-services` — Présentation des services bancaires
- `/horaires` — Horaires d'ouverture de l'agence
- `/contact` — Formulaire de contact
- `/login` — Connexion (avec comptes démo)

### Espace employé / manager
- `/dashboard` — Tableau de bord (RDV du jour + KPIs)
- `/rendez-vous` — Gestion complète des RDV (CRUD)
- `/clients` — Gestion des clients (CRUD + fiche détaillée)
- `/emails` — Emails avec génération IA simulée
- `/chatbot` — Chatbot IA pour générer des emails
- `/statistiques` — Graphiques (manager uniquement)
- `/employes` — Gestion des employés (manager uniquement)

### Espace client
- `/espace-client` — Profil + résumé du compte
- `/mes-rdv` — Prendre / annuler des rendez-vous

## ⚙️ Architecture

```
src/
├── context/AuthContext.jsx     ← Authentification (mock)
├── data/mockData.js            ← Données de démo interactives
├── components/
│   ├── Sidebar.jsx             ← Navigation dynamique par rôle
│   └── Sidebar.css
├── pages/
│   ├── Home.jsx + .css         ← Landing page
│   ├── Login.jsx + .css        ← Connexion
│   ├── Dashboard.jsx + .css    ← Tableau de bord
│   ├── Appointments.jsx        ← Rendez-vous CRUD
│   ├── Clients.jsx             ← Clients CRUD
│   ├── Emails.jsx              ← Emails + IA simulée
│   ├── Chatbot.jsx + .css      ← Interface chatbot
│   ├── Stats.jsx + .css        ← Statistiques (recharts)
│   ├── Employes.jsx            ← Employés CRUD
│   ├── ClientSpace.jsx         ← Espace client
│   └── PublicPages.jsx + .css  ← Services / Horaires / Contact
└── styles/global.css           ← Thème orange BP
```

## 🎨 Design

- **Couleur principale** : Orange #E8620A (identité Banque Populaire)
- **Typographie** : Playfair Display (titres) + DM Sans (corps)
- **Mode** : 100% responsive, animations fluides

## 📝 Notes importantes

- Le projet fonctionne **sans backend** — toutes les données sont en mémoire (React state)
- Le chatbot simule des réponses IA sans appel API réel
- Pour brancher le vrai backend Laravel, modifier `src/context/AuthContext.jsx` et remplacer les données mock par des appels Axios vers `http://localhost:8000/api`

## 🔧 Technologies

- React 18 + Vite
- React Router v6
- Recharts (graphiques)
- CSS Variables (thème cohérent)
