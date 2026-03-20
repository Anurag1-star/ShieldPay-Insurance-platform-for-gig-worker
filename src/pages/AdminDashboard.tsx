import React, { useState, useEffect } from 'react';
import { Shield, Users, Edit2, Check, AlertTriangle, LogOut, Search, BarChart2, TrendingUp, ArrowRight } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import type { Page } from '../types';

interface AdminDashboardProps {
  navigate: (page: Page) => void;
  authToken: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigate, authToken }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'plans' | 'analytics'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editPlanForm, setEditPlanForm] = useState<any>({});
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [usersRes, plansRes, statsRes] = await Promise.all([
        fetch('http://127.0.0.1:5000/api/users', { headers: { Authorization: `Bearer ${authToken}` } }),
        fetch('http://127.0.0.1:5000/api/plans'),
        fetch('http://127.0.0.1:5000/api/admin/stats', { headers: { Authorization: `Bearer ${authToken}` } })
      ]);
      
      if (!usersRes.ok || !plansRes.ok || !statsRes.ok) {
        console.error('Fetch error details:', { 
          users: usersRes.status, 
          plans: plansRes.status, 
          stats: statsRes.status 
        });
        throw new Error(`Connection Error: ${usersRes.status}/${plansRes.status}/${statsRes.status}`);
      }
      
      const [usersData, plansData, statsData] = await Promise.all([usersRes.json(), plansRes.json(), statsRes.json()]);
      setUsers(usersData);
      setPlans(plansData.sort((a: any, b: any) => a.weeklyPremium - b.weeklyPremium));
      setStats(statsData);
    } catch (err: any) {
      console.error('Admin Fetch Failed:', err);
      setError(err.message === 'Failed to fetch' ? 'Cannot connect to Backend Server (Is it running on port 5000?)' : err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (user: any) => {
    setEditingId(user._id);
    setEditForm({
      name: user.name,
      phone: user.phone,
      platform: user.platform,
      workerId: user.workerId || '',
      role: user.role,
      planId: user.activePlan?.planId || '',
      status: user.activePlan?.status || 'inactive'
    });
  };

  const handleSave = async (id: string) => {
    try {
      const payload = {
        name: editForm.name,
        phone: editForm.phone,
        platform: editForm.platform,
        workerId: editForm.workerId,
        role: editForm.role,
        activePlan: {
          planId: editForm.planId || null,
          status: editForm.status,
          coverageAmount: editForm.planId ? plans.find((p: any) => p.planId === editForm.planId)?.coverageAmount : 0,
          weeklyPremium: editForm.planId ? plans.find((p: any) => p.planId === editForm.planId)?.weeklyPremium : 0
        }
      };

      const res = await fetch(`http://127.0.0.1:5000/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Update failed (${res.status}): ${errorData.message}`);
      }
      
      setEditingId(null);
      fetchData();
    } catch (err: any) {
      console.error('User update failed:', err);
      alert(err.message);
    }
  };

  const handleSavePlan = async (id: string) => {
    try {
      const payload = {
        planId: editPlanForm.planId,
        name: editPlanForm.name,
        weeklyPremium: editPlanForm.weeklyPremium,
        coverageAmount: editPlanForm.coverageAmount,
        features: typeof editPlanForm.features === 'string' 
          ? editPlanForm.features.split(',').map((s: string) => s.trim()).filter(Boolean)
          : editPlanForm.features,
        isActive: editPlanForm.isActive !== undefined ? editPlanForm.isActive : true
      };
      
      const res = await fetch(`http://127.0.0.1:5000/api/plans/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Update failed (${res.status}): ${errorData.message}`);
      }
      
      setEditingPlanId(null);
      fetchData();
    } catch (err: any) {
      console.error('Plan update failed:', err);
      alert(err.message);
    }
  };

  const filteredUsers = users.filter((u: any) => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.phone.includes(search)
  );

  return (
    <div className="dashboard-layout" style={{ background: 'var(--bg-dark)', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside className="sidebar">
        <button onClick={() => navigate('landing')} className="sidebar-logo" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <div className="sidebar-logo-icon" style={{ background: 'var(--brand-orange)' }}><Shield size={18} color="white" /></div>
          <span className="sidebar-logo-text">Admin Panel</span>
        </button>

        <div className="sidebar-section-label">Management</div>
        <button className={`sidebar-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}><Users size={18} /> User Directory</button>
        <button className={`sidebar-item ${activeTab === 'plans' ? 'active' : ''}`} onClick={() => setActiveTab('plans')}><Shield size={18} /> Plans & Pricing</button>
        <button className={`sidebar-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}><BarChart2 size={18} /> Platform Analytics</button>

        <div style={{ flex: 1 }} />
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button onClick={() => navigate('landing')} className="sidebar-item" style={{ color: 'var(--brand-green)' }}>
            <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} /> Go to Website
          </button>
          <button onClick={() => navigate('dashboard')} className="sidebar-item">
            <Shield size={16} /> User Dashboard
          </button>
          <button onClick={() => { localStorage.removeItem('token'); window.location.reload(); }} className="sidebar-item">
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {activeTab === 'users' ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <div>
                <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>User Management</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>View and manage gig worker profiles and coverage plans.</p>
              </div>
              <div className="search-bar" style={{ position: 'relative', width: 260 }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 12 }} />
                <input 
                  className="form-input" 
                  placeholder="Search name or phone..." 
                  style={{ paddingLeft: 40, background: 'var(--bg-glass)', height: 40 }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="alert-box alert-red" style={{ marginBottom: 20 }}>
                <AlertTriangle size={16} color="var(--brand-red)" /> {error}
              </div>
            )}

            <div className="glass-card" style={{ padding: 24 }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading users...</div>
              ) : (
                <table className="data-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Name & Contact</th>
                      <th>Worker ID</th>
                      <th>Platform</th>
                      <th>Role</th>
                      <th>Active Plan</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user: any) => (
                      <tr key={user._id}>
                        {editingId === user._id ? (
                          <>
                            <td style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              <input className="form-input" style={{ height: 32, padding: '4px 10px', fontSize: 13 }} value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                              <input className="form-input" style={{ height: 32, padding: '4px 10px', fontSize: 13 }} value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                            </td>
                            <td>
                              <input className="form-input" style={{ height: 32, padding: '4px 10px', fontSize: 13 }} placeholder="ZM-821" value={editForm.workerId} onChange={e => setEditForm({...editForm, workerId: e.target.value})} />
                            </td>
                            <td>
                              <select className="form-select" style={{ height: 32, padding: '4px 10px', fontSize: 13 }} value={editForm.platform} onChange={e => setEditForm({...editForm, platform: e.target.value})}>
                                <option value="zomato">Zomato</option>
                                <option value="swiggy">Swiggy</option>
                              </select>
                            </td>
                            <td>
                              <select className="form-select" style={{ height: 32, padding: '4px 10px', fontSize: 13 }} value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})}>
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                            <td>
                              <select className="form-select" style={{ height: 32, padding: '4px 10px', fontSize: 13 }} value={editForm.planId} onChange={e => setEditForm({...editForm, planId: e.target.value})}>
                                <option value="">None</option>
                                {plans.map((p: any) => <option key={p.planId} value={p.planId}>{p.name}</option>)}
                              </select>
                            </td>
                            <td>
                              <select className="form-select" style={{ height: 32, padding: '4px 10px', fontSize: 13 }} value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}>
                                <option value="inactive">Inactive</option>
                                <option value="active">Active</option>
                              </select>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: 12, height: 28 }} onClick={() => handleSave(user._id)}>Save</button>
                                <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: 12, height: 28 }} onClick={() => setEditingId(null)}>Cancel</button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</div>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user.phone}</div>
                            </td>
                            <td>
                              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{user.workerId || 'N/A'}</span>
                            </td>
                            <td>
                              <span className={`badge ${user.platform === 'zomato' ? 'badge-red' : 'badge-orange'}`} style={{ fontSize: 11 }}>
                                {user.platform === 'zomato' ? '🍕 Zomato' : '🛵 Swiggy'}
                              </span>
                            </td>
                            <td>
                              {user.role === 'admin' ? <span className="badge badge-yellow" style={{ fontSize: 11 }}>Admin</span> : <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>User</span>}
                            </td>
                            <td>
                              {user.activePlan?.planId ? (
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                                  {plans.find((p: any) => p.planId === user.activePlan.planId)?.name || `Shield ${user.activePlan.planId}`}
                                </span>
                              ) : (
                                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>No Plan</span>
                              )}
                            </td>
                            <td>
                              {user.activePlan?.status === 'active' ? (
                                <span className="badge badge-green" style={{ fontSize: 11 }}><span className="pulse-dot" /> Active</span>
                              ) : (
                                <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: 11 }}>Inactive</span>
                              )}
                            </td>
                            <td>
                              <button onClick={() => handleEdit(user)} style={{ background: 'none', border: 'none', color: 'var(--brand-orange)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
                                <Edit2 size={14} /> Edit
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && !loading && (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>No users found.</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </>
        ) : activeTab === 'plans' ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <div>
                <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Plans & Pricing</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Configure coverage amounts, premiums, and features for each plan.</p>
              </div>
            </div>
            
            <div className="glass-card" style={{ padding: 24 }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading plans...</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                  {plans.map((plan: any) => (
                    <div key={plan._id} style={{ background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)', borderRadius: 12, padding: 20 }}>
                      {editingPlanId === plan._id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <div>
                            <label className="form-label" style={{ fontSize: 12 }}>Plan Name</label>
                            <input className="form-input" style={{ height: 36 }} value={editPlanForm.name} onChange={e => setEditPlanForm({...editPlanForm, name: e.target.value})} />
                          </div>
                          <div style={{ display: 'flex', gap: 12 }}>
                            <div style={{ flex: 1 }}>
                              <label className="form-label" style={{ fontSize: 12 }}>Premium (₹)</label>
                              <input className="form-input" type="number" style={{ height: 36 }} value={editPlanForm.weeklyPremium} onChange={e => setEditPlanForm({...editPlanForm, weeklyPremium: Number(e.target.value)})} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <label className="form-label" style={{ fontSize: 12 }}>Coverage (₹)</label>
                              <input className="form-input" type="number" style={{ height: 36 }} value={editPlanForm.coverageAmount} onChange={e => setEditPlanForm({...editPlanForm, coverageAmount: Number(e.target.value)})} />
                            </div>
                          </div>
                          <div>
                            <label className="form-label" style={{ fontSize: 12 }}>Features (comma separated)</label>
                            <textarea className="form-input" style={{ minHeight: 60, padding: 10, fontSize: 13 }} value={editPlanForm.features} onChange={e => setEditPlanForm({...editPlanForm, features: e.target.value})} />
                          </div>
                          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                            <button className="btn btn-primary" style={{ flex: 1, padding: '8px 0', fontSize: 13, justifyContent: 'center' }} onClick={() => handleSavePlan(plan._id)}>Save Changes</button>
                            <button className="btn btn-secondary" style={{ flex: 1, padding: '8px 0', fontSize: 13, justifyContent: 'center' }} onClick={() => setEditingPlanId(null)}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                            <div>
                              <h3 style={{ fontSize: 18, fontWeight: 700 }}>{plan.name}</h3>
                              <span className="badge badge-green" style={{ fontSize: 11, marginTop: 4 }}>ID: {plan.planId}</span>
                            </div>
                            <button onClick={() => {
                              setEditingPlanId(plan._id);
                              setEditPlanForm({...plan, features: plan.features.join(', ')});
                            }} style={{ background: 'none', border: 'none', color: 'var(--brand-orange)', cursor: 'pointer' }}><Edit2 size={16} /></button>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Weekly Premium</div>
                              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>₹{plan.weeklyPremium}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Max Coverage</div>
                              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--brand-green)' }}>₹{plan.coverageAmount}</div>
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>Features</div>
                            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {plan.features.map((f: string, i: number) => (
                                <li key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                                  <Check size={14} color="var(--brand-green)" style={{ flexShrink: 0, marginTop: 2 }} /> {f}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <div>
                <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Platform Analytics</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Real-time overview of user growth, revenue metrics, and plan distribution.</p>
              </div>
              <div className="badge badge-green"><span className="pulse-dot" /> Live System Stats</div>
            </div>

            {stats && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Stats Grid */}
                <div className="grid-4" style={{ gap: 20 }}>
                  {[
                    { label: 'Total Active Users', value: stats.totalUsers, icon: <Users size={20} />, trend: '+8%', color: 'var(--brand-blue)' },
                    { label: 'Estimated Weekly Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: <TrendingUp size={20} />, trend: '+15%', color: 'var(--brand-green)' },
                    { label: 'ShieldLite Users', value: stats.planStats.find((p: any) => p.name.includes('Lite'))?.count || 0, icon: <Shield size={20} />, trend: 'Steady', color: 'var(--brand-orange)' },
                    { label: 'ShieldMax Users', value: stats.planStats.find((p: any) => p.name.includes('Max'))?.count || 0, icon: <TrendingUp size={20} />, trend: '+4%', color: 'var(--brand-yellow)' },
                  ].map((s, i) => (
                    <div key={i} className="glass-card stat-card" style={{ padding: 24 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}>{s.label}</div>
                        <div style={{ opacity: 0.6 }}>{s.icon}</div>
                      </div>
                      <div style={{ fontSize: 32, fontWeight: 800, color: s.color }}>{s.value}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 12, color: 'var(--brand-green)' }}>
                        <TrendingUp size={12} /> {s.trend}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid-2" style={{ gap: 24 }}>
                  {/* Plan Distribution */}
                  <div className="glass-card" style={{ padding: 28 }}>
                    <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 24 }}>Plan Adoption & Revenue</h3>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={stats.planStats}>
                        <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)', borderRadius: 12, backdropFilter: 'blur(10px)' }}
                        />
                        <Bar dataKey="count" fill="var(--brand-orange)" radius={[6, 6, 0, 0]} name="Total Users" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Platform Share */}
                  <div className="glass-card" style={{ padding: 28 }}>
                    <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 24 }}>Platform Market Share</h3>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Zomato', value: stats.platformStats.zomato },
                              { name: 'Swiggy', value: stats.platformStats.swiggy }
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={8}
                            dataKey="value"
                          >
                            <Cell fill="#FF6B35" />
                            <Cell fill="#00D4A3" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                        <div style={{ width: 12, height: 12, background: '#FF6B35', borderRadius: 3 }} /> Zomato
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                        <div style={{ width: 12, height: 12, background: '#00D4A3', borderRadius: 3 }} /> Swiggy
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
