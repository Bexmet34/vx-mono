"use client";

import { Layout } from "lucide-react";

export default function GeneralTab({ t, settings, setSettings }) {
  return (
    <div className="bentoGrid">
      <div className="bentoBox span12">
        <h2 className="bentoTitle"><Layout /> {t.dGeneral}</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="inputGroup">
            <label className="label">{t.dLangLabel}</label>
            <select
              className="select"
              value={settings.language || "tr"}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
            >
              <option value="tr">Türkçe</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
