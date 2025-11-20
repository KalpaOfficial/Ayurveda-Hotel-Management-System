import React, { useState, useEffect } from "react";
import Nav from "../Nav/Nav";
import Footer from "../Footer/Footer";
import PaymentService from "../../services/paymentService";
import "../Cart/Cart.css";
import { Link, useNavigate } from "react-router-dom";

function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Check for logged-in user and handle checkout status
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      // Redirect to login if not logged in
      navigate("/signin");
    }

    // Check for canceled checkout
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('canceled') === '1') {
      alert('Checkout was canceled. Your cart items are still here.');
      // Clean the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [navigate]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadCart = () => {
      if (user) {
        // Load user-specific cart
        const userCartKey = `cart_${user.id}`;
        const storedCart = JSON.parse(localStorage.getItem(userCartKey)) || [];
        setCartItems(storedCart);
      } else {
        // Clear cart when user is not logged in
        setCartItems([]);
      }
    };
    
    // Load cart initially
    loadCart();
    
    // Listen for cart updates from other components
    const handleCartUpdate = () => {
      loadCart();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [user]);

  // Note: We don't automatically save to localStorage on every cartItems change
  // because this can cause conflicts when loading from localStorage
  // We only save when we actually modify the cart through user actions

  // Handle quantity change
  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity < 1 || !user) return;
    
    setCartItems((prev) => {
      const updated = prev.map((item) =>
        item._id === id ? { ...item, quantity: newQuantity } : item
      );
      // Save to user-specific localStorage
      const userCartKey = `cart_${user.id}`;
      localStorage.setItem(userCartKey, JSON.stringify(updated));
      // Dispatch custom event to update navigation
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      return updated;
    });
  };

  // Handle remove from cart
  const handleRemove = (id) => {
    if (window.confirm("Are you sure you want to remove this item from your cart?")) {
      setCartItems((prev) => {
        const updated = prev.filter((item) => item._id !== id);
        // Save to user-specific localStorage
        const userCartKey = `cart_${user.id}`;
        localStorage.setItem(userCartKey, JSON.stringify(updated));
        // Dispatch custom event to update navigation
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        return updated;
      });
    }
  };

  // Clear entire cart
  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to clear your entire cart?")) {
      setCartItems([]);
      // Save to user-specific localStorage
      const userCartKey = `cart_${user.id}`;
      localStorage.setItem(userCartKey, JSON.stringify([]));
      // Dispatch custom event to update navigation
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    }
  };

  // Calculate totals
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.p_price * item.quantity,
    0
  );

  // Handle checkout
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    if (!user) {
      alert("Please login to proceed with checkout!");
      navigate("/signin");
      return;
    }

    setCheckoutLoading(true);

    try {
      // Prepare cart data for Stripe checkout
      const cartData = {
        name: user.name || 
              user.u_name || 
              (user.firstName && user.lastName ? 
                `${user.firstName} ${user.lastName}` : 
                user.firstName || 'Unknown User'),
        email: user.email || user.u_email || '',
        cart: cartItems.map(item => ({
          _id: item._id,
          p_name: item.p_name,
          p_price: item.p_price,
          quantity: item.quantity,
          p_image: item.p_image,
          p_description: item.p_description
        }))
      };

      console.log('Attempting Stripe checkout with Payment backend...', cartData);

      // Call the PaymentService to create Stripe checkout session
      const result = await PaymentService.checkoutFromCart(cartData);
      
      if (result && result.url) {
        console.log('Redirecting to Stripe checkout:', result.url);
        // Payment backend worked - redirect to Stripe checkout
        window.location.href = result.url;
        return;
      } else {
        throw new Error('No checkout URL received from Payment backend');
      }
      
    } catch (error) {
      console.error('Stripe checkout failed:', error);
      
      // Fallback to demo mode if Stripe checkout fails
      try {
        console.log('Falling back to demo mode due to error:', error.message);
        
        // Store cart data in localStorage for demo checkout
        const checkoutData = {
          user: user,
          cartItems: cartItems,
          totalAmount: totalPrice,
          timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
        
        alert(`Stripe checkout is currently unavailable. Proceeding with demo checkout for ${cartItems.length} items totaling $${totalPrice.toFixed(2)}.`);
        
        // Clear cart after "successful" demo checkout
        setCartItems([]);
        const userCartKey = `cart_${user.id}`;
        localStorage.setItem(userCartKey, JSON.stringify([]));
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        
        // Navigate to success page with demo mode
        navigate('/payment-success?demo=true');
        
      } catch (demoError) {
        console.error('Demo checkout also failed:', demoError);
        alert('Failed to process checkout. Please try again.');
      }
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div>
      <Nav />
      <div className="cart-page">
        <div className="cart-container">
          <h1 className="cart-title">Your Shopping Cart</h1>
          
          
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">🛒</div>
              <h2>Your cart is empty</h2>
              <p>Looks like you haven't added any items to your cart yet.</p>
              <Link to="/products" className="continue-shopping-btn">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <>
              <div className="cart-header">
                <span className="cart-count">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
                </span>
                <button 
                  className="clear-cart-btn"
                  onClick={handleClearCart}
                >
                  Clear Cart
                </button>
              </div>

              <div className="cart-content">
                <div className="cart-items">
                  {cartItems.map((item) => (
                    <div key={item._id} className="cart-item">
                      <div className="cart-item-image">
                        <img
                          src={`http://localhost:5000${item.p_image}`}
                          alt={item.p_name}
                          onError={(e) => (e.target.src = "/fallback.png")}
                        />
                      </div>
                      
                      <div className="cart-item-details">
                        <h3 className="cart-item-name">{item.p_name}</h3>
                        <p className="cart-item-category">{item.p_catogory}</p>
                        <p className="cart-item-description">{item.p_description}</p>
                        <div className="cart-item-price">
                          ${item.p_price.toFixed(2)} each
                        </div>
                      </div>

                      <div className="cart-item-quantity">
                        <label>Quantity:</label>
                        <div className="quantity-controls">
                          <button
                            className="qty-btn"
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            className="qty-input"
                            value={item.quantity}
                            onChange={(e) => {
                              const newQty = parseInt(e.target.value);
                              if (newQty && newQty >= 1 && newQty <= item.p_quantity) {
                                handleQuantityChange(item._id, newQty);
                              } else if (e.target.value === '') {
                                // Allow empty input temporarily for better UX
                                return;
                              }
                            }}
                            onBlur={(e) => {
                              const newQty = parseInt(e.target.value);
                              if (!newQty || newQty < 1) {
                                handleQuantityChange(item._id, 1);
                              } else if (newQty > item.p_quantity) {
                                handleQuantityChange(item._id, item.p_quantity);
                              }
                            }}
                            min="1"
                            max={item.p_quantity}
                          />
                          <button
                            className="qty-btn"
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            disabled={item.quantity >= item.p_quantity}
                          >
                            +
                          </button>
                        </div>
                        <div className="item-total">
                          Total: ${(item.p_price * item.quantity).toFixed(2)}
                        </div>
                      </div>

                      <div className="cart-item-actions">
                        <button
                          className="remove-btn"
                          onClick={() => handleRemove(item._id)}
                          title="Remove from cart"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-summary">
                  <div className="summary-card">
                    <h2>Order Summary</h2>
                    <div className="summary-row">
                      <span>Items ({totalItems}):</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Shipping:</span>
                      <span>Free</span>
                    </div>
                    <div className="summary-row total-row">
                      <span>Total:</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    
                    <div className="checkout-actions">
                    <button 
                        className="checkout-btn"
                        onClick={handleCheckout}
                        disabled={checkoutLoading}
                      >
                        {checkoutLoading ? '🔄 Processing...' : 'Proceed to Checkout'}
                      </button>
                      <Link to="/products" className="continue-shopping-link">
                        Continue Shopping
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Cart;
