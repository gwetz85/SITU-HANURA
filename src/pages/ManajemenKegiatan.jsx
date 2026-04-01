import React, { useState, useEffect } from 'react';
import { 
  Calendar, Plus, Trash2, Edit2, Save, X, Search, Clock, 
  MapPin, MessageSquare, AlertCircle, Info, Send 
} from 'lucide-react';
import { db } from '../firebase';
import { ref, onValue, push, remove, update } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

const ManajemenKegiatan = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formValues, setFormValues] = useState({
    judul: '',
    tanggal: new Date().toISOString().split('T')[0],
    lokasi: 'DPC HANURA TANJUNGPINANG',
    deskripsi: '',
    tipe: 'Kegiatan' // 'Kegiatan' atau 'Informasi'
  });

  useEffect(() => {
    const actRef = ref(db, 'activities');
    const unsubscribe = onValue(actRef, (snapshot) => {
      const items = [];
      snapshot.forEach((child) => {
        items.push({ id: child.key, ...child.val() });
      });
      // Sort by date (desc)
      items.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
      setActivities(items);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (user?.role !== 'Admin') return alert('Akses ditolak!');
    
    try {
      const data = { 
        ...formValues, 
        author: user.name || user.username,
        updatedAt: new Date().toISOString() 
      };

      if (editingId) {
        await update(ref(db, `activities/${editingId}`), data);
        alert('Kegiatan berhasil diperbarui');
      } else {
        await push(ref(db, 'activities'), { ...data, createdAt: new Date().toISOString() });
        alert('Kegiatan baru berhasil diposting');
      }
      resetForm();
    } catch (err) {
      alert('Gagal menyimpan data');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus postingan kegiatan ini?')) {
      await remove(ref(db, `activities/${id}`));
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormValues({
      judul: item.judul,
      tanggal: item.tanggal,
      lokasi: item.lokasi,
      deskripsi: item.deskripsi,
      tipe: item.tipe
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormValues({
      judul: '',
      tanggal: new Date().toISOString().split('T')[0],
      lokasi: 'DPC HANURA TANJUNGPINANG',
      deskripsi: '',
      tipe: 'Kegiatan'
    });
  };

  const filteredActivities = activities.filter(a => 
    a.judul.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="activity-manager fadeIn">
      <div className="page-header">
        <div className="header-info">
          <h1>Manajemen Kegiatan & Informasi</h1>
          <p>Bagikan agenda kegiatan dan informasi penting ke Dashboard utama.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={18} />
          <span>Buat Postingan Baru</span>
        </button>
      </div>

      <div className="toolbar glass-card">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Cari judul kegiatan..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-responsive glass-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Judul & Tipe</th>
              <th>Lokasi</th>
              <th>Author</th>
              <th className="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center p-10">Memuat data...</td></tr>
            ) : filteredActivities.length > 0 ? filteredActivities.map(act => (
              <tr key={act.id}>
                <td><span className="font-bold text-muted">{new Date(act.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span></td>
                <td>
                  <div className="name-cell">
                    <span className="font-bold">{act.judul}</span>
                    <span className={`status-badge ${act.tipe === 'Kegiatan' ? 'masuk' : 'pending'}`}>{act.tipe}</span>
                  </div>
                </td>
                <td><div className="flex items-center gap-1 text-muted"><MapPin size={14} /> {act.lokasi}</div></td>
                <td className="font-semibold text-primary">@{act.author}</td>
                <td className="text-right">
                  <div className="action-group">
                    <button className="icon-btn-edit" onClick={() => handleEdit(act)}><Edit2 size={16} /></button>
                    <button className="icon-btn-delete" onClick={() => handleDelete(act.id)}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="5" className="text-center p-10 text-muted">Belum ada kegiatan yang diposting.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={showForm}
        onClose={resetForm}
        title={editingId ? 'Edit Postingan Kegiatan' : 'Buat Kegiatan Baru'}
        icon={<Send size={24} />}
      >
        <form onSubmit={handleSave} className="emp-form">
          <div className="premium-modal-section">
            <h4 className="premium-section-title"><AlertCircle size={18} /> Detail Konten</h4>
            <div className="form-group">
              <label>Judul Kegiatan / Informasi</label>
              <input required name="judul" value={formValues.judul} onChange={handleInputChange} placeholder="Contoh: Rapat Pleno DPC..." />
            </div>
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.2rem' }}>
              <div className="form-group">
                <label>Tanggal Pelaksanaan</label>
                <input required type="date" name="tanggal" value={formValues.tanggal} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Tipe Postingan</label>
                <select name="tipe" value={formValues.tipe} onChange={handleInputChange}>
                  <option value="Kegiatan">Kegiatan Partai</option>
                  <option value="Informasi">Informasi / Pengumuman</option>
                </select>
              </div>
            </div>
          </div>

          <div className="premium-modal-section">
            <h4 className="premium-section-title"><MapPin size={18} /> Lokasi & Deskripsi</h4>
            <div className="form-group">
              <label>Lokasi / Tempat</label>
              <input required name="lokasi" value={formValues.lokasi} onChange={handleInputChange} placeholder="Tempat kegiatan..." />
            </div>
            <div className="form-group" style={{ marginTop: '1.2rem' }}>
              <label>Deskripsi Lengkap</label>
              <textarea required name="deskripsi" value={formValues.deskripsi} onChange={handleInputChange} style={{ minHeight: '120px' }} placeholder="Tuliskan detail kegiatan di sini..."></textarea>
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" className="btn btn-ghost" onClick={resetForm}>Batal</button>
            <button type="submit" className="btn btn-primary"><Save size={18} /> Publish Sekarang</button>
          </div>
        </form>
      </Modal>

      <style dangerouslySetInnerHTML={{ __html: `
        .activity-manager { display: flex; flex-direction: column; gap: 1rem; }
        .page-header { display: flex; justify-content: space-between; align-items: center; }
        .header-info h1 { font-size: 1.25rem; font-weight: 800; }
        .header-info p { color: var(--text-muted); font-size: 0.8rem; }
        .status-badge.pending { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        
        .p-10 { padding: 2.5rem; }
        .text-right { text-align: right; }
      ` }} />
    </div>
  );
};

export default ManajemenKegiatan;
