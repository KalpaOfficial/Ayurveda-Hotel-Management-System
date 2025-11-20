import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Nav from "../Nav/Nav";
import Footer from "../Footer/Footer";
import axios from "axios";
import { FaTruck, FaShieldAlt } from "react-icons/fa";
import PaymentService from "../../services/paymentService";
import "./productView.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

function ProductView() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Product state
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Cart and quantity state
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  
  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ name: "", description: "", stars: 5 });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  
  // User state
  const [user, setUser] = useState(null);
  
  // UI state
  const [activeTab, setActiveTab] = useState("description");
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Check for logged-in user
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await axios.get(`${API_BASE}/products/${id}`);
        setProduct(response.data.product);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Product not found or failed to load");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Fetch reviews for this specific product
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${API_BASE}/reviews/product/${id}`);
        setReviews(response.data.reviews || []);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    };

    if (id) {
      fetchReviews();
    }
  }, [id]);

  // Fetch related products
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        const response = await axios.get(`${API_BASE}/products`);
        const allProducts = response.data.products || [];
        
        // First, try to get products from same category, excluding current product
        let related = allProducts
          .filter(p => p._id !== id && p.p_catogory === product?.p_catogory)
          .slice(0, 3); // Reduced from 4 to 3
        
        // If we don't have enough products from same category, add other products
        if (related.length < 3) {
          const otherProducts = allProducts
            .filter(p => p._id !== id && p.p_catogory !== product?.p_catogory)
            .slice(0, 3 - related.length);
          related = [...related, ...otherProducts];
        }
        
        setRelatedProducts(related);
      } catch (err) {
        console.error("Error fetching related products:", err);
      }
    };

    if (product) {
      fetchRelatedProducts();
    }
  }, [product, id]);

  // Check if user is logged in
  const isUserLoggedIn = () => {
    return user !== null;
  };

  // Add to cart function
  const addToCart = (quantity = 1) => {
    if (!isUserLoggedIn()) {
      alert("Please login to add items to cart!");
      navigate("/signin");
      return;
    }

    if (!user || !product) return;

    const cartItem = {
      _id: product._id,
      p_name: product.p_name,
      p_image: product.p_image,
      p_description: product.p_description,
      p_price: product.p_price,
      p_quantity: product.p_quantity,
      p_catogory: product.p_catogory,
      quantity: quantity
    };

    // Get user-specific cart from localStorage
    const userCartKey = `cart_${user.id}`;
    const existingCart = JSON.parse(localStorage.getItem(userCartKey)) || [];
    
    // Check if item already exists in cart
    const existingItemIndex = existingCart.findIndex(item => item._id === product._id);
    
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
    setSelectedQuantity(1);
    
    alert(`✅ ${product.p_name} added to cart!`);
  };

  // Handle Add Cart button click
  const handleAddCartClick = () => {
    addToCart(selectedQuantity);
  };

  // Handle Buy Now button click - Direct checkout without cart
  const handleBuyNowClick = async () => {
    if (!isUserLoggedIn()) {
      alert("Please login to make a purchase");
      navigate("/signin");
      return;
    }

    if (!user || !product) {
      alert("Product or user data not available");
      return;
    }
    
    try {
      console.log('🛒 Direct Buy Now clicked for product:', product.p_name);
      
      // Prepare single-item cart data for checkout
      const buyNowData = {
        name: user.name || 
              user.u_name || 
              (user.firstName && user.lastName ? 
                `${user.firstName} ${user.lastName}` : 
                user.firstName || 'Unknown User'),
        email: user.email || user.u_email || '',
        cart: [{
          _id: product._id,
          p_name: product.p_name,
          p_price: product.p_price,
          quantity: selectedQuantity,
          p_image: product.p_image,
          p_description: product.p_description
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
      addToCart(selectedQuantity);
      navigate("/cart");
    }
  };


  // Handle review submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isUserLoggedIn()) {
      alert("Please login to submit a review!");
      navigate("/signin");
      return;
    }

    try {
      setReviewLoading(true);
      const response = await axios.post(`${API_BASE}/reviews`, {
        ...reviewForm,
        stars: Number(reviewForm.stars),
        productId: id
      });
      
      if (response.status === 201) {
        // Refresh reviews for this product
        const reviewsResponse = await axios.get(`${API_BASE}/reviews/product/${id}`);
        setReviews(reviewsResponse.data.reviews || []);
        
        // Reset form
        setReviewForm({ name: "", description: "", stars: 5 });
        setShowReviewForm(false);
        alert("Review submitted successfully!");
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("Failed to submit review. Please try again.");
    } finally {
      setReviewLoading(false);
    }
  };

  // Render star rating
  const renderStars = (rating, interactive = false, onStarClick = null) => {
    return (
      <div className={`stars-container ${interactive ? 'interactive' : ''}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= rating ? 'filled' : 'empty'}`}
            onClick={interactive ? () => onStarClick(star) : undefined}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + (review.stars || 0), 0) / reviews.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div>
        <Nav />
        <div className="product-view-loading">
          <div className="loading-spinner"></div>
          <p>Loading product details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div>
        <Nav />
        <div className="product-view-error">
          <h2>Product Not Found</h2>
          <p>{error || "The product you're looking for doesn't exist."}</p>
          <button onClick={() => navigate("/products")} className="btn btn-primary">
            Back to Products
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Nav />
      <div className="product-view-container">
        <div className="product-navigation">
          <button onClick={() => navigate("/products")} className="btn btn-back">
            ← Back to Products
          </button>
        </div>

        {/* Main Product Section */}
        <div className="product-main-section">
          <div className="product-image-container">
            <div className="main-image-container">
              <img
                src={`${API_BASE}${product.p_image}`}
                alt={product.p_name}
                className="product-main-image"
                onError={(e) => (e.target.src = "/fallback.png")}
              />
            </div>
          </div>

          <div className="product-details-panel">
            <div className="product-header">
              <h1 className="product-title">{product.p_name}</h1>
              <div className="product-rating-summary">
                {renderStars(Math.round(averageRating))}
                <span className="rating-text">
                  {averageRating} ({reviews.length} reviews)
                </span>
              </div>
            </div>

            <div className="price-section">
              <div className="price-display">
                <span className="current-price">${product.p_price.toFixed(2)}</span>
              </div>
            </div>

            <div className="product-specifications">
              <h3>Product Information</h3>
              <ul className="specs-list">
                <li><strong>Category:</strong> {product.p_catogory}</li>
                <li><strong>Price:</strong> ${product.p_price.toFixed(2)}</li>
                <li><strong>Stock Available:</strong> {product.p_quantity} units</li>
                <li><strong>Product ID:</strong> {product._id.slice(-8).toUpperCase()}</li>
              </ul>
            </div>


            <div className="quantity-selector">
              <label>Quantity</label>
              <div className="quantity-controls">
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
                  max={product.p_quantity}
                />
                <button 
                  className="qty-btn" 
                  onClick={() => setSelectedQuantity(Math.min(product.p_quantity, selectedQuantity + 1))}
                >
                  +
                </button>
              </div>
            </div>

            <div className="action-buttons">
              <button 
                className="btn btn-add-cart" 
                onClick={() => addToCart(selectedQuantity)}
                disabled={product.p_quantity <= 0}
              >
                Add To Cart
              </button>
              <button 
                className="btn btn-buy-now" 
                onClick={handleBuyNowClick}
                disabled={product.p_quantity <= 0}
              >
                Buy Now
              </button>
            </div>


            {/* <div className="policy-links">
              <a href="#" className="policy-link">
                <FaTruck /> DELIVERY POLICY
              </a>
              <a href="#" className="policy-link">
                <FaShieldAlt /> SHIPPING INFORMATION
              </a>
            </div> */}
          </div>
        </div>

        {/* Product Information Tabs */}
        <div className="product-info-tabs">
          <div className="tab-navigation">
            <button 
              className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              DESCRIPTION
            </button>
            <button 
              className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              REVIEWS ({reviews.length})
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'description' && (
              <div className="description-content">
                <h3>{product.p_name}</h3>
                <p>{product.p_description}</p>
                
                <div className="product-details">
                  <h4>Product Details:</h4>
                  <ul className="details-list">
                    <li><strong>Category:</strong> {product.p_catogory}</li>
                    <li><strong>Price:</strong> ${product.p_price.toFixed(2)}</li>
                    <li><strong>Available Stock:</strong> {product.p_quantity} units</li>
                    <li><strong>Product ID:</strong> {product._id}</li>
                  </ul>
                </div>
              </div>
            )}


            {activeTab === 'reviews' && (
              <div className="reviews-content">
                <div className="reviews-header">
                  <div className="reviews-summary">
                    <div className="average-rating">
                      {renderStars(Math.round(averageRating))}
                      <span className="rating-number">{averageRating}</span>
                      <span className="rating-count">({reviews.length} reviews)</span>
                    </div>
                    {isUserLoggedIn() && (
                      <button 
                        className="btn btn-write-review"
                        onClick={() => setShowReviewForm(!showReviewForm)}
                      >
                        Write a Review
                      </button>
                    )}
                  </div>
                </div>

                {/* Review Form */}
                {showReviewForm && (
                  <div className="review-form-container">
                    <form onSubmit={handleReviewSubmit} className="review-form">
                      <h3>Write Your Review</h3>
                      <div className="form-group">
                        <label>Your Name:</label>
                        <input
                          type="text"
                          value={reviewForm.name}
                          onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                          required
                          placeholder="Enter your name"
                        />
                      </div>
                      <div className="form-group">
                        <label>Rating:</label>
                        <div className="rating-input">
                          {renderStars(reviewForm.stars, true, (star) => 
                            setReviewForm({ ...reviewForm, stars: star })
                          )}
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Review:</label>
                        <textarea
                          value={reviewForm.description}
                          onChange={(e) => setReviewForm({ ...reviewForm, description: e.target.value })}
                          required
                          placeholder="Share your experience with this product..."
                          rows="4"
                        />
                      </div>
                      <div className="form-actions">
                        <button 
                          type="submit" 
                          className="btn btn-submit-review"
                          disabled={reviewLoading}
                        >
                          {reviewLoading ? (
                            <>
                              <span className="loading-spinner-small"></span>
                              Submitting...
                            </>
                          ) : (
                            "Submit Review"
                          )}
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-cancel"
                          onClick={() => setShowReviewForm(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Reviews List */}
                <div className="reviews-list">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review._id} className="review-item">
                        <div className="review-header">
                          <div className="reviewer-info">
                            <span className="reviewer-name">{review.name || "Anonymous"}</span>
                            <div className="review-rating">
                              {renderStars(review.stars)}
                            </div>
                          </div>
                          <span className="review-date">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="review-content">
                          <p>{review.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-reviews">
                      <p>No reviews yet. Be the first to review this product!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Section */}
        <div className="related-products-section">
          <h2>Related Products</h2>
          {relatedProducts.length > 0 ? (
            <div className="related-products-grid">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct._id} className="related-product-card">
                  <div className="related-product-image">
                    <img
                      src={`${API_BASE}${relatedProduct.p_image}`}
                      alt={relatedProduct.p_name}
                      onClick={() => navigate(`/product-view/${relatedProduct._id}`)}
                    />
                  </div>
                  <div className="related-product-info">
                    <h3>{relatedProduct.p_name}</h3>
                    <div className="related-product-price">
                      ${relatedProduct.p_price.toFixed(2)}
                    </div>
                    <button 
                      className="btn btn-select-options"
                      onClick={() => navigate(`/product-view/${relatedProduct._id}`)}
                    >
                      Select Options
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-related-products">
              <p>No related products found in the same category.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ProductView;
