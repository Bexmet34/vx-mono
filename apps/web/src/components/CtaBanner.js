"use client";

import Link from 'next/link';

export default function CtaBanner() {
  return (
    <div style={{
      background: 'linear-gradient(90deg, rgba(252, 163, 17, 0.1) 0%, rgba(231, 76, 60, 0.1) 100%)',
      border: '1px solid rgba(252, 163, 17, 0.3)',
      borderRadius: '12px',
      padding: '2rem',
      textAlign: 'center',
      margin: '3rem auto',
      maxWidth: '800px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle, rgba(252, 163, 17, 0.05) 0%, transparent 60%)',
        zIndex: 0,
        pointerEvents: 'none'
      }}></div>
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h3 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '0.5rem', fontWeight: '800' }}>
          Loncanızın Savaşlarını Discord&apos;a Taşıyın!
        </h3>
        <p style={{ color: '#aaa', fontSize: '1rem', marginBottom: '1.5rem', maxWidth: '600px', margin: '0 auto 1.5rem auto' }}>
          Veyronix Bot ile Albion Online Killboard, otomatik roller ve etkinlik yönetimini doğrudan Discord sunucunuzda ücretsiz olarak kullanın.
        </p>
        
        <Link 
          href="https://discord.com/oauth2/authorize?client_id=1082239904169336902&permissions=510977&scope=bot+applications.commands"
          target="_blank"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#5865F2',
            color: '#fff',
            fontWeight: 'bold',
            padding: '0.8rem 2rem',
            borderRadius: '30px',
            textDecoration: 'none',
            fontSize: '1.1rem',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(88, 101, 242, 0.4)'
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          Discord Sunucuna Ekle
        </Link>
      </div>
    </div>
  );
}
