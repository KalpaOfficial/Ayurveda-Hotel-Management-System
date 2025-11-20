import React, { useState } from "react";
import Nav from "../Nav/Nav";
import { useNavigate } from "react-router";
import axios from "axios";
import "../Add Product/Add_Product.css";

function Add_Product() {
  const history = useNavigate();

  const [inputs, setInputs] = useState({
    p_name: "",
    p_description: "",
    p_price: "",
    p_quantity: "",
    p_catogory: "",
  });

  const [file, setFile] = useState(null); // store image file
  const [preview, setPreview] = useState(null); // preview image

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
    if (file) {
      formData.append("p_image", file);
    }

    try {
      await axios.post("http://localhost:5000/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("✅ Product added successfully!");
      history("/products"); // go to products page
    } catch (err) {
      console.error(err);
      alert("❌ Failed to add product");
    }
  };

  return (
    <div>
      <Nav />
      <div className="form-container">
        <h2 className="form-title">Add Ayurvedic Product</h2>
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
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {preview && (
            <img
              src={preview}
              alt="Preview"
              style={{ width: "150px", marginTop: "10px", borderRadius: "8px" }}
            />
          )}

          <button type="submit" className="submit-btn">
            Save Product
          </button>
        </form>
      </div>
    </div>
  );
}

export default Add_Product;
