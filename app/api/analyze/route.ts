import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log("API route called - /api/analyze");
    const body = await request.json();
    const { address } = body;
    console.log("Received address:", address);

    if (!address) {
      console.error("No address provided");
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    const backendUrl = process.env.BACKEND_API_URL || 'https://dagscannser-backend.onrender.com/api/analyze/';
    console.log("Backend URL:", backendUrl);

    if (!backendUrl) {
        console.error("BACKEND_API_URL environment variable not set.");
        return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    console.log("Making request to backend:", backendUrl);
    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address }),
    });

    console.log("Backend response status:", backendResponse.status);

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({ error: "Backend error" }));
      console.error("Backend error:", errorData);
      return NextResponse.json({ error: errorData.error || 'Backend API error' }, { status: backendResponse.status });
    }

    const data = await backendResponse.json();
    console.log("Backend response data:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in /api/analyze route:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}