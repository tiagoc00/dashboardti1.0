// src/services/ExportService.js

export const ExportService = {
  /**
   * Export filtered data as Excel (.xlsx)
   */
  exportExcel: (ch, cs, filename = 'relatorio_ti') => {
    const wb = XLSX.utils.book_new();

    // Chamados sheet
    if (ch.length) {
      const chData = ch.map(r => ({
        'ID': r['id'] || r['ID'] || '',
        'Atendente': r['Atendente'] || '',
        'Contato': r['Contato'] || '',
        'Empresa': r['Empresa'] || '',
        'Setor': r['_st'] || r['Setor'] || '',
        'Abertura': r['Abertura'] || '',
        'Tempo': r['Tempo'] || '',
        'Tempo na Fila': r['Tempo na Fila'] || ''
      }));
      const ws1 = XLSX.utils.json_to_sheet(chData);
      XLSX.utils.book_append_sheet(wb, ws1, 'Chamados');
    }

    // Satisfacao sheet
    if (cs.length) {
      const csData = cs.map(r => ({
        '#': r['#'] || '',
        'Data Hora': r['Data Hora'] || '',
        'Atendente': r['Atendente'] || '',
        'Empresa': r['Empresa'] || '',
        'Contato': r['Contato'] || '',
        'Avaliação': r['Avaliação'] || '',
        'Comentário': r['Comentário'] || ''
      }));
      const ws2 = XLSX.utils.json_to_sheet(csData);
      XLSX.utils.book_append_sheet(wb, ws2, 'Satisfação');
    }

    const timestamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `${filename}_${timestamp}.xlsx`);
  },

  /**
   * Export dashboard as PDF with charts screenshot
   */
  exportPDF: async (showLoading, hideLoading, toast) => {
    try {
      showLoading('Gerando PDF...');

      const dash = document.getElementById('dash');
      if (!dash) { toast('Nenhum dado para exportar.', 'error'); return; }

      // Temporarily make the dashboard fully visible for capture
      const mainContent = document.getElementById('main-content');
      const originalOverflow = mainContent?.style.overflow;
      if (mainContent) mainContent.style.overflow = 'visible';

      const canvas = await html2canvas(dash, {
        backgroundColor: '#0A0A0C',
        scale: 1.5,
        useCORS: true,
        logging: false,
        windowWidth: 1200,
        onclone: (doc) => {
          // Ensure dark background in clone
          doc.body.style.backgroundColor = '#0A0A0C';
        }
      });

      if (mainContent) mainContent.style.overflow = originalOverflow;

      const { jsPDF } = window.jspdf;
      const imgData = canvas.toDataURL('image/jpeg', 0.85);
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Check if we need multiple pages
      const pageHeight = 297; // A4 height in mm
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      let position = 0;
      let remainingHeight = imgHeight;

      // First page
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);

      // Add additional pages if content is longer than one page
      if (imgHeight > pageHeight) {
        let currentPage = 1;
        while (remainingHeight > pageHeight) {
          remainingHeight -= pageHeight;
          position -= pageHeight;
          currentPage++;
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        }
      }

      const timestamp = new Date().toISOString().slice(0, 10);
      pdf.save(`dashboard_ti_${timestamp}.pdf`);
      toast('PDF exportado com sucesso!', 'success');
    } catch (err) {
      console.error('PDF Export error:', err);
      toast('Erro ao gerar PDF. Tente novamente.', 'error');
    } finally {
      hideLoading();
    }
  }
};
