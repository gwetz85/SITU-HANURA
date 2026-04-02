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
  ChevronLeft,
  User,
  Users
} from 'lucide-react';
import { db, storage } from '../firebase';
import { ref, onValue, push, set, serverTimestamp, remove, update } from 'firebase/database';
import { ref as sRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../context/AuthContext';

const Chat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch Users List and Online Status
  useEffect(() => {
    const usersRef = ref(db, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userList = Object.entries(data)
          .map(([id, val]) => ({ id, ...val }))
          .filter(u => u.id !== user.id); // Don't show self in list
        setUsers(userList);
      }
      setLoadingUsers(false);
    });
    return () => unsubscribe();
  }, [user.id]);

  // Handle Conversation ID
  const getConversationId = (otherUserId) => {
    if (!otherUserId) return 'global';
    return [user.id, otherUserId].sort().join('_');
  };

  const currentChatId = selectedContact ? getConversationId(selectedContact.id) : null;

  // Fetch Messages for Selected Contact
  useEffect(() => {
    if (!currentChatId) {
      setMessages([]);
      return;
    }

    const chatRef = ref(db, `chats/${currentChatId}`);
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

    // Clear notification for me when I open the chat
    if (selectedContact) {
       update(ref(db, `users/${user.id}/chatNotifications`), { [selectedContact.id]: false });
    }

    return () => unsubscribe();
  }, [currentChatId]);

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
    if (!currentChatId) return;

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

      const chatRef = ref(db, `chats/${currentChatId}`);
      const newMessage = {
        senderId: user.id,
        senderName: user.name || user.username,
        role: user.role,
        text: inputText.trim(),
        file: fileData,
        createdAt: serverTimestamp()
      };

      await push(chatRef, newMessage);
      
      // Set notification for recipient
      await update(ref(db, `users/${selectedContact.id}/chatNotifications`), { [user.id]: true });

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
    if (window.confirm('Hapus pesan ini?')) {
      await remove(ref(db, `chats/${currentChatId}/${id}`));
    }
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const date = new Date(ts);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="chat-page fadeIn">
      <div className="chat-layout-wrapper glass-card-premium">
        
        {/* User Sidebar */}
        <aside className="chat-sidebar">
           <div className="sidebar-header-chat">
              <div className="my-profile">
                 <div className="avatar-me">{user.name?.charAt(0) || user.username?.charAt(0)}</div>
                 <div className="profile-info">
                    <span className="profile-name">{user.name || user.username}</span>
                    <span className="profile-role">{user.role}</span>
                 </div>
              </div>
              <div className="search-bar-chat">
                 <Search size={14} />
                 <input 
                    type="text" 
                    placeholder="Cari kontak..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
           </div>

           <div className="contact-list">
              <div className="contact-group-title">KONTAK STAFF SITU</div>
              {loadingUsers ? (
                <div className="loading-contacts">Memuat kontak...</div>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map(u => (
                  <div 
                    key={u.id} 
                    className={`contact-item ${selectedContact?.id === u.id ? 'active' : ''}`}
                    onClick={() => setSelectedContact(u)}
                  >
                     <div className="contact-avatar">
                        {u.name?.charAt(0) || u.username?.charAt(0)}
                        {u.activeDevId && <span className="online-indicator"></span>}
                     </div>
                     <div className="contact-info">
                        <span className="c-name">{u.name}</span>
                        <span className="c-role text-muted">{u.role}</span>
                     </div>
                  </div>
                ))
              ) : (
                <div className="empty-contacts">Tidak ada kontak ditemukan.</div>
              )}
           </div>
        </aside>

        {/* Chat Content Area */}
        <div className="chat-main">
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <div className="header-info">
                  <div className="contact-avatar active">
                    {selectedContact.name?.charAt(0)}
                  </div>
                  <div>
                    <h3>{selectedContact.name}</h3>
                    <p className={`status-label-real ${selectedContact.activeDevId ? 'online' : 'offline'}`}>
                      {selectedContact.activeDevId ? 'Pesan sekarang' : 'Terakhir terlihat beberapa saat lalu'}
                    </p>
                  </div>
                </div>
                <div className="header-actions">
                  <button className="btn-icon"><MoreVertical size={18} /></button>
                </div>
              </div>

              {/* Messages List */}
              <div className="messages-area">
                {messages.length > 0 ? messages.map((msg) => {
                  const isMe = msg.senderId === user.id;
                  return (
                    <div key={msg.id} className={`message-wrapper ${isMe ? 'msg-me' : 'msg-others'}`}>
                      <div className="message-content">
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
                    <h4>Belum Ada Percakapan</h4>
                    <p>Kirim pesan pertama untuk memulai obrolan dengan {selectedContact.name}.</p>
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
                    placeholder="Ketik pesan..." 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    disabled={isUploading}
                  />
                </div>
                <button type="submit" className="send-btn" disabled={isUploading || (!inputText.trim() && !attachment)}>
                  {isUploading ? <div className="spinner-mini"></div> : <Send size={20} />}
                </button>
              </form>
            </>
          ) : (
            <div className="chat-placeholder-view">
               <div className="p-icon-wrapper"><Users size={60} /></div>
               <h2>Obrolan SITU HANURA</h2>
               <p>Pilih salah satu kontak di samping untuk memulai percakapan pribadi. <br/> Semua obrolan terenkripsi dan tersimpan aman di cloud.</p>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .chat-page {
          height: calc(100vh - var(--navbar-height) - 4rem);
          display: flex;
        }

        .chat-layout-wrapper {
          flex: 1;
          display: flex;
          overflow: hidden;
          padding: 0;
          background: var(--surface) !important;
          border-radius: 20px;
          border: 1px solid var(--border);
          box-shadow: 0 12px 40px rgba(0,0,0,0.1);
        }

        /* Sidebar Sidebar */
        .chat-sidebar {
           width: 300px;
           border-right: 1px solid var(--border);
           display: flex;
           flex-direction: column;
           background: #ffffff;
        }

        .sidebar-header-chat {
           padding: 1.5rem;
           border-bottom: 1px solid var(--border);
        }

        .my-profile { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem; }
        .avatar-me { width: 42px; height: 42px; background: var(--primary); color: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.2rem; }
        .profile-name { display: block; font-weight: 800; font-size: 0.95rem; color: var(--text-main); }
        .profile-role { display: block; font-size: 0.65rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; }

        .search-bar-chat {
           background: var(--background);
           border: 1px solid var(--border);
           border-radius: 10px;
           padding: 0.5rem 0.75rem;
           display: flex;
           align-items: center;
           gap: 8px;
           color: var(--text-muted);
        }
        .search-bar-chat input { border: none; background: none; outline: none; font-size: 0.85rem; width: 100%; color: var(--text-main); }

        .contact-list { flex: 1; overflow-y: auto; padding: 0.5rem; }
        .contact-group-title { font-size: 0.65rem; font-weight: 800; color: var(--text-muted); padding: 1rem 1rem 0.5rem; letter-spacing: 0.05em; }
        
        .contact-item {
           display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem;
           border-radius: 12px; cursor: pointer; transition: all 0.2s;
        }
        .contact-item:hover { background: #f8fafc; }
        .contact-item.active { background: #eff6ff; }
        .contact-item.active .c-name { color: var(--primary); }
        
        .contact-avatar {
           width: 40px; height: 40px; background: #f1f5f9; border-radius: 10px;
           display: flex; align-items: center; justify-content: center;
           font-weight: 800; color: #475569; position: relative;
        }
        .contact-avatar.active { background: var(--primary); color: white; }

        .online-indicator {
           position: absolute; bottom: -2px; right: -2px; width: 12px; height: 12px;
           background: #10b981; border: 2px solid white; border-radius: 50%;
        }

        .contact-info { display: flex; flex-direction: column; gap: 1px; }
        .c-name { font-size: 0.85rem; font-weight: 700; color: var(--text-main); }
        .c-role { font-size: 0.7rem; }

        /* Main Chat Area */
        .chat-main { flex: 1; display: flex; flex-direction: column; background: #f8fafc; position: relative; }

        .chat-header {
          padding: 1rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border);
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(10px);
        }

        .header-info { display: flex; align-items: center; gap: 0.75rem; }
        .header-info h3 { font-size: 1rem; font-weight: 800; color: var(--text-main); margin: 0; }
        .status-label-real { font-size: 0.7rem; margin: 0; font-weight: 600; }
        .status-label-real.online { color: #10b981; }
        .status-label-real.offline { color: var(--text-muted); }

        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .message-wrapper { display: flex; flex-direction: column; }
        .msg-me { align-items: flex-end; }
        .msg-others { align-items: flex-start; }

        .message-content {
          max-width: 70%;
          padding: 0.75rem 1rem;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .msg-me .message-content { background: var(--primary); color: white; border-bottom-right-radius: 4px; }
        .msg-others .message-content { background: white; color: var(--text-main); border-bottom-left-radius: 4px; border: 1px solid var(--border); }

        .msg-text { font-size: 0.95rem; margin: 0; line-height: 1.4; word-break: break-word; }
        .msg-footer { display: flex; align-items: center; gap: 8px; align-self: flex-end; margin-top: 4px; }
        .msg-time { font-size: 0.65rem; opacity: 0.7; }
        .msg-delete-btn { background: none; border: none; color: inherit; opacity: 0.3; cursor: pointer; padding: 2px; }

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

        .chat-input-row {
          padding: 1rem 1.5rem;
          display: flex; gap: 0.75rem; align-items: center;
          border-top: 1px solid var(--border);
          background: white;
        }

        .text-input-container { flex: 1; }
        .text-input-container input {
          width: 100%; padding: 0.75rem 1rem; border-radius: 12px;
          border: 1px solid var(--border); background: var(--background);
          font-size: 0.9rem; font-weight: 600; outline: none; transition: all 0.2s;
        }

        .input-btn, .send-btn { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; flex-shrink: 0; }
        .input-btn { background: var(--background); border: 1px solid var(--border); color: var(--text-muted); }
        .send-btn { background: var(--primary); color: white; border: none; }
        .send-btn:disabled { opacity: 0.6; }

        .chat-placeholder-view {
           flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
           text-align: center; color: var(--text-muted); padding: 3rem;
        }
        .p-icon-wrapper { margin-bottom: 2rem; color: var(--primary); opacity: 0.1; }
        .chat-placeholder-view h2 { font-weight: 900; color: var(--text-main); margin-bottom: 1rem; }
        .chat-placeholder-view p { max-width: 400px; line-height: 1.6; font-weight: 600; }

        .spinner-mini { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 900px) {
           .chat-sidebar { width: 80px; }
           .profile-info, .search-bar-chat, .c-role, .contact-group-title, .c-name { display: none; }
           .sidebar-header-chat { padding: 1rem 0.5rem; display: flex; justify-content: center; }
           .contact-item { padding: 0.75rem; justify-content: center; }
        }

        @media (max-width: 640px) {
           .chat-page { height: calc(100vh - 8rem); }
        }
      ` }} />
    </div>
  );
};

export default Chat;
