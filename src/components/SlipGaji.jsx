import React from 'react';

const SlipGaji = ({ data }) => {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      maximumFractionDigits: 0 
    }).format(val || 0);
  };

  const periodLong = data.bulan_gaji || new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' });
  
  // Calculations
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
        <div className="slip-header-centered">
          <h1 className="company-name-lg">PARTAI HATI NURANI RAKYAT</h1>
          <p className="branch-name-lg">DEWAN PIMPINAN CABANG (DPC) KOTA TANJUNGPINANG</p>
        </div>

        <div className="divider-line-heavy"></div>

        <div className="doc-title-box">
          <h2>SLIP GAJI KARYAWAN</h2>
          <p className="period-pill">Periode {periodLong}</p>
        </div>

        {/* Employee Info Section */}
        <div className="info-section">
          <table className="info-table">
            <tbody>
              <tr><td className="lbl">NIK</td><td className="val">{data.nik || '-'}</td></tr>
              <tr><td className="lbl">Nama</td><td className="val">{data.nama}</td></tr>
              <tr><td className="lbl">Jabatan</td><td className="val">{data.jabatan || '-'}</td></tr>
              <tr><td className="lbl">Status</td><td className="val">{data.status || 'Karyawan Tetap'}</td></tr>
            </tbody>
          </table>
        </div>

        {/* Payroll Breakdown Section */}
        <table className="payroll-table">
          <thead>
            <tr>
              <th className="col-left">PENGHASILAN</th>
              <th className="col-right">POTONGAN</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="col-left p-0 border-right-solid">
                <table className="inner-table h-full">
                  <tbody>
                    <tr><td>Gaji Pokok</td><td className="text-right">{formatCurrency(earnings.gaji)}</td></tr>
                    {earnings.tunjangan_jabatan > 0 && <tr><td>Tunjangan Jabatan</td><td className="text-right">{formatCurrency(earnings.tunjangan_jabatan)}</td></tr>}
                    {earnings.tunjangan_makan > 0 && <tr><td>Tunjangan Makan</td><td className="text-right">{formatCurrency(earnings.tunjangan_makan)}</td></tr>}
                    {earnings.bonus_kinerja > 0 && <tr><td>Bonus Kinerja</td><td className="text-right">{formatCurrency(earnings.bonus_kinerja)}</td></tr>}
                  </tbody>
                </table>
              </td>
              <td className="col-right p-0">
                <table className="inner-table h-full">
                  <tbody>
                    <tr><td>Kasbon</td><td className="text-right">{formatCurrency(data.totalKasbon || 0)}</td></tr>
                    <tr><td>BPJS Kesehatan</td><td className="text-right">{formatCurrency(data.bpjs_kesehatan || 0)}</td></tr>
                    <tr><td>BPJS Ketenagakerjaan</td><td className="text-right">{formatCurrency(data.bpjs_ketenagakerjaan || 0)}</td></tr>
                    <tr><td>Iuran Koperasi</td><td className="text-right">{formatCurrency(data.iuran_koperasi || 0)}</td></tr>
                    <tr><td colSpan="2"><div className="inner-divider"></div></td></tr>
                    <tr><td><strong>Total Potongan (B)</strong></td><td className="text-right"><strong>{formatCurrency(totalPotongan)}</strong></td></tr>
                  </tbody>
                </table>
              </td>
            </tr>
            <tr className="row-total-a">
              <td className="col-left border-right-solid">
                <div className="flex-between">
                  <strong>Total Penghasilan (A)</strong>
                  <strong>{formatCurrency(totalPenghasilan)}</strong>
                </div>
              </td>
              <td className="col-right border-none"></td>
            </tr>
          </tbody>
        </table>

        <div className="take-home-pay-box">
          <div className="flex-between thp-row">
            <strong>Penerimaan Bersih (A-B)</strong>
            <strong>{formatCurrency(penerimaanBersih)}</strong>
          </div>
          <div className="terbilang-text">
            Terbilang: {data.terbilang ? data.terbilang.charAt(0).toUpperCase() + data.terbilang.slice(1) + ' rupiah' : '...'}
          </div>
        </div>
        <div className="divider-line-heavy" style={{ marginTop: '0' }}></div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .a4-slip-wrapper {
          background: #f1f5f9;
          padding: 2rem 1rem;
          display: flex;
          justify-content: center;
          font-family: Arial, sans-serif;
          color: #000;
        }

        .a4-slip-document {
          background: white;
          width: 210mm;
          max-width: 100%;
          min-height: 297mm;
          padding: 20mm 20mm;
          margin: 0 auto;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          box-sizing: border-box;
        }

        .slip-header-centered {
          text-align: center;
        }

        .company-name-lg { 
          font-size: 18pt; 
          font-weight: bold; 
          margin: 0 0 5px 0; 
        }

        .branch-name-lg { 
          font-size: 12pt; 
          margin: 5px 0; 
        }

        .divider-line-heavy { 
          height: 1px; 
          background: #000; 
          margin: 15px 0; 
        }

        .doc-title-box { 
          text-align: center;
          margin-bottom: 25px;
        }
        .doc-title-box h2 { 
          font-size: 16pt; 
          font-weight: bold; 
          margin: 0 0 8px 0; 
        }
        .period-pill { 
          font-size: 12pt; 
          margin: 0; 
        }

        .info-section { 
          margin-bottom: 25px; 
        }
        .info-table { 
          border-collapse: collapse; 
        }
        .info-table td { 
          padding: 4px 15px 4px 0; 
          font-size: 11pt; 
        }
        .info-table .lbl { 
          width: 120px; 
        }

        .payroll-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 5px;
          border-top: 1px solid #000;
          border-bottom: 1px solid #000;
        }
        .payroll-table th { 
          padding: 10px; 
          font-size: 11pt; 
          text-align: left; 
          font-weight: bold;
          border-bottom: 1px solid #000;
        }
        .col-left { 
          width: 50%; 
          vertical-align: top; 
        }
        .border-right-solid {
          border-right: 1px solid #000;
        }
        .col-right { 
          width: 50%; 
          vertical-align: top; 
        }
        .p-0 { padding: 0 !important; }
        
        .inner-table { 
          width: 100%; 
          border-collapse: collapse; 
        }
        .h-full { height: 100%; }
        .inner-table td { 
          padding: 8px 10px; 
          border: none;
          font-size: 11pt;
        }
        .inner-divider {
          border-top: 1px solid #000;
          margin: 5px 0;
        }
        
        .row-total-a td {
          border-top: 1px solid #000;
          padding: 10px;
        }
        
        .border-none { border: none !important; }
        .text-right { text-align: right; }
        .flex-between { 
          display: flex; 
          justify-content: space-between; 
        }

        .take-home-pay-box {
          border-bottom: 1px solid #000;
          margin-top: 5px;
          padding-bottom: 5px;
        }
        .thp-row {
          font-size: 12pt;
          padding: 10px 10px 5px 10px;
        }
        .terbilang-text {
          font-size: 11pt;
          padding: 0 10px 10px 10px;
        }

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
      \` }} />
    </div>
  );
};

export default SlipGaji;

