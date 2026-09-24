import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  ArrowRight, 
  ChevronDown, 
  Maximize2, 
  Minimize2,
  HelpCircle
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export const Chatbot = ({ isOpen, onToggle }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 'msg_welcome',
      sender: 'ai',
      text: `Hello ${user?.name ? user.name.split(' ')[0] : 'there'}! I am **DocumentAssist AI**.\n\nI can assist you with certificate retrieval, AI verification workflows, document requests, and navigating your dashboard. How can I help today?`,
      actions: [
        { label: "Go to My Documents", route: user?.role === 'COLLEGE_ADMIN' ? '/college/documents' : '/student/documents' },
        { label: "How does AI verification work?", query: "How does AI verification work?" }
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const data = await api.getSuggestedQuestions();
        if (data.success && data.questions) {
          setSuggestedQuestions(data.questions);
        }
      } catch (err) {
        setSuggestedQuestions([
          "What is this application?",
          "Where can I see my certificates?",
          "What does Verified mean?",
          "How can I request a document?",
          "How does AI verification work?"
        ]);
      }
    };
    loadSuggestions();
  }, [user?.role]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (customQuery = null) => {
    const text = (customQuery || inputText).trim();
    if (!text || loading) return;

    const userMsg = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customQuery) setInputText('');
    setLoading(true);

    try {
      const data = await api.sendChatMessage(text);
      const aiMsg = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: data.reply || 'I am processing your request.',
        actions: data.actions || []
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `ai_err_${Date.now()}`,
          sender: 'ai',
          text: 'I encountered an error connecting to the neural assistant. Please try again shortly.',
          actions: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action) => {
    if (action.route) {
      navigate(action.route);
      onToggle(); // Close chat drawer or keep open
    } else if (action.query) {
      handleSendMessage(action.query);
    }
  };

  // Format simple markdown (bold text and line breaks)
  const renderFormattedText = (text) => {
    const parts = (text || '').split('\n').map((line, lineIdx) => {
      // replace **bold** with <strong>
      const boldFormatted = line.split(/(\*\*.*?\*\*)/g).map((chunk, chunkIdx) => {
        if (chunk.startsWith('**') && chunk.endsWith('**')) {
          return <strong key={chunkIdx} style={{ color: '#ffffff' }}>{chunk.slice(2, -2)}</strong>;
        }
        return chunk;
      });

      return (
        <div key={lineIdx} style={{ marginBottom: line.startsWith('-') ? 2 : 6 }}>
          {boldFormatted}
        </div>
      );
    });

    return parts;
  };

  return (
    <>
      {/* Floating Launcher Trigger */}
      {!isOpen && (
        <button
          onClick={onToggle}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 90,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 20px',
            borderRadius: 9999,
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            color: '#ffffff',
            boxShadow: '0 8px 24px rgba(139, 92, 246, 0.45)',
            fontWeight: 700,
            fontSize: '0.92rem'
          }}
          className="glow-card"
        >
          <div style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bot size={16} />
          </div>
          <span>DocumentAssist AI</span>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#34d399',
            boxShadow: '0 0 8px #34d399'
          }} />
        </button>
      )}

      {/* Chat Drawer Window */}
      {isOpen && (
        <div className="glass-panel animate-fade-in" style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: isExpanded ? 520 : 380,
          height: isExpanded ? 640 : 540,
          maxHeight: 'calc(100vh - 48px)',
          maxWidth: 'calc(100vw - 32px)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 50px rgba(0,0,0,0.85)',
          border: '1px solid rgba(139, 92, 246, 0.4)',
          overflow: 'hidden'
        }}>
          
          {/* Top Bar */}
          <div style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-glass)',
            background: 'linear-gradient(to right, rgba(139, 92, 246, 0.25), rgba(99, 102, 241, 0.15))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                <Bot size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>
                    DocumentAssist AI
                  </h4>
                  <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: 4, background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', fontWeight: 700 }}>
                    ONLINE
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Intelligent Retrieval & Navigation Agent
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{ padding: 6, color: 'var(--text-muted)' }}
                className="hover:text-white"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button
                onClick={onToggle}
                style={{ padding: 6, color: 'var(--text-muted)' }}
                className="hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            fontSize: '0.86rem'
          }}>
            {messages.map((msg) => {
              const isAi = msg.sender === 'ai';
              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isAi ? 'flex-start' : 'flex-end',
                    gap: 6
                  }}
                >
                  <div style={{
                    maxWidth: '88%',
                    padding: '12px 14px',
                    borderRadius: isAi ? '14px 14px 14px 2px' : '14px 14px 2px 14px',
                    background: isAi ? '#1e293b' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    color: isAi ? 'var(--text-secondary)' : '#ffffff',
                    border: isAi ? '1px solid #334155' : 'none',
                    lineHeight: 1.45
                  }}>
                    {renderFormattedText(msg.text)}
                  </div>

                  {/* Deep-linking action buttons */}
                  {isAi && msg.actions && msg.actions.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                      {msg.actions.map((act, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleActionClick(act)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '6px 12px',
                            borderRadius: 8,
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            background: 'rgba(139, 92, 246, 0.15)',
                            border: '1px solid rgba(139, 92, 246, 0.4)',
                            color: '#c084fc',
                            cursor: 'pointer'
                          }}
                          className="glow-card"
                        >
                          <span>{act.label}</span>
                          <ArrowRight size={12} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.8rem', padding: '6px 10px' }}>
                <Sparkles size={14} className="text-purple-400 animate-spin" />
                <span>DocumentAssist is formulating answer...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel / Chips */}
          <div style={{
            padding: '8px 12px',
            borderTop: '1px solid var(--border-glass)',
            background: 'rgba(15, 23, 42, 0.6)',
            overflowX: 'auto',
            display: 'flex',
            gap: 6,
            whiteSpace: 'nowrap'
          }}>
            {suggestedQuestions.slice(0, 5).map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                style={{
                  fontSize: '0.74rem',
                  padding: '4px 10px',
                  borderRadius: 9999,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
                className="hover:bg-purple-900/30 hover:text-purple-300"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div style={{
            padding: '12px 14px',
            borderTop: '1px solid var(--border-glass)',
            background: '#0b0f17',
            display: 'flex',
            gap: 8
          }}>
            <input
              type="text"
              placeholder="Ask DocumentAssist AI..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="input-field"
              style={{ fontSize: '0.86rem', padding: '8px 12px' }}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !inputText.trim()}
              className="btn-primary"
              style={{ padding: '8px 14px', borderRadius: 8, background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}
            >
              <Send size={15} />
            </button>
          </div>

        </div>
      )}
    </>
  );
};
