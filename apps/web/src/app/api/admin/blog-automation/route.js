import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

// GET: Ayarları ve Özel Anahtar Kelimeleri Getir
export async function GET() {
  try {
    const { data: settings } = await supabase
      .from('blog_automation_settings')
      .select('*')
      .eq('id', 1)
      .single();

    const { data: keywords } = await supabase
      .from('blog_custom_keywords')
      .select('*')
      .order('created_at', { ascending: false });

    return NextResponse.json({
      settings: settings || {
        is_active: true,
        schedule_times: ['09:00', '15:00', '21:00'],
        posts_per_day: 3
      },
      keywords: keywords || []
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Yeni Özel Anahtar Kelime Ekle veya Anlık Tetikleme Yap
export async function POST(req) {
  try {
    const body = await req.json();
    const { action, keyword, category, priority } = body;

    // Özel Anahtar Kelime Ekleme
    if (action === 'add_keyword') {
      if (!keyword || !keyword.trim()) {
        return NextResponse.json({ error: 'Anahtar kelime boş olamaz.' }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('blog_custom_keywords')
        .insert([{
          keyword: keyword.trim(),
          category: category || 'Genel',
          priority: parseInt(priority || 1),
          is_used: false
        }])
        .select();

      if (error) {
        if (error.code === '23505') {
          return NextResponse.json({ error: 'Bu anahtar kelime zaten ekli.' }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, keyword: data[0] });
    }

    return NextResponse.json({ error: 'Geçersiz işlem.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Otomasyon Ayarlarını Güncelle
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { is_active, schedule_times, posts_per_day } = body;

    const { data, error } = await supabase
      .from('blog_automation_settings')
      .upsert({
        id: 1,
        is_active: is_active ?? true,
        schedule_times: schedule_times || ['09:00', '15:00', '21:00'],
        posts_per_day: posts_per_day || 3,
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, settings: data[0] });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Özel Anahtar Kelime Sil
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID gerekli.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('blog_custom_keywords')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
