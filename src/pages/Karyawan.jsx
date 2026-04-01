import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
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
  Save,
  MapPin,
  Briefcase,
  User,
  History
} from 'lucide-react';
import { db } from '../firebase';
import { ref, onValue, push, remove, update } from 'firebase/database';
import Modal from '../components/Modal';
import { formatTerbilang } from '../utils/terbilang';
import SlipGaji from '../components/SlipGaji';
import { get, set } from 'firebase/database';
import { logActivity } from '../utils/logging';

const Karyawan = () => {
  const { user, workingMonth, setWorkingMonth } = useAuth();
  const [activeTab, setActiveTab] = useState('data');
  const [employees, setEmployees] = useState([]);
  const [kasbonList, setKasbonList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEmpForm, setShowEmpForm] = useState(false);
  const [showKasbonForm, setShowKasbonForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [empForm, setEmpForm] = useState({
    nama: '', jabatan: '', nik: '', ponsel: '', bank: 'BNI', norek: '', gaji: '',
    tunjangan_jabatan: 0, tunjangan_makan: 0, bonus_kinerja: 0,
    bpjs_kesehatan: 0, bpjs_ketenagakerjaan: 0, iuran_koperasi: 0, hari_kerja: 25
  });
  const [kasbonForm, setKasbonForm] = useState({
    employeeId: '', tanggal: new Date().toISOString().split('T')[0], jumlah: ''
  });
  const [viewingDetail, setViewingDetail] = useState(null);
  const [printingEmployee, setPrintingEmployee] = useState(null);
  const [archives, setArchives] = useState([]);
  const [selectedArchiveMonth, setSelectedArchiveMonth] = useState('');
  const [archivedData, setArchivedData] = useState([]);
  const [fetchingArchive, setFetchingArchive] = useState(false);

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

  useEffect(() => {
    const archivesRef = ref(db, 'employee_archives');
    const unsubArchives = onValue(archivesRef, (snapshot) => {
      if (snapshot.exists()) {
        const months = Object.keys(snapshot.val()).sort().reverse();
        setArchives(months);
        if (months.length > 0 && !selectedArchiveMonth) {
          setSelectedArchiveMonth(months[0]);
        }
      }
    });
    return () => unsubArchives();
  }, []);

  useEffect(() => {
    if (selectedArchiveMonth && activeTab === 'rekapan') {
      setFetchingArchive(true);
      const monthRef = ref(db, `employee_archives/${selectedArchiveMonth}`);
      get(monthRef).then((snapshot) => {
        if (snapshot.exists()) {
          setArchivedData(Object.values(snapshot.val()));
        } else {
          setArchivedData([]);
        }
        setFetchingArchive(false);
      });
    }
  }, [selectedArchiveMonth, activeTab]);

  const handleEmpSubmit = async (e) => {
    e.preventDefault();
    const data = { 
      ...empForm, 
      gaji: parseInt(empForm.gaji || 0),
      tunjangan_jabatan: parseInt(empForm.tunjangan_jabatan || 0),
      tunjangan_makan: parseInt(empForm.tunjangan_makan || 0),
      bonus_kinerja: parseInt(empForm.bonus_kinerja || 0),
      bpjs_kesehatan: parseInt(empForm.bpjs_kesehatan || 0),
      bpjs_ketenagakerjaan: parseInt(empForm.bpjs_ketenagakerjaan || 0),
      iuran_koperasi: parseInt(empForm.iuran_koperasi || 0),
      hari_kerja: parseInt(empForm.hari_kerja || 25),
      createdAt: new Date().toISOString() 
    };
    try {
      if (editingId) {
        await update(ref(db, `employees/${editingId}`), data);
        await logActivity(db, 'Karyawan', `Mengubah data karyawan: ${data.nama}`, user);
        alert('Data Karyawan berhasil diperbarui');
      } else {
        await push(ref(db, 'employees'), data);
        await logActivity(db, 'Karyawan', `Menambah karyawan baru: ${data.nama}`, user);
        alert('Karyawan Baru berhasil ditambahkan');
      }
      resetEmpForm();
    } catch (err) { alert('Terjadi kesalahan'); }
  };

  const resetEmpForm = () => {
    setEmpForm({ 
      nama: '', jabatan: '', nik: '', ponsel: '', bank: 'BNI', norek: '', gaji: '',
      tunjangan_jabatan: 0, tunjangan_makan: 0, bonus_kinerja: 0,
      bpjs_kesehatan: 0, bpjs_ketenagakerjaan: 0, iuran_koperasi: 0, hari_kerja: 25
    });
    setEditingId(null);
    setShowEmpForm(false);
  };

  const handleEditEmp = (emp) => {
    setEditingId(emp.id);
    setEmpForm({
      nama: emp.nama, jabatan: emp.jabatan, nik: emp.nik, 
      ponsel: emp.ponsel, bank: emp.bank, norek: emp.norek, gaji: emp.gaji,
      tunjangan_jabatan: emp.tunjangan_jabatan || 0,
      tunjangan_makan: emp.tunjangan_makan || 0,
      bonus_kinerja: emp.bonus_kinerja || 0,
      bpjs_kesehatan: emp.bpjs_kesehatan || 0,
      bpjs_ketenagakerjaan: emp.bpjs_ketenagakerjaan || 0,
      iuran_koperasi: emp.iuran_koperasi || 0,
      hari_kerja: emp.hari_kerja || 25
    });
    setShowEmpForm(true);
  };

  const handleDeleteEmp = async (id) => {
    if (window.confirm('Hapus data karyawan ini?')) {
      const empToDelete = employees.find(e => e.id === id);
      await remove(ref(db, `employees/${id}`));
      await logActivity(db, 'Karyawan', `Menghapus data karyawan: ${empToDelete?.nama}`, user);
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
    await logActivity(db, 'Karyawan', `Mencatat kasbon untuk: ${data.nama} sebesar ${formatCurrency(data.jumlah)}`, user);
    alert('Kasbon berhasil dicatat');
    setKasbonForm({ employeeId: '', tanggal: new Date().toISOString().split('T')[0], jumlah: '' });
    setShowKasbonForm(false);
  };

  const getOutstandingKasbon = (empId) => {
    return kasbonList.filter(k => k.employeeId === empId).reduce((a, b) => a + b.jumlah, 0);
  };

  const handleTutupBuku = async () => {
    if (user?.role !== 'Admin') return alert('Hanya Admin yang dapat melakukan Tutup Buku!');
    
    const [year, month] = workingMonth.split('-');
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const monthLabel = `${monthNames[parseInt(month) - 1]} ${year}`;

    if (!window.confirm(`Lakukan Tutup Buku untuk periode ${monthLabel}?\n\nSemua data kasbon akan dihapus dan dipindahkan ke dalam arsip rekapan.`)) return;

    try {
      setLoading(true);
      const empArchiveData = {};
      
      employees.forEach(emp => {
        const empKasbonList = kasbonList.filter(k => k.employeeId === emp.id);
        const totalKasbon = empKasbonList.reduce((sum, k) => sum + (parseInt(k.jumlah) || 0), 0);
        const totalPenghasilan = (parseInt(emp.gaji) || 0) + (parseInt(emp.tunjangan_jabatan) || 0) + (parseInt(emp.tunjangan_makan) || 0) + (parseInt(emp.bonus_kinerja) || 0);
        const totalPotongan = totalKasbon + (parseInt(emp.bpjs_kesehatan) || 0) + (parseInt(emp.bpjs_ketenagakerjaan) || 0) + (parseInt(emp.iuran_koperasi) || 0);
        const sisaGaji = totalPenghasilan - totalPotongan;

        empArchiveData[emp.id] = {
          nama: emp.nama,
          jabatan: emp.jabatan,
          nik: emp.nik,
          bulan_gaji: monthLabel,
          // Financial Details
          gaji: parseInt(emp.gaji) || 0,
          tunjangan_jabatan: parseInt(emp.tunjangan_jabatan) || 0,
          tunjangan_makan: parseInt(emp.tunjangan_makan) || 0,
          bonus_kinerja: parseInt(emp.bonus_kinerja) || 0,
          totalKasbon: totalKasbon, // Changed field name to match SlipGaji
          bpjs_kesehatan: parseInt(emp.bpjs_kesehatan) || 0,
          bpjs_ketenagakerjaan: parseInt(emp.bpjs_ketenagakerjaan) || 0,
          iuran_koperasi: parseInt(emp.iuran_koperasi) || 0,
          kasbon_dates: empKasbonList.map(k => k.tanggal).join(', '),
          sisa_gaji: sisaGaji,
          timestamp: new Date().toISOString()
        };
      });

      await set(ref(db, `employee_archives/${workingMonth}`), empArchiveData);
      await remove(ref(db, 'kasbon'));
      
      // Advance to next month
      const current = new Date(`${workingMonth}-01`);
      current.setMonth(current.getMonth() + 1);
      const nextMonth = `${current.getFullYear()}-${(current.getMonth() + 1).toString().padStart(2, '0')}`;
      setWorkingMonth(nextMonth);

      alert(`Tutup Buku ${monthLabel} Berhasil!\nPeriode aktif sekarang: ${current.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}`);
      await logActivity(db, 'Karyawan', `Melakukan Tutup Buku & Arsip Gaji periode ${monthLabel}`, user);
      setActiveTab('rekapan');
    } catch (err) {
      console.error(err);
      alert('Gagal melakukan Tutup Buku.');
    } finally {
      setLoading(false);
    }
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

      <Modal
        isOpen={showEmpForm}
        onClose={resetEmpForm}
        title={editingId ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
        icon={editingId ? <Edit2 size={24} /> : <Plus size={24} />}
      >
        <form onSubmit={handleEmpSubmit} className="emp-form">
          <div className="premium-modal-section">
            <h4 className="premium-section-title"><User size={18} /> Profil Karyawan</h4>
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
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
            </div>
          </div>

          <div className="premium-modal-section">
            <h4 className="premium-section-title"><CreditCard size={18} /> Keuangan & Payroll</h4>
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
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
              <div className="form-group">
                <label>Gaji Pokok (Rp)</label>
                <input required type="number" value={empForm.gaji} onChange={e => setEmpForm({...empForm, gaji: e.target.value})} placeholder="Contoh: 3000000" />
              </div>
              <div className="form-group">
                <label>Jumlah Hari Kerja</label>
                <input required type="number" value={empForm.hari_kerja} onChange={e => setEmpForm({...empForm, hari_kerja: e.target.value})} placeholder="25" />
              </div>
            </div>
          </div>

          <div className="premium-modal-section">
            <h4 className="premium-section-title"><Banknote size={18} /> Tunjangan & Bonus</h4>
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label>Tunjangan Jabatan</label>
                <input type="number" value={empForm.tunjangan_jabatan} onChange={e => setEmpForm({...empForm, tunjangan_jabatan: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Tunjangan Makan</label>
                <input type="number" value={empForm.tunjangan_makan} onChange={e => setEmpForm({...empForm, tunjangan_makan: e.target.value})} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Bonus Kinerja</label>
                <input type="number" value={empForm.bonus_kinerja} onChange={e => setEmpForm({...empForm, bonus_kinerja: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="premium-modal-section">
            <h4 className="premium-section-title"><AlertCircle size={18} /> Potongan (BPJS)</h4>
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label>BPJS Kesehatan</label>
                <input type="number" value={empForm.bpjs_kesehatan} onChange={e => setEmpForm({...empForm, bpjs_kesehatan: e.target.value})} />
              </div>
              <div className="form-group">
                <label>BPJS Ketenagakerjaan</label>
                <input type="number" value={empForm.bpjs_ketenagakerjaan} onChange={e => setEmpForm({...empForm, bpjs_ketenagakerjaan: e.target.value})} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Iuran Koperasi</label>
                <input type="number" value={empForm.iuran_koperasi} onChange={e => setEmpForm({...empForm, iuran_koperasi: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" className="btn btn-ghost" onClick={resetEmpForm}>Batal</button>
            <button type="submit" className="btn btn-primary"><Save size={18} /> Simpan Data</button>
          </div>
        </form>
      </Modal>

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
        <button className={`tab-btn ${activeTab === 'rekapan' ? 'active' : ''}`} onClick={() => setActiveTab('rekapan')}>
          <History size={18} /> <span>Rekapan Gaji</span>
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
            
            <Modal
              isOpen={showKasbonForm}
              onClose={() => setShowKasbonForm(false)}
              title="Tambah Entry Kasbon"
              icon={<Wallet size={24} />}
              maxWidth="500px"
            >
              <form onSubmit={handleKasbonSubmit} className="emp-form">
                <div className="premium-modal-section">
                  <div className="form-group">
                    <label>Pilih Karyawan</label>
                    <select required value={kasbonForm.employeeId} onChange={e => setKasbonForm({...kasbonForm, employeeId: e.target.value})}>
                      <option value="">-- Pilih Karyawan --</option>
                      {employees.map(e => <option key={e.id} value={e.id}>{e.nama} - {e.jabatan}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginTop: '1.2rem' }}>
                    <label>Tanggal</label>
                    <input required type="date" value={kasbonForm.tanggal} onChange={e => setKasbonForm({...kasbonForm, tanggal: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ marginTop: '1.2rem' }}>
                    <label>Jumlah Kasbon (Rp)</label>
                    <input required type="number" value={kasbonForm.jumlah} onChange={e => setKasbonForm({...kasbonForm, jumlah: e.target.value})} />
                  </div>
                </div>
                <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                   <button type="button" className="btn btn-ghost w-full" onClick={() => setShowKasbonForm(false)}>Batal</button>
                   <button type="submit" className="btn btn-primary w-full">Simpan Kasbon</button>
                </div>
              </form>
            </Modal>

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
                    const totalPenghasilan = (e.gaji || 0) + (e.tunjangan_jabatan || 0) + (e.tunjangan_makan || 0) + (e.bonus_kinerja || 0);
                    const totalPotongan = (totalKasbon || 0) + (e.bpjs_kesehatan || 0) + (e.bpjs_ketenagakerjaan || 0);
                    const takeHomePay = totalPenghasilan - totalPotongan;
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
                          <button 
                            className="icon-btn-ghost ml-2" 
                            title="Cetak Slip"
                            onClick={() => setPrintingEmployee({
                              ...e,
                              totalKasbon: totalKasbon,
                              penerimaanBersih: takeHomePay,
                              terbilang: formatTerbilang(takeHomePay)
                            })}
                          >
                            <Printer size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'rekapan' && (
          <div className="rekapan-tab animate-slide-up">
            <div className="toolbar glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <History size={20} className="text-primary" />
                <h3 style={{ margin: 0 }}>Arsip Penggajian</h3>
              </div>
              <div className="archive-controls" style={{ display: 'flex', gap: '1rem' }}>
                <select 
                  className="month-selector"
                  value={selectedArchiveMonth}
                  onChange={(e) => setSelectedArchiveMonth(e.target.value)}
                  style={{ 
                    padding: '0.6rem 2.5rem 0.6rem 1rem', 
                    borderRadius: '10px', 
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    fontWeight: 700
                  }}
                >
                  <option value="">-- Pilih Bulan --</option>
                  {archives.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <button 
                  className="btn btn-ghost" 
                  onClick={() => window.print()}
                  disabled={archivedData.length === 0}
                >
                  <Printer size={18} /> Cetak
                </button>
                {user?.role === 'Admin' && (
                  <button 
                    className="btn btn-primary" 
                    onClick={handleTutupBuku}
                    title="Arsipkan data bulan ini dan bersihkan kasbon"
                  >
                    <Save size={18} /> Tutup Buku
                  </button>
                )}
              </div>
            </div>

            {fetchingArchive ? (
              <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Mengambil arsip...</div>
            ) : archivedData.length === 0 ? (
              <div className="glass-card" style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Clock size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                <p>Tidak ada arsip data untuk periode ini.</p>
              </div>
            ) : (
              <div className="table-responsive glass-card">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Karyawan</th>
                      <th>NIK</th>
                      <th>Bulan</th>
                      <th>Total Kasbon</th>
                      <th className="text-right">Sisa Gaji (Net)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {archivedData.map((a, idx) => (
                      <tr key={idx}>
                        <td>
                          <div className="name-cell">
                            <span className="font-bold">{a.nama}</span>
                            <span className="text-muted" style={{ fontSize: '0.7rem' }}>{a.jabatan}</span>
                          </div>
                        </td>
                        <td>{a.nik || '-'}</td>
                        <td><span className="status-badge success" style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)' }}>{a.bulan_gaji}</span></td>
                        <td className="text-red font-bold">-{formatCurrency(a.totalKasbon || a.kasbon_total || 0)}</td>
                        <td className="text-right">
                          <span className="font-bold text-primary" style={{ fontSize: '1rem' }}>{formatCurrency(a.sisa_gaji)}</span>
                          <button 
                            className="icon-btn-ghost ml-2" 
                            title="Cetak Slip Historis"
                            onClick={() => setPrintingEmployee({
                              ...a,
                              totalKasbon: a.totalKasbon || a.kasbon_total || 0,
                              penerimaanBersih: a.sisa_gaji,
                              terbilang: formatTerbilang(a.sisa_gaji)
                            })}
                          >
                            <Printer size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={!!viewingDetail}
        onClose={() => setViewingDetail(null)}
        title="Detail Data Karyawan"
        icon={<Users size={24} />}
        footer={
          <button className="btn btn-primary" onClick={() => setViewingDetail(null)}>
            Tutup Detail
          </button>
        }
      >
        {viewingDetail && (
          <>
            <div className="premium-modal-section">
              <h4 className="premium-section-title">
                <User size={18} /> Informasi Pribadi
              </h4>
              <div className="premium-info-grid">
                <div className="premium-info-item">
                  <span className="premium-info-label">Nama Lengkap</span>
                  <span className="premium-info-value">{viewingDetail.nama}</span>
                </div>
                <div className="premium-info-item">
                  <span className="premium-info-label">NIK (Nomor Induk Kependudukan)</span>
                  <span className="premium-info-value">{viewingDetail.nik}</span>
                </div>
                <div className="premium-info-item">
                  <span className="premium-info-label">Nomor Ponsel / WhatsApp</span>
                  <span className="premium-info-value">{viewingDetail.ponsel}</span>
                </div>
              </div>
            </div>

            <div className="premium-modal-section">
              <h4 className="premium-section-title">
                <Briefcase size={18} /> Pekerjaan & Penggajian
              </h4>
              <div className="premium-info-grid">
                <div className="premium-info-item">
                  <span className="premium-info-label">Jabatan</span>
                  <span className="premium-info-value">{viewingDetail.jabatan}</span>
                </div>
                <div className="premium-info-item">
                  <span className="premium-info-label">Gaji Pokok (Bulanan)</span>
                  <span className="premium-info-value text-primary">{formatCurrency(viewingDetail.gaji)}</span>
                </div>
                <div className="premium-info-item">
                  <span className="premium-info-label">Tanggal Bergabung</span>
                  <span className="premium-info-value">
                    {new Date(viewingDetail.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>

            <div className="premium-modal-section">
              <h4 className="premium-section-title">
                <CreditCard size={18} /> Informasi Rekening Bank
              </h4>
              <div className="premium-info-grid">
                <div className="premium-info-item">
                  <span className="premium-info-label">Nama Bank</span>
                  <span className="premium-info-value">{viewingDetail.bank}</span>
                </div>
                <div className="premium-info-item">
                  <span className="premium-info-label">Nomor Rekening</span>
                  <span className="premium-info-value">{viewingDetail.norek}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </Modal>

      <Modal
        isOpen={!!printingEmployee}
        onClose={() => setPrintingEmployee(null)}
        title="Pratinjau Slip Gaji"
        icon={<Printer size={24} />}
        maxWidth="1000px"
        footer={
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-ghost" onClick={() => setPrintingEmployee(null)}>Batal</button>
            <button className="btn btn-primary" onClick={() => window.print()}>
              <Printer size={18} /> Cetak Sekarang
            </button>
          </div>
        }
      >
        {printingEmployee && <SlipGaji data={printingEmployee} />}
      </Modal>

      <style dangerouslySetInnerHTML={{ __html: `
        .karyawan-page { display: flex; flex-direction: column; gap: 1rem; }
        .page-header { display: flex; justify-content: space-between; align-items: center; }
        .header-info h1 { font-size: 1.25rem; font-weight: 800; color: var(--text-main); }
        .header-info p { color: var(--text-muted); font-size: 0.8rem; }
        .tab-navigation { display: flex; gap: 0.75rem; padding: 0.5rem 1rem; }
        .tab-btn { display: flex; align-items: center; gap: 0.65rem; padding: 0.5rem 1rem; border-radius: var(--radius-md); font-weight: 700; font-size: 0.8rem; color: var(--text-muted); transition: all 0.2s; }
        .tab-btn:hover { background: var(--background); }
        .tab-btn.active { background: var(--primary); color: white; box-shadow: 0 4px 10px rgba(37,99,235,0.2); }
        .name-cell { display: flex; flex-direction: column; }
        .text-primary { color: var(--primary); }
        .text-muted { color: var(--text-muted); }
        .font-bold { font-weight: 700; }
        .kasbon-badge { padding: 0.3rem 0.7rem; border-radius: 100px; font-size: 0.75rem; font-weight: 800; }
        .kasbon-badge.success { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .kasbon-badge.warning { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        .bank-info { display: flex; flex-direction: column; gap: 1px; }
        .bank-name { font-size: 0.65rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; }
        .bank-number { font-size: 0.85rem; font-weight: 600; font-family: 'JetBrains Mono', monospace; color: var(--text-main); }
        .p-10 { padding: 1.5rem; }

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
        .action-group button { 
          width: 32px; height: 32px; 
          border-radius: 8px; 
          display: flex; align-items: center; justify-content: center; 
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); 
          border: 1px solid transparent;
        }
        .icon-btn-view { color: var(--primary); background: var(--background); border: 1px solid var(--border) !important; }
        .icon-btn-view:hover { background: var(--primary); color: white; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(37,99,235,0.2); }
        
        .icon-btn-edit { color: #f59e0b; background: var(--background); border: 1px solid var(--border) !important; }
        .icon-btn-edit:hover { background: #f59e0b; color: white; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(245,158,11,0.2); }
        
        .icon-btn-delete { color: #ef4444; background: var(--background); border: 1px solid var(--border) !important; }
        .icon-btn-delete:hover { background: #ef4444; color: white; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(239,68,68,0.2); }
        
        .modal-body-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; padding: 2rem 0; }
        .info-item { display: flex; flex-direction: column; gap: 0.5rem; }
        .info-item label { color: var(--text-muted); font-size: 0.8rem; font-weight: 600; text-transform: uppercase; display: flex; align-items: center; gap: 0.5rem; }
        .info-item span { font-size: 0.95rem; font-weight: 600; }
        .info-item.full { grid-column: 1 / -1; }
        .profile-img-stub { width: 40px; height: 40px; border-radius: 10px; background: rgba(37,99,235,0.1); color: var(--primary); display: flex; align-items: center; justify-content: center; }
        .text-red { color: #ef4444; }
        .summary-banner { padding: 1rem; }
        
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
