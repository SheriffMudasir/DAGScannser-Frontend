
// app\analyze\route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { address } = body;

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    // Securely get the backend URL from environment variables
    const backendUrl = process.env.BACKEND_API_URL;

    if (!backendUrl) {
        console.error("BACKEND_API_URL environment variable not set.");
        return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      return NextResponse.json({ error: errorData.error || 'Backend API error' }, { status: backendResponse.status });
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in /api/analyze route:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}