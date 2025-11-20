import React, { useState } from "react";
import axios from "axios";
import "../Add Product/Add_Product.css";

function AdminAddProduct({ onBack }) {
  const [inputs, setInputs] = useState({
    p_name: "",
    p_description: "",
    p_price: "",
    p_quantity: "",
    p_catogory: "",
  });

  const [file, setFile] = useState(null); // store image file
  const [preview, setPreview] = useState(null); // preview image
  const [errors, setErrors] = useState({}); // validation errors
  const [isSubmitting, setIsSubmitting] = useState(false); // loading state

  // Validation functions
  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'p_name':
        if (!value.trim()) {
          newErrors.p_name = 'Product name is required';
        } else if (value.trim().length < 2) {
          newErrors.p_name = 'Product name must be at least 2 characters';
        } else if (value.trim().length > 100) {
          newErrors.p_name = 'Product name must be less than 100 characters';
        } else {
          delete newErrors.p_name;
        }
        break;
        
      case 'p_description':
        if (!value.trim()) {
          newErrors.p_description = 'Description is required';
        } else if (value.trim().length < 10) {
          newErrors.p_description = 'Description must be at least 10 characters';
        } else if (value.trim().length > 2500) {
          newErrors.p_description = 'Description must be less than 2500 characters';
        } else {
          delete newErrors.p_description;
        }
        break;
        
      case 'p_price':
        if (!value) {
          newErrors.p_price = 'Price is required';
        } else if (isNaN(value) || parseFloat(value) <= 0) {
          newErrors.p_price = 'Price must be a positive number';
        } else if (parseFloat(value) > 10000) {
          newErrors.p_price = 'Price must be less than $10,000';
        } else if (parseFloat(value) < 0.01) {
          newErrors.p_price = 'Price must be at least $0.01';
        } else {
          delete newErrors.p_price;
        }
        break;
        
      case 'p_quantity':
        if (!value) {
          newErrors.p_quantity = 'Stock quantity is required';
        } else if (isNaN(value) || parseInt(value) < 0) {
          newErrors.p_quantity = 'Stock quantity must be a non-negative number';
        } else if (parseInt(value) > 10000) {
          newErrors.p_quantity = 'Stock quantity must be less than 10,000';
        } else {
          delete newErrors.p_quantity;
        }
        break;
        
      case 'p_catogory':
        if (!value) {
          newErrors.p_catogory = 'Category is required';
        } else {
          delete newErrors.p_catogory;
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // File validation
  const validateFile = (file) => {
    const newErrors = { ...errors };
    
    if (!file) {
      newErrors.p_image = 'Product image is required';
    } else {
      // Check file type
      if (!file.type.startsWith('image/')) {
        newErrors.p_image = 'Please select a valid image file';
      }
      // Check file size (max 5MB)
      else if (file.size > 5 * 1024 * 1024) {
        newErrors.p_image = 'Image size must be less than 5MB';
      }
      // Check file size (min 1KB)
      else if (file.size < 1024) {
        newErrors.p_image = 'Image size must be at least 1KB';
      }
      // Check image dimensions (basic check)
      else {
        delete newErrors.p_image;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Overall form validation
  const validateForm = () => {
    const fieldsToValidate = ['p_name', 'p_description', 'p_price', 'p_quantity', 'p_catogory'];
    let isValid = true;
    
    fieldsToValidate.forEach(field => {
      if (!validateField(field, inputs[field])) {
        isValid = false;
      }
    });
    
    if (!validateFile(file)) {
      isValid = false;
    }
    
    return isValid;
  };

  // text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Real-time validation
    validateField(name, value);
  };

  // handle file select
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    
    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile));
      // Validate file
      validateFile(selectedFile);
    } else {
      setPreview(null);
      setErrors(prev => ({
        ...prev,
        p_image: 'Product image is required'
      }));
    }
  };

  // submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      alert("❌ Please fix all validation errors before submitting");
      return;
    }
    
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("p_name", inputs.p_name.trim());
    formData.append("p_description", inputs.p_description.trim());
    formData.append("p_price", parseFloat(inputs.p_price).toFixed(2));
    formData.append("p_quantity", parseInt(inputs.p_quantity));
    formData.append("p_catogory", inputs.p_catogory);
    if (file) {
      formData.append("p_image", file);
    }

    try {
      await axios.post("http://localhost:5000/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("✅ Product added successfully!");
      onBack(); // This will now refresh data and go back to products view
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || "Failed to add product";
      alert(`❌ ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="product-header">
        <h2>➕ Add New Product</h2>
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
          <label>Product Name *</label>
          <input
            type="text"
            name="p_name"
            value={inputs.p_name}
            onChange={handleChange}
            placeholder="Enter product name (2-100 characters)"
            className={errors.p_name ? 'error' : ''}
            required
          />
          {errors.p_name && <span className="error-message">{errors.p_name}</span>}

          {/* Description */}
          <label>Description *</label>
          <textarea
            name="p_description"
            value={inputs.p_description}
            onChange={handleChange}
            rows="3"
            placeholder="Enter detailed product description (10-2500 characters)"
            className={errors.p_description ? 'error' : ''}
            required
          />
          <div className="char-count">
            {inputs.p_description.length}/2500 characters
          </div>
          {errors.p_description && <span className="error-message">{errors.p_description}</span>}

          {/* Category */}
          <label>Category *</label>
          <select
            name="p_catogory"
            value={inputs.p_catogory}
            onChange={handleChange}
            className={errors.p_catogory ? 'error' : ''}
            required
          >
            <option value="">Select Category</option>
            <option value="Herbal Supplement">Herbal Supplement</option>
            <option value="Ayurvedic Oil">Ayurvedic Oil</option>
            <option value="Skin Care">Skin Care</option>
            <option value="Hair Care">Hair Care</option>
            <option value="Wellness Products">Wellness Products</option>
            <option value="Essential Oils">Essential Oils</option>
            <option value="Tea & Beverages">Tea & Beverages</option>
            <option value="Other">Other</option>
          </select>
          {errors.p_catogory && <span className="error-message">{errors.p_catogory}</span>}

          {/* Price */}
          <label>Price ($) *</label>
          <input
            type="number"
            name="p_price"
            value={inputs.p_price}
            onChange={handleChange}
            placeholder="0.00"
            min="0.01"
            max="10000"
            step="0.01"
            className={errors.p_price ? 'error' : ''}
            required
          />
          {errors.p_price && <span className="error-message">{errors.p_price}</span>}

          {/* Stock */}
          <label>Stock Quantity *</label>
          <input
            type="number"
            name="p_quantity"
            value={inputs.p_quantity}
            onChange={handleChange}
            placeholder="0"
            min="0"
            max="10000"
            step="1"
            className={errors.p_quantity ? 'error' : ''}
            required
          />
          {errors.p_quantity && <span className="error-message">{errors.p_quantity}</span>}

          {/* Image */}
          <label>Product Image *</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange}
            className={errors.p_image ? 'error' : ''}
            required
          />
          <div className="file-info">
            <small>Supported formats: JPG, PNG, GIF, WebP | Max size: 5MB</small>
          </div>
          {errors.p_image && <span className="error-message">{errors.p_image}</span>}
          {preview && (
            <div className="image-preview">
              <img
                src={preview}
                alt="Preview"
                style={{ width: "150px", marginTop: "10px", borderRadius: "8px" }}
              />
              <button 
                type="button" 
                className="remove-image-btn"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  setErrors(prev => ({
                    ...prev,
                    p_image: 'Product image is required'
                  }));
                }}
              >
                Remove Image
              </button>
            </div>
          )}

          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting || Object.keys(errors).length > 0}
          >
            {isSubmitting ? 'Saving...' : 'Save Product'}
          </button>
          
          {Object.keys(errors).length > 0 && (
            <div className="validation-summary">
              <h4>Please fix the following errors:</h4>
              <ul>
                {Object.values(errors).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default AdminAddProduct;
