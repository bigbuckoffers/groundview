'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);
  const [count3, setCount3] = useState(0);
  const [counted, setCounted] = useState(false);

  // Repair estimator freemium
  const [estAddress, setEstAddress] = useState('');
  const [estNotes, setEstNotes] = useState('');
  const [estRepairs, setEstRepairs] = useState<string[]>([]);
  const [estLoading, setEstLoading] = useState(false);
  const [estResult, setEstResult] = useState<null | {total_low:number;total_high:number;confidence:number;market:string;categories:{icon:string;name:string;sub:string;low:number;high:number}[]}>(null);

  // Photo editor freemium
  const [photoMode, setPhotoMode] = useState('Auto Fix');
  const [photoPrompt, setPhotoPrompt] = useState('');
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoProcessed, setPhotoProcessed] = useState(false);
  const [photoFileName, setPhotoFileName] = useState('');

  async function runFreeEstimate() {
    if (!estAddress.trim() && estRepairs.length === 0) return;
    setEstLoading(true);
    try {
      const res = await fetch('/api/repair-estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: estAddress, notes: estNotes, repairTypes: estRepairs }),
      });
      const data = await res.json();
      setEstResult(data.estimate);
    } catch { setEstResult(null); }
    setEstLoading(false);
  }

  async function runFreePhotoEdit() {
    if (!photoFileName) return;
    setPhotoLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setPhotoLoading(false);
    setPhotoProcessed(true);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (counted) return;
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setCounted(true);
        animateCount(setCount1, 0, 50, 1200);
        animateCount(setCount2, 0, 3000, 1400);
        animateCount(setCount3, 0, 90, 1000);
      }
    }, { threshold: 0.3 });
    const el = document.getElementById('stats-trigger');
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [counted]);

  function animateCount(setter: (n: number) => void, from: number, to: number, duration: number) {
    const start = performance.now();
    function step(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setter(Math.round(from + (to - from) * ease));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #0a0a0f; color: #f0f0f8; font-family: 'DM Sans', sans-serif; overflow-x: hidden; }
        a { color: inherit; text-decoration: none; }

        /* NAV */
        .gv-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 48px; height: 68px;
          transition: background 0.3s, border-color 0.3s;
        }
        .gv-nav.scrolled {
          background: rgba(10,10,15,0.92);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid #2a2a3a;
        }
        .gv-logo { font-family: 'Bebas Neue', sans-serif; font-size: 26px; letter-spacing: 2px; color: #e8ff47; }
        .gv-logo span { color: #f0f0f8; }
        .gv-nav-links { display: flex; gap: 32px; align-items: center; }
        .gv-nav-links a { font-size: 14px; font-weight: 500; color: #7a7a9a; transition: color 0.2s; }
        .gv-nav-links a:hover { color: #f0f0f8; }
        .gv-nav-ctas { display: flex; gap: 10px; align-items: center; }
        .gv-btn-ghost { background: transparent; border: 1px solid #2a2a3a; color: #f0f0f8; padding: 9px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; transition: border-color 0.2s; }
        .gv-btn-ghost:hover { border-color: #e8ff47; color: #e8ff47; }
        .gv-btn-primary { background: #e8ff47; color: #0a0a0f; padding: 10px 22px; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer; border: none; font-family: inherit; transition: transform 0.15s, box-shadow 0.15s; display: inline-block; }
        .gv-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(232,255,71,0.3); }
        .gv-mobile-menu { display: none; background: none; border: none; cursor: pointer; padding: 4px; }

        /* HERO */
        .gv-hero {
          min-height: 100vh; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center; padding: 120px 24px 80px;
          position: relative; overflow: hidden;
          background-image:
            radial-gradient(ellipse 80% 50% at 50% 30%, rgba(232,255,71,0.09) 0%, transparent 70%),
            linear-gradient(rgba(232,255,71,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(232,255,71,0.035) 1px, transparent 1px);
          background-size: auto, 60px 60px, 60px 60px;
        }
        .gv-hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(232,255,71,0.08); border: 1px solid rgba(232,255,71,0.2);
          color: #e8ff47; padding: 6px 16px; border-radius: 100px;
          font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
          margin-bottom: 28px;
        }
        .gv-hero-badge::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #e8ff47; animation: gv-pulse 2s infinite; }
        @keyframes gv-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .gv-hero h1 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(72px, 11vw, 140px);
          line-height: 0.88; letter-spacing: 1px;
          margin-bottom: 24px;
        }
        .gv-hero h1 em { color: #e8ff47; font-style: normal; }
        .gv-hero-sub { max-width: 560px; font-size: 18px; color: #7a7a9a; line-height: 1.7; margin-bottom: 40px; }
        .gv-hero-actions { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; margin-bottom: 60px; }
        .gv-btn-hero { background: #e8ff47; color: #0a0a0f; padding: 16px 36px; border-radius: 10px; font-size: 16px; font-weight: 800; border: none; cursor: pointer; font-family: inherit; transition: transform 0.15s, box-shadow 0.15s; display: inline-block; }
        .gv-btn-hero:hover { transform: translateY(-2px); box-shadow: 0 10px 36px rgba(232,255,71,0.35); }
        .gv-btn-hero-ghost { background: transparent; border: 1px solid #2a2a3a; color: #f0f0f8; padding: 16px 32px; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; font-family: inherit; transition: border-color 0.2s; display: inline-block; }
        .gv-btn-hero-ghost:hover { border-color: #f0f0f8; }
        .gv-hero-trust { display: flex; gap: 32px; align-items: center; justify-content: center; flex-wrap: wrap; }
        .gv-trust-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #7a7a9a; }
        .gv-trust-icon { font-size: 16px; }

        /* STATS */
        .gv-stats {
          display: grid; grid-template-columns: repeat(4,1fr);
          border-top: 1px solid #2a2a3a; border-bottom: 1px solid #2a2a3a;
          background: #12121a;
        }
        .gv-stat { padding: 36px 24px; text-align: center; border-right: 1px solid #2a2a3a; }
        .gv-stat:last-child { border-right: none; }
        .gv-stat-num { font-family: 'Bebas Neue', sans-serif; font-size: 52px; color: #e8ff47; letter-spacing: 1px; line-height: 1; }
        .gv-stat-label { font-size: 13px; color: #7a7a9a; margin-top: 6px; }

        /* SECTIONS */
        .gv-section { padding: 100px 48px; }
        .gv-section.alt { background: #12121a; border-top: 1px solid #2a2a3a; border-bottom: 1px solid #2a2a3a; }
        .gv-wrap { max-width: 1120px; margin: 0 auto; }
        .gv-tag {
          display: inline-block; font-size: 11px; font-weight: 700;
          letter-spacing: 1.5px; text-transform: uppercase; padding: 4px 12px;
          border-radius: 100px; margin-bottom: 18px;
        }
        .gv-tag.yellow { background: rgba(232,255,71,0.08); border: 1px solid rgba(232,255,71,0.2); color: #e8ff47; }
        .gv-tag.blue { background: rgba(71,200,255,0.08); border: 1px solid rgba(71,200,255,0.2); color: #47c8ff; }
        .gv-tag.orange { background: rgba(255,107,71,0.08); border: 1px solid rgba(255,107,71,0.2); color: #ff6b47; }
        .gv-section-h2 { font-family: 'Bebas Neue', sans-serif; font-size: clamp(42px,5vw,72px); line-height: 0.95; letter-spacing: 1px; margin-bottom: 16px; }
        .gv-section-p { font-size: 16px; color: #7a7a9a; line-height: 1.7; max-width: 480px; }
        .gv-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .gv-grid3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }

        /* HOW IT WORKS */
        .gv-steps { display: grid; grid-template-columns: repeat(3,1fr); gap: 2px; background: #2a2a3a; margin-top: 60px; }
        .gv-step { background: #12121a; padding: 48px 40px; }
        .gv-step-num { font-family: 'DM Mono', monospace; font-size: 11px; color: #e8ff47; font-weight: 500; letter-spacing: 2px; margin-bottom: 20px; display: block; }
        .gv-step h3 { font-family: 'Bebas Neue', sans-serif; font-size: 30px; letter-spacing: 1px; margin-bottom: 12px; }
        .gv-step p { font-size: 14px; color: #7a7a9a; line-height: 1.7; }

        /* SERVICES */
        .gv-service-card {
          background: #12121a; border: 1px solid #2a2a3a; border-radius: 16px;
          padding: 32px; transition: border-color 0.2s, transform 0.2s;
          display: flex; flex-direction: column;
        }
        .gv-service-card:hover { border-color: #e8ff47; transform: translateY(-3px); }
        .gv-service-icon { font-size: 32px; margin-bottom: 16px; }
        .gv-service-card h3 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
        .gv-service-card p { font-size: 14px; color: #7a7a9a; line-height: 1.6; flex: 1; margin-bottom: 20px; }
        .gv-service-price { font-family: 'DM Mono', monospace; font-size: 24px; color: #ff6b47; font-weight: 500; margin-bottom: 16px; }
        .gv-service-price span { font-size: 13px; color: #7a7a9a; }
        .gv-service-features { list-style: none; display: flex; flex-direction: column; gap: 6px; margin-bottom: 24px; }
        .gv-service-features li { font-size: 13px; color: #7a7a9a; display: flex; gap: 8px; align-items: flex-start; }
        .gv-service-features li::before { content: '→'; color: #e8ff47; flex-shrink: 0; font-size: 12px; margin-top: 1px; }
        .gv-service-cta { background: #e8ff47; color: #0a0a0f; border: none; border-radius: 8px; padding: 12px; font-weight: 700; font-size: 14px; cursor: pointer; font-family: inherit; width: 100%; transition: opacity 0.2s; display: block; text-align: center; }
        .gv-service-cta:hover { opacity: 0.88; }

        /* WHY US */
        .gv-why-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; margin-top: 48px; }
        .gv-why-card { background: #12121a; border: 1px solid #2a2a3a; border-radius: 14px; padding: 28px; }
        .gv-why-card .icon { font-size: 28px; margin-bottom: 14px; }
        .gv-why-card h4 { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
        .gv-why-card p { font-size: 13px; color: #7a7a9a; line-height: 1.6; }

        /* TESTIMONIALS */
        .gv-testimonials { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; margin-top: 48px; }
        .gv-testi { background: #12121a; border: 1px solid #2a2a3a; border-radius: 14px; padding: 28px; }
        .gv-testi-stars { color: #e8ff47; font-size: 14px; margin-bottom: 14px; }
        .gv-testi-text { font-size: 14px; color: #c0c0d8; line-height: 1.7; margin-bottom: 18px; font-style: italic; }
        .gv-testi-author { font-size: 13px; font-weight: 600; }
        .gv-testi-role { font-size: 12px; color: #7a7a9a; margin-top: 2px; }


        /* FREEMIUM TOOLS */
        .gv-tools-section { padding:100px 48px; }
        .gv-tools-section.dark { background:#12121a; border-top:1px solid #2a2a3a; border-bottom:1px solid #2a2a3a; }
        .gv-tool-grid { display:grid; grid-template-columns:1fr 1fr; gap:60px; align-items:start; max-width:1120px; margin:0 auto; }
        .gv-tool-card { background:#0a0a0f; border:1px solid #2a2a3a; border-radius:16px; overflow:hidden; }
        .gv-tool-card-header { padding:20px 24px; border-bottom:1px solid #2a2a3a; background:#12121a; display:flex; align-items:center; justify-content:space-between; }
        .gv-tool-card-title { font-size:14px; font-weight:700; display:flex; align-items:center; gap:8px; }
        .gv-tool-free-badge { font-size:10px; font-weight:800; background:rgba(71,255,138,0.1); border:1px solid rgba(71,255,138,0.25); color:#47ff8a; padding:2px 8px; border-radius:100px; letter-spacing:0.5px; }
        .gv-tool-body { padding:20px; }
        .gv-tool-input { width:100%; background:#12121a; border:1px solid #2a2a3a; color:#f0f0f8; padding:10px 14px; border-radius:8px; font-size:13px; font-family:inherit; outline:none; margin-bottom:10px; transition:border-color 0.2s; }
        .gv-tool-input:focus { border-color:#e8ff47; }
        .gv-tool-input::placeholder { color:#7a7a9a; }
        .gv-repair-pills { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:12px; }
        .gv-repair-pill { background:#12121a; border:1px solid #2a2a3a; color:#7a7a9a; padding:5px 10px; border-radius:6px; font-size:11px; cursor:pointer; font-family:inherit; transition:all 0.15s; }
        .gv-repair-pill.active { border-color:#ff6b47; color:#ff6b47; background:rgba(255,107,71,0.08); }
        .gv-tool-btn { width:100%; background:#e8ff47; color:#0a0a0f; border:none; border-radius:8px; padding:11px; font-weight:700; font-size:13px; cursor:pointer; font-family:inherit; transition:opacity 0.2s; }
        .gv-tool-btn:hover { opacity:0.88; }
        .gv-tool-btn:disabled { opacity:0.4; cursor:not-allowed; }
        .gv-tool-btn.orange { background:#ff6b47; color:#fff; }
        .gv-result-box { margin-top:14px; background:#12121a; border:1px solid #2a2a3a; border-radius:10px; overflow:hidden; }
        .gv-result-header { padding:12px 16px; border-bottom:1px solid #2a2a3a; display:flex; justify-content:space-between; align-items:center; }
        .gv-result-total { font-family:monospace; font-size:18px; color:#ff6b47; font-weight:500; }
        .gv-result-rows { padding:12px 16px; display:flex; flex-direction:column; gap:8px; position:relative; }
        .gv-result-row { display:flex; justify-content:space-between; font-size:13px; padding:6px 0; border-bottom:1px solid #2a2a3a; }
        .gv-result-row:last-child { border-bottom:none; }
        .gv-result-row span:last-child { font-family:monospace; color:#7a7a9a; filter:blur(5px); user-select:none; }
        .gv-result-lock { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; background:rgba(10,10,15,0.75); backdrop-filter:blur(2px); border-radius:8px; gap:10px; padding:16px; text-align:center; }
        .gv-result-lock-icon { font-size:28px; }
        .gv-result-lock p { font-size:13px; color:#7a7a9a; line-height:1.5; }
        .gv-result-lock-btn { background:#e8ff47; color:#0a0a0f; border:none; border-radius:8px; padding:10px 20px; font-weight:700; font-size:13px; cursor:pointer; font-family:inherit; white-space:nowrap; }
        .gv-photo-modes { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:10px; }
        .gv-photo-mode { background:#12121a; border:1px solid #2a2a3a; color:#7a7a9a; padding:5px 10px; border-radius:6px; font-size:11px; cursor:pointer; font-family:inherit; transition:all 0.15s; }
        .gv-photo-mode.active { border-color:#e8ff47; color:#e8ff47; background:rgba(232,255,71,0.06); }
        .gv-photo-mode.locked { cursor:default; position:relative; }
        .gv-photo-mode.locked::after { content:'🔒'; font-size:9px; margin-left:4px; }
        .gv-upload-zone { border:1.5px dashed #2a2a3a; border-radius:8px; padding:20px; text-align:center; cursor:pointer; position:relative; transition:border-color 0.2s; margin-bottom:10px; }
        .gv-upload-zone:hover { border-color:#e8ff47; }
        .gv-upload-zone input { position:absolute; inset:0; opacity:0; cursor:pointer; }
        .gv-upload-zone p { font-size:13px; color:#7a7a9a; }
        .gv-ba-preview { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:12px; }
        .gv-ba-panel { border-radius:8px; overflow:hidden; border:1px solid #2a2a3a; }
        .gv-ba-img { height:120px; background:linear-gradient(135deg,#1a1a2e,#16213e); display:flex; align-items:center; justify-content:center; font-size:36px; position:relative; }
        .gv-ba-img.after { filter:brightness(1.2) contrast(1.05) saturate(1.1); }
        .gv-ba-img.after.blurred { filter:blur(6px) brightness(1.2); }
        .gv-ba-badge { position:absolute; top:8px; left:8px; font-size:9px; font-weight:800; padding:2px 8px; border-radius:4px; letter-spacing:1px; background:rgba(10,10,15,0.8); }
        .gv-ba-lock { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; background:rgba(10,10,15,0.6); backdrop-filter:blur(4px); }
        .gv-free-note { font-size:11px; color:#7a7a9a; text-align:center; margin-top:8px; line-height:1.5; }
        @media(max-width:768px) {
          .gv-tools-section { padding:60px 20px; }
          .gv-tool-grid { grid-template-columns:1fr; gap:24px; }
        }

        /* CTA BANNER */
        .gv-cta-banner {
          background: linear-gradient(135deg, rgba(232,255,71,0.08) 0%, rgba(71,200,255,0.05) 100%);
          border: 1px solid rgba(232,255,71,0.15);
          border-radius: 20px; padding: 72px 48px; text-align: center;
          margin: 0 48px 80px;
        }
        .gv-cta-banner h2 { font-family: 'Bebas Neue', sans-serif; font-size: clamp(40px,5vw,72px); letter-spacing: 1px; margin-bottom: 16px; }
        .gv-cta-banner p { font-size: 17px; color: #7a7a9a; max-width: 500px; margin: 0 auto 36px; line-height: 1.6; }
        .gv-cta-actions { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }

        /* FOOTER */
        .gv-footer { background: #12121a; border-top: 1px solid #2a2a3a; padding: 60px 48px 40px; }
        .gv-footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 48px; }
        .gv-footer-logo { font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: #e8ff47; letter-spacing: 2px; margin-bottom: 12px; }
        .gv-footer-logo span { color: #f0f0f8; }
        .gv-footer-desc { font-size: 14px; color: #7a7a9a; line-height: 1.7; max-width: 280px; }
        .gv-footer-col h4 { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #f0f0f8; margin-bottom: 16px; }
        .gv-footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
        .gv-footer-col ul a { font-size: 14px; color: #7a7a9a; transition: color 0.2s; }
        .gv-footer-col ul a:hover { color: #f0f0f8; }
        .gv-footer-bottom { border-top: 1px solid #2a2a3a; padding-top: 24px; display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: #7a7a9a; flex-wrap: wrap; gap: 12px; }

        /* MOBILE */
        @media(max-width: 768px) {
          .gv-nav { padding: 0 20px; }
          .gv-nav-links { display: none; }
          .gv-mobile-menu { display: block; }
          .gv-section { padding: 60px 20px; }
          .gv-grid2, .gv-grid3, .gv-steps, .gv-why-grid, .gv-testimonials { grid-template-columns: 1fr; gap: 16px; }
          .gv-stats { grid-template-columns: 1fr 1fr; }
          .gv-stat { border-right: none; border-bottom: 1px solid #2a2a3a; }
          .gv-cta-banner { margin: 0 20px 60px; padding: 48px 24px; }
          .gv-footer { padding: 40px 20px; }
          .gv-footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
          .gv-steps { gap: 0; }
        }

        /* Mobile menu overlay */
        .gv-mobile-overlay {
          position: fixed; inset: 0; background: rgba(10,10,15,0.97);
          z-index: 200; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 28px;
        }
        .gv-mobile-overlay a, .gv-mobile-overlay button { font-size: 28px; font-weight: 700; color: #f0f0f8; background: none; border: none; cursor: pointer; font-family: inherit; }
        .gv-mobile-close { position: absolute; top: 24px; right: 24px; font-size: 28px; background: none; border: none; color: #7a7a9a; cursor: pointer; }

        /* Photo grid mock */
        .gv-photo-grid { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 200px 200px; gap: 12px; }
        .gv-photo-card { border-radius: 12px; background: #1a1a26; border: 1px solid #2a2a3a; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; position: relative; overflow: hidden; }
        .gv-photo-card:first-child { grid-row: 1/3; }
        .gv-photo-card span { font-size: 36px; }
        .gv-photo-card p { font-size: 10px; color: #7a7a9a; font-family: 'DM Mono', monospace; }
        .gv-photo-label { position: absolute; bottom: 10px; left: 10px; right: 10px; background: rgba(10,10,15,0.85); padding: 6px 10px; border-radius: 6px; font-size: 11px; display: flex; justify-content: space-between; }
        .gv-photo-dot { width: 5px; height: 5px; border-radius: 50%; background: #47ff8a; }
      `}</style>

      {/* ── NAV ── */}
      <nav className={`gv-nav${scrolled ? ' scrolled' : ''}`}>
        <div className="gv-logo">Ground<span>View</span>™</div>
        <div className="gv-nav-links">
          <a href="#how">How It Works</a>
          <a href="#estimator">Repair Estimator</a>
          <a href="#photo-editor">Photo Editor</a>
          <a href="#services">Pricing</a>
          <a href="#why">Why Us</a>
        </div>
        <div className="gv-nav-ctas">
          <Link href="/portal" className="gv-btn-ghost">Sign In</Link>
          <Link href="/portal" className="gv-btn-primary">Get Started Free</Link>
        </div>
        <button className="gv-mobile-menu" onClick={() => setMenuOpen(true)}>
          <svg width="24" height="24" fill="none" stroke="#f0f0f8" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </nav>

      {menuOpen && (
        <div className="gv-mobile-overlay">
          <button className="gv-mobile-close" onClick={() => setMenuOpen(false)}>✕</button>
          <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
          <a href="#how" onClick={() => setMenuOpen(false)}>How It Works</a>
          <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
          <Link href="/portal" onClick={() => setMenuOpen(false)}>Sign In</Link>
          <Link href="/portal" className="gv-btn-primary" onClick={() => setMenuOpen(false)}>Get Started</Link>
        </div>
      )}

      {/* ── HERO ── */}
      <section className="gv-hero">
        <div className="gv-hero-badge">⚡ Nationwide Field Coverage — All 50 States</div>
        <h1>Invest From<br /><em>Anywhere.</em></h1>
        <p className="gv-hero-sub">
          Real boots-on-ground property photos delivered fast. Create your free account and order in minutes — no vendor chasing, no guessing.
        </p>
        <div className="gv-hero-actions">
          <Link href="/portal" className="gv-btn-hero">Create Free Account →</Link>
          <a href="#how" className="gv-btn-hero-ghost">See How It Works</a>
        </div>
        <div className="gv-hero-trust">
          <div className="gv-trust-item"><span className="gv-trust-icon">🔒</span> No credit card to sign up</div>
          <div className="gv-trust-item"><span className="gv-trust-icon">📸</span> Pay only when you order</div>
          <div className="gv-trust-item"><span className="gv-trust-icon">⚡</span> Photos delivered in 24–48hrs</div>
          <div className="gv-trust-item"><span className="gv-trust-icon">🌎</span> All 50 states covered</div>
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="gv-stats" id="stats-trigger">
        <div className="gv-stat">
          <div className="gv-stat-num">{count1}+</div>
          <div className="gv-stat-label">States with active coverage</div>
        </div>
        <div className="gv-stat">
          <div className="gv-stat-num">{count2.toLocaleString()}+</div>
          <div className="gv-stat-label">Properties photographed</div>
        </div>
        <div className="gv-stat">
          <div className="gv-stat-num">48hr</div>
          <div className="gv-stat-label">Average standard delivery</div>
        </div>
        <div className="gv-stat">
          <div className="gv-stat-num">{count3}%</div>
          <div className="gv-stat-label">Member satisfaction rate</div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className="gv-section" id="how">
        <div className="gv-wrap">
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <span className="gv-tag yellow">How It Works</span>
          </div>
          <h2 className="gv-section-h2" style={{ textAlign: 'center' }}>
            From order to delivery<br />in three steps.
          </h2>
        </div>
        <div className="gv-steps" style={{ maxWidth: 1120, margin: '60px auto 0' }}>
          <div className="gv-step">
            <span className="gv-step-num">STEP 01</span>
            <h3>Create Your Account</h3>
            <p>Sign up free in under 60 seconds. No credit card required. Your dashboard gives you full visibility over every order — past, present, and in progress.</p>
          </div>
          <div className="gv-step">
            <span className="gv-step-num">STEP 02</span>
            <h3>Place Your Order</h3>
            <p>Enter the property address, select your service type and delivery speed, add any access details, and check out. We handle everything from there — no back and forth.</p>
          </div>
          <div className="gv-step">
            <span className="gv-step-num">STEP 03</span>
            <h3>Receive Your Photos</h3>
            <p>A vetted local field agent heads to the property and delivers a full photo set straight to your dashboard. Download everything as a zip with one click.</p>
          </div>
        </div>
      </section>

      {/* ── SERVICES / PRICING ── */}
      <section className="gv-section alt" id="services">
        <div className="gv-wrap">
          <span className="gv-tag blue">Services & Pricing</span>
          <h2 className="gv-section-h2">Everything you need<br />to underwrite remotely.</h2>
          <p className="gv-section-p" style={{ marginBottom: 48 }}>Flat-rate pricing. No hidden fees. Pay only for what you order.</p>
          <div className="gv-grid3" id="pricing">
            {/* Card 1 */}
            <div className="gv-service-card">
              <div className="gv-service-icon">🔒</div>
              <h3>Interior/Exterior Photos</h3>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#47c8ff', marginBottom: 8 }}>VACANT WITH LOCKBOX</p>
              <p>Property is vacant and accessible via lockbox. Provide the code at checkout — we handle the rest.</p>
              <div className="gv-service-price">$95 <span>/ single family</span></div>
              <ul className="gv-service-features">
                <li>Full exterior — all angles, street scenes, address verification</li>
                <li>Full interior — all rooms, kitchen, baths, damage, mechanicals</li>
                <li>Timestamped, geotagged photo delivery</li>
                <li>Standard delivery: next business day</li>
                <li>Rush and 6-hour express available</li>
              </ul>
              <Link href="/portal" className="gv-service-cta">Order Now →</Link>
            </div>
            {/* Card 2 */}
            <div className="gv-service-card" style={{ border: '1px solid rgba(232,255,71,0.3)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', background: '#e8ff47', color: '#0a0a0f', fontSize: 10, fontWeight: 800, padding: '3px 14px', borderRadius: '0 0 8px 8px', letterSpacing: 1 }}>MOST POPULAR</div>
              <div className="gv-service-icon">📅</div>
              <h3>Interior/Exterior Photos</h3>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#e8ff47', marginBottom: 8 }}>REQUIRES APPOINTMENT</p>
              <p>Property requires scheduled access. We coordinate directly with the homeowner or tenant — you provide their contact info at checkout.</p>
              <div className="gv-service-price">$95 <span>/ single family</span></div>
              <ul className="gv-service-features">
                <li>Everything in the Lockbox package</li>
                <li>Direct scheduling with your point of contact</li>
                <li>Occupied or tenant-occupied properties</li>
                <li>Standard delivery: next business day</li>
                <li>Rush and 6-hour express available</li>
              </ul>
              <Link href="/portal" className="gv-service-cta">Order Now →</Link>
            </div>
            {/* Card 3 — Speed Upgrades */}
            <div className="gv-service-card">
              <div className="gv-service-icon">⚡</div>
              <h3>Delivery Speed Upgrades</h3>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#ff6b47', marginBottom: 8 }}>ADD TO ANY ORDER</p>
              <p>Need it faster? Add a speed upgrade to any order at checkout. All rush services are weekday-only.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: '16px 0', flex: 1 }}>
                <div style={{ background: '#1a1a26', border: '1px solid #2a2a3a', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#47ff8a', marginBottom: 4 }}>✅ STANDARD — Included</div>
                  <div style={{ fontSize: 12, color: '#7a7a9a' }}>Orders before 10 AM fulfilled next business day</div>
                </div>
                <div style={{ background: '#1a1a26', border: '1px solid #2a2a3a', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#ffbb47', marginBottom: 4 }}>⚡ PRIORITY 24-HOUR — +$25</div>
                  <div style={{ fontSize: 12, color: '#7a7a9a' }}>Weekday rush, processing starts next business day if ordered on weekend</div>
                </div>
                <div style={{ background: '#1a1a26', border: '1px solid #2a2a3a', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#ff6b47', marginBottom: 4 }}>🚀 6-HOUR EXPRESS — +$45</div>
                  <div style={{ fontSize: 12, color: '#7a7a9a' }}>Must order by 10 AM weekday. Highest priority dispatch</div>
                </div>
              </div>
              <div style={{ marginTop: 'auto' }}>
                <p style={{ fontSize: 11, color: '#7a7a9a', marginBottom: 12 }}>+$20 per unit for duplex/multi-family properties</p>
                <Link href="/portal" className="gv-service-cta">View All Options →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PHOTOS SECTION ── */}
      <section className="gv-section" id="photos">
        <div className="gv-wrap">
          <div className="gv-grid2">
            <div>
              <span className="gv-tag yellow">📸 What You Get</span>
              <h2 className="gv-section-h2">Every angle.<br />Every detail.</h2>
              <p className="gv-section-p" style={{ marginBottom: 28 }}>Our field agents follow a strict shot list on every single order — so you always know exactly what you're getting before you close.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { icon: '🏡', title: 'Full Exterior', desc: 'Front, rear, sides, 45° angles, street scenes, address verification, and all applicable features — pool, A/C unit, deck, shed, and more.' },
                  { icon: '🛋️', title: 'Complete Interior', desc: 'Every bedroom, bathroom, kitchen, dining area, garage, and all remaining rooms. Appliances, mechanicals, and any visible damage documented.' },
                  { icon: '⚠️', title: 'Damage Documentation', desc: 'Obvious damage is photographed and included in every order automatically — no extra request needed.' },
                ].map(({ icon, title, desc }) => (
                  <div key={title} style={{ display: 'flex', gap: 16, background: '#12121a', border: '1px solid #2a2a3a', borderRadius: 12, padding: 20 }}>
                    <div style={{ fontSize: 24, flexShrink: 0 }}>{icon}</div>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>{title}</div>
                      <div style={{ fontSize: 13, color: '#7a7a9a', lineHeight: 1.6 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="gv-photo-grid">
                <div className="gv-photo-card">
                  <span>🏡</span><p>EXTERIOR FRONT</p>
                  <div className="gv-photo-label"><span>123 Oak St, Dallas TX</span><div className="gv-photo-dot" /></div>
                </div>
                <div className="gv-photo-card">
                  <span>🛋️</span><p>LIVING ROOM</p>
                  <div className="gv-photo-label"><span>Interior</span><div className="gv-photo-dot" /></div>
                </div>
                <div className="gv-photo-card">
                  <span>🍳</span><p>KITCHEN</p>
                  <div className="gv-photo-label"><span>Interior</span><div className="gv-photo-dot" /></div>
                </div>
              </div>
              <div style={{ background: '#12121a', border: '1px solid #2a2a3a', borderRadius: 12, padding: 16, marginTop: 12 }}>
                <div style={{ fontSize: 12, color: '#7a7a9a', display: 'flex', justifyContent: 'space-between' }}>
                  <span>📦 Order GV-2026-0031</span>
                  <span style={{ color: '#47ff8a', fontWeight: 600 }}>✓ Delivered</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, margin: '6px 0 4px' }}>144 W 41st St, Jacksonville FL</div>
                <div style={{ fontSize: 12, color: '#7a7a9a' }}>Interior/Exterior · Standard · 28 photos delivered</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY GROUNDVIEW ── */}
      <section className="gv-section alt" id="why">
        <div className="gv-wrap">
          <span className="gv-tag blue">Why GroundView™</span>
          <h2 className="gv-section-h2">Built for investors<br />who move fast.</h2>
          <div className="gv-why-grid">
            {[
              { icon: '🌎', title: 'True Nationwide Coverage', desc: 'Active field agents in all 50 states. Whether you\'re buying in Dallas, Detroit, or Daytona — we\'ve got someone close.' },
              { icon: '🔒', title: 'Your Supplier Is Invisible', desc: 'Your clients see GroundView™ branding from start to finish. Our backend stays behind the curtain — always.' },
              { icon: '⚡', title: 'Delivery That Keeps Up', desc: 'Standard, Rush, and 6-Hour Express options mean you can close faster without sacrificing your due diligence.' },
              { icon: '📋', title: 'Consistent Shot Lists', desc: 'Every order follows the same structured shot list — so your team always knows what to expect when photos arrive.' },
              { icon: '💬', title: 'Built-In Messaging', desc: 'Communicate directly with our team through your order dashboard. No email chains, no missed calls.' },
              { icon: '🏘️', title: 'Multi-Unit Friendly', desc: 'Duplex, triplex, or fourplex? We handle it. Add-on pricing keeps it simple — $20 per additional unit.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="gv-why-card">
                <div className="icon">{icon}</div>
                <h4>{title}</h4>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="gv-section">
        <div className="gv-wrap">
          <span className="gv-tag yellow">What Members Say</span>
          <h2 className="gv-section-h2">Investors nationwide<br />trust GroundView™.</h2>
          <div className="gv-testimonials">
            {[
              { stars: 5, text: 'I\'ve been investing remotely for 3 years and GroundView is the cleanest photo ordering experience I\'ve used. Photos were in my dashboard before noon the next day.', name: 'Marcus T.', role: 'Wholesale Investor — Atlanta, GA' },
              { stars: 5, text: 'The appointment order flow is so smooth. I gave them my tenant\'s info and they handled everything — I didn\'t have to make a single call. That\'s how it should work.', name: 'Priya R.', role: 'Buy & Hold Investor — Phoenix, AZ' },
              { stars: 5, text: 'As someone building a virtual wholesaling operation, having a platform where my clients log in and get their own dashboard is a game changer. Highly recommend.', name: 'Derek S.', role: 'Virtual Wholesaler — Houston, TX' },
            ].map(({ stars, text, name, role }) => (
              <div key={name} className="gv-testi">
                <div className="gv-testi-stars">{'★'.repeat(stars)}</div>
                <p className="gv-testi-text">"{text}"</p>
                <div className="gv-testi-author">{name}</div>
                <div className="gv-testi-role">{role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── REPAIR ESTIMATOR FREEMIUM ── */}
      <section className="gv-tools-section dark" id="estimator">
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ marginBottom: 40 }}>
            <span className="gv-tag orange">🔧 Free Tool</span>
            <h2 className="gv-section-h2">Repair Estimator</h2>
            <p className="gv-section-p">Enter a property address, select the repairs you observed, and get an instant AI-powered estimate. <strong style={{color:'#f0f0f8'}}>Free to try — full breakdown unlocked with a free account.</strong></p>
          </div>
          <div className="gv-tool-grid">
            {/* Input */}
            <div>
              <div className="gv-tool-card">
                <div className="gv-tool-card-header">
                  <div className="gv-tool-card-title"><span>🔍</span> Property Details</div>
                  <span className="gv-tool-free-badge">FREE</span>
                </div>
                <div className="gv-tool-body">
                  <input className="gv-tool-input" value={estAddress} onChange={e => setEstAddress(e.target.value)} placeholder="Property address (e.g. 123 Main St, Dallas TX)" />
                  <div className="gv-repair-pills">
                    {['🔧 HVAC','🚿 Plumbing','⚡ Electrical','🪟 Windows','🏠 Roof','🎨 Paint','🪵 Flooring','🚪 Doors','🧱 Foundation','🛁 Kitchen/Bath'].map(r => (
                      <button key={r} className={`gv-repair-pill${estRepairs.includes(r) ? ' active' : ''}`}
                        onClick={() => setEstRepairs(p => p.includes(r) ? p.filter(x => x !== r) : [...p, r])}>
                        {r}
                      </button>
                    ))}
                  </div>
                  <textarea className="gv-tool-input" rows={3} value={estNotes} onChange={e => setEstNotes(e.target.value)} placeholder="Additional notes — roof age, HVAC condition, sqft, etc." style={{resize:'vertical',minHeight:70}} />
                  <button className="gv-tool-btn orange" onClick={runFreeEstimate} disabled={estLoading || (!estAddress.trim() && estRepairs.length === 0)}>
                    {estLoading ? '⏳ Analyzing...' : '🔍 Generate Free Estimate'}
                  </button>
                </div>
              </div>
            </div>

            {/* Result */}
            <div>
              <div className="gv-tool-card">
                <div className="gv-tool-card-header">
                  <div className="gv-tool-card-title"><span>📊</span> Estimate Result</div>
                  {estResult && <span style={{fontFamily:'monospace',fontSize:14,color:'#ff6b47'}}>${estResult.total_low.toLocaleString()} – ${estResult.total_high.toLocaleString()}</span>}
                </div>
                <div className="gv-tool-body">
                  {!estResult && (
                    <div style={{textAlign:'center',padding:'40px 20px',color:'#7a7a9a'}}>
                      <div style={{fontSize:36,marginBottom:12}}>🔍</div>
                      <p style={{fontSize:13,lineHeight:1.6}}>Fill out the form and click Generate — your estimate appears here instantly.</p>
                    </div>
                  )}
                  {estResult && (
                    <div className="gv-result-box">
                      <div className="gv-result-header">
                        <div>
                          <div style={{fontSize:11,color:'#7a7a9a',marginBottom:2}}>TOTAL ESTIMATE RANGE</div>
                          <div className="gv-result-total">${estResult.total_low.toLocaleString()} – ${estResult.total_high.toLocaleString()}</div>
                        </div>
                        <div style={{textAlign:'right',fontSize:12,color:'#7a7a9a'}}>
                          <div>{estResult.market}</div>
                          <div>Confidence: {estResult.confidence}%</div>
                        </div>
                      </div>
                      <div className="gv-result-rows">
                        {estResult.categories.map(c => (
                          <div key={c.name} className="gv-result-row">
                            <span>{c.icon} {c.name} <span style={{color:'#7a7a9a',fontSize:11}}>{c.sub}</span></span>
                            <span>${c.low.toLocaleString()} – ${c.high.toLocaleString()}</span>
                          </div>
                        ))}
                        <div className="gv-result-lock">
                          <div className="gv-result-lock-icon">🔒</div>
                          <p>Full line-item breakdown — materials, labor, and contractor notes — unlocked with a free account.</p>
                          <Link href="/portal" className="gv-result-lock-btn">Unlock Full Estimate — Free →</Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <p className="gv-free-note">Free estimates show category totals only. Create a free account to see the full breakdown with line items, confidence scoring, and save your results.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI PHOTO EDITOR FREEMIUM ── */}
      <section className="gv-tools-section" id="photo-editor">
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ marginBottom: 40 }}>
            <span className="gv-tag yellow">📸 Free Tool</span>
            <h2 className="gv-section-h2">AI Photo Editor</h2>
            <p className="gv-section-p">Upload a property photo and let our AI enhance it. <strong style={{color:'#f0f0f8'}}>Auto Fix is free.</strong> Declutter, sky replace, HDR, and virtual staging unlock with a free account.</p>
          </div>
          <div className="gv-tool-grid">
            {/* Input */}
            <div>
              <div className="gv-tool-card">
                <div className="gv-tool-card-header">
                  <div className="gv-tool-card-title"><span>🖼️</span> Upload & Enhance</div>
                  <span className="gv-tool-free-badge">FREE</span>
                </div>
                <div className="gv-tool-body">
                  <div style={{marginBottom:10}}>
                    <div style={{fontSize:11,color:'#7a7a9a',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:8}}>Enhancement Mode</div>
                    <div className="gv-photo-modes">
                      {['Auto Fix'].map(m => (
                        <button key={m} className={`gv-photo-mode${photoMode === m ? ' active' : ''}`} onClick={() => setPhotoMode(m)}>{m}</button>
                      ))}
                      {['Declutter','Sky Replace','HDR Enhance','Virtual Stage','Remove Objects'].map(m => (
                        <button key={m} className="gv-photo-mode locked" onClick={() => {}} title="Unlock with free account" style={{opacity:0.5}}>{m}</button>
                      ))}
                    </div>
                    <p style={{fontSize:11,color:'#7a7a9a',marginTop:6}}>🔒 Full editor modes unlock with a free account</p>
                  </div>
                  <label className="gv-upload-zone">
                    <input type="file" accept="image/*" onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) { setPhotoFileName(f.name); setPhotoProcessed(false); }
                    }} />
                    {photoFileName
                      ? <p style={{color:'#e8ff47'}}>✅ {photoFileName}</p>
                      : <><p>📁 Click to upload a property photo</p><p style={{fontSize:11,marginTop:4}}>JPG, PNG, HEIC supported</p></>
                    }
                  </label>
                  <input className="gv-tool-input" value={photoPrompt} onChange={e => setPhotoPrompt(e.target.value)} placeholder="Optional: describe what to fix (e.g. brighten the exterior)" />
                  <button className="gv-tool-btn" onClick={runFreePhotoEdit} disabled={photoLoading || !photoFileName}>
                    {photoLoading ? '⚡ Processing...' : '⚡ Enhance Photo — Free'}
                  </button>
                </div>
              </div>
            </div>

            {/* Before / After */}
            <div>
              <div className="gv-tool-card">
                <div className="gv-tool-card-header">
                  <div className="gv-tool-card-title"><span>✨</span> Before / After</div>
                  {photoProcessed && <span style={{fontSize:12,color:'#47ff8a',fontWeight:600}}>✓ Processed</span>}
                </div>
                <div className="gv-tool-body">
                  {!photoProcessed && (
                    <div style={{textAlign:'center',padding:'40px 20px',color:'#7a7a9a'}}>
                      <div style={{fontSize:36,marginBottom:12}}>🏡</div>
                      <p style={{fontSize:13,lineHeight:1.6}}>Upload a photo and click Enhance to see the before/after comparison.</p>
                    </div>
                  )}
                  {photoProcessed && (
                    <>
                      <div className="gv-ba-preview">
                        <div className="gv-ba-panel">
                          <div className="gv-ba-img"><span>🏠</span><div className="gv-ba-badge">BEFORE</div></div>
                          <div style={{padding:'8px 10px',fontSize:12,color:'#7a7a9a',background:'#12121a'}}>Original</div>
                        </div>
                        <div className="gv-ba-panel">
                          <div className="gv-ba-img after blurred" style={{position:'relative'}}>
                            <span>🏡</span>
                            <div className="gv-ba-badge" style={{background:'rgba(232,255,71,0.2)',color:'#e8ff47'}}>ENHANCED</div>
                            <div className="gv-ba-lock">
                              <span style={{fontSize:20}}>🔒</span>
                              <Link href="/portal" style={{background:'#e8ff47',color:'#0a0a0f',padding:'6px 14px',borderRadius:6,fontSize:12,fontWeight:700,whiteSpace:'nowrap'}}>Unlock Download</Link>
                            </div>
                          </div>
                          <div style={{padding:'8px 10px',fontSize:12,color:'#47ff8a',background:'#12121a'}}>AI Enhanced ✓</div>
                        </div>
                      </div>
                      <div style={{marginTop:12,background:'rgba(232,255,71,0.06)',border:'1px solid rgba(232,255,71,0.2)',borderRadius:8,padding:'12px 14px',fontSize:13,color:'#7a7a9a',lineHeight:1.6}}>
                        ✨ Auto Fix applied: brightness corrected, contrast balanced, colors normalized to MLS standards. <Link href="/portal" style={{color:'#e8ff47',fontWeight:600}}>Create a free account</Link> to download full-resolution result and unlock all enhancement modes.
                      </div>
                    </>
                  )}
                </div>
              </div>
              <p className="gv-free-note">Free tier: Auto Fix only, preview mode. Full resolution download + all 6 enhancement modes with a free account.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <div className="gv-cta-banner">
        <span className="gv-tag yellow" style={{ marginBottom: 20 }}>Get Started Today</span>
        <h2>Ready to invest<br />from anywhere?</h2>
        <p>Create your free account in under 60 seconds. No credit card required — pay only when you place an order.</p>
        <div className="gv-cta-actions">
          <Link href="/portal" className="gv-btn-hero">Create Free Account →</Link>
          <Link href="/pricing" className="gv-btn-hero-ghost">View Pricing</Link>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="gv-footer">
        <div className="gv-wrap">
          <div className="gv-footer-grid">
            <div>
              <div className="gv-footer-logo">Ground<span>View</span>™</div>
              <p className="gv-footer-desc">Boots-on-ground field photography for remote real estate investors. Nationwide coverage, fast delivery, investor-grade results.</p>
            </div>
            <div className="gv-footer-col">
              <h4>Services</h4>
              <ul>
                <li><Link href="/portal">Vacant with Lockbox</Link></li>
                <li><Link href="/portal">Requires Appointment</Link></li>
                <li><Link href="/portal">Rush Delivery</Link></li>
                <li><Link href="/portal">Multi-Family</Link></li>
              </ul>
            </div>
            <div className="gv-footer-col">
              <h4>Account</h4>
              <ul>
                <li><Link href="/portal">Sign In</Link></li>
                <li><Link href="/portal">Create Account</Link></li>
                <li><Link href="/portal">My Orders</Link></li>
                <li><Link href="/portal">Dashboard</Link></li>
              </ul>
            </div>
            <div className="gv-footer-col">
              <h4>Company</h4>
              <ul>
                <li><a href="#how">How It Works</a></li>
                <li><a href="#why">Why GroundView</a></li>
                <li><a href="#services">Pricing</a></li>
              </ul>
            </div>
          </div>
          <div className="gv-footer-bottom">
            <span>© {new Date().getFullYear()} GroundView™. All rights reserved.</span>
            <span>Nationwide field photography for real estate investors.</span>
          </div>
        </div>
      </footer>
    </>
  );
}
