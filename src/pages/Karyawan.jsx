import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Wallet, 
  Receipt, 
  Search, 
  Plus, 
  Printer, 
  MoreVertical,
  Building,
  CheckCircle2
} from 'lucide-react';
import { db } from '../firebase';
import { ref, onValue, push } from 'firebase/database';

const Karyawan = () => {
  const [activeTab, setActiveTab] = useState('data');
  const [karyawanData, setKaryawanData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const empRef = ref(db, 'employees');
    const unsubscribe = onValue(empRef, (snapshot) => {
      const items = [];
      snapshot.forEach((child) => {
        items.push({ id: child.key, ...child.val() });
      });
      setKaryawanData(items);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const addEmployee = async () => {
    const empRef = ref(db, 'employees');
    const dummy = {
      nama: 'KARYAWAN BARU',
      jabatan: 'STAFF HANURA',
      gaji: 1500000,
      kasbon: 0,
      rekening: 'BNI 123456789'
    };
    await push(empRef, dummy);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="karyawan-page fadeIn">
      <div className="page-header">
        <div className="header-info">
          <h1>Pusat Data Karyawan (Cloud)</h1>
          <p>Kelola SDM, Kasbon, dan Penggajian yang tersinkronisasi di database cloud.</p>
        </div>
        <button className="btn btn-primary" onClick={addEmployee}>
          <Plus size={18} />
          <span>Tambah Karyawan</span>
        </button>
      </div>

      <div className="tab-navigation glass-card">
        <button className={`tab-btn ${activeTab === 'data' ? 'active' : ''}`} onClick={() => setActiveTab('data')}>
          <Users size={18} /> <span>Data Karyawan</span>
        </button>
        <button className={`tab-btn ${activeTab === 'kasbon' ? 'active' : ''}`} onClick={() => setActiveTab('kasbon')}>
          <Wallet size={18} /> <span>Kasbon</span>
        </button>
        <button className={`tab-btn ${activeTab === 'gaji' ? 'active' : ''}`} onClick={() => setActiveTab('gaji')}>
          <Receipt size={18} /> <span>Slip Gaji</span>
        </button>
      </div>

      <div className="tab-content">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Menghubungkan data karyawan...</div>
        ) : (
          activeTab === 'data' && (
            <div className="data-tab animate-slide-up">
              <div className="toolbar glass-card">
                <div className="search-box">
                  <Search size={18} />
                  <input type="text" placeholder="Cari nama atau jabatan..." />
                </div>
              </div>
              <div className="table-responsive glass-card">
                <table className="data-table">
                  <thead>
                    <tr><th>Nama & Jabatan</th><th>Outstanding Kasbon</th><th>Gaji Pokok</th><th>Rekening</th><th>Aksi</th></tr>
                  </thead>
                  <tbody>
                    {karyawanData.length > 0 ? karyawanData.map((k) => (
                      <tr key={k.id}>
                        <td>
                          <div className="name-cell">
                            <span className="font-bold text-primary">{k.nama}</span>
                            <span className="text-muted flex items-center gap-1" style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                              <Building size={12} /> {k.jabatan}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={`kasbon-badge ${k.kasbon > 0 ? 'warning' : 'success'}`}>
                            {formatCurrency(k.kasbon || 0)}
                          </span>
                        </td>
                        <td className="font-semibold">{formatCurrency(k.gaji)}</td>
                        <td>
                          <div className="bank-info">
                            <span className="bank-name">{k.rekening?.split(' ')[0]}</span>
                            <span className="bank-number">{k.rekening?.split(' ')[1]}</span>
                          </div>
                        </td>
                        <td><button className="icon-btn-ghost"><MoreVertical size={16} /></button></td>
                      </tr>
                    )) : (
                      <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Belum ada data karyawan di cloud.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
        {/* Simplified other tabs for cloud sync demo */}
        {activeTab === 'kasbon' && <div className="p-10 text-center glass-card">Fitur Kasbon tersinkronisasi otomatis dengan node 'employees/kasbon'.</div>}
        {activeTab === 'gaji' && <div className="p-10 text-center glass-card">Penghitungan Slip Gaji menggunakan data realtime dari database cloud.</div>}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .karyawan-page { display: flex; flex-direction: column; gap: 1.5rem; }
        .page-header { display: flex; justify-content: space-between; align-items: center; }
        .tab-navigation { display: flex; gap: 1rem; padding: 0.75rem 1.5rem; }
        .tab-btn { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.25rem; border-radius: var(--radius-md); font-weight: 600; color: var(--text-muted); transition: all 0.2s; }
        .tab-btn:hover { background: var(--background); }
        .tab-btn.active { background: var(--primary); color: white; box-shadow: 0 4px 12px rgba(37,99,235,0.2); }
        .name-cell { display: flex; flex-direction: column; }
        .text-primary { color: var(--primary); }
        .text-muted { color: var(--text-muted); }
        .font-bold { font-weight: 700; }
        .kasbon-badge { padding: 0.3rem 0.7rem; border-radius: 100px; font-size: 0.75rem; font-weight: 800; }
        .kasbon-badge.success { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .kasbon-badge.warning { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        .bank-info { display: flex; flex-direction: column; }
        .bank-name { font-size: 0.7rem; font-weight: 800; color: var(--text-muted); }
        .bank-number { font-size: 0.85rem; font-weight: 500; font-family: monospace; }
        .p-10 { padding: 2.5rem; }
        @media (max-width: 768px) { .tab-navigation { flex-direction: column; } }
      ` }} />
    </div>
  );
};

export default Karyawan;
