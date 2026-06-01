"use client";

import { Lock } from "lucide-react";

export default function KillBoardTab() {
  return (
    <div className="bentoGrid">
      <div className="bentoBox span12" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <Lock size={48} color="var(--accent-color)" style={{ margin: '0 auto 1.5rem', opacity: 0.5 }} />
        <h2 className="bentoTitle" style={{ justifyContent: 'center', fontSize: '2rem' }}>KillBoard (Premium)</h2>
        <p style={{ color: '#888', maxWidth: '600px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
          Automatically fetch Albion Online KillBoard stats every day and post a beautifully formatted leaderboard in your Discord server.
        </p>
        <button className="floatingSave" style={{ position: 'relative', bottom: 'auto', right: 'auto', margin: '0 auto', opacity: 0.5 }} disabled>
          Upgrade to Premium to Unlock
        </button>
      </div>
    </div>
  );
}
