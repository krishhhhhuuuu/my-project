import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthProvider';

export function PrivateRoute({ children }){
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

// PermissionGate - small helper
export function PermissionGate({ permission, children, fallback = null }){
  const { user } = useContext(AuthContext);
  const mapping = {
    Admin: { 'posts:create': true, 'posts:update': true, 'posts:delete': true, 'posts:read': true },
    Editor: { 'posts:create': true, 'posts:update': true, 'posts:read': true },
    Viewer: { 'posts:read': true }
  };
  const allowed = user?.role && mapping[user.role]?.[permission];
  if (allowed) return children;
  return fallback;
}
