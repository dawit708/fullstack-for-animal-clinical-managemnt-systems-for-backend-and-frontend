// src/pages/public/Contact.jsx
import { useState } from 'react';
import PublicLayout from '../../layouts/PublicLayout';
import { toast } from 'react-toastify';

// ============================================================
// CONTACT DETAILS
// ============================================================
const CONTACT_CARDS = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
        <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.42 0-8 2.24-8 5v2h16v-2c0-2.76-3.58-5-8-5Z" />
      </svg>
    ),
    label: 'Full Name',
    value: 'Dejene Abebe Negewo',
    href: null,
    glow: false,
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
        <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7 12.8 12.8 0 0 0 .7 2.8 2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4 12.8 12.8 0 0 0 2.8.7 2 2 0 0 1 1.7 2Z" />
      </svg>
    ),
    label: 'Mobile No.',
    value: '0910037682 / 0910115175',
    href: 'tel:+251910037682',
    glow: false,
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
        <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm8 9L4.5 8.5v9h15v-9L12 13Z" />
      </svg>
    ),
    label: 'Email',
    value: 'biniyamtegegne21@gmail.com',
    href: 'mailto:biniyamtegegne21@gmail.com',
    glow: true, // ⭐ has purple glow in Figma
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
        <path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7Zm0 9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      </svg>
    ),
    label: 'Address',
    value: 'Addis Abeba, Ethiopia',
    href: 'https://maps.google.com/?q=Addis+Ababa',
    glow: false,
  },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      return toast.error('Please fill in name, email and message');
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success('Message sent! We’ll reply within 24 hours ✅');
      setForm({ name: '', email: '', message: '' });
    }, 800);
  };

  return (
    <PublicLayout>
      <div className="bg-[#0A0A0F] text-zinc-200">
        {/* ============================================================
            HERO — "Get in Touch"
        ============================================================ */}
        <section className="max-w-6xl mx-auto px-6 pt-20 pb-12 text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight">
            <span className="text-white">Get in </span>
            <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-blue-500
                             bg-clip-text text-transparent">
              Touch
            </span>
          </h1>

          <p className="text-zinc-400 mt-6 max-w-2xl mx-auto text-base md:text-lg
                        leading-relaxed">
            Have a question or want to work together? I&apos;d love to hear from you.
          </p>
        </section>

        {/* ============================================================
            TWO-COLUMN: Image + Form
        ============================================================ */}
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">

            {/* ---------- LEFT: Image / Illustration ---------- */}
            <div className="relative rounded-3xl overflow-hidden border border-white/5
                            bg-gradient-to-br from-purple-900/40 via-[#111118] to-blue-900/30
                            min-h-[420px] flex items-end">
              {/* Decorative image stand-in */}
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center px-8">
                  <div className="text-[8rem] opacity-30">📞</div>
                </div>
              </div>

              {/* Content overlay */}
              <div className="relative z-10 p-8 lg:p-10 w-full
                              bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                <p className="text-[11px] font-bold tracking-[0.15em] text-purple-300 mb-2">
                  LET&apos;S TALK
                </p>
                <h2 className="text-2xl lg:text-3xl font-extrabold text-white leading-tight">
                  We&apos;re here for you<br />and your pet.
                </h2>
                <p className="text-zinc-400 text-sm mt-3 max-w-sm">
                  Whether it&apos;s an emergency, a routine check-up, or just a
                  question — we reply within 24 hours.
                </p>

                {/* Trust markers */}
                <div className="flex flex-wrap gap-3 mt-6">
                  {['24/7 Emergency', 'Same-day appts', '5.000+ pets'].map(t => (
                    <span key={t}
                          className="text-xs font-semibold text-zinc-300
                                     bg-white/5 border border-white/10
                                     px-3 py-1.5 rounded-full backdrop-blur">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ---------- RIGHT: Form ---------- */}
            <form
              onSubmit={submit}
              className="rounded-3xl bg-[#111118] border border-white/5
                         p-8 lg:p-10 flex flex-col justify-center"
            >
              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Your Name
                  </label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Enter your name"
                    className="w-full bg-[#16161F] border border-white/5 rounded-xl
                               px-5 py-4 text-white placeholder:text-zinc-500
                               text-[15px] outline-none
                               focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20
                               transition-all"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Your Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="Enter your email"
                    className="w-full bg-[#16161F] border border-white/5 rounded-xl
                               px-5 py-4 text-white placeholder:text-zinc-500
                               text-[15px] outline-none
                               focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20
                               transition-all"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Your Message
                  </label>
                  <textarea
                    rows={5}
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Tell me about your project…"
                    className="w-full bg-[#16161F] border border-white/5 rounded-xl
                               px-5 py-4 text-white placeholder:text-zinc-500
                               text-[15px] outline-none resize-none
                               focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20
                               transition-all"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600
                             hover:from-purple-500 hover:to-blue-500
                             text-white font-bold py-4 rounded-xl
                             shadow-lg shadow-purple-500/25
                             transition-all disabled:opacity-60
                             flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white
                                      rounded-full animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      Send Message
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* ============================================================
            "Or reach me directly"
        ============================================================ */}
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">
              Or reach me directly
            </h2>
            <div className="w-16 h-1 mx-auto mt-4 rounded-full
                            bg-gradient-to-r from-purple-500 to-blue-500" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CONTACT_CARDS.map(card => (
              <ContactCard key={card.label} {...card} />
            ))}
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}

// ============================================================
// CONTACT CARD COMPONENT
// ============================================================
function ContactCard({ icon, label, value, href, glow }) {
  const Wrapper = href ? 'a' : 'div';
  const wrapperProps = href
    ? { href, target: href.startsWith('http') ? '_blank' : undefined, rel: 'noopener noreferrer' }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={`relative block rounded-3xl p-8
                  bg-[#111118] border
                  transition-all duration-300
                  hover:-translate-y-1
                  ${glow
                    ? 'border-purple-500/50 shadow-[0_0_40px_-5px_rgba(139,92,246,0.4)]'
                    : 'border-white/5 hover:border-white/10'
                  }`}
    >
      {/* Icon circle */}
      <div className="flex justify-center mb-5">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10
                        grid place-items-center">
          {icon}
        </div>
      </div>

      {/* Label */}
      <h3 className="text-center text-xl font-extrabold text-white mb-3">
        {label}
      </h3>

      {/* Value */}
      <p className="text-center text-zinc-400 text-sm break-words">
        {value}
      </p>
    </Wrapper>
  );
}