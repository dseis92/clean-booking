import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const BookingSchema = z.object({
  bookingType: z.enum(["residential", "commercial"]),
  addressText: z.string().min(5),
  distanceMiles: z.number().min(0).max(50).optional(),
  scheduledDate: z.string().optional(),
  scheduledWindow: z.string().optional(),

  estimateShown: z.number().int().min(0),
  internalLow: z.number().int().min(0).optional(),
  internalHigh: z.number().int().min(0).optional(),

  input: z.record(z.string(), z.unknown()),
  customer: z.object({
    name: z.string().min(2),
    phone: z.string().min(7),
    email: z.string().email(),
  }),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = BookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "INVALID_PAYLOAD", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const sb = supabaseAdmin();

    const { error } = await sb.from("bookings").insert({
      booking_type: parsed.data.bookingType,
      address_text: parsed.data.addressText,
      distance_miles: parsed.data.distanceMiles ?? null,
      scheduled_date: parsed.data.scheduledDate ?? null,
      scheduled_window: parsed.data.scheduledWindow ?? null,
      estimate_shown: parsed.data.estimateShown,
      internal_low: parsed.data.internalLow ?? null,
      internal_high: parsed.data.internalHigh ?? null,
      input: parsed.data.input,
      customer: parsed.data.customer,
      status: "pending",
    });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
