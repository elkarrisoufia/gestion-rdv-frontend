import { useState, useRef, useEffect } from 'react';
import { CLIENTS } from '../data/mockData';
import './Chatbot.css';

// Mock AI responses based on keywords
const AI_RESPONSES = {
  rdv: "Je vais générer un email de confirmation de rendez-vous professionnel pour votre client. Voici le brouillon :\n\n**Sujet :** Confirmation de votre rendez-vous à la Banque Populaire\n\nCher(e) client(e),\n\nNous avons le plaisir de confirmer votre rendez-vous à l'Agence Banque Populaire Casablanca Centre.\n\nVeuillez vous présenter muni(e) de votre CIN et de tout document utile à votre dossier.\n\nNous restons à votre disposition.\n\nCordialement,\nL'équipe Banque Populaire",
  credit: "Bien sûr ! Voici un email pour le dossier crédit :\n\n**Sujet :** Votre demande de crédit — Documents requis\n\nCher(e) client(e),\n\nConcernant votre demande de crédit, nous avons besoin des documents suivants :\n• Copie de votre CIN\n• 3 derniers bulletins de salaire\n• Relevé bancaire des 3 derniers mois\n• Justificatif de domicile\n\nMerci de les apporter lors de votre prochain rendez-vous.\n\nCordialement,\nVotre Conseiller Banque Populaire",
  carte: "Voici un email concernant la carte bancaire :\n\n**Sujet :** Votre nouvelle carte bancaire est disponible\n\nCher(e) client(e),\n\nNous avons le plaisir de vous informer que votre nouvelle carte bancaire est prête à être retirée à notre agence.\n\nMerci de vous présenter avec votre CIN pendant les heures d'ouverture (Lun-Ven 8h30-17h30).\n\nCordialement,\nL'équipe Banque Populaire",
  vip: "Pour un client VIP, je propose un email personnalisé :\n\n**Sujet :** Offre Privilège — Réservée à notre clientèle Premium\n\nCher(e) client Privilège,\n\nEn tant que client VIP de la Banque Populaire, nous avons le plaisir de vous présenter nos offres exclusives :\n• Taux préférentiel sur vos crédits\n• Carte Gold sans frais de gestion\n• Accueil prioritaire en agence\n\nVotre conseiller dédié vous contactera prochainement.\n\nCordialement,\nDirection Clientèle Privée — Banque Populaire",
  bonjour: "Bonjour ! Je suis votre assistant IA de la Banque Populaire. Je peux vous aider à :\n\n• 📧 Générer des emails professionnels\n• 📅 Rédiger des confirmations de RDV\n• 💳 Créer des emails pour les demandes de carte\n• 🏠 Préparer des emails pour les crédits\n\nDécrivez la situation et je générerai l'email adapté.",
  default: "Je comprends votre demande. Voici un email professionnel adapté :\n\n**Sujet :** Information importante — Banque Populaire Casablanca\n\nCher(e) client(e),\n\nSuite à votre demande, nous vous contactons pour vous informer que votre dossier est en cours de traitement.\n\nUn conseiller vous contactera sous 48 heures ouvrables pour la suite de votre demande.\n\nCordialement,\nL'équipe Banque Populaire Agence Casablanca Centre\nTél : 05 22 XX XX XX"
};

const getAIResponse = (message) => {
  const msg = message.toLowerCase();
  if (msg.includes('bonjour') || msg.includes('salut') || msg.includes('aide') || msg.includes('help')) return AI_RESPONSES.bonjour;
  if (msg.includes('rdv') || msg.includes('rendez-vous') || msg.includes('confirmation')) return AI_RESPONSES.rdv;
  if (msg.includes('crédit') || msg.includes('credit') || msg.includes('prêt') || msg.includes('pret') || msg.includes('immob')) return AI_RESPONSES.credit;
  if (msg.includes('carte') || msg.includes('card') || msg.includes('visa') || msg.includes('mastercard')) return AI_RESPONSES.carte;
  if (msg.includes('vip') || msg.includes('privilège') || msg.includes('premium')) return AI_RESPONSES.vip;
  return AI_RESPONSES.default;
};

