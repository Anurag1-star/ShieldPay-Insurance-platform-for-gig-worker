import React, { useState, useEffect } from 'react';
import { Zap, AlertTriangle, Check, ArrowRight, Star } from 'lucide-react';
import type { Page } from '../types';

interface LandingPageProps {
  navigate: (page: Page) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ navigate }) => {
  const [count, setCount] = useState({ workers: 0, claims: 0, payout: 0 });
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/plans')
      .then(res => res.json())
      .then(data => setPlans(data.sort((a: any, b: any) => a.weeklyPremium - b.weeklyPremium)))
      .catch(err => console.error('Failed to fetch plans', err));
  }, []);

  useEffect(() => {
    const targets = { workers: 4200, claims: 1840, payout: 97 };
    const duration = 1800;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount({
        workers: Math.floor(ease * targets.workers),
        claims: Math.floor(ease * targets.claims),
        payout: Math.floor(ease * targets.payout),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, []);

  const disruptions = [
    { icon: '🌧️', title: 'Heavy Rain & Floods', desc: 'Unable to make deliveries due to waterlogging or extreme downpour', trigger: 'Rain > 15mm/hr or AQI > 300' },
    { icon: '🌡️', title: 'Extreme Heat Waves', desc: 'Outdoor work halted due to dangerous ambient temperatures', trigger: 'Temp > 45°C for 2+ hours' },
    { icon: '🚫', title: 'Curfews & Zone Closures', desc: 'Access to pickup or drop zones blocked by authorities', trigger: 'Govt. advisory or geo-fence alert' },
    { icon: '🌫️', title: 'Severe Air Pollution', desc: 'Hazardous AQI levels make outdoor delivery unsafe', trigger: 'AQI > 400 (Hazardous)' },
  ];

  const howItWorks = [
    { step: '01', title: 'Onboard in 5 min', desc: 'Share your delivery platform, zone and typical weekly hours. Our AI profiles your risk instantly.' },
    { step: '02', title: 'Pay Weekly Premium', desc: `Premiums start at ₹${plans.length > 0 ? plans[0].weeklyPremium : 49}/week — aligned with your payment cycle. No annual lock-ins.` },
    { step: '03', title: 'Disruption Detected', desc: 'Our sensors detect weather, curfew, or AQI events in your delivery zone automatically.' },
    { step: '04', title: 'Instant Payout', desc: 'No claim forms. Verified income loss is transferred to your UPI wallet within 2 hours.' },
  ];

  const testimonials = [
    { name: 'Ramesh K.', city: 'Mumbai', platform: 'Zomato', quote: 'Baarish mein 3 din kaam nahi ho paya — ShieldPay ne ₹1,200 seedha bhej diye. Koi form nahi bharna pada!', rating: 5 },
    { name: 'Priya S.', city: 'Bengaluru', platform: 'Swiggy', quote: 'AQI 420 tha aur delivery band thi. Pehle bada nuksaan hota. Ab tension nahi — ShieldPay hai!', rating: 5 },
    { name: 'Arjun T.', city: 'Delhi', platform: 'Zomato', quote: 'Curfew ke 2 din mein ₹800 mila. Weekly ₹49 mein itna coverage — bahut sahi hai!', rating: 5 },
  ];

  return (
    <div className="page-wrapper">
      {/* Hero */}
      <section className="hero">
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
            <div className="badge badge-orange animate-in" style={{ marginBottom: 24, animationDelay: '0.1s' }}>
              <span className="pulse-dot" />
              AI-Powered Income Protection
            </div>

            <h1 className="section-title animate-in" style={{ marginBottom: 24, animationDelay: '0.2s' }}>
              Your Income,{' '}
              <span style={{ background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Protected
              </span>
              {' '}Against Every Storm
            </h1>

            <p className="section-subtitle animate-in" style={{ margin: '0 auto 40px', animationDelay: '0.3s', textAlign: 'center' }}>
              India's first parametric income shield for Zomato & Swiggy delivery partners.
              When weather or disruptions stop your work — we pay you instantly. No paperwork, no waiting.
            </p>

            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', animationDelay: '0.4s' }} className="animate-in">
              <button className="btn btn-primary" onClick={() => navigate('onboarding')}>
                Get Covered for ₹{plans.length > 0 ? plans[0].weeklyPremium : 49}/week <ArrowRight size={16} />
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('dashboard')}>
                View Demo Dashboard
              </button>
            </div>

            {/* Trust bar */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 48, flexWrap: 'wrap' }} className="animate-in">
              {[
                { icon: '🏅', text: 'IRDAI Compliant' },
                { icon: '⚡', text: '2-Hour Payouts' },
                { icon: '🔒', text: 'Zero False Claims' },
                { icon: '📱', text: 'UPI Instant Transfer' },
              ].map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)', borderRadius: 100, padding: '8px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
                  <span>{t.icon}</span> {t.text}
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid-3" style={{ marginTop: 72, gap: 20 }}>
            {[
              { value: `${count.workers.toLocaleString()}+`, label: 'Active Partners Covered', sub: 'Across Zomato & Swiggy', color: 'var(--brand-orange)' },
              { value: `${count.claims.toLocaleString()}+`, label: 'Claims Auto-Processed', sub: '100% parametric — no forms', color: 'var(--brand-green)' },
              { value: `${count.payout}%`, label: 'Payout Success Rate', sub: 'Average time: 94 minutes', color: 'var(--brand-blue)' },
            ].map((s, i) => (
              <div key={i} className="glass-card stat-card" style={{ textAlign: 'center' }}>
                <div className="stat-value" style={{ color: s.color, fontSize: 40 }}>{s.value}</div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 8 }}>{s.label}</div>
                <div className="stat-sub">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage - What We Cover */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p className="section-eyebrow">Covered Disruptions</p>
            <h2 className="section-title" style={{ marginBottom: 16 }}>When Nature Stops You, We Pay</h2>
            <p className="section-subtitle" style={{ margin: '0 auto', textAlign: 'center' }}>Parametric triggers auto-detect real-world events so you never have to file a claim.</p>
          </div>
          <div className="grid-2">
            {disruptions.map((d, i) => (
              <div key={i} className="glass-card" style={{ padding: '28px 32px', display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                <div style={{ fontSize: 44, lineHeight: 1 }}>{d.icon}</div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{d.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 12, lineHeight: 1.6 }}>{d.desc}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,107,53,0.08)', borderRadius: 8, padding: '6px 12px', width: 'fit-content' }}>
                    <Zap size={12} color="var(--brand-orange)" />
                    <span style={{ fontSize: 12, color: 'var(--brand-orange)', fontWeight: 600 }}>Trigger: {d.trigger}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* NOT covered disclaimer */}
          <div className="alert-box alert-orange" style={{ marginTop: 24 }}>
            <AlertTriangle size={20} color="var(--brand-orange)" style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ color: 'var(--brand-orange)' }}>Income Protection Only</strong>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
                ShieldPay covers <strong style={{ color: 'var(--text-primary)' }}>loss of working hours/income</strong> due to external disruptions only.
                We do <u>not</u> cover vehicle repairs, health expenses, accidents, or life insurance.
                This is strictly a parametric income protection plan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '80px 0', background: 'rgba(255,255,255,0.02)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p className="section-eyebrow">How It Works</p>
            <h2 className="section-title">From Signup to Payout in Hours</h2>
          </div>
          <div className="grid-4" style={{ gap: 16 }}>
            {howItWorks.map((h, i) => (
              <div key={i} className="glass-card" style={{ padding: '28px 24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ fontSize: 52, fontFamily: 'Syne, sans-serif', fontWeight: 900, color: 'rgba(255,255,255,0.05)', position: 'absolute', top: 8, right: 16 }}>{h.step}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-orange)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Step {h.step}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>{h.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p className="section-eyebrow">Weekly Pricing</p>
            <h2 className="section-title">A Plan for Every Partner</h2>
            <p className="section-subtitle" style={{ margin: '12px auto 0', textAlign: 'center' }}>Priced weekly to match your earning cycle. No annual lock-ins.</p>
          </div>

          <div className="grid-3" style={{ gap: 24 }}>
            {plans.length > 0 ? plans.map((plan, i) => (
              <div key={plan._id} className="glass-card" style={{
                padding: '32px 28px',
                position: 'relative',
                border: i === 1 ? '1px solid rgba(255,107,53,0.4)' : undefined,
                boxShadow: i === 1 ? 'var(--shadow-glow-orange)' : undefined,
              }}>
                {i === 1 && (
                  <div className="badge badge-orange" style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)' }}>
                    Most Popular
                  </div>
                )}
                {i === 2 && (
                  <div className="badge badge-orange" style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)' }}>
                    Best Value
                  </div>
                )}
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{plan.name}</h3>
                <div style={{ marginBottom: 4 }}>
                  <span style={{ fontSize: 44, fontWeight: 900, color: i === 1 ? 'var(--brand-orange)' : 'var(--text-primary)' }}>₹{plan.weeklyPremium}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>/week</span>
                </div>
                <div className="badge badge-green" style={{ marginBottom: 24 }}>Coverage up to ₹{plan.coverageAmount.toLocaleString()}/week</div>
                <div className="divider" />
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                  {plan.features.map((f: string, j: number) => (
                    <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text-secondary)' }}>
                      <Check size={14} color="var(--brand-green)" style={{ flexShrink: 0 }} /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={i === 1 ? 'btn btn-primary' : 'btn btn-secondary'}
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => navigate('onboarding')}
                >
                  Choose {plan.name}
                </button>
              </div>
            )) : (
              <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: 40, color: 'var(--text-muted)' }}>Loading plans...</div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '80px 0', background: 'rgba(255,255,255,0.02)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p className="section-eyebrow">Partner Stories</p>
            <h2 className="section-title">Delivery Partners Love ShieldPay</h2>
          </div>
          <div className="grid-3">
            {testimonials.map((t, i) => (
              <div key={i} className="glass-card" style={{ padding: '28px' }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} fill="var(--brand-yellow)" color="var(--brand-yellow)" />
                  ))}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>"{t.quote}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: 16 }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.platform} Partner, {t.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div className="glass-card" style={{ padding: '64px 48px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(255,107,53,0.1), rgba(0,212,163,0.05))', border: '1px solid rgba(255,107,53,0.2)' }}>
            <div style={{ fontSize: 56, marginBottom: 24 }}>🛡️</div>
            <h2 className="section-title" style={{ marginBottom: 16 }}>Stop Losing Income to Bad Weather</h2>
            <p className="section-subtitle" style={{ margin: '0 auto 36px', textAlign: 'center' }}>
              Join 42,000+ delivery partners who've secured their income with ShieldPay. Coverage starts today.
            </p>
            <button className="btn btn-primary" style={{ fontSize: 17, padding: '16px 36px' }} onClick={() => navigate('onboarding')}>
              Start for ₹{plans.length > 0 ? plans[0].weeklyPremium : 49}/week <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '32px 0', borderTop: '1px solid var(--bg-glass-border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
        <div className="container">
          <p>© 2026 ShieldPay. Parametric Income Protection for Gig Workers. IRDAI Compliant.</p>
          <p style={{ marginTop: 8 }}>⚠️ Coverage is for loss of income only. Does not cover health, life, accidents, or vehicle repairs.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
