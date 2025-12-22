"use client";

import { useMemo, useState } from "react";
import { PRICING, estimateCommercial, estimateResidential } from "@/lib/pricing";

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
  const [distanceMiles, setDistanceMiles] = useState<number>(0); // MVP: manual; later Google Places + Distance Matrix
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
    <div className="min-h-screen bg-white text-zinc-900">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">Instant Cleaning Estimate</h1>
          <div className="text-sm text-zinc-500">Step {step + 1} / 7</div>
        </div>

        {/* Estimate banner */}
        <div className="mt-6 rounded-2xl border p-4">
          {!estimate.ok ? (
            <div className="text-sm">
              {estimate.reason === "OUT_OF_RANGE" ? (
                <div className="font-medium">Outside service area (50 miles). Try a closer address.</div>
              ) : (
                <div className="font-medium">Custom quote needed for this size.</div>
              )}
              <div className="mt-1 text-zinc-500">MVP note: distance is manual right now; we’ll auto-calc later.</div>
            </div>
          ) : (
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="text-sm text-zinc-500">Instant estimate</div>
                <div className="text-3xl font-bold">{money(estimate.shown)}</div>
                {"meta" in estimate && (
                  <div className="mt-1 text-xs text-zinc-500">
                    Est. time: {estimate.meta.hours} hrs • Travel: {money(estimate.meta.travelFee)}
                  </div>
                )}
              </div>
              <div className="text-xs text-zinc-500 max-w-[18rem] text-right">
                Final price may adjust if the home/space is significantly different than described.
              </div>
            </div>
          )}
        </div>

        {/* Steps */}
        <div className="mt-6 rounded-2xl border p-6 space-y-6">
          {step === 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Where should we clean?</h2>
              <input
                className="w-full rounded-xl border px-4 py-3"
                placeholder="Street address, city, state"
                value={addressText}
                onChange={(e) => setAddressText(e.target.value)}
              />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="text-sm text-zinc-600">Distance from service area (miles) — MVP manual</label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    className="mt-1 w-full rounded-xl border px-4 py-3"
                    value={distanceMiles}
                    onChange={(e) => setDistanceMiles(Number(e.target.value))}
                  />
                </div>
                <div className="text-sm text-zinc-500 md:pt-6">
                  Service radius: <span className="font-medium">50 miles</span> from {PRICING.homeBasesZip.join(", ")}.
                </div>
              </div>
            </section>
          )}

          {step === 1 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">What are we cleaning?</h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <button
                  className={`rounded-xl border px-4 py-4 text-left ${bookingType === "residential" ? "border-zinc-900" : ""}`}
                  onClick={() => setBookingType("residential")}
                >
                  <div className="font-medium">Home / Apartment</div>
                  <div className="text-sm text-zinc-500">Sqft + beds/baths for accuracy</div>
                </button>
                <button
                  className={`rounded-xl border px-4 py-4 text-left ${bookingType === "commercial" ? "border-zinc-900" : ""}`}
                  onClick={() => setBookingType("commercial")}
                >
                  <div className="font-medium">Business / Commercial</div>
                  <div className="text-sm text-zinc-500">Type + sqft + restrooms</div>
                </button>
              </div>
            </section>
          )}

          {step === 2 && bookingType === "residential" && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Tell us about the home</h2>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="text-sm text-zinc-600">Estimated square footage (rough is fine)</label>
                  <input type="number" className="mt-1 w-full rounded-xl border px-4 py-3" value={sqft} onChange={(e) => setSqft(Number(e.target.value))} />
                </div>
                <div>
                  <label className="text-sm text-zinc-600">Service type</label>
                  <select className="mt-1 w-full rounded-xl border px-4 py-3" value={kind} onChange={(e) => setKind(e.target.value as any)}>
                    <option value="standard">Standard</option>
                    <option value="deep">Deep</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                <div>
                  <label className="text-sm text-zinc-600">Bedrooms</label>
                  <input type="number" className="mt-1 w-full rounded-xl border px-4 py-3" value={beds} onChange={(e) => setBeds(Number(e.target.value))} />
                </div>
                <div>
                  <label className="text-sm text-zinc-600">Bathrooms</label>
                  <input type="number" className="mt-1 w-full rounded-xl border px-4 py-3" value={baths} onChange={(e) => setBaths(Number(e.target.value))} />
                </div>
                <div className="flex items-end gap-2">
                  <input id="moveout" type="checkbox" checked={isMoveOut} onChange={(e) => setIsMoveOut(e.target.checked)} />
                  <label htmlFor="moveout" className="text-sm text-zinc-700">Move-in/out</label>
                </div>
              </div>
            </section>
          )}

          {step === 2 && bookingType === "commercial" && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Tell us about the space</h2>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div>
                  <label className="text-sm text-zinc-600">Business type</label>
                  <select className="mt-1 w-full rounded-xl border px-4 py-3" value={bizType} onChange={(e) => setBizType(e.target.value as BizType)}>
                    <option value="office">Office</option>
                    <option value="retail">Retail</option>
                    <option value="clinic">Salon / Clinic</option>
                    <option value="restaurant">Restaurant</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-zinc-600">Square footage</label>
                  <input type="number" className="mt-1 w-full rounded-xl border px-4 py-3" value={sqft} onChange={(e) => setSqft(Number(e.target.value))} />
                </div>
                <div>
                  <label className="text-sm text-zinc-600">Restrooms</label>
                  <input type="number" className="mt-1 w-full rounded-xl border px-4 py-3" value={restrooms} onChange={(e) => setRestrooms(Number(e.target.value))} />
                </div>
              </div>

              <div>
                <label className="text-sm text-zinc-600">Frequency</label>
                <select className="mt-1 w-full rounded-xl border px-4 py-3" value={frequency} onChange={(e) => setFrequency(e.target.value as Frequency)}>
                  <option value="monthly">Monthly</option>
                  <option value="biweekly">Biweekly (-5%)</option>
                  <option value="weekly">Weekly (-10%)</option>
                </select>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">How deep do you want to go?</h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {(["light","standard","heavy","deepReset"] as CleanLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    className={`rounded-xl border px-4 py-4 text-left ${cleanLevel === lvl ? "border-zinc-900" : ""}`}
                    onClick={() => setCleanLevel(lvl)}
                  >
                    <div className="font-medium">
                      {lvl === "deepReset" ? "Deep Reset (first-time deep)" : lvl[0].toUpperCase() + lvl.slice(1)}
                    </div>
                    <div className="text-sm text-zinc-500">
                      {lvl === "light" && "Maintained home/space"}
                      {lvl === "standard" && "Normal clean"}
                      {lvl === "heavy" && "Catch-up / extra buildup"}
                      {lvl === "deepReset" && "Detailed first-time reset"}
                    </div>
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-2 text-sm text-zinc-700">
                <input type="checkbox" checked={afterHours} onChange={(e) => setAfterHours(e.target.checked)} />
                After-hours (adds 15%)
              </label>
            </section>
          )}

          {step === 4 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Add-ons</h2>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {addOnCatalog.map((a) => (
                  <label key={a.key} className="flex items-center justify-between rounded-xl border px-4 py-3">
                    <span className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={!!addOns[a.key]}
                        onChange={(e) => setAddOns((p) => ({ ...p, [a.key]: e.target.checked }))}
                      />
                      <span className="text-sm">{a.label}</span>
                    </span>
                    <span className="text-sm text-zinc-600">+{money(a.price)}</span>
                  </label>
                ))}
              </div>
              <div className="text-sm text-zinc-500">Add-ons total: {money(addOnsTotal)}</div>
            </section>
          )}

          {step === 5 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Schedule</h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="text-sm text-zinc-600">Date</label>
                  <input type="date" className="mt-1 w-full rounded-xl border px-4 py-3" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-zinc-600">Time window</label>
                  <select className="mt-1 w-full rounded-xl border px-4 py-3" value={scheduledWindow} onChange={(e) => setScheduledWindow(e.target.value)}>
                    <option value="">Pick a window</option>
                    <option value="9-11">9–11</option>
                    <option value="11-1">11–1</option>
                    <option value="1-3">1–3</option>
                    <option value="3-5">3–5</option>
                  </select>
                </div>
              </div>
            </section>
          )}

          {step === 6 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Contact</h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <input className="rounded-xl border px-4 py-3" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
                <input className="rounded-xl border px-4 py-3" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <input className="w-full rounded-xl border px-4 py-3" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <button
                className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-white disabled:opacity-50"
                disabled={!estimate.ok}
                onClick={submit}
              >
                Book for {estimate.ok ? money(estimate.shown) : "—"}
              </button>
              <div className="text-xs text-zinc-500">
                Final price may adjust if the home/space is significantly different than described.
              </div>
            </section>
          )}
        </div>

        {/* Nav */}
        <div className="mt-6 flex items-center justify-between">
          <button
            className="rounded-xl border px-4 py-2 text-sm"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            Back
          </button>

          {step < 6 && (
            <button
              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-50"
              onClick={() => setStep((s) => Math.min(6, s + 1))}
              disabled={!canContinue}
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
