'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Plus, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  RefreshCw, 
  Eye, 
  Layers, 
  Wand2,
  Search,
  ChevronDown,
  Check,
  Send,
  HelpCircle
} from 'lucide-react';

export default function AdminBlogAutomationTab() {
  // Form State
  const [editingId, setEditingId] = useState(null);
  const [focusKeyword, setFocusKeyword] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Albion Online');
  const [tags, setTags] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [content, setContent] = useState('');
  
  // UI States
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'list'
  const [loading, setLoading] = useState(false);
  const [fetchingPosts, setFetchingPosts] = useState(true);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Existing Blog Posts Loader
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setFetchingPosts(true);
    try {
      const res = await fetch('/api/admin/blog');
      const data = await res.json();
      if (res.ok) {
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error('Error fetching blog posts:', err);
    } finally {
      setFetchingPosts(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 2. Comprehensive Real-Time SEO Analyzer Engine (RankMath & AdSense Standard)
  const seoAnalysis = useMemo(() => {
    const kw = focusKeyword.trim().toLowerCase();
    const cleanTitle = title.trim();
    const cleanDesc = description.trim();
    const cleanContent = content.trim();

    const titleLower = cleanTitle.toLowerCase();
    const descLower = cleanDesc.toLowerCase();

    // Word Count Calculation
    const words = cleanContent ? cleanContent.replace(/[#*`\-[\]()]/g, '').trim().split(/\s+/).filter(Boolean) : [];
    const wordCount = words.length;

    // First Paragraph Extraction
    const paragraphs = cleanContent.split('\n\n').filter(p => p.trim() && !p.trim().startsWith('#'));
    const firstParagraph = paragraphs[0] ? paragraphs[0].toLowerCase() : '';

    // H2 Headings Count
    const h2Count = (cleanContent.match(/^##\s+/gm) || []).length;
    
    // Lists Count (Bulleted or Numbered)
    const hasLists = /^(\s*[-*+]|\s*\d+\.)\s+/m.test(cleanContent);

    // Power words detection
    const hasPowerWord = /(2026|rehber|rehberi|nasıl|ipuçları|en iyi|taktikleri|kolay|adım adım|stok)/i.test(cleanTitle);

    let score = 0;
    const checks = [];

    // --- CRITERIA 1: Focus Keyword Checks ---
    if (!kw) {
      checks.push({
        id: 'kw_present',
        title: 'Odak Anahtar Kelime',
        desc: 'SEO analizi yapmak için lütfen bir odak anahtar kelime girin.',
        status: 'fail',
        weight: 0
      });
    } else {
      checks.push({
        id: 'kw_present',
        title: 'Odak Anahtar Kelime Tanımlı',
        desc: `"${focusKeyword}" hedeflendi.`,
        status: 'pass',
        weight: 10
      });
      score += 10;

      // KW in Title
      const inTitle = titleLower.includes(kw);
      checks.push({
        id: 'kw_title',
        title: 'Başlıkta Odak Kelime Var',
        desc: inTitle ? 'Anahtar kelimeniz makale başlığında yer alıyor.' : 'Anahtar kelimeniz tam olarak başlıkta geçmeli!',
        status: inTitle ? 'pass' : 'fail',
        weight: 15
      });
      if (inTitle) score += 15;

      // KW in Meta Description
      const inDesc = descLower.includes(kw);
      checks.push({
        id: 'kw_desc',
        title: 'Meta Açıklamasında Odak Kelime Var',
        desc: inDesc ? 'Anahtar kelime meta açıklamasında mevcut.' : 'Meta açıklamasına anahtar kelimenizi ekleyin.',
        status: inDesc ? 'pass' : 'fail',
        weight: 10
      });
      if (inDesc) score += 10;

      // KW in First Paragraph
      const inIntro = firstParagraph.includes(kw);
      checks.push({
        id: 'kw_intro',
        title: 'Giriş Paragrafında Odak Kelime Var',
        desc: inIntro ? 'Makalenin ilk 100 kelimesinde anahtar kelime bulunuyor.' : 'Giriş paragrafında anahtar kelimenize yer verin.',
        status: inIntro ? 'pass' : 'fail',
        weight: 10
      });
      if (inIntro) score += 10;
    }

    // --- CRITERIA 2: Title Length & Quality ---
    const titleLen = cleanTitle.length;
    const titleValid = titleLen >= 40 && titleLen <= 70;
    checks.push({
      id: 'title_length',
      title: `Başlık Uzunluğu (${titleLen}/60 Karakter)`,
      desc: titleValid ? 'Başlık uzunluğu Google arama sonuçları için ideal (40-70 karakter).' : 'Başlık çok kısa (<40) veya çok uzun (>70). Ideal: 40-70 karakter.',
      status: titleValid ? 'pass' : (titleLen > 0 ? 'warning' : 'fail'),
      weight: 10
    });
    if (titleValid) score += 10;

    // Title Power Word
    if (hasPowerWord) {
      checks.push({
        id: 'title_power',
        title: 'Çekici Başlık Kelimesi (Power Word)',
        desc: 'Başlığınız tıklama oranını artıran etkileyici bir kelime içeriyor (Rehber, 2026, Taktikleri vb.).',
        status: 'pass',
        weight: 5
      });
      score += 5;
    }

    // --- CRITERIA 3: Meta Description Length ---
    const descLen = cleanDesc.length;
    const descValid = descLen >= 120 && descLen <= 160;
    checks.push({
      id: 'desc_length',
      title: `Meta Açıklaması Uzunluğu (${descLen}/160 Karakter)`,
      desc: descValid ? 'Meta açıklaması arama motorları için mükemmel uzunlukta (120-160 karakter).' : 'Meta açıklaması 120-160 karakter arasında olmalıdır.',
      status: descValid ? 'pass' : (descLen > 0 ? 'warning' : 'fail'),
      weight: 10
    });
    if (descValid) score += 10;

    // --- CRITERIA 4: Word Count & Content Length (AdSense Standard) ---
    const wordScore = wordCount >= 800 ? 'pass' : (wordCount >= 500 ? 'warning' : 'fail');
    checks.push({
      id: 'word_count',
      title: `Makale Kelime Sayısı (~${wordCount} Kelime)`,
      desc: wordCount >= 800 
        ? 'İçerik Google AdSense ve yüksek sıralama için zengin uzunlukta (800+ kelime).' 
        : 'Google AdSense onayı için makaleler en az 800 kelime olmalıdır.',
      status: wordScore,
      weight: 20
    });
    if (wordCount >= 800) score += 20;
    else if (wordCount >= 500) score += 10;

    // --- CRITERIA 5: H2 Subheadings Count ---
    const h2Valid = h2Count >= 3;
    checks.push({
      id: 'h2_headings',
      title: `Alt Başlıklar (## H2) Sayısı (${h2Count} adet)`,
      desc: h2Valid ? 'Makalede yeterli H2 başlık yapısı var (En az 3 adet).' : 'Okunabilirliği artırmak için en az 3 adet ## H2 başlığı ekleyin.',
      status: h2Valid ? 'pass' : 'fail',
      weight: 10
    });
    if (h2Valid) score += 10;

    // --- CRITERIA 6: Lists Structure ---
    checks.push({
      id: 'has_lists',
      title: 'Maddeli/Numaralı Liste Kullanımı',
      desc: hasLists ? 'Makalede okunabilirliği artıran maddeli liste bulunuyor.' : 'Pratik ipuçları için maddeli (- item) veya numaralı (1. item) liste ekleyin.',
      status: hasLists ? 'pass' : 'warning',
      weight: 5
    });
    if (hasLists) score += 5;

    // Final Color Determination
    let color = '#EF4444'; // Red (0-59)
    let badgeText = '🔴 SEO Zayıf (Düzeltme Gerekli)';
    if (score >= 80) {
      color = '#10B981'; // Bright Green (80-100)
      badgeText = '🟢 SEO Mükemmel (AdSense Hazır)';
    } else if (score >= 60) {
      color = '#F59E0B'; // Orange/Yellow (60-79)
      badgeText = '🟡 SEO Kabul Edilebilir';
    }

    return {
      score: Math.min(100, score),
      color,
      badgeText,
      checks,
      wordCount,
      titleLen,
      descLen,
      h2Count
    };
  }, [focusKeyword, title, description, content]);

  // AI Draft Generator Helper
  const handleGenerateAiDraft = async () => {
    if (!focusKeyword.trim() && !title.trim()) {
      showToast('Lütfen yapay zeka taslağı için en az bir Odak Anahtar Kelime veya Başlık girin.', 'error');
      return;
    }

    setAiGenerating(true);
    showToast('🤖 Yapay zeka SEO uyumlu 1000+ kelimelik taslak hazırlıyor...', 'info');

    try {
      const prompt = `
Sen kıdemli bir SEO editörüsün. Aşağıdaki anahtar kelime ve başlık hakkında Türkçe, Google AdSense uyumlu, 1000+ kelimelik zengin bir blog makalesi taslağı hazırla.

Odak Anahtar Kelime: "${focusKeyword}"
Başlık: "${title}"
Kategori: "${category}"

Lütfen aşağıdaki JSON formatında yanıt ver:
{
  "title": "SEO Uyumlu Çarpıcı Başlık",
  "description": "Meta description (140-160 karakter arası etkileyici özet)",
  "content": "Markdown formatında en az 4 adet ## H2 başlık içeren 1000+ kelimelik makale metni"
}
`;
      const res = await fetch('/api/admin/blog-automation/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customPrompt: prompt })
      });

      const data = await res.json();
      if (data.post || data.message) {
        if (data.post) {
          setTitle(data.post.title || title);
          setDescription(data.post.description || description);
          setContent(data.post.content || content);
        }
        showToast('✨ Taslak başarıyla oluşturuldu! Düzenleyip yayınlayabilirsiniz.');
      } else if (data.error) {
        showToast(data.error, 'error');
      }
    } catch (err) {
      showToast('AI Taslak üretimi başarısız: ' + err.message, 'error');
    } finally {
      setAiGenerating(false);
    }
  };

  // Generate Pollinations Cover Image URL
  const handleGenerateCoverImage = () => {
    const kw = focusKeyword || title || 'gaming';
    const cleanPrompt = encodeURIComponent(`${kw}, gaming art, high resolution, dark neon gaming background, 8k`);
    const imageUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1200&height=630&nologo=true&seed=${Math.floor(Math.random() * 100000)}`;
    setCoverImage(imageUrl);
    showToast('🖼️ Kapak görseli linki otomatik üretildi!');
  };

  // Save / Publish Blog Post
  const handleSavePost = async (publishStatus = 'published') => {
    if (!title.trim() || !content.trim()) {
      showToast('Başlık ve İçerik alanları boş bırakılamaz!', 'error');
      return;
    }

    if (seoAnalysis.score < 60) {
      if (!confirm('⚠️ SEO Puanınız Zayıf (Kırmızı). Yine de yayınlamak istiyor musunuz?')) {
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        id: editingId,
        title,
        description,
        content,
        cover_image: coverImage,
        category,
        tags,
        focus_keyword: focusKeyword,
        status: publishStatus
      };

      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/blog', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showToast(editingId ? '✅ Makale başarıyla güncellendi!' : '🎉 Makale başarıyla yayınlandı!');
        resetForm();
        fetchPosts();
        setActiveTab('list');
      } else {
        showToast(data.error || 'İşlem başarısız.', 'error');
      }
    } catch (err) {
      showToast('Veritabanı hatası: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Edit Existing Post
  const handleEditClick = (post) => {
    setEditingId(post.id);
    setTitle(post.title || '');
    setDescription(post.description || '');
    setContent(post.content || '');
    setCoverImage(post.cover_image || '');
    setCategory(post.category || 'Albion Online');
    setTags(Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || ''));
    setFocusKeyword(post.tags?.[0] || '');
    setActiveTab('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete Post
  const handleDeletePost = async (id) => {
    if (!confirm('Bu blog makalesini silmek istediğinize emin misiniz?')) return;

    try {
      const res = await fetch(`/api/admin/blog?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Makale silindi.');
        fetchPosts();
      } else {
        showToast(data.error || 'Silinemedi.', 'error');
      }
    } catch (err) {
      showToast('Silme hatası: ' + err.message, 'error');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFocusKeyword('');
    setTitle('');
    setDescription('');
    setContent('');
    setCoverImage('');
    setCategory('Albion Online');
    setTags('');
  };

  const filteredPosts = posts.filter(p => 
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Custom Dark Input Styles (Dark theme with high contrast)
  const inputStyle = {
    width: '100%',
    background: '#0F172A',
    border: '1px solid rgba(88, 101, 242, 0.3)',
    borderRadius: '10px',
    padding: '0.85rem 1rem',
    color: '#FFFFFF',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box'
  };

  return (
    <div style={{ paddingBottom: '3rem', color: '#FFFFFF' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          background: toastMessage.type === 'error' ? '#EF4444' : (toastMessage.type === 'info' ? '#5865F2' : '#10B981'),
          color: '#fff',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          fontWeight: 'bold',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem',
          fontSize: '0.95rem'
        }}>
          {toastMessage.type === 'error' ? <XCircle size={20} /> : <CheckCircle2 size={20} />}
          {toastMessage.text}
        </div>
      )}

      {/* Top Header Banner */}
      <div style={{ 
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)', 
        border: '1px solid rgba(88, 101, 242, 0.4)', 
        borderRadius: '16px',
        padding: '1.8rem 2rem',
        marginBottom: '1.8rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(88, 101, 242, 0.2)', color: '#38BDF8', padding: '0.35rem 0.9rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.8rem' }}>
              <FileText size={15} /> Veyronix SEO Blog Yazarları Stüdyosu
            </div>
            <h2 style={{ fontSize: '1.8rem', color: '#fff', margin: 0, fontWeight: '800' }}>
              Manuel Blog Editörü & Canlı SEO Ölçer (Hata Payı %0)
            </h2>
            <p style={{ color: '#94A3B8', margin: '0.4rem 0 0', fontSize: '0.95rem' }}>
              Yazınızı yazarken sağ taraftaki ve üstteki canlı denetim sistemiyle %100 AdSense ve Google SEO uyumunu yakalayın.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button
              onClick={() => { resetForm(); setActiveTab('editor'); }}
              style={{
                background: activeTab === 'editor' && !editingId ? 'linear-gradient(135deg, #5865F2, #4752C4)' : '#1E293B',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                padding: '0.75rem 1.4rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Plus size={16} /> Yeni Makale Yaz
            </button>

            <button
              onClick={() => setActiveTab('list')}
              style={{
                background: activeTab === 'list' ? 'linear-gradient(135deg, #5865F2, #4752C4)' : '#1E293B',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                padding: '0.75rem 1.4rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Layers size={16} /> Yayındaki Makaleler ({posts.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'editor' && (
        <>
          {/* STICKY CONTROL & LIVE SEO SCORE BAR */}
          <div style={{ 
            position: 'sticky', 
            top: '15px', 
            zIndex: 100, 
            background: 'rgba(15, 23, 42, 0.95)', 
            backdropFilter: 'blur(16px)', 
            border: `2px solid ${seoAnalysis.color}`,
            borderRadius: '16px',
            padding: '1rem 1.5rem',
            marginBottom: '1.8rem',
            boxShadow: '0 15px 35px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            {/* Score & Status Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                <span style={{ fontSize: '2.4rem', fontWeight: '900', color: seoAnalysis.color, lineHeight: 1 }}>
                  {seoAnalysis.score}
                </span>
                <span style={{ fontSize: '1rem', color: '#94A3B8', fontWeight: 'bold' }}>/100</span>
              </div>

              <div>
                <div style={{ 
                  background: `${seoAnalysis.color}20`, 
                  color: seoAnalysis.color, 
                  padding: '0.35rem 0.8rem', 
                  borderRadius: '30px', 
                  fontSize: '0.85rem', 
                  fontWeight: '800',
                  display: 'inline-block'
                }}>
                  {seoAnalysis.badgeText}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '4px' }}>
                  ~{seoAnalysis.wordCount} Kelime | {seoAnalysis.h2Count} H2 Başlık
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
              <button
                type="button"
                onClick={handleGenerateAiDraft}
                disabled={aiGenerating}
                style={{
                  background: 'linear-gradient(135deg, #5865F2, #8B5CF6)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.7rem 1.2rem',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  cursor: aiGenerating ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Wand2 size={16} /> {aiGenerating ? 'Hazırlanıyor...' : 'Yapay Zeka Taslağı Üret'}
              </button>

              <button
                type="button"
                onClick={() => handleSavePost('draft')}
                disabled={loading}
                style={{
                  background: '#1E293B',
                  color: '#CBD5E1',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  padding: '0.7rem 1.2rem',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Taslak Kaydet
              </button>

              <button
                type="button"
                onClick={() => handleSavePost('published')}
                disabled={loading}
                style={{
                  background: seoAnalysis.score < 60 ? '#EF4444' : 'linear-gradient(135deg, #10B981, #059669)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.7rem 1.6rem',
                  fontSize: '0.95rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
                }}
              >
                <Send size={16} /> {editingId ? 'Güncelle' : 'Makaleyi Yayınla'}
              </button>
            </div>
          </div>

          {/* MAIN UNIFIED STUDIO WORKSTATION & CHECKLIST GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.8rem', alignItems: 'start' }}>
            
            {/* UNIFIED SINGLE DARK FORM WORKSTATION */}
            <div style={{ 
              background: '#0F172A', 
              border: '1px solid rgba(88, 101, 242, 0.3)', 
              borderRadius: '20px', 
              padding: '2rem',
              boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}>
              
              {/* Field 1: Focus Keyword */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38BDF8', fontWeight: '800', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                  <Search size={16} /> 1. Odak Anahtar Kelime (Focus Keyword)
                </label>
                <input
                  type="text"
                  placeholder="Örn: Albion Online Black Zone Rehberi"
                  value={focusKeyword}
                  onChange={(e) => setFocusKeyword(e.target.value)}
                  style={{ ...inputStyle, fontSize: '1.05rem', fontWeight: 'bold' }}
                />
                <span style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '0.4rem', display: 'block' }}>
                  * Bütün SEO kriterleri bu anahtar kelimenin başlık, açıklama ve içerik içindeki uyumuna göre ölçülür.
                </span>
              </div>

              {/* Field 2 & 3: Title & Category */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: '1.2rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <label style={{ fontWeight: '700', color: '#FFF', fontSize: '0.9rem' }}>Makale Başlığı (Title)</label>
                    <span style={{ fontSize: '0.8rem', color: title.length >= 40 && title.length <= 70 ? '#10B981' : '#EF4444', fontWeight: 'bold' }}>
                      {title.length} / 60 Karakter
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="Örn: Albion Online 2026 Black Zone Rehberi: Gankten Kaçma Taktikleri"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ fontWeight: '700', color: '#FFF', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ ...inputStyle, height: '44px', cursor: 'pointer' }}
                  >
                    <option value="Albion Online" style={{ background: '#0F172A', color: '#FFF' }}>Albion Online</option>
                    <option value="Discord Rehberleri" style={{ background: '#0F172A', color: '#FFF' }}>Discord Rehberleri</option>
                    <option value="Guild Yönetimi" style={{ background: '#0F172A', color: '#FFF' }}>Guild Yönetimi</option>
                    <option value="Strateji" style={{ background: '#0F172A', color: '#FFF' }}>Strateji</option>
                    <option value="Genel" style={{ background: '#0F172A', color: '#FFF' }}>Genel</option>
                  </select>
                </div>
              </div>

              {/* Field 4: Meta Description */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label style={{ fontWeight: '700', color: '#FFF', fontSize: '0.9rem' }}>Meta Açıklaması (Meta Description)</label>
                  <span style={{ fontSize: '0.8rem', color: description.length >= 120 && description.length <= 160 ? '#10B981' : '#EF4444', fontWeight: 'bold' }}>
                    {description.length} / 160 Karakter
                  </span>
                </div>
                <textarea
                  rows={3}
                  placeholder="Google arama sonuçlarında görünecek 140-160 karakter arası etkileyici makale özeti..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5' }}
                />
              </div>

              {/* Field 5 & 6: Cover Image & Tags */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <label style={{ fontWeight: '700', color: '#FFF', fontSize: '0.9rem' }}>Kapak Görseli URL</label>
                    <button 
                      type="button" 
                      onClick={handleGenerateCoverImage}
                      style={{ background: 'none', border: 'none', color: '#38BDF8', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                    >
                      ✨ Görsel Oluştur
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="https://image.pollinations.ai/..."
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ fontWeight: '700', color: '#FFF', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>Etiketler (Virgülle ayırın)</label>
                  <input
                    type="text"
                    placeholder="albion, black zone, pvp, rehber"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Field 7: Markdown Content */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <label style={{ fontWeight: '700', color: '#FFF', fontSize: '0.95rem' }}>
                    Markdown Makale İçeriği (En az 800-1000 kelime)
                  </label>
                  <span style={{ fontSize: '0.85rem', color: seoAnalysis.wordCount >= 800 ? '#10B981' : '#F59E0B', fontWeight: 'bold' }}>
                    ~{seoAnalysis.wordCount} Kelime
                  </span>
                </div>

                {/* Quick Toolbar */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => setContent(prev => prev + '\n\n## Yeni Başlık (H2)\n')} style={{ background: '#1E293B', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.35rem 0.7rem', fontSize: '0.8rem', cursor: 'pointer' }}>+ H2 Başlık</button>
                  <button type="button" onClick={() => setContent(prev => prev + '\n\n### Alt Başlık (H3)\n')} style={{ background: '#1E293B', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.35rem 0.7rem', fontSize: '0.8rem', cursor: 'pointer' }}>+ H3 Başlık</button>
                  <button type="button" onClick={() => setContent(prev => prev + '\n\n- Liste Maddesi 1\n- Liste Maddesi 2\n')} style={{ background: '#1E293B', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.35rem 0.7rem', fontSize: '0.8rem', cursor: 'pointer' }}>+ Liste</button>
                  <button type="button" onClick={() => setContent(prev => prev + '\n\n> Önemli İpucu / Not\n')} style={{ background: '#1E293B', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.35rem 0.7rem', fontSize: '0.8rem', cursor: 'pointer' }}>+ Alıntı</button>
                  <button type="button" onClick={() => setContent(prev => prev + '\n\n## Sıkça Sorulan Sorular (SSS)\n\n**Soru:** ...\n**Cevap:** ...\n')} style={{ background: '#1E293B', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.35rem 0.7rem', fontSize: '0.8rem', cursor: 'pointer' }}>+ SSS Şablonu</button>
                </div>

                <textarea
                  rows={20}
                  placeholder="Markdown formatında 1000+ kelimelik makale metninizi yazın..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  style={{ 
                    ...inputStyle, 
                    fontFamily: 'Consolas, monospace', 
                    fontSize: '0.95rem', 
                    lineHeight: '1.6', 
                    resize: 'vertical' 
                  }}
                />
              </div>

            </div>

            {/* RIGHT SIDEBAR: SEO CHECKLIST ACCORDION */}
            <div style={{ position: 'sticky', top: '100px' }}>
              <div style={{ 
                background: '#0F172A', 
                border: '1px solid rgba(88, 101, 242, 0.3)', 
                borderRadius: '20px', 
                padding: '1.5rem',
                boxShadow: '0 15px 35px rgba(0,0,0,0.4)'
              }}>
                <h3 style={{ fontSize: '1.05rem', color: '#fff', fontWeight: '800', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={18} color="#10B981" /> SEO Kriter Kontrol Listesi
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {seoAnalysis.checks.map(check => {
                    let isPass = check.status === 'pass';
                    let isWarn = check.status === 'warning';
                    let iconColor = isPass ? '#10B981' : (isWarn ? '#F59E0B' : '#EF4444');

                    return (
                      <div 
                        key={check.id}
                        style={{ 
                          display: 'flex', 
                          gap: '0.75rem', 
                          alignItems: 'flex-start',
                          padding: '0.75rem 0.9rem',
                          borderRadius: '10px',
                          background: isPass ? 'rgba(16, 185, 129, 0.08)' : (isWarn ? 'rgba(245, 158, 11, 0.08)' : 'rgba(239, 68, 68, 0.12)'),
                          borderLeft: `4px solid ${iconColor}`
                        }}
                      >
                        <div style={{ marginTop: '2px', color: iconColor, flexShrink: 0 }}>
                          {isPass ? <CheckCircle2 size={18} /> : (isWarn ? <AlertCircle size={18} /> : <XCircle size={18} />)}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: '800', color: isPass ? '#FFF' : (isWarn ? '#FDE047' : '#FCA5A5') }}>
                            {check.title}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '3px', lineHeight: '1.4' }}>
                            {check.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>

          </div>
        </>
      )}

      {/* PUBLISHED POSTS LIST TAB */}
      {activeTab === 'list' && (
        <div style={{ 
          background: '#0F172A', 
          border: '1px solid rgba(88, 101, 242, 0.3)', 
          borderRadius: '20px', 
          padding: '2rem',
          boxShadow: '0 15px 35px rgba(0,0,0,0.4)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#fff', margin: 0, fontWeight: 'bold' }}>
              Yayındaki Blog Yazıları ({filteredPosts.length})
            </h3>

            <input
              type="text"
              placeholder="Makale başlığı ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ ...inputStyle, width: '280px' }}
            />
          </div>

          {fetchingPosts ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
              Makaleler yükleniyor...
            </div>
          ) : filteredPosts.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
              Henüz yayınlanmış bir blog yazısı bulunamadı.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8', fontSize: '0.85rem' }}>
                    <th style={{ padding: '1rem' }}>Başlık</th>
                    <th style={{ padding: '1rem' }}>Kategori</th>
                    <th style={{ padding: '1rem' }}>Okuma</th>
                    <th style={{ padding: '1rem' }}>Tarih</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map(post => (
                    <tr key={post.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem', fontWeight: 'bold', color: '#fff', maxWidth: '380px' }}>
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {post.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#38BDF8', marginTop: '2px' }}>
                          /blog/{post.slug}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ background: 'rgba(88, 101, 242, 0.2)', color: '#38BDF8', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          {post.category || 'Genel'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#94A3B8' }}>
                        {post.read_time_minutes || 5} dk
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#94A3B8' }}>
                        {new Date(post.published_at || post.created_at).toLocaleDateString('tr-TR')}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ background: '#1E293B', color: '#CBD5E1', border: 'none', borderRadius: '6px', padding: '0.4rem 0.7rem', fontSize: '0.8rem', textDecoration: 'none' }}
                            title="Görüntüle"
                          >
                            <ExternalLink size={14} />
                          </a>

                          <button
                            onClick={() => handleEditClick(post)}
                            style={{ background: '#1E293B', color: '#38BDF8', border: 'none', borderRadius: '6px', padding: '0.4rem 0.7rem', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                            title="Düzenle"
                          >
                            <Edit3 size={14} /> Düzenle
                          </button>

                          <button
                            onClick={() => handleDeletePost(post.id)}
                            style={{ background: '#1E293B', color: '#EF4444', border: 'none', borderRadius: '6px', padding: '0.4rem 0.7rem', fontSize: '0.8rem', cursor: 'pointer' }}
                            title="Sil"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
