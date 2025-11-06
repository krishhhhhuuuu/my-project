import React, { createContext, useEffect, useState } from 'react';
import api from '../api/axios';

export const AuthContext = createContext(null);

export function AuthProvider({ children }){
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    const token = localStorage.getItem('accessToken');
    if (!token){ setLoading(false); return };
    api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } }).then(res=>{
      setUser(res.data.user);
    }).catch(()=>{ localStorage.removeItem('accessToken'); }).finally(()=>setLoading(false));
  }, []);

  const login = (token, user) => { localStorage.setItem('accessToken', token); setUser(user); }
  const logout = () => { localStorage.removeItem('accessToken'); setUser(null); }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
}
