"use client";

import { Lock } from "lucide-react";

export default function RegistrationTab() {
  return (
    <div className="bentoGrid">
      <div className="bentoBox span12" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <Lock size={48} color="var(--accent-color)" style={{ margin: '0 auto 1.5rem', opacity: 0.5 }} />
        <h2 className="bentoTitle" style={{ justifyContent: 'center', fontSize: '2rem' }}>Auto Registration (Premium)</h2>
        <p style={{ color: '#888', maxWidth: '600px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
          Automatically assign roles to your members when they join your server by verifying their Albion Online characters.
        </p>
        <button className="floatingSave" style={{ position: 'relative', bottom: 'auto', right: 'auto', margin: '0 auto', opacity: 0.5 }} disabled>
          Upgrade to Premium to Unlock
        </button>
      </div>
    </div>
  );
}
