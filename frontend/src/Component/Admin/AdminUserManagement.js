import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaUser, FaUserShield, FaSearch } from "react-icons/fa";
import AdminUpdateUser from "./AdminUpdateUser";
import "./AdminUserManagement.css";

function AdminUserManagement({ onBack }) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editingUserId, setEditingUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/users");
      setUsers(response.data.users);
      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = useCallback(() => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      try {
        await axios.delete(`http://localhost:5000/users/${userId}`);
        setUsers(users.filter((user) => user._id !== userId));
        alert("✅ User deleted successfully!");
      } catch (err) {
        console.error("Error deleting user:", err);
        alert("❌ Failed to delete user");
      }
    }
  };

  const handleEditUser = (userId) => {
    setEditingUserId(userId);
  };

  const handleBackToUsers = () => {
    setEditingUserId(null);
    fetchUsers(); // Refresh the user list
  };

  const handleUpdateUser = (updatedUser) => {
    setUsers(users.map((user) => (user._id === updatedUser._id ? updatedUser : user)));
    setEditingUserId(null);
  };

  const getRoleIcon = (role) => {
    return role === "admin" ? <FaUserShield /> : <FaUser />;
  };

  const getRoleBadge = (role) => {
    return (
      <span className={`role-badge ${role}`}>
        {getRoleIcon(role)}
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  if (editingUserId) {
    return <AdminUpdateUser userId={editingUserId} onBack={handleBackToUsers} onUpdate={handleUpdateUser} />;
  }

  if (loading) {
    return (
      <div className="user-management-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management-container">
      <div className="user-management-header">
        <h2>👥 User Management</h2>
        <button className="btn-back" onClick={onBack}>
          ← Back to Dashboard
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
          <button onClick={fetchUsers} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      <div className="user-management-controls">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-container">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="role-filter"
          >
            <option value="all">All Roles</option>
            <option value="user">Users</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        <div className="user-stats">
          <span className="stat-item">
            Total: <strong>{users.length}</strong>
          </span>
          <span className="stat-item">
            Users: <strong>{users.filter(u => u.role === 'user').length}</strong>
          </span>
          <span className="stat-item">
            Admins: <strong>{users.filter(u => u.role === 'admin').length}</strong>
          </span>
        </div>
      </div>

      <div className="users-table-container">
        {filteredUsers.length === 0 ? (
          <div className="no-users">
            <FaUser className="no-users-icon" />
            <p>No users found matching your criteria</p>
          </div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Profile</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Country</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className="user-row">
                  <td className="profile-cell">
                    {user.profilePicture ? (
                      <img
                        src={`http://localhost:5000${user.profilePicture}`}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="user-avatar"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/40";
                        }}
                      />
                    ) : (
                      <div className="user-avatar-placeholder">
                        {user.firstName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td className="name-cell">
                    <div className="user-name">
                      <strong>{user.firstName} {user.lastName}</strong>
                      <span className="user-gender">{user.gender}</span>
                    </div>
                  </td>
                  <td className="email-cell">{user.email}</td>
                  <td className="phone-cell">{user.phone}</td>
                  <td className="role-cell">{getRoleBadge(user.role)}</td>
                  <td className="country-cell">{user.country}</td>
                  <td className="actions-cell">
                    <button
                      className="btn-edit"
                      onClick={() => handleEditUser(user._id)}
                      title="Edit User"
                    >
                      <FaEdit /> Update User
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteUser(user._id, `${user.firstName} ${user.lastName}`)}
                      title="Delete User"
                    >
                      <FaTrash />Delete User
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminUserManagement;
