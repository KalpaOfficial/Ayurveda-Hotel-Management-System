import React, { useEffect, useRef } from "react";
import { Link } from 'react-router-dom';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const SuccessPage = ({ transaction }) => {
  const downloadedRef = useRef(false); // <-- guard flag

  const generateReceipt = (txn) => {
    if (!txn) return;

    try {
      const doc = new jsPDF();

      // ====== Logo ======
      try {
        // Try to load the logo from public folder
        doc.addImage("/sath-logo.png", "PNG", 150, 10, 40, 20);
      } catch (e) {
        console.warn("Logo not found, skipping image");
        // Add text logo as fallback
        doc.setFontSize(12);
        doc.text("🌿 Sath Villa", 150, 25);
      }

      // ====== Title ======
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text("Sath Villa Ayurvedic Wellness Resort", 14, 22);
      
      doc.setFontSize(16);
      doc.text("Payment Receipt", 14, 32);

      // ====== Meta Info ======
      doc.setFontSize(12);
      const today = new Date();
      doc.text(`Transaction ID: ${txn._id}`, 14, 42);
      doc.text(`Date: ${today.toLocaleDateString()} ${today.toLocaleTimeString()}`, 14, 50);
      doc.text(`Name: ${txn.name}`, 14, 58);
      doc.text(`Email: ${txn.email}`, 14, 66);

      // ====== Table ======
      // If booking exists, include it
      const b = txn.booking || null;
      if (b) {
        doc.setFontSize(14);
        doc.text('Booking Details', 14, 78);
        
        // Calculate check-out date if not provided
        let checkOutDate = 'N/A';
        if (b.b_checkOutDate) {
          checkOutDate = new Date(b.b_checkOutDate).toLocaleDateString();
        } else if (b.b_checkInDate && b.b_packageDuration) {
          const checkIn = new Date(b.b_checkInDate);
          const checkOut = new Date(checkIn);
          checkOut.setDate(checkIn.getDate() + parseInt(b.b_packageDuration));
          checkOutDate = checkOut.toLocaleDateString();
        }
        
        autoTable(doc, {
          startY: 84,
          head: [['Field', 'Value']],
          body: [
            ['Guest', `${b.b_name}`],
            ['Email', `${b.b_email || txn.email}`],
            ['Package', `${b.b_packageType} (${b.b_packageDuration} days)`],
            ['Occupancy', `${b.b_occupancyType}`],
            ['Guests', `${b.b_guest}`],
            ['Room', `Room ${b.b_roomNumber}`],
            ['Check-in', new Date(b.b_checkInDate).toLocaleDateString()],
            ['Check-out', checkOutDate],
            ['Package Price', `₹${(b.b_packagePrice||0).toLocaleString()}`],
            ['Total', `₹${(b.b_totalPrice||txn.amount).toLocaleString()}`],
          ],
        });
      } else if (Array.isArray(txn.cart) && txn.cart.length) {
        // Cart purchase table
        doc.setFontSize(14);
        doc.text('Cart Purchase', 14, 68);
        autoTable(doc, {
          startY: 74,
          head: [['Product', 'Qty', 'Unit (LKR)', 'Line (LKR)']],
          body: txn.cart.map(i => [
            i.p_name,
            String(i.quantity),
            `Rs. ${Number(i.p_price).toFixed(2)}`,
            `Rs. ${(Number(i.p_price) * Number(i.quantity)).toFixed(2)}`,
          ]),
        });
        // Summary row
        autoTable(doc, {
          startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 80,
          head: [['Package', 'Amount (USD)']],
          body: [[txn.packageType, `${txn.amount}`]],
        });
      } else {
        // Fallback to simple table
        autoTable(doc, {
          startY: 70,
          head: [['Package', 'Amount (USD)']],
          body: [[txn.packageType, `${txn.amount}`]],
        });
      }

      // ====== Footer ======
      doc.setFontSize(10);
      doc.text("Thank you for your payment!", 14, doc.internal.pageSize.height - 20);

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `Sath_Villa_Receipt_${txn.name?.replace(/\s+/g, '_')}_${timestamp}.pdf`;

      // Force download the PDF
      doc.save(filename);
      
      console.log('Receipt downloaded successfully:', filename);
    } catch (error) {
      console.error('Error generating receipt:', error);
      alert('Error generating receipt. Please try again.');
    }
  };

  // Auto-download only ONCE
  useEffect(() => {
    if (transaction && !downloadedRef.current) {
      downloadedRef.current = true; // mark as downloaded
      generateReceipt(transaction);
    }
  }, [transaction]);

  return (
    <div style={{ textAlign: "center", padding: "40px" }}>
      <h2>✅ Payment Successful!</h2>
      <p>Thank you, {transaction?.name}. Your payment was received.</p>
      <button
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
        onClick={() => generateReceipt(transaction)}
      >
        Download Receipt Again
      </button>
      <Link to={`/my-payments?email=${encodeURIComponent(transaction?.email || '')}&as=admin`} style={{
          display: 'inline-block',
          marginTop: '20px',
          marginLeft: '10px',
          padding: '10px 20px',
          backgroundColor: '#343a40',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          textDecoration: 'none'
      }}>
        My Payments
      </Link>
    </div>
  );
};

export default SuccessPage;