const QUICK_PROMPTS = [
  '📅 Email confirmation RDV',
  '💳 Carte bancaire disponible',
  '🏠 Dossier crédit immobilier',
  '⭐ Offre client VIP',
  '📄 Documents manquants',
];

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1, role: 'assistant',
      content: 'Bonjour ! Je suis votre assistant IA Banque Populaire.\n\nJe suis ici pour vous aider à rédiger des emails professionnels pour vos clients. Décrivez la situation et je génère l\'email parfait.',
      time: new Date().toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');

    const userMsg = { id: Date.now(), role: 'user', content: msg, time: new Date().toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));

    const aiContent = getAIResponse(msg);
    const aiMsg = { id: Date.now() + 1, role: 'assistant', content: aiContent, time: new Date().toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
  };

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const clearChat = () => {
    setMessages([{ id: 1, role: 'assistant', content: 'Conversation réinitialisée. Comment puis-je vous aider ?', time: new Date().toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' }) }]);
  };

  // Simple markdown-like formatting
  const formatMessage = (text) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <strong key={i} style={{display:'block',color:'var(--gray-900)'}}>{line.slice(2,-2)}</strong>;
      }
      if (line.startsWith('•')) {
        return <div key={i} style={{paddingLeft:'8px',color:'var(--gray-700)'}}>{line}</div>;
      }
      return <div key={i}>{line || <br />}</div>;
    });
  };

  return (
    <div>
      <div className="page-top">
        <div className="page-header" style={{marginBottom:0}}>
          <h1>Chatbot IA</h1>
          <p>Génération d'emails professionnels par intelligence artificielle</p>
        </div>
        <div className="page-actions">
          <select className="form-control" style={{width:'220px'}} value={selectedClient} onChange={e => setSelectedClient(e.target.value)}>
            <option value="">Sélectionner un client (optionnel)</option>
            {CLIENTS.map(c => <option key={c.id} value={c.id}>{c.user.prenom} {c.user.nom}{c.is_vip ? ' ⭐' : ''}</option>)}
          </select>
          <button className="btn btn-secondary" onClick={clearChat}>🗑️ Effacer</button>
        </div>
      </div>

      <div className="chatbot-layout">
        {/* Quick prompts sidebar */}
        <div className="chatbot-sidebar">
          <h4>Suggestions rapides</h4>
          <div className="quick-prompts">
            {QUICK_PROMPTS.map(p => (
              <button key={p} className="quick-prompt-btn" onClick={() => sendMessage(p)}>{p}</button>
            ))}
          </div>
          <div className="chatbot-info">
            <div className="info-badge">🤖</div>
            <p>L'IA génère des emails professionnels adaptés au contexte bancaire marocain.</p>
          </div>
        </div>

        {/* Chat area */}
        <div className="chatbot-main">
          <div className="messages-area">
            {messages.map(msg => (
              <div key={msg.id} className={`message message-${msg.role}`}>
                {msg.role === 'assistant' && (
                  <div className="msg-avatar ai-avatar">🤖</div>
                )}
                <div className="msg-bubble">
                  <div className="msg-content">{formatMessage(msg.content)}</div>
                  <div className="msg-time">{msg.time}</div>
                </div>
                {msg.role === 'user' && (
                  <div className="msg-avatar user-avatar">
                    {/* initials placeholder */}
                    <span>U</span>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="message message-assistant">
                <div className="msg-avatar ai-avatar">🤖</div>
                <div className="msg-bubble typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <textarea
              className="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Décrivez la situation (ex: 'Email de confirmation RDV pour M. Boukhari')..."
              rows="2"
              disabled={loading}
            />
            <button className="send-btn" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
              {loading ? <span className="spinner" /> : '➤'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
