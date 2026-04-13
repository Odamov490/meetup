import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { eventService } from '../firebase';
import { Card, Spinner, Btn } from '../components/UI';

const CAT = { tech:'💻', sport:'⚽', art:'🎨', music:'🎵', business:'💼', education:'📚', food:'🍜', travel:'✈️' };

export default function Home() {
  const { t } = useApp();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventService.getAll().then(data => { setEvents(data.slice(0, 6)); setLoading(false); });
  }, []);

  return (
    <div>
      <style>{`
        .hero { max-width:1200px; margin:0 auto; padding:80px 24px 60px; display:grid; grid-template-columns:1fr 1fr; gap:60px; align-items:center; min-height:calc(100vh - 64px); }
        @media(max-width:768px) { .hero { grid-template-columns:1fr; padding:40px 16px; min-height:auto; } .hero-visual { display:none; } }
        .hero-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:16px; display:flex; align-items:center; gap:12px; box-shadow:var(--shadow); opacity:0; animation:slideUp .6s ease forwards; }
        .hero-card:nth-child(1){animation-delay:.1s} .hero-card:nth-child(2){animation-delay:.2s} .hero-card:nth-child(3){animation-delay:.3s}
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .stats-bar { background:var(--accent); padding:24px; }
        .stats-inner { max-width:900px; margin:0 auto; display:grid; grid-template-columns:repeat(4,1fr); gap:20px; text-align:center; }
        @media(max-width:600px) { .stats-inner { grid-template-columns:repeat(2,1fr); } }
        .cat-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(130px,1fr)); gap:12px; }
        .cat-btn { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:20px; text-align:center; cursor:pointer; transition:all .2s; display:flex; flex-direction:column; align-items:center; gap:8px; }
        .cat-btn:hover { border-color:var(--accent); color:var(--accent); transform:translateY(-2px); box-shadow:var(--shadow); }
        .event-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:16px; }
        .section { max-width:1200px; margin:0 auto; padding:40px 24px; }
      `}</style>

      {/* Hero */}
      <section className="hero">
        <div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'var(--accent-bg)', color:'var(--accent)', padding:'6px 14px', borderRadius:20, fontSize:'0.8rem', fontWeight:600, marginBottom:20, letterSpacing:'0.5px' }}>
            🇺🇿 Meetup.uz
          </div>
          <h1 style={{ marginBottom:20 }}>{t('heroTitle')}</h1>
          <p style={{ fontSize:'1.05rem', marginBottom:32 }}>{t('heroSub')}</p>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <Btn onClick={() => navigate('/groups')} style={{ padding:'13px 28px', fontSize:'1rem', borderRadius:10 }}>
              🔍 {t('exploreGroups')}
            </Btn>
            <Btn variant="outline" onClick={() => navigate('/groups')} style={{ padding:'13px 28px', fontSize:'1rem', borderRadius:10 }}>
              + {t('createGroup')}
            </Btn>
          </div>
        </div>
        <div className="hero-visual">
          <div style={{ display:'grid', gap:12 }}>
            {[
              { icon:'💻', name:'Toshkent Dev Community', count:'234' },
              { icon:'🎨', name:"O'zbek Design Club", count:'156' },
              { icon:'⚽', name:'Weekend Football — Samarqand', count:'89' },
            ].map((c, i) => (
              <div key={i} className="hero-card">
                <div style={{ width:44, height:44, borderRadius:10, background:'var(--accent-bg)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', flexShrink:0 }}>{c.icon}</div>
                <div>
                  <div style={{ fontWeight:600, fontSize:'0.9rem' }}>{c.name}</div>
                  <div style={{ fontSize:'0.78rem', color:'var(--accent)' }}>{c.count} {t('members')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="stats-bar">
        <div className="stats-inner">
          {[['12K+', t('statUsers')], ['340+', t('statGroups')], ['1.2K+', t('statEvents')], ['14', t('statCities')]].map(([n, l]) => (
            <div key={l}>
              <span style={{ fontFamily:'var(--font-head)', fontSize:'2rem', fontWeight:800, color:'white', display:'block' }}>{n}</span>
              <span style={{ fontSize:'0.85rem', color:'rgba(255,255,255,0.8)' }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <section className="section">
        <h2 style={{ marginBottom:24 }}>{t('groups')}</h2>
        <div className="cat-grid">
          {Object.entries(CAT).map(([key, emoji]) => (
            <button key={key} className="cat-btn" onClick={() => navigate(`/groups?cat=${key}`)}>
              <span style={{ fontSize:'2rem' }}>{emoji}</span>
              <span style={{ fontWeight:600, fontSize:'0.9rem' }}>{t(key)}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Upcoming events */}
      <section className="section" style={{ paddingTop:0 }}>
        <h2 style={{ marginBottom:24 }}>{t('upcoming')} {t('events')}</h2>
        {loading ? <Spinner /> : (
          events.length === 0 ? <p style={{ color:'var(--text3)' }}>{t('noData')}</p> : (
            <div className="event-grid">
              {events.map(ev => {
                const d = ev.date?.toDate ? ev.date.toDate() : ev.date ? new Date(ev.date) : null;
                return (
                  <Card key={ev.id} onClick={() => navigate(`/events/${ev.id}`)}>
                    <div style={{ height:120, background:'linear-gradient(135deg,var(--accent-bg),var(--bg3))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2.5rem' }}>◷</div>
                    <div style={{ padding:16 }}>
                      <div style={{ fontFamily:'var(--font-head)', fontWeight:600, marginBottom:6 }}>{ev.title}</div>
                      {d && <div style={{ fontSize:'0.8rem', color:'var(--text3)' }}>📅 {d.toLocaleDateString()}</div>}
                      <div style={{ fontSize:'0.8rem', color:'var(--text3)', marginTop:4 }}>👥 {ev.attendeeCount || 0} {t('attendees')}</div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )
        )}
      </section>
    </div>
  );
}
