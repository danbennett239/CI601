import { NextRequest, NextResponse } from 'next/server';
import { createPracticeWithUser } from '@/lib/services/practiceService';

export async function POST(req: NextRequest) {
  try {
    const { practiceName, email, password, phoneNumber, photo, address, openingHours } = await req.json();

    const practice = await createPracticeWithUser({
      practiceName,
      email,
      password,
      phoneNumber,
      photo,
      address,
      openingHours,
    });

    return NextResponse.json(practice, { status: 201 });
  } catch (error: unknown) {
    console.error("Practice Registration Error:", error);

    let errorMessage = "Practice registration failed";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
