import React, { useState } from 'react';
import { register } from '../api/api';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [name,setName] = useState('');
  const [error,setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await register(email,password,name);
      navigate('/');
    } catch(err){
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="container mt-5" style={{maxWidth:400}}>
      <h3>Register</h3>
      <input className="form-control mb-2" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
      <input className="form-control mb-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="form-control mb-2" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
      {error && <div className="text-danger mb-2">{error}</div>}
      <button className="btn btn-success w-100" onClick={handleRegister}>Register</button>
    </div>
  );
}
