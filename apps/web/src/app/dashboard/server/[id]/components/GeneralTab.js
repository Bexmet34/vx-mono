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
            <p className="hint">{t.dLangHint}</p>
          </div>

          <div className="inputGroup">
            <label className="label">{t.dRoleSyncLabel}</label>
            <select
              className="select"
              value={settings.auto_role_sync ? "true" : "false"}
              onChange={(e) => setSettings({ ...settings, auto_role_sync: e.target.value === "true" })}
            >
              <option value="true">{t.dRoleSyncOn}</option>
              <option value="false">{t.dRoleSyncOff}</option>
            </select>
            <p className="hint">{t.dRoleSyncHint}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
