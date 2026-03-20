import React, { useState } from 'react';
import { Shield, Mail, Lock, AlertTriangle, ArrowRight } from 'lucide-react';
import type { Page } from '../types';
import { API_ENDPOINTS } from '../api';

interface LoginPageProps {
  navigate: (page: Page) => void;
  onLogin: (token: string, user: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ navigate, onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ phone: '', password: '', name: '', platform: 'zomato', workerId: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isRegister ? API_ENDPOINTS.REGISTER : API_ENDPOINTS.LOGIN;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Authentication failed');

      onLogin(data.token, data.user);
      if (data.user.role === 'admin') {
        navigate('admin');
      } else {
        navigate('dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '0 20px' }}>
      <div className="hero-glow hero-glow-1" style={{ width: 400, height: 400, top: '10%', left: '10%' }} />
      <div className="hero-glow hero-glow-2" style={{ width: 400, height: 400, bottom: '10%', right: '10%' }} />
      
      <div className="glass-card animate-in" style={{ width: '100%', maxWidth: 460, padding: 40, position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: 'var(--shadow-glow-orange)' }}>
            <Shield size={28} color="white" />
          </div>
          <h1 className="section-title" style={{ fontSize: 28, marginBottom: 8 }}>
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
            {isRegister ? 'Protect your income from weather & disruptions.' : 'Sign in to monitor your active coverage.'}
          </p>
        </div>

        {error && (
          <div className="alert-box alert-red" style={{ marginBottom: 24, padding: '12px 16px' }}>
            <AlertTriangle size={18} color="var(--brand-red)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 14, color: 'var(--brand-red)' }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {isRegister && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" required placeholder="Ramesh Kumar" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Delivery Platform</label>
                <select className="form-select" required value={form.platform} onChange={e => setForm({...form, platform: e.target.value})}>
                  <option value="zomato">🍕 Zomato</option>
                  <option value="swiggy">🛵 Swiggy</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Worker ID (e.g., ZM-12345)</label>
                <input className="form-input" required placeholder="ZM-88291" value={form.workerId} onChange={e => setForm({...form, workerId: e.target.value})} />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input className="form-input" required type="tel" placeholder="9876543210" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" required type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
            {loading ? <span className="pulse-dot" style={{ background: 'white' }} /> : (isRegister ? 'Sign Up' : 'Log In')} 
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <button 
            onClick={() => { setIsRegister(!isRegister); setError(''); }} 
            style={{ background: 'none', border: 'none', color: 'var(--brand-orange)', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            {isRegister ? 'Log In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
