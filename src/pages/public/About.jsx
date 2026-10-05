// src/pages/public/About.jsx
import PublicLayout from '../../layouts/PublicLayout';

export default function About() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-12 text-center">
        <p className="text-xs font-bold text-teal-700 tracking-wider">ABOUT US</p>
        <h1 className="text-4xl lg:text-5xl font-extrabold text-teal-950 mt-3">
          Caring for pets since 2015
        </h1>
        <p className="text-gray-600 mt-5 max-w-2xl mx-auto">
          VetraCare started as a single clinic with one goal: give every pet the
          same level of medical care humans receive. Today we’re a network of
          three branches, a full diagnostic lab, and an on-site pharmacy.
        </p>
      </section>

      {/* Story + image */}
      <section className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-2 gap-12 items-center">
        <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-teal-100 to-emerald-50
                        border border-teal-100 grid place-items-center text-[8rem]">
          🏥
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-teal-950 mb-4">Our story</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            What began as a small practice in Addis Ababa has grown into one of
            Ethiopia’s most trusted veterinary clinics. We combine modern
            diagnostics with a genuinely personal approach — because pets are family.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Every member of our team — from vets to pharmacists to front-desk staff —
            is committed to the same thing: making sure your pet leaves healthier
            than when they arrived.
          </p>

          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              { n: '10+',  l: 'Years of care' },
              { n: '3',    l: 'Branches' },
              { n: '25+',  l: 'Team members' },
            ].map(s => (
              <div key={s.l} className="bg-teal-50 rounded-2xl p-4 text-center">
                <p className="text-2xl font-extrabold text-teal-800">{s.n}</p>
                <p className="text-xs text-teal-700 mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-gray-50/60 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-teal-950">Our values</h2>
            <p className="text-gray-500 mt-3">What guides every decision we make.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '❤️', t: 'Compassion first',
                d: 'We treat every animal as if it were our own.' },
              { icon: '🔬', t: 'Clinical excellence',
                d: 'Evidence-based medicine, always. No shortcuts.' },
              { icon: '🤝', t: 'Radical transparency',
                d: 'Clear pricing, honest advice, no surprises.' },
            ].map(v => (
              <div key={v.t} className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="w-12 h-12 rounded-xl bg-teal-50 grid place-items-center text-2xl mb-4">
                  {v.icon}
                </div>
                <h3 className="font-bold text-gray-900">{v.t}</h3>
                <p className="text-sm text-gray-500 mt-2">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-teal-950">Meet the team</h2>
          <p className="text-gray-500 mt-3">Experienced professionals who love what they do.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { n: 'Dr. Avery Johnson', r: 'Chief Veterinarian',   i: 'AJ' },
            { n: 'Dr. Yonas Bekele',  r: 'Surgeon',              i: 'YB' },
            { n: 'Selam Tesfaye',     r: 'Head Pharmacist',      i: 'ST' },
            { n: 'Dr. Marta Girma',   r: 'Lab Director',         i: 'MG' },
          ].map(m => (
            <div key={m.n} className="text-center">
              <div className="w-28 h-28 mx-auto rounded-full bg-teal-100 text-teal-800
                              grid place-items-center text-2xl font-extrabold mb-3">
                {m.i}
              </div>
              <p className="font-bold text-gray-900 text-sm">{m.n}</p>
              <p className="text-xs text-gray-500">{m.r}</p>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}