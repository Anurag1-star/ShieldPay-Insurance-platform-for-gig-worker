import React, { useState } from 'react';
import {
  LayoutDashboard, FileText, BarChart2, Shield,
  AlertTriangle, Check, Zap, TrendingUp, TrendingDown,
  Clock, MapPin, User, LogOut
} from 'lucide-react';
import type { Page } from '../types';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

interface DashboardProps {
  navigate: (page: Page) => void;
  initialTab?: string;
  user?: any;
}

// Mock data
const earningsData = [
  { week: 'W1 Jan', earned: 3100, protected: 0 },
  { week: 'W2 Jan', earned: 2800, protected: 400 },
  { week: 'W3 Jan', earned: 3400, protected: 0 },
  { week: 'W4 Jan', earned: 1900, protected: 1100 },
  { week: 'W1 Feb', earned: 3050, protected: 0 },
  { week: 'W2 Feb', earned: 3200, protected: 0 },
  { week: 'W3 Feb', earned: 2100, protected: 900 },
  { week: 'W4 Feb', earned: 3400, protected: 0 },
  { week: 'W1 Mar', earned: 3600, protected: 0 },
  { week: 'W2 Mar', earned: 2500, protected: 700 },
  { week: 'Current', earned: 2200, protected: 800 },
];

const claimsData = [
  { id: 'CLM-4821', date: '15 Mar 2026', trigger: 'Heavy Rain (22mm/hr)', zone: 'Andheri West', hours: 4.5, payout: '₹720', status: 'Paid', fraud: 'Verified' },
  { id: 'CLM-4790', date: '09 Mar 2026', trigger: 'AQI Alert (AQI: 415)', zone: 'Andheri West', hours: 3.0, payout: '₹480', status: 'Paid', fraud: 'Verified' },
  { id: 'CLM-4733', date: '28 Feb 2026', trigger: 'Heavy Rain (18mm/hr)', zone: 'Andheri West', hours: 5.5, payout: '₹880', status: 'Paid', fraud: 'Verified' },
  { id: 'CLM-4701', date: '14 Feb 2026', trigger: 'Zone Curfew (24 hrs)', zone: 'Bandra East', hours: 8.0, payout: '₹1,280', status: 'Paid', fraud: 'Verified' },
  { id: 'CLM-4605', date: '22 Jan 2026', trigger: 'Heavy Rain (19mm/hr)', zone: 'Andheri West', hours: 2.5, payout: '₹400', status: 'Paid', fraud: 'Verified' },
  { id: 'CLM-4588', date: '14 Jan 2026', trigger: 'Suspicious — GPS mismatch', zone: 'Andheri West', hours: 6.0, payout: '₹0', status: 'Rejected', fraud: 'Flagged' },
];

const disruptionTypes = [
  { name: 'Heavy Rain', value: 48, color: '#4ECDC4' },
  { name: 'AQI Alert', value: 26, color: '#FF6B35' },
  { name: 'Curfew', value: 16, color: '#FFD166' },
  { name: 'Extreme Heat', value: 10, color: '#FF4757' },
];

