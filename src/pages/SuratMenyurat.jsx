import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Filter, MoreVertical, FileText, Calendar, Hash, MapPin, Send, 
  Trash2, Edit2, Eye, Save, X, AlertCircle 
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
    asal: '',
    tujuan: '',
    tentang: '',
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
      asal: item.asal || '',
      tujuan: item.tujuan || '',
      tentang: item.tentang,
      ringkasan: item.ringkasan
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormValues({
      tanggal: new Date().toISOString().split('T')[0],
      nomor: '',
      asal: '',
      tujuan: '',
      tentang: '',
      ringkasan: ''
    });
  };

  const filteredData = data.filter(item => 
    item.nomor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (isMasuk ? item.asal : item.tujuan)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tentang?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mail-page fadeIn">
      <div className="page-header">
        <div className="header-info">
          <h1>{isMasuk ? 'Surat Masuk' : 'Surat Keluar'}</h1>
          <p>Data korespondensi cloud {isMasuk ? 'yang diterima' : 'yang dikirim'} kantor.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={18} />
          <span>Tambah Data</span>
        </button>
      </div>

      <div className="toolbar glass-card">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Cari nomor, asal, atau tentang..." 
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
          <div className="p-10 text-center text-muted">Memuat data dari Firebase...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th><Calendar size={14} /> Tanggal</th>
                <th><Hash size={14} /> Nomor Surat</th>
                <th>{isMasuk ? <MapPin size={14} /> : <Send size={14} />} {isMasuk ? 'Asal' : 'Tujuan'}</th>
                <th><FileText size={14} /> Tentang</th>
                <th>Ringkasan Isi</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? filteredData.map((item) => (
                <tr key={item.id}>
                  <td className="font-medium text-blue">{new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
                  <td><span className="badge-outline">{item.nomor}</span></td>
                  <td className="font-semibold">{isMasuk ? item.asal : item.tujuan}</td>
                  <td>{item.tentang}</td>
                  <td><p className="truncate-2">{item.ringkasan}</p></td>
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
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Belum ada data tersedia di Firebase.
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
        title={editingId ? 'Edit Data Surat' : 'Tambah Surat Baru'}
        icon={editingId ? <Edit2 size={24} /> : <Plus size={24} />}
      >
        <form onSubmit={handleSave} className="mail-form">
          <div className="premium-modal-section">
            <h4 className="premium-section-title"><Calendar size={18} /> Informasi Waktu & Nomor</h4>
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
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

          <div className="premium-modal-section">
            <h4 className="premium-section-title">
              {isMasuk ? <MapPin size={18} /> : <Send size={18} />} {isMasuk ? 'Asal Surat' : 'Tujuan Surat'}
            </h4>
            <div className="form-group">
              <label>{isMasuk ? 'Dari (Asal)' : 'Kepada (Tujuan)'}</label>
              <input 
                required 
                name={isMasuk ? 'asal' : 'tujuan'} 
                placeholder={isMasuk ? 'Instansi pengirim...' : 'Instansi tujuan...'} 
                value={isMasuk ? formValues.asal : formValues.tujuan} 
                onChange={handleInputChange} 
              />
            </div>
          </div>

          <div className="premium-modal-section">
            <h4 className="premium-section-title"><FileText size={18} /> Isi & Perihal</h4>
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label>Perihal / Tentang</label>
                <input required name="tentang" placeholder="Tentang surat..." value={formValues.tentang} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Ringkasan Isi</label>
                <textarea required name="ringkasan" placeholder="Tuliskan ringkasan isi surat..." value={formValues.ringkasan} onChange={handleInputChange} style={{ minHeight: '120px' }}></textarea>
              </div>
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" className="btn btn-ghost" onClick={resetForm}>Batal</button>
            <button type="submit" className="btn btn-primary"><Save size={18} /> Simpan Data</button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!showDetail}
        onClose={() => setShowDetail(null)}
        title="Detail Korespondensi"
        icon={<FileText size={24} />}
        footer={
          <button className="btn btn-primary" onClick={() => setShowDetail(null)}>Tutup Detail</button>
        }
      >
        {showDetail && (
          <>
            <div className="premium-modal-section">
              <h4 className="premium-section-title"><AlertCircle size={18} /> Metadata Surat</h4>
              <div className="premium-info-grid">
                <div className="premium-info-item">
                  <span className="premium-info-label">Tanggal</span>
                  <span className="premium-info-value">{new Date(showDetail.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="premium-info-item">
                  <span className="premium-info-label">Nomor Surat</span>
                  <span className="premium-info-value"><span className="badge-outline">{showDetail.nomor}</span></span>
                </div>
                <div className="premium-info-item">
                  <span className="premium-info-label">{isMasuk ? 'Asal' : 'Tujuan'}</span>
                  <span className="premium-info-value">{isMasuk ? showDetail.asal : showDetail.tujuan}</span>
                </div>
              </div>
            </div>
            <div className="premium-modal-section">
              <h4 className="premium-section-title"><FileText size={18} /> Deskripsi Masalah / Ringkasan</h4>
              <div className="premium-info-item full" style={{ background: 'var(--background)', color: 'var(--text-main)', fontStyle: 'italic', lineHeight: 1.8 }}>
                <strong>{showDetail.tentang}</strong>
                <p style={{ marginTop: '1rem', fontWeight: 500 }}>{showDetail.ringkasan}</p>
              </div>
            </div>
          </>
        )}
      </Modal>

      <style dangerouslySetInnerHTML={{ __html: `
        .mail-page { display: flex; flex-direction: column; gap: 1rem; }
        .page-header { display: flex; justify-content: space-between; align-items: center; }
        .header-info h1 { font-size: 1.25rem; font-weight: 800; color: var(--text-main); }
        .header-info p { color: var(--text-muted); font-size: 0.8rem; }
        .p-10 { padding: 1.5rem; }
        .toolbar { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1.25rem; gap: 0.75rem; }
        .search-box { flex: 1; display: flex; align-items: center; gap: 0.65rem; background: var(--background); padding: 0.5rem 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border); max-width: 400px; }
        .search-box input { border: none; background: none; outline: none; width: 100%; font-size: 0.85rem; color: var(--text-main); }
        .toolbar-actions { display: flex; align-items: center; gap: 1rem; }
        .icon-btn-outline { padding: 0.5rem; border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--text-muted); transition: all 0.2s; }
        .icon-btn-outline:hover { border-color: var(--primary); color: var(--primary); background: rgba(37, 99, 235, 0.05); }
        .divider { width: 1px; height: 20px; background: var(--border); }
        .total-label { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); }
        .table-responsive { padding: 0; overflow-x: auto; }
        .data-table { width: 100%; border-collapse: separate; border-spacing: 0; text-align: left; }
        .data-table th { 
          padding: 0.85rem 1.25rem; 
          background: var(--background); 
          font-size: 0.7rem; 
          font-weight: 800; 
          text-transform: uppercase; 
          letter-spacing: 0.05em; 
          color: var(--text-muted); 
          border-bottom: 2px solid var(--border); 
        }
        .data-table th svg { vertical-align: middle; margin-bottom: 2px; margin-right: 4px; }
        .data-table td { 
          padding: 0.75rem 1.25rem; 
          font-size: 0.85rem; 
          border-bottom: 1px solid var(--background); 
          color: var(--text-main); 
          vertical-align: middle;
        }
        .data-table tr:hover td { background: rgba(37, 99, 235, 0.02); }
        .font-medium { font-weight: 600; }
        .font-semibold { font-weight: 700; }
        .text-blue { color: var(--primary); }
        .badge-outline { 
          padding: 0.4rem 0.8rem; 
          background: rgba(37, 99, 235, 0.05); 
          border: 1px solid rgba(37, 99, 235, 0.2); 
          border-radius: 8px; 
          font-size: 0.75rem; 
          font-weight: 800; 
          color: var(--primary); 
          text-transform: uppercase;
        }
        .truncate-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; color: var(--text-muted); line-height: 1.6; }
        .icon-btn-ghost:hover { background: rgba(37, 99, 235, 0.08); color: var(--primary); transform: translateY(-2px); }
        .action-group { display: flex; gap: 0.5rem; justify-content: flex-end; }
        .action-group button { 
          width: 32px; height: 32px; 
          border-radius: 8px; 
          display: flex; align-items: center; justify-content: center; 
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); 
          border: 1px solid transparent;
        }
        .icon-btn-view { color: var(--primary); background: rgba(37,99,235,0.08); }
        .icon-btn-view:hover { background: var(--primary); color: white; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(37,99,235,0.2); }
        
        .icon-btn-edit { color: #f59e0b; background: rgba(245,158,11,0.08); }
        .icon-btn-edit:hover { background: #f59e0b; color: white; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(245,158,11,0.2); }
        
        .icon-btn-delete { color: #ef4444; background: rgba(239,68,68,0.08); }
        .icon-btn-delete:hover { background: #ef4444; color: white; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(239,68,68,0.2); }
        @media (max-width: 768px) { .toolbar { flex-direction: column; align-items: stretch; } .search-box { max-width: none; } }
      ` }} />
    </div>
  );
};

export default SuratMenyurat;
