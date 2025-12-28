"use client";

import { useMemo, useState } from "react";
import { PRICING, estimateCommercial, estimateResidential } from "@/lib/pricing";
import Link from "next/link";
import { MapboxAddressInput } from "@/components/mapbox/MapboxAddressInput";

type BookingType = "residential" | "commercial";
type CleanLevel = "light" | "standard" | "heavy" | "deepReset";
type BizType = "office" | "retail" | "clinic" | "restaurant";
type Frequency = "weekly" | "biweekly" | "monthly";

function money(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export default function BookPage() {
  const [step, setStep] = useState(0);

  // Shared
  const [addressText, setAddressText] = useState("");
  const [distanceMiles, setDistanceMiles] = useState<number>(0);
  const [selectedCoordinates, setSelectedCoordinates] = useState<[number, number] | null>(null);
  const [bookingType, setBookingType] = useState<BookingType>("residential");
  const [cleanLevel, setCleanLevel] = useState<CleanLevel>("standard");
  const [afterHours, setAfterHours] = useState(false);

  // Residential
  const [sqft, setSqft] = useState<number>(1500);
  const [beds, setBeds] = useState<number>(2);
  const [baths, setBaths] = useState<number>(1);
  const [kind, setKind] = useState<"standard" | "deep">("standard");
  const [isMoveOut, setIsMoveOut] = useState(false);

  // Commercial
  const [bizType, setBizType] = useState<BizType>("office");
  const [restrooms, setRestrooms] = useState<number>(1);
  const [frequency, setFrequency] = useState<Frequency>("monthly");

  // Add-ons
  const addOnCatalog = bookingType === "residential" ? PRICING.addOns.residential : PRICING.addOns.commercial;
  const [addOns, setAddOns] = useState<Record<string, boolean>>({});

  // Schedule (simple MVP)
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [scheduledWindow, setScheduledWindow] = useState<string>("");

  // Customer
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const addOnsTotal = useMemo(() => {
    return addOnCatalog.reduce((sum, a) => sum + (addOns[a.key] ? a.price : 0), 0);
  }, [addOns, addOnCatalog]);

  const estimate = useMemo(() => {
    if (bookingType === "residential") {
      return estimateResidential({
        sqft, beds, baths,
        cleanLevel,
        kind,
        isMoveOut,
        addOnsTotal,
        miles: distanceMiles,
        afterHours,
      });
    }
    return estimateCommercial({
      sqft,
      restrooms,
      businessType: bizType,
      frequency,
      addOnsTotal,
      miles: distanceMiles,
      afterHours,
    });
  }, [bookingType, sqft, beds, baths, cleanLevel, kind, isMoveOut, addOnsTotal, distanceMiles, afterHours, bizType, restrooms, frequency]);

  async function submit() {
    if (!estimate.ok) return;

    const payload = {
      bookingType,
      addressText,
      distanceMiles,
      scheduledDate: scheduledDate || undefined,
      scheduledWindow: scheduledWindow || undefined,
      estimateShown: estimate.shown,
      internalLow: "internalLow" in estimate ? estimate.internalLow : undefined,
      internalHigh: "internalHigh" in estimate ? estimate.internalHigh : undefined,
      input: {
        bookingType,
        cleanLevel,
        afterHours,
        sqft,
        beds,
        baths,
        kind,
        isMoveOut,
        bizType,
        restrooms,
        frequency,
        addOns,
        addOnsTotal,
      },
      customer: { name, phone, email },
    };

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(`Booking failed: ${j?.error ?? "Unknown error"}`);
      return;
    }

    alert("Booked! You’ll get a confirmation message soon.");
    setStep(0);
  }

  const canContinue =
    (step === 0 && addressText.trim().length >= 5) ||
    (step === 1) ||
    (step === 2) ||
    (step === 3) ||
    (step === 4) ||
    (step === 5) ||
    (step === 6 && name.trim().length >= 2 && phone.trim().length >= 7 && email.includes("@"));

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      {/* Refined Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg" style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderBottom: '1px solid rgba(20, 184, 154, 0.1)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div className="mx-auto max-w-4xl px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="flex items-center gap-2 transition-all duration-300 hover:gap-3" style={{ color: 'var(--color-primary-700)' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-semibold">Home</span>
            </Link>
            <div className="font-display text-lg" style={{ color: 'var(--foreground)' }}>
              Step {step + 1} <span style={{ color: 'var(--color-primary-500)' }}>of 7</span>
            </div>
          </div>

          {/* Sophisticated Progress Bar */}
          <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(20, 184, 154, 0.1)' }}>
            <div
              className="absolute h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${((step + 1) / 7) * 100}%`,
                background: 'var(--gradient-primary)',
                boxShadow: 'var(--shadow-glow)'
              }}
            />
          </div>
        </div>
      </header>

      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-transparent pointer-events-none" />

        <div className="relative mx-auto max-w-2xl px-6 py-8 md:py-10">
          {/* Sophisticated Floating Estimate Card */}
          <div className="sticky top-24 z-40 mb-8">
            <div className="rounded-3xl p-6 backdrop-blur-lg transition-all duration-500 sparkle-container"
                 style={{
                   background: 'var(--gradient-card)',
                   border: '1px solid rgba(20, 184, 154, 0.15)',
                   boxShadow: 'var(--shadow-xl)'
                 }}>
              {!estimate.ok ? (
                <div className="text-center">
                  <div className="font-display text-xl mb-1" style={{ color: 'var(--foreground)' }}>
                    {estimate.reason === "OUT_OF_RANGE" ? "Outside service area" : "Custom quote needed"}
                  </div>
                  <div className="text-sm" style={{ color: 'rgba(26, 26, 26, 0.5)' }}>
                    We'll contact you with a personalized quote
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="text-xs font-semibold mb-1 tracking-wider uppercase" style={{ color: 'var(--color-primary-600)' }}>
                      Your Estimate
                    </div>
                    <div className="font-display text-4xl md:text-5xl" style={{
                      background: 'var(--gradient-primary)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>
                      {money(estimate.shown)}
                    </div>
                  </div>
                  {(estimate as any)?.meta && (
                    <div className="flex flex-col gap-2 text-xs font-medium" style={{ color: 'rgba(26, 26, 26, 0.6)' }}>
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {(estimate as any).meta.hours} hrs
                      </span>
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {money((estimate as any).meta.travelFee)} travel
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Step Content with Refined Animation */}
          <div className="relative" style={{ minHeight: '450px' }}>
            <div
              key={step}
              className="rounded-3xl p-8 md:p-10 animate-slide-up"
              style={{
                background: 'var(--gradient-card)',
                border: '1px solid rgba(20, 184, 154, 0.1)',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
            {step === 0 && (
              <section className="space-y-6">
                <div>
                  <h2 className="font-display text-3xl md:text-4xl mb-2" style={{ color: 'var(--foreground)' }}>
                    Where should we clean?
                  </h2>
                  <p className="text-base" style={{ color: 'rgba(26, 26, 26, 0.5)' }}>
                    Search for your address and see if you're in our service area
                  </p>
                </div>
                <MapboxAddressInput
                  value={addressText}
                  distance={distanceMiles}
                  onAddressChange={(address, coordinates) => {
                    setAddressText(address);
                    setSelectedCoordinates(coordinates);
                  }}
                  onDistanceChange={(miles) => setDistanceMiles(miles)}
                />
              </section>
            )}

            {step === 1 && (
              <section className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900 mb-1">What are we cleaning?</h2>
                  <p className="text-sm text-zinc-500">Choose your property type</p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <button
                    className={`selection-card group rounded-2xl border-2 px-6 py-6 text-left ${
                      bookingType === "residential" ? "selected" : ""
                    }`}
                    style={{
                      borderColor: bookingType === "residential" ? 'var(--color-primary-500)' : 'rgba(20, 184, 154, 0.2)',
                      background: bookingType === "residential" ? 'linear-gradient(to bottom right, rgba(20, 184, 154, 0.08), rgba(34, 211, 189, 0.08))' : 'white',
                      boxShadow: bookingType === "residential" ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
                      transform: bookingType === "residential" ? 'scale(1.02)' : 'scale(1)'
                    }}
                    onClick={() => setBookingType("residential")}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                        bookingType === "residential" ? "bg-emerald-500" : "bg-zinc-200 group-hover:bg-emerald-200"
                      }`}>
                        <svg className={`w-6 h-6 ${bookingType === "residential" ? "text-white" : "text-zinc-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-lg text-zinc-900 mb-0.5">Home / Apartment</div>
                        <div className="text-sm text-zinc-600">Residential cleaning services</div>
                      </div>
                      {bookingType === "residential" && (
                        <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>

                  <button
                    className={`selection-card group rounded-2xl border-2 px-6 py-6 text-left ${
                      bookingType === "commercial" ? "selected" : ""
                    }`}
                    style={{
                      borderColor: bookingType === "commercial" ? 'var(--color-primary-500)' : 'rgba(20, 184, 154, 0.2)',
                      background: bookingType === "commercial" ? 'linear-gradient(to bottom right, rgba(20, 184, 154, 0.08), rgba(34, 211, 189, 0.08))' : 'white',
                      boxShadow: bookingType === "commercial" ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
                      transform: bookingType === "commercial" ? 'scale(1.02)' : 'scale(1)'
                    }}
                    onClick={() => setBookingType("commercial")}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                        bookingType === "commercial" ? "bg-emerald-500" : "bg-zinc-200 group-hover:bg-emerald-200"
                      }`}>
                        <svg className={`w-6 h-6 ${bookingType === "commercial" ? "text-white" : "text-zinc-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-lg text-zinc-900 mb-0.5">Business / Commercial</div>
                        <div className="text-sm text-zinc-600">Office, retail, restaurant spaces</div>
                      </div>
                      {bookingType === "commercial" && (
                        <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                </div>
              </section>
            )}

            {step === 2 && bookingType === "residential" && (
              <section className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900 mb-1">Tell us about the home</h2>
                  <p className="text-sm text-zinc-500">Help us estimate accurately</p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-zinc-700 mb-2 block">Square footage</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border-2 border-zinc-200 px-4 py-3 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none bg-zinc-50 focus:bg-white"
                      placeholder="1500"
                      value={sqft}
                      onChange={(e) => setSqft(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-zinc-700 mb-2 block">Service type</label>
                    <select
                      className="w-full rounded-xl border-2 border-zinc-200 px-4 py-3 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none bg-zinc-50 focus:bg-white"
                      value={kind}
                      onChange={(e) => setKind(e.target.value as any)}
                    >
                      <option value="standard">Standard</option>
                      <option value="deep">Deep</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium text-zinc-700 mb-2 block">Bedrooms</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border-2 border-zinc-200 px-4 py-3 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none bg-zinc-50 focus:bg-white"
                      value={beds}
                      onChange={(e) => setBeds(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-zinc-700 mb-2 block">Bathrooms</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border-2 border-zinc-200 px-4 py-3 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none bg-zinc-50 focus:bg-white"
                      value={baths}
                      onChange={(e) => setBaths(Number(e.target.value))}
                    />
                  </div>
                  <label className="flex items-center gap-3 px-4 py-3 bg-zinc-50 rounded-xl border-2 border-zinc-200 cursor-pointer hover:bg-zinc-100 transition-colors">
                    <input
                      id="moveout"
                      type="checkbox"
                      className="w-5 h-5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                      checked={isMoveOut}
                      onChange={(e) => setIsMoveOut(e.target.checked)}
                    />
                    <span className="text-sm font-medium text-zinc-700">Move-in/out</span>
                  </label>
                </div>
              </section>
            )}

            {step === 2 && bookingType === "commercial" && (
              <section className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900 mb-1">Tell us about the space</h2>
                  <p className="text-sm text-zinc-500">Business details for accurate pricing</p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium text-zinc-700 mb-2 block">Business type</label>
                    <select
                      className="w-full rounded-xl border-2 border-zinc-200 px-4 py-3 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none bg-zinc-50 focus:bg-white"
                      value={bizType}
                      onChange={(e) => setBizType(e.target.value as BizType)}
                    >
                      <option value="office">Office</option>
                      <option value="retail">Retail</option>
                      <option value="clinic">Salon / Clinic</option>
                      <option value="restaurant">Restaurant</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-zinc-700 mb-2 block">Square footage</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border-2 border-zinc-200 px-4 py-3 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none bg-zinc-50 focus:bg-white"
                      value={sqft}
                      onChange={(e) => setSqft(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-zinc-700 mb-2 block">Restrooms</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border-2 border-zinc-200 px-4 py-3 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none bg-zinc-50 focus:bg-white"
                      value={restrooms}
                      onChange={(e) => setRestrooms(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-zinc-700 mb-2 block">Frequency</label>
                  <select
                    className="w-full rounded-xl border-2 border-zinc-200 px-4 py-3 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none bg-zinc-50 focus:bg-white"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as Frequency)}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="biweekly">Biweekly (-5%)</option>
                    <option value="weekly">Weekly (-10%)</option>
                  </select>
                </div>
              </section>
            )}

            {step === 3 && (
              <section className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900 mb-1">How deep do you want to go?</h2>
                  <p className="text-sm text-zinc-500">Select your cleaning intensity</p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {(["light","standard","heavy","deepReset"] as CleanLevel[]).map((lvl, idx) => (
                    <button
                      key={lvl}
                      className={`selection-card rounded-2xl border-2 px-5 py-5 text-left animate-slide-in-right ${
                        cleanLevel === lvl ? "selected" : ""
                      }`}
                      style={{
                        borderColor: cleanLevel === lvl ? 'var(--color-primary-500)' : 'rgba(20, 184, 154, 0.2)',
                        background: cleanLevel === lvl ? 'linear-gradient(to bottom right, rgba(20, 184, 154, 0.08), rgba(34, 211, 189, 0.08))' : 'white',
                        boxShadow: cleanLevel === lvl ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
                        transform: cleanLevel === lvl ? 'scale(1.01)' : 'scale(1)',
                        animationDelay: `${idx * 100}ms`
                      }}
                      onClick={() => setCleanLevel(lvl)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-bold text-lg text-zinc-900 mb-1">
                            {lvl === "deepReset" ? "Deep Reset" : lvl[0].toUpperCase() + lvl.slice(1)}
                          </div>
                          <div className="text-sm text-zinc-600">
                            {lvl === "light" && "Maintained home/space"}
                            {lvl === "standard" && "Normal clean"}
                            {lvl === "heavy" && "Catch-up / extra buildup"}
                            {lvl === "deepReset" && "Detailed first-time reset"}
                          </div>
                        </div>
                        {cleanLevel === lvl && (
                          <svg className="w-6 h-6 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-3 px-5 py-4 bg-zinc-50 rounded-xl border-2 border-zinc-200 cursor-pointer hover:bg-zinc-100 transition-all">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                    checked={afterHours}
                    onChange={(e) => setAfterHours(e.target.checked)}
                  />
                  <span className="text-sm font-medium text-zinc-900">After-hours service <span className="text-zinc-500">(+15%)</span></span>
                </label>
              </section>
            )}

            {step === 4 && (
              <section className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900 mb-1">Add-ons</h2>
                  <p className="text-sm text-zinc-500">Customize your cleaning service</p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {addOnCatalog.map((a) => (
                    <label
                      key={a.key}
                      className="flex items-center justify-between rounded-xl border-2 border-zinc-200 px-5 py-4 cursor-pointer hover:border-emerald-300 hover:bg-zinc-50 transition-all has-[:checked]:border-emerald-500 has-[:checked]:bg-gradient-to-br has-[:checked]:from-emerald-50 has-[:checked]:to-teal-50"
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className="w-5 h-5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                          checked={!!addOns[a.key]}
                          onChange={(e) => setAddOns((p) => ({ ...p, [a.key]: e.target.checked }))}
                        />
                        <span className="text-sm font-medium text-zinc-900">{a.label}</span>
                      </span>
                      <span className="text-sm font-bold text-emerald-700">+{money(a.price)}</span>
                    </label>
                  ))}
                </div>
                {addOnsTotal > 0 && (
                  <div className="text-sm font-medium text-zinc-900 bg-gradient-to-br from-emerald-50 to-teal-50 px-5 py-4 rounded-xl border-2 border-emerald-200">
                    Add-ons total: <span className="text-emerald-700 font-bold text-lg">{money(addOnsTotal)}</span>
                  </div>
                )}
              </section>
            )}

            {step === 5 && (
              <section className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900 mb-1">Schedule</h2>
                  <p className="text-sm text-zinc-500">When would you like us to clean?</p>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-zinc-700 mb-2 block">Date</label>
                    <input
                      type="date"
                      className="w-full rounded-xl border-2 border-zinc-200 px-4 py-3 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none bg-zinc-50 focus:bg-white"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-zinc-700 mb-2 block">Time window</label>
                    <select
                      className="w-full rounded-xl border-2 border-zinc-200 px-4 py-3 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none bg-zinc-50 focus:bg-white"
                      value={scheduledWindow}
                      onChange={(e) => setScheduledWindow(e.target.value)}
                    >
                      <option value="">Pick a window</option>
                      <option value="9-11">9–11 AM</option>
                      <option value="11-1">11 AM–1 PM</option>
                      <option value="1-3">1–3 PM</option>
                      <option value="3-5">3–5 PM</option>
                    </select>
                  </div>
                </div>
              </section>
            )}

            {step === 6 && (
              <section className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900 mb-1">Almost done!</h2>
                  <p className="text-sm text-zinc-500">Your contact information</p>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <input
                    className="rounded-xl border-2 px-4 py-3 input-fun transition-all outline-none bg-zinc-50 focus:bg-white animate-slide-in-left"
                    style={{
                      borderColor: name ? 'var(--color-primary-400)' : 'rgba(20, 184, 154, 0.2)',
                      boxShadow: name ? 'var(--shadow-glow)' : 'none'
                    }}
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <input
                    className="rounded-xl border-2 px-4 py-3 input-fun transition-all outline-none bg-zinc-50 focus:bg-white animate-slide-in-right"
                    style={{
                      borderColor: phone ? 'var(--color-primary-400)' : 'rgba(20, 184, 154, 0.2)',
                      boxShadow: phone ? 'var(--shadow-glow)' : 'none',
                      animationDelay: '100ms'
                    }}
                    placeholder="Phone number"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <input
                  className="w-full rounded-xl border-2 px-4 py-3 input-fun transition-all outline-none bg-zinc-50 focus:bg-white animate-scale-in"
                  style={{
                    borderColor: email ? 'var(--color-primary-400)' : 'rgba(20, 184, 154, 0.2)',
                    boxShadow: email ? 'var(--shadow-glow)' : 'none',
                    animationDelay: '200ms'
                  }}
                  placeholder="Email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button
                  className="btn-playful w-full rounded-2xl px-6 py-5 text-white font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed animate-bounce"
                  style={{
                    background: 'var(--gradient-primary)',
                    boxShadow: 'var(--shadow-2xl)',
                    animationDelay: '300ms'
                  }}
                  disabled={!estimate.ok}
                  onClick={submit}
                  onMouseEnter={(e) => e.currentTarget.classList.add('animate-wiggle')}
                  onAnimationEnd={(e) => e.currentTarget.classList.remove('animate-wiggle')}
                >
                  {estimate.ok ? `Complete Booking • ${money(estimate.shown)}` : "Complete Booking"}
                </button>
                <div className="text-xs text-zinc-600 text-center bg-zinc-100 px-4 py-3 rounded-xl">
                  🔒 Secure booking • Final price may vary based on actual conditions
                </div>
              </section>
            )}
          </div>
        </div>
        </div>

        {/* Playful Bottom Navigation */}
        <div className="sticky bottom-0 z-40 backdrop-blur-lg" style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderTop: '1px solid rgba(20, 184, 154, 0.15)',
          boxShadow: '0 -10px 25px rgba(20, 184, 154, 0.08)'
        }}>
          <div className="mx-auto max-w-2xl px-6 py-5">
            <div className="flex items-center justify-between gap-4">
              <button
                className="group rounded-2xl border-2 px-6 py-3 text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  borderColor: 'rgba(20, 184, 154, 0.3)',
                  background: 'white',
                  color: 'var(--color-primary-700)',
                  boxShadow: 'var(--shadow-sm)'
                }}
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                onMouseEnter={(e) => !e.currentTarget.disabled && e.currentTarget.classList.add('animate-wiggle')}
                onAnimationEnd={(e) => e.currentTarget.classList.remove('animate-wiggle')}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </span>
              </button>

              {step < 6 && (
                <button
                  className="btn-playful group flex-1 max-w-xs rounded-2xl px-6 py-3 text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'var(--gradient-primary)',
                    boxShadow: 'var(--shadow-lg)'
                  }}
                  onClick={() => setStep((s) => Math.min(6, s + 1))}
                  disabled={!canContinue}
                  onMouseEnter={(e) => !e.currentTarget.disabled && e.currentTarget.classList.add('animate-bounce')}
                  onAnimationEnd={(e) => e.currentTarget.classList.remove('animate-bounce')}
                >
                  <span className="flex items-center justify-center gap-2">
                    Continue
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
