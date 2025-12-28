"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { HowItWorks } from "@/components/home/HowItWorks";
import { TrustBadges } from "@/components/home/TrustBadges";
import { ServiceCards } from "@/components/home/ServiceCards";
import { FeatureCard } from "@/components/home/FeatureCard";

export default function Home() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Sophisticated mesh gradient background */}
        <div className="absolute inset-0" style={{ background: 'var(--gradient-mesh)', backgroundColor: 'var(--color-sand-50)' }} />

        {/* Organic blob shapes */}
        <div
          className="absolute top-[10%] right-[5%] w-[500px] h-[500px] opacity-20 animate-morph"
          style={{
            background: 'radial-gradient(circle, rgba(20, 184, 154, 0.4) 0%, rgba(14, 165, 146, 0.2) 50%, transparent 100%)',
            filter: 'blur(60px)'
          }}
        />
        <div
          className="absolute bottom-[15%] left-[8%] w-[400px] h-[400px] opacity-15 animate-morph"
          style={{
            background: 'radial-gradient(circle, rgba(34, 211, 189, 0.3) 0%, rgba(20, 184, 154, 0.15) 50%, transparent 100%)',
            filter: 'blur(50px)',
            animationDelay: '3s'
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Hero Content */}
            <div className="lg:col-span-7 animate-slide-up">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-sm font-medium mb-8 sparkle-container"
                   style={{
                     background: 'rgba(20, 184, 154, 0.08)',
                     border: '1px solid rgba(20, 184, 154, 0.2)',
                     color: 'var(--color-primary-700)'
                   }}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Licensed & Eco-Friendly Since 2020</span>
              </div>

              <h1 className="font-display text-6xl md:text-7xl lg:text-8xl leading-[0.95] mb-6"
                  style={{ color: 'var(--foreground)' }}>
                Professional
                <br />
                <span className="font-display-light italic" style={{
                  background: 'var(--gradient-primary)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Cleaning,
                </span>
                <br />
                Instant Pricing
              </h1>

              <p className="text-xl md:text-2xl leading-relaxed mb-10" style={{ color: 'rgba(26, 26, 26, 0.7)' }}>
                Book residential or commercial cleaning in minutes.
                <br className="hidden md:block" />
                Transparent pricing, exceptional results.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link href="/book" className="btn-playful group relative px-8 py-4 rounded-2xl text-white font-semibold text-lg overflow-hidden transition-all animate-scale-in inline-flex items-center justify-center no-underline"
                      style={{
                        background: 'var(--gradient-primary)',
                        boxShadow: 'var(--shadow-xl)',
                        animationDelay: '500ms'
                      }}
                      onMouseEnter={(e) => e.currentTarget.classList.add('animate-bounce')}
                      onAnimationEnd={(e) => e.currentTarget.classList.remove('animate-bounce')}>
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Get Instant Estimate
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>

                <button className="px-8 py-4 rounded-2xl font-semibold text-lg transition-all animate-scale-in card-lift"
                        style={{
                          background: 'var(--background-elevated)',
                          border: '2px solid rgba(20, 184, 154, 0.2)',
                          color: 'var(--color-primary-700)',
                          boxShadow: 'var(--shadow-sm)',
                          animationDelay: '600ms'
                        }}
                        onMouseEnter={(e) => e.currentTarget.classList.add('animate-wiggle')}
                        onAnimationEnd={(e) => e.currentTarget.classList.remove('animate-wiggle')}>
                  Learn More
                </button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8"
                   style={{ borderTop: '1px solid rgba(20, 184, 154, 0.15)' }}>
                <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
                  <div className="font-display text-4xl mb-1" style={{ color: 'var(--color-primary-600)' }}>50<span className="text-2xl">mi</span></div>
                  <div className="text-sm font-medium" style={{ color: 'rgba(26, 26, 26, 0.5)' }}>Service Radius</div>
                </div>
                <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
                  <div className="font-display text-4xl mb-1" style={{ color: 'var(--color-primary-600)' }}>100<span className="text-2xl">%</span></div>
                  <div className="text-sm font-medium" style={{ color: 'rgba(26, 26, 26, 0.5)' }}>Eco-Friendly</div>
                </div>
                <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
                  <div className="font-display text-4xl mb-1" style={{ color: 'var(--color-primary-600)' }}>24<span className="text-2xl">/7</span></div>
                  <div className="text-sm font-medium" style={{ color: 'rgba(26, 26, 26, 0.5)' }}>Booking</div>
                </div>
              </div>
            </div>

            {/* Hero Image Placeholder / Features */}
            <div className="lg:col-span-5 relative animate-slide-up animate-float" style={{ animationDelay: '150ms' }}>
              <div className="relative rounded-3xl p-10 sparkle-container card-lift"
                   style={{
                     background: 'var(--gradient-card)',
                     boxShadow: 'var(--shadow-2xl)',
                     border: '1px solid rgba(20, 184, 154, 0.1)'
                   }}>
                {/* Subtle accent corner */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10 animate-glow"
                     style={{
                       background: 'radial-gradient(circle at top right, var(--color-primary-400) 0%, transparent 70%)',
                       borderTopRightRadius: '1.5rem'
                     }} />

                <div className="space-y-7 relative z-10">
                  <FeatureCard
                    icon={
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    }
                    title="Instant Estimates"
                    description="See your price in real-time as you customize your service"
                  />

                  <FeatureCard
                    icon={
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                    title="Transparent Pricing"
                    description="No hidden fees. See exactly what you pay before booking"
                  />

                  <FeatureCard
                    icon={
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    }
                    title="Satisfaction Guaranteed"
                    description="We'll make it right or your money back, no questions asked"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <TrustBadges />

      {/* How It Works */}
      <HowItWorks />

      {/* Services */}
      <ServiceCards />

      {/* CTA Section */}
      <section className="relative py-32 overflow-hidden">
        {/* Sophisticated gradient background */}
        <div className="absolute inset-0" style={{ background: 'var(--gradient-primary)' }} />

        {/* Organic blob overlay */}
        <div
          className="absolute top-0 left-0 w-[600px] h-[600px] opacity-30 animate-morph"
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)',
            filter: 'blur(80px)'
          }}
        />

        <div className="relative mx-auto max-w-5xl px-6 md:px-8 text-center">
          <h2 className="font-display text-5xl md:text-6xl lg:text-7xl text-white leading-tight mb-6">
            Ready for a
            <br />
            <span className="font-display-light italic">Sparkling</span> Clean Space?
          </h2>
          <p className="text-xl md:text-2xl mb-12" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            Get your instant estimate and book your cleaning service today
          </p>
          <Link href="/book" className="btn-playful group px-10 py-5 rounded-2xl font-bold text-lg transition-all animate-heartbeat inline-flex items-center justify-center no-underline"
                style={{
                  background: 'white',
                  color: 'var(--color-primary-700)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
                }}
                onMouseEnter={(e) => e.currentTarget.classList.add('animate-bounce')}
                onAnimationEnd={(e) => e.currentTarget.classList.remove('animate-bounce')}>
            <span className="flex items-center justify-center gap-2">
              Book Your Cleaning Now
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16" style={{ background: 'var(--foreground)', color: 'rgba(255, 255, 255, 0.6)' }}>
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <h3 className="font-display text-2xl text-white mb-4">About Us</h3>
              <p className="text-sm leading-relaxed">
                Professional cleaning services with eco-friendly products. Licensed, insured, and dedicated to your satisfaction since 2020.
              </p>
            </div>
            <div>
              <h3 className="font-display text-2xl text-white mb-4">Quick Links</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/book" className="hover:text-white transition-colors duration-300">
                    Book Now
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="hover:text-white transition-colors duration-300">
                    Admin Portal
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-display text-2xl text-white mb-4">Service Area</h3>
              <p className="text-sm leading-relaxed">
                We proudly serve within 50 miles of ZIP codes: 54481, 54482, 54492
              </p>
            </div>
          </div>
          <div className="pt-8 text-center text-sm" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <p>&copy; {new Date().getFullYear()} Eco-Friendly Cleaning Services. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
