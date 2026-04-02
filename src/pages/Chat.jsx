import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Paperclip, 
  FileText, 
  X, 
  Image as ImageIcon, 
  MessageSquare,
  Download,
  MoreVertical,
  Trash2,
  Smile,
  Search,
  ChevronLeft
} from 'lucide-react';
import { db, storage } from '../firebase';
import { ref, onValue, push, set, serverTimestamp, remove } from 'firebase/database';
import { ref as sRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../context/AuthContext';

const Chat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch Messages
  useEffect(() => {
    const chatRef = ref(db, 'chats/global');
    const unsubscribe = onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const msgList = Object.entries(data).map(([id, val]) => ({
          id,
          ...val
        })).sort((a, b) => a.createdAt - b.createdAt);
        setMessages(msgList);
      } else {
        setMessages([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Auto Scroll to Bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File terlalu besar. Maksimal 10MB.');
        return;
      }
      setAttachment(file);
      if (file.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const clearAttachment = () => {
    setAttachment(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() && !attachment) return;

    try {
      let fileData = null;

      if (attachment) {
        setIsUploading(true);
        const fileRef = sRef(storage, `chats/files/${Date.now()}_${attachment.name}`);
        await uploadBytes(fileRef, attachment);
        const url = await getDownloadURL(fileRef);
        fileData = {
          url,
          name: attachment.name,
          type: attachment.type
        };
      }

      const chatRef = ref(db, 'chats/global');
      const newMessage = {
        senderId: user.id,
        senderName: user.name || user.username,
        role: user.role,
        text: inputText.trim(),
        file: fileData,
        createdAt: serverTimestamp()
      };

      await push(chatRef, newMessage);
      
      setInputText('');
      clearAttachment();
      setIsUploading(false);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Gagal mengirim pesan.');
      setIsUploading(false);
    }
  };

  const deleteMessage = async (id) => {
    if (user.role !== 'Admin') return;
    if (window.confirm('Hapus pesan ini dari riwayat?')) {
      await remove(ref(db, `chats/global/${id}`));
    }
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const date = new Date(ts);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-page fadeIn">
      <div className="chat-container glass-card-premium">
        {/* Chat Header */}
        <div className="chat-header">
          <div className="header-info">
            <div className="chat-icon-bg">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3>Global Chat SITU</h3>
              <p className="online-count">Terhubung sebagai: <span>{user?.name || user?.username}</span></p>
            </div>
          </div>
          <div className="header-actions">
            {user.role === 'Admin' && (
              <button className="btn-icon" title="Hapus Semua Riwayat (Admin)" onClick={() => {
                if (window.confirm('Hapus seluruh riwayat chat selamanya? Action ini tidak bisa dibatalkan.')) {
                   remove(ref(db, 'chats/global'));
                }
              }}>
                <Trash2 size={18} />
              </button>
            )}
            <button className="btn-icon"><Search size={18} /></button>
          </div>
        </div>

        {/* Messages List */}
        <div className="messages-area">
          {messages.length > 0 ? messages.map((msg) => {
            const isMe = msg.senderId === user.id;
            return (
              <div key={msg.id} className={`message-wrapper ${isMe ? 'msg-me' : 'msg-others'}`}>
                <div className="message-content">
                  {!isMe && <div className="sender-name">{msg.senderName} <span className={`role-tag ${msg.role?.toLowerCase()}`}>{msg.role}</span></div>}
                  
                  {msg.file && (
                    <div className="attachment-content">
                      {msg.file.type.startsWith('image/') ? (
                        <div className="image-attachment-wrapper">
                          <img src={msg.file.url} alt="Shared" className="msg-image" onClick={() => window.open(msg.file.url, '_blank')} />
                        </div>
                      ) : (
                        <a href={msg.file.url} target="_blank" rel="noopener noreferrer" className="file-attachment-link">
                          <FileText size={20} />
                          <div className="file-info">
                            <span className="file-name">{msg.file.name}</span>
                            <span className="file-size">Klik untuk unduh</span>
                          </div>
                          <Download size={16} className="ms-auto" />
                        </a>
                      )}
                    </div>
                  )}

                  {msg.text && <p className="msg-text">{msg.text}</p>}
                  
                  <div className="msg-footer">
                    <span className="msg-time">{formatTime(msg.createdAt)}</span>
                    {user.role === 'Admin' && (
                      <button className="msg-delete-btn" onClick={() => deleteMessage(msg.id)}><X size={10} /></button>
                    )}
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="empty-chat">
              <div className="empty-icon"><MessageSquare size={40} /></div>
              <h4>Belum Ada Pesan</h4>
              <p>Mulai percakapan dengan tim Anda di sini.</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Attachment Preview Overlay */}
        {attachment && (
          <div className="attachment-preview fadeIn">
            <div className="preview-card">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="img-p" />
              ) : (
                <div className="file-p">
                  <FileText size={24} />
                  <span>{attachment.name}</span>
                </div>
              )}
              <button className="close-p" onClick={clearAttachment}><X size={16} /></button>
            </div>
          </div>
        )}

        {/* Input Area */}
        <form className="chat-input-row" onSubmit={handleSendMessage}>
          <button type="button" className="input-btn" onClick={() => fileInputRef.current.click()}>
            <Paperclip size={20} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
          />
          <div className="text-input-container">
            <input 
              type="text" 
              placeholder="Ketik pesan di sini..." 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isUploading}
            />
          </div>
          <button type="submit" className="send-btn" disabled={isUploading || (!inputText.trim() && !attachment)}>
            {isUploading ? <div className="spinner-mini"></div> : <Send size={20} />}
          </button>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .chat-page {
          height: calc(100vh - var(--navbar-height) - 4rem);
          display: flex;
          flex-direction: column;
        }

        .chat-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          padding: 0;
          background: var(--surface) !important;
          border-radius: 20px;
          border: 1px solid var(--border);
          box-shadow: 0 12px 40px rgba(0,0,0,0.1);
        }

        .chat-header {
          padding: 1rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border);
          background: rgba(255,255,255,0.5);
          backdrop-filter: blur(10px);
        }

        .header-info { display: flex; align-items: center; gap: 0.75rem; }
        .chat-icon-bg {
          width: 40px; height: 40px; background: var(--primary); color: white;
          border-radius: 12px; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(37,99,235,0.2);
        }
        .header-info h3 { font-size: 1rem; font-weight: 800; color: var(--text-main); margin: 0; }
        .online-count { font-size: 0.7rem; color: var(--text-muted); margin: 0; }
        .online-count span { color: var(--primary); font-weight: 700; }

        .btn-icon { background: none; border: none; color: var(--text-muted); padding: 0.5rem; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
        .btn-icon:hover { background: var(--background); color: var(--primary); }

        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          background: #f8fafc;
          background-image: radial-gradient(rgba(37,99,235,0.02) 2px, transparent 0);
          background-size: 24px 24px;
        }

        .message-wrapper { display: flex; flex-direction: column; }
        .msg-me { align-items: flex-end; }
        .msg-others { align-items: flex-start; }

        .message-content {
          max-width: 75%;
          padding: 0.75rem 1rem;
          border-radius: 16px;
          position: relative;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .msg-me .message-content { background: var(--primary); color: white; border-bottom-right-radius: 4px; }
        .msg-others .message-content { background: white; color: var(--text-main); border-bottom-left-radius: 4px; border: 1px solid var(--border); }

        .sender-name { font-size: 0.7rem; font-weight: 800; color: var(--text-muted); margin-bottom: 4px; display: flex; align-items: center; gap: 6px; }
        .role-tag { font-size: 0.6rem; padding: 1px 4px; border-radius: 4px; color: white; text-transform: uppercase; }
        .role-tag.admin { background: #ef4444; }
        .role-tag.petugas { background: #f59e0b; }

        .msg-text { font-size: 0.95rem; margin: 0; line-height: 1.4; word-break: break-word; }
        .msg-footer { display: flex; align-items: center; gap: 8px; align-self: flex-end; margin-top: 4px; }
        .msg-time { font-size: 0.65rem; opacity: 0.7; }
        .msg-delete-btn { background: none; border: none; color: inherit; opacity: 0.3; cursor: pointer; padding: 2px; }
        .msg-delete-btn:hover { opacity: 1; }

        .attachment-content { margin-bottom: 4px; width: 100%; }
        .image-attachment-wrapper { border-radius: 12px; overflow: hidden; cursor: pointer; border: 1px solid rgba(255,255,255,0.2); }
        .msg-image { width: 100%; max-width: 300px; display: block; object-fit: cover; }
        
        .file-attachment-link {
          display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem;
          background: rgba(0,0,0,0.05); border-radius: 10px; text-decoration: none; color: inherit;
          min-width: 200px; border: 1px solid rgba(255,255,255,0.1);
        }
        .file-info { display: flex; flex-direction: column; gap: 2px; }
        .file-name { font-size: 0.85rem; font-weight: 700; width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .file-size { font-size: 0.65rem; opacity: 0.7; }

        .chat-input-row {
          padding: 1rem 1.5rem;
          display: flex; gap: 0.75rem; align-items: center;
          border-top: 1px solid var(--border);
          background: white;
        }

        .text-input-container { flex: 1; position: relative; }
        .text-input-container input {
          width: 100%; padding: 0.75rem 1rem; border-radius: 12px;
          border: 1px solid var(--border); background: var(--background);
          font-size: 0.9rem; font-weight: 600; outline: none; transition: all 0.2s;
        }
        .text-input-container input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(37,99,235,0.05); }

        .input-btn { background: var(--background); border: 1px solid var(--border); color: var(--text-muted); width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; flex-shrink: 0; }
        .input-btn:hover { color: var(--primary); background: #f1f5f9; }

        .send-btn { background: var(--primary); color: white; border: none; width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; flex-shrink: 0; }
        .send-btn:hover:not(:disabled) { transform: scale(1.05); box-shadow: 0 4px 12px rgba(37,99,235,0.3); }
        .send-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .attachment-preview { position: absolute; bottom: 80px; left: 1.5rem; right: 1.5rem; z-index: 100; }
        .preview-card {
          background: white; border-radius: 12px; padding: 0.5rem;
          box-shadow: 0 -10px 25px rgba(0,0,0,0.1), 0 10px 20px rgba(0,0,0,0.1);
          border: 1px solid var(--border); display: flex; align-items: center; gap: 1rem; position: relative;
        }
        .img-p { width: 60px; height: 60px; object-fit: cover; border-radius: 8px; }
        .file-p { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; font-weight: 700; color: var(--text-main); }
        .close-p { position: absolute; top: -8px; right: -8px; width: 24px; height: 24px; border-radius: 50%; background: #ef4444; color: white; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.2); }

        .empty-chat { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-muted); text-align: center; }
        .empty-icon { margin-bottom: 1rem; opacity: 0.1; }
        .empty-chat h4 { font-weight: 800; color: var(--text-muted); margin-bottom: 0.5rem; }

        .spinner-mini { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 640px) {
          .message-content { max-width: 85%; }
          .chat-input-row { padding: 0.75rem; }
          .attachment-preview { left: 0.75rem; right: 0.75rem; bottom: 70px; }
        }
      ` }} />
    </div>
  );
};

export default Chat;
