import React, { useState, useEffect } from 'react';
import { 
  Calendar, Trash2, Search, Clock, 
  MapPin, AlertCircle, Info, ArrowLeft, RefreshCcw
} from 'lucide-react';
import { db } from '../firebase';
import { ref, onValue, remove, update } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ArsipKegiatan = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const actRef = ref(db, 'activities');
    const unsubscribe = onValue(actRef, (snapshot) => {
      const items = [];
      snapshot.forEach((child) => {
        const val = child.val();
        if (val.status === 'Selesai') {
          items.push({ id: child.key, ...val });
        }
      });
      // Sort by finishedAt (desc)
      items.sort((a, b) => new Date(b.finishedAt) - new Date(a.finishedAt));
      setActivities(items);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Hapus permanen data arsip ini? Tindakan ini tidak dapat dibatalkan.')) {
      await remove(ref(db, `activities/${id}`));
    }
  };

  const handleRestore = async (id) => {
    if (window.confirm('Kembalikan kegiatan ini ke daftar aktif?')) {
      try {
        await update(ref(db, `activities/${id}`), { 
          status: 'Active',
          restoredAt: new Date().toISOString()
        });
        alert('Kegiatan telah dikembalikan ke daftar aktif');
      } catch (err) {
        alert('Gagal memulihkan kegiatan');
      }
    }
  };

  const filteredActivities = activities.filter(a => 
    a.judul.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="activity-manager fadeIn">
      <div className="page-header">
        <div className="header-info">
          <div className="flex items-center gap-2 mb-2">
            <button className="icon-btn" onClick={() => navigate('/admin/kegiatan')} style={{ padding: '0.25rem' }}><ArrowLeft size={18} /></button>
            <h1 style={{ margin: 0 }}>Arsip Kegiatan Selesai</h1>
          </div>
          <p>Daftar kegiatan yang telah selesai dilaksanakan dan diarsipkan.</p>
        </div>
      </div>

      <div className="toolbar glass-card">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Cari dalam arsip..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-responsive glass-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tgl Selesai</th>
              <th>Judul & Tipe</th>
              <th>Lokasi</th>
              <th>Author</th>
              <th className="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center p-10">Memuat data arsip...</td></tr>
            ) : filteredActivities.length > 0 ? filteredActivities.map(act => (
              <tr key={act.id}>
                <td>
                  <div className="flex flex-col">
                    <span className="font-bold text-muted">{new Date(act.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                    <span style={{ fontSize: '0.65rem', color: '#10b981' }}>Selesai: {act.finishedAt ? new Date(act.finishedAt).toLocaleDateString('id-ID') : '-'}</span>
                  </div>
                </td>
                <td>
                  <div className="name-cell">
                    <span className="font-bold">{act.judul}</span>
                    <span className={`status-badge keluar`}>Selesai</span>
                  </div>
                </td>
                <td><div className="flex items-center gap-1 text-muted"><MapPin size={14} /> {act.lokasi}</div></td>
                <td className="font-semibold text-primary">@{act.author}</td>
                <td className="text-right">
                  <div className="action-group">
                    <button className="icon-btn-edit" onClick={() => handleRestore(act.id)} title="Restore (Aktifkan Kembali)" style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)' }}><RefreshCcw size={16} /></button>
                    <button className="icon-btn-delete" onClick={() => handleDelete(act.id)} title="Hapus Permanen"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="5" className="text-center p-10 text-muted">Tidak ada kegiatan di arsip.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .activity-manager { display: flex; flex-direction: column; gap: 1rem; }
        .page-header { display: flex; justify-content: space-between; align-items: center; }
        .header-info h1 { font-size: 1.25rem; font-weight: 800; }
        .header-info p { color: var(--text-muted); font-size: 0.8rem; }
        .status-badge.keluar { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        
        .p-10 { padding: 2.5rem; }
        .text-right { text-align: right; }
        .flex-col { display: flex; flex-direction: column; }
      ` }} />
    </div>
  );
};

export default ArsipKegiatan;
