import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, MoreVertical, FileText, Calendar, Hash, MapPin, Send } from 'lucide-react';
import { db } from '../firebase';
import { ref, onValue, push, set } from 'firebase/database';

const SuratMenyurat = ({ type }) => {
  const isMasuk = type === 'masuk';
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Real-time Listener for Mail data
  useEffect(() => {
    const mailRef = ref(db, `surat/${type}`);
    const unsubscribe = onValue(mailRef, (snapshot) => {
      const docs = [];
      snapshot.forEach((child) => {
        docs.push({ id: child.key, ...child.val() });
      });
      setData(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [type]);

  const addDummyData = async () => {
    const mailRef = ref(db, `surat/${type}`);
    const dummy = isMasuk ? {
      tanggal: new Date().toISOString().split('T')[0],
      nomor: `00${data.length + 1}/SK/III/2026`,
      asal: 'Dinas Sosial Kota',
      tentang: 'Bantuan Operasional',
      ringkasan: 'Permohonan bantuan dana operasional bulanan.'
    } : {
      tanggal: new Date().toISOString().split('T')[0],
      nomor: `01${data.length + 1}/OUT/2026`,
      tujuan: 'Kelurahan Sejahtera',
      tentang: 'Pemberitahuan Kegiatan',
      ringkasan: 'Surat pemberitahuan rencana bakti sosial rutin.'
    };
    await push(mailRef, dummy);
  };

  const filteredData = data.filter(item => 
    item.nomor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (isMasuk ? item.asal : item.tujuan)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tentang?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mail-page fadeIn">
      <div className="page-header">
        <div className="header-info">
          <h1>{isMasuk ? 'Surat Masuk' : 'Surat Keluar'}</h1>
          <p>Data korespondensi cloud {isMasuk ? 'yang diterima' : 'yang dikirim'} kantor.</p>
        </div>
        <button className="btn btn-primary" onClick={addDummyData}>
          <Plus size={18} />
          <span>Tambah Data</span>
        </button>
      </div>

      <div className="toolbar glass-card">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Cari nomor, asal, atau tentang..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="toolbar-actions">
          <button className="icon-btn-outline"><Filter size={18} /></button>
          <div className="divider"></div>
          <span className="total-label">Total: {data.length} Data</span>
        </div>
      </div>

      <div className="table-responsive glass-card">
        {loading ? (
          <div className="p-10 text-center text-muted">Memuat data dari Firebase...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th><Calendar size={14} /> Tanggal</th>
                <th><Hash size={14} /> Nomor Surat</th>
                <th>{isMasuk ? <MapPin size={14} /> : <Send size={14} />} {isMasuk ? 'Asal' : 'Tujuan'}</th>
                <th><FileText size={14} /> Tentang</th>
                <th>Ringkasan Isi</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? filteredData.map((item) => (
                <tr key={item.id}>
                  <td className="font-medium text-blue">{new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
                  <td><span className="badge-outline">{item.nomor}</span></td>
                  <td className="font-semibold">{isMasuk ? item.asal : item.tujuan}</td>
                  <td>{item.tentang}</td>
                  <td><p className="truncate-2">{item.ringkasan}</p></td>
                  <td>
                    <button className="icon-btn-ghost"><MoreVertical size={16} /></button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Belum ada data tersedia di Firebase.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .mail-page { display: flex; flex-direction: column; gap: 1.5rem; }
        .page-header { display: flex; justify-content: space-between; align-items: center; }
        .header-info h1 { font-size: 1.5rem; font-weight: 800; color: var(--text-main); }
        .header-info p { color: var(--text-muted); font-size: 0.9rem; }
        .p-10 { padding: 2.5rem; }
        .toolbar { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; gap: 1rem; }
        .search-box { flex: 1; display: flex; align-items: center; gap: 0.75rem; background: var(--background); padding: 0.6rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border); max-width: 400px; }
        .search-box input { border: none; background: none; outline: none; width: 100%; font-size: 0.9rem; color: var(--text-main); }
        .toolbar-actions { display: flex; align-items: center; gap: 1rem; }
        .icon-btn-outline { padding: 0.6rem; border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--text-muted); transition: all 0.2s; }
        .icon-btn-outline:hover { border-color: var(--primary); color: var(--primary); background: rgba(37, 99, 235, 0.05); }
        .divider { width: 1px; height: 24px; background: var(--border); }
        .total-label { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); }
        .table-responsive { padding: 0; overflow-x: auto; }
        .data-table { width: 100%; border-collapse: collapse; text-align: left; }
        .data-table th { padding: 1.25rem 1.5rem; background: #f8fafc; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); border-bottom: 1px solid var(--border); }
        .data-table th svg { vertical-align: middle; margin-bottom: 2px; margin-right: 4px; }
        .data-table td { padding: 1.25rem 1.5rem; font-size: 0.9rem; border-bottom: 1px solid #f1f5f9; color: var(--text-main); }
        .data-table tr:hover td { background: rgba(37, 99, 235, 0.02); }
        .font-medium { font-weight: 500; }
        .font-semibold { font-weight: 600; }
        .text-blue { color: var(--primary); }
        .badge-outline { padding: 0.25rem 0.6rem; background: rgba(37, 99, 235, 0.05); border: 1px solid rgba(37, 99, 235, 0.2); border-radius: 6px; font-size: 0.75rem; font-weight: 700; color: var(--primary); }
        .truncate-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; color: var(--text-muted); }
        .icon-btn-ghost { color: var(--text-muted); padding: 0.4rem; border-radius: 50%; transition: background 0.2s; }
        .icon-btn-ghost:hover { background: var(--background); color: var(--text-main); }
        @media (max-width: 768px) { .toolbar { flex-direction: column; align-items: stretch; } .search-box { max-width: none; } }
      ` }} />
    </div>
  );
};

export default SuratMenyurat;
