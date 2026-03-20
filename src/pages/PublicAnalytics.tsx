import { useState, useEffect } from 'react';
import { Shield, Users, Zap, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { API_ENDPOINTS } from '../api';

const PublicAnalytics: React.FC = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // We'll fetch the public-facing version of stats
    // This endpoint does not require authentication
    fetch(API_ENDPOINTS.PUBLIC_STATS)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Failed to fetch public stats', err));
  }, []);

  return (
    <div className="page-wrapper" style={{ padding: '80px 0', background: 'var(--bg-dark)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="badge badge-green" style={{ marginBottom: 16 }}>
             <span className="pulse-dot" /> Live Platform Transparency
          </div>
          <h1 className="section-title">ShieldPay Ecosystem Stats</h1>
          <p className="section-subtitle" style={{ margin: '16px auto', textAlign: 'center' }}>
            Real-time data on how we are protecting India's gig economy.
          </p>
        </div>

        {stats ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {/* High Level Stats */}
            <div className="grid-4" style={{ gap: 20 }}>
              {[
                { label: 'Active Partners', value: stats.totalUsers, icon: <Users size={24} />, color: 'var(--brand-orange)' },
                { label: 'Claims Paid Out', value: '18,400+', icon: <CheckCircle size={24} />, color: 'var(--brand-green)' },
                { label: 'Avg Payout Time', value: '94m', icon: <Clock size={24} />, color: 'var(--brand-blue)' },
                { label: 'System Uptime', value: '99.9%', icon: <Zap size={24} />, color: 'var(--brand-yellow)' },
              ].map((s, i) => (
                <div key={i} className="glass-card stat-card" style={{ padding: 28, textAlign: 'center' }}>
                  <div style={{ color: s.color, marginBottom: 16, display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)' }}>{s.value}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4, fontWeight: 600 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div className="grid-2" style={{ gap: 32 }}>
              {/* Adoption Chart */}
              <div className="glass-card" style={{ padding: 32 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <TrendingUp size={20} color="var(--brand-orange)" /> Popular Protection Plans
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={stats.planStats}>
                    <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                    <Bar dataKey="count" fill="var(--brand-orange)" radius={[4, 4, 0, 0]} name="Users Covered" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Platform Share */}
              <div className="glass-card" style={{ padding: 32 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Shield size={20} color="var(--brand-green)" /> Partner Distribution
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Zomato', value: stats.platformStats.zomato },
                          { name: 'Swiggy', value: stats.platformStats.swiggy }
                        ]}
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={10}
                        dataKey="value"
                      >
                        <Cell fill="#FF6B35" />
                        <Cell fill="#00D4A3" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 12 }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                      <div style={{ width: 14, height: 14, background: '#FF6B35', borderRadius: 4 }} /> Zomato
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                      <div style={{ width: 14, height: 14, background: '#00D4A3', borderRadius: 4 }} /> Swiggy
                   </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 100, color: 'var(--text-muted)' }}>
             <TrendingUp size={48} className="pulse" style={{ marginBottom: 20 }} />
             <p>Loading platform metrics...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicAnalytics;
