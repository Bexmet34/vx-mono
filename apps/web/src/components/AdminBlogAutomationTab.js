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
  Info,
  HelpCircle,
  Wand2,
  Check,
  Search
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
    const contentLower = cleanContent.toLowerCase();

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

  return (
    <div style={{ paddingBottom: '3rem' }}>
      
      {/* Notification Toast */}
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

      {/* Header Banner */}
      <div className="admin-card" style={{ 
        background: 'linear-gradient(135deg, rgba(88, 101, 242, 0.2) 0%, rgba(15, 23, 42, 0.9) 100%)', 
        border: '1px solid rgba(88, 101, 242, 0.4)', 
        padding: '2rem',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(88, 101, 242, 0.2)', color: '#5865F2', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.8rem' }}>
              <FileText size={14} /> Manuel SEO Blog Yayıncısı
            </div>
            <h2 style={{ fontSize: '1.8rem', color: '#fff', margin: 0, fontWeight: 'bold' }}>
              Manuel Blog Editörü & Canlı SEO Ölçer (Hata Payı %0)
            </h2>
            <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0', fontSize: '0.95rem' }}>
              Google AdSense & RankMath standartlarına uygun canlı SEO denetleyicisi ile hatasız Türkçe blog yazıları hazırlayın.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button
              onClick={() => { resetForm(); setActiveTab('editor'); }}
              className={`admin-button ${activeTab === 'editor' && !editingId ? 'primary' : 'secondary'}`}
              style={{ padding: '0.75rem 1.4rem' }}
            >
              <Plus size={16} /> Yeni Makale Yaz
            </button>

            <button
              onClick={() => setActiveTab('list')}
              className={`admin-button ${activeTab === 'list' ? 'primary' : 'secondary'}`}
              style={{ padding: '0.75rem 1.4rem' }}
            >
              <Layers size={16} /> Yayındaki Makaleler ({posts.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'editor' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>
          
          {/* LEFT FORM SECTION */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Focus Keyword & AI Draft Header */}
            <div className="admin-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <label style={{ fontWeight: 'bold', color: '#fff', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Search size={16} color="#5865F2" /> 1. Odak Anahtar Kelime (Focus Keyword)
                </label>
                
                <button
                  onClick={handleGenerateAiDraft}
                  disabled={aiGenerating}
                  style={{
                    background: 'linear-gradient(135deg, #5865F2, #8B5CF6)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.4rem 0.9rem',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    cursor: aiGenerating ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Wand2 size={14} /> {aiGenerating ? 'Taslak Hazırlanıyor...' : 'Yapay Zeka İle Taslak Üret'}
                </button>
              </div>

              <input
                type="text"
                placeholder="Örn: Albion Online Black Zone Rehberi"
                value={focusKeyword}
                onChange={(e) => setFocusKeyword(e.target.value)}
                className="admin-input"
                style={{ width: '100%', fontSize: '1rem', padding: '0.8rem 1rem' }}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.4rem' }}>
                * Bütün SEO kriterleri bu anahtar kelimenin başlıkta, açıklamada ve metin içindeki sıklığına göre ölçülür.
              </span>
            </div>

            {/* Title & Category Row */}
            <div className="admin-card">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: '1.2rem', marginBottom: '1.2rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <label style={{ fontWeight: 'bold', color: '#fff', fontSize: '0.9rem' }}>Makale Başlığı (Title)</label>
                    <span style={{ fontSize: '0.8rem', color: title.length >= 40 && title.length <= 70 ? '#10B981' : '#EF4444', fontWeight: 'bold' }}>
                      {title.length} / 60 Karakter
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="Örn: Albion Online 2026 Black Zone Rehberi: Gankten Kaçma Taktikleri"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="admin-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontWeight: 'bold', color: '#fff', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="admin-input"
                    style={{ width: '100%', height: '42px' }}
                  >
                    <option value="Albion Online">Albion Online</option>
                    <option value="Discord Rehberleri">Discord Rehberleri</option>
                    <option value="Guild Yönetimi">Guild Yönetimi</option>
                    <option value="Strateji">Strateji</option>
                    <option value="Genel">Genel</option>
                  </select>
                </div>
              </div>

              {/* Meta Description */}
              <div style={{ marginBottom: '1.2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label style={{ fontWeight: 'bold', color: '#fff', fontSize: '0.9rem' }}>Meta Açıklaması (Meta Description)</label>
                  <span style={{ fontSize: '0.8rem', color: description.length >= 120 && description.length <= 160 ? '#10B981' : '#EF4444', fontWeight: 'bold' }}>
                    {description.length} / 160 Karakter
                  </span>
                </div>
                <textarea
                  rows={3}
                  placeholder="Google arama sonuçlarında görünen 140-160 karakter arası özet..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="admin-input"
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              {/* Cover Image & Tags */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <label style={{ fontWeight: 'bold', color: '#fff', fontSize: '0.9rem' }}>Kapak Görseli URL</label>
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
                    className="admin-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontWeight: 'bold', color: '#fff', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>Etiketler (Virgülle ayırın)</label>
                  <input
                    type="text"
                    placeholder="albion, black zone, pvp, rehber"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="admin-input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>

            {/* Markdown Content Editor */}
            <div className="admin-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <label style={{ fontWeight: 'bold', color: '#fff', fontSize: '1rem' }}>
                  Markdown İçerik Metni (En az 800 kelime)
                </label>
                <div style={{ fontSize: '0.85rem', color: seoAnalysis.wordCount >= 800 ? '#10B981' : '#F59E0B', fontWeight: 'bold' }}>
                  Kelime Sayısı: ~{seoAnalysis.wordCount} Kelime | H2 Başlık: {seoAnalysis.h2Count} Adet
                </div>
              </div>

              {/* Quick Helper Toolbar */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
                <button type="button" onClick={() => setContent(prev => prev + '\n\n## Yeni Başlık (H2)\n')} className="admin-button secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>+ H2 Başlık</button>
                <button type="button" onClick={() => setContent(prev => prev + '\n\n### Alt Başlık (H3)\n')} className="admin-button secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>+ H3 Başlık</button>
                <button type="button" onClick={() => setContent(prev => prev + '\n\n- Liste Maddesi 1\n- Liste Maddesi 2\n')} className="admin-button secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>+ Liste</button>
                <button type="button" onClick={() => setContent(prev => prev + '\n\n> Önemli Not / İpucu kutusu\n')} className="admin-button secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>+ Alıntı</button>
                <button type="button" onClick={() => setContent(prev => prev + '\n\n## Sıkça Sorulan Sorular (SSS)\n\n**Soru:** ...\n**Cevap:** ...\n')} className="admin-button secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>+ SSS Şablonu</button>
              </div>

              <textarea
                rows={18}
                placeholder="Markdown formatında 1000+ kelimelik tam makale içeriğini buraya yazın..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="admin-input"
                style={{ width: '100%', fontFamily: 'Consolas, monospace', fontSize: '0.95rem', lineHeight: '1.6', resize: 'vertical' }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              {editingId && (
                <button
                  onClick={resetForm}
                  className="admin-button secondary"
                  style={{ padding: '0.8rem 1.5rem' }}
                >
                  İptal Et
                </button>
              )}

              <button
                onClick={() => handleSavePost('draft')}
                disabled={loading}
                className="admin-button secondary"
                style={{ padding: '0.8rem 1.5rem' }}
              >
                Taslak Olarak Kaydet
              </button>

              <button
                onClick={() => handleSavePost('published')}
                disabled={loading}
                className="admin-button primary"
                style={{ 
                  padding: '0.8rem 2rem', 
                  fontSize: '1rem', 
                  fontWeight: 'bold',
                  background: seoAnalysis.score < 60 ? '#EF4444' : 'linear-gradient(135deg, #10B981, #059669)'
                }}
              >
                {loading ? 'Kaydediliyor...' : (editingId ? 'Makaleyi Güncelle' : '🚀 Makaleyi Canlıya Al (Yayınla)')}
              </button>
            </div>

          </div>

          {/* RIGHT SIDEBAR: REAL-TIME ADVANCED SEO AUDIT METER */}
          <div style={{ position: 'sticky', top: '20px' }}>
            
            {/* Score Card */}
            <div className="admin-card" style={{ 
              border: `2px solid ${seoAnalysis.color}`,
              background: 'rgba(15, 23, 42, 0.95)',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              borderRadius: '16px'
            }}>
              <div style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Canlı SEO Puanı
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '3.5rem', fontWeight: '900', color: seoAnalysis.color, lineHeight: 1 }}>
                  {seoAnalysis.score}
                </span>
                <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>/ 100</span>
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden', marginBottom: '1rem' }}>
                <div style={{ 
                  width: `${seoAnalysis.score}%`, 
                  height: '100%', 
                  background: seoAnalysis.color,
                  transition: 'width 0.3s ease'
                }} />
              </div>

              <div style={{ 
                background: `${seoAnalysis.color}20`, 
                color: seoAnalysis.color, 
                padding: '0.5rem 0.8rem', 
                borderRadius: '8px', 
                fontSize: '0.85rem', 
                fontWeight: 'bold',
                textAlign: 'center'
              }}>
                {seoAnalysis.badgeText}
              </div>
            </div>

            {/* Checklist items */}
            <div className="admin-card" style={{ padding: '1.2rem' }}>
              <h3 style={{ fontSize: '1rem', color: '#fff', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#10B981" /> SEO Denetim Listesi (RankMath)
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
                        gap: '0.7rem', 
                        alignItems: 'flex-start',
                        padding: '0.6rem 0.8rem',
                        borderRadius: '8px',
                        background: isPass ? 'rgba(16, 185, 129, 0.05)' : (isWarn ? 'rgba(245, 158, 11, 0.05)' : 'rgba(239, 68, 68, 0.08)'),
                        borderLeft: `4px solid ${iconColor}`
                      }}
                    >
                      <div style={{ marginTop: '2px', color: iconColor, flexShrink: 0 }}>
                        {isPass ? <CheckCircle2 size={16} /> : (isWarn ? <AlertCircle size={16} /> : <XCircle size={16} />)}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: isPass ? '#fff' : (isWarn ? '#FDE047' : '#FCA5A5') }}>
                          {check.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: '1.4' }}>
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
      )}

      {/* PUBLISHED POSTS LIST TAB */}
      {activeTab === 'list' && (
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#fff', margin: 0, fontWeight: 'bold' }}>
              Yayındaki Blog Yazıları ({filteredPosts.length})
            </h3>

            <input
              type="text"
              placeholder="Makale başlığı ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-input"
              style={{ width: '280px' }}
            />
          </div>

          {fetchingPosts ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Makaleler yükleniyor...
            </div>
          ) : filteredPosts.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Henüz yayınlanmış bir blog yazısı bulunamadı.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
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
                        <span style={{ background: 'rgba(88, 101, 242, 0.2)', color: '#5865F2', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          {post.category || 'Genel'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {post.read_time_minutes || 5} dk
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {new Date(post.published_at || post.created_at).toLocaleDateString('tr-TR')}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="admin-button secondary"
                            style={{ padding: '0.4rem 0.7rem', fontSize: '0.8rem' }}
                            title="Görüntüle"
                          >
                            <ExternalLink size={14} />
                          </a>

                          <button
                            onClick={() => handleEditClick(post)}
                            className="admin-button secondary"
                            style={{ padding: '0.4rem 0.7rem', fontSize: '0.8rem' }}
                            title="Düzenle"
                          >
                            <Edit3 size={14} /> Düzenle
                          </button>

                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="admin-button secondary"
                            style={{ padding: '0.4rem 0.7rem', fontSize: '0.8rem', color: '#EF4444' }}
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
