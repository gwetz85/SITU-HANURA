import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  User, 
  Briefcase, 
  ArrowRight,
  ShieldCheck,
  Package,
  Droplets,
  FileText,
  Calendar,
  MoreVertical
} from 'lucide-react';
import { db } from '../firebase';
import { ref, onValue, update } from 'firebase/database';
import Modal from '../components/Modal';
import { logActivity } from '../utils/logging';
import { useAuth } from '../context/AuthContext';

const DataPekerjaan = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetail, setShowDetail] = useState(null);
  const [filterType, setFilterType] = useState('Semua');

  useEffect(() => {
    const fetchAllData = () => {
      const nibRef = ref(db, 'pelayanan/nib');
      const halalRef = ref(db, 'pelayanan/halal');
      
      let nibData = [];
      let halalData = [];

      const unsubscribeNib = onValue(nibRef, (snapshot) => {
        const items = [];
        snapshot.forEach((child) => {
          items.push({ id: child.key, ...child.val(), category: 'NIB' });
        });
        nibData = items;
        combineData();
      });

      const unsubscribeHalal = onValue(halalRef, (snapshot) => {
        const items = [];
        snapshot.forEach((child) => {
          items.push({ id: child.key, ...child.val(), category: 'Halal' });
        });
        halalData = items;
        combineData();
      });

      const combineData = () => {
        const combined = [...nibData, ...halalData].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setData(combined);
        setLoading(false);
      };

      return () => {
        unsubscribeNib();
        unsubscribeHalal();
      };
    };

    fetchAllData();
  }, []);

  const updateStatus = async (item, newStatus) => {
    if (!window.confirm(`Ubah status menjadi "${newStatus}"?`)) return;

    try {
      const path = item.category === 'NIB' ? `pelayanan/nib/${item.id}` : `pelayanan/halal/${item.id}`;
      await update(ref(db, path), { 
        status: newStatus,
        updatedAt: new Date().toISOString(),
        processedBy: user?.name || user?.username
      });
      
      await logActivity(db, 'Data Pekerjaan', `Ubah status ${item.category} ${item.pelakuUsaha?.nama} menjadi ${newStatus}`, user);
      
      if (showDetail) setShowDetail({ ...showDetail, status: newStatus });
      alert('Status berhasil diperbarui');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Gagal memperbarui status');
    }
  };

  const filteredData = data.filter(item => {
    const matchesSearch = item.pelakuUsaha?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.pelakuUsaha?.nik?.includes(searchTerm);
    const matchesType = filterType === 'Semua' || item.category === filterType;
    return matchesSearch && matchesType;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Selesai': return 'status-green';
      case 'Dalam Proses': return 'status-yellow';
      default: return 'status-yellow';
    }
  };

  return (
    <div className="pekerjaan-page fadeIn">
      <div className="page-header">
        <div className="header-info">
          <h1>Data Pekerjaan</h1>
          <p>Daftar pengajuan registrasi masyarakat yang perlu diproses dan diverifikasi.</p>
        </div>
      </div>

      <div className="toolbar glass-card-premium">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Cari nama atau NIK..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="toolbar-actions">
          <div className="filter-group">
            <Filter size={16} />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="Semua">Semua Layanan</option>
              <option value="NIB">Registrasi NIB</option>
              <option value="Halal">Registrasi Halal</option>
            </select>
          </div>
          <span className="count-badge">{filteredData.length} Data</span>
        </div>
      </div>

      <div className="table-responsive glass-card-premium">
        {loading ? (
          <div className="p-10 text-center text-muted">Memuat data pekerjaan...</div>
        ) : (
          <table className="modern-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Kategori</th>
                <th>Pelaku Usaha</th>
                <th>Usaha</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? filteredData.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="date-cell">
                      <span className="d-main">{new Date(item.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</span>
                      <span className="d-time">{new Date(item.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </td>
                  <td><span className={`cat-tag ${item.category.toLowerCase()}`}>{item.category}</span></td>
                  <td>
                    <div className="user-cell">
                      <span className="u-name">{item.pelakuUsaha?.nama}</span>
                      <span className="u-info">{item.pelakuUsaha?.nik}</span>
                    </div>
                  </td>
                  <td>
                    <span className="b-name">{item.usahaList?.[0]?.namaUsaha}</span>
                    {item.usahaList?.length > 1 && <span className="b-count">+{item.usahaList.length - 1} lainnya</span>}
                  </td>
                  <td>
                    <span className={`status-pill ${getStatusBadgeClass(item.status)}`}>
                      {item.status === 'Selesai' ? <CheckCircle size={12} /> : <Clock size={12} />}
                      {item.status || 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon-view" onClick={() => setShowDetail(item)}><Eye size={16} /></button>
                      <button className="btn-icon-check" onClick={() => updateStatus(item, 'Selesai')} title="Tandai Selesai"><CheckCircle size={16} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" className="empty-state">Tidak ada data ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!showDetail}
        onClose={() => setShowDetail(null)}
        title={`Detail Pengajuan ${showDetail?.category}`}
        icon={showDetail?.category === 'NIB' ? <Fingerprint size={24} /> : <ShieldCheck size={24} />}
        footer={
          <div className="modal-footer-btns">
            <button className="btn btn-ghost" onClick={() => setShowDetail(null)}>Tutup</button>
            {showDetail?.status !== 'Selesai' && (
              <button className="btn btn-primary" onClick={() => updateStatus(showDetail, 'Selesai')}>
                Selesaikan Pekerjaan
              </button>
            )}
          </div>
        }
      >
        {showDetail && (
          <div className="detail-view">
             <div className="detail-status-banner" style={{ background: showDetail.status === 'Selesai' ? '#ecfdf5' : '#fffbeb' }}>
                <div className="status-label">STATUS PEKERJAAN: <span style={{ color: showDetail.status === 'Selesai' ? '#10b981' : '#f59e0b', fontWeight: 800 }}>{showDetail.status?.toUpperCase() || 'PENDING'}</span></div>
                {showDetail.processedBy && <div className="processed-label">Diproses oleh: {showDetail.processedBy}</div>}
             </div>

             <div className="detail-grid">
                <div className="detail-section">
                   <h4><User size={16} /> Data Pelaku Usaha</h4>
                   <div className="info-list">
                      <div className="info-item"><span className="label">Nama</span><span className="value">{showDetail.pelakuUsaha?.nama}</span></div>
                      <div className="info-item"><span className="label">NIK</span><span className="value">{showDetail.pelakuUsaha?.nik}</span></div>
                      <div className="info-item"><span className="label">HP</span><span className="value">{showDetail.pelakuUsaha?.ponsel}</span></div>
                      <div className="info-item"><span className="label">Email</span><span className="value">{showDetail.pelakuUsaha?.email || '-'}</span></div>
                      <div className="info-item"><span className="label">Alamat</span><span className="value">{showDetail.pelakuUsaha?.alamat}, Kel. {showDetail.pelakuUsaha?.kelurahan}</span></div>
                   </div>
                </div>

                <div className="detail-section">
                   <h4><Briefcase size={16} /> Data Usaha</h4>
                   {showDetail.usahaList?.map((u, i) => (
                     <div key={i} className="business-item">
                        <div className="b-header">Usaha #{i+1}: {u.namaUsaha}</div>
                        <div className="info-list compact">
                           <div className="info-item"><span className="label">Bidang</span><span className="value">{u.bidangUsaha}</span></div>
                           <div className="info-item"><span className="label">Modal</span><span className="value">{u.modalUsaha}</span></div>
                           <div className="info-item"><span className="label">Alamat</span><span className="value">{u.alamatUsaha}</span></div>
                        </div>
                     </div>
                   ))}
                </div>

                {showDetail.category === 'Halal' && showDetail.halalDetails && (
                  <>
                    <div className="detail-section full">
                       <h4><ShieldCheck size={16} /> Detail Sertifikasi Halal</h4>
                       <div className="halal-info-grid">
                          <div className="halal-sub">
                             <div className="sub-title"><Package size={14} /> Bahan ({showDetail.halalDetails.bahan?.length})</div>
                             <div className="item-tags">
                                {showDetail.halalDetails.bahan?.map((b, i) => <span key={i} className="tag">{b}</span>)}
                             </div>
                          </div>
                          <div className="halal-sub">
                             <div className="sub-title"><Box size={14} /> Kemasan ({showDetail.halalDetails.kemasan?.length})</div>
                             <div className="item-tags">
                                {showDetail.halalDetails.kemasan?.map((k, i) => <span key={i} className="tag">{k}</span>)}
                             </div>
                          </div>
                       </div>
                    </div>
                    <div className="detail-section full">
                       <h4><FileText size={16} /> Tata Cara Pembuatan</h4>
                       <div className="tata-cara-content">
                          {showDetail.halalDetails.tataCara}
                       </div>
                    </div>
                  </>
                )}
             </div>
          </div>
        )}
      </Modal>

      <style dangerouslySetInnerHTML={{ __html: `
        .pekerjaan-page { display: flex; flex-direction: column; gap: 1rem; }
        .page-header { margin-bottom: 0.5rem; }
        .header-info h1 { font-size: 1.5rem; font-weight: 900; color: var(--text-main); }
        .header-info p { font-size: 0.85rem; color: var(--text-muted); }

        .toolbar { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; gap: 1rem; }
        .search-box { flex: 1; display: flex; align-items: center; gap: 0.75rem; background: var(--background); padding: 0.6rem 1rem; border-radius: 12px; border: 1px solid var(--border); max-width: 400px; }
        .search-box input { border: none; background: none; outline: none; width: 100%; font-size: 0.9rem; color: var(--text-main); }
        
        .toolbar-actions { display: flex; align-items: center; gap: 1.5rem; }
        .filter-group { display: flex; align-items: center; gap: 0.75rem; color: var(--text-muted); }
        .filter-group select { border: 1px solid var(--border); background: var(--background); padding: 0.4rem 0.75rem; border-radius: 8px; font-weight: 700; font-size: 0.8rem; color: var(--text-main); }
        .count-badge { font-size: 0.75rem; font-weight: 800; color: var(--primary); background: rgba(37,99,235,0.1); padding: 0.3rem 0.8rem; border-radius: 100px; }

        .table-responsive { padding: 0; overflow-x: auto; border: 1px solid var(--border) !important; }
        .modern-table { width: 100%; border-collapse: separate; border-spacing: 0; }
        .modern-table th { text-align: left; padding: 1rem 1.25rem; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); border-bottom: 2px solid var(--border); background: var(--background); }
        .modern-table td { padding: 1rem 1.25rem; font-size: 0.85rem; border-bottom: 1px solid var(--border); vertical-align: middle; }
        .modern-table tr:last-child td { border-bottom: none; }
        .modern-table tr:hover td { background: rgba(37, 99, 235, 0.02); }

        .date-cell { display: flex; flex-direction: column; }
        .d-main { font-weight: 800; color: var(--text-main); }
        .d-time { font-size: 0.65rem; color: var(--text-muted); }

        .cat-tag { font-size: 0.65rem; font-weight: 900; padding: 0.25rem 0.6rem; border-radius: 6px; text-transform: uppercase; }
        .cat-tag.nib { background: #eff6ff; color: #2563eb; }
        .cat-tag.halal { background: #ecfdf5; color: #10b981; }

        .user-cell { display: flex; flex-direction: column; }
        .u-name { font-weight: 700; color: var(--text-main); }
        .u-info { font-size: 0.75rem; color: var(--text-muted); }

        .b-name { font-weight: 600; color: var(--text-main); }
        .b-count { font-size: 0.7rem; color: var(--primary); font-weight: 800; margin-left: 4px; }

        .status-pill { display: inline-flex; align-items: center; gap: 4px; padding: 0.3rem 0.75rem; border-radius: 100px; font-size: 0.75rem; font-weight: 800; }
        .status-yellow { background: #fffbeb; color: #f59e0b; border: 1px solid #fde68a; }
        .status-green { background: #ecfdf5; color: #10b981; border: 1px solid #a7f3d0; }

        .action-btns { display: flex; gap: 0.5rem; }
        .btn-icon-view { width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; color: var(--text-muted); transition: all 0.2s; }
        .btn-icon-view:hover { color: var(--primary); border-color: var(--primary); background: rgba(37,99,235,0.05); }
        .btn-icon-check { width: 32px; height: 32px; border-radius: 8px; border: 1px solid #a7f3d0; background: #ecfdf5; display: flex; align-items: center; justify-content: center; color: #10b981; transition: all 0.2s; }
        .btn-icon-check:hover { background: #10b981; color: white; transform: translateY(-2px); }

        /* Detail Modal Styles */
        .detail-view { display: flex; flex-direction: column; gap: 1.5rem; }
        .detail-status-banner { padding: 1rem; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; }
        .status-label { font-weight: 700; color: var(--text-muted); }
        .processed-label { font-weight: 600; color: var(--text-muted); display: flex; align-items: center; gap: 6px; }

        .detail-grid { display: flex; flex-direction: column; gap: 1.5rem; }
        .detail-section h4 { font-size: 0.9rem; font-weight: 800; color: var(--text-main); margin-bottom: 1rem; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; }
        .info-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
        .info-item { display: flex; flex-direction: column; gap: 2px; }
        .info-item .label { font-size: 0.7rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }
        .info-item .value { font-size: 0.9rem; font-weight: 700; color: var(--text-main); }
        
        .business-item { padding: 1rem; background: var(--background); border-radius: 12px; border: 1px solid var(--border); margin-bottom: 0.5rem; }
        .b-header { font-size: 0.85rem; font-weight: 800; color: var(--primary); margin-bottom: 0.75rem; }
        .info-list.compact { grid-template-columns: 1fr; gap: 0.5rem; }

        .halal-info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
        .halal-sub { display: flex; flex-direction: column; gap: 0.5rem; }
        .sub-title { font-size: 0.75rem; font-weight: 800; color: var(--text-muted); display: flex; align-items: center; gap: 6px; }
        .item-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .tag { font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.6rem; background: white; border: 1px solid var(--border); border-radius: 6px; color: var(--text-main); }

        .tata-cara-content { padding: 1rem; background: var(--background); border-radius: 12px; font-size: 0.9rem; line-height: 1.6; white-space: pre-wrap; color: var(--text-main); border: 1px solid var(--border); }
        
        .modal-footer-btns { display: flex; gap: 1rem; }
        .btn { padding: 0.6rem 1.5rem; border-radius: 10px; font-weight: 800; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
        .btn-ghost { background: none; border: 1px solid var(--border); color: var(--text-muted); }
        .btn-ghost:hover { background: #f1f5f9; color: var(--text-main); }
        .btn-primary { background: var(--primary); color: white; border: none; box-shadow: 0 4px 12px rgba(37,99,235,0.2); }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(37,99,235,0.3); }

        @media (max-width: 768px) {
          .toolbar { flex-direction: column; align-items: stretch; }
          .search-box { max-width: none; }
          .toolbar-actions { justify-content: space-between; }
          .info-list { grid-template-columns: 1fr; }
          .halal-info-grid { grid-template-columns: 1fr; }
        }
      ` }} />
    </div>
  );
};

export default DataPekerjaan;
