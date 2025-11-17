import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Serve the favicon.png as .ico
    const filePath = path.join(process.cwd(), 'public', 'favicon.png');
    const imageBuffer = fs.readFileSync(filePath);
    
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving favicon:', error);
    return new NextResponse(null, { status: 404 });
  }
}
