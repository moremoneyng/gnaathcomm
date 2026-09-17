import { NextResponse } from 'next/server';
export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Use the secure checkout to place an order.' },
    { status: 410 },
  );
}
