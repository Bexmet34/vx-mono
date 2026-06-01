import React from 'react';
import { Image as ImageIcon, Loader2, Crop, AlertTriangle } from "lucide-react";
import SaveButton from './SaveButton';

export default function VisualTab({ t, settings, setSettings, uploadingThumb, checkImage, handleFileSelect, thumbError, renderStatus, handleSave, saving }) {
  return (
    <div className="dash-section-card animate-fade-in">
      <h2 className="section-title"><ImageIcon size={22}/> <span suppressHydrationWarning>{t.dVisual || "Visuals"}</span></h2>
      <p className="dash-hint" style={{marginBottom: '2rem'}}>
         Parti mesajlarında görünecek sunucu logonuzu yükleyin veya linkini girin. Sadece /createparty embed'lerinde görünür.
      </p>

      <div className="dash-grid-2" style={{marginTop: '2rem'}}>
        <div className="visuals-form">
          <div className="dash-input-group">
            <label className="dash-label">Logo Linki (Doğrudan URL)</label>
            <input type="text" className="dash-input" placeholder="https://i.imgur.com/..." value={settings.embed_thumbnail_url || ""} onChange={(e) => { setSettings({ ...settings, embed_thumbnail_url: e.target.value }); checkImage(e.target.value); }} />
          </div>

          <div style={{margin: '2rem 0', height: '1px', background: 'var(--dash-border)', position: 'relative', textAlign: 'center'}}>
             <span suppressHydrationWarning style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#0f111a', padding: '0 1rem', color: 'var(--dash-text-muted)', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px'}}>{t.dOrUpload || "OR UPLOAD FILE"}</span>
          </div>
 
          <div className="upload-zone">
            <input type="file" accept="image/*" id="thumbUpload" style={{display: 'none'}} onChange={handleFileSelect} />
            <label htmlFor="thumbUpload" className="dash-select" style={{cursor: 'pointer', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', border: '2px dashed var(--dash-border)', padding: '2.5rem', borderRadius: '16px', transition: 'all 0.3s'}}>
              {uploadingThumb ? <Loader2 size={24} className="spin" color="var(--dash-accent)" /> : <ImageIcon size={28} color="var(--dash-accent)" />}
              <div style={{textAlign: 'left'}}>
                 <div suppressHydrationWarning style={{fontWeight: '700', fontSize: '1.1rem'}}>{uploadingThumb ? t.dSaving : (t.dSelectImage || "Select Image")}</div>
                 <p className="dash-hint" style={{margin: 0}}>PNG, JPG or SVG</p>
              </div>
            </label>
          </div>
          {renderStatus(thumbError)}
        </div>

        <div className="preview-side">
          <label className="dash-label" style={{textAlign: 'center', display: 'block', marginBottom: '1rem', color: 'var(--dash-accent)'}}>Canlı Discord Önizlemesi</label>
          <div className="discord-mockup" style={{background: '#2b2d31', borderRadius: '14px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)'}}>
             <div style={{borderLeft: '4px solid var(--dash-accent)', paddingLeft: '1.25rem', display: 'flex', justifyContent: 'space-between', gap: '1rem'}}>
                <div style={{flex: 1}}>
                   <div style={{fontWeight: '700', fontSize: '1rem', marginBottom: '0.4rem', color: 'white'}}>🛡️ Veyronix | PARTİ KURULDU</div>
                   <div style={{fontSize: '0.85rem', color: '#dbdee1', lineHeight: '1.5'}}>Bu alan sunucunuza özel logo ile şık bir görünüme kavuşur. Kullanıcılarınız bu logoyu gördüğünde sunucunuzun kurumsallığını fark edecektir.</div>
                </div>
                {settings.embed_thumbnail_url && (
                   <img src={settings.embed_thumbnail_url} alt="Logo" style={{width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)'}} />
                )}
             </div>
          </div>
        </div>
      </div>
      <SaveButton onClick={handleSave} saving={saving} t={t} />
    </div>
  );
}
