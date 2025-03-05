// app/api/events/route.ts
import { NextResponse } from 'next/server';
import process from 'process';
const BACKEND_URL = process.env.BACKEND_URL || 'http://go-api:8080';
export async function GET() {
  try {    
    console.log("Fetching game moves at:", BACKEND_URL)
    const response = await fetch(`${BACKEND_URL}/moves`, 
      {headers: {'Content-Type': 'application/json'}});
    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }
    console.log("Got response, getting moves")
    const moves = await response.json();
    return new NextResponse(JSON.stringify(moves), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Failed to fetch moves:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve game events' },
      { status: 500 }
    );
  }
}