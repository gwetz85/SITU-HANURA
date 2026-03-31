import React from 'react';

const SlipGaji = ({ data }) => {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      maximumFractionDigits: 0 
    }).format(val || 0);
  };

  const period = new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' });
  const totalPenghasilan = (data.gaji || 0) + (data.tunjangan_jabatan || 0) + (data.tunjangan_makan || 0) + (data.bonus_kinerja || 0);
  const totalPotongan = (data.totalKasbon || 0) + (data.bpjs_kesehatan || 0) + (data.bpjs_ketenagakerjaan || 0);

  return (
    <div className="slip-gaji-container">
      <div className="slip-header">
        <h1>HANURA KOTA TANJUNGPINANG</h1>
        <p>Jl Gatot Subroto ( Depan Gerbang Rawasari ) , Tanjungpinang</p>
        <hr className="header-line" />
      </div>

      <div className="slip-title-box">
        <div className="thick-line"></div>
        <h2>SLIP GAJI KARYAWAN</h2>
        <div className="thick-line"></div>
        <p className="period">Periode {period}</p>
      </div>

      <div className="employee-info">
        <div className="info-row">
          <span className="label">NIK</span>
          <span className="separator">:</span>
          <span className="value">{data.nik || '-'}</span>
        </div>
        <div className="info-row">
          <span className="label">Nama</span>
          <span className="separator">:</span>
          <span className="value">{data.nama}</span>
        </div>
        <div className="info-row">
          <span className="label">Pengurus</span>
          <span className="separator">:</span>
          <span className="value">{data.jabatan}</span>
        </div>
      </div>

      <table className="slip-table">
        <thead>
          <tr>
            <th>PENGHASILAN</th>
            <th>POTONGAN</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="col-data">
              <div className="data-row">
                <span>Gaji Pokok</span>
                <span>{formatCurrency(data.gaji)}</span>
              </div>
              <div className="data-row">
                <span>Tunjangan Jabatan</span>
                <span>{formatCurrency(data.tunjangan_jabatan)}</span>
              </div>
              <div className="data-row">
                <span>Tunjangan Makan</span>
                <span>{formatCurrency(data.tunjangan_makan)}</span>
              </div>
              <div className="data-row">
                <span>Bonus Kinerja</span>
                <span>{formatCurrency(data.bonus_kinerja)}</span>
              </div>
            </td>
            <td className="col-data">
              <div className="data-row">
                <span>Potongan Kasbon</span>
                <span className="text-danger">{formatCurrency(data.totalKasbon)}</span>
              </div>
              <div className="data-row">
                <span>BPJS Kesehatan</span>
                <span>{formatCurrency(data.bpjs_kesehatan)}</span>
              </div>
              <div className="data-row">
                <span>BPJS Ketenagakerjaan</span>
                <span>{formatCurrency(data.bpjs_ketenagakerjaan)}</span>
              </div>
            </td>
          </tr>
          <tr className="total-row">
            <td>
              <div className="data-row font-bold">
                <span>Total Penghasilan (A)</span>
                <span>{new Intl.NumberFormat('id-ID').format(totalPenghasilan)}</span>
              </div>
            </td>
            <td>
              <div className="data-row font-bold">
                <span>Total Potongan (B)</span>
                <span className="text-danger">{new Intl.NumberFormat('id-ID').format(totalPotongan)}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="net-salary-box">
        <div className="net-label">
          <h3>PENERIMAAN BERSIH (A-B)</h3>
          <p className="terbilang italic">Terbilang: {data.terbilang}</p>
        </div>
        <div className="net-value">
          {formatCurrency(data.penerimaanBersih)}
        </div>
      </div>

      <div className="signatures">
        <div className="sign-block">
          <p>Penerima,</p>
          <div className="sign-space"></div>
          <p className="sign-name">{data.nama}</p>
        </div>
        <div className="sign-block">
          <p>Bendahara,</p>
          <div className="sign-space"></div>
          <p className="sign-name">ENDANG WIRNANTO</p>
        </div>
      </div>

      <div className="slip-footer">
        <p>Dihasilkan oleh SITU HANURA System • {new Date().toLocaleString('id-ID')}</p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .slip-gaji-container {
          padding: 2rem;
          color: #1e293b;
          background: white;
          width: 100%;
          font-family: 'Inter', sans-serif;
        }
        .slip-header { text-align: center; margin-bottom: 1.5rem; }
        .slip-header h1 { font-size: 1.8rem; font-weight: 900; margin-bottom: 0.25rem; }
        .slip-header p { font-size: 0.9rem; color: #64748b; }
        .header-line { border: none; border-bottom: 2px solid #e2e8f0; margin-top: 1rem; }
        
        .slip-title-box { text-align: center; margin-bottom: 2rem; }
        .thick-line { height: 2px; background: #000; margin: 4px 0; }
        .slip-title-box h2 { font-size: 1.5rem; font-weight: 800; letter-spacing: 0.2em; margin: 0.5rem 0; }
        .period { font-weight: 700; margin-top: 0.5rem; }

        .employee-info { margin-bottom: 1.5rem; max-width: 400px; }
        .info-row { display: flex; margin-bottom: 0.25rem; font-weight: 600; font-size: 0.95rem; }
        .info-row .label { width: 100px; }
        .info-row .separator { width: 20px; }

        .slip-table { width: 100%; border-collapse: collapse; border: 2px solid #000; margin-bottom: 1.5rem; }
        .slip-table th { background: #f8fafc; border: 1px solid #000; padding: 0.75rem; text-align: left; font-weight: 800; }
        .slip-table td { border: 1px solid #000; vertical-align: top; }
        .col-data { padding: 1rem; min-height: 150px; }
        .data-row { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.95rem; }
        .total-row { background: #f8fafc; }
        .total-row td { padding: 0.75rem 1rem; }
        
        .net-salary-box { 
          display: flex; justify-content: space-between; align-items: center; 
          border: 2px solid #000; padding: 1.5rem; background: #f1f5f9;
          margin-bottom: 3rem;
        }
        .net-label h3 { font-size: 1.25rem; font-weight: 800; margin: 0; }
        .terbilang { font-size: 0.85rem; color: #475569; margin-top: 0.5rem; }
        .net-value { font-size: 2rem; font-weight: 900; }

        .signatures { display: flex; justify-content: space-between; padding: 0 4rem; margin-bottom: 3rem; }
        .sign-block { text-align: center; min-width: 200px; }
        .sign-space { height: 80px; }
        .sign-name { font-weight: 800; text-decoration: underline; text-transform: uppercase; }

        .slip-footer { text-align: center; color: #94a3b8; font-size: 0.75rem; font-family: monospace; }
        .text-danger { color: #ef4444; }
        .font-bold { font-weight: 800; }
        .italic { font-style: italic; }

        @media print {
          body * { visibility: hidden; }
          .modal-overlay, .premium-modal-overlay { visibility: visible; position: fixed; inset: 0; background: white !important; backdrop-filter: none !important; }
          .premium-modal-content { visibility: visible !important; width: 100% !important; max-width: 100% !important; border: none !important; box-shadow: none !important; position: static !important; }
          .premium-modal-header, .premium-modal-footer, .premium-close-btn { display: none !important; }
          .premium-modal-body { padding: 0 !important; overflow: visible !important; }
          .slip-gaji-container { visibility: visible !important; position: fixed; inset: 0; padding: 0 !important; }
          .slip-gaji-container * { visibility: visible !important; }
          @page { size: auto; margin: 1cm; }
        }
      ` }} />
    </div>
  );
};

export default SlipGaji;
