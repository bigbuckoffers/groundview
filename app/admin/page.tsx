import Link from 'next/link';

export default function AdminPage() {
  return (
    <main>
      <nav className="nav"><Link href="/" className="logo">Ground<span>View</span></Link><div className="links"><Link href="/dashboard">Dashboard</Link><Link href="/pricing">Pricing</Link></div></nav>
      <section className="dashboard">
        <div className="wrap">
          <h1>Admin Dashboard</h1>
          <div className="notice">This is the operator side. Connect Supabase queries here to show paid orders, assign supplier jobs, upload completed photos, and update customer status.</div>
          <div className="grid2">
            <div className="card"><h3>Photo Orders</h3><p className="muted">New paid orders requiring fulfillment.</p><table className="table"><tbody><tr><td>Demo Order</td><td>Paid</td><td>Needs dispatch</td></tr></tbody></table></div>
            <div className="card"><h3>Photo Edit Queue</h3><p className="muted">AI/manual photo enhancement requests.</p><table className="table"><tbody><tr><td>Demo Request</td><td>Queued</td><td>Auto Fix</td></tr></tbody></table></div>
          </div>
        </div>
      </section>
    </main>
  );
}
