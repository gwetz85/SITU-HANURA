import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * Generates a professional PDF for NIB or Halal registration data
 * @param {Object} data - The data to print (pelakuUsaha, usahaList, halalDetails, category)
 */
export const generateRegistrationPDF = (data) => {
  const { pelakuUsaha, usahaList, halalDetails, category = 'NIB' } = data;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // -- TOP HEADER --
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235); // Primary blue
  doc.text('SITU HANURA', 15, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Sistem Informasi Terpadu & Layanan Unggul', 15, 26);
  
  doc.setDrawColor(226, 232, 240);
  doc.line(15, 32, pageWidth - 15, 32);

  // -- DOCUMENT TITLE --
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  const title = `SURAT KETERANGAN PENGAJUAN ${category.toUpperCase()}`;
  doc.text(title, pageWidth / 2, 45, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139);
  doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, pageWidth / 2, 51, { align: 'center' });

  // -- SECTION 1: DATA PELAKU USAHA --
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('I. DATA PELAKU USAHA', 15, 65);
  
  doc.autoTable({
    startY: 70,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: { 0: { fontStyle: 'bold', width: 50 }, 1: { width: 100 } },
    body: [
      ['Nama Lengkap', `: ${pelakuUsaha.nama || '-'}`],
      ['NIK / No. KTP', `: ${pelakuUsaha.nik || '-'}`],
      ['Jenis Kelamin', `: ${pelakuUsaha.jenisKelamin || '-'}`],
      ['No. HP / WhatsApp', `: ${pelakuUsaha.ponsel || '-'}`],
      ['Email', `: ${pelakuUsaha.email || '-'}`],
      ['Tempat, Tgl Lahir', `: ${pelakuUsaha.tempatLahir || '-'}, ${pelakuUsaha.tanggalLahir || '-'}`],
      ['Kelurahan', `: ${pelakuUsaha.kelurahan || '-'}`],
      ['RT / RW', `: ${pelakuUsaha.rtRw || '-'}`],
      ['Alamat Lengkap', `: ${pelakuUsaha.alamat || '-'}`],
    ],
    margin: { left: 15 },
  });

  // -- SECTION 2: DATA USAHA --
  const finalY1 = doc.previousAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('II. RINCIAN DATA USAHA', 15, finalY1);

  doc.autoTable({
    startY: finalY1 + 5,
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235], fontSize: 8, fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 3 },
    head: [['No', 'Nama Usaha', 'Jenis / Bidang', 'Modal', 'Lokasi']],
    body: usahaList.map((u, i) => [
      i + 1,
      u.namaUsaha || '-',
      `${u.jenisUsaha || ''}\n(${u.bidangUsaha || ''})`,
      u.modalUsaha || '-',
      u.alamatUsaha || '-'
    ]),
    margin: { left: 15 },
  });

  // -- SECTION 3: HALAL DETAILS (IF APPLICABLE) --
  if (category === 'Halal' && halalDetails) {
    let currentY = doc.previousAutoTable.finalY + 12;
    
    // Check for page break
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('III. DETAIL PRODUK & BAHAN (KHUSUS HALAL)', 15, currentY);

    const materials = [
      ['Bahan Baku', halalDetails.bahan?.join(', ') || '-'],
      ['Kemasan', halalDetails.kemasan?.join(', ') || '-'],
      ['Pembersih', halalDetails.pembersih?.join(', ') || '-'],
    ];

    doc.autoTable({
      startY: currentY + 5,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: { 0: { fontStyle: 'bold', width: 40 } },
      body: materials,
      margin: { left: 15 },
    });

    let tcY = doc.previousAutoTable.finalY + 10;
    if (tcY > 230) {
      doc.addPage();
      tcY = 20;
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Tata Cara Pembuatan:', 15, tcY);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    
    // Multi-line text handling
    const splitText = doc.splitTextToSize(halalDetails.tataCara || '-', pageWidth - 30);
    doc.text(splitText, 15, tcY + 6);
  }

  // -- FOOTER --
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Dokumen ini dicetak secara sistem melalui Aplikasi SITU HANURA. Seluruh data yang tertera adalah benar adanya sesuai input user.',
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 15,
      { align: 'center' }
    );
    doc.text(
      `Halaman ${i} dari ${totalPages}`,
      pageWidth - 15,
      doc.internal.pageSize.getHeight() - 15,
      { align: 'right' }
    );
  }

  // Save the PDF
  const filename = `PENGAJUAN_${category}_${pelakuUsaha.nama?.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
  doc.save(filename);
};
