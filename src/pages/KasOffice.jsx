import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Calendar, 
  Tag, 
  CreditCard,
  MoreVertical,
  Search
} from 'lucide-react';
import { db } from '../firebase';
import { ref, onValue, push } from 'firebase/database';

const KasOffice = () => {
  const [filterType, setFilterType] = useState('semua');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const addTransaction = async () => {
    const kasRef = ref(db, 'cashbook');
    const dummy = {
      tanggal: new Date().toISOString().split('T')[0],
      keterangan: 'Entry Contoh Kas',
      tipe: Math.random() > 0.5 ? 'masuk' : 'keluar',
      jumlah: 500000,
      kategori: 'Operasional'
    };
    await push(kasRef, dummy);
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
          <button className="btn btn-primary" onClick={addTransaction}>
            <Plus size={18} />
            <span>Tambah Transaksi</span>
          </button>
        </div>
      </div>

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
                  <td>
                    <button className="icon-btn-ghost"><MoreVertical size={16} /></button>
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
        @media (max-width: 768px) { .toolbar { flex-direction: column; align-items: stretch; } .kas-summary { grid-template-columns: 1fr; } }
      ` }} />
    </div>
  );
};

export default KasOffice;
