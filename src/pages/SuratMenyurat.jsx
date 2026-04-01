import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Filter, MoreVertical, FileText, Calendar, Hash, MapPin, Send, 
  Trash2, Edit2, Eye, Save, X, AlertCircle, Bookmark, User 
} from 'lucide-react';
import { db } from '../firebase';
import { ref, onValue, push, remove, update } from 'firebase/database';
import Modal from '../components/Modal';
import { logActivity } from '../utils/logging';
import { useAuth } from '../context/AuthContext';

const SuratMenyurat = ({ type }) => {
  const { user } = useAuth();
  const isMasuk = type === 'masuk';
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formValues, setFormValues] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    nomor: '',
    entitas: '', // Digunakan untuk Pengirim (Masuk) atau Penerima (Keluar)
    subjek: '',
    tujuanSurat: '',
    ringkasan: ''
  });

  // Real-time Listener for Mail data
  useEffect(() => {
    const mailRef = ref(db, `surat/${type}`);
    const unsubscribe = onValue(mailRef, (snapshot) => {
      const docs = [];
      snapshot.forEach((child) => {
        docs.push({ id: child.key, ...child.val() });
      });
      setData(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [type]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const mailRef = ref(db, `surat/${type}`);
    const letterData = { ...formValues, updatedAt: new Date().toISOString() };
    
    try {
      if (editingId) {
        await update(ref(db, `surat/${type}/${editingId}`), letterData);
        await logActivity(db, isMasuk ? 'Surat Masuk' : 'Surat Keluar', `Mengubah surat nomor: ${letterData.nomor}`, user);
        alert('Data berhasil diperbarui');
      } else {
        await push(mailRef, { ...letterData, createdAt: new Date().toISOString() });
        await logActivity(db, isMasuk ? 'Surat Masuk' : 'Surat Keluar', `Menambah surat baru nomor: ${letterData.nomor}`, user);
        alert('Data berhasil ditambahkan');
      }
      resetForm();
    } catch (error) {
      alert('Gagal menyimpan data');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus data ini secara permanen?')) {
      try {
        const itemToDelete = data.find(item => item.id === id);
        await remove(ref(db, `surat/${type}/${id}`));
        await logActivity(db, isMasuk ? 'Surat Masuk' : 'Surat Keluar', `Menghapus surat nomor: ${itemToDelete?.nomor}`, user);
        alert('Data berhasil dihapus');
      } catch (error) {
        alert('Gagal menghapus data');
      }
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormValues({
      tanggal: item.tanggal,
      nomor: item.nomor,
      entitas: item.entitas || (isMasuk ? item.asal : item.penerima) || '',
      subjek: item.subjek || item.tentang || '',
      tujuanSurat: item.tujuanSurat || item.tujuan || '',
      ringkasan: item.ringkasan || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormValues({
      tanggal: new Date().toISOString().split('T')[0],
      nomor: '',
      entitas: '',
      subjek: '',
      tujuanSurat: '',
      ringkasan: ''
    });
  };

  const filteredData = data.filter(item => 
    item.nomor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.entitas || (isMasuk ? item.asal : item.penerima))?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.subjek || item.tentang)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.tujuanSurat || item.tujuan)?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mail-page fadeIn">
      <div className="page-header">
        <div className="header-info">
          <h1>{isMasuk ? 'Surat Masuk' : 'Surat Keluar'}</h1>
          <p>Data korespondensi {isMasuk ? 'yang diterima' : 'yang dikirim'} kantor.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={18} />
          <span>Tambah Baris</span>
        </button>
      </div>

      <div className="toolbar glass-card">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Cari nomor, entitas, subjek, atau tujuan..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="toolbar-actions">
          <button className="icon-btn-outline"><Filter size={18} /></button>
          <div className="divider"></div>
          <span className="total-label">Total: {data.length} Data</span>
        </div>
      </div>

      <div className="table-responsive glass-card">
        {loading ? (
          <div className="p-10 text-center text-muted">Sinkronisasi Cloud...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '140px' }}><Calendar size={14} /> Tanggal</th>
                <th style={{ width: '180px' }}><Hash size={14} /> Nomor Surat</th>
                <th><User size={14} /> {isMasuk ? 'Pengirim' : 'Penerima'}</th>
                <th><Bookmark size={14} /> Subjek</th>
                <th><MapPin size={14} /> Tujuan Surat</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? filteredData.map((item) => (
                <tr key={item.id}>
                  <td className="font-medium text-blue">{new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
                  <td><span className="badge-outline">{item.nomor}</span></td>
                  <td className="font-semibold">{item.entitas || (isMasuk ? item.asal : item.penerima) || '-'}</td>
                  <td className="font-medium">{item.subjek || item.tentang || '-'}</td>
                  <td><span className="tujuan-tag">{item.tujuanSurat || item.tujuan || '-'}</span></td>
                  <td>
                    <div className="action-group">
                      <button className="icon-btn-view" onClick={() => setShowDetail(item)}><Eye size={16} /></button>
                      <button className="icon-btn-edit" onClick={() => handleEdit(item)}><Edit2 size={16} /></button>
                      <button className="icon-btn-delete" onClick={() => handleDelete(item.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Data korespondensi belum tersedia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={showForm}
        onClose={resetForm}
        title={editingId ? 'Koreksi Data Surat' : 'Registrasi Surat Baru'}
        icon={editingId ? <Edit2 size={24} /> : <Plus size={24} />}
      >
        <form onSubmit={handleSave} className="mail-form premium-form">
          <div className="form-section">
            <h4 className="section-title"><Calendar size={18} /> Metadata Identitas</h4>
            <div className="form-grid-inner">
              <div className="form-group">
                <label>Tanggal Surat</label>
                <input required type="date" name="tanggal" value={formValues.tanggal} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Nomor Surat</label>
                <input required name="nomor" placeholder="Contoh: 001/SK/2026" value={formValues.nomor} onChange={handleInputChange} />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4 className="section-title">{isMasuk ? <User size={18} /> : <Send size={18} />} {isMasuk ? 'Entitas Pengirim' : 'Entitas Penerima'}</h4>
            <div className="form-group">
              <label>{isMasuk ? 'Nama Pengirim / Instansi' : 'Nama Penerima / Instansi'}</label>
              <input required name="entitas" placeholder={isMasuk ? 'Masukkan nama pengirim...' : 'Masukkan nama penerima...'} value={formValues.entitas} onChange={handleInputChange} />
            </div>
          </div>

          <div className="form-section">
            <h4 className="section-title"><Bookmark size={18} /> Subjek & Alokasi</h4>
            <div className="form-grid-inner">
              <div className="form-group">
                <label>Subjek / Perihal</label>
                <input required name="subjek" placeholder="Perihal surat..." value={formValues.subjek} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Tujuan Surat</label>
                <input required name="tujuanSurat" placeholder="Unit atau tujuan..." value={formValues.tujuanSurat} onChange={handleInputChange} />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4 className="section-title"><FileText size={18} /> Konten Ringkasan</h4>
            <div className="form-group">
              <label>Ringkasan Isi Surat</label>
              <textarea required name="ringkasan" placeholder="Tulis ringkasan singkat..." value={formValues.ringkasan} onChange={handleInputChange} style={{ minHeight: '100px' }}></textarea>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={resetForm}>Batal</button>
            <button type="submit" className="btn btn-primary"><Save size={18} /> Simpan ke Arsip</button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!showDetail}
        onClose={() => setShowDetail(null)}
        title="Rincian Korespondensi Cloud"
        icon={<FileText size={24} />}
      >
        {showDetail && (
          <div className="detail-view-premium">
            <div className="detail-header-card">
               <div className="dh-meta">
                  <span className="dh-tag">{isMasuk ? 'INCOMING' : 'OUTGOING'}</span>
                  <span className="dh-date">{new Date(showDetail.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
               </div>
               <h3 className="dh-title">{showDetail.subjek || showDetail.tentang}</h3>
               <div className="dh-number">{showDetail.nomor}</div>
            </div>

            <div className="detail-body-grid">
               <div className="db-item">
                  <span className="db-label">{isMasuk ? 'PENGIRIM' : 'PENERIMA'}</span>
                  <span className="db-val">{showDetail.entitas || (isMasuk ? showDetail.asal : showDetail.penerima) || '-'}</span>
               </div>
               <div className="db-item">
                  <span className="db-label">TUJUAN SURAT</span>
                  <span className="db-val">{showDetail.tujuanSurat || showDetail.tujuan || '-'}</span>
               </div>
            </div>

            <div className="detail-content-box">
               <span className="db-label">RINGKASAN ISI SURAT</span>
               <p>{showDetail.ringkasan || 'Tidak ada ringkasan deskripsi.'}</p>
            </div>
            
            <div className="detail-footer">
               <button className="btn btn-primary btn-block" onClick={() => setShowDetail(null)}>Tutup Detail</button>
            </div>
          </div>
        )}
      </Modal>

      <style dangerouslySetInnerHTML={{ __html: `
        .mail-page { display: flex; flex-direction: column; gap: 1.25rem; }
        .page-header { display: flex; justify-content: space-between; align-items: center; }
        .header-info h1 { font-size: 1.5rem; font-weight: 900; color: var(--text-main); line-height: 1.1; }
        .header-info p { color: var(--text-muted); font-size: 0.85rem; }
        
        .toolbar { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; }
        .search-box { flex: 1; display: flex; align-items: center; gap: 12px; background: #f8fafc; padding: 0.6rem 1rem; border-radius: 12px; border: 1px solid #e2e8f0; max-width: 450px; }
        .search-box input { border: none; background: none; outline: none; width: 100%; font-size: 0.9rem; font-weight: 600; color: #1e293b; }
        
        .total-label { font-size: 0.75rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th { padding: 1rem 1.5rem; background: #f8fafc; text-align: left; font-size: 0.7rem; font-weight: 900; color: #64748b; text-transform: uppercase; border-bottom: 2px solid #f1f5f9; }
        .data-table td { padding: 1rem 1.5rem; font-size: 0.9rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        
        .badge-outline { padding: 0.4rem 0.75rem; background: white; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.75rem; font-weight: 800; color: var(--primary); }
        .tujuan-tag { font-size: 0.75rem; font-weight: 700; color: #475569; background: #f1f5f9; padding: 4px 10px; border-radius: 6px; }

        .premium-form { display: flex; flex-direction: column; gap: 1.5rem; padding: 0.5rem; }
        .form-section { display: flex; flex-direction: column; gap: 1rem; }
        .section-title { font-size: 0.85rem; font-weight: 900; color: #1e293b; display: flex; align-items: center; gap: 10px; padding-bottom: 0.5rem; border-bottom: 1px dashed #e2e8f0; }
        .form-grid-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
        
        .form-group label { display: block; font-size: 0.75rem; font-weight: 800; color: #64748b; margin-bottom: 6px; text-transform: uppercase; }
        .form-group input, .form-group textarea { width: 100%; padding: 0.75rem 1rem; border-radius: 10px; border: 1px solid #e2e8f0; font-size: 0.9rem; font-weight: 600; outline: none; transition: border-color 0.2s; }
        .form-group input:focus, .form-group textarea:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(37,99,235,0.05); }

        .detail-view-premium { display: flex; flex-direction: column; gap: 1.5rem; }
        .detail-header-card { background: linear-gradient(135deg, var(--primary) 0%, #4c66ff 100%); padding: 1.5rem; border-radius: 20px; color: white; display: flex; flex-direction: column; gap: 8px; }
        .dh-meta { display: flex; justify-content: space-between; align-items: center; }
        .dh-tag { font-size: 0.6rem; font-weight: 950; background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 100px; }
        .dh-date { font-size: 0.75rem; font-weight: 700; opacity: 0.8; }
        .dh-title { font-size: 1.25rem; font-weight: 900; margin: 0; line-height: 1.2; }
        .dh-number { font-size: 0.85rem; font-weight: 800; opacity: 0.9; }

        .detail-body-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .db-item { display: flex; flex-direction: column; gap: 4px; background: #f8fafc; padding: 1rem; border-radius: 12px; border: 1px solid #f1f5f9; }
        .db-label { font-size: 0.65rem; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
        .db-val { font-size: 0.9rem; font-weight: 800; color: #1e293b; }

        .detail-content-box { background: #f8fafc; padding: 1.25rem; border-radius: 16px; border: 1px solid #f1f5f9; }
        .detail-content-box p { font-size: 0.9rem; font-weight: 600; color: #475569; line-height: 1.6; margin-top: 10px; }
        
        .detail-footer { margin-top: 1rem; }
        .btn-block { width: 100%; padding: 0.85rem; }

        @media (max-width: 640px) { .form-grid-inner { grid-template-columns: 1fr; } .detail-body-grid { grid-template-columns: 1fr; } .toolbar { flex-direction: column; align-items: stretch; gap: 1rem; } }
      ` }} />
    </div>
  );
};

export default SuratMenyurat;
