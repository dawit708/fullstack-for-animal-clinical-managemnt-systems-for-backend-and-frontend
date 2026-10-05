// src/pages/public/Services.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../layouts/PublicLayout';

// ============================================================
// SERVICE DATA — 6 cards matching the Figma
// ============================================================
const SERVICES = [
  {
    tag: 'GENERAL',
    title: 'Preventive Care',
    text: 'Routine wellness examinations, body condition scoring, parasite prevention, and nutritional counseling.',
  },
  {
    tag: 'DENTAL',
    title: 'Dental Cleaning & Oral Care',
    text: 'Comprehensive tartar removal, ultrasonic scaling, polishing, and oral health examinations under anesthesia.',
  },
  {
    tag: 'SURGERY',
    title: 'Soft Tissue & Surgical Procedures',
    text: 'Spay/neuter routines, soft tissue surgeries, mass removals, and emergency surgical interventions.',
  },
  {
    tag: 'GROOMING',
    title: 'Pet Grooming & Spa Treatments',
    text: 'Hydrating baths, breed-specific haircuts, nail trimming, ear cleaning, and gland expressions.',
  },
  {
    tag: 'DIAGNOSTICS',
    title: 'Digital Radiography & Imaging',
    text: 'High-definition digital X-rays and ultrasound diagnostics for quick, accurate internal evaluations.',
  },
  {
    tag: 'PREVENTIVE',
    title: 'Vaccinations & Immunization',
    text: 'Core and non-core vaccines tailored to protect your dog or cat against preventable contagious diseases.',
  },
];

// ============================================================
// FAQ DATA
// ============================================================
const FAQS = [
  {
    q: 'How often should I bring my pet for a checkup?',
    a: 'We recommend a wellness exam at least once a year for healthy adult pets. Puppies, kittens, and senior pets (over 7 years) should visit every 6 months for closer monitoring.',
  },
  {
    q: 'Do I need to fast my pet before surgery?',
    a: 'Yes — food should be withheld for 8–12 hours before anesthesia. Water is usually allowed up to 2 hours before the procedure. Our team will give you exact instructions when scheduling.',
  },
  {
    q: 'What vaccinations does my pet need?',
    a: 'Core vaccines for dogs include rabies, distemper, parvovirus, and adenovirus. For cats: rabies, feline herpesvirus, calicivirus, and panleukopenia. We tailor non-core vaccines based on lifestyle and risk.',
  },
  {
    q: 'Do you offer emergency services?',
    a: 'Yes — our clinic provides 24/7 emergency care. Call our hotline at +251 910 115 175 immediately if your pet is experiencing trauma, poisoning, difficulty breathing, or prolonged vomiting.',
  },
  {
    q: 'Can I stay with my pet during the appointment?',
    a: 'Absolutely. We encourage owners to stay during exams and consultations. For surgeries and procedures requiring anesthesia, we ask that you wait in our comfortable lobby.',
  },
  {
    q: 'Do you treat livestock and large animals?',
    a: 'Yes — our vets are experienced with cattle, horses, sheep, goats, and poultry. We offer both clinic visits and on-farm visits for large animals.',
  },
];

export default function Services() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <PublicLayout>
      {/* ============================================================
          MAIN BACKGROUND — soft cream
      ============================================================ */}
      <div className="bg-[#FAF8F3]">
        {/* ---------------- HERO ---------------- */}
        <section className="max-w-5xl mx-auto px-6 pt-16 pb-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                          bg-emerald-100/70 border border-emerald-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span className="text-[11px] font-extrabold tracking-[0.15em] text-emerald-800">
              COMPREHENSIVE MEDICAL SOLUTIONS
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-[56px] font-extrabold
                         text-gray-900 mt-6 leading-tight tracking-tight">
            Our Veterinary Services
          </h1>

          {/* Subtitle */}
          <p className="text-gray-600 mt-6 max-w-3xl mx-auto text-base md:text-lg
                        leading-relaxed">
            From preventive checkups to complex surgeries and spa grooming, we offer
            dedicated clinical care tailored to your pet&apos;s exact health needs.
          </p>
        </section>

        {/* ---------------- SERVICE CARDS ---------------- */}
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
            {SERVICES.map(s => (
              <ServiceCard key={s.title} {...s} />
            ))}
          </div>
        </section>

        {/* ---------------- DIVIDER ---------------- */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-px bg-gray-300/60" />
        </div>

        {/* ---------------- FAQ ---------------- */}
        <section className="max-w-4xl mx-auto px-6 py-20">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900
                         text-center mb-10">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {FAQS.map((f, i) => (
              <FaqItem
                key={f.q}
                {...f}
                isOpen={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? -1 : i)}
              />
            ))}
          </div>
        </section>

        {/* ---------------- CTA ---------------- */}
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <div className="rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-700
                          text-white p-10 lg:p-14 flex flex-col lg:flex-row items-center
                          justify-between gap-6">
            <div>
              <h2 className="text-3xl font-extrabold">
                Ready to book your pet&apos;s visit?
              </h2>
              <p className="text-emerald-100 mt-2">
                Same-day appointments available · 24/7 emergency line
              </p>
            </div>
            <Link
              to="/register"
              className="bg-white text-emerald-800 hover:bg-emerald-50
                         px-8 py-4 rounded-xl font-bold whitespace-nowrap
                         shadow-lg shadow-emerald-900/20"
            >
              Book appointment →
            </Link>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}

// ============================================================
// SERVICE CARD COMPONENT
// ============================================================
function ServiceCard({ tag, title, text }) {
  return (
    <div className="group relative bg-white border border-gray-200 rounded-2xl
                    p-6 lg:p-7 flex flex-col min-h-[260px]
                    transition-all duration-300
                    hover:border-emerald-300 hover:shadow-xl hover:-translate-y-1">
      {/* Tag pill — top-right */}
      <span className="self-end text-[10px] font-extrabold tracking-[0.12em]
                       text-emerald-800 bg-emerald-100/80
                       px-3 py-1.5 rounded-full">
        {tag}
      </span>

      {/* Title */}
      <h3 className="text-xl lg:text-[22px] font-extrabold text-gray-900 mt-6
                     leading-tight">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm lg:text-[15px] text-gray-600 mt-4 leading-relaxed flex-1">
        {text}
      </p>

      {/* Divider + arrow row */}
      <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between">
        <Link
          to="/contact"
          className="text-xs font-bold text-emerald-700
                     opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Learn more
        </Link>
        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700
                        grid place-items-center text-sm
                        transition-transform group-hover:translate-x-1">
          →
        </div>
      </div>
    </div>
  );
}

// ============================================================
// FAQ ITEM COMPONENT
// ============================================================
function FaqItem({ q, a, isOpen, onToggle }) {
  return (
    <div
      className={`bg-white border rounded-2xl overflow-hidden transition-all ${
        isOpen ? 'border-emerald-300 shadow-md' : 'border-gray-200'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4
                   px-6 py-5 text-left"
      >
        <span className="font-bold text-gray-900 text-[15px] lg:text-base">
          {q}
        </span>
        <svg
          className={`w-5 h-5 flex-shrink-0 text-emerald-700 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-5 text-sm lg:text-[15px] text-gray-600 leading-relaxed">
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}