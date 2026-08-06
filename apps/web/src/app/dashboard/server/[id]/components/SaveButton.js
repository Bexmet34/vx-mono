import React from 'react';
import { Save, Loader2 } from "lucide-react";

export default function SaveButton({ onClick, saving, t, variant = "bottom" }) {
  if (variant === "header") {
    return (
      <button onClick={onClick} className="btn-primary btn-save-header" disabled={saving}>
        {saving ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
        <span>{saving ? t.dSaving : t.dSave}</span>
      </button>
    );
  }

  return (
    <div className="bottom-save-container">
      <button onClick={onClick} className="btn-save-bottom" disabled={saving}>
        {saving ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
        <span>{saving ? t.dSaving : t.dSave}</span>
      </button>
    </div>
  );
}
