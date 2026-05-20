'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:#0a0a0f; color:#f0f0f8; font-family:'DM Sans',Arial,sans-serif; }
        a { color:inherit; text-decoration:none; }

        .pr-nav {
          position:sticky; top:0; z-index:100;
          display:flex; align-items:center; justify-content:space-between;
          padding:0 48px; height:68px;
          background:rgba(10,10,15,0.92); backdrop-filter:blur(16px);
          border-bottom:1px solid #2a2a3a;
        }
        .pr-logo { font-family:'Bebas Neue',sans-serif; font-size:24px; letter-spacing:2px; color:#e8ff47; }
        .pr-logo span { color:#f0f0f8; }
        .pr-nav-links { display:flex; gap:28px; font-size:14px; color:#7a7a9a; }
        .pr-nav-links a:hover { color:#f0f0f8; }
        .pr-btn { background:#e8ff47; color:#0a0a0f; padding:10px 22px; border-radius:8px; font-size:14px; font-weight:700; border:none; cursor:pointer; font-family:inherit; }

        .pr-hero { padding:100px 48px 60px; text-align:center; }
        .pr-tag { display:inline-block; background:rgba(232,255,71,0.08); border:1px solid rgba(232,255,71,0.2); color:#e8ff47; padding:4px 14px; border-radius:100px; font-size:12px; font-weight:700; letter-spacing:1px; text-transform:uppercase; margin-bottom:20px; }
        .pr-h1 { font-family:'Bebas Neue',sans-serif; font-size:clamp(48px,7vw,88px); letter-spacing:1px; line-height:0.95; margin-bottom:16px; }
        .pr-sub { font-size:17px; color:#7a7a9a; max-width:520px; margin:0 auto 36px; line-height:1.7; }

        .pr-toggle { display:flex; align-items:center; justify-content:center; gap:14px; margin-bottom:60px; }
        .pr-toggle-label { font-size:14px; font-weight:500; color:#7a7a9a; }
        .pr-toggle-label.active { color:#f0f0f8; }
        .pr-switch { width:48px; height:26px; background:#2a2a3a; border-radius:100px; position:relative; cursor:pointer; border:none; transition:background 0.2s; }
        .pr-switch.on { background:#e8ff47; }
        .pr-switch-knob { width:20px; height:20px; background:white; border-radius:50%; position:absolute; top:3px; left:3px; transition:transform 0.2s; }
        .pr-switch.on .pr-switch-knob { transform:translateX(22px); background:#0a0a0f; }
        .pr-save-badge { background:rgba(71,255,138,0.1); border:1px solid rgba(71,255,138,0.3); color:#47ff8a; font-size:11px; font-weight:700; padding:2px 10px; border-radius:100px; }

        .pr-wrap { max-width:1120px; margin:0 auto; padding:0 48px; }
        .pr-grid { display:grid; grid-template-columns:1fr 1.1fr 1fr; gap:20px; margin-bottom:80px; }

        .pr-card { background:#12121a; border:1px solid #2a2a3a; border-radius:20px; padding:36px; display:flex; flex-direction:column; position:relative; }
        .pr-card.featured { border-color:rgba(232,255,71,0.4); background:linear-gradient(160deg,rgba(232,255,71,0.06),rgba(232,255,71,0.02)); }
        .pr-card-badge { position:absolute; top:-14px; left:50%; transform:translateX(-50%); background:#e8ff47; color:#0a0a0f; font-size:11px; font-weight:800; padding:4px 16px; border-radius:100px; white-space:nowrap; letter-spacing:0.5px; }
        .pr-plan-name { font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:#7a7a9a; margin-bottom:12px; }
        .pr-price { font-family:'Bebas Neue',sans-serif; font-size:64px; letter-spacing:1px; line-height:1; color:#f0f0f8; margin-bottom:4px; }
        .pr-price span { font-size:20px; color:#7a7a9a; font-family:'DM Sans',sans-serif; font-weight:400; }
        .pr-price-note { font-size:13px; color:#7a7a9a; margin-bottom:8px; }
        .pr-credit-badge { display:inline-block; background:rgba(71,255,138,0.1); border:1px solid rgba(71,255,138,0.25); color:#47ff8a; font-size:12px; font-weight:600; padding:4px 12px; border-radius:6px; margin-bottom:20px; }
        .pr-divider { height:1px; background:#2a2a3a; margin:20px 0; }
        .pr-features { list-style:none; display:flex; flex-direction:column; gap:12px; margin-bottom:28px; flex:1; }
        .pr-feature { display:flex; gap:10px; align-items:flex-start; font-size:14px; }
        .pr-feature-icon { flex-shrink:0; margin-top:1px; }
        .pr-feature.muted { color:#7a7a9a; }
        .pr-feature.muted .pr-feature-icon { opacity:0.4; }
        .pr-cta { width:100%; padding:14px; border-radius:10px; font-size:15px; font-weight:700; cursor:pointer; font-family:inherit; border:none; transition:opacity 0.2s, transform 0.15s; display:block; text-align:center; }
        .pr-cta:hover { opacity:0.88; transform:translateY(-1px); }
        .pr-cta.primary { background:#e8ff47; color:#0a0a0f; }
        .pr-cta.ghost { background:transparent; border:1px solid #2a2a3a; color:#f0f0f8; }
        .pr-cta.ghost:hover { border-color:#e8ff47; }

        /* Photo pricing */
        .pr-photo-section { background:#12121a; border:1px solid #2a2a3a; border-radius:20px; padding:48px; margin-bottom:80px; }
        .pr-photo-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-top:32px; }
        .pr-photo-card { background:#0a0a0f; border:1px solid #2a2a3a; border-radius:12px; padding:20px; }
        .pr-photo-card h4 { font-size:14px; font-weight:700; margin-bottom:6px; }
        .pr-photo-card p { font-size:12px; color:#7a7a9a; line-height:1.5; margin-bottom:12px; }
        .pr-photo-price { font-family:'DM Mono',monospace; font-size:22px; color:#ff6b47; }
        .pr-photo-price small { font-size:12px; color:#7a7a9a; font-family:'DM Sans',sans-serif; }
        .pr-photo-net { font-size:12px; color:#47ff8a; margin-top:4px; }

        /* FAQ */
        .pr-faq { margin-bottom:80px; }
        .pr-faq h2 { font-family:'Bebas Neue',sans-serif; font-size:48px; letter-spacing:1px; margin-bottom:32px; }
        .pr-faq-item { border-bottom:1px solid #2a2a3a; padding:20px 0; cursor:pointer; }
        .pr-faq-q { display:flex; justify-content:space-between; align-items:center; font-size:15px; font-weight:600; }
        .pr-faq-a { font-size:14px; color:#7a7a9a; line-height:1.7; margin-top:12px; }

        /* CTA */
        .pr-cta-banner { background:linear-gradient(135deg,rgba(232,255,71,0.08),rgba(71,200,255,0.05)); border:1px solid rgba(232,255,71,0.15); border-radius:20px; padding:72px 48px; text-align:center; margin-bottom:80px; }
        .pr-cta-banner h2 { font-family:'Bebas Neue',sans-serif; font-size:clamp(36px,5vw,64px); letter-spacing:1px; margin-bottom:14px; }
        .pr-cta-banner p { font-size:16px; color:#7a7a9a; max-width:480px; margin:0 auto 32px; line-height:1.6; }
        .pr-cta-actions { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; }
        .pr-btn-hero { background:#e8ff47; color:#0a0a0f; padding:16px 36px; border-radius:10px; font-size:16px; font-weight:800; border:none; cursor:pointer; font-family:inherit; display:inline-block; transition:transform 0.15s, box-shadow 0.15s; }
        .pr-btn-hero:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(232,255,71,0.3); }
        .pr-btn-ghost2 { background:transparent; border:1px solid #2a2a3a; color:#f0f0f8; padding:16px 28px; border-radius:10px; font-size:16px; font-weight:600; display:inline-block; transition:border-color 0.2s; }
        .pr-btn-ghost2:hover { border-color:#f0f0f8; }

        .pr-footer { border-top:1px solid #2a2a3a; padding:32px 48px; display:flex; justify-content:space-between; font-size:13px; color:#7a7a9a; }

        @media(max-width:768px) {
          .pr-nav { padding:0 20px; }
          .pr-nav-links { display:none; }
          .pr-hero { padding:80px 20px 40px; }
          .pr-wrap { padding:0 20px; }
          .pr-grid, .pr-photo-grid { grid-template-columns:1fr; }
          .pr-photo-section { padding:28px 20px; }
          .pr-cta-banner { padding:48px 20px; }
          .pr-footer { padding:24px 20px; flex-direction:column; gap:8px; }
        }
      `}</style>

      {/* NAV */}
      <nav className="pr-nav">
        <Link href="/" className="pr-logo">Ground<span>View</span>™</Link>
        <div className="pr-nav-links">
          <Link href="/#services">Services</Link>
          <Link href="/#how">How It Works</Link>
          <Link href="/portal">Sign In</Link>
        </div>
        <Link href="/portal" className="pr-btn">Start Free Trial</Link>
      </nav>

      {/* HERO */}
      <div className="pr-hero">
        <div className="pr-tag">Pricing</div>
        <h1 className="pr-h1">Simple pricing.<br />Serious value.</h1>
        <p className="pr-sub">One membership unlocks everything. Your $10/month gets credited back toward photo orders — so your membership essentially pays for itself.</p>

        <div className="pr-toggle">
          <span className={`pr-toggle-label${!annual ? ' active' : ''}`}>Monthly</span>
          <button className={`pr-switch${annual ? ' on' : ''}`} onClick={() => setAnnual(a => !a)}>
            <div className="pr-switch-knob" />
          </button>
          <span className={`pr-toggle-label${annual ? ' active' : ''}`}>Annual</span>
          {annual && <span className="pr-save-badge">Save 20%</span>}
        </div>
      </div>

      {/* PLANS */}
      <div className="pr-wrap">
        <div className="pr-grid">

          {/* Free */}
          <div className="pr-card">
            <div className="pr-plan-name">Free</div>
            <div className="pr-price">$0</div>
            <div className="pr-price-note">Forever free</div>
            <div className="pr-divider" />
            <ul className="pr-features">
              <li className="pr-feature"><span className="pr-feature-icon">✅</span> Repair estimator — blurred results preview</li>
              <li className="pr-feature"><span className="pr-feature-icon">✅</span> AI photo editor — basic auto-fix only</li>
              <li className="pr-feature"><span className="pr-feature-icon">✅</span> View sample photo packages</li>
              <li className="pr-feature muted"><span className="pr-feature-icon">🔒</span> Full repair estimate breakdowns</li>
              <li className="pr-feature muted"><span className="pr-feature-icon">🔒</span> Full AI photo editor (all modes)</li>
              <li className="pr-feature muted"><span className="pr-feature-icon">🔒</span> Photo order placement</li>
              <li className="pr-feature muted"><span className="pr-feature-icon">🔒</span> Order dashboard & downloads</li>
              <li className="pr-feature muted"><span className="pr-feature-icon">🔒</span> $10 monthly photo credit</li>
            </ul>
            <Link href="/portal" className="pr-cta ghost">Create Free Account</Link>
          </div>

          {/* Member — FEATURED */}
          <div className="pr-card featured">
            <div className="pr-card-badge">⚡ MOST POPULAR</div>
            <div className="pr-plan-name">Member</div>
            <div className="pr-price">
              {annual ? '$8' : '$10'}<span>/mo</span>
            </div>
            <div className="pr-price-note">{annual ? 'Billed $96/year — save $24' : 'Billed monthly, cancel anytime'}</div>
            <div className="pr-credit-badge">💳 $10 photo credit included every month</div>
            <div className="pr-divider" />
            <ul className="pr-features">
              <li className="pr-feature"><span className="pr-feature-icon">✅</span> Everything in Free</li>
              <li className="pr-feature"><span className="pr-feature-icon">✅</span> <strong>Full repair estimates</strong> — complete line-item breakdown</li>
              <li className="pr-feature"><span className="pr-feature-icon">✅</span> <strong>Full AI photo editor</strong> — all 6 enhancement modes</li>
              <li className="pr-feature"><span className="pr-feature-icon">✅</span> <strong>Order photos</strong> on any property nationwide</li>
              <li className="pr-feature"><span className="pr-feature-icon">✅</span> Member dashboard — track all orders</li>
              <li className="pr-feature"><span className="pr-feature-icon">✅</span> Download photos as .zip</li>
              <li className="pr-feature"><span className="pr-feature-icon">✅</span> In-order messaging with our team</li>
              <li className="pr-feature"><span className="pr-feature-icon">✅</span> <strong>$10/mo credit</strong> applied to photo orders automatically</li>
            </ul>
            <Link href="/portal" className="pr-cta primary">Start 7-Day Free Trial →</Link>
            <p style={{ fontSize: 12, color: '#7a7a9a', textAlign: 'center', marginTop: 10 }}>No credit card required to start trial</p>
          </div>

          {/* Team */}
          <div className="pr-card">
            <div className="pr-plan-name">Team</div>
            <div className="pr-price">
              {annual ? '$32' : '$40'}<span>/mo</span>
            </div>
            <div className="pr-price-note">{annual ? 'Billed annually' : 'Up to 5 team members'}</div>
            <div className="pr-credit-badge" style={{ background: 'rgba(71,200,255,0.08)', borderColor: 'rgba(71,200,255,0.2)', color: '#47c8ff' }}>💳 $40 photo credit included every month</div>
            <div className="pr-divider" />
            <ul className="pr-features">
              <li className="pr-feature"><span className="pr-feature-icon">✅</span> Everything in Member</li>
              <li className="pr-feature"><span className="pr-feature-icon">✅</span> Up to 5 team member seats</li>
              <li className="pr-feature"><span className="pr-feature-icon">✅</span> Shared order dashboard</li>
              <li className="pr-feature"><span className="pr-feature-icon">✅</span> $40/mo photo credit (4x value)</li>
              <li className="pr-feature"><span className="pr-feature-icon">✅</span> Priority order queue</li>
              <li className="pr-feature"><span className="pr-feature-icon">✅</span> Admin controls + team reporting</li>
              <li className="pr-feature"><span className="pr-feature-icon">✅</span> Dedicated account support</li>
            </ul>
            <Link href="/portal" className="pr-cta ghost">Start Free Trial →</Link>
          </div>

        </div>

        {/* PHOTO ORDER PRICING */}
        <div className="pr-photo-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div className="pr-tag" style={{ marginBottom: 12 }}>📸 Photo Order Pricing</div>
              <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 40, letterSpacing: 1, marginBottom: 8 }}>Pay per order.<br />Credit applied automatically.</h2>
              <p style={{ color: '#7a7a9a', fontSize: 14, maxWidth: 480, lineHeight: 1.7 }}>
                Your $10 monthly credit is applied automatically at checkout. Members effectively pay $85 out of pocket on their first order every month.
              </p>
            </div>
            <div style={{ background: 'rgba(232,255,71,0.06)', border: '1px solid rgba(232,255,71,0.2)', borderRadius: 12, padding: '20px 24px', minWidth: 240 }}>
              <div style={{ fontSize: 12, color: '#e8ff47', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Member Math</div>
              <div style={{ fontSize: 14, color: '#7a7a9a', lineHeight: 2 }}>
                Membership: <span style={{ color: '#f0f0f8', fontFamily: 'monospace' }}>$10/mo</span><br />
                Photo credit: <span style={{ color: '#47ff8a', fontFamily: 'monospace' }}>−$10/mo</span><br />
                <div style={{ borderTop: '1px solid #2a2a3a', marginTop: 4, paddingTop: 4 }}>
                  Effective cost: <span style={{ color: '#e8ff47', fontFamily: 'monospace', fontWeight: 700 }}>$0/mo*</span>
                </div>
              </div>
              <p style={{ fontSize: 11, color: '#7a7a9a', marginTop: 8 }}>*When you order at least one photo set per month</p>
            </div>
          </div>

          <div className="pr-photo-grid">
            {[
              { icon: '🔒', name: 'Vacant with Lockbox', desc: 'Property accessible via lockbox. Provide the code at checkout.', price: '$95', net: '$85 after monthly credit', tag: null },
              { icon: '📅', name: 'Requires Appointment', desc: 'Scheduled access with homeowner or tenant as point of contact.', price: '$95', net: '$85 after monthly credit', tag: 'Most Common' },
              { icon: '🏘️', name: 'Multi-Family Add-on', desc: 'Duplex, triplex, or 4-unit properties. Base price + per-unit fee.', price: '+$20/unit', net: 'Added to base order price', tag: null },
            ].map(({ icon, name, desc, price, net, tag }) => (
              <div key={name} className="pr-photo-card" style={{ position: 'relative' }}>
                {tag && <div style={{ position: 'absolute', top: -10, right: 16, background: '#e8ff47', color: '#0a0a0f', fontSize: 10, fontWeight: 800, padding: '2px 10px', borderRadius: 100 }}>{tag}</div>}
                <div style={{ fontSize: 24, marginBottom: 10 }}>{icon}</div>
                <h4>{name}</h4>
                <p>{desc}</p>
                <div className="pr-photo-price">{price} <small>/ single family</small></div>
                <div className="pr-photo-net">✓ {net}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, padding: '16px 20px', background: 'rgba(71,200,255,0.05)', border: '1px solid rgba(71,200,255,0.15)', borderRadius: 10, fontSize: 13, color: '#7a7a9a', lineHeight: 1.6 }}>
            ⚡ <strong style={{ color: '#f0f0f8' }}>Speed upgrades available on every order:</strong> Standard delivery (included) · Priority 24-Hour (+$25) · 6-Hour Express (+$45). All rush services are weekday-only.
          </div>
        </div>

        {/* FAQ */}
        <div className="pr-faq">
          <h2>Common Questions</h2>
          {[
            { q: 'Does the $10 credit roll over if I don\'t use it?', a: 'Credits are applied to your account monthly and can be used on any photo order. Unused credits expire at the end of each billing cycle, so we recommend placing at least one order per month to get full value from your membership.' },
            { q: 'Can I cancel anytime?', a: 'Yes — cancel anytime from your account settings with no penalties or fees. Your membership and credit remain active until the end of your current billing period.' },
            { q: 'What happens after my 7-day free trial?', a: 'After your trial you\'ll be automatically moved to the $10/month Member plan. We\'ll send you a reminder before the trial ends. No credit card is required to start the trial.' },
            { q: 'How does the photo credit work at checkout?', a: 'Your $10 monthly credit is automatically deducted from your photo order total at checkout. No coupon codes needed — it just shows up as a credit on your order summary.' },
            { q: 'Can I order photos without a membership?', a: 'No — a membership is required to place photo orders. This allows us to maintain quality and ensure only verified members can dispatch our field agents to properties.' },
            { q: 'What areas do you cover?', a: 'We have active field agents in all 50 states. Coverage is deepest in major metro areas, but we can typically fulfill orders in suburban and rural markets as well. Standard delivery time is next business day for orders placed before 10 AM local time.' },
          ].map(({ q, a }) => <FaqItem key={q} q={q} a={a} />)}
        </div>

        {/* CTA */}
        <div className="pr-cta-banner">
          <div className="pr-tag" style={{ marginBottom: 16 }}>Get Started Today</div>
          <h2>7 days free.<br />Cancel anytime.</h2>
          <p>No credit card required. Start your free trial and place your first order — your $10 credit is waiting.</p>
          <div className="pr-cta-actions">
            <Link href="/portal" className="pr-btn-hero">Start Free Trial →</Link>
            <Link href="/#services" className="pr-btn-ghost2">See Services</Link>
          </div>
        </div>
      </div>

      <footer className="pr-footer">
        <Link href="/" style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: '#e8ff47', letterSpacing: 2 }}>Ground<span style={{ color: '#f0f0f8' }}>View</span>™</Link>
        <span>© {new Date().getFullYear()} GroundView™. All rights reserved.</span>
      </footer>
    </>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="pr-faq-item" onClick={() => setOpen(o => !o)}>
      <div className="pr-faq-q">
        <span>{q}</span>
        <span style={{ color: '#e8ff47', fontSize: 20, flexShrink: 0 }}>{open ? '−' : '+'}</span>
      </div>
      {open && <div className="pr-faq-a">{a}</div>}
    </div>
  );
}
