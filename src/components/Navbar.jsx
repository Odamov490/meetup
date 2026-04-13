import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { authService } from '../firebase';
import { Avatar } from './UI';

export default function Navbar() {
  const { currentUser, userProfile, t, lang, setLang, theme, toggleTheme } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchVal, setSearchVal] = useState('');
  const isAdmin = userProfile?.role === 'admin';

  const navLinks = [
    { path: '/', label: t('home'), icon: '⌂' },
    { path: '/groups', label: t('groups'), icon: '◈' },
    { path: '/events', label: t('events'), icon: '◷' },
    ...(isAdmin ? [{ path: '/admin', label: t('admin'), icon: '⚙' }] : []),
  ];

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchVal.trim()) {
      navigate(`/groups?search=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  return (
    <>
      <style>{`
        .nav-link { padding:8px 14px; border-radius:8px; font-size:.9rem; font-weight:500; color:var(--text2); background:none; border:none; cursor:pointer; transition:all .2s; text-decoration:none; display:inline-flex; align-items:center; gap:6px; }
        .nav-link:hover, .nav-link.active { background:var(--accent-bg); color:var(--accent); }
        .nav-search { display:flex; align-items:center; background:var(--bg3); border:1px solid var(--border); border-radius:20px; padding:6px 14px; gap:8px; transition:all .2s; }
        .nav-search:focus-within { border-color:var(--accent); background:var(--bg2); }
        .nav-search input { background:none; border:none; outline:none; font-size:.875rem; color:var(--text); width:150px; font-family:var(--font-body); }
        .nav-search input::placeholder { color:var(--text3); }
        .btn-icon { width:38px; height:38px; border-radius:50%; border:1px solid var(--border); background:var(--bg2); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .2s; font-size:1rem; color:var(--text2); }
        .btn-icon:hover { background:var(--bg3); color:var(--accent); }
        @media(max-width:768px) { .nav-search { display:none!important; } .nav-label { display:none; } }
      `}</style>
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:100, height:'var(--nav-h)',
        background: theme === 'dark' ? 'rgba(26,25,22,0.9)' : 'rgba(255,255,255,0.9)',
        borderBottom:'1px solid var(--border)',
        display:'flex', alignItems:'center', padding:'0 24px', gap:8,
        backdropFilter:'blur(12px)',
      }}>
        {/* Logo */}
        <Link to="/" style={{ fontFamily:'var(--font-head)', fontWeight:800, fontSize:'1.3rem', color:'var(--accent)', marginRight:16, letterSpacing:'-0.5px' }}>
          Meetup<span style={{ color:'var(--text)' }}>.uz</span>
        </Link>

        {/* Nav links */}
        <div style={{ display:'flex', gap:2, flex:1 }}>
          {navLinks.map(l => (
            <Link key={l.path} to={l.path} className={`nav-link${location.pathname === l.path ? ' active' : ''}`}>
              {l.icon} <span className="nav-label">{l.label}</span>
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginLeft:'auto' }}>
          <div className="nav-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              type="text" placeholder={t('search')} value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>

          <select
            value={lang} onChange={e => setLang(e.target.value)}
            style={{ padding:'6px 10px', border:'1px solid var(--border)', borderRadius:8, background:'var(--bg2)', color:'var(--text)', fontSize:'0.8rem', cursor:'pointer', outline:'none', fontFamily:'var(--font-body)' }}
          >
            <option value="uz">UZ</option>
            <option value="en">EN</option>
            <option value="ru">RU</option>
          </select>

          <button className="btn-icon" onClick={toggleTheme} title={theme === 'light' ? t('darkMode') : t('lightMode')}>
            {theme === 'light' ? '☾' : '☀'}
          </button>

          {currentUser ? (
            <Link to="/profile" style={{ borderRadius:'50%', overflow:'hidden', display:'flex' }}>
              <Avatar user={userProfile || currentUser} size={38} />
            </Link>
          ) : (
            <Link to="/auth" style={{
              padding:'8px 18px', background:'var(--accent)', color:'white',
              borderRadius:8, fontSize:'0.875rem', fontWeight:500, textDecoration:'none',
            }}>
              {t('login')}
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
