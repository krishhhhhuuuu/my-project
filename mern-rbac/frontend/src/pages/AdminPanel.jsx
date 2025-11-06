import React, { useEffect, useState, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../auth/AuthProvider';
import '../App.css';

export default function AdminPanel() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Viewer' });

  async function loadUsers() {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await api.get('/users', { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data);
    } catch (err) {
      alert('Failed to load users');
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function addUser(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      await api.post('/users', form, { headers: { Authorization: `Bearer ${token}` } });
      alert('✅ User added successfully!');
      setForm({ name: '', email: '', password: '', role: 'Viewer' });
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add user');
    }
  }

  async function deleteUser(id) {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('accessToken');
      await api.delete(`/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      alert('🗑️ User deleted successfully');
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed');
    }
  }

  return (
    <div className="container">
      <h2 style={{ color: '#1e3a8a' }}>Admin Panel — Manage Users</h2>

      {/* 🔹 Add New User Form */}
      <form onSubmit={addUser} className="card" style={{ marginBottom: 20 }}>
        <h3>Add New User</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="Admin">Admin</option>
            <option value="Editor">Editor</option>
            <option value="Viewer">Viewer</option>
          </select>
        </div>
        <button type="submit" style={{ marginTop: 12 }}>Add User</button>
      </form>

      {/* 🔹 User List Table */}
      <div className="card">
        <h3>All Users</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#e2e8f0' }}>
              <th style={{ padding: 8 }}>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th style={{ width: 120 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} style={{ borderTop: '1px solid #ddd' }}>
                <td style={{ padding: 8 }}>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  {u.email !== user.email ? (
                    <button
                      onClick={() => deleteUser(u._id)}
                      style={{ backgroundColor: '#ef4444', color: 'white' }}
                    >
                      Delete
                    </button>
                  ) : (
                    <span style={{ color: '#6b7280', fontStyle: 'italic' }}>You</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
