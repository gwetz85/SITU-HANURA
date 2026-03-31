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
  Trash2,
  Clock,
  Briefcase,
  FileText,
  Wallet
} from 'lucide-react';
import { db } from '../firebase';
import { ref, onValue, push, remove, update } from 'firebase/database';
import Modal from '../components/Modal';

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
        <div className="add-transaction-card glass fadeIn shadow-lg">
          <div className="card-header border-b">
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

      <Modal
        isOpen={!!showDetail}
        onClose={() => setShowDetail(null)}
        title="Detail Transaksi Kas"
        icon={<Wallet size={24} />}
        footer={
          <button className="btn btn-primary" onClick={() => setShowDetail(null)}>
            Tutup
          </button>
        }
      >
        {showDetail && (
          <>
            <div className="premium-modal-section">
              <h4 className="premium-section-title">
                <FileText size={18} /> Ringkasan Transaksi
              </h4>
              <div className="premium-info-grid">
                <div className="premium-info-item">
                  <span className="premium-info-label">Jenis</span>
                  <span className={`premium-info-value status-badge ${showDetail.tipe}`}>
                    {showDetail.tipe === 'masuk' ? 'PEMASUKAN (+)' : 'PENGELUARAN (-)'}
                  </span>
                </div>
                <div className="premium-info-item">
                  <span className="premium-info-label">Kategori</span>
                  <span className="premium-info-value">{showDetail.kategori}</span>
                </div>
                <div className="premium-info-item">
                  <span className="premium-info-label">Nominal</span>
                  <span className={`premium-info-value amount ${showDetail.tipe === 'masuk' ? 'text-green' : 'text-red'}`} style={{ fontSize: '1.5rem' }}>
                    {formatCurrency(showDetail.jumlah)}
                  </span>
                </div>
              </div>
            </div>

            <div className="premium-modal-section">
              <h4 className="premium-section-title">
                <Calendar size={18} /> Waktu & Deskripsi
              </h4>
              <div className="premium-info-grid">
                <div className="premium-info-item">
                  <span className="premium-info-label">Tanggal Transaksi</span>
                  <span className="premium-info-value">
                    {new Date(showDetail.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <div className="premium-info-item">
                  <span className="premium-info-label">Waktu Input Sistem</span>
                  <span className="premium-info-value">
                    {showDetail.createdAt ? new Date(showDetail.createdAt).toLocaleString('id-ID') : '-'}
                  </span>
                </div>
                <div className="premium-info-item full">
                  <span className="premium-info-label">Keterangan / Catatan</span>
                  <span className="premium-info-value" style={{ fontWeight: 500, lineHeight: 1.6 }}>{showDetail.keterangan || '-'}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </Modal>

      <style dangerouslySetInnerHTML={{ __html: `
        .kas-page { display: flex; flex-direction: column; gap: 1rem; }
        .page-header { display: flex; justify-content: space-between; align-items: center; }
        .header-info h1 { font-size: 1.25rem; font-weight: 800; }
        .header-info p { color: var(--text-muted); font-size: 0.8rem; }
        .kas-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; }
        .summary-card { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.25rem; }
        .summary-card.primary-bg { background: var(--primary); color: white; border: none; }
        .summary-card.primary-bg .summary-label { color: rgba(255, 255, 255, 0.8); }
        .summary-card.primary-bg .summary-value { color: white; }
        .summary-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .summary-icon.in { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .summary-icon.out { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        .summary-icon.bal { background: rgba(255, 255, 255, 0.2); color: white; }
        .summary-label { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); }
        .summary-value { font-size: 1.2rem; font-weight: 800; margin-top: 2px; }
        .text-green { color: #10b981 !important; }
        .text-red { color: #ef4444 !important; }
        .toolbar { display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 1.25rem; gap: 0.75rem; }
        .filter-tabs { display: flex; gap: 0.5rem; }
        .filter-tab { padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; color: var(--text-muted); transition: all 0.2s; }
        .filter-tab.active { background: var(--primary); color: white; }
        .filter-tab:hover:not(.active) { background: var(--background); }
        .status-badge { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; padding: 0.4rem 0.8rem; border-radius: 100px; display: inline-flex; align-items: center; justify-content: center; }
        .status-badge.masuk { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .status-badge.keluar { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        .text-right { text-align: right; }
        .font-bold { font-weight: 800; }

        .data-table { width: 100%; border-collapse: separate; border-spacing: 0; }
        .data-table th { 
          padding: 0.85rem 1rem; 
          text-align: left; 
          font-size: 0.7rem; 
          font-weight: 800; 
          text-transform: uppercase; 
          letter-spacing: 0.05em; 
          color: var(--text-muted);
          border-bottom: 2px solid var(--background);
        }
        .data-table td { 
          padding: 0.75rem 1rem; 
          vertical-align: middle; 
          border-bottom: 1px solid var(--background);
          transition: all 0.2s;
          font-size: 0.85rem;
        }
        .data-table tr:last-child td { border-bottom: none; }
        .data-table tr:hover td { background: rgba(37, 99, 235, 0.02); }
        
        /* Clear View Updates */
        .add-transaction-card { width: 100%; border: 1px solid var(--border); margin-bottom: 1.5rem; padding: 1.25rem 1.5rem; }
        .card-header { margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; }
        .border-b { border-bottom: 1px solid var(--border); padding-bottom: 1.5rem; margin-bottom: 2rem; }
        
        .transaction-form .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; }
        .transaction-form .full-width { grid-column: 1 / -1; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group textarea { min-height: 100px; resize: vertical; }
        .form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border); }
        .btn-ghost { background: transparent; color: var(--text-muted); font-weight: 600; }
        .btn-ghost:hover { background: #f1f5f9; color: var(--text-main); }
        .btn-secondary { background: var(--secondary); color: white; }

        .actions-cell { text-align: right; }
        .action-group { display: flex; gap: 0.5rem; justify-content: flex-end; }
        .action-group button { 
          width: 32px; height: 32px; 
          border-radius: 8px; 
          display: flex; align-items: center; justify-content: center; 
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); 
          border: 1px solid transparent;
        }
        .icon-btn-view { color: var(--primary); background: rgba(37, 99, 235, 0.08); }
        .icon-btn-view:hover { background: var(--primary); color: white; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }
        
        .icon-btn-edit { color: var(--accent); background: rgba(245, 158, 11, 0.08); }
        .icon-btn-edit:hover { background: var(--accent); color: white; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2); }
        
        .icon-btn-delete { color: #ef4444; background: rgba(239, 68, 68, 0.08); }
        .icon-btn-delete:hover { background: #ef4444; color: white; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2); }

        /* Modal Styles */
        .modal-overlay { 
          position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
          background: rgba(15, 23, 42, 0.65); 
          backdrop-filter: blur(10px); 
          display: flex; align-items: center; justify-content: center; 
          z-index: 1000; padding: 1.5rem;
        }
        .modal-content { width: 100%; max-width: 550px; padding: 2.5rem; border: 1px solid var(--border); box-shadow: var(--shadow-lg); }
        .modal-header h3 { font-size: 1.4rem; font-weight: 800; color: var(--primary); }
        .close-btn { color: var(--text-muted); padding: 8px; border-radius: 50%; transition: all 0.2s; }
        .close-btn:hover { background: #fee2e2; color: #ef4444; }
        .modal-body { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
        .modal-body .full { grid-column: 1 / -1; }
        .detail-item { display: flex; flex-direction: column; gap: 0.5rem; }
        .detail-item .label { font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
        .detail-item .value { font-size: 1.1rem; font-weight: 700; color: var(--text-main); }
        .detail-item .value.highlight { color: var(--primary); }
        .detail-item .value.amount { font-size: 1.5rem; font-weight: 900; }
        .detail-item p.value { line-height: 1.7; font-weight: 500; color: var(--text-main); background: #f8fafc; padding: 1rem; border-radius: 12px; border: 1px solid var(--border); }
        .small-text { font-size: 0.85rem; color: var(--text-muted); }
        .modal-footer { margin-top: 2.5rem; display: flex; justify-content: flex-end; padding-top: 1.5rem; border-top: 1px solid var(--border); }

        @media (max-width: 768px) { 
          .toolbar { flex-direction: column; align-items: stretch; } 
          .kas-summary { grid-template-columns: 1fr; } 
          .transaction-form .form-grid { grid-template-columns: 1fr; }
          .modal-body { grid-template-columns: 1fr; gap: 1.5rem; }
        }
      ` }} />
    </div>
  );
};

export default KasOffice;
