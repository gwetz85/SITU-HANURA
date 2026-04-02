import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Users, 
  Trash2, 
  Download, 
  AlertTriangle, 
  Loader2, 
  RefreshCw,
  User,
  MapPin,
  Calendar,
  CreditCard,
  Filter,
  ChevronDown,
  Eye,
  LogOut,
  Map,
  Home,
  Info
} from 'lucide-react';
import { db } from '../firebase';
import { ref, onValue, remove } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { logActivity } from '../utils/logging';

const KeanggotaanHanura = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Filter States
  const [filterKecamatan, setFilterKecamatan] = useState('');
  const [filterKelurahan, setFilterKelurahan] = useState('');
  const [filterGender, setFilterGender] = useState('');

  useEffect(() => {
    const keanggotaanRef = ref(db, 'keanggotaan');
    const unsubscribe = onValue(keanggotaanRef, (snapshot) => {
      const items = [];
      snapshot.forEach((child) => {
        items.push({ id: child.key, ...child.val() });
      });
      // Sort A-Z by namaLengkap
      const sorted = items.sort((a, b) => 
        (a.namaLengkap || '').localeCompare(b.namaLengkap || '')
      );
      setData(sorted);
      setLoading(false);
      setIsRefreshing(false);
    }, (error) => {
      console.error("Error fetching membership data:", error);
      setLoading(false);
      setIsRefreshing(false);
    });

    return () => unsubscribe();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // onValue will handle the refresh automatically
  };

  const handleDeleteAll = async () => {
    if (deleteConfirmText !== 'HAPUS SEMUA') return;
    
    setIsDeleting(true);
    try {
      await remove(ref(db, 'keanggotaan'));
      await logActivity(db, 'Keanggotaan', 'Menghapus seluruh data anggota Hanura', user);
      setIsDeleteModalOpen(false);
      setDeleteConfirmText('');
      alert('Seluruh data anggota berhasil dihapus.');
    } catch (error) {
      alert('Gagal menghapus data: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const kecamatanList = [...new Set(data.map(item => item.kecamatan).filter(Boolean))].sort();
  const kelurahanList = [...new Set(data.map(item => item.kelurahan).filter(Boolean))].sort();

  const filteredData = data.filter(item => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = (
      item.namaLengkap?.toLowerCase().includes(search) ||
      item.kta?.toLowerCase().includes(search) ||
      item.nik?.includes(search) ||
      item.kecamatan?.toLowerCase().includes(search) ||
      item.kelurahan?.toLowerCase().includes(search)
    );

    const matchesKecamatan = !filterKecamatan || item.kecamatan === filterKecamatan;
    const matchesKelurahan = !filterKelurahan || item.kelurahan === filterKelurahan;
    const matchesGender = !filterGender || (filterGender === 'L' ? item.jenisKelamin?.startsWith('L') : item.jenisKelamin?.startsWith('P'));

    return matchesSearch && matchesKecamatan && matchesKelurahan && matchesGender;
  });

  const isAdmin = user?.role === 'Admin';

  return (
    <div className="keanggotaan-page fadeIn">
      <div className="page-header">
        <div className="header-info">
          <h1>Keanggotaan Hanura</h1>
          <p>Daftar data anggota Hanura yang telah diimport ke sistem.</p>
        </div>
        {isAdmin && (
          <button 
            className="btn btn-danger" 
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={data.length === 0}
          >
            <Trash2 size={18} />
            <span>HAPUS DATA ANGGOTA</span>
          </button>
        )}
      </div>

      <div className="toolbar glass-card-premium">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Cari Nama, KTA, NIK, atau Wilayah..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-tools">
          <div className="filter-group">
            <Filter size={14} className="text-muted" />
            <select value={filterKecamatan} onChange={(e) => { setFilterKecamatan(e.target.value); setFilterKelurahan(''); }}>
              <option value="">Semua Kecamatan</option>
              {kecamatanList.map(kec => <option key={kec} value={kec}>{kec}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <select value={filterKelurahan} onChange={(e) => setFilterKelurahan(e.target.value)}>
              <option value="">Semua Kelurahan</option>
              {kelurahanList
                .filter(kel => !filterKecamatan || data.find(d => d.kelurahan === kel)?.kecamatan === filterKecamatan)
                .map(kel => <option key={kel} value={kel}>{kel}</option>)
              }
            </select>
          </div>

          <div className="filter-group">
            <select value={filterGender} onChange={(e) => setFilterGender(e.target.value)}>
              <option value="">Semua Gender</option>
              <option value="L">Laki-laki (L)</option>
              <option value="P">Perempuan (P)</option>
            </select>
          </div>
        </div>

        <div className="toolbar-actions">
          <button className={`btn-refresh ${isRefreshing ? 'spinning' : ''}`} onClick={handleRefresh}>
            <RefreshCw size={16} /> <span>Refresh</span>
          </button>
          <span className="count-badge">{filteredData.length} Anggota</span>
        </div>
      </div>

      <div className="table-responsive glass-card-premium">
        {loading ? (
          <div className="p-10 text-center text-muted fadeIn">
             <div className="spinner-center"></div>
             <p>Memuat data anggota...</p>
          </div>
        ) : (
          <table className="modern-table">
            <thead>
              <tr>
                <th>Nama Lengkap & NIK</th>
                <th>Nomor KTA</th>
                <th>L/P</th>
                <th>Tempat, Tgl Lahir</th>
                <th>Wilayah (Kec/Kel)</th>
                <th>Alamat</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? filteredData.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="user-cell">
                      <span className="u-name">{item.namaLengkap}</span>
                      <span className="u-info">NIK: {item.nik}</span>
                    </div>
                  </td>
                  <td>
                    <div className="kta-cell">
                      <CreditCard size={14} className="text-primary" />
                      <span className="kta-number">{item.kta || '-'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`gender-tag ${item.jenisKelamin?.startsWith('L') ? 'male' : 'female'}`}>
                      {item.jenisKelamin?.charAt(0) || '-'}
                    </span>
                  </td>
                  <td>
                    <div className="birth-cell">
                      <span className="b-place">{item.tempatLahir}</span>
                      <span className="b-date">{item.tanggalLahir}</span>
                    </div>
                  </td>
                  <td>
                    <div className="region-cell">
                      <span className="r-kec">Kec. {item.kecamatan}</span>
                      <span className="r-kel">Kel. {item.kelurahan}</span>
                    </div>
                  </td>
                  <td className="address-cell">
                    <p className="truncated-text" title={item.alamat}>{item.alamat}</p>
                  </td>
                  <td>
                    <button className="btn-icon-view" onClick={() => setShowDetail(item)} title="Lihat Detail Profil">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="empty-state">
                    <div className="empty-content">
                      <Users size={48} className="opacity-20" />
                      <p>Tidak ada data anggota ditemukan.</p>
                      {isAdmin && <p className="small">Gunakan menu Pengaturan untuk mengimport data dari Excel.</p>}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Penghapusan Data"
        icon={<AlertTriangle className="text-danger" size={28} />}
        maxWidth="500px"
      >
        <div className="premium-modal-body-content text-center">
          <div className="warning-banner">
            <p>Tindakan ini akan menghapus **SELURUH** data anggota Hanura dari sistem ini secara permanen.</p>
          </div>

          <div className="confirm-input-group mt-6">
            <label>Ketik <strong className="text-danger">HAPUS SEMUA</strong> untuk konfirmasi:</label>
            <input 
              type="text" 
              className="confirm-input danger"
              placeholder="Konfirmasi di sini..."
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              disabled={isDeleting}
            />
          </div>

          <div className="modal-actions mt-8">
            <button className="btn btn-ghost" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting}>Batal</button>
            <button 
              className="btn btn-danger" 
              disabled={deleteConfirmText !== 'HAPUS SEMUA' || isDeleting}
              onClick={handleDeleteAll}
            >
              {isDeleting ? <Loader2 className="spinner" size={18} /> : <Trash2 size={18} />}
              <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus Semua Data'}</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Detail Member Modal */}
      <Modal
        isOpen={!!showDetail}
        onClose={() => setShowDetail(null)}
        title="Detail Profil Anggota Hanura"
        icon={<User className="text-primary" size={24} />}
        maxWidth="650px"
      >
        {showDetail && (
          <div className="member-detail-container fadeIn">
             <div className="member-hero">
                <div className="member-avatar">
                   {showDetail.namaLengkap?.charAt(0) || 'U'}
                </div>
                <div className="member-primary-info">
                   <h3>{showDetail.namaLengkap}</h3>
                   <div className="kta-badge">
                      <CreditCard size={14} />
                      <span>{showDetail.kta || 'Tidak Ada KTA'}</span>
                   </div>
                </div>
             </div>

             <div className="detail-sections">
                <div className="detail-row">
                   <div className="detail-data">
                      <span className="label"><User size={14} /> NIK</span>
                      <span className="value">{showDetail.nik || '-'}</span>
                   </div>
                   <div className="detail-data">
                      <span className="label"><Info size={14} /> Jenis Kelamin</span>
                      <span className="value">{showDetail.jenisKelamin || '-'}</span>
                   </div>
                </div>

                <div className="detail-row">
                   <div className="detail-data">
                      <span className="label"><Calendar size={14} /> TTL</span>
                      <span className="value">
                        {showDetail.tempatLahir}, {showDetail.tanggalLahir}
                      </span>
                   </div>
                </div>

                <div className="detail-row full">
                   <div className="detail-data">
                      <span className="label"><MapPin size={14} /> Wilayah Administratif</span>
                      <span className="value">
                        Kecamatan {showDetail.kecamatan}, Kelurahan {showDetail.kelurahan}
                      </span>
                   </div>
                </div>

                <div className="detail-row full">
                   <div className="detail-data">
                      <span className="label"><Home size={14} /> Alamat Lengkap</span>
                      <span className="value address-block">{showDetail.alamat}</span>
                   </div>
                </div>
             </div>

             <div className="modal-footer-single">
                <button className="btn btn-primary-full" onClick={() => setShowDetail(null)}>Tutup Detail</button>
             </div>
          </div>
        )}
      </Modal>

      <style dangerouslySetInnerHTML={{ __html: `
        .keanggotaan-page { display: flex; flex-direction: column; gap: 1.5rem; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-end; }
        .header-info h1 { font-size: 1.8rem; font-weight: 950; color: var(--text-main); letter-spacing: -0.5px; }
        .header-info p { color: var(--text-muted); font-size: 0.9rem; }

        .toolbar { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; gap: 1rem; flex-wrap: wrap; }
        .search-box { flex: 1; display: flex; align-items: center; gap: 0.75rem; background: var(--background); padding: 0.75rem 1.25rem; border-radius: 14px; border: 1px solid var(--border); min-width: 300px; }
        .search-box input { border: none; background: none; outline: none; width: 100%; font-size: 0.95rem; color: var(--text-main); font-weight: 500; }
        
        .filter-tools { display: flex; align-items: center; gap: 0.75rem; }
        .filter-group { display: flex; align-items: center; gap: 0.5rem; background: var(--background); padding: 0.4rem 0.75rem; border-radius: 10px; border: 1px solid var(--border); }
        .filter-group select { border: none; background: transparent; font-size: 0.8rem; font-weight: 700; color: var(--text-main); outline: none; cursor: pointer; }
        
        .toolbar-actions { display: flex; align-items: center; gap: 1rem; }
        .count-badge { font-size: 0.8rem; font-weight: 800; color: var(--primary); background: rgba(37,99,235,0.08); padding: 0.4rem 1rem; border-radius: 100px; white-space: nowrap; }

        .table-responsive { border: 1px solid var(--border) !important; padding: 0; }
        .modern-table { width: 100%; border-collapse: separate; border-spacing: 0; }
        .modern-table th { text-align: left; padding: 1.25rem; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); border-bottom: 2px solid var(--border); background: var(--background); letter-spacing: 0.5px; }
        .modern-table td { padding: 1.25rem; font-size: 0.9rem; border-bottom: 1px solid var(--border); vertical-align: middle; }
        .modern-table tr:hover td { background: rgba(37,99,235,0.015); }

        .user-cell { display: flex; flex-direction: column; gap: 2px; }
        .u-name { font-weight: 800; color: var(--text-main); font-size: 1rem; }
        .u-info { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; }

        .kta-cell { display: flex; align-items: center; gap: 8px; font-weight: 700; color: var(--text-main); }
        .kta-number { font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; }

        .gender-tag { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-weight: 900; font-size: 0.75rem; }
        .gender-tag.male { background: #eff6ff; color: #2563eb; border: 1px solid #dbeafe; }
        .gender-tag.female { background: #fdf2f8; color: #db2777; border: 1px solid #fce7f3; }

        .birth-cell { display: flex; flex-direction: column; }
        .b-place { font-weight: 700; color: var(--text-main); }
        .b-date { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; }

        .region-cell { display: flex; flex-direction: column; }
        .r-kec { font-weight: 700; color: var(--text-main); font-size: 0.85rem; }
        .r-kel { font-size: 0.75rem; color: var(--primary); font-weight: 800; }

        .address-cell { max-width: 250px; }
        .truncated-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.8rem; color: var(--text-muted); font-weight: 500; }

        .empty-state { padding: 100px 0; text-align: center; }
        .empty-content { display: flex; flex-direction: column; align-items: center; gap: 1rem; color: var(--text-muted); }
        .empty-content p { font-weight: 700; font-size: 1.1rem; }
        .empty-content .small { font-size: 0.85rem; font-weight: 500; }

        .warning-banner { background: #fef2f2; border: 1px dashed #f87171; padding: 1.25rem; border-radius: 12px; color: #b91c1c; font-weight: 600; line-height: 1.6; }
        .confirm-input.danger { border: 2px solid #ef4444 !important; text-align: center; font-weight: 800; letter-spacing: 1px; }

        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        .spinner-center { width: 40px; height: 40px; border: 4px solid rgba(37,99,235,0.1); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1.5rem; }

        .btn-icon-view { width: 34px; height: 34px; border-radius: 8px; border: 1px solid var(--border); background: white; display: flex; align-items: center; justify-content: center; color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
        .btn-icon-view:hover { color: var(--primary); border-color: var(--primary); background: rgba(37,99,235,0.05); transform: translateY(-2px); }

        /* Detail Modal Styles */
        .member-detail-container { padding: 0.5rem; }
        .member-hero { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem; background: rgba(37,99,235,0.04); padding: 1.5rem; border-radius: 16px; border: 1px solid rgba(37,99,235,0.1); }
        .member-avatar { width: 70px; height: 70px; background: var(--primary); color: white; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 800; box-shadow: 0 8px 16px rgba(37,99,235,0.2); }
        .member-primary-info h3 { font-size: 1.4rem; font-weight: 950; color: var(--text-main); margin-bottom: 0.25rem; letter-spacing: -0.5px; }
        .kta-badge { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; font-weight: 700; color: var(--primary); background: white; padding: 4px 10px; border-radius: 8px; border: 1px solid rgba(37,99,235,0.1); }
        
        .detail-sections { display: flex; flex-direction: column; gap: 1.5rem; margin-bottom: 2rem; }
        .detail-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
        .detail-row.full { grid-template-columns: 1fr; }
        .detail-data { display: flex; flex-direction: column; gap: 6px; }
        .detail-data .label { font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px; }
        .detail-data .value { font-size: 1rem; font-weight: 700; color: var(--text-main); }
        .address-block { background: var(--background); padding: 1.25rem; border-radius: 12px; border: 1px solid var(--border); line-height: 1.6; font-size: 0.9rem !important; }

        .modal-footer-single { margin-top: 2rem; border-top: 1px solid var(--border); padding-top: 1.5rem; }
        .btn-primary-full { width: 100%; padding: 1rem; border-radius: 12px; background: var(--primary); color: white; border: none; font-weight: 800; font-size: 0.95rem; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(37,99,235,0.2); }
        .btn-primary-full:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(37,99,235,0.3); }

        .btn-refresh { display: flex; align-items: center; gap: 8px; padding: 0.5rem 1rem; background: white; border: 1px solid var(--border); border-radius: 10px; font-size: 0.85rem; font-weight: 700; color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
        .btn-refresh:hover { color: var(--primary); border-color: var(--primary); }
        .btn-refresh.spinning svg { animation: spin 1s linear infinite; }

        .mt-6 { margin-top: 1.5rem; }
        .mt-8 { margin-top: 2rem; }

        @media (max-width: 1024px) {
          .modern-table { font-size: 0.8rem; }
          .modern-table th, .modern-table td { padding: 1rem 0.75rem; }
        }
      ` }} />
    </div>
  );
};

export default KeanggotaanHanura;
