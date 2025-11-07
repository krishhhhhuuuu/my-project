import React, { createContext, useState, useEffect } from 'react';
import { fetchProfile } from '../api/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  // ✅ Load user profile whenever token changes
  useEffect(() => {
    if (token) {
      fetchProfile(token)
        .then(res => {
          if (res.ok && res.user) setUser(res.user);
          else setUser(null);
        })
        .catch(() => setUser(null));
    }
  }, [token]);

  // ✅ Login function: called after successful backend login
  const loginUser = (email, password) => {
    return fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.ok && data.token) {
          localStorage.setItem('token', data.token); // ✅ store JWT
          setToken(data.token);
          return true;
        } else {
          alert(data.error || 'Login failed.');
          return false;
        }
      })
      .catch(() => {
        alert('Network error during login');
        return false;
      });
  };

  // ✅ Logout: clears everything
  const logoutUser = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};
