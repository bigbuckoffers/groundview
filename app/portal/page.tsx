'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

/* ─── Types ─── */
type AuthMode = 'login' | 'register';
type OrderType = 'lockbox' | 'appt';
type PropType = 'single' | 'duplex' | 'triplex' | 'fourplex';
type SpeedType = 'std' | 'rush' | 'rocket';
type OrderStatus = 'pending_payment' | 'assigned' | 'completed';

interface Order {
  id: string;
  address: string;
  type: OrderType;
  propType: PropType;
  speed: SpeedType;
  status: OrderStatus;
  price: number;
  date: string;
  repAccepted?: string;
}

interface Message { from: 'us' | 'them' | 'system'; text: string; time: string; }

/* ─── Pricing ─── */
const BASE = 95;
const PROP_ADDON: Record<PropType, number> = { single: 0, duplex: 20, triplex: 40, fourplex: 60 };
const SPEED_ADDON: Record<SpeedType, number> = { std: 0, rush: 25, rocket: 45 };
const PROP_LABELS: Record<PropType, string> = { single: 'Single Family', duplex: 'Duplex', triplex: 'Triplex', fourplex: '4-Unit' };
const SPEED_LABELS: Record<SpeedType, string> = { std: 'Standard Delivery', rush: 'Priority 24-Hour', rocket: '6-Hour Express' };
const DELIVERY_LABELS: Record<SpeedType, string> = { std: 'Next Business Day (before 10 AM)', rush: 'Within 24 Hours (weekdays)', rocket: 'Within 6 Hours (by 10 AM weekday)' };

/* ─── Demo orders ─── */
const DEMO_ORDERS: Order[] = [
  { id: 'GV-2026-0042', address: '6181 Miss Mary Ann, Haines City FL 33844', type: 'appt', propType: 'single', speed: 'rush', status: 'assigned', price: 120, date: 'May 19, 2026', repAccepted: 'Rep accepted at 11:53 AM — photos pending' },
  { id: 'GV-2026-0043', address: '815 Sendero Trail, Conroe TX 77304', type: 'lockbox', propType: 'single', speed: 'std', status: 'pending_payment', price: 95, date: 'May 19, 2026' },
  { id: 'GV-2026-0031', address: '144 W 41st St, Jacksonville FL 32206', type: 'appt', propType: 'single', speed: 'std', status: 'completed', price: 95, date: 'Apr 29, 2026' },
];

const DEMO_MESSAGES: Record<string, Message[]> = {
  'GV-2026-0031': [
    { from: 'system', text: 'Order created — Apr 29, 2026 at 9:02 AM', time: '' },
    { from: 'them', text: 'Your order has been received. A field agent is being assigned to your area.', time: '9:03 AM' },
    { from: 'system', text: 'Field agent assigned — Apr 29, 2026 at 10:17 AM', time: '' },
    { from: 'them', text: 'Great news — a field agent has accepted your order and is headed to the property.', time: '10:18 AM' },
    { from: 'system', text: 'Order completed — photos delivered', time: '' },
  ],
  'GV-2026-0042': [
    { from: 'system', text: 'Order created — May 19, 2026 at 10:14 AM', time: '' },
    { from: 'them', text: 'Your order is in the queue. A field agent has been assigned and accepted the job at 11:53 AM. Photos are pending completion.', time: '11:54 AM' },
  ],
};

