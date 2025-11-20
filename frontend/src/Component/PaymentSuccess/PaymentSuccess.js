import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PaymentService from "../../services/paymentService";
import Nav from "../Nav/Nav";
import Footer from "../Footer/Footer";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./PaymentSuccess.css";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const downloadedRef = useRef(false);

  // Function to clear user's cart after successful payment
  const clearUserCart = (userId) => {
    console.log('🛒 clearUserCart called with userId:', userId);
    if (userId) {
      const userCartKey = `cart_${userId}`;
      console.log('🛒 Clearing cart with key:', userCartKey);
      
      // Check if cart exists before clearing
      const existingCart = localStorage.getItem(userCartKey);
      console.log('🛒 Existing cart before clearing:', existingCart);
      
      localStorage.removeItem(userCartKey);
      console.log('🛒 Cart cleared for user:', userId);
      
      // Verify cart was cleared
      const cartAfterClear = localStorage.getItem(userCartKey);
      console.log('🛒 Cart after clearing:', cartAfterClear);
      
      // Dispatch a custom event to notify other components about cart clearing
      window.dispatchEvent(new Event('cartUpdated'));
      console.log('🛒 cartUpdated event dispatched');
    } else {
      console.log('🛒 No userId provided, cannot clear cart');
    }
  };

  useEffect(() => {
    // Load user data
    const userData = localStorage.getItem("user");
    console.log('🔍 PaymentSuccess - Raw user data from localStorage:', userData);
    if (userData) {
      const parsedUser = JSON.parse(userData);
      console.log('🔍 PaymentSuccess - Parsed user object:', parsedUser);
      console.log('🔍 PaymentSuccess - User ID:', parsedUser.id);
      setUser(parsedUser);
    } else {
      console.log('🔍 PaymentSuccess - No user data found in localStorage');
    }

    // Get URL parameters manually for compatibility
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const token = urlParams.get('t');
    const demo = urlParams.get('demo');

    console.log('🔍 PaymentSuccess URL params:', { sessionId, token, demo });

    // If we have a session_id, this is a successful Stripe checkout - clear cart immediately
    if (sessionId) {
      console.log('💳 Stripe checkout detected, clearing cart immediately');
      const currentUser = user || JSON.parse(localStorage.getItem("user") || '{}');
      console.log('💳 Current user for immediate cart clearing:', currentUser);
      
      if (currentUser && currentUser.id) {
        clearUserCart(currentUser.id);
      } else {
        // Clear all cart items as fallback
        console.log('💳 No user found, clearing all cart items');
        const allKeys = Object.keys(localStorage);
        const cartKeys = allKeys.filter(key => key.startsWith('cart_'));
        cartKeys.forEach(key => localStorage.removeItem(key));
        window.dispatchEvent(new Event('cartUpdated'));
      }
    }

    // Handle demo checkout (for cart purchases when Payment backend is unavailable)
    if (demo === 'true') {
      const checkoutData = localStorage.getItem('checkoutData');
      if (checkoutData) {
        try {
          const parsedData = JSON.parse(checkoutData);
          console.log('Demo checkout data found:', parsedData);
          
          // Create a mock transaction for demo
          const mockTransaction = {
            _id: 'demo_' + Date.now(),
            name: parsedData.user.name || 
                  parsedData.user.u_name || 
                  (parsedData.user.firstName && parsedData.user.lastName ? 
                    `${parsedData.user.firstName} ${parsedData.user.lastName}` : 
                    parsedData.user.firstName || 'Demo User'),
            email: parsedData.user.email || parsedData.user.u_email || 'demo@example.com',
            amount: parsedData.totalAmount,
            status: 'Paid',
            packageType: `Cart Purchase (${parsedData.cartItems.length} items)`,
            cart: parsedData.cartItems
          };
          
          console.log('Created mock transaction:', mockTransaction);
          setTransaction(mockTransaction);
          setLoading(false);
          
          // Auto-download receipt only once
          if (!downloadedRef.current) {
            downloadedRef.current = true;
            setTimeout(() => generateReceipt(mockTransaction), 1000);
          }
          
          // Clear checkout data and cart
          localStorage.removeItem('checkoutData');
          const userIdToClear = parsedData.user?.id || user?.id;
          if (userIdToClear) {
            clearUserCart(userIdToClear);
          }
          return;
        } catch (err) {
          console.error('Demo checkout data parsing error:', err);
          setError('Failed to parse checkout data');
          setLoading(false);
          return;
        }
      } else {
        console.log('No checkout data found in localStorage');
        setError('No checkout data found. Please try your purchase again.');
        setLoading(false);
        return;
      }
    }

    if (!sessionId && !token) {
      setError('Missing payment information');
      setLoading(false);
      return;
    }

    const confirmPayment = async () => {
      try {
        const result = await PaymentService.confirmPayment(sessionId, token);
        console.log('💳 Payment confirmation result:', result);
        console.log('💳 Payment status:', result?.status);
        console.log('💳 Current user for cart clearing:', user);
        setTransaction(result);
        
        // Clear cart after successful payment - get fresh user data if needed
        if (result && result.status === 'Paid') {
          const currentUser = user || JSON.parse(localStorage.getItem("user") || '{}');
          console.log('💳 Using user for cart clearing:', currentUser);
          
          if (currentUser && currentUser.id) {
            console.log('💳 Calling clearUserCart for successful Stripe payment');
            clearUserCart(currentUser.id);
          } else {
            console.log('💳 Cart not cleared - no valid user found');
            // Try alternative approaches to clear cart
            console.log('💳 Attempting to clear cart using alternative methods...');
            
            // Clear all cart-related localStorage items
            const allKeys = Object.keys(localStorage);
            const cartKeys = allKeys.filter(key => key.startsWith('cart_'));
            console.log('💳 Found cart keys:', cartKeys);
            
            cartKeys.forEach(key => {
              localStorage.removeItem(key);
              console.log('💳 Cleared cart key:', key);
            });
            
            // Dispatch cart update event
            window.dispatchEvent(new Event('cartUpdated'));
            console.log('💳 cartUpdated event dispatched after alternative clearing');
          }
        } else {
          console.log('💳 Cart not cleared. Conditions check:');
          console.log('   - result exists:', !!result);
          console.log('   - status is Paid:', result?.status === 'Paid');
        }
        
        // Auto-download receipt only once
        if (result && !downloadedRef.current) {
          downloadedRef.current = true;
          setTimeout(() => generateReceipt(result), 1000);
        }
      } catch (err) {
        console.error('Payment confirmation error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    confirmPayment();
  }, []); // Remove searchParams dependency

  const generateReceipt = (txn) => {
    if (!txn) return;

    try {
      const doc = new jsPDF();

      // ====== Logo ======
      try {
        // Add logo from the public folder
        doc.addImage("/sath-logo.png", "PNG", 150, 10, 40, 20);
      } catch (e) {
        console.warn("Logo not found, skipping image");
        // Add text logo as fallback
        doc.setFontSize(12);
        doc.text("🌿 Sath Villa", 150, 25);
      }

      // ====== Header ======
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text("Sath Villa Ayurvedic Wellness Resort", 14, 20);
      
      doc.setFontSize(16);
      doc.text("Payment Receipt", 14, 32);

      // ====== Transaction Info ======
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const today = new Date();
      
      doc.text(`Transaction ID: ${txn._id}`, 14, 47);
      doc.text(`Date: ${today.toLocaleDateString()} ${today.toLocaleTimeString()}`, 14, 55);
      doc.text(`Customer Name: ${txn.name}`, 14, 63);
      doc.text(`Email: ${txn.email}`, 14, 71);
      doc.text(`Status: ${txn.status}`, 14, 79);
      

      // ====== Booking Details Table ======
      if (txn.booking) {
        const b = txn.booking;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Booking Details', 14, 92);
        
        // Calculate check-out date if not provided
        let checkOutDate = 'Not specified';
        if (b.b_checkOutDate) {
          checkOutDate = new Date(b.b_checkOutDate).toLocaleDateString();
        } else if (b.b_checkInDate && b.b_packageDuration) {
          const checkIn = new Date(b.b_checkInDate);
          const checkOut = new Date(checkIn);
          checkOut.setDate(checkIn.getDate() + parseInt(b.b_packageDuration));
          checkOutDate = checkOut.toLocaleDateString();
        }

        autoTable(doc, {
          startY: 97,
          head: [['Field', 'Details']],
          body: [
            ['Guest Name', b.b_name],
            ['Package', `${b.b_packageType} (${b.b_packageDuration} days)`],
            ['Occupancy Type', b.b_occupancyType],
            ['Number of Guests', String(b.b_guest)],
            ['Room Number', `Room ${b.b_roomNumber}`],
            ['Check-in Date', new Date(b.b_checkInDate).toLocaleDateString()],
            ['Check-out Date', checkOutDate],
            ['Package Price', `$${(b.b_packagePrice || 0).toLocaleString()}`],
          ],
          theme: 'grid',
          headStyles: { fillColor: [76, 175, 80] },
          alternateRowStyles: { fillColor: [245, 245, 245] }
        });

        // Total Amount
        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 10,
          head: [['Total Amount (USD)', `$${(b.b_totalPrice || 0).toLocaleString()}`]],
          theme: 'grid',
          headStyles: { fillColor: [76, 175, 80], fontSize: 14, fontStyle: 'bold' }
        });
      } else if (txn.cart && Array.isArray(txn.cart) && txn.cart.length > 0) {
        // Cart purchase details
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Cart Purchase Details', 14, 92);
        
        autoTable(doc, {
          startY: 97,
          head: [['Product', 'Quantity', 'Unit Price', 'Total']],
          body: txn.cart.map(item => [
            item.p_name || item.name || 'Unknown Product',
            String(item.quantity || 1),
            `$${(item.p_price || 0).toFixed(2)}`,
            `$${((item.p_price || 0) * (item.quantity || 1)).toFixed(2)}`
          ]),
          theme: 'grid',
          headStyles: { fillColor: [76, 175, 80] },
          alternateRowStyles: { fillColor: [245, 245, 245] }
        });

        // Total Amount
        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 10,
          head: [['Total Amount (USD)', `$${(txn.amount || 0).toFixed(2)}`]],
          theme: 'grid',
          headStyles: { fillColor: [76, 175, 80], fontSize: 14, fontStyle: 'bold' }
        });
      } else {
        // Simple payment details
        autoTable(doc, {
          startY: 87,
          head: [['Payment Details', 'Amount']],
          body: [
            ['Package Type', txn.packageType || 'N/A'],
            ['Amount Paid (USD)', `$${txn.amount}`]
          ],
          theme: 'grid',
          headStyles: { fillColor: [76, 175, 80] }
        });
      }

      // ====== Footer ======
      const footerY = doc.internal.pageSize.height - 30;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text("Thank you for choosing Sath Villa Ayurvedic Wellness Resort!", 14, footerY);
      doc.text("For inquiries, contact us at info@sathvilla.com", 14, footerY + 8);

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

  if (loading) {
    return (
      <div>
        <Nav />
        <div className="payment-success-container">
          <div className="loading-message">
            <div className="spinner"></div>
            <h2>Confirming your payment...</h2>
            <p>Please wait while we process your booking.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Nav />
        <div className="payment-success-container">
          <div className="error-message">
            <h2>❌ Payment Confirmation Error</h2>
            <p>{error}</p>
            <div className="action-buttons" style={{ marginTop: '20px' }}>
              <button onClick={() => navigate('/cart')} className="btn btn-primary">
                Back to Cart
              </button>
              <button onClick={() => navigate('/bookings')} className="btn btn-secondary">
                Go to My Bookings
              </button>
              <button onClick={() => navigate('/')} className="btn btn-outline">
                Back to Home
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Nav />
      <div className="payment-success-container">
        <div className="success-content">
          <div className="success-icon">✅</div>
          <h1>Payment Successful!</h1>
          <p className="success-message">
            Thank you, <strong>{transaction?.name}</strong>! Your payment has been processed successfully.
          </p>
          
          {transaction?.booking && (
            <div className="booking-summary">
              <h3>Booking Confirmed</h3>
              <div className="booking-info">
                <p><strong>Package:</strong> {transaction.booking.b_packageType} ({transaction.booking.b_packageDuration} days)</p>
                <p><strong>Check-in:</strong> {new Date(transaction.booking.b_checkInDate).toLocaleDateString()}</p>
                <p><strong>Room:</strong> Room {transaction.booking.b_roomNumber}</p>
                <p><strong>Guests:</strong> {transaction.booking.b_guest}</p>
                <p><strong>Total Amount:</strong> ${(transaction.booking.b_totalPrice || 0).toLocaleString()}</p>
              </div>
            </div>
          )}

          {transaction?.cart && Array.isArray(transaction.cart) && transaction.cart.length > 0 && (
            <div className="booking-summary">
              <h3>Cart Purchase Confirmed</h3>
              <div className="booking-info">
                <p><strong>Items Purchased:</strong> {transaction.cart.length} products</p>
                <div className="cart-items-summary">
                  {transaction.cart.map((item, index) => (
                    <p key={index} style={{ fontSize: '14px', margin: '2px 0' }}>
                      <strong>{item.p_name || item.name}:</strong> {item.quantity} × ${(item.p_price || 0).toFixed(2)}
                    </p>
                  ))}
                </div>
                <p><strong>Total Amount:</strong> ${(transaction.amount || 0).toFixed(2)}</p>
              </div>
            </div>
          )}

          <div className="action-buttons">
            <button 
              onClick={() => generateReceipt(transaction)} 
              className="btn btn-secondary"
            >
              📄 Download Receipt PDF
            </button>
            <button 
              onClick={() => navigate('/bookings')} 
              className="btn btn-primary"
            >
              View My Bookings
            </button>
            <button 
              onClick={() => navigate('/')} 
              className="btn btn-outline"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;