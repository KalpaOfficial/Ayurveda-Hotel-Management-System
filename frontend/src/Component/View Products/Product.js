import React, { useState } from "react";
import "../View Products/product.css";
import { useNavigate } from "react-router-dom";
import PaymentService from "../../services/paymentService";

function Product({ product }) {
  const {
    p_name,
    p_image,
    p_description,
    p_price,
    p_quantity,
    p_catogory,
    _id,
  } = product;

  const navigate = useNavigate();
  const [showQuantitySelector, setShowQuantitySelector] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  // Check if user is logged in
  const isUserLoggedIn = () => {
    const userData = localStorage.getItem("user");
    return userData !== null;
  };

  // Get current user
  const getCurrentUser = () => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  };

  // Add to cart function
  const addToCart = (quantity = 1) => {
    // Check if user is logged in
    if (!isUserLoggedIn()) {
      alert("Please login to add items to cart!");
      navigate("/signin");
      return;
    }

    const user = getCurrentUser();
    if (!user) return;

    const cartItem = {
      _id,
      p_name,
      p_image,
      p_description,
      p_price,
      p_quantity,
      p_catogory,
      quantity: quantity
    };

    // Get user-specific cart from localStorage
    const userCartKey = `cart_${user.id}`;
    const existingCart = JSON.parse(localStorage.getItem(userCartKey)) || [];
    
    // Check if item already exists in cart
    const existingItemIndex = existingCart.findIndex(item => item._id === _id);
    
    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      existingCart.push(cartItem);
    }

    // Save to user-specific localStorage
    localStorage.setItem(userCartKey, JSON.stringify(existingCart));
    
    // Dispatch custom event to update cart in navigation
    window.dispatchEvent(new CustomEvent('cartUpdated'));
    
    // Reset quantity selector
    setShowQuantitySelector(false);
    setSelectedQuantity(1);
    
    alert(`✅ ${p_name} added to cart!`);
  };

  // Handle Add Cart button click
  const handleAddCartClick = () => {
    if (showQuantitySelector) {
      addToCart(selectedQuantity);
    } else {
      setShowQuantitySelector(true);
    }
  };

  // Handle Buy Now button click - Direct checkout without cart
  const handleBuyNowClick = async (e) => {
    e.stopPropagation(); // Prevent product click navigation
    
    // Check if user is logged in
    const userData = localStorage.getItem("user");
    if (!userData) {
      alert("Please login to make a purchase");
      navigate("/signin");
      return;
    }

    const user = JSON.parse(userData);
    
    try {
      console.log('🛒 Direct Buy Now clicked for product:', p_name);
      
      // Prepare single-item cart data for checkout
      const buyNowData = {
        name: user.name || 
              user.u_name || 
              (user.firstName && user.lastName ? 
                `${user.firstName} ${user.lastName}` : 
                user.firstName || 'Unknown User'),
        email: user.email || user.u_email || '',
        cart: [{
          _id: _id,
          p_name: p_name,
          p_price: p_price,
          quantity: 1,
          p_image: p_image,
          p_description: p_description
        }]
      };

      console.log('🛒 Buy Now checkout data:', buyNowData);

      // Call PaymentService for direct checkout
      const response = await PaymentService.checkoutFromCart(buyNowData);
      
      if (response.success && response.url) {
        console.log('🛒 Redirecting to Stripe checkout:', response.url);
        window.location.href = response.url;
      } else {
        throw new Error('No checkout URL received');
      }
      
    } catch (error) {
      console.error('🛒 Buy Now checkout failed:', error);
      
      // Fallback: Add to cart and go to cart page
      console.log('🛒 Falling back to cart method');
      alert(`Direct checkout failed: ${error.message}. Adding to cart instead.`);
      addToCart(1);
      navigate("/cart");
    }
  };

  const handleProductClick = () => {
    navigate(`/product-view/${_id}`);
  };

  return (
    <div className="product-card" onClick={handleProductClick} style={{ cursor: 'pointer' }}>
      {/* Image */}
      <img
        src={`http://localhost:5000${p_image}`} // make sure backend serves uploads
        alt={p_name}
        className="product-image"
        onError={(e) => (e.target.src = "/fallback.png")} // fallback if image missing
      />

      {/* Content */}
      <div className="product-details">
        <h2 className="product-name">{p_name}</h2>
        <p className="product-category">{p_catogory}</p>
        <p className="product-description">{p_description}</p>

        <div className="product-meta">
          <span className="product-price">${p_price.toFixed(2)}</span>
          <span
            className={`product-stock ${
              p_quantity > 0 ? "in-stock" : "out-stock"
            }`}
          >
            {p_quantity > 0 ? `In Stock` : "Out of Stock"}
          </span>
        </div>

        {/* Buttons */}
        <div className="product-actions" onClick={(e) => e.stopPropagation()}>
          {!showQuantitySelector ? (
            <>
              <button 
                className="btn add-cart-btn" 
                onClick={handleAddCartClick}
                disabled={p_quantity <= 0}
              >
                Add Cart
              </button>
              <button 
                className="btn buy-now-btn" 
                onClick={handleBuyNowClick}
                disabled={p_quantity <= 0}
              >
                Buy Now
              </button>
            </>
          ) : (
            <div className="quantity-selector-container">
              <div className="quantity-selector">
                <button 
                  className="qty-btn" 
                  onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                >
                  -
                </button>
                <input
                  type="number"
                  className="qty-input"
                  value={selectedQuantity}
                  onChange={(e) => setSelectedQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  max={p_quantity}
                />
                <button 
                  className="qty-btn" 
                  onClick={() => setSelectedQuantity(Math.min(p_quantity, selectedQuantity + 1))}
                >
                  +
                </button>
              </div>
              <button 
                className="btn add-cart-btn" 
                onClick={handleAddCartClick}
              >
                Add to Cart
              </button>
              <button 
                className="btn cancel-btn" 
                onClick={() => {
                  setShowQuantitySelector(false);
                  setSelectedQuantity(1);
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Product;
