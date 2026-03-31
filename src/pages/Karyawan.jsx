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
  CheckCircle2,
  X,
  Trash2,
  Edit2,
  Eye,
  Banknote,
  Smartphone,
  CreditCard,
  Calendar,
  AlertCircle,
  Clock,
  Save
} from 'lucide-react';
import { db } from '../firebase';
import { ref, onValue, push, remove, update } from 'firebase/database';

const Karyawan = () => {
  const [activeTab, setActiveTab] = useState('data');
  const [employees, setEmployees] = useState([]);
  const [kasbonList, setKasbonList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEmpForm, setShowEmpForm] = useState(false);
  const [showKasbonForm, setShowKasbonForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [empForm, setEmpForm] = useState({
    nama: '', jabatan: '', nik: '', ponsel: '', bank: 'BNI', norek: '', gaji: ''
  });
  const [kasbonForm, setKasbonForm] = useState({
    employeeId: '', tanggal: new Date().toISOString().split('T')[0], jumlah: ''
  });
  const [viewingDetail, setViewingDetail] = useState(null);

  useEffect(() => {
    const empRef = ref(db, 'employees');
    const kasbonRef = ref(db, 'kasbon');

    const unsubEmp = onValue(empRef, (snapshot) => {
      const items = [];
      snapshot.forEach((child) => {
        items.push({ id: child.key, ...child.val() });
      });
      setEmployees(items);
      setLoading(false);
    });

    const unsubKasbon = onValue(kasbonRef, (snapshot) => {
      const items = [];
      snapshot.forEach((child) => {
        items.push({ id: child.key, ...child.val() });
      });
      setKasbonList(items);
    });

    return () => { unsubEmp(); unsubKasbon(); };
  }, []);

  const handleEmpSubmit = async (e) => {
    e.preventDefault();
    const data = { ...empForm, gaji: parseInt(empForm.gaji || 0), createdAt: new Date().toISOString() };
    try {
      if (editingId) {
        await update(ref(db, `employees/${editingId}`), data);
        alert('Data Karyawan berhasil diperbarui');
      } else {
        await push(ref(db, 'employees'), data);
        alert('Karyawan Baru berhasil ditambahkan');
      }
      resetEmpForm();
    } catch (err) { alert('Terjadi kesalahan'); }
  };

  const resetEmpForm = () => {
    setEmpForm({ nama: '', jabatan: '', nik: '', ponsel: '', bank: 'BNI', norek: '', gaji: '' });
    setEditingId(null);
    setShowEmpForm(false);
  };

  const handleEditEmp = (emp) => {
    setEditingId(emp.id);
    setEmpForm({
      nama: emp.nama, jabatan: emp.jabatan, nik: emp.nik, 
      ponsel: emp.ponsel, bank: emp.bank, norek: emp.norek, gaji: emp.gaji
    });
    setShowEmpForm(true);
  };

  const handleDeleteEmp = async (id) => {
    if (window.confirm('Hapus data karyawan ini?')) {
      await remove(ref(db, `employees/${id}`));
    }
  };

  const handleKasbonSubmit = async (e) => {
    e.preventDefault();
    if (!kasbonForm.employeeId) return alert('Pilih Karyawan!');
    const emp = employees.find(e => e.id === kasbonForm.employeeId);
    const data = { 
      ...kasbonForm, 
      nama: emp.nama,
      jumlah: parseInt(kasbonForm.jumlah || 0), 
      createdAt: new Date().toISOString() 
    };
    await push(ref(db, 'kasbon'), data);
    alert('Kasbon berhasil dicatat');
    setKasbonForm({ employeeId: '', tanggal: new Date().toISOString().split('T')[0], jumlah: '' });
    setShowKasbonForm(false);
  };

  const getOutstandingKasbon = (empId) => {
    return kasbonList.filter(k => k.employeeId === empId).reduce((a, b) => a + b.jumlah, 0);
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
        <button className="btn btn-primary" onClick={() => setShowEmpForm(true)}>
          <Plus size={18} />
          <span>Tambah Karyawan</span>
        </button>
      </div>

      {showEmpForm && (
        <div className="form-modal-overlay">
          <div className="form-card glass fadeIn">
            <div className="card-header border-b">
              <h3>{editingId ? <Edit2 size={20} /> : <Plus size={20} />} {editingId ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}</h3>
              <button className="close-btn" onClick={resetEmpForm}><X size={20} /></button>
            </div>
            <form onSubmit={handleEmpSubmit} className="emp-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Nama Lengkap</label>
                  <input required value={empForm.nama} onChange={e => setEmpForm({...empForm, nama: e.target.value})} placeholder="Contoh: Budi Santoso" />
                </div>
                <div className="form-group">
                  <label>Jabatan</label>
                  <input required value={empForm.jabatan} onChange={e => setEmpForm({...empForm, jabatan: e.target.value})} placeholder="Contoh: Admin Staff" />
                </div>
                <div className="form-group">
                  <label>NIK</label>
                  <input required value={empForm.nik} onChange={e => setEmpForm({...empForm, nik: e.target.value})} placeholder="16 Digit NIK" />
                </div>
                <div className="form-group">
                  <label>Nomor Ponsel</label>
                  <input required value={empForm.ponsel} onChange={e => setEmpForm({...empForm, ponsel: e.target.value})} placeholder="081xxx" />
                </div>
                <div className="form-group">
                  <label>Bank</label>
                  <select value={empForm.bank} onChange={e => setEmpForm({...empForm, bank: e.target.value})}>
                    <option value="BNI">BNI</option>
                    <option value="BCA">BCA</option>
                    <option value="Mandiri">Mandiri</option>
                    <option value="BRI">BRI</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Nomor Rekening</label>
                  <input required value={empForm.norek} onChange={e => setEmpForm({...empForm, norek: e.target.value})} placeholder="Nomor Rekening" />
                </div>
                <div className="form-group full-width">
                  <label>Gaji Pokok (Rp)</label>
                  <input required type="number" value={empForm.gaji} onChange={e => setEmpForm({...empForm, gaji: e.target.value})} placeholder="Contoh: 3000000" />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-ghost" onClick={resetEmpForm}>Batal</button>
                <button type="submit" className="btn btn-primary"><Save size={18} /> Simpan Data</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                    <tr><th>Nama & Jabatan</th><th>Outstanding Kasbon</th><th>Gaji Pokok</th><th>Rekening</th><th className="text-right">Aksi</th></tr>
                  </thead>
                  <tbody>
                    {employees.length > 0 ? employees.map((k) => (
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
                          <span className={`kasbon-badge ${getOutstandingKasbon(k.id) > 0 ? 'warning' : 'success'}`}>
                            {formatCurrency(getOutstandingKasbon(k.id))}
                          </span>
                        </td>
                        <td className="font-semibold">{formatCurrency(k.gaji)}</td>
                        <td>
                          <div className="bank-info">
                            <span className="bank-name">{k.bank}</span>
                            <span className="bank-number">{k.norek}</span>
                          </div>
                        </td>
                        <td className="text-right">
                          <div className="action-group">
                            <button className="icon-btn-view" onClick={() => setViewingDetail(k)}><Eye size={16} /></button>
                            <button className="icon-btn-edit" onClick={() => handleEditEmp(k)}><Edit2 size={16} /></button>
                            <button className="icon-btn-delete" onClick={() => handleDeleteEmp(k.id)}><Trash2 size={16} /></button>
                          </div>
                        </td>
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
        {activeTab === 'kasbon' && (
          <div className="kasbon-tab animate-slide-up">
            <div className="toolbar glass-card" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3>History Kasbon</h3>
              <button className="btn btn-primary" onClick={() => setShowKasbonForm(true)}><Plus size={18} /> Tambah Kasbon</button>
            </div>
            
            {showKasbonForm && (
              <div className="form-modal-overlay">
                <div className="form-card glass fadeIn" style={{ maxWidth: '450px' }}>
                  <div className="card-header border-b">
                    <h3>Tambah Entry Kasbon</h3>
                    <button className="close-btn" onClick={() => setShowKasbonForm(false)}><X size={20} /></button>
                  </div>
                  <form onSubmit={handleKasbonSubmit} className="emp-form">
                    <div className="form-group">
                      <label>Pilih Karyawan</label>
                      <select required value={kasbonForm.employeeId} onChange={e => setKasbonForm({...kasbonForm, employeeId: e.target.value})}>
                        <option value="">-- Pilih Karyawan --</option>
                        {employees.map(e => <option key={e.id} value={e.id}>{e.nama} - {e.jabatan}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Tanggal</label>
                      <input required type="date" value={kasbonForm.tanggal} onChange={e => setKasbonForm({...kasbonForm, tanggal: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Jumlah Kasbon (Rp)</label>
                      <input required type="number" value={kasbonForm.jumlah} onChange={e => setKasbonForm({...kasbonForm, jumlah: e.target.value})} />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary w-full">Simpan Kasbon</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="table-responsive glass-card">
              <table className="data-table">
                <thead>
                  <tr><th>Nama Karyawan</th><th>Tanggal</th><th>Jumlah</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {kasbonList.length > 0 ? kasbonList.map(k => (
                     <tr key={k.id}>
                       <td className="font-bold">{k.nama}</td>
                       <td>{new Date(k.tanggal).toLocaleDateString('id-ID')}</td>
                       <td className="text-red font-bold">{formatCurrency(k.jumlah)}</td>
                       <td><span className="status-badge warning">PENDING DEDUCTION</span></td>
                     </tr>
                  )) : (
                    <tr><td colSpan="4" className="text-center p-10 text-muted">Belum ada history kasbon.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'gaji' && (
          <div className="gaji-tab animate-slide-up">
            <div className="summary-banner glass-card primary-bg" style={{ marginBottom: '1.5rem', background: 'var(--primary)', color: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Clock size={32} />
                <div>
                  <h3 style={{ margin: 0 }}>Periode Slip Gaji: {new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })}</h3>
                  <p style={{ opacity: 0.8, fontSize: '0.85rem' }}>Dihitung otomatis berdasarkan data karyawan dan history kasbon bulan ini.</p>
                </div>
              </div>
            </div>
            
            <div className="table-responsive glass-card">
              <table className="data-table">
                <thead>
                  <tr><th>Karyawan</th><th>Gaji Pokok</th><th>Total Kasbon</th><th className="text-right">Take Home Pay</th></tr>
                </thead>
                <tbody>
                  {employees.map(e => {
                    const totalKasbon = getOutstandingKasbon(e.id);
                    const takeHomePay = e.gaji - totalKasbon;
                    return (
                      <tr key={e.id}>
                        <td>
                          <div className="name-cell">
                            <span className="font-bold">{e.nama}</span>
                            <span className="text-muted" style={{ fontSize: '0.7rem' }}>{e.jabatan}</span>
                          </div>
                        </td>
                        <td>{formatCurrency(e.gaji)}</td>
                        <td className="text-red">-{formatCurrency(totalKasbon)}</td>
                        <td className="text-right">
                          <span className="font-bold" style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>{formatCurrency(takeHomePay)}</span>
                          <button className="icon-btn-ghost ml-2" title="Cetak Slip"><Printer size={16} /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {viewingDetail && (
        <div className="form-modal-overlay" onClick={() => setViewingDetail(null)}>
          <div className="form-card glass fadeIn" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="card-header border-b">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="profile-img-stub"><Users /></div>
                <div>
                  <h3 style={{ margin: 0 }}>{viewingDetail.nama}</h3>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{viewingDetail.jabatan}</p>
                </div>
              </div>
              <button className="close-btn" onClick={() => setViewingDetail(null)}><X size={20} /></button>
            </div>
            <div className="modal-body-grid">
               <div className="info-item">
                  <label><AlertCircle size={14} /> NIK</label>
                  <span>{viewingDetail.nik}</span>
               </div>
               <div className="info-item">
                  <label><Smartphone size={14} /> Nomor Ponsel</label>
                  <span>{viewingDetail.ponsel}</span>
               </div>
               <div className="info-item">
                  <label><CreditCard size={14} /> Bank & Rekening</label>
                  <span>{viewingDetail.bank} - {viewingDetail.norek}</span>
               </div>
               <div className="info-item">
                  <label><Banknote size={14} /> Gaji Pokok</label>
                  <span className="text-primary font-bold">{formatCurrency(viewingDetail.gaji)}</span>
               </div>
               <div className="info-item full">
                  <label><Clock size={14} /> Tanggal Bergabung</label>
                  <span>{new Date(viewingDetail.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
               </div>
            </div>
            <div className="modal-footer border-t">
              <button className="btn btn-primary" onClick={() => setViewingDetail(null)}>Tutup Detail</button>
            </div>
          </div>
        </div>
      )}

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
        
        /* New UI Elements */
        .form-modal-overlay { 
          position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
          background: rgba(15, 23, 42, 0.6); 
          backdrop-filter: blur(8px); 
          display: flex; align-items: center; justify-content: center; 
          z-index: 1000; padding: 1.5rem; 
        }
        .form-card { width: 100%; border: 1px solid var(--border); }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .border-b { border-bottom: 1px solid var(--border); padding-bottom: 1.5rem; }
        .border-t { border-top: 1px solid var(--border); padding-top: 1.5rem; }
        .close-btn { color: var(--text-muted); padding: 8px; border-radius: 50%; transition: all 0.2s; }
        .close-btn:hover { background: #fee2e2; color: #ef4444; }
        .emp-form .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .emp-form .full-width { grid-column: 1 / -1; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border); }
        .w-full { width: 100%; }
        .ml-2 { margin-left: 0.5rem; }
        .action-group { display: flex; gap: 0.5rem; justify-content: flex-end; }
        .action-group button { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .icon-btn-view { color: var(--primary); background: rgba(37,99,235,0.1); }
        .icon-btn-view:hover { background: var(--primary); color: white; }
        .icon-btn-edit { color: #f59e0b; background: rgba(245,158,11,0.1); }
        .icon-btn-edit:hover { background: #f59e0b; color: white; }
        .icon-btn-delete { color: #ef4444; background: rgba(239,68,68,0.1); }
        .icon-btn-delete:hover { background: #ef4444; color: white; }
        
        .modal-body-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; padding: 2rem 0; }
        .info-item { display: flex; flex-direction: column; gap: 0.5rem; }
        .info-item label { color: var(--text-muted); font-size: 0.8rem; font-weight: 600; text-transform: uppercase; display: flex; align-items: center; gap: 0.5rem; }
        .info-item span { font-size: 1.1rem; font-weight: 600; }
        .info-item.full { grid-column: 1 / -1; }
        .profile-img-stub { width: 48px; height: 48px; border-radius: 12px; background: rgba(37,99,235,0.1); color: var(--primary); display: flex; align-items: center; justify-content: center; }
        .text-red { color: #ef4444; }
        .summary-banner { padding: 1.5rem; }
        
        @media (max-width: 768px) { 
          .tab-navigation { flex-direction: column; } 
          .emp-form .form-grid { grid-template-columns: 1fr; }
          .modal-body-grid { grid-template-columns: 1fr; }
        }
      ` }} />
    </div>
  );
};

export default Karyawan;
