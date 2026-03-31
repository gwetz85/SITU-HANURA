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

  const period = new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' });
  const periodShort = new Date().toLocaleString('en-US', { month: 'short', year: '2-digit' });
  
  // Calculations
  const hariKerjaMandatory = data.hari_kerja || 25;
  const gajiPerHari = Math.floor(data.gaji / 25); // Baseline is 25 days
  const totalGajiHarian = gajiPerHari * hariKerjaMandatory;
  const ketidakhadiranDays = 25 - hariKerjaMandatory;
  const potonganAbsen = ketidakhadiranDays * gajiPerHari;

  const totalPenghasilan = data.gaji + (data.tunjangan_jabatan || 0) + (data.tunjangan_makan || 0) + (data.bonus_kinerja || 0);
  const totalPotongan = (data.totalKasbon || 0) + (data.bpjs_kesehatan || 0) + (data.bpjs_ketenagakerjaan || 0) + (data.iuran_koperasi || 0);
  const penerimaanBersih = totalPenghasilan - totalPotongan;

  return (
    <div className="slip-gaji-wrapper">
      <div className="slip-printable">
        {/* Header Section */}
        <div className="slip-top-section">
          <div className="company-branding">
            <div className="brand-logo-container">
               <div className="hanura-flag">
                 <span className="partai-text">HANURA</span>
                 <span className="sub-text">PARTAI HATI NURANI RAKYAT</span>
               </div>
            </div>
            <div className="company-details">
               <p className="branch-name">HANURA KOTA TANJUNGPINANG</p>
               <p className="address">Jalan Gatot Subroto</p>
               <p className="city-state">Tanjungpinang , Kepulauan Riau</p>
            </div>
          </div>
          <div className="slip-main-title">
            <h1>Slip Gaji</h1>
          </div>
        </div>

        {/* Employee Metadata */}
        <div className="metadata-section">
           <div className="meta-left">
              <div className="meta-row"><span className="m-label">NAMA</span><span className="m-val">{data.nama} / {data.nik || '-'}</span></div>
              <div className="meta-row"><span className="m-label">JABATAN</span><span className="m-val">{data.jabatan || 'STAF'}</span></div>
           </div>
           <div className="meta-right">
              <div className="meta-row"><span className="m-label">Periode Gaji</span><span className="m-val">{periodShort}</span></div>
           </div>
        </div>

        {/* Table Content */}
        <table className="summary-table">
           <thead>
              <tr>
                 <th>Pendapatan</th>
                 <th>Potongan</th>
              </tr>
           </thead>
           <tbody>
              <tr>
                 <td className="data-col">
                    <div className="calc-row"><span>Gaji</span> <span className="val">{formatNumber(data.gaji)}</span></div>
                    {data.tunjangan_jabatan > 0 && <div className="calc-row"><span>Tunjangan Jabatan</span> <span className="val">{formatNumber(data.tunjangan_jabatan)}</span></div>}
                    {data.tunjangan_makan > 0 && <div className="calc-row"><span>Tunjangan Makan</span> <span className="val">{formatNumber(data.tunjangan_makan)}</span></div>}
                    {data.bonus_kinerja > 0 && <div className="calc-row"><span>Bonus Kinerja</span> <span className="val">{formatNumber(data.bonus_kinerja)}</span></div>}
                 </td>
                 <td className="data-col">
                    <div className="calc-row"><span>Pembayaran Hutang</span> <span className="val">{formatNumber(data.totalKasbon)}</span></div>
                    <div className="calc-row"><span>Iuran BPJS</span> <span className="val">{formatNumber((data.bpjs_kesehatan || 0) + (data.bpjs_ketenagakerjaan || 0))}</span></div>
                    <div className="calc-row"><span>Iuran Koperasi</span> <span className="val">{formatNumber(data.iuran_koperasi)}</span></div>
                 </td>
              </tr>
              <tr className="footer-row">
                 <td><div className="calc-row font-bold"><span>Total Pendapatan</span> <span>{formatNumber(totalPenghasilan)}</span></div></td>
                 <td><div className="calc-row font-bold"><span>Total Potongan</span> <span>{formatNumber(totalPotongan)}</span></div></td>
              </tr>
           </tbody>
        </table>

        {/* Daily Calculation Details */}
        <div className="daily-calc-section">
           <h3 className="section-header">Rincian Perhitungan Gaji Harian</h3>
           <div className="detail-table">
              <div className="detail-row"><span>Hari Kerja</span> <span>{hariKerjaMandatory} Hari</span></div>
              <div className="detail-row divider"><span>Gaji Per Hari</span> <span>x</span> <span className="val-box">{formatNumber(gajiPerHari)}</span></div>
              <div className="detail-row"><span>Total Gaji</span> <span>{formatNumber(totalGajiHarian)}</span></div>
              <div className="detail-row divider"><span>Ketidakhadiran</span> <span>{ketidakhadiranDays} Hari x {formatNumber(gajiPerHari)}</span> <span>=</span> <span className="val-box">{formatNumber(potonganAbsen)}</span></div>
              <div className="detail-row font-bold"><span>Total Gaji</span> <span>{formatNumber(totalGajiHarian)}</span></div>
           </div>
        </div>

        {/* Final Receipt */}
        <div className="final-net-box">
           <div className="net-border">
              <p className="net-label">Total Penerimaan Bulan Ini</p>
              <h2 className="net-amount">{formatNumber(penerimaanBersih)}</h2>
           </div>
        </div>

        {/* Signatures */}
        <div className="signature-area">
           <div className="sign-box">
              <p>Penerima,</p>
              <div className="space"></div>
              <p className="name-line">{data.nama}</p>
           </div>
           <div className="sign-box">
              <p>Bendahara,</p>
              <div className="space"></div>
              <p className="name-line">ENDANG WIRNANTO</p>
           </div>
        </div>

        <div className="slip-footer-text">
           <p>Generated by HanuraTPI</p>
           <p>Generated on : {new Date().toLocaleString('id-ID')}</p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .slip-gaji-wrapper { background: #f1f5f9; padding: 2rem; display: flex; justify-content: center; }
        .slip-printable { 
          background: white; width: 210mm; padding: 20mm; box-shadow: 0 10px 25px rgba(0,0,0,0.1); 
          font-family: 'Inter', sans-serif; position: relative; color: #000;
        }
        
        .slip-top-section { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
        
        /* Logo Styling */
        . hanura-flag { 
          background: #ff8c00; padding: 8px 15px; border: 2px solid #000; display: flex; flex-direction: column; align-items: center; justify-content: center;
          position: relative; clip-path: polygon(0% 0%, 90% 0%, 100% 50%, 90% 100%, 0% 100%); width: 140px;
        }
        .partai-text { font-size: 1.4rem; font-weight: 900; color: #fff; text-shadow: 1px 1px 2px #000; }
        .sub-text { font-size: 0.4rem; color: #000; font-weight: 800; letter-spacing: -0.2px; }

        .company-branding { display: flex; flex-direction: column; gap: 0.5rem; }
        .branch-name { font-size: 0.8rem; font-weight: 800; }
        .address, .city-state { font-size: 0.75rem; color: #444; }

        .slip-main-title h1 { font-size: 2.2rem; font-weight: 900; margin: 0; }

        .metadata-section { display: flex; justify-content: space-between; margin-bottom: 1.5rem; border-top: 1.5px solid #000; padding-top: 1rem; }
        .meta-row { display: flex; gap: 1rem; font-size: 0.75rem; margin-bottom: 4px; }
        .m-label { font-weight: 600; width: 60px; }
        .m-val { font-weight: 400; }

        .summary-table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; }
        .summary-table th { background: #d1d5db; border: 1.5px solid #000; padding: 6px 12px; text-align: left; font-size: 0.9rem; font-weight: 800; }
        .summary-table td { border: 1.5px solid #000; padding: 0; vertical-align: top; }
        .data-col { padding: 8px 12px; min-height: 100px; }
        .calc-row { display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 4px; }
        .footer-row td { background: white; padding: 8px 12px; }

        .daily-calc-section { margin-bottom: 2rem; }
        .section-header { background: #d1d5db; border: 1.5px solid #000; padding: 6px 12px; font-size: 0.9rem; font-weight: 800; margin: 0; }
        .detail-table { border: 1.5px solid #000; border-top: none; padding: 8px 12px; }
        .detail-row { display: flex; justify-content: space-between; font-size: 0.75rem; padding: 4px 0; }
        .detail-row.divider { border-bottom: 1.5px solid #000; margin-bottom: 4px; }
        .val-box { text-align: right; min-width: 80px; }

        .final-net-box { display: flex; justify-content: flex-end; margin-bottom: 3rem; }
        .net-border { border: 3px solid #000; padding: 10px 40px; text-align: center; min-width: 300px; position: relative; }
        .net-label { font-size: 0.8rem; font-weight: 700; background: white; position: absolute; top: -10px; left: 50%; transform: translateX(-50%); padding: 0 10px; }
        .net-amount { font-size: 2.2rem; font-weight: 900; margin: 5px 0 0; }

        .signature-area { display: flex; justify-content: space-between; padding: 0 3rem; }
        .sign-box { text-align: center; }
        .sign-box p { font-size: 0.8rem; margin: 0; }
        .space { height: 60px; }
        .name-line { font-weight: 800; text-decoration: underline; text-transform: uppercase; }

        .slip-footer-text { margin-top: 4rem; display: flex; justify-content: space-between; font-size: 0.65rem; color: #666; font-family: monospace; }

        .font-bold { font-weight: 800; }

        @media print {
          body * { visibility: hidden; }
          .modal-overlay, .premium-modal-overlay { visibility: visible !important; background: white !important; position: absolute; top: 0; left: 0; }
          .premium-modal-content { visibility: visible !important; background: white !important; box-shadow: none !important; border: none !important; width: 100% !important; max-width: 100% !important; }
          .premium-modal-header, .premium-modal-footer, .premium-close-btn { display: none !important; }
          .slip-gaji-wrapper { visibility: visible !important; background: white !important; padding: 0 !important; }
          .slip-printable { visibility: visible !important; box-shadow: none !important; border: none !important; width: 100% !important; padding: 0 !important; margin: 0 !important; }
          .slip-printable * { visibility: visible !important; }
          @page { size: portrait; margin: 0; }
        }
      ` }} />
    </div>
  );
};

export default SlipGaji;
