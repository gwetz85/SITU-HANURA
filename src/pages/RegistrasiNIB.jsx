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
  Building
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { ref, push } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { logActivity } from '../utils/logging';

const RegistrasiNIB = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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

  // Usaha List State (Support multiple businesses)
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

  const addUsaha = () => {
    setUsahaList([
      ...usahaList,
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
  };

  const removeUsaha = (index) => {
    if (usahaList.length === 1) return;
    const newList = usahaList.filter((_, i) => i !== index);
    setUsahaList(newList);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation tidak didukung oleh browser Anda.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setPelakuUsaha(prev => ({ ...prev, koordinat: `${latitude}, ${longitude}` }));
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        console.error('Error getting location:', error);
        alert('Gagal mengambil lokasi. Pastikan izin lokasi diberikan.');
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!window.confirm('Simpan data Registrasi NIB ini?')) return;

    setLoading(true);
    try {
      const dataToSave = {
        pelakuUsaha,
        usahaList,
        submittedBy: user?.name || user?.username,
        status: 'Pending',
        type: 'NIB',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await push(ref(db, 'pelayanan/nib'), dataToSave);
      await logActivity(db, 'Pelayanan Masyarakat', `Registrasi NIB Baru: ${pelakuUsaha.nama}`, user);
      
      alert('Registrasi NIB berhasil disimpan!');
      navigate('/pelayanan');
    } catch (error) {
      console.error('Error saving NIB:', error);
      alert('Gagal menyimpan data. Silakan coba lagi.');
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
          <h1>Registrasi NIB (Nomor Induk Berusaha)</h1>
          <p>Lengkapi formulir di bawah ini untuk pendataan dan verifikasi Nomor Induk Berusaha.</p>
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
              <input 
                required 
                name="nama" 
                value={pelakuUsaha.nama} 
                onChange={handlePelakuChange} 
                placeholder="Masukkan nama sesuai KTP"
              />
            </div>
            <div className="form-group">
              <label>NIK (Nomor Induk Kependudukan)</label>
              <input 
                required 
                name="nik" 
                value={pelakuUsaha.nik} 
                onChange={handlePelakuChange} 
                placeholder="16 digit NIK"
                maxLength={16}
              />
            </div>
            <div className="form-group">
              <label>Jenis Kelamin</label>
              <select name="jenisKelamin" value={pelakuUsaha.jenisKelamin} onChange={handlePelakuChange}>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
            <div className="form-group">
              <label>Nomor Ponsel / WhatsApp</label>
              <input 
                required 
                name="ponsel" 
                value={pelakuUsaha.ponsel} 
                onChange={handlePelakuChange} 
                placeholder="Contoh: 0812..."
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input 
                name="email" 
                type="email"
                value={pelakuUsaha.email} 
                onChange={handlePelakuChange} 
                placeholder="alamat@email.com"
              />
            </div>
            <div className="form-group-row">
              <div className="form-group">
                <label>Tempat Lahir</label>
                <input 
                  required 
                  name="tempatLahir" 
                  value={pelakuUsaha.tempatLahir} 
                  onChange={handlePelakuChange} 
                  placeholder="Kota/Kabupaten"
                />
              </div>
              <div className="form-group">
                <label>Tanggal Lahir</label>
                <input 
                  required 
                  name="tanggalLahir" 
                  type="date"
                  value={pelakuUsaha.tanggalLahir} 
                  onChange={handlePelakuChange} 
                />
              </div>
            </div>
            <div className="form-group full">
              <label>Alamat Lengkap</label>
              <textarea 
                required 
                name="alamat" 
                value={pelakuUsaha.alamat} 
                onChange={handlePelakuChange} 
                placeholder="Jl. Nama Jalan, No House, etc."
              />
            </div>
            <div className="form-group">
              <label>RT / RW</label>
              <input 
                required 
                name="rtRw" 
                value={pelakuUsaha.rtRw} 
                onChange={handlePelakuChange} 
                placeholder="00/00"
              />
            </div>
            <div className="form-group">
              <label>Kelurahan</label>
              <input 
                required 
                name="kelurahan" 
                value={pelakuUsaha.kelurahan} 
                onChange={handlePelakuChange} 
                placeholder="Nama Kelurahan"
              />
            </div>
            <div className="form-group full">
               <label>Titik Koordinat Lokasi (Real-time)</label>
               <div className="location-input-group">
                  <input 
                    readOnly 
                    name="koordinat" 
                    value={pelakuUsaha.koordinat} 
                    placeholder="Contoh: -5.412, 105.257"
                  />
                  <button type="button" className="btn-get-location" onClick={handleGetLocation}>
                    <MapPin size={18} /> Ambil Titik Koordinat
                  </button>
               </div>
               <span className="input-tip">Pastikan GPS aktif dan berikan izin akses lokasi pada browser.</span>
            </div>
          </div>
        </div>

        {/* Section 2: Data Usaha */}
        <div className="usaha-sections-container">
          {usahaList.map((usaha, index) => (
            <div key={index} className="form-section glass-card-premium usaha-entry">
              <div className="section-title">
                <div className="icon-box accent"><Briefcase size={20} /></div>
                <h3>Data Usaha {usahaList.length > 1 ? `#${index + 1}` : ''}</h3>
                {usahaList.length > 1 && (
                  <button type="button" className="btn-remove-usaha" onClick={() => removeUsaha(index)}>
                    <Trash2 size={16} /> Hapus
                  </button>
                )}
              </div>

              <div className="form-grid">
                <div className="form-group full">
                  <label>Nama Usaha</label>
                  <input 
                    required 
                    name="namaUsaha" 
                    value={usaha.namaUsaha} 
                    onChange={(e) => handleUsahaChange(index, e)} 
                    placeholder="Contoh: Warung Berkah"
                  />
                </div>
                <div className="form-group">
                  <label>Jenis Usaha</label>
                  <input 
                    required 
                    name="jenisUsaha" 
                    value={usaha.jenisUsaha} 
                    onChange={(e) => handleUsahaChange(index, e)} 
                    placeholder="Contoh: Kuliner, Jasa, etc."
                  />
                </div>
                <div className="form-group">
                  <label>Bidang Usaha (KBLI)</label>
                  <input 
                    required 
                    name="bidangUsaha" 
                    value={usaha.bidangUsaha} 
                    onChange={(e) => handleUsahaChange(index, e)} 
                    placeholder="Contoh: Rumah Makan"
                  />
                </div>
                <div className="form-group">
                  <label>Modal Usaha</label>
                  <input 
                    required 
                    name="modalUsaha" 
                    value={usaha.modalUsaha} 
                    onChange={(e) => handleUsahaChange(index, e)} 
                    placeholder="Contoh: 10.000.000"
                  />
                </div>
                <div className="form-group">
                  <label>Lama Usaha (Tahun/Bulan)</label>
                  <input 
                    required 
                    name="lamaUsaha" 
                    value={usaha.lamaUsaha} 
                    onChange={(e) => handleUsahaChange(index, e)} 
                    placeholder="Contoh: 2 Tahun"
                  />
                </div>
                <div className="form-group">
                  <label>Luas Lokasi Usaha (m²)</label>
                  <input 
                    required 
                    name="luasLokasi" 
                    value={usaha.luasLokasi} 
                    onChange={(e) => handleUsahaChange(index, e)} 
                    placeholder="Contoh: 20"
                  />
                </div>
                <div className="form-group full">
                  <label>Alamat Usaha</label>
                  <textarea 
                    required 
                    name="alamatUsaha" 
                    value={usaha.alamatUsaha} 
                    onChange={(e) => handleUsahaChange(index, e)} 
                    placeholder="Alamat lengkap lokasi usaha"
                  />
                </div>
              </div>
            </div>
          ))}

          <button type="button" className="btn-add-usaha-large" onClick={addUsaha}>
            <Plus size={20} /> Tambah Data Usaha Lainnya
          </button>
        </div>

        <div className="form-footer-actions">
          <button type="button" className="btn-cancel" onClick={() => navigate('/pelayanan')}>
            Batal
          </button>
          <button type="submit" className="btn-submit-premium" disabled={loading}>
            {loading ? 'Menyimpan...' : (
              <>
                <Save size={18} /> Simpan Registrasi NIB
              </>
            )}
          </button>
        </div>
      </form>

      <style dangerouslySetInnerHTML={{ __html: `
        .registration-page {
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .registration-header {
           display: flex;
           flex-direction: column;
           gap: 1.5rem;
        }

        .btn-back {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          color: var(--text-muted);
          font-weight: 700;
          cursor: pointer;
          width: fit-content;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .btn-back:hover {
          color: var(--primary);
          background: rgba(37, 99, 235, 0.05);
        }

        .header-content h1 {
          font-size: 1.75rem;
          font-weight: 900;
          color: var(--text-main);
          letter-spacing: -0.02em;
          margin-bottom: 0.5rem;
        }

        .header-content p {
          color: var(--text-muted);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .registration-form {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .form-section {
          padding: 2rem !important;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }

        .icon-box {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .icon-box.primary { background: var(--primary); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }
        .icon-box.accent { background: #8b5cf6; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2); }

        .section-title h3 {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-main);
          margin-right: auto;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group.full { grid-column: span 2; }

        .form-group label {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-main);
          opacity: 0.8;
        }

        .form-group input, 
        .form-group select, 
        .form-group textarea {
          padding: 0.75rem 1rem;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--background);
          color: var(--text-main);
          font-size: 0.95rem;
          font-weight: 500;
          outline: none;
          transition: all 0.2s;
        }

        .form-group input:focus, 
        .form-group select:focus, 
        .form-group textarea:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
        }

        .form-group textarea { min-height: 100px; resize: vertical; }

        .form-group-row {
          grid-column: span 2;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .usaha-sections-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .usaha-entry {
           border: 1px solid rgba(139, 92, 246, 0.2) !important;
        }

        .btn-remove-usaha {
          background: rgba(239, 68, 68, 0.08);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-remove-usaha:hover {
          background: #ef4444;
          color: white;
        }

        .btn-add-usaha-large {
          background: white;
          border: 2px dashed #e2e8f0;
          padding: 1.5rem;
          border-radius: 16px;
          color: #64748b;
          font-weight: 800;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-add-usaha-large:hover {
          color: var(--primary);
          border-color: var(--primary);
          background: rgba(37, 99, 235, 0.02);
          transform: translateY(-2px);
        }

        .form-footer-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1.5rem;
          margin-top: 1rem;
          padding-bottom: 3rem;
        }

        .btn-cancel {
          background: none;
          border: 1px solid var(--border);
          padding: 0.75rem 2rem;
          border-radius: 12px;
          font-weight: 700;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-cancel:hover {
          background: #f1f5f9;
          color: var(--text-main);
        }

        .btn-submit-premium {
          background: var(--primary);
          color: white;
          border: none;
          padding: 0.75rem 2.5rem;
          border-radius: 12px;
          font-weight: 800;
          font-size: 1rem;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
          transition: all 0.2s;
        }

        .btn-submit-premium:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(37, 99, 235, 0.4);
        }

        .btn-submit-premium:active { transform: translateY(0); }
        .btn-submit-premium:disabled { opacity: 0.7; cursor: not-allowed; }

        .location-input-group {
          display: flex;
          gap: 1rem;
        }

        .location-input-group input {
          flex: 1;
          background: #f8fafc !important;
          color: #64748b;
          font-family: monospace;
          font-weight: 700;
        }

        .btn-get-location {
          background: #ecfdf5;
          color: #059669;
          border: 1px solid #10b981;
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          font-weight: 800;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-get-location:hover {
          background: #10b981;
          color: white;
        }

        .input-tip {
          font-size: 0.7rem;
          font-weight: 600;
          color: #94a3b8;
          margin-top: 4px;
        }

        @media (max-width: 768px) {
          .form-grid { grid-template-columns: 1fr; }
          .form-group.full { grid-column: span 1; }
          .form-group-row { grid-template-columns: 1fr; grid-column: span 1; }
          .form-footer-actions { flex-direction: column-reverse; }
          .btn-cancel, .btn-submit-premium { width: 100%; justify-content: center; }
        }
      ` }} />
    </div>
  );
};

export default RegistrasiNIB;
