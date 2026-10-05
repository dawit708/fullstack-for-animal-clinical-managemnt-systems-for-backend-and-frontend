// src/pages/public/Home.jsx
import { Link } from 'react-router-dom';
import PublicLayout from '../../layouts/PublicLayout';

export default function Home() {
  return (
    <PublicLayout>
      {/* ============================================================
          HERO — dark forest green background (continuous with header)
      ============================================================ */}
      <section className="bg-[#0F2E2A] text-white">
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-20 lg:pt-20 lg:pb-28
                        grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ---------- LEFT: Text ---------- */}
          <div>
            <h1 className="text-5xl md:text-6xl lg:text-[76px] font-extrabold
                           leading-[1.05] tracking-tight">
              Expert Veterinary<br />
              Care for Your<br />
              <span className="text-[#F87171]">Beloved Pets</span>
            </h1>

            <p className="text-gray-300 mt-8 text-lg lg:text-xl leading-relaxed max-w-xl">
              From general health checkups and surgical procedures to emergency
              treatments and pharmacy supplies, we deliver state-of-the-art care
              for all animals.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4 mt-10">
              <Link
                to="/contact"
                className="inline-flex items-center gap-3
                           bg-[#F87171] hover:bg-[#EF4444]
                           text-white font-bold
                           px-8 py-4 rounded-xl
                           shadow-lg shadow-[#F87171]/20
                           transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                     strokeLinejoin="round">
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1
                           19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3
                           a2 2 0 0 1 2 1.7 12.8 12.8 0 0 0 .7 2.8 2 2 0 0 1-.4 2.1
                           L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4 12.8
                           12.8 0 0 0 2.8.7 2 2 0 0 1 1.7 2Z" />
                </svg>
                Contact us
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center gap-3
                           bg-transparent hover:bg-white/5
                           border-2 border-white/30 hover:border-white/50
                           text-white font-bold
                           px-8 py-4 rounded-xl
                           transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                     strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Get Directions
              </Link>
            </div>
          </div>

          {/* ---------- RIGHT: Image card ---------- */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden
                            aspect-[4/5] lg:aspect-[5/6]
                            bg-gradient-to-br from-teal-800 to-emerald-950
                            shadow-2xl shadow-black/30">
              {/* Image — replace src with your real photo */}
              <img
                src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=1200&q=80"
                alt="On-site veterinary treatment"
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.classList.add('grid', 'place-items-center');
                  e.target.parentElement.innerHTML +=
                    '<span style="font-size:6rem;opacity:.2">🐕</span>';
                }}
              />

              {/* Caption overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8
                              bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                <p className="text-[#F87171] font-bold text-sm lg:text-base mb-1">
                  On-site Treatment
                </p>
                <p className="text-white font-bold text-lg lg:text-xl leading-tight">
                  Gentle IV Infusions &amp; Medical Care
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          TRUST STRIP — light background
      ============================================================ */}
      <section className="bg-[#F8FAF9] border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: '🏥', title: 'Modern clinic',  sub: 'Digital records' },
            { icon: '🚑', title: 'Emergency 24/7', sub: 'Always available' },
            { icon: '🧪', title: 'In-house lab',   sub: 'Fast results' },
            { icon: '💊', title: 'Full pharmacy',  sub: 'Same-day pickup' },
          ].map(b => (
            <div key={b.title} className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white border border-gray-100
                              grid place-items-center text-xl">
                {b.icon}
              </div>
              <div>
                <p className="font-bold text-sm text-teal-950">{b.title}</p>
                <p className="text-xs text-gray-500">{b.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================
          FEATURES — why choose us
      ============================================================ */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-bold text-teal-700 tracking-[0.15em]">WHY CHOOSE US</p>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-teal-950 mt-3">
            Complete care, one clinic
          </h2>
          <p className="text-gray-500 mt-4">
            Everything your pet needs under one roof — from routine check-ups to
            complex surgery and pharmacy supplies.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: '🩺', title: 'Expert veterinarians',
              text: 'Licensed specialists in small animals, livestock and exotic pets.' },
            { icon: '🧬', title: 'Advanced diagnostics',
              text: 'In-house lab, digital X-ray and ultrasound for fast answers.' },
            { icon: '💊', title: 'Pharmacy on-site',
              text: 'Prescriptions filled within minutes — no waiting, no pharmacy runs.' },
            { icon: '📱', title: 'Digital records',
              text: 'Access your pet’s full medical history anytime, anywhere.' },
            { icon: '🏠', title: 'Home visits',
              text: 'For senior pets or emergencies — we come to you.' },
            { icon: '⏰', title: '24/7 emergency',
              text: 'On-call vets ready when every minute counts.' },
          ].map(f => (
            <div key={f.title}
                 className="border border-gray-100 rounded-2xl p-6 bg-white
                            hover:border-teal-200 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-2xl grid
                              place-items-center mb-4">
                {f.icon}
              </div>
              <h3 className="font-bold text-teal-950">{f.title}</h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================
          CTA
      ============================================================ */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="rounded-3xl bg-gradient-to-r from-teal-800 to-emerald-700
                        text-white p-10 lg:p-16 flex flex-col lg:flex-row
                        items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl lg:text-4xl font-extrabold">
              Ready to give your pet the best?
            </h2>
            <p className="text-teal-100 mt-3 max-w-xl">
              Book your first appointment today and get a free wellness check-up.
            </p>
          </div>
          <Link
            to="/register"
            className="bg-white text-teal-800 hover:bg-teal-50
                       px-8 py-4 rounded-xl font-bold shadow-xl whitespace-nowrap"
          >
            Get started →
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}