import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Add Product/Add_Product.css";

function AdminUpdateProduct({ productId, onBack }) {
  const [inputs, setInputs] = useState({
    p_name: "",
    p_description: "",
    p_price: "",
    p_quantity: "",
    p_catogory: "",
  });

  const [file, setFile] = useState(null); // store new image file
  const [preview, setPreview] = useState(null); // preview image (current or new)
  const [loading, setLoading] = useState(true);

  // Fetch existing product data
  useEffect(() => {
    if (!productId) return;
    
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/products/${productId}`);
        const productData = response.data.product;
        
        setInputs({
          p_name: productData.p_name || "",
          p_description: productData.p_description || "",
          p_price: productData.p_price || "",
          p_quantity: productData.p_quantity || "",
          p_catogory: productData.p_catogory || "",
        });
        
        // Set preview to current image if exists
        if (productData.p_image) {
          setPreview(`http://localhost:5000${productData.p_image}`);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product:", error);
        alert("Failed to load product data");
        onBack(); // Go back to products list
      }
    };

    fetchProduct();
  }, [productId, onBack]);

  // text input changes
  const handleChange = (e) => {
    setInputs((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // handle file select
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  // submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("p_name", inputs.p_name);
    formData.append("p_description", inputs.p_description);
    formData.append("p_price", inputs.p_price);
    formData.append("p_quantity", inputs.p_quantity);
    formData.append("p_catogory", inputs.p_catogory);
    
    // Only append image if a new one is selected
    if (file) {
      formData.append("p_image", file);
    }

    try {
      await axios.put(`http://localhost:5000/products/${productId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("✅ Product updated successfully!");
      onBack(); // Go back to products view
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update product");
    }
  };


  if (loading) {
    return (
      <div className="form-container">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h3>Loading product data...</h3>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="product-header">
        <h2>✏️ Update Product</h2>
        <button 
          className="btn-back"
          onClick={onBack}
        >
          ← Back to Products
        </button>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="product-form">
          {/* Name */}
          <label>Product Name</label>
          <input
            type="text"
            name="p_name"
            value={inputs.p_name}
            onChange={handleChange}
            required
          />

          {/* Description */}
          <label>Description</label>
          <textarea
            name="p_description"
            value={inputs.p_description}
            onChange={handleChange}
            rows="3"
            required
          />

          {/* Category */}
          <label>Category</label>
          <select
            name="p_catogory"
            value={inputs.p_catogory}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            <option value="Herbal Supplement">Herbal Supplement</option>
            <option value="Ayurvedic Oil">Ayurvedic Oil</option>
            <option value="Skin Care">Skin Care</option>
            <option value="Other">Other</option>
          </select>

          {/* Price */}
          <label>Price ($)</label>
          <input
            type="number"
            name="p_price"
            value={inputs.p_price}
            onChange={handleChange}
            required
          />

          {/* Stock */}
          <label>Stock</label>
          <input
            type="number"
            name="p_quantity"
            value={inputs.p_quantity}
            onChange={handleChange}
            required
          />

          {/* Image */}
          <label>Product Image</label>
          {preview && (
            <div style={{ marginBottom: '10px' }}>
              <img
                src={preview}
                alt="Preview"
                style={{ 
                  width: "150px", 
                  borderRadius: "8px",
                  border: "1px solid #ccc"
                }}
              />
              <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                {file ? "New image preview" : "Current image"}
              </p>
            </div>
          )}
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange}
          />
          <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            Leave empty to keep current image
          </p>

          <button type="submit" className="submit-btn">
            Update Product
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminUpdateProduct;
