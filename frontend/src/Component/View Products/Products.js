import React, { useState, useEffect } from "react";
import Nav from "../Nav/Nav";
import axios from "axios";
import Product from "../View Products/Product";
import Footer from "../Footer/Footer";
import "../View Products/product.css";
import heroImage from "../View Products/6.jpg";
import strip1 from "../View Products/1.avif";
import strip2 from "../View Products/2.avif";
import strip3 from "../View Products/3.webp";

const URL = "http://localhost:5000/products";

const fetchHandler = async () => {
  return await axios.get(URL).then((res) => res.data);
};

function Products() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchHandler().then((data) => {
      setProducts(data.products);
      setFilteredProducts(data.products);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(data.products.map(product => product.p_catogory).filter(Boolean))];
      setCategories(uniqueCategories);
    });
  }, []);

  // Filter products based on search term and category
  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(product => product.p_catogory === selectedCategory);
    }

    // Filter by search term
    if (searchTerm.trim() !== "") {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((product) => {
        const name = (product.p_name || "").toLowerCase();
        const description = (product.p_description || "").toLowerCase();
        const category = (product.p_catogory || "").toLowerCase();
        
        return name.includes(searchLower) ||
               description.includes(searchLower) ||
               category.includes(searchLower);
      });
    }

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);


  return (
    <div>
      <Nav />
      <div className="products-page">
        {/* Hero / Intro */}
        <section className="products-hero">
          <div className="products-hero-content">
            <span className="hero-badge">Authentic Ayurveda</span>
            <h1>Ayurvedic Products for Everyday Wellness</h1>
            <p>
              Our carefully curated range of Ayurvedic products is crafted with natural
              ingredients and traditional methods to support balance of mind, body,
              and spirit. From herbal oils and teas to skincare and supplements,
              each product is designed to nurture your well-being the natural way.
            </p>
            <div className="products-why">
              <h3>Why choose Ayurvedic products?</h3>
              <ul>
                <li>Holistic benefits rooted in centuries-old wisdom</li>
                <li>Natural, plant-based ingredients with minimal additives</li>
                <li>Gentle, supportive care for daily wellness routines</li>
                <li>Crafted to help restore balance and vitality</li>
              </ul>
            </div>
          </div>
          <div className="products-hero-image">
            <img src={heroImage} alt="Ayurvedic wellness" />
          </div>
        </section>

        {/* Image strip to match Home aesthetic */}
        <div className="image-strip">
          <img src={strip1} alt="Garden view" />
          <img src={strip2} alt="Flower bath" />
          <img src={strip3} alt="Herbal drinks" />
        </div>

        <h2 className="section-title">Our Ayurvedic Products</h2>
        
        {/* Search + Category Filter (one row) */}
        <div className="filter-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Search products by name, description, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
          {selectedCategory && (
            <button 
              className="clear-filter-btn"
              onClick={() => setSelectedCategory("")}
            >
              Clear
            </button>
          )}
        </div>

        <div className="products-grid">
          {filteredProducts && filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <Product key={product._id} product={product} />
            ))
          ) : (
            <p className="no-products">
              {searchTerm.trim() || selectedCategory 
                ? `No products found matching your criteria` 
                : "No products available"}
            </p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Products;
