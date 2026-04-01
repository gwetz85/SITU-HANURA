import React from 'react';

const SlipGaji = ({ data }) => {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      maximumFractionDigits: 0 
    }).format(val || 0);
  };

  const formatNumber = (val) => {
    return new Intl.NumberFormat('id-ID').format(val || 0);
  };

  const periodLong = data.bulan_gaji || new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' });
  const timestamp = new Date().toLocaleString('id-ID');
  
  // Calculations - Handle older simplified archives (where gaji is 0 but sisa_gaji exists)
  const isSimplified = !data.gaji && (data.sisa_gaji || data.penerimaanBersih);
  
  const earnings = {
    gaji: isSimplified ? (data.sisa_gaji || data.penerimaanBersih) + (data.totalKasbon || 0) : (data.gaji || 0),
    tunjangan_jabatan: data.tunjangan_jabatan || 0,
    tunjangan_makan: data.tunjangan_makan || 0,
    bonus_kinerja: data.bonus_kinerja || 0
  };

  const totalPenghasilan = earnings.gaji + earnings.tunjangan_jabatan + earnings.tunjangan_makan + earnings.bonus_kinerja;
  const totalPotongan = (data.totalKasbon || 0) + (data.bpjs_kesehatan || 0) + (data.bpjs_ketenagakerjaan || 0) + (data.iuran_koperasi || 0);
  const penerimaanBersih = totalPenghasilan - totalPotongan;

  return (
    <div className="a4-slip-wrapper">
      <div className="a4-slip-document print-container">
        {/* Header Section */}
        <div className="slip-header">
          <div className="header-brand">
            <div className="brand-logo">H</div>
            <div className="brand-text">
              <h1 className="company-name">PARTAI HATI NURANI RAKYAT</h1>
              <p className="branch-name">DEWAN PIMPINAN CABANG (DPC) KOTA TANJUNGPINANG</p>
            </div>
          </div>
          <div className="document-title">
            <h2>SLIP GAJI KARYAWAN</h2>
            <p className="period-badge">{periodLong}</p>
          </div>
        </div>

        <div className="divider-line"></div>

        {/* Employee & Info Section */}
        <div className="info-grid">
          <div className="info-column">
            <div className="info-row"><span className="label">Nama Lengkap</span><span className="value">: {data.nama}</span></div>
            <div className="info-row"><span className="label">NIK</span><span className="value">: {data.nik || '-'}</span></div>
            <div className="info-row"><span className="label">Jabatan</span><span className="value">: {data.jabatan || 'Staf'}</span></div>
          </div>
          <div className="info-column text-right">
            <div className="info-row"><span className="label">Metode Bayar</span><span className="value">: Transfer {data.bank || 'Bank'}</span></div>
            <div className="info-row"><span className="label">Tanggal Cetak</span><span className="value">: {timestamp}</span></div>
            <div className="info-row"><span className="label">Status</span><span className="value">: <span className="paid-tag">Paid</span></span></div>
          </div>
        </div>

        {/* Payroll Breakdown Section */}
        <div className="payroll-container">
          <div className="payroll-column">
            <h3 className="section-title">I. PENGHASILAN {isSimplified && '(ARSIP)'}</h3>
            <table className="payroll-table">
              <tbody>
                <tr><td>Gaji Pokok</td><td className="amount">{formatCurrency(earnings.gaji)}</td></tr>
                {earnings.tunjangan_jabatan > 0 && <tr><td>Tunjangan Jabatan</td><td className="amount">{formatCurrency(earnings.tunjangan_jabatan)}</td></tr>}
                {earnings.tunjangan_makan > 0 && <tr><td>Tunjangan Makan</td><td className="amount">{formatCurrency(earnings.tunjangan_makan)}</td></tr>}
                {earnings.bonus_kinerja > 0 && <tr><td>Bonus Kinerja / Insentif</td><td className="amount">{formatCurrency(earnings.bonus_kinerja)}</td></tr>}
                <tr className="total-row"><td>Total Penghasilan (A)</td><td className="amount">{formatCurrency(totalPenghasilan)}</td></tr>
              </tbody>
            </table>
          </div>

          <div className="payroll-column">
            <h3 className="section-title">II. POTONGAN</h3>
            <table className="payroll-table">
              <tbody>
                <tr><td>Kasbon / Pinjaman</td><td className="amount">({formatCurrency(data.totalKasbon)})</td></tr>
                {data.bpjs_kesehatan > 0 && <tr><td>BPJS Kesehatan</td><td className="amount">({formatCurrency(data.bpjs_kesehatan)})</td></tr>}
                {data.bpjs_ketenagakerjaan > 0 && <tr><td>BPJS Ketenagakerjaan</td><td className="amount">({formatCurrency(data.bpjs_ketenagakerjaan)})</td></tr>}
                {data.iuran_koperasi > 0 && <tr><td>Iuran Koperasi</td><td className="amount">({formatCurrency(data.iuran_koperasi)})</td></tr>}
                <tr className="total-row"><td>Total Potongan (B)</td><td className="amount">({formatCurrency(totalPotongan)})</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Total Footer Section */}
        <div className="summary-section">
          <div className="summary-card">
            <div className="summary-row">
              <span className="summary-label">PENERIMAAN BERSIH (A - B)</span>
              <span className="summary-value">{formatCurrency(penerimaanBersih)}</span>
            </div>
            <div className="terbilang-box">
              <p># {data.terbilang || '...'} Rupiah #</p>
            </div>
          </div>
        </div>

        {/* Footer & Signature Section */}
        <div className="signature-section">
          <div className="signature-box">
            <p className="sig-label">Penerima,</p>
            <div className="sig-space"></div>
            <p className="sig-name">{data.nama}</p>
          </div>
          <div className="signature-box text-right">
            <p className="sig-label">Tanjungpinang, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="sig-label">Bendahara Kelola,</p>
            <div className="sig-space"></div>
            <p className="sig-name">ENDANG WIRNANTO</p>
          </div>
        </div>

        <div className="doc-footer">
          <p>Dokumen ini dihasilkan secara otomatis oleh SITU HANURA Cloud System.</p>
          <p>Dilarang menyebarluaskan dokumen ini tanpa izin yang berwenang.</p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .a4-slip-wrapper {
          background: #f1f5f9;
          padding: 3rem 1rem;
          display: flex;
          justify-content: center;
          font-family: 'Inter', -apple-system, sans-serif;
          color: #1e293b;
        }

        .a4-slip-document {
          background: white;
          width: 210mm;
          min-height: 297mm;
          padding: 20mm;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          position: relative;
          display: flex;
          flex-direction: column;
        }

        /* Header Styles */
        .slip-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .header-brand {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .brand-logo {
          width: 54px;
          height: 54px;
          background: #2563eb;
          color: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 900;
          box-shadow: 0 4px 12px rgba(37,99,235,0.2);
        }

        .company-name { font-size: 1.25rem; font-weight: 900; color: #0f172a; margin: 0; letter-spacing: -0.01em; }
        .branch-name { font-size: 0.75rem; font-weight: 700; color: #64748b; margin: 4px 0 0; text-transform: uppercase; }

        .document-title { text-align: right; }
        .document-title h2 { font-size: 1.15rem; font-weight: 900; color: #1e293b; margin: 0; }
        .period-badge { 
          display: inline-block; 
          background: #f8fafc; 
          border: 1px solid #e2e8f0; 
          padding: 0.35rem 0.85rem; 
          border-radius: 6px; 
          font-size: 0.85rem; 
          font-weight: 800; 
          color: #2563eb;
          margin-top: 0.5rem;
        }

        .divider-line { height: 3px; background: #2563eb; margin: 1.5rem 0; opacity: 0.8; }

        /* Info Grid */
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2.5rem;
          padding: 1.25rem;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #f1f5f9;
        }

        .info-row { display: flex; font-size: 0.9rem; margin-bottom: 0.5rem; }
        .info-row .label { width: 120px; font-weight: 600; color: #64748b; }
        .info-row .value { font-weight: 700; color: #1e293b; }
        .paid-tag { background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; }

        /* Payroll Tables */
        .payroll-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .section-title { 
          font-size: 0.85rem; 
          font-weight: 800; 
          color: #475569; 
          margin-bottom: 1rem; 
          letter-spacing: 0.05em;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 0.5rem;
        }

        .payroll-table { width: 100%; border-collapse: collapse; }
        .payroll-table td { padding: 0.75rem 0; font-size: 0.9rem; border-bottom: 1px dashed #f1f5f9; }
        .payroll-table .amount { text-align: right; font-weight: 700; }
        .total-row { color: #0f172a; }
        .total-row td { border-bottom: none; padding-top: 1.25rem; font-weight: 900; }

        /* Summary Card */
        .summary-section { margin-bottom: 4rem; }
        .summary-card { 
          background: #1e293b; 
          color: white; 
          padding: 2rem; 
          border-radius: 16px; 
          box-shadow: 0 12px 24px rgba(0,0,0,0.1);
        }
        .summary-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .summary-label { font-size: 1rem; font-weight: 800; letter-spacing: 0.05em; opacity: 0.9; }
        .summary-value { font-size: 2.25rem; font-weight: 900; }
        .terbilang-box { 
          background: rgba(255,255,255,0.1); 
          padding: 0.85rem 1.25rem; 
          border-radius: 8px; 
          font-style: italic; 
          font-size: 0.9rem; 
          text-align: center;
          border: 1px solid rgba(255,255,255,0.2);
        }

        /* Signature Area */
        .signature-section { display: flex; justify-content: space-between; margin-bottom: 5rem; }
        .signature-box { flex: 1; }
        .sig-label { font-size: 0.9rem; font-weight: 600; color: #64748b; margin-bottom: 4rem; }
        .sig-space { height: 100px; }
        .sig-name { font-size: 1rem; font-weight: 800; text-decoration: underline; text-underline-offset: 4px; }

        /* Footer */
        .doc-footer { text-align: center; border-top: 1px solid #f1f5f9; padding-top: 1.5rem; margin-top: auto; }
        .doc-footer p { font-size: 0.75rem; color: #94a3b8; margin: 4px 0; }

        .text-right { text-align: right; }

        @media print {
          body * { visibility: hidden; }
          .modal-overlay, .premium-modal-overlay { 
            visibility: visible !important; background: white !important; position: absolute; top: 0; left: 0; width: 100%; height: auto;
          }
          .premium-modal-content { 
            visibility: visible !important; background: white !important; box-shadow: none !important; border: none !important; width: 100% !important; max-width: 100% !important; margin: 0 !important; top: 0 !important;
          }
          .premium-modal-header, .premium-modal-footer, .premium-close-btn { display: none !important; }
          
          .a4-slip-wrapper { 
            visibility: visible !important; background: white !important; padding: 0 !important; display: block !important;
          }
          .a4-slip-document { 
            visibility: visible !important; box-shadow: none !important; border: none !important; width: 210mm !important; 
            padding: 15mm 20mm !important; margin: 0 auto !important; min-height: auto;
          }
          .a4-slip-document * { visibility: visible !important; }
          
          @page { size: A4 portrait; margin: 0; }
        }
      ` }} />
    </div>
  );
};

export default SlipGaji;
