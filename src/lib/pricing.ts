type CleanLevel = "light" | "standard" | "heavy" | "deepReset";
type BizType = "office" | "retail" | "clinic" | "restaurant";

export const PRICING = {
  serviceRadiusMiles: 50,
  homeBasesZip: ["54481", "54482", "54492"],
  hourly: { min: 20, def: 24, max: 28 },

  residentialTiersStandard: [
    { maxSqft: 1200, base: 120 },
    { maxSqft: 2200, base: 260 },
    { maxSqft: 3200, base: 330 },
    { maxSqft: 4200, base: 420 },
    { maxSqft: 999999, base: null as number | null },
  ],
  residentialTiersDeep: [
    { maxSqft: 1200, base: 220 },
    { maxSqft: 2200, base: 420 },
    { maxSqft: 3200, base: 650 },
    { maxSqft: 4200, base: 800 },
    { maxSqft: 999999, base: null as number | null },
  ],

  cleanMult: { light: 0.9, standard: 1.0, heavy: 1.25, deepReset: 1.5 } as Record<CleanLevel, number>,

  moveOut: { minStandard: 325, minDeep: 425, standardMult: 1.35, deepMult: 1.15 },

  commercial: {
    ratePerSqftDefault: 0.14,
    restroomFee: 25,
    typeMult: { office: 1.0, retail: 1.1, clinic: 1.2, restaurant: 1.4 } as Record<BizType, number>,
    frequencyDiscount: { weekly: 0.10, biweekly: 0.05, monthly: 0.0 } as Record<"weekly"|"biweekly"|"monthly", number>,
  },

  travelFeeBands: [
    { maxMiles: 15, fee: 0 },
    { maxMiles: 30, fee: 15 },
    { maxMiles: 50, fee: 30 },
  ],

  addOns: {
    residential: [
      { key: "oven", label: "Inside oven", price: 25 },
      { key: "fridge", label: "Inside fridge", price: 25 },
      { key: "windows", label: "Interior windows", price: 35 },
      { key: "baseboards", label: "Baseboards detail", price: 40 },
      { key: "petHair", label: "Pet hair focus", price: 25 },
      { key: "laundry", label: "Laundry", price: 20 },
      { key: "dishes", label: "Dishes", price: 20 },
    ],
    commercial: [
      { key: "sanitization", label: "High-touch sanitization", price: 35 },
      { key: "floorScrub", label: "Floor machine scrub", price: 75 },
      { key: "trash", label: "Trash haul-out", price: 25 },
    ],
  },
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
function roundMoney(n: number) {
  return Math.round(n / 5) * 5; // nearest $5
}
function pickTierBase(sqft: number, tiers: {maxSqft:number;base:number|null}[]) {
  for (const t of tiers) if (sqft <= t.maxSqft) return t.base;
  return null;
}
function travelFee(miles: number) {
  for (const b of PRICING.travelFeeBands) if (miles <= b.maxMiles) return b.fee;
  return null; // out of range
}

export type ResidentialInput = {
  sqft: number;
  beds: number;
  baths: number;
  cleanLevel: CleanLevel;
  kind: "standard" | "deep";
  isMoveOut?: boolean;
  addOnsTotal?: number;
  miles?: number;
  afterHours?: boolean;
};

export function estimateResidential(input: ResidentialInput) {
  const miles = input.miles ?? 0;
  const tf = travelFee(miles);
  if (tf === null) return { ok: false as const, reason: "OUT_OF_RANGE" as const };

  const tiers = input.kind === "deep" ? PRICING.residentialTiersDeep : PRICING.residentialTiersStandard;
  const base0 = pickTierBase(input.sqft, tiers);
  if (base0 == null) return { ok: false as const, reason: "CUSTOM_QUOTE" as const };

  let base = base0;

  if (input.isMoveOut) {
    if (input.kind === "deep") base = Math.max(PRICING.moveOut.minDeep, base * PRICING.moveOut.deepMult);
    else base = Math.max(PRICING.moveOut.minStandard, base * PRICING.moveOut.standardMult);
  }

  // Beds/baths adjustment (keeps sqft “rough” but accurate)
  const expectedBeds = Math.max(1, Math.round(input.sqft / 700));
  const expectedBaths = Math.max(1, Math.round(expectedBeds * 0.75));
  const bedDiff = input.beds - expectedBeds;
  const bathDiff = input.baths - expectedBaths;

  let adj = 0;
  adj += bedDiff >= 0 ? bedDiff * 15 : bedDiff * 10;
  adj += bathDiff >= 0 ? bathDiff * 20 : bathDiff * 15;
  adj = clamp(adj, -60, 90);

  let price = base + adj;

  // Clean multiplier
  price *= PRICING.cleanMult[input.cleanLevel];

  // Add-ons + travel
  price += (input.addOnsTotal ?? 0) + tf;

  // After-hours
  if (input.afterHours) price *= 1.15;

  // Hourly guardrail
  const hourly = PRICING.hourly.def;
  const baseHours = (input.kind === "deep" ? input.sqft / 500 : input.sqft / 650);
  const levelHoursMult =
    input.cleanLevel === "heavy" ? 1.2 :
    input.cleanLevel === "light" ? 0.9 :
    input.cleanLevel === "deepReset" ? 1.35 : 1.0;
  const hours = baseHours * levelHoursMult;
  const labor = hours * hourly;
  const minPrice = labor * 1.3;
  const maxPrice = labor * 2.6;
  price = clamp(price, minPrice, maxPrice);

  const shown = roundMoney(price);
  return {
    ok: true as const,
    shown,
    internalLow: roundMoney(shown * 0.9),
    internalHigh: roundMoney(shown * 1.1),
    meta: { expectedBeds, expectedBaths, adj, travelFee: tf, hours: Math.round(hours * 10) / 10 },
  };
}

export type CommercialInput = {
  sqft: number;
  restrooms: number;
  businessType: BizType;
  frequency: "weekly" | "biweekly" | "monthly";
  addOnsTotal?: number;
  miles?: number;
  afterHours?: boolean;
};

export function estimateCommercial(input: CommercialInput) {
  const miles = input.miles ?? 0;
  const tf = travelFee(miles);
  if (tf === null) return { ok: false as const, reason: "OUT_OF_RANGE" as const };

  const typeMult = PRICING.commercial.typeMult[input.businessType] ?? 1.0;
  const discount = PRICING.commercial.frequencyDiscount[input.frequency] ?? 0;

  let price = input.sqft * PRICING.commercial.ratePerSqftDefault;
  price *= typeMult;
  price += input.restrooms * PRICING.commercial.restroomFee;
  price *= (1 - discount);

  price += (input.addOnsTotal ?? 0) + tf;
  if (input.afterHours) price *= 1.15;

  const shown = roundMoney(price);
  return { ok: true as const, shown, internalLow: roundMoney(shown * 0.9), internalHigh: roundMoney(shown * 1.1) };
}
