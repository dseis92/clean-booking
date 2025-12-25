import Link from "next/link";

export function ServiceCards() {
  return (
    <section className="py-16 bg-zinc-50">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-zinc-900 mb-3">
            Our Services
          </h2>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            Professional cleaning tailored to your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Residential */}
          <div className="group relative overflow-hidden rounded-2xl bg-white border-2 border-zinc-200 hover:border-emerald-300 hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-bl-full" />

            <div className="relative p-8">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>

              <h3 className="text-2xl font-bold text-zinc-900 mb-3">
                Residential Cleaning
              </h3>

              <p className="text-zinc-600 mb-6">
                Keep your home sparkling clean with our professional residential cleaning services. From apartments to large homes.
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  "Standard & deep cleaning",
                  "Move-in / move-out services",
                  "Customizable packages",
                  "Eco-friendly products",
                ].map((item, index) => (
                  <li key={index} className="flex items-center text-zinc-700">
                    <svg className="w-5 h-5 text-emerald-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/book"
                className="inline-flex items-center text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
              >
                Get instant estimate
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Commercial */}
          <div className="group relative overflow-hidden rounded-2xl bg-white border-2 border-zinc-200 hover:border-emerald-300 hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-500/10 to-emerald-500/10 rounded-bl-full" />

            <div className="relative p-8">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>

              <h3 className="text-2xl font-bold text-zinc-900 mb-3">
                Commercial Cleaning
              </h3>

              <p className="text-zinc-600 mb-6">
                Maintain a pristine workplace with our commercial cleaning services. Offices, retail, clinics, and restaurants.
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  "Office & retail spaces",
                  "Medical & salon facilities",
                  "Restaurant cleaning",
                  "Flexible scheduling",
                ].map((item, index) => (
                  <li key={index} className="flex items-center text-zinc-700">
                    <svg className="w-5 h-5 text-teal-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/book"
                className="inline-flex items-center text-teal-600 font-semibold hover:text-teal-700 transition-colors"
              >
                Get instant estimate
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
