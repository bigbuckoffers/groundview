'use client';

import { useState } from 'react';
import Link from 'next/link';

const repairs = ['HVAC','Plumbing','Electrical','Windows','Roof','Paint','Flooring','Doors','Foundation','Kitchen/Bath'];

type Estimate = {
  total_low: number;
  total_high: number;
  confidence: number;
  market: string;
  categories: { icon:string; name:string; sub:string; low:number; high:number; items:{name:string; cost:string}[] }[];
};

export default function HomePage() {
  const [selectedRepairs, setSelectedRepairs] = useState<string[]>([]);
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [photoMsg, setPhotoMsg] = useState('');
  const [photoResponse, setPhotoResponse] = useState('Upload a photo and choose an enhancement mode. The production version saves the file and creates an edit request.');

  async function submitPhotoOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setOrderLoading(true);
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const res = await fetch('/api/create-photo-order', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    const data = await res.json();
    if (data.checkoutUrl) window.location.href = data.checkoutUrl;
    else alert(`Order created: ${data.orderId}. ${data.message || 'Set Stripe keys to redirect to payment.'}`);
    setOrderLoading(false);
  }

  async function runEstimate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload = { address: form.get('address'), notes: form.get('notes'), repairTypes: selectedRepairs };
    const res = await fetch('/api/repair-estimate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    const data = await res.json();
    setEstimate(data.estimate);
    setLoading(false);
  }

  async function requestPhotoEdit() {
    const res = await fetch('/api/photo-edit-request', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ prompt: photoMsg || 'Auto enhance property photos', mode:'auto-fix' }) });
    const data = await res.json();
    setPhotoResponse(data.message);
  }

  return (
    <main>
      <nav className="nav">
        <Link href="/" className="logo">Ground<span>View</span></Link>
        <div className="links">
          <a href="#boots">Photos</a><a href="#ai">AI Editor</a><a href="#repair">Estimator</a><Link href="/pricing">Pricing</Link><Link href="/dashboard">Dashboard</Link>
        </div>
        <Link href="/dashboard" className="btn">Launch App</Link>
      </nav>

      <section className="hero">
        <div>
          <span className="badge">Nationwide remote due diligence platform</span>
          <h1>Invest From<br/><em>Anywhere.</em></h1>
          <p>Boots-on-ground photos, AI photo enhancement requests, and investor-grade repair estimates in one dashboard.</p>
          <div className="actions"><a href="#boots" className="btn">Order Photos</a><a href="#repair" className="btn secondary">Try Estimator</a></div>
        </div>
      </section>

      <div className="stats">
        <div className="stat"><b>48hrs</b><span>Average photo delivery</span></div>
        <div className="stat"><b>50+</b><span>States supported</span></div>
        <div className="stat"><b>AI</b><span>Estimate assistant</span></div>
        <div className="stat"><b>Admin</b><span>Order dashboard</span></div>
      </div>

      <section id="boots" className="section">
        <div className="wrap grid2">
          <div>
            <span className="badge">Feature 01</span>
            <h2>Boots On Ground Photos</h2>
            <p className="muted">This form now calls a real backend route. Add Stripe keys and Supabase keys to turn this into a paid order workflow.</p>
            <div className="notice">MVP workflow: customer orders → Stripe payment → order appears in admin → you fulfill with your hidden supplier → customer downloads photos.</div>
          </div>
          <form className="card" onSubmit={submitPhotoOrder}>
            <h3>Order Property Photos</h3>
            <div className="row"><input className="input" name="name" placeholder="Your name" required/><input className="input" name="email" placeholder="Email" type="email" required/></div>
            <input className="input" name="propertyAddress" placeholder="Property address" required/>
            <div className="row"><input className="input" name="cityStateZip" placeholder="City, State, ZIP" required/><select className="select" name="packageType" defaultValue="standard"><option value="standard">Standard — $149</option><option value="rush">Rush 24hr — $249</option><option value="premium">Premium + Report — $349</option></select></div>
            <textarea className="textarea" name="notes" placeholder="Access notes, lockbox, special instructions" />
            <button className="btn blue" disabled={orderLoading}>{orderLoading ? 'Creating order...' : 'Create Order / Checkout'}</button>
          </form>
        </div>
      </section>

      <section id="ai" className="section" style={{background:'var(--surface)'}}>
        <div className="wrap grid2">
          <div>
            <span className="badge">Feature 02</span>
            <h2>AI Photo Enhancement</h2>
            <p className="muted">This creates an edit request now. Later you connect Cloudinary/OpenAI image editing and return true before/after files.</p>
            <div className="upload">Photo upload UI placeholder<br/>Production: save to Supabase Storage or Cloudinary</div>
          </div>
          <div className="card">
            <h3>Photo Edit Request</h3>
            <select className="select"><option>Auto Fix</option><option>Brightness</option><option>Remove Clutter</option><option>HDR Enhance</option><option>Virtual Stage</option></select>
            <input className="input" value={photoMsg} onChange={e => setPhotoMsg(e.target.value)} placeholder="e.g. brighten kitchen and remove clutter" />
            <button className="btn" onClick={requestPhotoEdit}>Create Edit Request</button>
            <div className="result">{photoResponse}</div>
          </div>
        </div>
      </section>

      <section id="repair" className="section">
        <div className="wrap grid2">
          <form className="card" onSubmit={runEstimate}>
            <span className="badge">Feature 03</span>
            <h2>Repair Estimator</h2>
            <input className="input" name="address" placeholder="Property address" />
            <div className="pillrow">{repairs.map(r => <button type="button" key={r} className={`pill ${selectedRepairs.includes(r) ? 'active' : ''}`} onClick={() => setSelectedRepairs(s => s.includes(r) ? s.filter(x => x !== r) : [...s, r])}>{r}</button>)}</div>
            <textarea className="textarea" name="notes" placeholder="Describe observed repairs, property condition, sqft, roof age, HVAC status, etc." />
            <button className="btn orange" disabled={loading}>{loading ? 'Generating...' : 'Generate Estimate'}</button>
          </form>
          <div className="card">
            <h3>Repair Breakdown</h3>
            {!estimate && <p className="muted">Fill out the form to generate a live estimate. With no AI key, this uses the built-in cost model.</p>}
            {estimate && <div className="result"><div className="total"><div><b>Total Estimate</b><br/><span className="muted">{estimate.market} · confidence {estimate.confidence}%</span></div><strong>${estimate.total_low.toLocaleString()} – ${estimate.total_high.toLocaleString()}</strong></div><div className="list">{estimate.categories.map(c => <div key={c.name} className="card"><h3>{c.icon} {c.name}</h3><p className="muted">{c.sub}</p><div className="item"><b>Range</b><span>${c.low.toLocaleString()} – ${c.high.toLocaleString()}</span></div>{c.items.map(i => <div className="item" key={i.name}><span>{i.name}</span><span>{i.cost}</span></div>)}</div>)}</div></div>}
          </div>
        </div>
      </section>

      <footer className="footer"><b>GroundView™</b><span>Built for remote real estate investors.</span></footer>
    </main>
  );
}
