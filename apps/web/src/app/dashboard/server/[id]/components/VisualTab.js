"use client";

import { Image as ImageIcon, Upload, Link as LinkIcon, Trash } from "lucide-react";
import InfoTooltip from "@/components/InfoTooltip";
import { useLanguage } from "@/context/LanguageContext";

export default function VisualTab({ t, settings, setSettings, uploadingThumb, checkImage, handleFileSelect, thumbError, renderStatus }) {
  const { lang } = useLanguage();
  return (
    <div className="grid grid-cols-1 gap-3 animate-slide-up">
      <div className="glass-panel p-5 relative overflow-visible border border-outline-variant hover:border-primary-container/50 transition-colors">
        <h2 className="font-headline-lg text-lg text-on-surface mb-8 flex items-center gap-3 uppercase tracking-tight"><ImageIcon className="text-primary-container" /> Branding & Visuals</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <div className="mb-8">
              <label className="flex items-center text-sm font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                Thumbnail Image URL
                <InfoTooltip text={lang === 'en' ? 'The URL of the image to display in the top right corner of the bot\'s messages.' : 'Botun attığı mesajların sağ üst köşesinde görünecek küçük resmin (logo) bağlantısı.'} />
              </label>
              <div className="flex gap-2 items-center bg-surface-container-high border border-outline-variant rounded-sm px-3 py-2 focus-within:border-primary-container transition-colors">
                <LinkIcon size={18} className="text-on-surface-variant flex-shrink-0" />
                <input
                  type="text"
                  className="w-full bg-transparent text-on-surface focus:outline-none font-body-md"
                  placeholder="https://..."
                  value={settings.embed_thumbnail_url || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSettings({ ...settings, embed_thumbnail_url: val });
                    if (val) checkImage(val);
                  }}
                />
              </div>
              {renderStatus && renderStatus(thumbError)}
              <p className="text-xs font-body-md text-on-surface-variant mt-2">This image will appear on the top right of your Discord party embeds.</p>
            </div>

            <div>
              <label className="flex items-center text-sm font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                Or Upload a Logo
                <InfoTooltip text={lang === 'en' ? 'Upload an image directly from your computer instead of using a URL.' : 'URL kullanmak yerine bilgisayarınızdan doğrudan bir logo yükleyin.'} />
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/gif"
                  onChange={handleFileSelect}
                  className="opacity-0 absolute inset-0 cursor-pointer z-10"
                />
                <div className="border border-dashed border-outline-variant/50 p-4 text-center rounded-sm cursor-pointer bg-white/5 hover:bg-white/10 hover:border-primary-container/50 transition-colors">
                   <Upload size={24} className="text-on-surface-variant mx-auto mb-2" />
                   <div className="font-label-bold text-on-surface text-sm uppercase tracking-widest mb-1">Click to Browse</div>
                   <div className="text-xs font-body-md text-on-surface-variant">PNG, JPG up to 2MB</div>
                </div>
              </div>
            </div>
          </div>

          <div>
             <label className="flex items-center text-sm font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
               Live Preview
               <InfoTooltip text={lang === 'en' ? 'A real-time preview of how your settings will look on Discord.' : 'Discord üzerinde mesajlarınızın nasıl görüneceğinin anlık önizlemesi.'} />
             </label>
             <div className="bg-[#2b2d31] rounded-sm p-4 border border-[#1e1f22] min-h-[200px] shadow-lg">
                <div className="flex gap-3">
                   <div className="flex-1 mt-1">
                     <div className="bg-[#1e1f22] h-3.5 w-3/5 rounded-sm mb-2"></div>
                     <div className="bg-[#1e1f22] h-2.5 w-2/5 rounded-sm mb-2"></div>
                     <div className="bg-[#1e1f22] h-2.5 w-4/5 rounded-sm mb-2"></div>
                     <div className="bg-[#1e1f22] h-2.5 w-3/4 rounded-sm mb-2"></div>
                     <div className="bg-[#1e1f22] h-8 w-1/3 rounded-sm mt-4"></div>
                   </div>
                   {(settings.embed_thumbnail_url && !thumbError) ? (
                     <div className="w-16 h-16 rounded-sm overflow-hidden flex-shrink-0 bg-[#1e1f22]">
                       <img src={settings.embed_thumbnail_url} alt="Logo" className="w-full h-full object-cover" />
                     </div>
                   ) : (
                     <div className="w-16 h-16 rounded-sm bg-[#1e1f22] flex items-center justify-center flex-shrink-0">
                        <ImageIcon className="text-[#555]" size={24} />
                     </div>
                   )}
                </div>
             </div>
             
             {settings.embed_thumbnail_url && !thumbError && (
               <button className="flex items-center gap-2 mt-4 text-error hover:text-error/80 font-label-bold text-sm uppercase tracking-widest transition-colors px-4 py-2 hover:bg-error/10 rounded-sm" onClick={() => setSettings({ ...settings, embed_thumbnail_url: '' })}>
                 <Trash size={16} /> Remove Logo
               </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
