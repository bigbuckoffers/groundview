import Link from 'next/link';

const plans = [
  ['Free Account','$0','Order tracking, dashboard access, pay-per-use tools'],
  ['Investor Pro','$49/mo','10 repair estimates, photo order dashboard, saved reports'],
  ['Team','$149/mo','Team seats, higher limits, admin controls, priority queue'],
];

export default function PricingPage(){
  return <main><nav className="nav"><Link href="/" className="logo">Ground<span>View</span></Link><div className="links"><Link href="/dashboard">Dashboard</Link></div></nav><section className="section"><div className="wrap"><h1>Pricing</h1><p className="muted">Start free. Pay for usage. Keep boots-on-ground photo orders separate because they have real fulfillment costs.</p><div className="grid2">{plans.map(p=><div className="card" key={p[0]}><h2>{p[0]}</h2><h3>{p[1]}</h3><p className="muted">{p[2]}</p><Link href="/dashboard" className="btn">Get Started</Link></div>)}</div></div></section></main>
}