export default function PortalPage() {
  /* Auth */
  const [authed, setAuthed] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [firstName, setFirstName] = useState('');
  const [authError, setAuthError] = useState('');

  /* Nav */
  const [page, setPage] = useState<'dashboard' | 'new-order' | 'orders'>('dashboard');

  /* Order wizard */
  const [step, setStep] = useState(1);
  const [orderType, setOrderType] = useState<OrderType>('lockbox');
  const [propType, setPropType] = useState<PropType>('single');
  const [speed, setSpeed] = useState<SpeedType>('std');
  const [lockboxCode, setLockboxCode] = useState('');
  const [pocFirst, setPocFirst] = useState('');
  const [pocLast, setPocLast] = useState('');
  const [pocPhone, setPocPhone] = useState('');
  const [pocRelationship, setPocRelationship] = useState('');
  const [gated, setGated] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateAbbr, setStateAbbr] = useState('');
  const [zip, setZip] = useState('');
  const [addrStatus, setAddrStatus] = useState<'idle' | 'ok' | 'warn'>('idle');
  const [comments, setComments] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [termsChecked, setTermsChecked] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [newOrderId, setNewOrderId] = useState('');
  const addrTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Orders */
  const [orders, setOrders] = useState<Order[]>(DEMO_ORDERS);
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');
  const [msgOrderId, setMsgOrderId] = useState<string | null>(null);
  const [msgThreads, setMsgThreads] = useState<Record<string, Message[]>>(DEMO_MESSAGES);
  const [msgInput, setMsgInput] = useState('');

  /* Notification */
  const [notif, setNotif] = useState('');
  const notifTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function toast(msg: string) {
    setNotif(msg);
    if (notifTimer.current) clearTimeout(notifTimer.current);
    notifTimer.current = setTimeout(() => setNotif(''), 3500);
  }

  /* ─── AUTH ─── */
  function doLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = (fd.get('email') as string).trim();
    const pass = fd.get('pass') as string;
    if (!email || !pass) { setAuthError('Please fill in all fields.'); return; }
    setFirstName(email.split('@')[0]);
    setAuthed(true);
  }

  function doRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const first = (fd.get('first') as string).trim();
    const pass = fd.get('pass') as string;
    if (!first || !pass) { setAuthError('Please fill in all required fields.'); return; }
    if (pass.length < 8) { setAuthError('Password must be at least 8 characters.'); return; }
    setFirstName(first);
    setAuthed(true);
  }

  /* ─── WIZARD ─── */
  function goStep(n: number) {
    if (n > 1 && orderType === 'appt' && (!pocFirst.trim() || !pocLast.trim() || !pocPhone.trim())) {
      toast('Please enter the point of contact\'s name and phone number before continuing.');
      return;
    }
    if (n > 2 && (!street.trim() || !city.trim())) {
      toast('Please enter the property address before continuing.');
      setPage('new-order');
      setStep(2);
      return;
    }
    setStep(n);
    window.scrollTo(0, 0);
  }

  function triggerAddrLookup() {
    if (addrTimer.current) clearTimeout(addrTimer.current);
    addrTimer.current = setTimeout(() => {
      if (street.trim() && city.trim()) setAddrStatus('ok');
    }, 700);
  }

  const totalPrice = BASE + PROP_ADDON[propType] + SPEED_ADDON[speed];

  function placeOrder() {
    if (!termsChecked) { toast('Please agree to the order terms before placing your order.'); return; }
    const id = `GV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    setNewOrderId(id);
    const newOrder: Order = {
      id, address: `${street}, ${city} ${stateAbbr} ${zip}`.trim(),
      type: orderType, propType, speed, status: 'pending_payment',
      price: totalPrice, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    setOrders(prev => [newOrder, ...prev]);
    setOrderPlaced(true);
  }

  function resetWizard() {
    setStep(1); setOrderType('lockbox'); setPropType('single'); setSpeed('std');
    setLockboxCode(''); setPocFirst(''); setPocLast(''); setPocPhone(''); setPocRelationship(''); setGated(false); setStreet(''); setCity(''); setStateAbbr('');
    setZip(''); setAddrStatus('idle'); setComments(''); setAttachments([]);
    setTermsChecked(false); setOrderPlaced(false); setNewOrderId('');
  }

  /* ─── MESSAGES ─── */
  function sendMsg() {
    if (!msgInput.trim() || !msgOrderId) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: Message = { from: 'us', text: msgInput.trim(), time };
    setMsgThreads(prev => ({
      ...prev,
      [msgOrderId]: [...(prev[msgOrderId] || []), newMsg],
    }));
    setMsgInput('');
    setTimeout(() => {
      const reply: Message = { from: 'them', text: 'Thanks for your message — our team will follow up shortly.', time };
      setMsgThreads(prev => ({
        ...prev,
        [msgOrderId!]: [...(prev[msgOrderId!] || []), reply],
      }));
    }, 1200);
  }

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const pendingCount = orders.filter(o => o.status === 'pending_payment').length;
  const msgOrder = orders.find(o => o.id === msgOrderId);

  /* ══════════════════════════════════
     AUTH SCREEN
  ══════════════════════════════════ */
  if (!authed) return (
    <main style={s.authBg}>
      <div style={s.authCard}>
        <div style={s.logo}>Ground<span style={{ color: 'var(--text)' }}>View</span>™</div>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 28 }}>Member Portal — Field Photography Services</p>

        <div style={s.tabs}>
          <button style={{ ...s.tab, ...(authMode === 'login' ? s.tabActive : {}) }} onClick={() => { setAuthMode('login'); setAuthError(''); }}>Sign In</button>
          <button style={{ ...s.tab, ...(authMode === 'register' ? s.tabActive : {}) }} onClick={() => { setAuthMode('register'); setAuthError(''); }}>Create Account</button>
        </div>

        {authError && <div style={s.authError}>{authError}</div>}

        {authMode === 'login' ? (
          <form onSubmit={doLogin}>
            <label style={s.label}>Email</label>
            <input name="email" type="email" placeholder="you@example.com" style={s.input} className="input" />
            <label style={s.label}>Password</label>
            <input name="pass" type="password" placeholder="••••••••" style={s.input} className="input" />
            <button type="submit" style={s.btnPrimary} className="btn">Sign In →</button>
            <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13, marginTop: 16 }}>
              No account? <button type="button" style={s.linkBtn} onClick={() => setAuthMode('register')}>Create one free</button>
            </p>
          </form>
        ) : (
          <form onSubmit={doRegister}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={s.label}>First Name *</label><input name="first" placeholder="John" style={s.input} className="input" /></div>
              <div><label style={s.label}>Last Name</label><input name="last" placeholder="Smith" style={s.input} className="input" /></div>
            </div>
            <label style={s.label}>Email *</label>
            <input name="email" type="email" placeholder="you@example.com" style={s.input} className="input" />
            <label style={s.label}>Company <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(optional)</span></label>
            <input name="company" placeholder="Your LLC" style={s.input} className="input" />
            <label style={s.label}>Phone</label>
            <input name="phone" type="tel" placeholder="(555) 000-0000" style={s.input} className="input" />
            <label style={s.label}>Password * <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(min 8 chars)</span></label>
            <input name="pass" type="password" placeholder="••••••••" style={s.input} className="input" />
            <button type="submit" style={s.btnPrimary} className="btn">Create Account →</button>
            <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13, marginTop: 16 }}>
              Already have an account? <button type="button" style={s.linkBtn} onClick={() => setAuthMode('login')}>Sign in</button>
            </p>
          </form>
        )}
      </div>
    </main>
  );

  /* ══════════════════════════════════
     APP SHELL
  ══════════════════════════════════ */
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── TOP NAV ── */}
      <nav style={s.appNav}>
        <div style={s.logo}>Ground<span style={{ color: 'var(--text)' }}>View</span>™</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['dashboard', 'new-order', 'orders'] as const).map(p => (
            <button key={p} style={{ ...s.navBtn, ...(page === p ? s.navBtnActive : {}) }} onClick={() => { setPage(p); if (p === 'new-order') resetWizard(); }}>
              {p === 'dashboard' ? '🏠 Dashboard' : p === 'new-order' ? '📸 New Order' : `📋 Orders${pendingCount > 0 ? ` (${pendingCount})` : ''}`}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={s.avatar}>{firstName[0]?.toUpperCase() || 'U'}</div>
          <span style={{ fontSize: 14 }}>{firstName}</span>
          <button style={s.btnLogout} onClick={() => setAuthed(false)}>Logout</button>
        </div>
      </nav>

      <div style={s.mainWrap}>

        {/* ══ DASHBOARD ══ */}
        {page === 'dashboard' && (
          <div>
            <div style={s.pageHeader}>
              <h1 style={s.pageH1}>Welcome back, {firstName} 👋</h1>
              <p style={{ color: 'var(--muted)' }}>Here's an overview of your GroundView™ activity</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
              {[
                { num: orders.length, label: 'Total Orders', color: 'var(--accent)' },
                { num: orders.filter(o => o.status === 'assigned').length, label: 'In Progress', color: 'var(--accent2)' },
                { num: orders.filter(o => o.status === 'completed').length, label: 'Completed', color: '#47ff8a' },
                { num: pendingCount, label: 'Awaiting Payment', color: 'var(--accent3)' },
              ].map(({ num, label, color }) => (
                <div key={label} style={s.statCard}>
                  <div style={{ fontFamily: 'Georgia,serif', fontSize: 40, color, fontWeight: 900 }}>{num}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={s.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0 }}>Recent Orders</h3>
                <button style={s.btnAccent} className="btn" onClick={() => { setPage('new-order'); resetWizard(); }}>+ New Order</button>
              </div>
              {orders.slice(0, 5).map(o => <OrderRow key={o.id} order={o} onMsg={() => setMsgOrderId(o.id)} onDetail={() => toast('Full order detail view coming soon.')} onDownload={() => toast('Preparing your photo package for download…')} />)}
            </div>
          </div>
        )}

        {/* ══ NEW ORDER ══ */}
        {page === 'new-order' && (
          <div style={{ maxWidth: 760 }}>
            <div style={s.pageHeader}>
              <h1 style={s.pageH1}>Place New Order</h1>
              <p style={{ color: 'var(--muted)' }}>Field photography dispatched to your property — delivered fast.</p>
            </div>

            {/* Progress bubbles */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 36 }}>
              {[1, 2, 3, 4, 5].map((n, i) => (
                <>
                  <div key={n} style={{ textAlign: 'center' }}>
                    <div style={{ ...s.bubble, ...(step === n ? s.bubbleActive : step > n ? s.bubbleDone : {}) }}>
                      {step > n ? '✓' : n}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4, whiteSpace: 'nowrap' }}>
                      {['Order Type', 'Property', 'Speed', 'Details', 'Review'][i]}
                    </div>
                  </div>
                  {n < 5 && <div style={{ ...s.connector, ...(step > n ? s.connectorDone : {}) }} />}
                </>
              ))}
            </div>

            {orderPlaced ? (
              /* Success */
              <div style={{ ...s.card, textAlign: 'center', padding: 60 }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
                <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 36, margin: '0 0 8px' }}>Order Placed!</h2>
                <div style={{ display: 'inline-block', fontFamily: 'monospace', fontSize: 16, background: 'var(--surface2)', border: '1px solid var(--border)', padding: '8px 18px', borderRadius: 8, color: 'var(--accent)', margin: '8px 0 20px' }}>{newOrderId}</div>
                <p style={{ color: 'var(--muted)', maxWidth: 420, margin: '0 auto 28px', lineHeight: 1.6 }}>Your order has been received. Once payment is processed, your field agent will be dispatched and you'll receive status updates here.</p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <button style={s.btnAccent} className="btn" onClick={() => setPage('orders')}>View My Orders</button>
                  <button style={s.btnGhost} onClick={resetWizard}>Place Another Order</button>
                </div>
              </div>
            ) : (
              <>
                {/* ─ STEP 1 ─ */}
                {step === 1 && (
                  <>
                    <Section icon="📸" title="Choose Your Order Type">
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                        {([
                          { type: 'lockbox' as OrderType, icon: '🔒', sub: 'VACANT WITH LOCKBOX', desc: 'Property is vacant and accessible via lockbox. Our field agent will access the property using the code you provide.' },
                          { type: 'appt' as OrderType, icon: '📅', sub: 'REQUIRES APPOINTMENT', desc: 'Property requires a scheduled appointment. A point of contact must be available to grant access.' },
                        ]).map(({ type, icon, sub, desc }) => (
                          <div key={type} onClick={() => setOrderType(type)} style={{ ...s.typeCard, ...(orderType === type ? s.typeCardSelected : {}) }}>
                            {orderType === type && <div style={s.checkBadge}>✓</div>}
                            <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
                            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Interior/Exterior Photos</div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: type === 'lockbox' ? 'var(--accent2)' : 'var(--accent)', marginBottom: 8 }}>{sub}</div>
                            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14, lineHeight: 1.5 }}>{desc}</div>
                            <div style={{ fontFamily: 'monospace', fontSize: 22, color: 'var(--accent3)' }}>$95<span style={{ fontSize: 12, color: 'var(--muted)' }}>/single family</span></div>
                          </div>
                        ))}
                      </div>

                      {orderType === 'lockbox' && (
                        <div style={s.infoBox}>
                          <label style={s.label}>Lockbox Access Code</label>
                          <input value={lockboxCode} onChange={e => setLockboxCode(e.target.value)} placeholder="Enter lockbox code (e.g. 1234)" style={s.input} className="input" />
                          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, lineHeight: 1.6 }}>
                            If the property requires a lockbox code for entry, enter it here. <strong style={{ color: 'var(--warning, #ffbb47)' }}>Please note:</strong> Very few of our field agents have Supra key access. If your lockbox is a Supra or SentriLock device, please note this in the comments section and we'll do our best to accommodate.
                          </p>
                        </div>
                      )}


                      {orderType === 'appt' && (
                        <div style={{ ...s.infoBox, borderColor: 'rgba(232,255,71,0.25)', background: 'rgba(232,255,71,0.04)', marginTop: 16 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <span style={{ fontSize: 18 }}>👤</span>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 14 }}>Point of Contact Required</div>
                              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                                This must be the homeowner or tenant who will be present at the property — <strong style={{ color: 'var(--accent)' }}>not you.</strong> Our field agent will contact this person directly to schedule and confirm access. We will not call you to coordinate the appointment.
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                              <label style={s.label}>First Name *</label>
                              <input value={pocFirst} onChange={e => setPocFirst(e.target.value)} placeholder="e.g. Maria" style={s.input} className="input" />
                            </div>
                            <div>
                              <label style={s.label}>Last Name *</label>
                              <input value={pocLast} onChange={e => setPocLast(e.target.value)} placeholder="e.g. Johnson" style={s.input} className="input" />
                            </div>
                          </div>
                          <label style={s.label}>Direct Phone Number *</label>
                          <input value={pocPhone} onChange={e => setPocPhone(e.target.value)} placeholder="(555) 000-0000" type="tel" style={s.input} className="input" />
                          <label style={s.label}>Their Relationship to the Property</label>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                            {['Homeowner', 'Tenant / Renter', 'Property Manager', 'Caretaker', 'Other'].map(r => (
                              <button key={r} type="button" onClick={() => setPocRelationship(r)}
                                style={{ ...s.pillBtn, ...(pocRelationship === r ? s.pillBtnActive : {}), fontSize: 12, padding: '6px 12px' }}>
                                {r}
                              </button>
                            ))}
                          </div>
                          <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 10, lineHeight: 1.6 }}>
                            ⚠️ Please ensure this person is aware of the appointment and is prepared to grant access. If our field agent cannot reach the point of contact or is denied entry, the order may be canceled and a cancellation fee will apply.
                          </p>
                        </div>
                      )}

                      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '20px 0' }} />
                      <label style={s.label}>Property Type</label>
                      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>Duplex, multi-family, and additional units carry a +$20 per unit fee.</p>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {(['single', 'duplex', 'triplex', 'fourplex'] as PropType[]).map(pt => (
                          <button key={pt} onClick={() => setPropType(pt)}
                            style={{ ...s.pillBtn, ...(propType === pt ? s.pillBtnActive : {}) }}>
                            {PROP_LABELS[pt]} — ${BASE + PROP_ADDON[pt]}
                          </button>
                        ))}
                      </div>
                    </Section>

                    <Section icon="✅" title="What's Included in Every Order">
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        <div>
                          <h4 style={{ color: 'var(--accent2)', fontSize: 13, marginBottom: 10 }}>🏡 Exterior Coverage</h4>
                          <ul style={s.inclList}>
                            {['Front of home — straight-on shot', 'Rear of home', 'Left and right sides', 'Left and right 45° angled views', 'Backyard area', 'Street scenes — left and right', 'Address verification (mailbox or signage)', 'Street name sign', 'Any visible damage', 'Where present: A/C unit, pool, patio, deck, lanai, shed, hot tub'].map(i => <li key={i} style={s.inclItem}><span style={{ color: 'var(--accent)', flexShrink: 0 }}>→</span>{i}</li>)}
                          </ul>
                        </div>
                        <div>
                          <h4 style={{ color: 'var(--accent2)', fontSize: 13, marginBottom: 10 }}>🛋️ Interior Coverage</h4>
                          <ul style={s.inclList}>
                            {['All bedrooms', 'All bathrooms', 'Kitchen & appliances', 'Dining room or dining area', 'All remaining rooms', 'Garage (if applicable)', 'Any visible damage', 'Where accessible: air handler, furnace/boiler, water heater, electrical panel'].map(i => <li key={i} style={s.inclItem}><span style={{ color: 'var(--accent)', flexShrink: 0 }}>→</span>{i}</li>)}
                          </ul>
                        </div>
                      </div>
                      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '20px 0' }} />
                      <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }} onClick={() => setGated(g => !g)}>
                        <div style={{ width: 42, height: 24, borderRadius: 100, background: gated ? 'var(--accent)' : 'var(--border)', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
                          <div style={{ width: 18, height: 18, background: '#fff', borderRadius: '50%', position: 'absolute', top: 3, left: 3, transition: 'transform .2s', transform: gated ? 'translateX(18px)' : 'none' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>Gated or Guarded Community?</div>
                          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Enable if the property is behind a gate or guard station</div>
                        </div>
                      </div>
                      {gated && (
                        <div style={{ ...s.infoBox, marginTop: 14, borderColor: 'rgba(255,187,71,0.3)', background: 'rgba(255,187,71,0.05)' }}>
                          <strong style={{ color: '#ffbb47' }}>⚠️ Important:</strong> If the property is in a gated or guarded community, please leave the gate access code in the comments section. Our field agents will not make phone calls to gain entry for exterior orders.
                          <br /><br />
                          If access cannot be obtained, your order will still be fulfilled with: a photo of the closed gate, the community entrance sign, adjacent street scenes (left and right), the nearest street sign, and up to 3 additional community area images.
                        </div>
                      )}
                    </Section>

                    <div style={s.wizNav}>
                      <div />
                      <button style={s.btnAccent} className="btn" onClick={() => goStep(2)}>Continue: Property Address →</button>
                    </div>
                  </>
                )}

                {/* ─ STEP 2 ─ */}
                {step === 2 && (
                  <>
                    <Section icon="📍" title="Property Address">
                      <label style={s.label}>Street Address *</label>
                      <input value={street} onChange={e => { setStreet(e.target.value); setAddrStatus('idle'); triggerAddrLookup(); }} placeholder="123 Main Street" style={s.input} className="input" />
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
                        <div><label style={s.label}>City *</label><input value={city} onChange={e => { setCity(e.target.value); triggerAddrLookup(); }} placeholder="Dallas" style={s.input} className="input" /></div>
                        <div><label style={s.label}>State</label><input value={stateAbbr} onChange={e => setStateAbbr(e.target.value)} placeholder="TX" maxLength={2} style={s.input} className="input" /></div>
                        <div><label style={s.label}>ZIP</label><input value={zip} onChange={e => setZip(e.target.value)} placeholder="75201" style={s.input} className="input" /></div>
                      </div>
                      {addrStatus === 'ok' && (
                        <div style={{ ...s.alertOk, marginTop: 12 }}>✅ Address verified — field coverage confirmed for {street}, {city} {stateAbbr}</div>
                      )}
                      <div style={{ marginTop: 14, ...s.infoBox }}>
                        📍 <strong>Address Verification:</strong> We use Google Maps to confirm property addresses and time zones. If we can't find an exact match, we'll show you the closest result and let you decide how to proceed. If only a street name is entered without a specific number, your order will include street scenes and signage only.
                      </div>
                    </Section>
                    <div style={s.wizNav}>
                      <button style={s.btnGhost} onClick={() => goStep(1)}>← Back</button>
                      <button style={s.btnAccent} className="btn" onClick={() => goStep(3)}>Continue: Service Speed →</button>
                    </div>
                  </>
                )}

                {/* ─ STEP 3 ─ */}
                {step === 3 && (
                  <>
                    <Section icon="⚡" title="Delivery Speed">
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                        {([
                          { type: 'std' as SpeedType, badge: '✅ STANDARD', badgeColor: '#47ff8a', name: 'Standard Delivery', desc: 'Orders submitted before 10:00 AM in the property\'s local time zone are fulfilled by the next business day. Completion time is not guaranteed to the hour.', addon: 0 },
                          { type: 'rush' as SpeedType, badge: '⚡ RUSH', badgeColor: '#ffbb47', name: 'Priority 24-Hour', desc: 'Weekday rush service. If your order is placed on a weekend or holiday, processing begins the next business day at 12:00 AM.', addon: 25 },
                          { type: 'rocket' as SpeedType, badge: '🚀 EXPRESS', badgeColor: 'var(--accent3)', name: '6-Hour Express', desc: 'Must be placed by 10:00 AM in the property\'s local time zone on a weekday. Late orders will be prioritized at our highest level.', addon: 45 },
                        ]).map(({ type, badge, badgeColor, name, desc, addon }) => (
                          <div key={type} onClick={() => setSpeed(type)} style={{ ...s.typeCard, ...(speed === type ? s.typeCardSelected : {}), textAlign: 'center' }}>
                            {speed === type && <div style={s.checkBadge}>✓</div>}
                            <div style={{ fontSize: 11, fontWeight: 700, color: badgeColor, marginBottom: 10, padding: '2px 8px', border: `1px solid ${badgeColor}`, borderRadius: 100, display: 'inline-block' }}>{badge}</div>
                            <div style={{ fontWeight: 700, marginBottom: 6 }}>{name}</div>
                            <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 10 }}>{desc}</div>
                            <div style={{ fontFamily: 'monospace', color: 'var(--accent3)' }}>{addon === 0 ? 'Included' : `+$${addon}.00`}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ ...s.infoBox, marginTop: 16, borderColor: 'rgba(255,187,71,0.25)', background: 'rgba(255,187,71,0.05)' }}>
                        ⏱️ <strong>Delivery clock starts after payment is processed.</strong> Rush and Express are weekday-only. Weekend/holiday orders begin processing the next business day.
                      </div>
                    </Section>
                    <div style={s.wizNav}>
                      <button style={s.btnGhost} onClick={() => goStep(2)}>← Back</button>
                      <button style={s.btnAccent} className="btn" onClick={() => goStep(4)}>Continue: Order Details →</button>
                    </div>
                  </>
                )}

                {/* ─ STEP 4 ─ */}
                {step === 4 && (
                  <>
                    <Section icon="💬" title="Comments for Field Agent" right="Optional">
                      <textarea value={comments} onChange={e => setComments(e.target.value)} placeholder="Provide any access details, directions, or special instructions for our field agent..." style={{ ...s.input, minHeight: 100, resize: 'vertical' }} className="textarea" />
                      <div style={{ ...s.infoBox, marginTop: 12, borderColor: 'rgba(255,187,71,0.25)', background: 'rgba(255,187,71,0.05)' }}>
                        <strong style={{ color: '#ffbb47' }}>⚠️ Please read:</strong> Any text entered here is reviewed by our team before the order is dispatched — <strong>this will delay your order.</strong> Use this section for access details, point of contact info (name and phone only), or directions to hard-to-find properties.
                        <br /><br />
                        Please do not include your own name, email, or phone — we already have your info on file. Avoid ALL CAPS or excessive punctuation. Comments are for guidance only; orders cannot be altered once a field agent is assigned.
                      </div>
                    </Section>
                    <Section icon="📎" title="File Attachments" right="Optional — Max 3 files">
                      <label style={{ ...s.uploadZone, display: 'block', cursor: 'pointer', position: 'relative' }}>
                        <input type="file" accept=".pdf,.doc,.docx" multiple style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                          onChange={e => {
                            const files = Array.from(e.target.files || []).slice(0, 3 - attachments.length);
                            setAttachments(prev => [...prev, ...files]);
                          }} />
                        <p style={{ color: 'var(--muted)', margin: 0 }}>📄 Drag files here or click to browse</p>
                        <small style={{ color: 'var(--muted)', fontSize: 11 }}>PDF or Word documents only. For occupancy notices or rural property maps. Tax records will not be accepted.</small>
                      </label>
                      {attachments.map((f, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg)', borderRadius: 6, marginTop: 8, fontSize: 13 }}>
                          <span>📄 {f.name}</span>
                          <button onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))} style={{ color: 'var(--accent3)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Remove</button>
                        </div>
                      ))}
                    </Section>
                    <div style={s.wizNav}>
                      <button style={s.btnGhost} onClick={() => goStep(3)}>← Back</button>
                      <button style={s.btnAccent} className="btn" onClick={() => goStep(5)}>Continue: Review Order →</button>
                    </div>
                  </>
                )}

                {/* ─ STEP 5 ─ */}
                {step === 5 && (
                  <>
                    <Section icon="🔍" title="Review Your Order">
                      <div style={{ background: 'rgba(71,255,138,0.06)', border: '1px solid rgba(71,255,138,0.2)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: '#47ff8a', fontSize: 13, display: 'flex', gap: 10 }}>
                        <span>📍</span><span>We've located a verified field agent near the subject property, ready to be dispatched upon payment.</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                        {[
                          ['Order Type', orderType === 'lockbox' ? 'Interior/Exterior – Vacant with Lockbox' : 'Interior/Exterior – Requires Appointment'],
                          ['Property Type', PROP_LABELS[propType]],
                          ['Property Address', `${street}, ${city} ${stateAbbr} ${zip}`.trim() || '—'],
                          ['Service Speed', SPEED_LABELS[speed]],
                          ['Photo Size', '800×600'],
                          ['Expected Delivery', DELIVERY_LABELS[speed]],
                        ].map(([label, value]) => (
                          <div key={label}>
                            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{label}</div>
                            <div style={{ fontSize: 14, fontWeight: 500 }}>{value}</div>
                          </div>
                        ))}
                      </div>

                      {orderType === 'appt' && pocFirst && (
                        <div style={{ background: 'rgba(232,255,71,0.04)', border: '1px solid rgba(232,255,71,0.2)', borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>👤 Point of Contact</div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, fontSize: 13 }}>
                            <div><div style={{ color: 'var(--muted)', fontSize: 11, marginBottom: 2 }}>NAME</div><div style={{ fontWeight: 600 }}>{pocFirst} {pocLast}</div></div>
                            <div><div style={{ color: 'var(--muted)', fontSize: 11, marginBottom: 2 }}>PHONE</div><div style={{ fontWeight: 600 }}>{pocPhone}</div></div>
                            <div><div style={{ color: 'var(--muted)', fontSize: 11, marginBottom: 2 }}>RELATIONSHIP</div><div style={{ fontWeight: 600 }}>{pocRelationship || '—'}</div></div>
                          </div>
                        </div>
                      )}

                      <div style={{ background: 'var(--bg)', borderRadius: 8, padding: 16, marginBottom: 20 }}>
                        {[
                          ['Interior/Exterior Photos', `$${BASE}.00`, true],
                          ...(PROP_ADDON[propType] > 0 ? [[`${PROP_LABELS[propType]} surcharge`, `+$${PROP_ADDON[propType]}.00`, true]] : []),
                          ...(SPEED_ADDON[speed] > 0 ? [[`${SPEED_LABELS[speed]} upgrade`, `+$${SPEED_ADDON[speed]}.00`, true]] : []),
                        ].map(([label, price]) => (
                          <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                            <span>{label}</span><span style={{ fontFamily: 'monospace' }}>{price}</span>
                          </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 6px', fontSize: 16, fontWeight: 700, color: 'var(--accent3)' }}>
                          <span>Total</span><span style={{ fontFamily: 'monospace' }}>${totalPrice}.00</span>
                        </div>
                      </div>

                      <div style={{ ...s.infoBox, maxHeight: 160, overflowY: 'auto', fontSize: 12, lineHeight: 1.7, marginBottom: 16 }}>
                        <strong>Order Terms & Conditions</strong><br /><br />
                        By placing an order you agree to pay for services per our service agreement. If you are unsatisfied with the photos, you have <strong>7 days from delivery</strong> to open a dispute in your message center. After 7 days, the order is considered complete and the transaction is final.<br /><br />
                        Once a field agent accepts your order, it <strong>cannot be canceled</strong>. Standard orders placed before 10:00 AM in the property's local time zone are fulfilled by the next business day (Mon–Fri, excluding holidays). Specific delivery times are not guaranteed. Inclement weather may cause delays.<br /><br />
                        For safety and legal reasons, all exterior photography is taken from <strong>public property only</strong>. Our agents will not enter private roads or private property for exterior orders. If a resident becomes hostile, the agent will reschedule. If threatened, the order will be canceled for their safety.<br /><br />
                        <strong>Multi-Unit Note:</strong> By placing this order you confirm the property type selected above. If additional units are found on arrival, a <strong>$20 surcharge per additional unit</strong> will be applied. A <strong>$0.50 processing fee</strong> applies to canceled orders.
                      </div>

                      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, cursor: 'pointer', marginBottom: 24 }}>
                        <input type="checkbox" checked={termsChecked} onChange={e => setTermsChecked(e.target.checked)} style={{ marginTop: 3, accentColor: 'var(--accent)' }} />
                        I have read and agree to the order terms. I confirm the property address is accurate and the property type is correctly selected.
                      </label>

                      <button onClick={placeOrder} style={{ ...s.btnAccent, background: 'var(--accent3)', color: '#fff', width: '100%', padding: '14px' }} className="btn">
                        🔒 Place Order & Proceed to Payment →
                      </button>
                    </Section>
                    <div style={s.wizNav}>
                      <button style={s.btnGhost} onClick={() => goStep(4)}>← Back</button>
                      <div />
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* ══ ORDERS ══ */}
        {page === 'orders' && (
          <div>
            <div style={s.pageHeader}>
              <h1 style={s.pageH1}>My Orders</h1>
              <p style={{ color: 'var(--muted)' }}>Track, message, and download your field photography orders</p>
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              <input placeholder="🔍 Search by address..." style={{ ...s.input, flex: 1, minWidth: 200 }} className="input" />
              {(['all', 'pending_payment', 'assigned', 'completed'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{ ...s.pillBtn, ...(filter === f ? s.pillBtnActive : {}) }}>
                  {f === 'all' ? 'All' : f === 'pending_payment' ? '⏳ Awaiting Payment' : f === 'assigned' ? '🔵 In Progress' : '✅ Completed'}
                </button>
              ))}
            </div>
            <div style={s.card}>
              {filteredOrders.length === 0
                ? <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>No orders found.</div>
                : filteredOrders.map(o => (
                  <OrderRow key={o.id} order={o}
                    onMsg={() => setMsgOrderId(o.id)}
                    onDetail={() => toast('Full order detail view coming soon.')}
                    onDownload={() => toast('Preparing your photo package for download…')}
                  />
                ))}
            </div>
          </div>
        )}

      </div>{/* end mainWrap */}

      {/* ══ MESSAGE PANEL ══ */}
      <div style={{ ...s.msgPanel, transform: msgOrderId ? 'translateX(0)' : 'translateX(100%)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: 15 }}>💬 Order Messages</h3>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{msgOrder?.address}</div>
          </div>
          <button onClick={() => setMsgOrderId(null)} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(msgThreads[msgOrderId || ''] || []).map((m, i) => (
            m.from === 'system'
              ? <div key={i} style={{ textAlign: 'center', fontSize: 11, color: 'var(--accent2)', background: 'rgba(71,200,255,0.08)', border: '1px solid rgba(71,200,255,0.2)', borderRadius: 100, padding: '4px 14px', alignSelf: 'center' }}>{m.text}</div>
              : <div key={i} style={{ maxWidth: '85%', alignSelf: m.from === 'us' ? 'flex-end' : 'flex-start', background: m.from === 'us' ? 'rgba(232,255,71,0.1)' : 'var(--surface2)', border: `1px solid ${m.from === 'us' ? 'rgba(232,255,71,0.2)' : 'var(--border)'}`, borderRadius: m.from === 'us' ? '12px 4px 12px 12px' : '4px 12px 12px 12px', padding: '10px 14px', fontSize: 13, lineHeight: 1.5 }}>
                {m.from === 'them' && <strong style={{ display: 'block', marginBottom: 4 }}>GroundView Support</strong>}
                {m.text}
                {m.time && <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>{m.time}</div>}
              </div>
          ))}
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
          <input value={msgInput} onChange={e => setMsgInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMsg()} placeholder="Type a message..." style={{ ...s.input, flex: 1, marginBottom: 0 }} className="input" />
          <button onClick={sendMsg} style={s.btnAccent} className="btn">Send</button>
        </div>
      </div>

      {/* ══ TOAST ══ */}
      {notif && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 18px', fontSize: 14, zIndex: 999, maxWidth: 340 }}>
          {notif}
        </div>
      )}
    </main>
  );
}

/* ─── Sub-components ─── */
function Section({ icon, title, right, children }: { icon: string; title: string; right?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 20, overflow: 'hidden' }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <h3 style={{ margin: 0, fontSize: 15 }}>{title}</h3>
        {right && <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--muted)' }}>{right}</span>}
      </div>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  );
}

function OrderRow({ order, onMsg, onDetail, onDownload }: { order: Order; onMsg: () => void; onDetail: () => void; onDownload: () => void }) {
  const statusMap = {
    pending_payment: { label: 'Awaiting Payment', color: '#ffbb47', bg: 'rgba(255,187,71,0.1)', border: 'rgba(255,187,71,0.25)' },
    assigned: { label: 'Rep Assigned', color: 'var(--accent2)', bg: 'rgba(71,200,255,0.1)', border: 'rgba(71,200,255,0.25)' },
    completed: { label: 'Completed', color: '#47ff8a', bg: 'rgba(71,255,138,0.1)', border: 'rgba(71,255,138,0.25)' },
  };
  const st = statusMap[order.status];
  return (
    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start' }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{order.address}</div>
        <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 100, marginBottom: 8, background: order.type === 'lockbox' ? 'rgba(71,200,255,0.1)' : 'rgba(232,255,71,0.08)', color: order.type === 'lockbox' ? 'var(--accent2)' : 'var(--accent)', border: `1px solid ${order.type === 'lockbox' ? 'rgba(71,200,255,0.2)' : 'rgba(232,255,71,0.2)'}` }}>
          {order.type === 'lockbox' ? 'Interior/Exterior – Vacant with Lockbox' : 'Interior/Exterior – Requires Appointment'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)', display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
          <span>{order.date}</span>
          <span>{SPEED_LABELS[order.speed]}</span>
          {order.repAccepted && <span style={{ color: 'var(--accent2)' }}>✓ {order.repAccepted}</span>}
          {order.status === 'pending_payment' && <span style={{ color: '#ffbb47' }}>⚠️ Requires payment — order dispatches after checkout</span>}
          {order.status === 'completed' && <span style={{ color: '#47ff8a' }}>✓ Completed — photos ready</span>}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {order.status === 'pending_payment' && <button onClick={() => {}} style={s.btnSm} className="btn" >💳 Pay Now</button>}
          {order.status === 'completed' && <button onClick={onDownload} style={{ ...s.btnSm, borderColor: '#47ff8a', color: '#47ff8a', background: 'rgba(71,255,138,0.05)' }}>⬇️ Download Photos (.zip)</button>}
          <button onClick={onMsg} style={{ ...s.btnSm, borderColor: 'var(--accent2)', color: 'var(--accent2)', background: 'rgba(71,200,255,0.05)' }}>💬 Messages</button>
          <button onClick={onDetail} style={s.btnSm}>Order Details</button>
          {order.status === 'completed' && <button style={s.btnSm}>🔁 Re-Order</button>}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 100, background: st.bg, color: st.color, border: `1px solid ${st.border}`, marginBottom: 8 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
          {st.label}
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 16, color: 'var(--accent3)' }}>${order.price}.00</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{order.date}</div>
      </div>
    </div>
  );
}

/* ─── Styles ─── */
const s: Record<string, React.CSSProperties> = {
  authBg: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 24, backgroundImage: 'linear-gradient(rgba(232,255,71,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(232,255,71,0.03) 1px,transparent 1px)', backgroundSize: '60px 60px' },
  authCard: { width: '100%', maxWidth: 440, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '40px 36px' },
  logo: { fontFamily: 'Georgia,serif', fontSize: 30, fontWeight: 900, color: 'var(--accent)', letterSpacing: 2, marginBottom: 6 },
  tabs: { display: 'flex', background: 'var(--bg)', borderRadius: 8, padding: 4, marginBottom: 28 },
  tab: { flex: 1, padding: '8px', textAlign: 'center', borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: 'pointer', border: 'none', background: 'transparent', color: 'var(--muted)', fontFamily: 'inherit' },
  tabActive: { background: 'var(--surface2)', color: 'var(--text)' },
  authError: { background: 'rgba(255,107,71,0.1)', border: '1px solid rgba(255,107,71,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--accent3)', marginBottom: 16 },
  label: { fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' as const, letterSpacing: '0.5px', display: 'block', marginBottom: 4, marginTop: 12 },
  input: { marginBottom: 0 },
  btnPrimary: { width: '100%', marginTop: 8 },
  linkBtn: { background: 'none', border: 'none', color: 'var(--accent2)', cursor: 'pointer', fontSize: 'inherit', padding: 0 },
  appNav: { background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60, position: 'sticky' as const, top: 0, zIndex: 100 },
  navBtn: { padding: '8px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: 'var(--muted)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit' },
  navBtnActive: { background: 'var(--surface2)', color: 'var(--text)' },
  avatar: { width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#0a0a0f' },
  btnLogout: { background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', padding: '6px 14px', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' },
  mainWrap: { maxWidth: 1100, margin: '0 auto', padding: '32px 32px' },
  pageHeader: { marginBottom: 28 },
  pageH1: { fontFamily: 'Georgia,serif', fontSize: 36, fontWeight: 900, margin: '0 0 6px' },
  statCard: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' },
  card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' },
  btnAccent: {},
  btnGhost: { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', padding: '12px 24px', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' },
  btnSm: { padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', fontFamily: 'inherit' },
  bubble: { width: 36, height: 36, borderRadius: '50%', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--muted)', flexShrink: 0, margin: '0 auto' },
  bubbleActive: { borderColor: 'var(--accent)', color: 'var(--accent)', background: 'rgba(232,255,71,0.08)' },
  bubbleDone: { borderColor: '#47ff8a', background: '#47ff8a', color: '#0a0a0f' },
  connector: { flex: 1, height: 2, background: 'var(--border)', margin: '0 6px', marginBottom: 16 },
  connectorDone: { background: '#47ff8a' },
  typeCard: { border: '2px solid var(--border)', borderRadius: 12, padding: 20, cursor: 'pointer', transition: 'all 0.2s', position: 'relative' as const },
  typeCardSelected: { borderColor: 'var(--accent)', background: 'rgba(232,255,71,0.04)' },
  checkBadge: { position: 'absolute' as const, top: 10, right: 10, width: 22, height: 22, background: 'var(--accent)', color: '#0a0a0f', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 },
  pillBtn: { padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--muted)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
  pillBtnActive: { borderColor: 'var(--accent)', color: 'var(--accent)', background: 'rgba(232,255,71,0.06)' },
  infoBox: { background: 'rgba(71,200,255,0.05)', border: '1px solid rgba(71,200,255,0.2)', borderRadius: 8, padding: '14px 16px', fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 },
  alertOk: { background: 'rgba(71,255,138,0.08)', border: '1px solid rgba(71,255,138,0.25)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#47ff8a' },
  uploadZone: { border: '1.5px dashed var(--border)', borderRadius: 8, padding: 24, textAlign: 'center' as const },
  wizNav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 },
  inclList: { listStyle: 'none', display: 'flex', flexDirection: 'column' as const, gap: 5 },
  inclItem: { fontSize: 12, color: 'var(--muted)', display: 'flex', gap: 8, lineHeight: 1.4 },
  msgPanel: { position: 'fixed' as const, right: 0, top: 60, bottom: 0, width: 400, background: 'var(--surface)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column' as const, transition: 'transform 0.3s', zIndex: 200 },
};
