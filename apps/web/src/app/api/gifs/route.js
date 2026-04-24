import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const gifDir = path.join(process.cwd(), 'public', 'gif');
    
    // Klasör yoksa boş array dön
    if (!fs.existsSync(gifDir)) {
      return NextResponse.json([]);
    }

    const files = fs.readdirSync(gifDir);
    // .gif uzantılı dosyaları al, ismini (ör. settings) ayıkla
    const gifs = files
      .filter(file => file.endsWith('.gif'))
      .map(file => file.replace('.gif', ''));

    return NextResponse.json(gifs);
  } catch (error) {
    console.error("Error reading gifs directory:", error);
    return NextResponse.json([]);
  }
}
