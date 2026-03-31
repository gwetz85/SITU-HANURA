import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  FileText, 
  Search, 
  Grid, 
  List, 
  Upload, 
  MoreVertical,
  Download,
  Share2,
  Trash2,
  Filter
} from 'lucide-react';
import { db } from '../firebase';
import { ref, onValue, push } from 'firebase/database';

const Pustaka = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [activeFolder, setActiveFolder] = useState('all');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pushRef = ref(db, 'pustaka');
    const unsubscribe = onValue(pushRef, (snapshot) => {
      const items = [];
      snapshot.forEach((child) => {
        items.push({ id: child.key, ...child.val() });
      });
      setFiles(items);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const uploadMetadata = async () => {
    const pushRef = ref(db, 'pustaka');
    const dummy = {
      name: `Arsip_Baru_${files.length + 1}.pdf`,
      type: 'PDF',
      size: '1.5 MB',
      date: new Date().toISOString().split('T')[0],
      folder: activeFolder === 'all' ? 'arsip' : activeFolder
    };
    await push(pushRef, dummy);
  };

  const folders = [
    { id: 'all', name: 'Semua Berkas', icon: <Folder size={20} /> },
    { id: 'masuk', name: 'Surat Masuk', icon: <Folder size={20} color="#3b82f6" /> },
    { id: 'keluar', name: 'Surat Keluar', icon: <Folder size={20} color="#10b981" /> },
    { id: 'arsip', name: 'Arsip Penting', icon: <Folder size={20} color="#f59e0b" /> },
  ];

  const filteredFiles = activeFolder === 'all' 
    ? files 
    : files.filter(f => f.folder === activeFolder);

  return (
    <div className="pustaka-page fadeIn">
      <div className="page-header">
        <div className="header-info">
          <h1>Pustaka Digital (Cloud)</h1>
          <p>Metada arsip digital tersinkronisasi di Firebase Realtime Database.</p>
        </div>
        <button className="btn btn-primary" onClick={uploadMetadata}>
          <Upload size={18} />
          <span>Simpan Metadata</span>
        </button>
      </div>

      <div className="pustaka-layout">
        <aside className="pustaka-sidebar glass-card">
          <div className="sidebar-section">
            <h3>Kategori</h3>
            <div className="folder-list">
              {folders.map(folder => (
                <button 
                  key={folder.id}
                  className={`folder-item ${activeFolder === folder.id ? 'active' : ''}`}
                  onClick={() => setActiveFolder(folder.id)}
                >
                  {folder.icon}
                  <span className="folder-name">{folder.name}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="pustaka-content">
          <div className="toolbar glass-card">
            <div className="search-box">
              <Search size={18} />
              <input type="text" placeholder="Cari nama berkas..." />
            </div>
            <div className="toolbar-actions">
              <button className="icon-btn-outline"><Grid size={18} onClick={() => setViewMode('grid')} /></button>
              <button className="icon-btn-outline"><List size={18} onClick={() => setViewMode('list')} /></button>
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center text-muted">Menyinkronkan dokumen...</div>
          ) : (
            <div className={`files-container ${viewMode}`}>
              {filteredFiles.length > 0 ? filteredFiles.map(file => (
                <div key={file.id} className="file-card glass-card">
                  <div className="file-preview">
                    <FileText />
                    <button className="file-options"><MoreVertical size={16} /></button>
                  </div>
                  <div className="file-info">
                    <h4 className="file-name">{file.name}</h4>
                    <div className="file-meta">
                      <span>{file.size}</span>
                      <span className="dot"></span>
                      <span>{new Date(file.date).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-10 text-center text-muted">Tidak ada dokumen di kategori ini.</div>
              )}
            </div>
          )}
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .pustaka-page { display: flex; flex-direction: column; gap: 1.5rem; }
        .pustaka-layout { display: flex; gap: 1.5rem; }
        .pustaka-sidebar { width: 280px; padding: 1.5rem; }
        .sidebar-section h3 { font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 1rem; }
        .folder-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .folder-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border-radius: var(--radius-md); font-weight: 600; color: var(--text-muted); }
        .folder-item.active { background: rgba(37,99,235,0.1); color: var(--primary); }
        .pustaka-content { flex: 1; display: flex; flex-direction: column; gap: 1.5rem; }
        .files-container.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
        .file-card { padding: 1rem; display: flex; flex-direction: column; gap: 1rem; }
        .file-preview { height: 100px; background: var(--background); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; position: relative; }
        .file-info { display: flex; flex-direction: column; gap: 0.25rem; }
        .file-name { font-size: 0.9rem; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .file-meta { font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 4px; }
        .dot { width: 3px; height: 3px; background: #ccc; border-radius: 50%; }
        .p-10 { padding: 2.5rem; }
        @media (max-width: 1024px) { .pustaka-layout { flex-direction: column; } .pustaka-sidebar { width: 100%; } }
      ` }} />
    </div>
  );
};

export default Pustaka;
