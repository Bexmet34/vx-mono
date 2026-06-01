"use client";

import { Image as ImageIcon, Upload, Link as LinkIcon, Trash } from "lucide-react";

export default function VisualTab({ t, settings, setSettings, uploadingThumb, checkImage, handleFileSelect, thumbError, renderStatus }) {
  return (
    <div className="bentoGrid">
      <div className="bentoBox span12">
        <h2 className="bentoTitle"><ImageIcon /> Branding & Visuals</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
          <div>
            <div className="inputGroup">
              <label className="label">Thumbnail Image URL</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <LinkIcon size={18} color="#888" />
                <input
                  type="text"
                  className="input"
                  placeholder="https://..."
                  value={settings.embed_thumbnail_url || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSettings({ ...settings, embed_thumbnail_url: val });
                    if (val) checkImage(val);
                  }}
                />
              </div>
              {renderStatus(thumbError)}
              <p className="hint">This image will appear on the top right of your Discord party embeds.</p>
            </div>

            <div className="inputGroup" style={{ marginTop: '2rem' }}>
              <label className="label">Or Upload a Logo</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/gif"
                  onChange={handleFileSelect}
                  style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer' }}
                />
                <div style={{ border: '1px dashed rgba(255,255,255,0.2)', padding: '1.5rem', textAlign: 'center', borderRadius: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}>
                   <Upload size={24} color="#888" style={{ margin: '0 auto 0.5rem' }} />
                   <div style={{ color: '#fff', fontWeight: 600 }}>Click to Browse</div>
                   <div style={{ color: '#666', fontSize: '0.85rem' }}>PNG, JPG up to 2MB</div>
                </div>
              </div>
            </div>
          </div>

          <div>
             <label className="label">Live Preview</label>
             <div style={{ background: '#2b2d31', borderRadius: '8px', padding: '1rem', border: '1px solid #1e1f22', minHeight: '200px' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                   <div style={{ flex: 1 }}>
                     <div style={{ background: '#1e1f22', height: '14px', width: '60%', borderRadius: '4px', marginBottom: '8px' }}></div>
                     <div style={{ background: '#1e1f22', height: '10px', width: '40%', borderRadius: '4px', marginBottom: '8px' }}></div>
                     <div style={{ background: '#1e1f22', height: '10px', width: '80%', borderRadius: '4px', marginBottom: '8px' }}></div>
                   </div>
                   {(settings.embed_thumbnail_url && !thumbError) ? (
                     <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden' }}>
                       <img src={settings.embed_thumbnail_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                     </div>
                   ) : (
                     <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: '#1e1f22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ImageIcon color="#555" size={24} />
                     </div>
                   )}
                </div>
             </div>
             
             {settings.embed_thumbnail_url && !thumbError && (
               <button className="dockItem" style={{ marginTop: '1rem', color: '#ef4444' }} onClick={() => setSettings({ ...settings, embed_thumbnail_url: '' })}>
                 <Trash size={16} /> Remove Logo
               </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
