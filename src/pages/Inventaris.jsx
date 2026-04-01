import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Filter, Package, Calendar, Hash, Tag, 
  Trash2, Edit2, Eye, Save, X, AlertCircle, ExternalLink,
  Info, Box, Layers, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { db } from '../firebase';
import { ref, onValue, push, remove, update } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { logActivity } from '../utils/logging';

const Inventaris = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [filterJenis, setFilterJenis] = useState('Semua');

  const [formValues, setFormValues] = useState({
    jenis: 'Elektronik',
    merek: '',
    kondisi: 'Baik',
    tanggalPembelian: new Date().toISOString().split('T')[0],
    jumlah: 1,
    status: 'Baru',
    catatan: '',
    tautan: ''
  });

  useEffect(() => {
    const invRef = ref(db, 'inventaris');
    const unsubscribe = onValue(invRef, (snapshot) => {
      const data = [];
      snapshot.forEach((child) => {
        data.push({ id: child.key, ...child.val() });
      });
      // Sort by date (newest first)
      data.sort((a, b) => new Date(b.tanggalPembelian) - new Date(a.tanggalPembelian));
      setItems(data);
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
    const invRef = ref(db, 'inventaris');
    const data = { ...formValues, updatedAt: new Date().toISOString() };
    
    try {
      if (editingId) {
        await update(ref(db, `inventaris/${editingId}`), data);
        await logActivity(db, 'Inventaris Kantor', `Mengubah data barang: ${data.merek}`, user);
        alert('Data inventaris berhasil diperbarui');
      } else {
        await push(invRef, { ...data, createdAt: new Date().toISOString() });
        await logActivity(db, 'Inventaris Kantor', `Menambah barang baru: ${data.merek} (${data.jumlah} Unit)`, user);
        alert('Data inventaris berhasil ditambahkan');
      }
      resetForm();
    } catch (error) {
      alert('Gagal menyimpan data');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus data inventaris ini?')) {
      try {
        const itemToDelete = items.find(item => item.id === id);
        await remove(ref(db, `inventaris/${id}`));
        await logActivity(db, 'Inventaris Kantor', `Menghapus data barang: ${itemToDelete?.merek}`, user);
        alert('Data berhasil dihapus');
      } catch (error) {
        alert('Gagal menghapus data');
      }
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormValues({
      jenis: item.jenis,
      merek: item.merek,
      kondisi: item.kondisi,
      tanggalPembelian: item.tanggalPembelian,
      jumlah: item.jumlah,
      status: item.status,
      catatan: item.catatan || '',
      tautan: item.tautan || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormValues({
      jenis: 'Elektronik',
      merek: '',
      kondisi: 'Baik',
      tanggalPembelian: new Date().toISOString().split('T')[0],
      jumlah: 1,
      status: 'Baru',
      catatan: '',
      tautan: ''
    });
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.merek?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.jenis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.status?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterJenis === 'Semua' || item.jenis === filterJenis;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="inventaris-page fadeIn">
      <div className="page-header">
        <div className="header-info">
          <h1>Inventaris Kantor</h1>
          <p>Manajemen aset dan barang inventaris SITU HANURA.</p>
        </div>
        {(user?.role === 'Admin' || user?.role === 'Petugas') && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={18} />
            <span>Tambah Barang</span>
          </button>
        )}
      </div>

      <div className="toolbar glass-card">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Cari merek, jenis, atau status..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="toolbar-actions">
          <div className="filter-group">
            <Filter size={16} />
            <select value={filterJenis} onChange={(e) => setFilterJenis(e.target.value)}>
              <option value="Semua">Semua Jenis</option>
              <option value="Elektronik">Elektronik</option>
              <option value="Bukan Elektronik">Bukan Elektronik</option>
            </select>
          </div>
          <div className="divider"></div>
          <span className="total-label">Total: {items.length} Barang</span>
        </div>
      </div>

      <div className="table-responsive glass-card">
        {loading ? (
          <div className="p-10 text-center text-muted">Memuat data inventaris...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th><Calendar size={14} /> Tanggal Beli</th>
                <th><Package size={14} /> Merek / Nama</th>
                <th><Layers size={14} /> Jenis</th>
                <th><Hash size={14} /> Jumlah</th>
                <th>Kondisi</th>
                <th>Status</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length > 0 ? filteredItems.map((item) => (
                <tr key={item.id}>
                  <td className="font-medium">{new Date(item.tanggalPembelian).toLocaleDateString('id-ID')}</td>
                  <td className="font-bold text-primary">{item.merek}</td>
                  <td><span className="badge-outline">{item.jenis}</span></td>
                  <td><span className="font-bold">{item.jumlah} Unit</span></td>
                  <td>
                    <span className={`status-badge ${item.kondisi === 'Baik' ? 'masuk' : 'keluar'}`}>
                      {item.kondisi === 'Baik' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                      {item.kondisi}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${item.status === 'Baru' ? 'active' : (item.status === 'Seken' ? 'pending' : 'pustaka')}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="action-group" style={{ justifyContent: 'flex-end' }}>
                      <button className="icon-btn-view" onClick={() => setShowDetail(item)} title="Detail"><Eye size={16} /></button>
                      {(user?.role === 'Admin' || user?.role === 'Petugas') && (
                        <>
                          <button className="icon-btn-edit" onClick={() => handleEdit(item)} title="Edit"><Edit2 size={16} /></button>
                          <button className="icon-btn-delete" onClick={() => handleDelete(item.id)} title="Hapus"><Trash2 size={16} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Tidak ada data inventaris ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={resetForm}
        title={editingId ? 'Edit Barang Inventaris' : 'Tambah Barang Inventaris'}
        icon={editingId ? <Edit2 size={24} /> : <Plus size={24} />}
      >
        <form onSubmit={handleSave} className="mail-form">
          <div className="premium-modal-section">
            <h4 className="premium-section-title"><Info size={18} /> Informasi Barang</h4>
            <div className="form-group">
              <label>Merek / Nama Barang</label>
              <input required name="merek" value={formValues.merek} onChange={handleInputChange} placeholder="Contoh: Laptop ASUS ROG / Meja Rapat..." />
            </div>
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.2rem' }}>
              <div className="form-group">
                <label>Jenis Barang</label>
                <select name="jenis" value={formValues.jenis} onChange={handleInputChange}>
                  <option value="Elektronik">Elektronik</option>
                  <option value="Bukan Elektronik">Bukan Elektronik</option>
                </select>
              </div>
              <div className="form-group">
                <label>Jumlah Barang</label>
                <input required type="number" name="jumlah" value={formValues.jumlah} onChange={handleInputChange} min="1" />
              </div>
            </div>
          </div>

          <div className="premium-modal-section">
            <h4 className="premium-section-title"><Calendar size={18} /> Kondisi & Waktu</h4>
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label>Kondisi Barang</label>
                <select name="kondisi" value={formValues.kondisi} onChange={handleInputChange}>
                  <option value="Baik">Baik (Berfungsi)</option>
                  <option value="Rusak">Rusak</option>
                </select>
              </div>
              <div className="form-group">
                <label>Tanggal Pembelian</label>
                <input required type="date" name="tanggalPembelian" value={formValues.tanggalPembelian} onChange={handleInputChange} />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: '1.2rem' }}>
              <label>Status Barang</label>
              <select name="status" value={formValues.status} onChange={handleInputChange}>
                <option value="Baru">Baru</option>
                <option value="Seken">Seken</option>
                <option value="Inventaris Lama">Inventaris Lama</option>
              </select>
            </div>
          </div>

          <div className="premium-modal-section">
            <h4 className="premium-section-title"><Tag size={18} /> Detail Tambahan</h4>
            <div className="form-group">
              <label>Tautan Nota / Foto (Google Drive/Lainnya)</label>
              <input name="tautan" value={formValues.tautan} onChange={handleInputChange} placeholder="https://drive.google.com/..." />
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Opsional: Tempelkan link file dokumen pendukung.</p>
            </div>
            <div className="form-group" style={{ marginTop: '1.2rem' }}>
              <label>Catatan Tambahan</label>
              <textarea name="catatan" value={formValues.catatan} onChange={handleInputChange} style={{ minHeight: '80px' }} placeholder="Keterangan lainnya tentang barang ini..."></textarea>
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" className="btn btn-ghost" onClick={resetForm}>Batal</button>
            <button type="submit" className="btn btn-primary"><Save size={18} /> Simpan Data</button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={!!showDetail}
        onClose={() => setShowDetail(null)}
        title="Detail Barang Inventaris"
        icon={<Box size={24} />}
        footer={<button className="btn btn-primary" onClick={() => setShowDetail(null)}>Tutup Detail</button>}
      >
        {showDetail && (
          <>
            <div className="premium-modal-section">
              <h4 className="premium-section-title"><Info size={18} /> Spesifikasi Utama</h4>
              <div className="premium-info-grid">
                <div className="premium-info-item">
                  <span className="premium-info-label">Merek / Nama</span>
                  <span className="premium-info-value" style={{ color: 'var(--primary)', fontWeight: 800 }}>{showDetail.merek}</span>
                </div>
                <div className="premium-info-item">
                  <span className="premium-info-label">Jenis</span>
                  <span className="premium-info-value"><span className="badge-outline">{showDetail.jenis}</span></span>
                </div>
                <div className="premium-info-item">
                  <span className="premium-info-label">Jumlah</span>
                  <span className="premium-info-value" style={{ fontWeight: 700 }}>{showDetail.jumlah} Unit</span>
                </div>
              </div>
            </div>

            <div className="premium-modal-section">
              <h4 className="premium-section-title"><Calendar size={18} /> Riwayat & Kondisi</h4>
              <div className="premium-info-grid">
                <div className="premium-info-item">
                  <span className="premium-info-label">Tanggal Beli</span>
                  <span className="premium-info-value">{new Date(showDetail.tanggalPembelian).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="premium-info-item">
                  <span className="premium-info-label">Kondisi</span>
                  <span className={`status-badge ${showDetail.kondisi === 'Baik' ? 'masuk' : 'keluar'}`}>{showDetail.kondisi}</span>
                </div>
                <div className="premium-info-item">
                  <span className="premium-info-label">Status Awal</span>
                  <span className="premium-info-value font-bold">{showDetail.status}</span>
                </div>
              </div>
            </div>

            <div className="premium-modal-section">
              <h4 className="premium-section-title"><AlertCircle size={18} /> Catatan & Berkas</h4>
              <div className="premium-info-item full" style={{ background: 'var(--background)', padding: '1rem', borderRadius: '12px' }}>
                <span className="premium-info-label">Keterangan Petugas</span>
                <p style={{ marginTop: '0.5rem', color: 'var(--text-main)', fontStyle: 'italic' }}>{showDetail.catatan || 'Tidak ada catatan.'}</p>
              </div>
              {showDetail.tautan && (
                <a 
                  href={showDetail.tautan} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-primary" 
                  style={{ marginTop: '1.2rem', width: '100%', justifyContent: 'center' }}
                >
                  <ExternalLink size={18} />
                  <span>Lihat Nota / Foto Barang</span>
                </a>
              )}
            </div>
          </>
        )}
      </Modal>

      <style dangerouslySetInnerHTML={{ __html: `
        .inventaris-page { display: flex; flex-direction: column; gap: 1rem; }
        .page-header { display: flex; justify-content: space-between; align-items: center; }
        .header-info h1 { font-size: 1.25rem; font-weight: 800; color: var(--text-main); }
        .header-info p { color: var(--text-muted); font-size: 0.8rem; }
        
        .toolbar { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1.25rem; gap: 0.75rem; }
        .search-box { flex: 1; display: flex; align-items: center; gap: 0.65rem; background: var(--background); padding: 0.5rem 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border); max-width: 400px; }
        .search-box input { border: none; background: none; outline: none; width: 100%; font-size: 0.85rem; color: var(--text-main); }
        
        .filter-group { display: flex; align-items: center; gap: 0.5rem; color: var(--text-muted); }
        .filter-group select { border: none; background: none; font-weight: 700; color: var(--primary); font-size: 0.85rem; cursor: pointer; outline: none; }
        
        .toolbar-actions { display: flex; align-items: center; gap: 1rem; }
        .divider { width: 1px; height: 20px; background: var(--border); }
        .total-label { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); }
        
        .status-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 6px; font-weight: 800; font-size: 0.7rem; text-transform: uppercase; }
        .status-badge.masuk { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .status-badge.keluar { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        .status-badge.active { background: rgba(37, 99, 235, 0.1); color: var(--primary); }
        .status-badge.pending { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .status-badge.pustaka { background: rgba(99, 102, 241, 0.1); color: #6366f1; }
        
        .text-right { text-align: right; }
        .p-10 { padding: 1.5rem; }

        /* Table & Layout Fixes */
        .table-responsive { padding: 0 !important; overflow-x: auto; background: var(--surface); border-radius: var(--radius-lg); }
        .data-table { width: 100%; border-collapse: separate; border-spacing: 0; text-align: left; }
        .data-table th { 
          padding: 1rem 1.25rem; 
          background: var(--background); 
          font-size: 0.75rem; 
          font-weight: 800; 
          text-transform: uppercase; 
          letter-spacing: 0.05em; 
          color: var(--text-muted); 
          border-bottom: 2px solid var(--border); 
          white-space: nowrap;
        }
        .data-table th svg { 
          vertical-align: middle; 
          margin-bottom: 2px; 
          margin-right: 8px; /* Extra spacing for icon */
          color: var(--primary);
        }
        .data-table td { 
          padding: 0.85rem 1.25rem; 
          font-size: 0.85rem; 
          border-bottom: 1px solid var(--border); 
          color: var(--text-main); 
          vertical-align: middle;
        }
        .data-table tr:hover td { background: rgba(37, 99, 235, 0.02); }
        
        .action-group { display: flex; gap: 0.65rem; }
        
        @media (max-width: 768px) {
          .toolbar { flex-direction: column; align-items: stretch; }
          .search-box { max-width: none; }
          .toolbar-actions { justify-content: space-between; }
        }
      ` }} />
    </div>
  );
};

export default Inventaris;
