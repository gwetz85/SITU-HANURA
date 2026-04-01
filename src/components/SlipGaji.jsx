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
        {/* Header Section - Centered */}
        <div className="slip-header-centered">
          <div className="header-logo-centered">H</div>
          <h1 className="company-name-lg">PARTAI HATI NURANI RAKYAT</h1>
          <p className="branch-name-lg">DEWAN PIMPINAN CABANG (DPC) KOTA TANJUNGPINANG</p>
          <div className="doc-title-box">
             <h2>SLIP GAJI KARYAWAN</h2>
             <span className="period-pill">{periodLong}</span>
          </div>
        </div>

        <div className="divider-line-heavy"></div>

        {/* Employee & Info Section - Aligned Table */}
        <div className="info-section-grid">
          <table className="info-table">
            <tbody>
              <tr><td className="lbl">Nama Lengkap</td><td className="sep">:</td><td className="val">{data.nama}</td></tr>
              <tr><td className="lbl">NIK / No. Induk</td><td className="sep">:</td><td className="val">{data.nik || '-'}</td></tr>
              <tr><td className="lbl">Jabatan</td><td className="sep">:</td><td className="val">{data.jabatan || 'Staf'}</td></tr>
            </tbody>
          </table>
          <table className="info-table text-right">
            <tbody>
              <tr><td className="lbl">Metode Bayar</td><td className="sep">:</td><td className="val">Transfer {data.bank || 'Bank'}</td></tr>
              <tr><td className="lbl">Tanggal Cetak</td><td className="sep">:</td><td className="val">{timestamp}</td></tr>
              <tr><td className="lbl">Status</td><td className="sep">:</td><td className="val"><span className="paid-tag">LUNAS / PAID</span></td></tr>
            </tbody>
          </table>
        </div>

        {/* Payroll Breakdown Section - With Borders */}
        <div className="payroll-grid">
          <div className="payroll-box">
            <h3 className="box-title">I. PENGHASILAN / EARNINGS {isSimplified && '(ARSIP)'}</h3>
            <table className="item-table">
              <thead>
                <tr><th>KETERANGAN / DESCRIPTION</th><th className="text-right">JUMLAH (IDR)</th></tr>
              </thead>
              <tbody>
                <tr><td>Gaji Pokok (Basic Salary)</td><td className="text-right">{formatCurrency(earnings.gaji)}</td></tr>
                {earnings.tunjangan_jabatan > 0 && <tr><td>Tunjangan Jabatan</td><td className="text-right">{formatCurrency(earnings.tunjangan_jabatan)}</td></tr>}
                {earnings.tunjangan_makan > 0 && <tr><td>Tunjangan Konsumsi / Makan</td><td className="text-right">{formatCurrency(earnings.tunjangan_makan)}</td></tr>}
                {earnings.bonus_kinerja > 0 && <tr><td>Bonus Kinerja / Insentif</td><td className="text-right">{formatCurrency(earnings.bonus_kinerja)}</td></tr>}
              </tbody>
              <tfoot>
                <tr><td>TOTAL PENGHASILAN (A)</td><td className="text-right">{formatCurrency(totalPenghasilan)}</td></tr>
              </tfoot>
            </table>
          </div>

          <div className="payroll-box">
            <h3 className="box-title">II. POTONGAN / DEDUCTIONS</h3>
            <table className="item-table">
              <thead>
                <tr><th>KETERANGAN / DESCRIPTION</th><th className="text-right">JUMLAH (IDR)</th></tr>
              </thead>
              <tbody>
                <tr><td>Kasbon / Pinjaman Karyawan</td><td className="text-right">({formatCurrency(data.totalKasbon)})</td></tr>
                {data.bpjs_kesehatan > 0 && <tr><td>BPJS Kesehatan (JKN)</td><td className="text-right">({formatCurrency(data.bpjs_kesehatan)})</td></tr>}
                {data.bpjs_ketenagakerjaan > 0 && <tr><td>BPJS Ketenagakerjaan (Jamsostek)</td><td className="text-right">({formatCurrency(data.bpjs_ketenagakerjaan)})</td></tr>}
                {data.iuran_koperasi > 0 && <tr><td>Iuran Wajib Koperasi</td><td className="text-right">({formatCurrency(data.iuran_koperasi)})</td></tr>}
              </tbody>
              <tfoot>
                <tr><td>TOTAL POTONGAN (B)</td><td className="text-right">({formatCurrency(totalPotongan)})</td></tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Total Summary Section - Integrated */}
        <div className="take-home-pay-container">
           <div className="summary-left">
              <span className="summary-title">TOTAL PENERIMAAN BERSIH (NET INCOME)</span>
              <p className="summary-calc">Total Pendapatan (A) - Total Potongan (B)</p>
           </div>
           <div className="summary-right">
              <div className="thp-amount">{formatCurrency(penerimaanBersih)}</div>
           </div>
        </div>

        <div className="terbilang-banner">
          <p># {data.terbilang || '...'} Rupiah #</p>
        </div>

        {/* Signature Area - Balanced */}
        <div className="signature-grid">
          <div className="sig-item">
            <p className="sig-role">PENERIMA / EMPLOYEE,</p>
            <div className="sig-line"></div>
            <p className="sig-name-bold">{data.nama}</p>
            <p className="sig-date">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="sig-item text-right">
            <p className="sig-role">BENDAHARA / TREASURER,</p>
            <div className="sig-line"></div>
            <p className="sig-name-bold">ENDANG WIRNANTO</p>
            <p className="sig-date">Tanjungpinang, Indonesia</p>
          </div>
        </div>

        <div className="slip-footer">
          <p>This is a computer-generated document. No signature is required for digital verification.</p>
          <p>&copy; {new Date().getFullYear()} SITU HANURA Cloud Management System.</p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .a4-slip-wrapper {
          background: #f1f5f9;
          padding: 3rem 1rem;
          display: flex;
          justify-content: center;
          font-family: 'Inter', -apple-system, system-ui, sans-serif;
          color: #1e293b;
        }

        .a4-slip-document {
          background: white;
          width: 210mm;
          max-width: 100%;
          min-height: 297mm;
          padding: 25mm 20mm;
          margin: 0 auto;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          box-sizing: border-box;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        /* Header Centered Polish */
        .slip-header-centered {
          text-align: center;
          margin-bottom: 2rem;
        }

        .header-logo-centered {
          width: 64px;
          height: 64px;
          background: #1e293b;
          color: white;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.25rem;
          font-weight: 900;
          margin: 0 auto 1rem;
          box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }

        .company-name-lg { font-size: 1.5rem; font-weight: 950; color: #0f172a; margin: 0; letter-spacing: -0.02em; }
        .branch-name-lg { font-size: 0.85rem; font-weight: 700; color: #64748b; margin: 6px 0 1.5rem; text-transform: uppercase; letter-spacing: 0.05em; }

        .doc-title-box { display: inline-block; border: 2px solid #e2e8f0; padding: 0.75rem 1.75rem; border-radius: 12px; background: #f8fafc; }
        .doc-title-box h2 { font-size: 1.1rem; font-weight: 900; color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: 0.1em; }
        .period-pill { color: #2563eb; font-weight: 800; font-size: 0.9rem; margin-top: 4px; display: block; }

        .divider-line-heavy { height: 4px; background: #1e293b; margin: 2rem 0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

        /* Aligned Info Section */
        .info-section-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 2rem; margin-bottom: 3rem; background: #f8fafc; padding: 1.5rem; border-radius: 12px; border: 1px solid #f1f5f9; }
        .info-table { border-collapse: collapse; width: 100%; }
        .info-table td { padding: 4px 0; font-size: 0.9rem; }
        .info-table .lbl { width: 120px; color: #64748b; font-weight: 600; }
        .info-table .sep { width: 15px; text-align: center; font-weight: 600; color: #cbd5e1; }
        .info-table .val { font-weight: 700; color: #0f172a; }
        .paid-tag { background: #166534; color: white; padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 800; }

        /* Organized Payroll Grid */
        .payroll-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2.5rem; margin-bottom: 3.5rem; }
        .box-title { font-size: 0.8rem; font-weight: 850; color: #1e293b; margin-bottom: 1rem; letter-spacing: 0.05em; opacity: 0.7; }
        
        .item-table { width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; }
        .item-table th { background: #f8fafc; padding: 0.75rem 1rem; font-size: 0.7rem; font-weight: 900; text-align: left; color: #64748b; border-bottom: 1px solid #e2e8f0; }
        .item-table td { padding: 0.85rem 1rem; font-size: 0.85rem; border-bottom: 1px solid #f1f5f9; color: #334155; }
        .item-table tfoot td { background: #f8fafc; font-weight: 950; font-size: 0.9rem; color: #0f172a; border-top: 2px solid #e2e8f0; padding: 1rem; }

        /* Improved THP Container */
        .take-home-pay-container {
          background: #1e293b;
          color: white;
          padding: 2.5rem;
          border-radius: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }
        .summary-title { font-size: 1.15rem; font-weight: 900; display: block; margin-bottom: 4px; }
        .summary-calc { font-size: 0.8rem; opacity: 0.6; font-style: italic; }
        .thp-amount { font-size: 3rem; font-weight: 950; letter-spacing: -0.02em; }

        .terbilang-banner { text-align: center; padding: 1.25rem; background: #f1f5f9; border-radius: 12px; margin-bottom: 4rem; border: 1px dashed #cbd5e1; }
        .terbilang-banner p { font-size: 0.95rem; font-style: italic; font-weight: 600; color: #475569; }

        /* Balanced Signatures */
        .signature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; margin-bottom: 4rem; }
        .sig-role { font-size: 0.85rem; font-weight: 800; color: #64748b; margin-bottom: 5rem; letter-spacing: 0.05em; }
        .sig-line { height: 2px; background: #e2e8f0; margin-bottom: 0.75rem; width: 100%; }
        .sig-name-bold { font-size: 1.1rem; font-weight: 900; color: #0f172a; text-transform: uppercase; }
        .sig-date { font-size: 0.75rem; color: #94a3b8; font-weight: 500; margin-top: 4px; }

        .slip-footer { text-align: center; border-top: 1px solid #f1f5f9; padding-top: 2rem; margin-top: auto; }
        .slip-footer p { font-size: 0.75rem; color: #94a3b8; margin: 4px 0; }

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