const analyticsWeekly = [
  { name: 'Mon', triggers: 2, payouts: 1 },
  { name: 'Tue', triggers: 0, payouts: 0 },
  { name: 'Wed', triggers: 3, payouts: 3 },
  { name: 'Thu', triggers: 1, payouts: 1 },
  { name: 'Fri', triggers: 0, payouts: 0 },
  { name: 'Sat', triggers: 4, payouts: 4 },
  { name: 'Sun', triggers: 2, payouts: 2 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1A1B22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>
        <div style={{ color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
        {payload.map((p: any) => (
          <div key={p.name} style={{ color: p.color, fontWeight: 600 }}>₹{p.value.toLocaleString()}</div>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard: React.FC<DashboardProps> = ({ navigate, initialTab = 'overview', user }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const navItems = [
    { id: 'overview', icon: <LayoutDashboard size={18} />, label: 'Overview' },
    { id: 'claims', icon: <FileText size={18} />, label: 'Claims & Payouts' },
    { id: 'analytics', icon: <BarChart2 size={18} />, label: 'Analytics' },
  ];

  // Live weather mock
  const weatherStatus = [
    { icon: '🌧️', label: 'Rainfall', value: '8.2mm/hr', status: 'normal', threshold: '15mm/hr' },
    { icon: '🌡️', label: 'Temperature', value: '42°C', status: 'warning', threshold: '45°C' },
    { icon: '🌫️', label: 'AQI', value: '178', status: 'normal', threshold: '400' },
    { icon: '🚕', label: 'Zone Status', value: 'Open', status: 'safe', threshold: 'No Curfew' },
  ];

  return (
    <div className="dashboard-layout" style={{ background: 'var(--bg-dark)', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside className="sidebar">
        <button onClick={() => navigate('landing')} className="sidebar-logo" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <div className="sidebar-logo-icon"><Shield size={18} color="white" /></div>
          <span className="sidebar-logo-text">ShieldPay</span>
        </button>

        <div className="sidebar-section-label">Main</div>
        {navItems.map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}>
            {item.icon} {item.label}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        {/* Policy badge */}
        <div style={{ background: 'rgba(0,212,163,0.08)', border: '1px solid rgba(0,212,163,0.2)', borderRadius: 12, padding: 16, marginTop: 16 }}>
          <div className="badge badge-green" style={{ marginBottom: 10, fontSize: 10 }}>
            <span className="pulse-dot" /> Active — {user?.activePlan?.planId ? `Shield ${user.activePlan.planId.charAt(0).toUpperCase() + user.activePlan.planId.slice(1)}` : 'No Plan'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>This week</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--brand-green)' }}>₹{user?.activePlan?.coverageAmount?.toLocaleString() || '0'}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>coverage active</div>
          <div className="progress-bar" style={{ marginTop: 10 }}>
            <div className="progress-fill" style={{ width: '100%', background: 'var(--gradient-green)' }} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>No claims this week</div>
        </div>

        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button onClick={() => { localStorage.removeItem('token'); window.location.reload(); }} className="sidebar-item">
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>
              {activeTab === 'overview' ? 'Partner Dashboard' : activeTab === 'claims' ? 'Claims & Payouts' : 'Analytics'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              {activeTab === 'overview' ? `Andheri West • ${user?.platform || 'Zomato'} Partner • Worker ID: ${user?.workerId || 'N/A'}` : activeTab === 'claims' ? 'Automated claim history & payout ledger' : 'Income protection performance metrics'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div className="badge badge-green"><span className="pulse-dot" /> Monitoring Active</div>
            <button className="btn btn-primary btn-sm" onClick={() => {
              const id = prompt('Please confirm your Worker ID to file a claim:');
              if (id === user?.workerId) {
                alert('Claim request received. Our AI is verifying the weather triggers in your zone...');
              } else {
                alert('Invalid Worker ID. Claim rejected.');
              }
            }}>
              File a Claim
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('onboarding')}>
              Renew Plan
            </button>
          </div>
        </div>

        {/* ---- OVERVIEW TAB ---- */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* KPI row */}
            <div className="grid-4">
              {[
                { label: 'Total Saved This Month', value: '₹0', sub: 'Across 0 events', trend: null, up: false, icon: <Shield size={20} /> },
                { label: 'Active Weekly Premium', value: `₹${user?.activePlan?.weeklyPremium || '0'}`, sub: `Shield ${user?.activePlan?.planId?.toUpperCase() || 'LITE'} — renews Sun`, trend: null, up: false, icon: <Zap size={20} /> },
                { label: 'Claims Processed', value: '0', sub: 'Lifetime auto-claims', trend: null, up: false, icon: <Check size={20} /> },
                { label: 'Fraud Detection Score', value: '100%', sub: 'All claims verified clean', trend: null, up: true, icon: <AlertTriangle size={20} /> },
              ].map((kpi, i) => (
                <div key={i} className="glass-card stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div className="stat-label">{kpi.label}</div>
                    <div style={{ color: 'var(--brand-orange)', opacity: 0.7 }}>{kpi.icon}</div>
                  </div>
                  <div className="stat-value" style={{ fontSize: 28 }}>{kpi.value}</div>
                  <div className="stat-sub">{kpi.sub}</div>
                  {kpi.trend && (
                    <div className={`stat-trend ${kpi.up ? 'trend-up' : 'trend-down'}`}>
                      {kpi.up ? <TrendingUp size={13} /> : <TrendingDown size={13} />} {kpi.trend}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Realtime Weather Monitor */}
            <div className="glass-card" style={{ padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700 }}>🌐 Live Parametric Trigger Monitor</h2>
                <div className="badge badge-green"><span className="pulse-dot" /> Real-time</div>
              </div>
              <div className="weather-grid">
                {weatherStatus.map((w, i) => (
                  <div key={i} className={`glass-card weather-item`} style={{
                    border: w.status === 'warning' ? '1px solid rgba(255,209,102,0.3)' : w.status === 'safe' ? '1px solid rgba(0,212,163,0.3)' : undefined,
                    background: w.status === 'warning' ? 'rgba(255,209,102,0.06)' : w.status === 'safe' ? 'rgba(0,212,163,0.06)' : undefined,
                  }}>
                    <span className="weather-icon">{w.icon}</span>
                    <div className={`weather-value`} style={{ color: w.status === 'warning' ? 'var(--brand-yellow)' : w.status === 'safe' ? 'var(--brand-green)' : 'var(--text-primary)' }}>
                      {w.value}
                    </div>
                    <div className="weather-label">{w.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>Trigger: {w.threshold}</div>
                    <div className={`badge ${w.status === 'safe' || w.status === 'normal' ? 'badge-green' : 'badge-yellow'}`} style={{ marginTop: 8, fontSize: 10 }}>
                      {w.status === 'warning' ? '⚠️ Near Trigger' : '✓ Normal'}
                    </div>
                  </div>
                ))}
              </div>

              <div className="alert-box alert-green" style={{ marginTop: 20 }}>
                <Check size={16} color="var(--brand-green)" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: 13 }}>
                  <strong style={{ color: 'var(--brand-green)' }}>All clear in Andheri West.</strong>
                  <span style={{ color: 'var(--text-secondary)' }}> No active triggers right now. Temperature is approaching a caution threshold — we're monitoring closely.</span>
                </div>
              </div>
            </div>

            {/* Earnings chart */}
            <div className="glass-card" style={{ padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700 }}>Weekly Earnings + Income Protected</h2>
                <div className="badge badge-orange">Last 11 Weeks</div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={earningsData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="earned" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4ECDC4" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#4ECDC4" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="protected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF6B35" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#FF6B35" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="week" tick={{ fill: '#5A5A70', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#5A5A70', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="earned" stroke="#4ECDC4" strokeWidth={2} fill="url(#earned)" name="Earnings" />
                  <Area type="monotone" dataKey="protected" stroke="#FF6B35" strokeWidth={2} fill="url(#protected)" name="ShieldPay Payout" />
                </AreaChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: 20, marginTop: 12, justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <div style={{ width: 12, height: 3, borderRadius: 2, background: '#4ECDC4' }} /> Actual Earnings
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <div style={{ width: 12, height: 3, borderRadius: 2, background: '#FF6B35' }} /> ShieldPay Income Rescue
                </div>
              </div>
            </div>

            {/* Recent claims snippet */}
            <div className="glass-card" style={{ padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700 }}>Recent Auto-Claims</h2>
                <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('claims')}>View All →</button>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Claim ID</th>
                    <th>Trigger</th>
                    <th>Date</th>
                    <th>Payout</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {claimsData.slice(0, 4).map(c => (
                    <tr key={c.id}>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{c.id}</td>
                      <td>{c.trigger}</td>
                      <td>{c.date}</td>
                      <td style={{ color: c.status === 'Paid' ? 'var(--brand-green)' : 'var(--brand-red)', fontWeight: 700 }}>{c.payout}</td>
                      <td>
                        <span className={`badge ${c.status === 'Paid' ? 'badge-green' : 'badge-red'}`}>
                          {c.status === 'Paid' ? <Check size={10} /> : <AlertTriangle size={10} />} {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---- CLAIMS TAB ---- */}
        {activeTab === 'claims' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Summary row */}
            <div className="grid-3">
              {[
                { label: 'Total Claims', value: '14', sub: 'Since policy start Jan 2026', color: 'var(--text-primary)' },
                { label: 'Total Paid Out', value: '₹11,640', sub: 'Avg payout: ₹831 per claim', color: 'var(--brand-green)' },
                { label: 'Fraud Flagged', value: '1', sub: '1 rejected due to GPS anomaly', color: 'var(--brand-red)' },
              ].map((s, i) => (
                <div key={i} className="glass-card stat-card">
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value" style={{ color: s.color, fontSize: 30 }}>{s.value}</div>
                  <div className="stat-sub">{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Fraud Detection Panel */}
            <div className="glass-card" style={{ padding: 28 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>🤖 AI Fraud Detection Engine</h2>
              <div className="grid-3" style={{ gap: 16 }}>
                {[
                  { label: 'Location Validation', status: 'Active', icon: <MapPin size={16} />, desc: 'GPS crosscheck with trigger zone boundary' },
                  { label: 'Activity Verification', status: 'Active', icon: <Clock size={16} />, desc: 'App activity vs declared idle hours' },
                  { label: 'Duplicate Prevention', status: 'Active', icon: <User size={16} />, desc: 'Same-event multi-claim block' },
                ].map((f, i) => (
                  <div key={i} style={{ background: 'rgba(0,212,163,0.06)', border: '1px solid rgba(0,212,163,0.2)', borderRadius: 12, padding: '18px 20px' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ color: 'var(--brand-green)' }}>{f.icon}</span>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{f.label}</span>
                      <span className="badge badge-green" style={{ marginLeft: 'auto', fontSize: 10 }}><span className="pulse-dot" /> {f.status}</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Claims Table */}
            <div className="glass-card" style={{ padding: 28 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>All Claims (Auto-Triggered)</h2>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Claim ID</th>
                    <th>Date</th>
                    <th>Trigger Event</th>
                    <th>Zone</th>
                    <th>Hours Lost</th>
                    <th>Payout</th>
                    <th>Fraud Check</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {claimsData.map(c => (
                    <tr key={c.id}>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{c.id}</td>
                      <td>{c.date}</td>
                      <td>{c.trigger}</td>
                      <td style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={12} color="var(--text-muted)" />{c.zone}</td>
                      <td>{c.hours}h</td>
                      <td style={{ color: c.status === 'Paid' ? 'var(--brand-green)' : 'var(--brand-red)', fontWeight: 700 }}>{c.payout}</td>
                      <td>
                        <span className={`badge ${c.fraud === 'Verified' ? 'badge-green' : 'badge-red'}`} style={{ fontSize: 10 }}>
                          {c.fraud}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${c.status === 'Paid' ? 'badge-green' : 'badge-red'}`} style={{ fontSize: 10 }}>
                          {c.status === 'Paid' ? <Check size={10} /> : <AlertTriangle size={10} />} {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="alert-box alert-orange">
              <AlertTriangle size={16} color="var(--brand-orange)" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Coverage Reminder:</strong> ShieldPay only compensates for income lost during external disruptions (weather, AQI, curfews).
                Claims for vehicle damage, health, accidents, or life are <u>not covered</u>.
              </p>
            </div>
          </div>
        )}

        {/* ---- ANALYTICS TAB ---- */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Top KPIs */}
            <div className="grid-4">
              {[
                { label: 'Total Premium Paid', value: '₹1,287', sub: 'Since Jan 2026 (13 weeks)', icon: '💳' },
                { label: 'Total Income Rescued', value: '₹11,640', sub: '903% return on premium', icon: '💰' },
                { label: 'Days Disrupted', value: '18', sub: 'Out of 91 active days', icon: '🌧️' },
                { label: 'Avg Payout Time', value: '94 min', sub: 'Fastest: 22 min', icon: '⚡' },
              ].map((kpi, i) => (
                <div key={i} className="glass-card stat-card">
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{kpi.icon}</div>
                  <div className="stat-label">{kpi.label}</div>
                  <div className="stat-value" style={{ fontSize: 26 }}>{kpi.value}</div>
                  <div className="stat-sub">{kpi.sub}</div>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div className="grid-2">
              {/* Disruption breakdown */}
              <div className="glass-card" style={{ padding: 28 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>Disruption Type Breakdown</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={disruptionTypes} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                      {disruptionTypes.map((d, index) => (
                        <Cell key={index} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: any) => `${val}%`} contentStyle={{ background: '#1A1B22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8, justifyContent: 'center' }}>
                  {disruptionTypes.map(d => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                      {d.name} ({d.value}%)
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly triggers */}
              <div className="glass-card" style={{ padding: 28 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>Triggers vs Payouts — This Week</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analyticsWeekly} barSize={18}>
                    <XAxis dataKey="name" tick={{ fill: '#5A5A70', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#5A5A70', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#1A1B22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 13 }} />
                    <Bar dataKey="triggers" fill="#FF6B35" radius={[4, 4, 0, 0]} name="Trigger Events" />
                    <Bar dataKey="payouts" fill="#00D4A3" radius={[4, 4, 0, 0]} name="Payouts Issued" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ROI Analysis */}
            <div className="glass-card" style={{ padding: 28 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>Income Protection ROI</h2>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={earningsData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="earnedAn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4ECDC4" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#4ECDC4" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="protectedAn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF6B35" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#FF6B35" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="week" tick={{ fill: '#5A5A70', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#5A5A70', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="earned" stroke="#4ECDC4" strokeWidth={2} fill="url(#earnedAn)" name="Earnings" />
                  <Area type="monotone" dataKey="protected" stroke="#FF6B35" strokeWidth={2} fill="url(#protectedAn)" name="ShieldPay Rescue" strokeDasharray="4 2" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <div className="glass-card" style={{ flex: 1, padding: 24 }}>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Net Benefit</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--brand-green)' }}>₹10,353</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Income rescued minus total premiums paid</div>
              </div>
              <div className="glass-card" style={{ flex: 1, padding: 24 }}>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>ROI on Premium</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--brand-green)' }}>903%</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>₹1,287 spent → ₹11,640 received back</div>
              </div>
              <div className="glass-card" style={{ flex: 1, padding: 24 }}>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Plan Efficiency</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--brand-orange)' }}>Shield Pro</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Optimal match for your risk profile</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
