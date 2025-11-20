import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportReviewsToPDF = (reviews) => {
    try {
        if (!reviews?.length) {
            alert('No reviews available to export');
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
                doc.text('Customer Reviews Report', doc.internal.pageSize.width/2, 50, { align: 'center' });

                // Calculate average rating
                const avgRating = reviews.reduce((acc, curr) => acc + (curr.stars || 0), 0) / reviews.length;

                // Metadata section
                doc.setFontSize(12);
                doc.setTextColor(100, 100, 100);
                doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 65);
                doc.text(`Total Reviews: ${reviews.length}`, 15, 72);
                doc.text(`Average Rating: ${avgRating.toFixed(1)} / 5`, 15, 79);

                // Rating distribution
                const distribution = [0, 0, 0, 0, 0];
                reviews.forEach(review => {
                    if (review.stars > 0 && review.stars <= 5) {
                        distribution[review.stars - 1]++;
                    }
                });

                // Draw rating distribution
                doc.setFontSize(11);
                doc.text('Rating Distribution:', 120, 65);
                distribution.forEach((count, index) => {
                    const percentage = ((count / reviews.length) * 100).toFixed(1);
                    doc.text(`${index + 1}★: ${count} (${percentage}%)`, 120, 72 + (index * 7));
                });

                // Decorative line
                doc.setDrawColor(0, 184, 148);
                doc.setLineWidth(0.5);
                doc.line(15, 90, doc.internal.pageSize.width - 15, 90);

                // Table
                autoTable(doc, {
                    head: [['ID', 'Customer', 'Rating', 'Review', 'Date']],
                    body: reviews.map(item => [
                        item.review_id || 'N/A',
                        item.name || 'Anonymous',
                        '★'.repeat(item.stars) + '☆'.repeat(5 - item.stars),
                        (item.description || '').substring(0, 80) + (item.description?.length > 80 ? '...' : ''),
                        new Date(item.createdAt || Date.now()).toLocaleDateString()
                    ]),
                    startY: 100,
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
                        1: { cellWidth: 40 },
                        2: { cellWidth: 30, halign: 'center' },
                        3: { cellWidth: 'auto' },
                        4: { cellWidth: 35 }
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

                const fileName = `SathVilla_Reviews_${new Date().toISOString().split('T')[0]}.pdf`;
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
                doc.text('Customer Reviews Report', doc.internal.pageSize.width/2, 50, { align: 'center' });

                // Calculate average rating
                const avgRating = reviews.reduce((acc, curr) => acc + (curr.stars || 0), 0) / reviews.length;

                // Metadata section
                doc.setFontSize(12);
                doc.setTextColor(100, 100, 100);
                doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 65);
                doc.text(`Total Reviews: ${reviews.length}`, 15, 72);
                doc.text(`Average Rating: ${avgRating.toFixed(1)} / 5`, 15, 79);

                // Rating distribution
                const distribution = [0, 0, 0, 0, 0];
                reviews.forEach(review => {
                    if (review.stars > 0 && review.stars <= 5) {
                        distribution[review.stars - 1]++;
                    }
                });

                // Draw rating distribution
                doc.setFontSize(11);
                doc.text('Rating Distribution:', 120, 65);
                distribution.forEach((count, index) => {
                    const percentage = ((count / reviews.length) * 100).toFixed(1);
                    doc.text(`${index + 1}★: ${count} (${percentage}%)`, 120, 72 + (index * 7));
                });

                // Decorative line
                doc.setDrawColor(0, 184, 148);
                doc.setLineWidth(0.5);
                doc.line(15, 90, doc.internal.pageSize.width - 15, 90);

                // Table
                autoTable(doc, {
                    head: [['ID', 'Customer', 'Rating', 'Review', 'Date']],
                    body: reviews.map(item => [
                        item.review_id || 'N/A',
                        item.name || 'Anonymous',
                        '★'.repeat(item.stars) + '☆'.repeat(5 - item.stars),
                        (item.description || '').substring(0, 80) + (item.description?.length > 80 ? '...' : ''),
                        new Date(item.createdAt || Date.now()).toLocaleDateString()
                    ]),
                    startY: 100,
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
                        1: { cellWidth: 40 },
                        2: { cellWidth: 30, halign: 'center' },
                        3: { cellWidth: 'auto' },
                        4: { cellWidth: 35 }
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

                const fileName = `SathVilla_Reviews_${new Date().toISOString().split('T')[0]}.pdf`;
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