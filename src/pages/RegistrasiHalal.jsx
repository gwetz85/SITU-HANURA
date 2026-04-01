import React, { useState } from 'react';
import { 
  User, 
  Briefcase, 
  Plus, 
  Trash2, 
  Save, 
  X, 
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Fingerprint,
  Calendar,
  Building,
  Package,
  Droplets,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { ref, push } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { logActivity } from '../utils/logging';

const RegistrasiHalal = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // Pelaku Usaha State
  const [pelakuUsaha, setPelakuUsaha] = useState({
    nama: '',
    nik: '',
    jenisKelamin: 'Laki-laki',
    ponsel: '',
    email: '',
    tempatLahir: '',
    tanggalLahir: '',
    alamat: '',
    rtRw: '',
    kelurahan: '',
    koordinat: ''
  });

  // Usaha List State
  const [usahaList, setUsahaList] = useState([
    {
      namaUsaha: '',
      jenisUsaha: '',
      bidangUsaha: '',
      modalUsaha: '',
      lamaUsaha: '',
      luasLokasi: '',
      alamatUsaha: ''
    }
  ]);

  // Halal Specific States
  const [bahanList, setBahanList] = useState(['']); // Max 20
  const [kemasanList, setKemasanList] = useState(['']); // Max 10
  const [pembersihList, setPembersihList] = useState(['']); // Max 10
  const [tataCara, setTataCara] = useState(''); // Max 6000 chars

  const handlePelakuChange = (e) => {
    const { name, value } = e.target;
    setPelakuUsaha(prev => ({ ...prev, [name]: value }));
  };

  const handleUsahaChange = (index, e) => {
    const { name, value } = e.target;
    const newList = [...usahaList];
    newList[index][name] = value;
    setUsahaList(newList);
  };

  const addItem = (list, setList, max) => {
    if (list.length >= max) {
      alert(`Maksimal ${max} item diperbolehkan.`);
      return;
    }
    setList([...list, '']);
  };

  const removeItem = (index, list, setList) => {
    if (list.length === 1) return;
    setList(list.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, value, list, setList) => {
    const newList = [...list];
    newList[index] = value;
    setList(newList);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation tidak didukung oleh browser Anda.');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setPelakuUsaha(prev => ({ ...prev, koordinat: `${latitude}, ${longitude}` }));
        setLocationLoading(false);
      },
      (error) => {
        setLocationLoading(false);
        console.error('Error getting location:', error);
        alert('Gagal mengambil lokasi. Pastikan izin lokasi diberikan.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!window.confirm('Simpan data Registrasi Halal ini?')) return;

    setLoading(true);
    try {
      const dataToSave = {
        pelakuUsaha,
        usahaList,
        halalDetails: {
          bahan: bahanList.filter(b => b.trim() !== ''),
          kemasan: kemasanList.filter(k => k.trim() !== ''),
          pembersih: pembersihList.filter(p => p.trim() !== ''),
          tataCara
        },
        submittedBy: user?.name || user?.username,
        status: 'Pending',
        type: 'Halal',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await push(ref(db, 'pelayanan/halal'), dataToSave);
      await logActivity(db, 'Pelayanan Masyarakat', `Registrasi Halal Baru: ${pelakuUsaha.nama}`, user);
      
      alert('Registrasi Halal berhasil disimpan!');
      navigate('/pelayanan');
    } catch (error) {
      console.error('Error saving Halal:', error);
      alert('Gagal menyimpan data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-page fadeIn">
      <div className="registration-header">
        <button className="btn-back" onClick={() => navigate('/pelayanan')}>
          <ArrowLeft size={18} /> Kembali
        </button>
        <div className="header-content">
          <h1>Registrasi Sertifikat Halal</h1>
          <p>Lengkapi formulir di bawah ini untuk pengurusan sertifikasi halal produk usaha Anda.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="registration-form">
        {/* Section 1: Data Pelaku Usaha */}
        <div className="form-section glass-card-premium">
          <div className="section-title">
            <div className="icon-box primary"><User size={20} /></div>
            <h3>Data Pelaku Usaha</h3>
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Nama Lengkap</label>
              <input required name="nama" value={pelakuUsaha.nama} onChange={handlePelakuChange} />
            </div>
            <div className="form-group">
              <label>NIK</label>
              <input required name="nik" value={pelakuUsaha.nik} onChange={handlePelakuChange} maxLength={16} />
            </div>
            <div className="form-group">
              <label>Jenis Kelamin</label>
              <select name="jenisKelamin" value={pelakuUsaha.jenisKelamin} onChange={handlePelakuChange}>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
            <div className="form-group">
              <label>Nomor Ponsel</label>
              <input required name="ponsel" value={pelakuUsaha.ponsel} onChange={handlePelakuChange} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" value={pelakuUsaha.email} onChange={handlePelakuChange} />
            </div>
            <div className="form-group">
              <label>Tempat Lahir</label>
              <input required name="tempatLahir" value={pelakuUsaha.tempatLahir} onChange={handlePelakuChange} />
            </div>
            <div className="form-group">
              <label>Tanggal Lahir</label>
              <input required name="tanggalLahir" type="date" value={pelakuUsaha.tanggalLahir} onChange={handlePelakuChange} />
            </div>
            <div className="form-group full">
              <label>Alamat Lengkap</label>
              <textarea required name="alamat" value={pelakuUsaha.alamat} onChange={handlePelakuChange} />
            </div>
            <div className="form-group">
              <label>RT / RW</label>
              <input required name="rtRw" value={pelakuUsaha.rtRw} onChange={handlePelakuChange} />
            </div>
            <div className="form-group">
              <label>Kelurahan</label>
              <input required name="kelurahan" value={pelakuUsaha.kelurahan} onChange={handlePelakuChange} />
            </div>
            <div className="form-group full">
               <label>Titik Koordinat Lokasi (Real-time)</label>
               <div className="location-input-group">
                  <input readOnly name="koordinat" value={pelakuUsaha.koordinat} placeholder="Kilk tombol di samping..." />
                  <button type="button" className="btn-get-location" onClick={handleGetLocation} disabled={locationLoading}>
                    {locationLoading ? (
                      <>Memproses...</>
                    ) : (
                      <><MapPin size={18} /> Ambil Titik Koordinat</>
                    )}
                  </button>
               </div>
            </div>
          </div>
        </div>

        {/* Section 2: Data Usaha */}
        <div className="usaha-sections-container">
          {usahaList.map((usaha, index) => (
            <div key={index} className="form-section glass-card-premium">
              <div className="section-title">
                <div className="icon-box accent"><Briefcase size={20} /></div>
                <h3>Data Usaha {usahaList.length > 1 ? `#${index + 1}` : ''}</h3>
              </div>
              <div className="form-grid">
                <div className="form-group full"><label>Nama Usaha</label><input required name="namaUsaha" value={usaha.namaUsaha} onChange={(e) => handleUsahaChange(index, e)} /></div>
                <div className="form-group"><label>Jenis Usaha</label><input required name="jenisUsaha" value={usaha.jenisUsaha} onChange={(e) => handleUsahaChange(index, e)} /></div>
                <div className="form-group"><label>Bidang Usaha</label><input required name="bidangUsaha" value={usaha.bidangUsaha} onChange={(e) => handleUsahaChange(index, e)} /></div>
                <div className="form-group"><label>Modal Usaha</label><input required name="modalUsaha" value={usaha.modalUsaha} onChange={(e) => handleUsahaChange(index, e)} /></div>
                <div className="form-group"><label>Lama Usaha</label><input required name="lamaUsaha" value={usaha.lamaUsaha} onChange={(e) => handleUsahaChange(index, e)} /></div>
                <div className="form-group"><label>Luas Lokasi (m²)</label><input required name="luasLokasi" value={usaha.luasLokasi} onChange={(e) => handleUsahaChange(index, e)} /></div>
                <div className="form-group full"><label>Alamat Usaha</label><textarea required name="alamatUsaha" value={usaha.alamatUsaha} onChange={(e) => handleUsahaChange(index, e)} /></div>
              </div>
            </div>
          ))}
        </div>

        {/* Section 3: Halal Details */}
        <div className="form-section glass-card-premium">
          <div className="section-title">
            <div className="icon-box warning"><ShieldCheck size={20} /></div>
            <h3>Detail Produk & Bahan</h3>
          </div>

          <div className="halal-grid">
            {/* Bahan List */}
            <div className="dynamic-list-container">
              <label>Bahan-bahan (Maksimal 20 Item)</label>
              {bahanList.map((item, idx) => (
                <div key={idx} className="list-item">
                  <input value={item} onChange={(e) => handleItemChange(idx, e.target.value, bahanList, setBahanList)} placeholder={`Bahan #${idx+1}`} />
                  {bahanList.length > 1 && <button type="button" onClick={() => removeItem(idx, bahanList, setBahanList)} className="btn-mini-remove"><Trash2 size={14} /></button>}
                </div>
              ))}
              <button type="button" className="btn-add-item" onClick={() => addItem(bahanList, setBahanList, 20)}><Plus size={14} /> Tambah Bahan</button>
            </div>

            {/* Kemasan List */}
            <div className="dynamic-list-container">
              <label>Kemasan (Maksimal 10 Item)</label>
              {kemasanList.map((item, idx) => (
                <div key={idx} className="list-item">
                  <input value={item} onChange={(e) => handleItemChange(idx, e.target.value, kemasanList, setKemasanList)} placeholder={`Kemasan #${idx+1}`} />
                  {kemasanList.length > 1 && <button type="button" onClick={() => removeItem(idx, kemasanList, setKemasanList)} className="btn-mini-remove"><Trash2 size={14} /></button>}
                </div>
              ))}
              <button type="button" className="btn-add-item" onClick={() => addItem(kemasanList, setKemasanList, 10)}><Plus size={14} /> Tambah Kemasan</button>
            </div>

            {/* Pembersih List */}
            <div className="dynamic-list-container">
              <label>Pembersih (Maksimal 10 Item)</label>
              {pembersihList.map((item, idx) => (
                <div key={idx} className="list-item">
                  <input value={item} onChange={(e) => handleItemChange(idx, e.target.value, pembersihList, setPembersihList)} placeholder={`Pembersih #${idx+1}`} />
                  {pembersihList.length > 1 && <button type="button" onClick={() => removeItem(idx, pembersihList, setPembersihList)} className="btn-mini-remove"><Trash2 size={14} /></button>}
                </div>
              ))}
              <button type="button" className="btn-add-item" onClick={() => addItem(pembersihList, setPembersihList, 10)}><Plus size={14} /> Tambah Pembersih</button>
            </div>
          </div>

          <div className="form-group full" style={{ marginTop: '1rem' }}>
            <label>Tata Cara Pembuatan (Maksimal 6000 Karakter)</label>
            <textarea 
              required 
              maxLength={6000} 
              value={tataCara} 
              onChange={(e) => setTataCara(e.target.value)} 
              placeholder="Uraikan proses pembuatan produk Anda..."
              style={{ minHeight: '200px' }}
            />
            <div className="char-count">{tataCara.length} / 6000 karakter</div>
          </div>
        </div>

        <div className="form-footer-actions">
          <button type="button" className="btn-cancel" onClick={() => navigate('/pelayanan')}>Batal</button>
          <button type="submit" className="btn-submit-premium" disabled={loading}>
            {loading ? 'Menyimpan...' : <><Save size={18} /> Simpan Registrasi Halal</>}
          </button>
        </div>
      </form>

      <style dangerouslySetInnerHTML={{ __html: `
        .registration-page { max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem; }
        .registration-header { display: flex; flex-direction: column; gap: 1.5rem; }
        .btn-back { display: flex; align-items: center; gap: 8px; background: none; border: none; color: var(--text-muted); font-weight: 700; cursor: pointer; padding: 0.5rem; border-radius: 8px; }
        .btn-back:hover { color: var(--primary); background: rgba(37, 99, 235, 0.05); }
        .header-content h1 { font-size: 1.75rem; font-weight: 900; color: var(--text-main); margin-bottom: 0.5rem; }
        .registration-form { display: flex; flex-direction: column; gap: 2rem; }
        .form-section { padding: 2rem !important; display: flex; flex-direction: column; gap: 2rem; }
        .section-title { display: flex; align-items: center; gap: 1rem; }
        .icon-box { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; }
        .icon-box.primary { background: var(--primary); }
        .icon-box.accent { background: #8b5cf6; }
        .icon-box.warning { background: #10b981; }
        .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group.full { grid-column: span 2; }
        .form-group label { font-size: 0.85rem; font-weight: 700; color: var(--text-main); }
        .form-group input, .form-group select, .form-group textarea { padding: 0.75rem 1rem; border-radius: 10px; border: 1px solid var(--border); background: var(--background); font-size: 0.95rem; }
        .form-group textarea { min-height: 100px; }
        .halal-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; }
        .dynamic-list-container { display: flex; flex-direction: column; gap: 1rem; }
        .dynamic-list-container label { font-size: 0.85rem; font-weight: 800; color: var(--text-main); color: var(--primary); }
        .list-item { display: flex; gap: 0.5rem; }
        .list-item input { flex: 1; border-color: rgba(37, 99, 235, 0.1); }
        .btn-mini-remove { background: #fee2e2; color: #ef4444; border: none; padding: 0.5rem; border-radius: 8px; cursor: pointer; }
        .btn-add-item { width: fit-content; background: none; border: 1px dashed var(--primary); color: var(--primary); padding: 0.5rem 1rem; border-radius: 8px; font-weight: 700; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; gap: 6px; }
        .char-count { font-size: 0.75rem; color: var(--text-muted); text-align: right; margin-top: 0.25rem; font-weight: 600; }
        .form-footer-actions { display: flex; justify-content: flex-end; gap: 1.5rem; padding-bottom: 3rem; }
        .btn-cancel { background: none; border: 1px solid var(--border); padding: 0.75rem 2rem; border-radius: 12px; font-weight: 700; color: var(--text-muted); cursor: pointer; }
        .btn-submit-premium { background: var(--primary); color: white; border: none; padding: 0.75rem 2.5rem; border-radius: 12px; font-weight: 800; box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3); cursor: pointer; display: flex; align-items: center; gap: 10px; }
        
        .location-input-group { display: flex; gap: 1rem; }
        .location-input-group input { flex: 1; background: #f8fafc !important; color: #64748b; font-family: monospace; font-weight: 700; }
        .btn-get-location { background: #ecfdf5; color: #059669; border: 1px solid #10b981; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 800; font-size: 0.85rem; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s; }
        .btn-get-location:hover { background: #10b981; color: white; }

        @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } .form-group.full { grid-column: span 1; } }
      ` }} />
    </div>
  );
};

export default RegistrasiHalal;
