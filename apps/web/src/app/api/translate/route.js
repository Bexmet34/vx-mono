import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { text, from = 'tr', to = 'en' } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Metin gerekli' }, { status: 400 });
    }

    // Google Translate Free API (gtx client)
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
    
    const response = await fetch(url);
    const data = await response.json();

    // Google Translate API response format: [[["translated_text", "original_text", null, null, 1]], null, "tr"]
    const translatedText = data[0].map(x => x[0]).join('');

    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json({ error: 'Çeviri yapılamadı' }, { status: 500 });
  }
}
