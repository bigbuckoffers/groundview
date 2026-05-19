import Link from 'next/link';

export default function DashboardPage({ searchParams }: { searchParams?: { success?: string; order?: string } }) {
  return (
    <main>
      <nav className="nav"><Link href="/" className="logo">Ground<span>View</span></Link><div className="links"><Link href="/">Home</Link><Link href="/admin">Admin</Link><Link href="/pricing">Pricing</Link></div></nav>
      <section className="dashboard">
        <div className="wrap">
          <h1>Customer Dashboard</h1>
          {searchParams?.success && <div className="notice">Payment successful. Order {searchParams.order} is now ready for admin fulfillment.</div>}
          <div className="grid2">
            <div className="card"><h3>New Photo Order</h3><p className="muted">Order boots-on-ground property photos and track status.</p><Link className="btn blue" href="/#boots">Create Order</Link></div>
            <div className="card"><h3>Repair Estimator</h3><p className="muted">Generate an investor-grade repair range from property notes and photos.</p><Link className="btn orange" href="/#repair">Run Estimate</Link></div>
          </div>
          <div className="card" style={{marginTop:24}}>
            <h3>Recent Orders</h3>
            <table className="table"><thead><tr><th>Order</th><th>Property</th><th>Status</th><th>Package</th></tr></thead><tbody><tr><td>Demo</td><td>123 Main St</td><td>Awaiting fulfillment</td><td>Standard</td></tr></tbody></table>
          </div>
        </div>
      </section>
    </main>
  );
}
