import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from './Sath.png';

const getBase64ImageFromURL = (url) => {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL('image/png');
          resolve(dataURL);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = (err) => reject(err);
      img.src = url;
    } catch (err) {
      reject(err);
    }
  });
};
export const exportInquiriesToPDF = (inquiries) => {
    try {
        if (!inquiries?.length) {
            alert('No inquiries available to export');
            return;
        }

        const doc = new jsPDF();
        
        // Load and add logo
        const img = new Image();
        img.src = `${process.env.PUBLIC_URL}/src/img/Sath.png`;
        
        img.onload = function() {
            // Once image is loaded, create PDF
            try {
                // Add logo
                doc.addImage(img, 'PNG', 15, 10, 30, 30);
                
                // Header styling
                doc.setFontSize(24);
                doc.setTextColor(0, 184, 148); // #00b894
                doc.text('Sath Villa Naadi Ayurveda Resort', doc.internal.pageSize.width/2, 25, { align: 'center' });
                
                // Report title
                doc.setFontSize(20);
                doc.setTextColor(23, 163, 74); // #16a34a
                doc.text('Customer Inquiries Report', doc.internal.pageSize.width/2, 50, { align: 'center' });

                // Metadata section
                doc.setFontSize(12);
                doc.setTextColor(100, 100, 100);
                doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 65);
                doc.text(`Total Inquiries: ${inquiries.length}`, 15, 72);

                // Decorative line
                doc.setDrawColor(0, 184, 148);
                doc.setLineWidth(0.5);
                doc.line(15, 75, doc.internal.pageSize.width - 15, 75);

                // Table
                autoTable(doc, {
                    head: [['ID', 'Customer Name', 'Inquiry Details', 'Date']],
                    body: inquiries.map(item => [
                        item.inquiry_id || 'N/A',
                        item.name || 'Anonymous',
                        (item.description || '').substring(0, 100) + (item.description?.length > 100 ? '...' : ''),
                        new Date(item.createdAt || Date.now()).toLocaleDateString()
                    ]),
                    startY: 85,
                    theme: 'grid',
                    headStyles: {
                        fillColor: [0, 184, 148],
                        textColor: 255,
                        fontSize: 12,
                        fontStyle: 'bold',
                        halign: 'center'
                    },
                    bodyStyles: {
                        fontSize: 11,
                        textColor: 50
                    },
                    alternateRowStyles: {
                        fillColor: [245, 250, 248]
                    },
                    columnStyles: {
                        0: { cellWidth: 40 },
                        1: { cellWidth: 50 },
                        2: { cellWidth: 'auto' },
                        3: { cellWidth: 40 }
                    },
                    margin: { top: 80 }
                });

                // Footer
                const pageCount = doc.internal.getNumberOfPages();
                for (let i = 1; i <= pageCount; i++) {
                    doc.setPage(i);
                    
                    // Footer line
                    doc.setDrawColor(0, 184, 148);
                    doc.setLineWidth(0.5);
                    doc.line(15, doc.internal.pageSize.height - 20, doc.internal.pageSize.width - 15, doc.internal.pageSize.height - 20);
                    
                    // Footer text
                    doc.setFontSize(10);
                    doc.setTextColor(100, 100, 100);
                    doc.text('Sath Villa Naadi Ayurveda Resort', doc.internal.pageSize.width/2, doc.internal.pageSize.height - 15, { align: 'center' });
                    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 15, { align: 'right' });
                }

                const fileName = `SathVilla_Inquiries_${new Date().toISOString().split('T')[0]}.pdf`;
                doc.save(fileName);
                alert(`PDF exported successfully: ${fileName}`);
            } catch (error) {
                console.error('PDF Generation Error:', error);
                alert(`PDF generation failed: ${error.message}`);
            }
        };

        img.onerror = function() {
            console.error('Logo loading failed');
            // Generate PDF without logo
            try {
                // Skip logo and continue with rest of PDF
                doc.setFontSize(24);
                doc.setTextColor(0, 184, 148);
                doc.text('Sath Villa Naadi Ayurveda Resort', doc.internal.pageSize.width/2, 25, { align: 'center' });
                

                // Report title
                doc.setFontSize(20);
                doc.setTextColor(23, 163, 74); // #16a34a
                doc.text('Customer Inquiries Report', doc.internal.pageSize.width/2, 50, { align: 'center' });

                // Metadata section
                doc.setFontSize(12);
                doc.setTextColor(100, 100, 100);
                doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 65);
                doc.text(`Total Inquiries: ${inquiries.length}`, 15, 72);

                // Decorative line
                doc.setDrawColor(0, 184, 148);
                doc.setLineWidth(0.5);
                doc.line(15, 75, doc.internal.pageSize.width - 15, 75);

                // Table
                autoTable(doc, {
                    head: [['ID', 'Customer Name', 'Inquiry Details', 'Date']],
                    body: inquiries.map(item => [
                        item.inquiry_id || 'N/A',
                        item.name || 'Anonymous',
                        (item.description || '').substring(0, 100) + (item.description?.length > 100 ? '...' : ''),
                        new Date(item.createdAt || Date.now()).toLocaleDateString()
                    ]),
                    startY: 85,
                    theme: 'grid',
                    headStyles: {
                        fillColor: [0, 184, 148],
                        textColor: 255,
                        fontSize: 12,
                        fontStyle: 'bold',
                        halign: 'center'
                    },
                    bodyStyles: {
                        fontSize: 11,
                        textColor: 50
                    },
                    alternateRowStyles: {
                        fillColor: [245, 250, 248]
                    },
                    columnStyles: {
                        0: { cellWidth: 40 },
                        1: { cellWidth: 50 },
                        2: { cellWidth: 'auto' },
                        3: { cellWidth: 40 }
                    },
                    margin: { top: 80 }
                });

                // Footer
                const pageCount = doc.internal.getNumberOfPages();
                for (let i = 1; i <= pageCount; i++) {
                    doc.setPage(i);
                    
                    // Footer line
                    doc.setDrawColor(0, 184, 148);
                    doc.setLineWidth(0.5);
                    doc.line(15, doc.internal.pageSize.height - 20, doc.internal.pageSize.width - 15, doc.internal.pageSize.height - 20);
                    
                    // Footer text
                    doc.setFontSize(10);
                    doc.setTextColor(100, 100, 100);
                    doc.text('Sath Villa Naadi Ayurveda Resort', doc.internal.pageSize.width/2, doc.internal.pageSize.height - 15, { align: 'center' });
                    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 15, { align: 'right' });
                }

                const fileName = `SathVilla_Inquiries_${new Date().toISOString().split('T')[0]}.pdf`;
                doc.save(fileName);
                alert(`PDF exported successfully (without logo): ${fileName}`);
            } catch (error) {
                console.error('PDF Generation Error:', error);
                alert(`PDF generation failed: ${error.message}`);
            }
        };

    } catch (error) {
        console.error('PDF Export Error:', error);
        alert(`PDF export failed: ${error.message}`);
    }
};