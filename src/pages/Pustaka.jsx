import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Filter, MoreVertical, FileText, Calendar, Hash, MapPin, Send, 
  Trash2, Edit2, Eye, Save, X, AlertCircle, ExternalLink, Library
} from 'lucide-react';
import { db } from '../firebase';
import { ref, onValue, push, remove, update } from 'firebase/database';
import Modal from '../components/Modal';

const Pustaka = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formValues, setFormValues] = useState({
    title: '',
    link: '',
    category: '',
    description: ''
  });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const mailRef = ref(db, 'pustaka');
    const docData = { ...formValues, updatedAt: new Date().toISOString() };
    
    try {
      if (editingId) {
        await update(ref(db, `pustaka/${editingId}`), docData);
        alert('Berkas berhasil diperbarui');
      } else {
        await push(mailRef, { ...docData, createdAt: new Date().toISOString() });
        alert('Berkas berhasil ditambahkan');
      }
      resetForm();
    } catch (error) {
      alert('Gagal menyimpan data');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus berkas ini dari pustaka?')) {
      try {
        await remove(ref(db, `pustaka/${id}`));
        alert('Berkas berhasil dihapus');
      } catch (error) {
        alert('Gagal menghapus data');
      }
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormValues({
      title: item.title,
      link: item.link,
      category: item.category,
      description: item.description
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormValues({
      title: '', link: '', category: '', description: ''
    });
  };

  const filteredFiles = files.filter(f => 
    f.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pustaka-page fadeIn">
      <div className="page-header">
        <div className="header-info">
          <h1>Pustaka Hanura</h1>
          <p>Kumpulan berkas administrasi dan referensi partai di Google Drive.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={18} />
          <span>Tambah Berkas Drive</span>
        </button>
      </div>

      <div className="toolbar glass-card full-search">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Cari judul atau kategori..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="p-10 text-center text-muted">Menyinkronkan dokumen...</div>
      ) : (
        <div className="pustaka-grid">
          {filteredFiles.length > 0 ? filteredFiles.map(file => (
            <div key={file.id} className="pustaka-card glass-card">
              <div className="pc-header">
                <span className="pc-category">{file.category || 'UMUM'}</span>
                <div className="pc-actions">
                  <button className="icon-btn-view p-sm" onClick={() => setShowDetail(file)} title="Lihat Detail"><Eye size={14} /></button>
                  <button className="icon-btn-edit p-sm" onClick={() => handleEdit(file)} title="Edit Metadata"><Edit2 size={14} /></button>
                  <button className="icon-btn-delete p-sm" onClick={() => handleDelete(file.id)} title="Hapus"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="pc-body">
                <h3 className="pc-title">{file.title}</h3>
                <p className="pc-desc">{file.description}</p>
                <div className="pc-footer-meta">
                  <FileText size={14} />
                  <span>DITAMBAHKAN: {new Date(file.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
              <a href={file.link} target="_blank" rel="noopener noreferrer" className="pc-btn-drive btn btn-primary">
                <ExternalLink size={18} />
                <span>Buka di Google Drive</span>
              </a>
            </div>
          )) : (
            <div className="p-10 text-center text-muted full-width">Tidak ada dokumen di kategori ini.</div>
          )}
        </div>
      )}

      <Modal
        isOpen={showForm}
        onClose={resetForm}
        title={editingId ? 'Edit Metadata Berkas' : 'Tambah Berkas Drive'}
        icon={editingId ? <Edit2 size={24} /> : <Plus size={24} />}
      >
        <form onSubmit={handleSave} className="mail-form">
          <div className="premium-modal-section">
            <h4 className="premium-section-title"><AlertCircle size={18} /> Informasi Utama</h4>
            <div className="form-group">
              <label>Judul Berkas</label>
              <input required name="title" placeholder="Contoh: SK Pengurusan PAC..." value={formValues.title} onChange={handleInputChange} />
            </div>
            <div className="form-group" style={{ marginTop: '1.2rem' }}>
              <label>Tautan Google Drive</label>
              <input required name="link" placeholder="https://drive.google.com/..." value={formValues.link} onChange={handleInputChange} />
            </div>
          </div>

          <div className="premium-modal-section">
            <h4 className="premium-section-title"><Library size={18} /> Klasifikasi & Detail</h4>
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label>Kategori</label>
                <input required name="category" placeholder="DPC / KPU / BANPOL / etc" value={formValues.category} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Deskripsi Singkat</label>
                <textarea required name="description" placeholder="Tuliskan deskripsi singkat berkas..." value={formValues.description} onChange={handleInputChange} style={{ minHeight: '100px' }}></textarea>
              </div>
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" className="btn btn-ghost" onClick={resetForm}>Batal</button>
            <button type="submit" className="btn btn-primary"><Save size={18} /> SIMPAN</button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!showDetail}
        onClose={() => setShowDetail(null)}
        title="Detail Berkas Hanura"
        icon={<FileText size={24} />}
        footer={
          <button className="btn btn-primary" onClick={() => setShowDetail(null)}>Tutup Detail</button>
        }
      >
        {showDetail && (
          <>
            <div className="premium-modal-section">
              <h4 className="premium-section-title"><AlertCircle size={18} /> Metadata Berkas</h4>
              <div className="premium-info-grid">
                <div className="premium-info-item">
                  <span className="premium-info-label">Judul</span>
                  <span className="premium-info-value" style={{ color: 'var(--primary)', fontWeight: 800 }}>{showDetail.title}</span>
                </div>
                <div className="premium-info-item">
                  <span className="premium-info-label">Kategori</span>
                  <span className="premium-info-value" style={{ textTransform: 'uppercase' }}>{showDetail.category}</span>
                </div>
              </div>
            </div>
            <div className="premium-modal-section">
              <h4 className="premium-section-title"><Library size={18} /> Deskripsi Berkas</h4>
              <div className="premium-info-item full" style={{ background: 'var(--background)', color: 'var(--text-main)', lineHeight: 1.8, borderRadius: '12px', padding: '1.5rem' }}>
                <p>{showDetail.description}</p>
              </div>
            </div>
          </>
        )}
      </Modal>

      <style dangerouslySetInnerHTML={{ __html: `
        .pustaka-page { display: flex; flex-direction: column; gap: 1rem; }
        .page-header { display: flex; justify-content: space-between; align-items: center; }
        .header-info h1 { font-size: 1.25rem; font-weight: 800; color: var(--text-main); }
        .header-info p { color: var(--text-muted); font-size: 0.8rem; }
        .full-search { padding: 0.85rem 1rem; }
        .full-width { grid-column: 1 / -1; width: 100%; }
        
        .pustaka-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
        }

        .pustaka-card {
          padding: 1.15rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .pustaka-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-sm); border-color: rgba(37,99,235,0.2); }

        .pc-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .pc-category { 
          padding: 0.35rem 0.75rem; 
          background: rgba(37,99,235,0.06); 
          color: var(--primary); 
          font-size: 0.7rem; 
          font-weight: 800; 
          border-radius: 6px; 
          border: 1px solid rgba(37,99,235,0.15);
        }
        .pc-actions { display: flex; gap: 0.5rem; }
        .p-sm { width: 30px !important; height: 30px !important; border-radius: 8px !important; }

        .pc-body { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
        .pc-title { color: var(--primary); font-size: 1rem; font-weight: 800; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .pc-desc { font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        
        .pc-footer-meta { display: flex; align-items: center; gap: 0.4rem; color: #94a3b8; font-size: 0.65rem; font-weight: 600; margin-top: 0.25rem; }
        
        .pc-btn-drive { width: 100%; justify-content: center; padding: 0.75rem; border-radius: 10px; font-weight: 700; gap: 0.6rem; font-size: 0.85rem; box-shadow: 0 4px 8px rgba(37,99,235,0.1); }
        .pc-btn-drive:hover { transform: translateY(-2px); box-shadow: 0 6px 12px rgba(37,99,235,0.15); }

        .action-group button { transition: all 0.2s; }
        .icon-btn-view { color: var(--primary); background: rgba(37,99,235,0.08); }
        .icon-btn-view:hover { background: var(--primary); color: white; }
        .icon-btn-edit { color: #f59e0b; background: rgba(245,158,11,0.08); }
        .icon-btn-edit:hover { background: #f59e0b; color: white; }
        .icon-btn-delete { color: #ef4444; background: rgba(239,68,68,0.08); }
        .icon-btn-delete:hover { background: #ef4444; color: white; }

        .p-10 { padding: 1.5rem; }
        @media (max-width: 768px) { .pustaka-grid { grid-template-columns: 1fr; } }
      ` }} />
    </div>
  );
};

export default Pustaka;
