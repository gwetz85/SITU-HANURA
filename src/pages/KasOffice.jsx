import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Calendar, 
  Tag, 
  CreditCard,
  MoreVertical,
  Search,
  X,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit2,
  Trash2
} from 'lucide-react';
import { db } from '../firebase';
import { ref, onValue, push, remove, update } from 'firebase/database';

const KasOffice = () => {
  const [filterType, setFilterType] = useState('semua');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    tipe: 'keluar',
    jumlah: '',
    keterangan: '',
    kategori: 'Operasional'
  });
  const [editingId, setEditingId] = useState(null);
  const [showDetail, setShowDetail] = useState(null);

  useEffect(() => {
    const kasRef = ref(db, 'cashbook');
    const unsubscribe = onValue(kasRef, (snapshot) => {
      const items = [];
      snapshot.forEach((child) => {
        items.push({ id: child.key, ...child.val() });
      });
      setTransactions(items.reverse());
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formValues.jumlah || !formValues.keterangan) {
      alert('Mohon isi semua field!');
      return;
    }

    setIsSubmitting(true);
    try {
      const kasRef = ref(db, 'cashbook');
      const transactionData = {
        ...formValues,
        jumlah: parseInt(formValues.jumlah),
        updatedAt: new Date().toISOString()
      };

      if (editingId) {
        await update(ref(db, `cashbook/${editingId}`), transactionData);
        alert('Transaksi berhasil diperbarui!');
        setEditingId(null);
      } else {
        await push(kasRef, { ...transactionData, createdAt: new Date().toISOString() });
        alert('Transaksi berhasil ditambahkan!');
      }
      
      // Reset form
      setFormValues({
        tanggal: new Date().toISOString().split('T')[0],
        tipe: 'keluar',
        jumlah: '',
        keterangan: '',
        kategori: 'Operasional'
      });
      setShowAddForm(false);
    } catch (error) {
      console.error("Error processing transaction:", error);
      alert("Gagal memproses transaksi!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      try {
        await remove(ref(db, `cashbook/${id}`));
        alert('Transaksi berhasil dihapus');
      } catch (error) {
        console.error("Error deleting transaction:", error);
        alert('Gagal menghapus transaksi');
      }
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormValues({
      tanggal: item.tanggal,
      tipe: item.tipe,
      jumlah: item.jumlah,
      keterangan: item.keterangan,
      kategori: item.kategori
    });
    setShowAddForm(true);
  };

  const handleViewDetail = (item) => {
    setShowDetail(item);
  };

  const toggleAddForm = () => {
    if (showAddForm && editingId) {
      setEditingId(null);
      setFormValues({
        tanggal: new Date().toISOString().split('T')[0],
        tipe: 'keluar',
        jumlah: '',
        keterangan: '',
        kategori: 'Operasional'
      });
    }
    setShowAddForm(!showAddForm);
  };

  const filteredTransactions = transactions.filter(t => 
    filterType === 'semua' ? true : t.tipe === filterType
  );

  const totalMasuk = transactions.filter(t => t.tipe === 'masuk').reduce((a, b) => a + b.jumlah, 0);
  const totalKeluar = transactions.filter(t => t.tipe === 'keluar').reduce((a, b) => a + b.jumlah, 0);
  const saldo = totalMasuk - totalKeluar;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="kas-page fadeIn">
      <div className="page-header">
        <div className="header-info">
          <h1>Kas Office Cloud</h1>
          <p>Catat dan pantau arus kas di database cloud secara realtime.</p>
        </div>
        <div className="header-actions">
          <button 
            className={`btn ${showAddForm ? 'btn-secondary' : 'btn-primary'}`} 
            onClick={toggleAddForm}
          >
            {showAddForm ? <X size={18} /> : <Plus size={18} />}
            <span>{showAddForm ? (editingId ? 'Batal Edit' : 'Batal') : 'Tambah Transaksi'}</span>
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="add-transaction-card glass-card fadeIn shadow-lg">
          <div className="card-header">
            <h3>{editingId ? <Edit2 size={20} /> : <Plus size={20} />} {editingId ? 'Edit Transaksi' : 'Form Transaksi Baru'}</h3>
            <p>{editingId ? 'Perbarui detail transaksi yang dipilih.' : 'Silahkan lengkapi detail transaksi di bawah ini.'}</p>
          </div>
          <form className="transaction-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label><Calendar size={14} /> Tanggal Transaksi</label>
                <input 
                  type="date" 
                  name="tanggal"
                  value={formValues.tanggal}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div className="form-group">
                <label><Tag size={14} /> Jenis Transaksi</label>
                <select 
                  name="tipe"
                  value={formValues.tipe}
                  onChange={handleInputChange}
                  required
                >
                  <option value="masuk">Pemasukan (+)</option>
                  <option value="keluar">Pengeluaran (-)</option>
                </select>
              </div>
              <div className="form-group">
                <label><CreditCard size={14} /> Nominal (Rp)</label>
                <input 
                  type="number" 
                  name="jumlah"
                  placeholder="Contoh: 500000"
                  value={formValues.jumlah}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div className="form-group">
                <label><Tag size={14} /> Kategori</label>
                <select 
                  name="kategori"
                  value={formValues.kategori}
                  onChange={handleInputChange}
                >
                  <option value="Operasional">Operasional</option>
                  <option value="Inventaris">Inventaris</option>
                  <option value="Gaji">Gaji & Honor</option>
                  <option value="Lain-lain">Lain-lain</option>
                </select>
              </div>
              <div className="form-group full-width">
                <label><AlertCircle size={14} /> Keterangan</label>
                <textarea 
                  name="keterangan"
                  placeholder="Deskripsi transaksi..."
                  value={formValues.keterangan}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowAddForm(false)}>Batal</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Memproses...' : (
                  <>
                    <Save size={18} />
                    <span>{editingId ? 'Simpan Perubahan' : 'Simpan Transaksi'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="kas-summary">
        <div className="summary-card glass-card">
          <div className="summary-icon in"><ArrowUpCircle size={24} /></div>
          <div className="summary-data">
            <span className="summary-label">Total Pemasukan</span>
            <h2 className="summary-value text-green">{formatCurrency(totalMasuk)}</h2>
          </div>
        </div>
        <div className="summary-card glass-card">
          <div className="summary-icon out"><ArrowDownCircle size={24} /></div>
          <div className="summary-data">
            <span className="summary-label">Total Pengeluaran</span>
            <h2 className="summary-value text-red">{formatCurrency(totalKeluar)}</h2>
          </div>
        </div>
        <div className="summary-card glass-card primary-bg">
          <div className="summary-icon bal"><CreditCard size={24} /></div>
          <div className="summary-data">
            <span className="summary-label">Saldo Aktif</span>
            <h2 className="summary-value">{formatCurrency(saldo)}</h2>
          </div>
        </div>
      </div>

      <div className="toolbar glass-card">
        <div className="filter-tabs">
          {['semua', 'masuk', 'keluar'].map(type => (
            <button 
              key={type}
              className={`filter-tab ${filterType === type ? 'active' : ''}`}
              onClick={() => setFilterType(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
        <div className="search-box">
          <Search size={18} />
          <input type="text" placeholder="Cari transaksi..." />
        </div>
      </div>

      <div className="table-responsive glass-card">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Memuat transaksi...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th><Calendar size={14} /> Tanggal</th>
                <th>Keterangan</th>
                <th><Tag size={14} /> Kategori</th>
                <th>Status</th>
                <th className="text-right">Jumlah</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? filteredTransactions.map((item) => (
                <tr key={item.id}>
                  <td>{new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
                  <td className="font-semibold">{item.keterangan}</td>
                  <td><span className="kategori-tag">{item.kategori}</span></td>
                  <td>
                    <span className={`status-badge ${item.tipe}`}>
                      {item.tipe === 'masuk' ? 'Pemasukan' : 'Pengeluaran'}
                    </span>
                  </td>
                  <td className={`text-right font-bold ${item.tipe === 'masuk' ? 'text-green' : 'text-red'}`}>
                    {item.tipe === 'masuk' ? '+' : '-'} {formatCurrency(item.jumlah)}
                  </td>
                  <td className="actions-cell">
                    <div className="action-group">
                      <button className="icon-btn-view" onClick={() => handleViewDetail(item)} title="Lihat Detail"><Eye size={16} /></button>
                      <button className="icon-btn-edit" onClick={() => handleEdit(item)} title="Edit Transaksi"><Edit2 size={16} /></button>
                      <button className="icon-btn-delete" onClick={() => handleDelete(item.id)} title="Hapus"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Belum ada transaksi di database cloud.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showDetail && (
        <div className="modal-overlay" onClick={() => setShowDetail(null)}>
          <div className="modal-content glass-card fadeIn" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detail Transaksi</h3>
              <button className="close-btn" onClick={() => setShowDetail(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="detail-item">
                <span className="label">Status</span>
                <span className={`status-badge ${showDetail.tipe}`}>
                  {showDetail.tipe === 'masuk' ? 'PEMASUKAN' : 'PENGELUARAN'}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Tanggal</span>
                <span className="value">{new Date(showDetail.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="detail-item">
                <span className="label">Kategori</span>
                <span className="value highlight">{showDetail.kategori}</span>
              </div>
              <div className="detail-item">
                <span className="label">Jumlah</span>
                <span className={`value amount ${showDetail.tipe === 'masuk' ? 'text-green' : 'text-red'}`}>
                  {formatCurrency(showDetail.jumlah)}
                </span>
              </div>
              <div className="detail-item full">
                <span className="label">Keterangan</span>
                <p className="value bio">{showDetail.keterangan || '-'}</p>
              </div>
              {showDetail.createdAt && (
                <div className="detail-item full">
                  <span className="label">Waktu Input</span>
                  <span className="value small-text">{new Date(showDetail.createdAt).toLocaleString('id-ID')}</span>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setShowDetail(null)}>Tutup</button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .kas-page { display: flex; flex-direction: column; gap: 1.5rem; }
        .page-header { display: flex; justify-content: space-between; align-items: center; }
        .header-info h1 { font-size: 1.5rem; font-weight: 800; }
        .header-info p { color: var(--text-muted); font-size: 0.9rem; }
        .kas-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
        .summary-card { display: flex; align-items: center; gap: 1.25rem; }
        .summary-card.primary-bg { background: var(--primary); color: white; border: none; }
        .summary-card.primary-bg .summary-label { color: rgba(255, 255, 255, 0.8); }
        .summary-card.primary-bg .summary-value { color: white; }
        .summary-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .summary-icon.in { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .summary-icon.out { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        .summary-icon.bal { background: rgba(255, 255, 255, 0.2); color: white; }
        .summary-label { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); }
        .summary-value { font-size: 1.4rem; font-weight: 800; margin-top: 2px; }
        .text-green { color: #10b981 !important; }
        .text-red { color: #ef4444 !important; }
        .toolbar { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1.5rem; gap: 1rem; }
        .filter-tabs { display: flex; gap: 0.5rem; }
        .filter-tab { padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; color: var(--text-muted); transition: all 0.2s; }
        .filter-tab.active { background: var(--primary); color: white; }
        .filter-tab:hover:not(.active) { background: var(--background); }
        .kategori-tag { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); background: var(--background); padding: 0.2rem 0.6rem; border-radius: 4px; }
        .status-badge { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; padding: 0.25rem 0.6rem; border-radius: 100px; }
        .status-badge.masuk { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .status-badge.keluar { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        .text-right { text-align: right; }
        .font-bold { font-weight: 800; }
        
        /* Add Transaction Card Styles */
        .add-transaction-card { padding: 1.5rem; border: 1px solid var(--primary); margin-bottom: 0.5rem; }
        .card-header { margin-bottom: 1.5rem; }
        .card-header h3 { display: flex; align-items: center; gap: 0.5rem; font-weight: 700; color: var(--primary); }
        .card-header p { font-size: 0.85rem; color: var(--text-muted); }
        
        .transaction-form .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.25rem; }
        .transaction-form .full-width { grid-column: 1 / -1; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group label { font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; color: var(--text-muted); }
        .form-group input, .form-group select, .form-group textarea { 
          padding: 0.75rem; 
          border-radius: 8px; 
          border: 1px solid var(--border); 
          background: rgba(255,255,255,0.5); 
          font-family: inherit; 
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
          border-color: var(--primary);
          outline: none;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        .form-group textarea { min-height: 80px; resize: vertical; }
        .form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border); }
        .btn-ghost { background: transparent; color: var(--text-muted); }
        .btn-ghost:hover { background: var(--background); color: var(--text-main); }
        .btn-secondary { background: var(--secondary); color: white; }

        .actions-cell { text-align: right; }
        .action-group { display: flex; gap: 0.5rem; justify-content: flex-end; }
        .action-group button { 
          width: 32px; 
          height: 32px; 
          border-radius: 8px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          transition: all 0.2s; 
        }
        .icon-btn-view { color: var(--primary); background: rgba(37, 99, 235, 0.1); }
        .icon-btn-view:hover { background: var(--primary); color: white; }
        .icon-btn-edit { color: var(--accent); background: rgba(245, 158, 11, 0.1); }
        .icon-btn-edit:hover { background: var(--accent); color: white; }
        .icon-btn-delete { color: #ef4444; background: rgba(239, 68, 68, 0.1); }
        .icon-btn-delete:hover { background: #ef4444; color: white; }

        /* Modal Styles */
        .modal-overlay { 
          position: fixed; 
          top: 0; left: 0; right: 0; bottom: 0; 
          background: rgba(0,0,0,0.5); 
          backdrop-filter: blur(4px); 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          z-index: 1000; 
          padding: 1.5rem;
        }
        .modal-content { width: 100%; max-width: 500px; padding: 2rem; border: 1px solid rgba(255,255,255,0.2); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .modal-header h3 { font-size: 1.25rem; font-weight: 700; color: var(--primary); }
        .close-btn { color: var(--text-muted); }
        .close-btn:hover { color: #ef4444; }
        .modal-body { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .modal-body .full { grid-column: 1 / -1; }
        .detail-item { display: flex; flex-direction: column; gap: 0.25rem; }
        .detail-item .label { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
        .detail-item .value { font-size: 1rem; font-weight: 600; }
        .detail-item .value.highlight { color: var(--primary); }
        .detail-item .value.amount { font-size: 1.25rem; font-weight: 800; }
        .detail-item p.value { line-height: 1.6; font-weight: 400; color: var(--text-main); }
        .small-text { font-size: 0.8rem; color: var(--text-muted); }
        .modal-footer { margin-top: 2rem; display: flex; justify-content: flex-end; }

        @media (max-width: 768px) { 
          .toolbar { flex-direction: column; align-items: stretch; } 
          .kas-summary { grid-template-columns: 1fr; } 
          .transaction-form .form-grid { grid-template-columns: 1fr; }
          .modal-body { grid-template-columns: 1fr; }
        }
      ` }} />
    </div>
  );
};

export default KasOffice;
