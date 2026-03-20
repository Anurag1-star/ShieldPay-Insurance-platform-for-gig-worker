import React, { useState } from 'react';
import { User, MapPin, Clock, Shield, Check, ChevronRight, Zap } from 'lucide-react';
import type { Page } from '../types';

interface OnboardingPageProps {
  navigate: (page: Page) => void;
  authToken: string | null;
  user?: any;
}

const zones = ['Andheri West', 'Bandra East', 'Koregaon Park', 'Indiranagar', 'Connaught Place', 'Salt Lake', 'Hitech City', 'T. Nagar', 'Whitefield'];

const OnboardingPage: React.FC<OnboardingPageProps> = ({ navigate, authToken }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    platform: '',
    vehicleType: '',
    zone: '',
    avgHoursPerDay: '',
    avgDaysPerWeek: '',
    avgEarningsPerWeek: '',
    plan: '',
  });
  const [riskScore, setRiskScore] = useState<null | number>(null);
  const [premium, setPremium] = useState<null | { weekly: number; coverage: number }>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);

  React.useEffect(() => {
    fetch('http://127.0.0.1:5000/api/plans')
      .then(res => res.json())
      .then(data => setPlans(data.sort((a: any, b: any) => a.weeklyPremium - b.weeklyPremium)))
      .catch(err => console.error('Failed to fetch plans', err));
  }, []);

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const calculateRisk = () => {
    setIsCalculating(true);
    setTimeout(() => {
      const hours = parseFloat(form.avgHoursPerDay) || 8;
      // AI mock: higher outdoor hours = higher risk
      const base = 40 + (hours / 12) * 30 + (Math.random() * 20 - 10);
      const score = Math.min(95, Math.max(25, Math.round(base)));
      setRiskScore(score);
      
      let recPremium = 0, recCoverage = 0;
      if (plans.length > 0) {
        const index = score < 50 ? 0 : score < 70 ? Math.floor(plans.length / 2) : plans.length - 1;
        recPremium = plans[index].weeklyPremium;
        recCoverage = plans[index].coverageAmount;
      }
      setPremium({ weekly: recPremium, coverage: recCoverage });
      setIsCalculating(false);
      setStep(3);
    }, 2200);
  };

  const handleConfirmPlan = async () => {
    try {
      if (!authToken || !form.plan) {
        setStep(5);
        return;
      }
      
      const selectedPlan = plans.find(p => p.planId === form.plan);
      const payload = {
        activePlan: {
          planId: form.plan,
          status: 'active',
          coverageAmount: selectedPlan?.coverageAmount || 0,
          weeklyPremium: selectedPlan?.weeklyPremium || 0
        }
      };

      const res = await fetch(`http://127.0.0.1:5000/api/users/me/plan`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) console.error('Failed to save plan');
      setStep(5);
    } catch (err) {
      console.error('Error saving plan:', err);
      setStep(5);
    }
  };

  const stepsConfig = [
    { id: 1, label: 'Your Profile' },
    { id: 2, label: 'Work Details' },
    { id: 3, label: 'Risk Assessment' },
    { id: 4, label: 'Choose Plan' },
    { id: 5, label: 'Confirm' },
  ];

  const riskColor = riskScore === null ? 'var(--text-muted)'
    : riskScore < 40 ? 'var(--brand-green)'
    : riskScore < 65 ? 'var(--brand-yellow)'
    : 'var(--brand-red)';

  const riskLabel = riskScore === null ? '—'
    : riskScore < 40 ? 'Low Risk' : riskScore < 65 ? 'Moderate Risk' : 'High Risk';

  return (
    <div style={{ minHeight: '100vh', paddingTop: 90, paddingBottom: 60, background: 'var(--gradient-hero)' }}>
      <div className="container" style={{ maxWidth: 680 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p className="section-eyebrow">Onboarding</p>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Get Covered in 5 Minutes</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Our AI profiles your risk and suggests the optimal weekly plan.</p>
        </div>

        {/* Step Indicator */}
        <div className="step-indicator" style={{ marginBottom: 40 }}>
          {stepsConfig.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className={`step-dot ${step === s.id ? 'active' : step > s.id ? 'done' : 'pending'}`}>
                {step > s.id ? <Check size={14} /> : s.id}
              </div>
              {i < stepsConfig.length - 1 && (
                <div className={`step-line ${step > s.id ? 'done' : ''}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Profile */}
        {step === 1 && (
          <div className="glass-card" style={{ padding: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={18} color="white" />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>Your Profile</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" placeholder="e.g. Ramesh Kumar" value={form.name} onChange={e => update('name', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" placeholder="+91 98765 43210" value={form.phone} onChange={e => update('phone', e.target.value)} type="tel" />
              </div>
              <div className="form-group">
                <label className="form-label">Delivery Platform</label>
                <select className="form-select" value={form.platform} onChange={e => update('platform', e.target.value)}>
                  <option value="">Select your platform</option>
                  <option value="zomato">🍕 Zomato</option>
                  <option value="swiggy">🛵 Swiggy</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Vehicle Type</label>
                <select className="form-select" value={form.vehicleType} onChange={e => update('vehicleType', e.target.value)}>
                  <option value="">Select vehicle</option>
                  <option value="bike">🏍️ Motorcycle / Scooter</option>
                  <option value="cycle">🚲 Bicycle</option>
                  <option value="evscooter">⚡ Electric Scooter</option>
                </select>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
                disabled={!form.name || !form.platform}
                onClick={() => setStep(2)}
              >
                Continue <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Work Details */}
        {step === 2 && (
          <div className="glass-card" style={{ padding: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={18} color="white" />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>Work Details</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="form-group">
                <label className="form-label">Primary Delivery Zone</label>
                <select className="form-select" value={form.zone} onChange={e => update('zone', e.target.value)}>
                  <option value="">Select your zone</option>
                  {zones.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
              <div className="grid-2" style={{ gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Avg. Hours/Day</label>
                  <input className="form-input" placeholder="e.g. 8" type="number" value={form.avgHoursPerDay} onChange={e => update('avgHoursPerDay', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Days/Week</label>
                  <input className="form-input" placeholder="e.g. 6" type="number" value={form.avgDaysPerWeek} onChange={e => update('avgDaysPerWeek', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Avg. Weekly Earnings (₹)</label>
                <input className="form-input" placeholder="e.g. 3500" type="number" value={form.avgEarningsPerWeek} onChange={e => update('avgEarningsPerWeek', e.target.value)} />
              </div>

              <div className="alert-box alert-orange" style={{ marginTop: 4 }}>
                <Zap size={16} color="var(--brand-orange)" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Our AI uses your zone & hours to estimate disruption probability and calculate your personalized weekly premium.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                  disabled={!form.zone || !form.avgHoursPerDay || !form.avgEarningsPerWeek || isCalculating}
                  onClick={calculateRisk}
                >
                  {isCalculating ? (
                    <>
                      <span className="pulse-dot" style={{ background: 'white' }} /> Analyzing Risk...
                    </>
                  ) : (
                    <>Analyze My Risk <Zap size={16} /></>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Risk Assessment */}
        {step === 3 && riskScore !== null && premium !== null && (
          <div className="glass-card animate-in" style={{ padding: 36 }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>🤖</div>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>AI Risk Assessment Complete</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Based on your zone, hours & historical disruption data</p>
            </div>

            {/* Risk Score */}
            <div className="glass-card" style={{ padding: 24, textAlign: 'center', marginBottom: 24, border: `1px solid ${riskColor}33` }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 8 }}>Risk Score</div>
              <div style={{ fontSize: 72, fontWeight: 900, color: riskColor, lineHeight: 1 }}>{riskScore}</div>
              <div style={{ fontWeight: 700, color: riskColor, fontSize: 16, marginTop: 6 }}>{riskLabel}</div>
              <div className="risk-meter" style={{ marginTop: 16 }}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="risk-bar" style={{
                    background: i < Math.round(riskScore / 10)
                      ? riskScore < 40 ? 'var(--brand-green)' : riskScore < 65 ? 'var(--brand-yellow)' : 'var(--brand-red)'
                      : undefined
                  }} />
                ))}
              </div>
            </div>

            {/* Insights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              <div className="alert-box alert-orange">
                <MapPin size={16} color="var(--brand-orange)" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: 13 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Zone Risk:</strong>
                  <span style={{ color: 'var(--text-secondary)' }}> {form.zone} has had 6 parametric trigger events in the last 12 months (rain, AQI alerts).</span>
                </div>
              </div>
              <div className="alert-box alert-green">
                <Zap size={16} color="var(--brand-green)" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: 13 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Earnings at Risk:</strong>
                  <span style={{ color: 'var(--text-secondary)' }}> Based on {form.avgHoursPerDay}hr/day × {form.avgDaysPerWeek} days, up to ₹{Math.round(Number(form.avgEarningsPerWeek) * 0.3)} of your weekly ₹{form.avgEarningsPerWeek} is at risk.</span>
                </div>
              </div>
            </div>

            {/* Recommended premium */}
            <div style={{ background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.2)', borderRadius: 'var(--radius-md)', padding: '20px 24px', textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>AI-Recommended Weekly Premium</div>
              <div style={{ fontSize: 48, fontWeight: 900, color: 'var(--brand-orange)' }}>₹{premium.weekly}</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Covers up to <strong style={{ color: 'var(--text-primary)' }}>₹{premium.coverage}/week</strong> of lost income</div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-secondary" onClick={() => setStep(2)}>← Recalculate</button>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(4)}>
                Choose My Plan <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Choose Plan */}
        {step === 4 && premium && (
          <div className="glass-card animate-in" style={{ padding: 36 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Choose Your Weekly Plan</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {plans.map((plan) => {
                const isRecommended = premium?.weekly === plan.weeklyPremium;
                return (
                <div
                  key={plan.planId}
                  onClick={() => update('plan', plan.planId)}
                  style={{
                    padding: '20px 24px',
                    borderRadius: 'var(--radius-md)',
                    border: form.plan === plan.planId ? '1px solid var(--brand-orange)' : '1px solid var(--bg-glass-border)',
                    background: form.plan === plan.planId ? 'rgba(255,107,53,0.08)' : 'var(--bg-glass)',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    position: 'relative',
                  }}
                >
                  {isRecommended && (
                    <div className="badge badge-orange" style={{ position: 'absolute', top: -10, right: 16 }}>AI Recommended</div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{plan.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Covers up to ₹{plan.coverageAmount.toLocaleString()}/week</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 28, fontWeight: 900, color: form.plan === plan.planId ? 'var(--brand-orange)' : 'var(--text-primary)' }}>₹{plan.weeklyPremium}</span>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>/week</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    {plan.features.map((f: string, i: number) => (
                      <span key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Check size={11} color="var(--brand-green)" /> {f}
                      </span>
                    ))}
                  </div>
                </div>
              )})}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              <button className="btn btn-secondary" onClick={() => setStep(3)}>← Back</button>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={!form.plan} onClick={handleConfirmPlan}>
                Confirm Plan <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Confirmation */}
        {step === 5 && (
          <div className="glass-card animate-in" style={{ padding: 36, textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--gradient-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: 'var(--shadow-glow-green)' }}>
              <Shield size={36} color="#0a0b0f" />
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>You're Covered! 🎉</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>
              Welcome to ShieldPay, {form.name || 'Partner'}! Your income is now protected starting this week.
            </p>

            <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)', borderRadius: 'var(--radius-md)', padding: '20px 24px', textAlign: 'left', marginBottom: 28 }}>
              {[
                ['Partner', form.name || '—'],
                ['Platform', form.platform === 'zomato' ? '🍕 Zomato' : '🛵 Swiggy'],
                ['Zone', form.zone],
                ['Plan', plans.find(p => p.planId === form.plan)?.name || 'Custom Plan'],
                ['Weekly Premium', premium ? `₹${plans.find(p => p.planId === form.plan)?.weeklyPremium || premium.weekly}` : '—'],
                ['Coverage', premium ? `Up to ₹${plans.find(p => p.planId === form.plan)?.coverageAmount || premium.coverage}/week` : '—'],
                ['Policy Start', 'Today, ' + new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 14 }}>
                  <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                  <span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>

            <div className="alert-box alert-green" style={{ textAlign: 'left', marginBottom: 28 }}>
              <Zap size={16} color="var(--brand-green)" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--brand-green)' }}>Auto-monitoring active:</strong> We're now watching weather and disruptions in {form.zone}. You'll be notified via SMS if a trigger event is detected.
              </p>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 16 }} onClick={() => navigate('dashboard')}>
              Go to My Dashboard <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
