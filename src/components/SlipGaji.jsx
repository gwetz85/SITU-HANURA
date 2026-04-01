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
    <div className="slip-gaji-wrapper">
      <div className="slip-printable receipt-style">
        {/* Receipt Header */}
        <div className="receipt-header">
          <h2 className="company-name">PARTAI HATI NURANI RAKYAT</h2>
          <p className="branch-name">DPC KOTA TANJUNGPINANG</p>
          <p className="address">Jl. Gatot Subroto, Tanjungpinang</p>
          <p className="contact">Kepulauan Riau</p>
        </div>

        <div className="receipt-separator">------------------------------------------</div>

        {/* Receipt Title */}
        <div className="receipt-title">
          <h3>SLIP GAJI KARYAWAN</h3>
          <p className="period-text">{periodLong}</p>
        </div>

        <div className="receipt-separator">------------------------------------------</div>

        {/* Employee Info */}
        <div className="receipt-info">
          <div className="info-row"><span>NAMA</span><span>: {data.nama}</span></div>
          <div className="info-row"><span>NIK</span><span>: {data.nik || '-'}</span></div>
          <div className="info-row"><span>JABATAN</span><span>: {data.jabatan || 'STAF'}</span></div>
        </div>

        <div className="receipt-separator">------------------------------------------</div>

        {/* Earnings */}
        <div className="receipt-section">
          <p className="section-label">PENGHASILAN {isSimplified && '(ARSIP)'}:</p>
          <div className="item-row"><span>Gaji Pokok</span><span>{formatNumber(earnings.gaji)}</span></div>
          {earnings.tunjangan_jabatan > 0 && <div className="item-row"><span>Tunj. Jabatan</span><span>{formatNumber(earnings.tunjangan_jabatan)}</span></div>}
          {earnings.tunjangan_makan > 0 && <div className="item-row"><span>Tunj. Makan</span><span>{formatNumber(earnings.tunjangan_makan)}</span></div>}
          {earnings.bonus_kinerja > 0 && <div className="item-row"><span>Bonus Kinerja</span><span>{formatNumber(earnings.bonus_kinerja)}</span></div>}
          <div className="receipt-separator-thin">------------------------------------------</div>
          <div className="item-row font-bold"><span>Total Penghasilan</span><span>{formatNumber(totalPenghasilan)}</span></div>
        </div>

        <div className="receipt-spacer"></div>

        {/* Deductions */}
        <div className="receipt-section">
          <p className="section-label">POTONGAN:</p>
          <div className="item-row"><span>Kasbon/Hutang</span><span>({formatNumber(data.totalKasbon)})</span></div>
          {(data.bpjs_kesehatan > 0 || data.bpjs_ketenagakerjaan > 0) && (
            <div className="item-row"><span>BPJS</span><span>({formatNumber((data.bpjs_kesehatan || 0) + (data.bpjs_ketenagakerjaan || 0))})</span></div>
          )}
          {data.iuran_koperasi > 0 && <div className="item-row"><span>Iuran Koperasi</span><span>({formatNumber(data.iuran_koperasi)})</span></div>}
          <div className="receipt-separator-thin">------------------------------------------</div>
          <div className="item-row font-bold"><span>Total Potongan</span><span>({formatNumber(totalPotongan)})</span></div>
        </div>

        <div className="receipt-separator">==========================================</div>

        {/* Net Total */}
        <div className="receipt-total">
          <p className="total-label">TAKE HOME PAY</p>
          <h2 className="total-amount">Rp {formatNumber(penerimaanBersih)}</h2>
          <p className="terbilang"># {data.terbilang || ''} Rupiah #</p>
        </div>

        <div className="receipt-separator">==========================================</div>

        {/* Signatures */}
        <div className="receipt-signatures">
          <div className="sign-column">
            <p>Penerima,</p>
            <div className="sign-space"></div>
            <p className="sign-name">{data.nama}</p>
          </div>
          <div className="sign-column">
            <p>Bendahara,</p>
            <div className="sign-space"></div>
            <p className="sign-name">ENDANG WIRNANTO</p>
          </div>
        </div>

        <div className="receipt-footer">
          <p>Terima kasih atas dedikasinya.</p>
          <p>Dicetak pada: {timestamp}</p>
          <p>SITU HANURA Cloud System</p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .slip-gaji-wrapper { 
          background: #f8fafc; 
          padding: 2rem; 
          display: flex; 
          justify-content: center;
          font-family: 'Courier New', Courier, monospace;
        }
        
        .receipt-style { 
          background: white; 
          width: 80mm; 
          padding: 10mm 5mm; 
          box-shadow: 0 4px 20px rgba(0,0,0,0.1); 
          color: #000;
          font-size: 12px;
          line-height: 1.4;
        }

        .receipt-header { text-align: center; margin-bottom: 10px; }
        .company-name { font-size: 14px; font-weight: 900; margin: 5px 0 0; }
        .branch-name { font-size: 11px; font-weight: 700; margin: 0; }
        .address, .contact { font-size: 10px; margin: 0; color: #333; }

        .receipt-separator { text-align: center; margin: 5px 0; overflow: hidden; white-space: nowrap; font-weight: bold; }
        .receipt-separator-thin { text-align: center; margin: 3px 0; overflow: hidden; white-space: nowrap; opacity: 0.5; }
        
        .receipt-title { text-align: center; margin: 10px 0; }
        .receipt-title h3 { font-size: 13px; font-weight: 900; margin: 0; text-decoration: underline; }
        .period-text { font-size: 11px; margin: 2px 0 0; }

        .receipt-info { margin: 10px 0; }
        .info-row { display: flex; gap: 8px; font-size: 11px; }
        .info-row span:first-child { min-width: 60px; font-weight: 700; }

        .receipt-section { margin: 10px 0; }
        .section-label { font-weight: 900; font-size: 11px; margin-bottom: 4px; text-decoration: underline; }
        .item-row { display: flex; justify-content: space-between; font-size: 11px; }
        .receipt-spacer { height: 10px; }

        .receipt-total { text-align: center; margin: 15px 0; }
        .total-label { font-size: 11px; font-weight: 700; margin: 0; }
        .total-amount { font-size: 20px; font-weight: 900; margin: 5px 0; }
        .terbilang { font-size: 9px; font-style: italic; margin: 0; font-weight: 600; padding: 0 5px; }

        .receipt-signatures { display: flex; justify-content: space-between; margin-top: 20px; }
        .sign-column { text-align: center; flex: 1; }
        .sign-column p { font-size: 10px; margin: 0; }
        .sign-space { height: 40px; }
        .sign-name { font-weight: 800; text-decoration: underline; text-transform: uppercase; }

        .receipt-footer { text-align: center; margin-top: 25px; border-top: 1px dashed #ccc; padding-top: 10px; }
        .receipt-footer p { font-size: 9px; margin: 2px 0; color: #555; }

        .font-bold { font-weight: 900; }

        @media print {
          body * { visibility: hidden; }
          .modal-overlay, .premium-modal-overlay { 
            visibility: visible !important; background: white !important; position: absolute; top: 0; left: 0; width: 100%; 
          }
          .premium-modal-content { 
            visibility: visible !important; background: white !important; box-shadow: none !important; border: none !important; width: 100% !important; max-width: 100% !important; 
          }
          .premium-modal-header, .premium-modal-footer, .premium-close-btn { display: none !important; }
          .slip-gaji-wrapper { 
            visibility: visible !important; background: white !important; padding: 0 !important; display: block !important;
          }
          .receipt-style { 
            visibility: visible !important; box-shadow: none !important; border: none !important; width: 80mm !important; 
            padding: 5mm !important; margin: 0 auto !important; 
          }
          .receipt-style * { visibility: visible !important; }
          @page { size: auto; margin: 0; }
        }
      ` }} />
    </div>
  );
};

export default SlipGaji;
