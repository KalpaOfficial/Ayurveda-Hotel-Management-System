import React, { useEffect, useState } from "react";
import axios from "axios";
import Nav from "../Nav/Nav";
import { useNavigate, useParams } from "react-router";

function Update_Product() {
  const [inputs, setInputs] = useState({});
  const [preview, setPreview] = useState(null); // preview for current/new image
  const [file, setFile] = useState(null); // hold uploaded file
  const history = useNavigate();
  const { id } = useParams();

  // get product data by id
  useEffect(() => {
    const fetchHandler = async () => {
      const res = await axios.get(`http://localhost:5000/products/${id}`);
      const data = res.data.product;
      setInputs(data);
      setPreview(data.p_image ? `http://localhost:5000${data.p_image}` : null);
    };
    fetchHandler();
  }, [id]);

  // handle text inputs
  const handleChange = (e) => {
    setInputs((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // handle file input
  const handleFileChange = (e) => {
    const img = e.target.files[0];
    if (img) {
      setFile(img);
      setPreview(URL.createObjectURL(img)); // show instant preview
    }
  };

  // update request
  const sendRequest = async () => {
    const formData = new FormData();
    formData.append("p_name", inputs.p_name);
    formData.append("p_description", inputs.p_description);
    formData.append("p_price", inputs.p_price);
    formData.append("p_quantity", inputs.p_quantity);
    formData.append("p_catogory", inputs.p_catogory);

    // only append image if new one selected
    if (file) {
      formData.append("p_image", file);
    }

    await axios.put(`http://localhost:5000/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  };

  // submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    sendRequest().then(() => {
      alert("✅ Product updated successfully!");
      history("/products");
    });
  };

  return (
    <div>
      <Nav />
      <div className="form-container">
        <h2 className="form-title">Update Ayurvedic Product</h2>
        <form onSubmit={handleSubmit} className="product-form">
          {/* Name */}
          <label>Product Name</label>
          <input
            type="text"
            name="p_name"
            value={inputs.p_name || ""}
            onChange={handleChange}
            required
          />

          {/* Description */}
          <label>Description</label>
          <textarea
            name="p_description"
            value={inputs.p_description || ""}
            onChange={handleChange}
            rows="3"
            required
          />

          {/* Category */}
          <label>Category</label>
          <select
            name="p_catogory"
            value={inputs.p_catogory || ""}
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
            value={inputs.p_price || ""}
            onChange={handleChange}
            required
          />

          {/* Stock */}
          <label>Stock</label>
          <input
            type="number"
            name="p_quantity"
            value={inputs.p_quantity || ""}
            onChange={handleChange}
            required
          />

          {/* Image */}
          <label>Product Image</label>
          {preview && (
            <div>
              <img
                src={preview}
                alt="preview"
                style={{
                  width: "150px",
                  marginBottom: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
          )}
          <input type="file" name="p_image" onChange={handleFileChange} />

          <button type="submit" className="submit-btn">
            Save Product
          </button>
        </form>
      </div>
    </div>
  );
}

export default Update_Product;
