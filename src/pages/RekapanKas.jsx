import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  FileText, 
  Download, 
  Search, 
  ChevronRight, 
  ArrowUpCircle, 
  ArrowDownCircle,
  Archive,
  Loader2,
  Clock
} from 'lucide-react';
import { db } from '../firebase';
import { ref, onValue, get } from 'firebase/database';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const RekapanKas = () => {
  const [archives, setArchives] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingData, setFetchingData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const archivesRef = ref(db, 'archives');
    const unsubscribe = onValue(archivesRef, (snapshot) => {
      if (snapshot.exists()) {
        const months = Object.keys(snapshot.val()).sort().reverse();
        setArchives(months);
        if (months.length > 0 && !selectedMonth) {
          setSelectedMonth(months[0]);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedMonth) {
      setFetchingData(true);
      const monthRef = ref(db, `archives/${selectedMonth}`);
      get(monthRef).then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const items = Object.entries(data).map(([id, val]) => ({
            id, ...val
          })).sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
          setTransactions(items);
        } else {
          setTransactions([]);
        }
        setFetchingData(false);
      });
    }
  }, [selectedMonth]);

  const calculateSummary = () => {
    const income = transactions
      .filter(t => t.tipe === 'masuk')
      .reduce((sum, t) => sum + (parseInt(t.jumlah) || 0), 0);
    const expense = transactions
      .filter(t => t.tipe === 'keluar')
      .reduce((sum, t) => sum + (parseInt(t.jumlah) || 0), 0);
    return { income, expense, balance: income - expense };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleDownloadPDF = () => {
    if (transactions.length === 0) return;

    const doc = new jsPDF();
    const summary = calculateSummary();
    const [year, month] = selectedMonth.split('-');
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const monthLabel = `${monthNames[parseInt(month) - 1]} ${year}`;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235); // Primary Blue
    doc.text("SITU HANURA", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("REKAPAN KAS OFFICE - LAPORAN BULANAN", 14, 28);
    doc.text(`Periode: ${monthLabel}`, 14, 33);

    // Summary Box
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 40, 182, 25, 'F');
    
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text("TOTAL PEMASUKAN", 20, 48);
    doc.text("TOTAL PENGELUARAN", 80, 48);
    doc.text("SALDO AKHIR", 140, 48);

    doc.setFontSize(11);
    doc.setTextColor(16, 185, 129); // Success Green
    doc.text(formatCurrency(summary.income), 20, 56);
    doc.setTextColor(239, 68, 68); // Danger Red
    doc.text(formatCurrency(summary.expense), 80, 56);
    doc.setTextColor(37, 99, 235); // Primary Blue
    doc.text(formatCurrency(summary.balance), 140, 56);

    // Table
    const tableData = transactions.map(t => [
      t.tanggal,
      t.keterangan,
      t.kategori,
      t.tipe === 'masuk' ? 'PEMASUKAN' : 'PENGELUARAN',
      formatCurrency(t.jumlah)
    ]);

    doc.autoTable({
      startY: 75,
      head: [['Tanggal', 'Keterangan', 'Kategori', 'Tipe', 'Jumlah']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], fontSize: 10, halign: 'center' },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 60 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 32, halign: 'right' }
      }
    });

    // Footer
    const finalY = doc.lastAutoTable.finalY || 150;
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, finalY + 15);
    doc.text("Powered by MTNET SOFTWARE GROUP", 105, finalY + 15, { align: 'center' });

    doc.save(`Rekapan_Kas_${selectedMonth}.pdf`);
  };

  const summary = calculateSummary();
  const filteredTransactions = transactions.filter(t => 
    t.keterangan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.kategori.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading-state">
        <Loader2 className="spinner" size={40} />
        <p>Memuat Arsip Rekapan...</p>
      </div>
    );
  }

  return (
    <div className="recap-page fadeIn">
      <div className="page-header">
        <div className="header-info">
          <h1>Rekapan Transaksi</h1>
          <p>Arsip data kas bulanan sistem SITU HANURA.</p>
        </div>
        <div className="header-actions">
          <select 
            className="month-selector"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {archives.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <button 
            className="btn btn-primary"
            disabled={transactions.length === 0 || fetchingData}
            onClick={handleDownloadPDF}
          >
            <Download size={18} />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      <div className="recap-summary-grid">
        <div className="summary-card income">
          <div className="summary-icon"><ArrowUpCircle /></div>
          <div className="summary-info">
            <span className="summary-label">Total Pemasukan</span>
            <h3 className="summary-value">{formatCurrency(summary.income)}</h3>
          </div>
        </div>
        <div className="summary-card expense">
          <div className="summary-icon"><ArrowDownCircle /></div>
          <div className="summary-info">
            <span className="summary-label">Total Pengeluaran</span>
            <h3 className="summary-value">{formatCurrency(summary.expense)}</h3>
          </div>
        </div>
        <div className="summary-card balance">
          <div className="summary-icon"><Archive /></div>
          <div className="summary-info">
            <span className="summary-label">Saldo Akhir</span>
            <h3 className="summary-value">{formatCurrency(summary.balance)}</h3>
          </div>
        </div>
      </div>

      <div className="archives-content glass-card">
        <div className="content-tools">
          <div className="search-box">
             <Search size={18} />
             <input 
              type="text" 
              placeholder="Cari keterangan atau kategori..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          <div className="archive-badge">
             <Clock size={14} />
             <span>Data Bulan: <strong>{selectedMonth}</strong></span>
          </div>
        </div>

        <div className="table-wrapper">
          {fetchingData ? (
            <div className="fetching-loader">
              <Loader2 className="spinner" />
              <span>Mengambil data...</span>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="empty-recap">
              <FileText size={48} />
              <p>Tidak ada data ditemukan untuk periode ini.</p>
            </div>
          ) : (
            <table className="recap-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Keterangan</th>
                  <th>Kategori</th>
                  <th>Tipe</th>
                  <th className="text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((t) => (
                  <tr key={t.id}>
                    <td><span className="date-badge">{t.tanggal}</span></td>
                    <td className="font-bold">{t.keterangan}</td>
                    <td><span className="cat-badge">{t.kategori}</span></td>
                    <td>
                      <span className={`type-badge ${t.tipe}`}>
                        {t.tipe === 'masuk' ? 'Pemasukan' : 'Pengeluaran'}
                      </span>
                    </td>
                    <td className={`text-right font-bold ${t.tipe === 'masuk' ? 'text-success' : 'text-danger'}`}>
                      {formatCurrency(t.jumlah)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .recap-page { display: flex; flex-direction: column; gap: 1.5rem; }
        .header-actions { display: flex; gap: 1rem; align-items: center; }
        
        .month-selector {
          padding: 0.6rem 2.5rem 0.6rem 1rem; border-radius: 10px; border: 1px solid var(--border);
          background: var(--surface); color: var(--text-main); font-weight: 700;
          cursor: pointer; appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 0.75rem center;
        }

        .recap-summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        .summary-card { padding: 1.5rem; border-radius: 16px; display: flex; align-items: center; gap: 1.25rem; background: var(--surface); border: 1px solid var(--border); }
        .summary-icon { width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
        .income .summary-icon { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .expense .summary-icon { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        .balance .summary-icon { background: rgba(37, 99, 235, 0.1); color: var(--primary); }
        
        .summary-label { font-size: 0.8rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }
        .summary-value { font-size: 1.3rem; font-weight: 900; margin-top: 2px; }

        .archives-content { padding: 0; overflow: hidden; border: 1px solid var(--border); }
        .content-tools { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
        
        .search-box { position: relative; width: 350px; }
        .search-box svg { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
        .search-box input { 
          width: 100%; padding: 0.7rem 1rem 0.7rem 2.8rem; border-radius: 100px; 
          border: 1px solid var(--border); background: var(--background); font-size: 0.9rem;
        }

        .archive-badge { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--text-muted); padding: 0.5rem 1rem; background: var(--background); border-radius: 8px; }

        .table-wrapper { min-height: 300px; }
        .recap-table { width: 100%; border-collapse: collapse; }
        .recap-table th { padding: 1.25rem 1.5rem; text-align: left; font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; border-bottom: 2px solid var(--border); background: rgba(0,0,0,0.02); }
        .recap-table td { padding: 1.2rem 1.5rem; border-bottom: 1px solid var(--border); font-size: 0.95rem; }
        
        .date-badge { font-family: monospace; font-weight: 700; color: var(--text-muted); }
        .cat-badge { padding: 4px 10px; background: var(--background); border: 1px solid var(--border); border-radius: 6px; font-size: 0.75rem; font-weight: 700; }
        
        .type-badge { padding: 4px 12px; border-radius: 100px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
        .type-badge.masuk { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .type-badge.keluar { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

        .text-success { color: #10b981; }
        .text-danger { color: #ef4444; }
        .text-right { text-align: right; }
        .font-bold { font-weight: 700; }

        .fetching-loader { padding: 5rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; color: var(--text-muted); }
        .empty-recap { padding: 5rem; text-align: center; color: var(--text-muted); display: flex; flex-direction: column; align-items: center; gap: 1rem; }

        @media (max-width: 1024px) {
          .recap-summary-grid { grid-template-columns: 1fr; }
          .header-actions { flex-direction: column; width: 100%; }
          .search-box { width: 100%; }
          .content-tools { flex-direction: column; gap: 1rem; }
        }
      ` }} />
    </div>
  );
};

export default RekapanKas;
