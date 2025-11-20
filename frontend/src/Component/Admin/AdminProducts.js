import React, { useState, useEffect } from "react";
import axios from "axios";
import Product from "../View Products/Product";
import "./AdminProducts.css";
import { FaEdit, FaTrash, FaUser, FaUserShield, FaSearch } from "react-icons/fa";
const URL = "http://localhost:5000/products";

const fetchHandler = async () => {
  return await axios.get(URL).then((res) => res.data);
};

function AdminProducts({ onAddProduct, onEditProduct }) {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showReport, setShowReport] = useState(false);

  // Export filtered products to a themed, well-organized PDF using print styles
  const exportProductsPdf = () => {
    const totalProducts = filteredProducts.length;
    const totalStock = filteredProducts.reduce((s, p) => s + (p.p_quantity || 0), 0);
    const totalValue = filteredProducts.reduce((s, p) => s + ((p.p_price || 0) * (p.p_quantity || 0)), 0);
    const avgPrice = totalProducts > 0 ? filteredProducts.reduce((s, p) => s + (p.p_price || 0), 0) / totalProducts : 0;
    const outOfStock = filteredProducts.filter((p) => (p.p_quantity || 0) <= 0);
    const lowStock = filteredProducts.filter((p) => (p.p_quantity || 0) < 10 && (p.p_quantity || 0) > 0);
    const highValue = filteredProducts.filter((p) => (p.p_price || 0) > avgPrice * 1.5);
    const categoryStats = filteredProducts.reduce((acc, p) => {
      const cat = p.p_catogory || 'Uncategorized';
      if (!acc[cat]) acc[cat] = { count: 0, totalValue: 0, totalStock: 0 };
      acc[cat].count += 1;
      acc[cat].totalValue += (p.p_price || 0) * (p.p_quantity || 0);
      acc[cat].totalStock += (p.p_quantity || 0);
      return acc;
    }, {});

    const rowsHtml = filteredProducts.map((p, idx) => {
      const imgSrc = p.p_image ? `http://localhost:5000${p.p_image}` : "";
      return `
        <tr>
          <td>${idx + 1}</td>
          <td>${imgSrc ? `<img class=\"thumb\" src=\"${imgSrc}\" />` : ''}</td>
          <td>${(p.p_name || "").replace(/</g, "&lt;")}</td>
          <td>${(p.p_catogory || "").replace(/</g, "&lt;")}</td>
          <td class=\"right\">${(p.p_price ?? 0).toFixed(2)}</td>
          <td class=\"right\">${p.p_quantity ?? 0}</td>
          <td class=\"right\">${(((p.p_price ?? 0) * (p.p_quantity ?? 0))).toFixed(2)}</td>
          <td>${(p.p_description || "").replace(/</g, "&lt;")}</td>
        </tr>`;
    }).join("");

    const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Products Report</title>
  <style>
    @media print {
      @page { size: A4 landscape; margin: 16mm; }
    }
    body { font-family: Arial, Helvetica, sans-serif; color: #1f2937; }
    .header {
      background: linear-gradient(135deg, #17a2b8, #28a745);
      color: #ffffff; padding: 16px 20px; border-radius: 12px; margin-bottom: 16px;
      box-shadow: 0 6px 20px rgba(23,162,184,0.25);
    }
    .title { margin: 0; font-size: 22px; letter-spacing: 0.3px; }
    .subtitle { margin: 6px 0 0 0; opacity: 0.9; font-size: 12px; }
    .stats {
      display: flex; gap: 12px; margin: 16px 0 20px 0; flex-wrap: wrap;
    }
    .card {
      flex: 1 1 200px; background: #ffffff; border-radius: 10px; padding: 12px 14px;
      border: 1px solid #e5e7eb; box-shadow: 0 4px 14px rgba(0,0,0,0.06);
    }
    .card h4 { margin: 0 0 4px 0; font-size: 12px; color: #6b7280; font-weight: 600; }
    .card p { margin: 0; font-size: 18px; font-weight: 700; color: #111827; }
    table { width: 100%; border-collapse: collapse; }
    thead th {
      text-align: left; padding: 10px; font-size: 12px; text-transform: uppercase;
      letter-spacing: 0.5px; color: #ffffff; background: #17a2b8; position: sticky; top: 0;
    }
    tbody td { padding: 10px; font-size: 12px; vertical-align: top; }
    tbody tr:nth-child(odd) { background: #f8fafc; }
    tbody tr:nth-child(even) { background: #ffffff; }
    tfoot td { padding: 10px; font-weight: 700; background: #e8f6f9; }
    .right { text-align: right; }
    .footer { margin-top: 14px; font-size: 11px; color: #6b7280; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; background: #28a745; color: #fff; font-size: 11px; }
    .thumb { width: 48px; height: 48px; object-fit: cover; border-radius: 8px; border: 1px solid #e5e7eb; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
    .item-card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
    .item-card h5 { margin: 8px 0 6px 0; font-size: 13px; color: #111827; }
    .item-meta { display: flex; align-items: center; gap: 10px; }
    .kv { font-size: 12px; color: #374151; }
    .low { color: #dc3545; }
    .high { color: #28a745; }
    .page-break { page-break-before: always; break-before: page; }
    .section-header { background: #17a2b8; color: #fff; padding: 12px 14px; border-radius: 10px; margin: 16px 0 12px 0; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
    .section-header h2 { margin: 0; font-size: 18px; }
    .section-header p { margin: 4px 0 0 0; font-size: 12px; opacity: 0.95; }
  </style>
  </head>
  <body>
    <div class="header">
      <h1 class="title">Sath Villa Ayurvedic — Products Report</h1>
      <p class="subtitle">Generated on ${new Date().toLocaleString()}</p>
    </div>

    <div class="stats">
      <div class="card"><h4>Total Products</h4><p>${totalProducts}</p></div>
      <div class="card"><h4>Total Stock Units</h4><p>${totalStock}</p></div>
      <div class="card"><h4>Total Inventory Value (USD)</h4><p>${totalValue.toFixed(2)}</p></div>
      <div class="card"><h4>View Scope</h4><p><span class="badge">Filtered List</span></p></div>
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Photo</th>
          <th>Name</th>
          <th>Category</th>
          <th class="right">Price (USD)</th>
          <th class="right">Stock</th>
          <th class="right">Total Value (USD)</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="4">Totals</td>
          <td class="right"></td>
          <td class="right">${totalStock}</td>
          <td class="right">${totalValue.toFixed(2)}</td>
          <td></td>
        </tr>
      </tfoot>
    </table>

    ${outOfStock.length ? `
    <div class="section-header page-break" style="background:linear-gradient(135deg,#dc3545,#e53e3e);">
      <h2>🚫 Out of Stock (${outOfStock.length} products)</h2>
      <p>Products with zero or negative stock</p>
    </div>
    <div class="grid">
      ${outOfStock.map(p => {
        const imgSrc = p.p_image ? `http://localhost:5000${p.p_image}` : "";
        return `
        <div class=\"item-card\">
          <div class=\"item-meta\">
            ${imgSrc ? `<img class=\"thumb\" src=\"${imgSrc}\" />` : ''}
            <div>
              <h5>${(p.p_name || '').replace(/</g,'&lt;')}</h5>
              <div class=\"kv low\">Stock: ${p.p_quantity ?? 0} units</div>
              <div class=\"kv\">Price: $${(p.p_price ?? 0).toFixed(2)}</div>
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>` : ''}

    ${lowStock.length ? `
    <div class="section-header page-break" style="background:linear-gradient(135deg,#d2691e,#f59e0b);">
      <h2>⚠️ Low Stock Alert (${lowStock.length} products)</h2>
      <p>Products with stock less than 10 units (but greater than 0)</p>
    </div>
    <div class="grid">
      ${lowStock.map(p => {
        const imgSrc = p.p_image ? `http://localhost:5000${p.p_image}` : "";
        return `
        <div class=\"item-card\">
          <div class=\"item-meta\">
            ${imgSrc ? `<img class=\"thumb\" src=\"${imgSrc}\" />` : ''}
            <div>
              <h5>${(p.p_name || '').replace(/</g,'&lt;')}</h5>
              <div class=\"kv low\">Stock: ${p.p_quantity ?? 0} units</div>
              <div class=\"kv\">Price: $${(p.p_price ?? 0).toFixed(2)}</div>
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>` : ''}

    ${highValue.length ? `
    <div class="section-header page-break" style="background:linear-gradient(135deg,#007bff,#0056b3);">
      <h2>💎 High Value Products (${highValue.length} products)</h2>
      <p>Products priced above 1.5× the average</p>
    </div>
    <div class="grid">
      ${highValue.map(p => {
        const imgSrc = p.p_image ? `http://localhost:5000${p.p_image}` : "";
        return `
        <div class=\"item-card\">
          <div class=\"item-meta\">
            ${imgSrc ? `<img class=\"thumb\" src=\"${imgSrc}\" />` : ''}
            <div>
              <h5>${(p.p_name || '').replace(/</g,'&lt;')}</h5>
              <div class=\"kv\" style="color: #007bff;">Price: $${(p.p_price ?? 0).toFixed(2)}</div>
              <div class=\"kv\">Stock: ${p.p_quantity ?? 0} units</div>
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>` : ''}

    ${Object.keys(categoryStats).length ? `
    <div class="section-header page-break" style="background:linear-gradient(135deg,#17a2b8,#2dd4bf);">
      <h2>Category Breakdown</h2>
      <p>Summary by category of filtered products</p>
    </div>
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th class="right">Count</th>
          <th class="right">Total Stock</th>
          <th class="right">Total Value (USD)</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(categoryStats).map(([cat, data]) => `
          <tr>
            <td>${cat.replace(/</g,'&lt;')}</td>
            <td class=\"right\">${data.count}</td>
            <td class=\"right\">${data.totalStock}</td>
            <td class=\"right\">${data.totalValue.toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    ` : ''}

    <div class="footer">© ${new Date().getFullYear()} Sath Villa Ayurvedic. Generated from Admin Product Management.</div>
  </body>
  </html>`;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    // Ensure styles are applied before print
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  useEffect(() => {
    fetchHandler().then((data) => {
      setProducts(data.products);
      setFilteredProducts(data.products);
    });
  }, []);

  // Filter products based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((product) => {
        const searchLower = searchTerm.toLowerCase();
        const name = (product.p_name || "").toLowerCase();
        const description = (product.p_description || "").toLowerCase();
        const category = (product.p_catogory || "").toLowerCase();
        
        return name.includes(searchLower) ||
               description.includes(searchLower) ||
               category.includes(searchLower);
      });
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  // Calculate product statistics for report
  const calculateReportStats = () => {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, product) => sum + (product.p_price * product.p_quantity), 0);
    const totalStock = products.reduce((sum, product) => sum + product.p_quantity, 0);
    const averagePrice = totalProducts > 0 ? products.reduce((sum, product) => sum + product.p_price, 0) / totalProducts : 0;
    
    // Category breakdown
    const categoryStats = products.reduce((acc, product) => {
      const category = product.p_catogory || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = { count: 0, totalValue: 0, totalStock: 0 };
      }
      acc[category].count += 1;
      acc[category].totalValue += product.p_price * product.p_quantity;
      acc[category].totalStock += product.p_quantity;
      return acc;
    }, {});

    // Low stock products (less than 10)
    const lowStockProducts = products.filter(product => product.p_quantity < 10 && product.p_quantity > 0);

    // Out of stock products (0 or below)
    const outOfStockProducts = products.filter(product => (product.p_quantity || 0) <= 0);

    // High value products (price > average * 1.5)
    const highValueProducts = products.filter(product => product.p_price > averagePrice * 1.5);

    return {
      totalProducts,
      totalValue,
      totalStock,
      averagePrice,
      categoryStats,
      lowStockProducts,
      outOfStockProducts,
      highValueProducts
    };
  };

  // Export report to CSV
  const exportReport = () => {
    const stats = calculateReportStats();
    const csvContent = [
      ['Product Report', ''],
      ['Generated on', new Date().toLocaleDateString()],
      [''],
      ['SUMMARY STATISTICS', ''],
      ['Total Products', stats.totalProducts],
      ['Total Inventory Value', `$${stats.totalValue.toFixed(2)}`],
      ['Total Stock Units', stats.totalStock],
      ['Average Price', `$${stats.averagePrice.toFixed(2)}`],
      [''],
      ['CATEGORY BREAKDOWN', ''],
      ['Category', 'Count', 'Total Value', 'Total Stock'],
      ...Object.entries(stats.categoryStats).map(([category, data]) => [
        category, data.count, `$${data.totalValue.toFixed(2)}`, data.totalStock
      ]),
      [''],
      ['LOW STOCK PRODUCTS (< 10 units, > 0)', ''],
      ['Product Name', 'Current Stock', 'Price'],
      ...stats.lowStockProducts.map(product => [
        product.p_name, product.p_quantity, `$${product.p_price.toFixed(2)}`
      ]),
      [''],
      ['OUT OF STOCK PRODUCTS (0 units)', ''],
      ['Product Name', 'Current Stock', 'Price'],
      ...stats.outOfStockProducts.map(product => [
        product.p_name, product.p_quantity, `$${product.p_price.toFixed(2)}`
      ]),
      [''],
      ['HIGH VALUE PRODUCTS', ''],
      ['Product Name', 'Price', 'Stock'],
      ...stats.highValueProducts.map(product => [
        product.p_name, `$${product.p_price.toFixed(2)}`, product.p_quantity
      ])
    ];

    const csvString = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `product-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // handle product delete with API call
  const handleDelete = async (productId) => {
    // Show confirmation dialog
    const confirmed = window.confirm("Are you sure you want to delete this product? This action cannot be undone.");
    
    if (!confirmed) {
      return;
    }

    try {
      // Make API call to delete product from backend
      await axios.delete(`${URL}/${productId}`);
      
      // Remove from local state only after successful API call
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      setFilteredProducts((prev) => prev.filter((p) => p._id !== productId));
      
      // Show success message
      alert("Product deleted successfully!");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product. Please try again.");
    }
  };

  return (
    <div>
      <div className="product-header">
        <h2>📦 Product Management</h2>
        <div className="action-buttons-container">
          <button 
            className="btn-add"
            onClick={onAddProduct}
          >
            ➕ Add Product
          </button>
          <button 
            className="btn-report"
            onClick={() => setShowReport(!showReport)}
            style={{
              backgroundColor: showReport ? '#28a745' : '#17a2b8',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            📊 {showReport ? 'Hide Report' : 'Show Report'}
          </button>
          <button 
            className="btn-export"
            onClick={exportProductsPdf}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginLeft: '8px'
            }}
          >
            🧾 Export Products PDF
          </button>
          {showReport && (
            <button 
              className="btn-export"
              onClick={exportReport}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              📥 Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search products by name, description, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Product Report Section */}
      {showReport && (
        <div className="analytics-report">
          <h3 className="analytics-title">📊 Product Analytics Report</h3>
          
          {(() => {
            const stats = calculateReportStats();
            return (
              <div>
                {/* Summary Statistics */}
                <div className="stats-grid">
                  <div className="stat-card">
                    <h4 className="stat-title">Total Products</h4>
                    <p className="stat-value">{stats.totalProducts}</p>
                  </div>
                  <div className="stat-card">
                    <h4 className="stat-title">Total Value</h4>
                    <p className="stat-value">${stats.totalValue.toFixed(2)}</p>
                  </div>
                  <div className="stat-card">
                    <h4 className="stat-title">Total Stock</h4>
                    <p className="stat-value">{stats.totalStock}</p>
                  </div>
                  <div className="stat-card">
                    <h4 className="stat-title">Average Price</h4>
                    <p className="stat-value">${stats.averagePrice.toFixed(2)}</p>
                  </div>
                </div>

                {/* Category Breakdown */}
                <div className="category-breakdown">
                  <h4 className="category-title">📋 Category Breakdown</h4>
                  <div className="category-table-container">
                    <table className="category-table">
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Count</th>
                          <th>Total Value</th>
                          <th>Stock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(stats.categoryStats).map(([category, data]) => (
                          <tr key={category}>
                            <td>{category}</td>
                            <td>{data.count}</td>
                            <td>${data.totalValue.toFixed(2)}</td>
                            <td>{data.totalStock}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Out of Stock Alert */}
                {stats.outOfStockProducts.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ color: '#dc3545', marginBottom: '10px' }}>🚫 Out of Stock ({stats.outOfStockProducts.length} products)</h4>
                    <div style={{ backgroundColor: '#fff5f5', padding: '15px', borderRadius: '6px', border: '1px solid #fed7d7' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
                        {stats.outOfStockProducts.map(product => (
                          <div key={product._id} style={{ backgroundColor: 'white', padding: '10px', borderRadius: '4px', border: '1px solid #feb2b2' }}>
                            <strong>{product.p_name}</strong><br/>
                            <span style={{ color: '#dc3545' }}>Stock: {product.p_quantity} units</span><br/>
                            <span style={{ color: '#6c757d' }}>Price: ${product.p_price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Low Stock Alert */}
                {stats.lowStockProducts.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ color: '#d2691e', marginBottom: '10px' }}>⚠️ Low Stock Alert ({stats.lowStockProducts.length} products)</h4>
                    <div style={{ backgroundColor: '#fff8f0', padding: '15px', borderRadius: '6px', border: '1px solid #f4d1a7' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
                        {stats.lowStockProducts.map(product => (
                          <div key={product._id} style={{ backgroundColor: 'white', padding: '10px', borderRadius: '4px', border: '1px solid #e6b17a' }}>
                            <strong>{product.p_name}</strong><br/>
                            <span style={{ color: '#d2691e' }}>Stock: {product.p_quantity} units</span><br/>
                            <span style={{ color: '#6c757d' }}>Price: ${product.p_price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* High Value Products */}
                {stats.highValueProducts.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ color: '#007bff', marginBottom: '10px' }}>💎 High Value Products ({stats.highValueProducts.length} products)</h4>
                    <div style={{ backgroundColor: '#f0f8ff', padding: '15px', borderRadius: '6px', border: '1px solid #b3d9ff' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
                        {stats.highValueProducts.map(product => (
                          <div key={product._id} style={{ backgroundColor: 'white', padding: '10px', borderRadius: '4px', border: '1px solid #80c7ff' }}>
                            <strong>{product.p_name}</strong><br/>
                            <span style={{ color: '#007bff' }}>Price: ${product.p_price.toFixed(2)}</span><br/>
                            <span style={{ color: '#6c757d' }}>Stock: {product.p_quantity} units</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      <table className="admin-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Product Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Description</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts && filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <tr key={product._id}>
                <td>
                  {product.p_image ? (
                    <img
                      src={`http://localhost:5000${product.p_image}`}
                      alt={product.p_name}
                      className="table-img"
                    />
                  ) : (
                    "No Image"
                  )}
                </td>
                <td>{product.p_name}</td>
                
                <td>${product.p_price.toFixed(2)}</td>
                <td>{product.p_quantity}</td>
                <td>
                  <div style={{ maxWidth: 300, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {product.p_description || '—'}
                  </div>
                </td>
                <td>{product.p_catogory}</td>
                <td className="action-buttonsud">
                  <button
                    onClick={() => onEditProduct(product._id)}
                    className="btn-edit"
                  >
                    <FaEdit />Edit Product
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="btn-delete"
                  >
                    <FaTrash />Delete Product
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                {searchTerm.trim() ? `No products found matching "${searchTerm}"` : "No products available"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AdminProducts;
