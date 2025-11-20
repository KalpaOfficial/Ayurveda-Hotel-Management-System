import React, { useEffect, useState } from 'react';
import Nav from "../Nav/Nav";
import Footer from "../Footer/Footer";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

function Notifications() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [list, setList] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      if (!user || !(user._id || user.id)) {
        setList([]);
        setLoading(false);
        return;
      }
      const uid = user._id || user.id;
      const res = await fetch(`${API_BASE}/notifications/user/${uid}`);
      if (!res.ok) throw new Error('Failed to load notifications');
      const data = await res.json();
      setList(data.notifications || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const markAllRead = async () => {
    try {
      const unread = list.filter(n => !n.read);
      const uid = user && (user._id || user.id);
      await Promise.all(unread.map(n => fetch(`${API_BASE}/notifications/${n._id}/read`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: uid }) })));
      await load();
      try { window.dispatchEvent(new Event('notificationsUpdated')); } catch {}
    } catch (e) { setError('Failed to mark all as read'); }
  };

  return (
    <div className="inquiries-bg">
      <Nav />
      <div className="inquiries-container">
        <div className="inquiries-header">
          <div className="header-content">
            <h1 className="page-title">Notifications</h1>
            <p className="page-subtitle">Your latest updates and alerts</p>
          </div>
        </div>

        {error && <div className="error-text">{error}</div>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <button className="btn btn-secondary" onClick={markAllRead} disabled={list.every(n => n.read)}>
            Mark all as read
          </button>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading notifications...</p>
          </div>
        ) : list.length === 0 ? (
          <div className="empty-state">
            <h3>No notifications</h3>
          </div>
        ) : (
          <div className="data-section">
            <div className="table-container">
              <table className="inquiries-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Title</th>
                    <th>Message</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map(n => (
                    <tr key={n._id}>
                      <td>{n.read ? 'Read' : 'Unread'}</td>
                      <td>{n.title}</td>
                      <td>{n.message}</td>
                      <td>{new Date(n.createdAt).toLocaleString()}</td>
                      <td>
                        {!n.read ? (
                          <button className="btn btn-small" onClick={async () => {
                            const uid = user && (user._id || user.id);
                            await fetch(`${API_BASE}/notifications/${n._id}/read`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: uid }) });
                            await load();
                            try { window.dispatchEvent(new Event('notificationsUpdated')); } catch {}
                          }}>Mark as read</button>
                        ) : (
                          <span style={{ color: '#888' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default Notifications;


