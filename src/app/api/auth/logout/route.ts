import { NextResponse } from 'next/server'

// Sign-out is handled client-side via the browser Supabase client.
// This route exists as a no-op for backward compatibility.
export async function POST() {
  return NextResponse.json({ ok: true })
}
