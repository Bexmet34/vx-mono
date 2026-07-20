"use client";

import { useState, useRef, useEffect } from 'react';
import { Search, Loader2, User, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const router = useRouter();

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length < 3) {
      setResults(null);
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
    setIsLoading(true);

    try {
      const res = await fetch(`https://gameinfo-ams.albiononline.com/api/gameinfo/search?q=${value}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (type, id) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/${type}/europe/${id}`);
  };

  return (
    <div ref={wrapperRef} className="relative hidden lg:block" style={{ zIndex: 50 }}>
      <div className="relative">
        <input 
          type="text" 
          value={query}
          onChange={handleSearch}
          onFocus={() => { if(query.length >= 3) setIsOpen(true) }}
          placeholder="Search Player or Guild..." 
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '0.4rem 1rem 0.4rem 2.5rem',
            color: '#fff',
            fontSize: '0.9rem',
            outline: 'none',
            width: '250px',
            transition: 'all 0.3s'
          }}
          onFocus={(e) => e.target.style.borderColor = 'rgba(252, 163, 17, 0.5)'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
        />
        <Search size={16} color="#aaa" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '0.5rem',
          width: '300px',
          background: '#15171e',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
          overflow: 'hidden'
        }}>
          {isLoading ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#fca311' }}>
              <Loader2 className="animate-spin inline-block" size={24} />
            </div>
          ) : results ? (
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {/* Players Section */}
              {results.players && results.players.length > 0 && (
                <div>
                  <div style={{ padding: '0.5rem 1rem', background: 'rgba(0,0,0,0.3)', fontSize: '0.75rem', fontWeight: 'bold', color: '#aaa', textTransform: 'uppercase' }}>
                    Players
                  </div>
                  {results.players.slice(0, 5).map(p => (
                    <div 
                      key={p.Id} 
                      onClick={() => handleSelect('player', p.Id)}
                      style={{ padding: '0.7rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <User size={16} color="#2ecc71" />
                      <div>
                        <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 'bold' }}>{p.Name}</div>
                        {p.GuildName && <div style={{ color: '#888', fontSize: '0.75rem' }}>{p.GuildName}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Guilds Section */}
              {results.guilds && results.guilds.length > 0 && (
                <div>
                  <div style={{ padding: '0.5rem 1rem', background: 'rgba(0,0,0,0.3)', fontSize: '0.75rem', fontWeight: 'bold', color: '#aaa', textTransform: 'uppercase' }}>
                    Guilds
                  </div>
                  {results.guilds.slice(0, 5).map(g => (
                    <div 
                      key={g.Id} 
                      onClick={() => handleSelect('guild', g.Id)}
                      style={{ padding: '0.7rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <Shield size={16} color="#e74c3c" />
                      <div>
                        <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 'bold' }}>{g.Name}</div>
                        <div style={{ color: '#888', fontSize: '0.75rem' }}>{g.AllianceName ? `[${g.AllianceName}]` : ''}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(!results.players?.length && !results.guilds?.length) && (
                <div style={{ padding: '1rem', textAlign: 'center', color: '#888', fontSize: '0.9rem' }}>
                  No results found.
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
