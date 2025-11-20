import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { FaExternalLinkAlt } from "react-icons/fa";
import AIChatWidget from '../AIChatWidget/AIChatWidget';
import './IncomeAnalysis.css';
import '../AIChatWidget/AIChatWidget.css';

const IncomeAnalysis = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('monthly'); // 'monthly', 'yearly', 'quarterly'
  const [adminUser, setAdminUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check admin authentication
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/admin-signin");
      return;
    }
    
    const user = JSON.parse(userData);
    if (user.role !== 'admin') {
      navigate("/admin-signin");
      return;
    }

    setAdminUser(user);
    loadPayments();
  }, [navigate]);

  const loadPayments = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5001/api/payments', {
        headers: {
          'Authorization': 'Bearer admin-secret-token',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch payments: ${response.status}`);
      }

      const data = await response.json();
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading payments:', err);
      setError('Failed to load payment data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Process data for different time periods
  const processedData = useMemo(() => {
    const paidPayments = payments.filter(p => p.status === 'Paid' && p.paymentDate);
    
    if (paidPayments.length === 0) {
      return {
        timeSeriesData: [],
        packageData: [],
        kpis: {
          totalRevenue: 0,
          totalTransactions: 0,
          averageTicket: 0,
          bestPeriod: null,
          growthRate: 0,
          totalCustomers: 0
        }
      };
    }

    // Group by time period
    const groupedData = new Map();
    const packageRevenue = new Map();
    const customerEmails = new Set();

    paidPayments.forEach(payment => {
      const date = new Date(payment.paymentDate);
      const amount = Number(payment.amount) || 0;
      customerEmails.add(payment.email);

      // Group by time period
      let periodKey;
      if (viewMode === 'yearly') {
        periodKey = date.getFullYear().toString();
      } else if (viewMode === 'quarterly') {
        const quarter = Math.ceil((date.getMonth() + 1) / 3);
        periodKey = `${date.getFullYear()}-Q${quarter}`;
      } else { // monthly
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        periodKey = `${year}-${month}`;
      }

      // Time series data
      if (!groupedData.has(periodKey)) {
        groupedData.set(periodKey, {
          period: periodKey,
          revenue: 0,
          transactions: 0
        });
      }
      const periodData = groupedData.get(periodKey);
      periodData.revenue += amount;
      periodData.transactions += 1;

      // Package revenue data
      const packageType = payment.packageType || 'Unknown';
      packageRevenue.set(packageType, (packageRevenue.get(packageType) || 0) + amount);
    });

    // Convert to arrays and sort
    const timeSeriesData = Array.from(groupedData.values())
      .sort((a, b) => a.period.localeCompare(b.period))
      .map(item => ({
        ...item,
        revenue: Number(item.revenue.toFixed(2))
      }));

    const packageData = Array.from(packageRevenue.entries())
      .map(([name, value]) => ({
        name,
        value: Number(value.toFixed(2))
      }))
      .sort((a, b) => b.value - a.value);

    // Calculate KPIs
    const totalRevenue = paidPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const totalTransactions = paidPayments.length;
    const averageTicket = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    const bestPeriod = timeSeriesData.reduce((best, current) => 
      current.revenue > (best?.revenue || 0) ? current : best, null);

    // Calculate growth rate (comparing last two periods)
    let growthRate = 0;
    if (timeSeriesData.length >= 2) {
      const latest = timeSeriesData[timeSeriesData.length - 1];
      const previous = timeSeriesData[timeSeriesData.length - 2];
      if (previous.revenue > 0) {
        growthRate = ((latest.revenue - previous.revenue) / previous.revenue) * 100;
      }
    }

    return {
      timeSeriesData,
      packageData,
      kpis: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalTransactions,
        averageTicket: Number(averageTicket.toFixed(2)),
        bestPeriod,
        growthRate: Number(growthRate.toFixed(1)),
        totalCustomers: customerEmails.size
      }
    };
  }, [payments, viewMode]);

  const COLORS = ['#27ae60', '#3498db', '#9b59b6', '#f39c12', '#e74c3c', '#1abc9c', '#34495e'];

  const handleGoToWebsite = () => {
    window.open("http://localhost:3000", "_blank");
  };

  if (loading) {
    return (
      <div className="admin-container">
        <main className="main-content">
          <header className="admin-header">
            <div className="header-left">
              <h1>🌿 Sath Villa Ayurvedic</h1>
              <span className="header-subtitle">Wellness Management System</span>
            </div>
            <div className="header-right">
              <button onClick={handleGoToWebsite} className="website-btn">
                <FaExternalLinkAlt /> Visit Website
              </button>
              <div className="admin-profile">
                {adminUser?.profilePicture ? (
                  <img
                    src={`http://localhost:5000${adminUser.profilePicture}`}
                    alt="Admin"
                    className="profile-img"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/40";
                    }}
                  />
                ) : (
                  <div className="admin-avatar">
                    {adminUser?.firstName ? adminUser.firstName.charAt(0).toUpperCase() : 'A'}
                  </div>
                )}
                <div className="profile-info">
                  <span className="profile-name">{adminUser?.firstName || 'Admin'} {adminUser?.lastName || ''}</span>
                  <span className="profile-role">Administrator</span>
                </div>
              </div>
            </div>
          </header>
          <div className="income-analysis-page">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading income analysis...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <main className="main-content">
        <header className="admin-header">
          <div className="header-left">
            <h1>🌿 Sath Villa Ayurvedic</h1>
            <span className="header-subtitle">Wellness Management System</span>
          </div>
          <div className="header-right">
            <button onClick={handleGoToWebsite} className="website-btn">
              <FaExternalLinkAlt /> Visit Website
            </button>
            <div className="admin-profile">
              {adminUser?.profilePicture ? (
                <img
                  src={`http://localhost:5000${adminUser.profilePicture}`}
                  alt="Admin"
                  className="profile-img"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/40";
                  }}
                />
              ) : (
                <div className="admin-avatar">
                  {adminUser?.firstName ? adminUser.firstName.charAt(0).toUpperCase() : 'A'}
                </div>
              )}
              <div className="profile-info">
                <span className="profile-name">{adminUser?.firstName || 'Admin'} {adminUser?.lastName || ''}</span>
                <span className="profile-role">Administrator</span>
              </div>
            </div>
          </div>
        </header>
        <div className="income-analysis-page">
        <div className="page-header">
          <h1 className="page-title">Income Analysis Dashboard</h1>
          <p className="page-subtitle">Comprehensive financial insights and revenue analytics</p>
          <div className="header-buttons">
            <button onClick={loadPayments} className="refresh-btn">
              🔄 Refresh Data
            </button>
            <button onClick={() => navigate('/admin/payment-management')} className="back-btn">
              ← Back to Payments
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {/* View Mode Selector */}
        <div className="view-selector">
          <div className="view-buttons">
            <button 
              className={`view-btn ${viewMode === 'monthly' ? 'active' : ''}`}
              onClick={() => setViewMode('monthly')}
            >
              Monthly View
            </button>
            <button 
              className={`view-btn ${viewMode === 'quarterly' ? 'active' : ''}`}
              onClick={() => setViewMode('quarterly')}
            >
              Quarterly View
            </button>
            <button 
              className={`view-btn ${viewMode === 'yearly' ? 'active' : ''}`}
              onClick={() => setViewMode('yearly')}
            >
              Yearly View
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="kpi-grid">
          <div className="kpi-card revenue">
            <div className="kpi-icon">💰</div>
            <div className="kpi-content">
              <h3>${processedData.kpis.totalRevenue.toLocaleString()}</h3>
              <p>Total Revenue</p>
            </div>
          </div>
          <div className="kpi-card transactions">
            <div className="kpi-icon">📊</div>
            <div className="kpi-content">
              <h3>{processedData.kpis.totalTransactions.toLocaleString()}</h3>
              <p>Total Transactions</p>
            </div>
          </div>
          <div className="kpi-card average">
            <div className="kpi-icon">💳</div>
            <div className="kpi-content">
              <h3>${processedData.kpis.averageTicket.toLocaleString()}</h3>
              <p>Average Ticket</p>
            </div>
          </div>
          <div className="kpi-card customers">
            <div className="kpi-icon">👥</div>
            <div className="kpi-content">
              <h3>{processedData.kpis.totalCustomers.toLocaleString()}</h3>
              <p>Unique Customers</p>
            </div>
          </div>
          <div className="kpi-card growth">
            <div className="kpi-icon">📈</div>
            <div className="kpi-content">
              <h3 className={processedData.kpis.growthRate >= 0 ? 'positive' : 'negative'}>
                {processedData.kpis.growthRate >= 0 ? '+' : ''}{processedData.kpis.growthRate}%
              </h3>
              <p>Growth Rate</p>
            </div>
          </div>
          <div className="kpi-card best-period">
            <div className="kpi-icon">🏆</div>
            <div className="kpi-content">
              <h3>{processedData.kpis.bestPeriod?.period || 'N/A'}</h3>
              <p>Best {viewMode.charAt(0).toUpperCase() + viewMode.slice(1, -2)}</p>
              {processedData.kpis.bestPeriod && (
                <small>${processedData.kpis.bestPeriod.revenue.toLocaleString()}</small>
              )}
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          {/* Revenue Trend Chart */}
          <div className="chart-container">
            <div className="chart-header">
              <h3>Revenue Trend ({viewMode.charAt(0).toUpperCase() + viewMode.slice(1)})</h3>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={processedData.timeSeriesData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#ecf0f1" />
                  <XAxis 
                    dataKey="period" 
                    stroke="#7f8c8d"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#7f8c8d"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value, name) => [
                      `$${Number(value).toLocaleString()}`,
                      name === 'revenue' ? 'Revenue' : name
                    ]}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="#27ae60" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Transaction Count Trend */}
          <div className="chart-container">
            <div className="chart-header">
              <h3>Transaction Count Trend</h3>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={processedData.timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ecf0f1" />
                  <XAxis 
                    dataKey="period" 
                    stroke="#7f8c8d"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#7f8c8d"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="transactions" 
                    stroke="#3498db" 
                    strokeWidth={3}
                    dot={{ fill: '#3498db', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Package Revenue Distribution */}
          {processedData.packageData.length > 0 && (
            <div className="chart-container">
              <div className="chart-header">
                <h3>Revenue by Package Type</h3>
              </div>
              <div className="chart-content">
                <ResponsiveContainer width="100%" height={450}>
                  <PieChart>
                    <Pie
                      data={processedData.packageData}
                      cx="50%"
                      cy="45%"
                      labelLine={false}
                      label={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {processedData.packageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={60}
                      formatter={(value, entry) => `${value} ($${Number(entry.payload.value).toLocaleString()})`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Data Table */}
        <div className="data-table-container">
          <div className="table-header">
            <h3>{viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} Revenue Summary</h3>
          </div>
          <div className="table-content">
            <table className="analysis-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Revenue</th>
                  <th>Transactions</th>
                  <th>Avg. Ticket</th>
                </tr>
              </thead>
              <tbody>
                {processedData.timeSeriesData.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="no-data">No data available</td>
                  </tr>
                ) : (
                  processedData.timeSeriesData.map((row, index) => (
                    <tr key={index}>
                      <td className="period-cell">{row.period}</td>
                      <td className="revenue-cell">${row.revenue.toLocaleString()}</td>
                      <td className="transactions-cell">{row.transactions}</td>
                      <td className="average-cell">
                        ${(row.revenue / row.transactions).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* AI Assistant Widget */}
      <AIChatWidget 
        monthlyData={processedData.timeSeriesData.map(item => ({
          month: item.period,
          total: item.revenue
        }))}
        position="bottom-right"
        defaultOpen={false}
      />
      </main>
    </div>
  );
};

export default IncomeAnalysis;