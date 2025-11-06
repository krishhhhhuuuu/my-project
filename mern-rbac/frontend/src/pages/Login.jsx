import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../auth/AuthProvider';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.accessToken, res.data.user);
      nav('/');
    } catch (err) {
      alert(err.response?.data?.error || 'Login failed');
    }
  }

  return (
    <div className="login-container">
      <form onSubmit={submit} className="login-card">
        <h2>Welcome Back</h2>
        <p style={{ color: '#666', marginBottom: 16 }}>Login to your account</p>

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />

        <button type="submit" style={{ marginTop: 12, width: '100%' }}>
          Login
        </button>

        <div style={{ marginTop: 20, fontSize: 13, color: '#666' }}>
          <b>Demo Users</b>:
          <ul>
            <li>Admin — admin@example.com / AdminPass123</li>
            <li>Editor — editor@example.com / EditorPass123</li>
            <li>Viewer — viewer@example.com / ViewerPass123</li>
          </ul>
        </div>
      </form>
    </div>
  );
}
