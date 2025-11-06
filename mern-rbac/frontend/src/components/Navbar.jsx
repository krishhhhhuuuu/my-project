import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../auth/AuthProvider';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const nav = useNavigate();

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="nav-logo">RBAC App</Link>
        {user?.role === 'Admin' && <Link to="/admin" className="nav-link">Admin</Link>}
      </div>

      <div className="nav-right">
        {user ? (
          <>
            <span className="nav-user">{user.name} ({user.role})</span>
            <button className="logout-btn" onClick={() => { logout(); nav('/login'); }}>Logout</button>
          </>
        ) : (
          <Link to="/login" className="nav-link">Login</Link>
        )}
      </div>
    </nav>
  );
}
