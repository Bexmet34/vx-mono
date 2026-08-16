import { NextResponse } from 'next/server';
import { supabase } from '@veyronix/database';

// GET: Tüm Blog Yazılarını Getir
export async function GET() {
  try {
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ posts: posts || [] });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Manuel Manuel Yeni Blog Yazısı Ekle
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      title,
      slug,
      description,
      content,
      cover_image,
      category,
      tags,
      focus_keyword,
      status
    } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Başlık ve içerik alanları zorunludur.' }, { status: 400 });
    }

    // Slug benzersizliği ve formatlama
    const cleanSlug = (slug || title)
      .toString()
      .toLowerCase()
      .trim()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const finalSlug = `${cleanSlug}-${Date.now().toString().slice(-4)}`;

    // Okuma süresi hesabı
    const wordCount = content.replace(/[#*`\-[\]()]/g, '').trim().split(/\s+/).length;
    const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

    const postPayload = {
      slug: finalSlug,
      title: title.trim(),
      description: description ? description.trim() : '',
      content: content.trim(),
      cover_image: cover_image || 'https://veyronix.com.tr/icon.svg',
      category: category || 'Genel',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : ['rehber']),
      author_name: 'Veyronix Editör',
      author_avatar: 'https://veyronix.com.tr/icon.svg',
      read_time_minutes: readTimeMinutes,
      lang: 'tr',
      status: status || 'published',
      published_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('blog_posts')
      .insert([postPayload])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, post: data[0] });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Var Olan Blog Yazısını Düzenle
export async function PUT(req) {
  try {
    const body = await req.json();
    const {
      id,
      title,
      description,
      content,
      cover_image,
      category,
      tags,
      status
    } = body;

    if (!id || !title || !content) {
      return NextResponse.json({ error: 'ID, başlık ve içerik gereklidir.' }, { status: 400 });
    }

    const wordCount = content.replace(/[#*`\-[\]()]/g, '').trim().split(/\s+/).length;
    const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

    const updatePayload = {
      title: title.trim(),
      description: description ? description.trim() : '',
      content: content.trim(),
      cover_image: cover_image || 'https://veyronix.com.tr/icon.svg',
      category: category || 'Genel',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : ['rehber']),
      read_time_minutes: readTimeMinutes,
      status: status || 'published'
    };

    const { data, error } = await supabase
      .from('blog_posts')
      .update(updatePayload)
      .eq('id', id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, post: data[0] });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Blog Yazısı Sil
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Makale ID gereklidir.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('blog_posts')
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
