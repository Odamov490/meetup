import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { userService, groupService, eventService, reportService } from '../firebase';
import { Spinner, Btn, Badge, Avatar } from '../components/UI';

export default function Admin() {
  const { t, userProfile, showToast } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');
  const [data, setData] = useState({ users:[], groups:[], events:[], reports:[] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile && userProfile.role !== 'admin') { navigate('/'); return; }
    load();
  }, [userProfile]);

  const load = async () => {
    setLoading(true);
    const [users, groups, events, reports] = await Promise.all([
      userService.getAllUsers(),
      groupService.getAll(),
      eventService.getAll(),
      reportService.getAll(),
    ]);
    setData({ users, groups, events, reports });
    setLoading(false);
  };

  const action = async (fn) => {
    try { await fn(); await load(); }
    catch(err) { showToast(err.message, 'error'); }
  };

  const tabs = [
    { key:'dashboard', label:'📊 ' + t('dashboard') },
    { key:'users', label:'👥 ' + t('allUsers') },
    { key:'groups', label:'◈ ' + t('groups') },
    { key:'events', label:'◷ ' + t('events') },
    { key:'reports', label:'⚑ ' + t('reports') },
  ];

  const pending = data.reports.filter(r => r.status === 'pending').length;

  const th = { padding:'12px 16px', textAlign:'left', background:'var(--bg3)', fontWeight:600, color:'var(--text2)', borderBottom:'1px solid var(--border)', whiteSpace:'nowrap', fontSize:'0.875rem' };
  const td = { padding:'12px 16px', borderBottom:'1px solid var(--border)', verticalAlign:'middle', fontSize:'0.875rem' };

  return (
    <div style={{ paddingTop:'var(--nav-h)' }}>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'40px 24px' }}>
        <h1 style={{ marginBottom:24 }}>⚙ {t('adminPanel')}</h1>

        {/* Tab nav */}
        <div style={{ display:'flex', gap:4, background:'var(--bg3)', borderRadius:'var(--radius)', padding:6, marginBottom:32, flexWrap:'wrap' }}>
          {tabs.map(tb => (
            <button key={tb.key} onClick={() => setTab(tb.key)} style={{
              flex:1, minWidth:100, padding:'10px 16px',
              background: tab === tb.key ? 'var(--bg2)' : 'none',
              border:'none', borderRadius:8,
              fontSize:'0.875rem', fontWeight:500,
              color: tab === tb.key ? 'var(--accent)' : 'var(--text2)',
              cursor:'pointer', fontFamily:'var(--font-body)',
              boxShadow: tab === tb.key ? 'var(--shadow)' : 'none',
              transition:'all .2s',
            }}>
              {tb.label}
              {tb.key === 'reports' && pending > 0 && <span style={{ marginLeft:6, background:'var(--red)', color:'white', borderRadius:'50%', width:18, height:18, display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem' }}>{pending}</span>}
            </button>
          ))}
        </div>

        {loading ? <Spinner /> : (
          <>
            {/* Dashboard */}
            {tab === 'dashboard' && (
              <div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:16, marginBottom:32 }}>
                  {[
                    [data.users.length, t('totalUsers')],
                    [data.groups.length, t('totalGroups')],
                    [data.events.length, t('totalEvents')],
                    [pending, t('pendingReports')],
                  ].map(([n, l], i) => (
                    <div key={l} style={{ background:'var(--surface)', border:`1px solid ${i===3 && n>0 ? 'var(--red)' : 'var(--border)'}`, borderRadius:'var(--radius)', padding:20 }}>
                      <span style={{ fontFamily:'var(--font-head)', fontSize:'2rem', fontWeight:800, color: i===3 && n>0 ? 'var(--red)' : 'var(--accent)', display:'block' }}>{n}</span>
                      <span style={{ fontSize:'0.85rem', color:'var(--text2)' }}>{l}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
                  <div>
                    <h3 style={{ marginBottom:16 }}>So'nggi foydalanuvchilar</h3>
                    <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', overflow:'hidden' }}>
                      {data.users.slice(0,5).map(u => (
                        <div key={u.id} style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10 }}>
                          <Avatar user={u} size={28} />
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:'0.875rem', fontWeight:500 }}>{u.displayName}</div>
                            <div style={{ fontSize:'0.75rem', color:'var(--text3)' }}>{u.email}</div>
                          </div>
                          <Badge variant={u.role === 'admin' ? 'admin' : 'default'}>{u.role}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 style={{ marginBottom:16 }}>Tadbirlar</h3>
                    <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', overflow:'hidden' }}>
                      {data.events.slice(0,5).map(ev => (
                        <div key={ev.id} style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)' }}>
                          <div style={{ fontSize:'0.875rem', fontWeight:500 }}>{ev.title}</div>
                          <div style={{ fontSize:'0.75rem', color:'var(--text3)' }}>{ev.attendeeCount||0} {t('attendees')}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users */}
            {tab === 'users' && (
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead><tr><th style={th}>Foydalanuvchi</th><th style={th}>Email</th><th style={th}>Shahar</th><th style={th}>Rol</th><th style={th}>Amallar</th></tr></thead>
                  <tbody>
                    {data.users.map(u => (
                      <tr key={u.id} onMouseEnter={e=>e.currentTarget.style.background='var(--bg3)'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                        <td style={td}><div style={{ display:'flex', alignItems:'center', gap:8 }}><Avatar user={u} size={28} />{u.displayName||'—'}</div></td>
                        <td style={{ ...td, color:'var(--text2)' }}>{u.email}</td>
                        <td style={td}>{u.city||'—'}</td>
                        <td style={td}><Badge variant={u.role==='admin'?'admin':'default'}>{u.role}</Badge></td>
                        <td style={td}>
                          <div style={{ display:'flex', gap:6 }}>
                            <Btn size="sm" variant="outline" onClick={() => action(() => userService.setRole(u.id, u.role==='admin'?'user':'admin'))}>
                              {u.role==='admin' ? t('removeAdmin') : t('makeAdmin')}
                            </Btn>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Groups */}
            {tab === 'groups' && (
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead><tr><th style={th}>Guruh</th><th style={th}>Kategoriya</th><th style={th}>Shahar</th><th style={th}>A'zolar</th><th style={th}>Amallar</th></tr></thead>
                  <tbody>
                    {data.groups.map(g => (
                      <tr key={g.id} onMouseEnter={e=>e.currentTarget.style.background='var(--bg3)'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                        <td style={{ ...td, fontWeight:500 }}>{g.name}</td>
                        <td style={td}>{t(g.category)||g.category}</td>
                        <td style={td}>{g.city||'—'}</td>
                        <td style={td}>{g.memberCount||0}</td>
                        <td style={td}>
                          <Btn size="sm" variant="danger" onClick={() => { if(confirm(t('confirmDelete'))) action(() => groupService.delete(g.id)); }}>{t('delete')}</Btn>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Events */}
            {tab === 'events' && (
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead><tr><th style={th}>Tadbir</th><th style={th}>Ishtirokchilar</th><th style={th}>Manzil</th><th style={th}>Amallar</th></tr></thead>
                  <tbody>
                    {data.events.map(ev => (
                      <tr key={ev.id} onMouseEnter={e=>e.currentTarget.style.background='var(--bg3)'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                        <td style={{ ...td, fontWeight:500 }}>{ev.title}</td>
                        <td style={td}>{ev.attendeeCount||0}</td>
                        <td style={{ ...td, color:'var(--text2)' }}>{ev.location?.address||'—'}</td>
                        <td style={td}>
                          <Btn size="sm" variant="danger" onClick={() => { if(confirm(t('confirmDelete'))) action(() => eventService.delete(ev.id)); }}>{t('delete')}</Btn>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Reports */}
            {tab === 'reports' && (
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead><tr><th style={th}>Tur</th><th style={th}>Sabab</th><th style={th}>Holat</th><th style={th}>Amallar</th></tr></thead>
                  <tbody>
                    {data.reports.length === 0 ? (
                      <tr><td colSpan="4" style={{ ...td, textAlign:'center', color:'var(--text3)' }}>{t('noData')}</td></tr>
                    ) : data.reports.map(r => (
                      <tr key={r.id} onMouseEnter={e=>e.currentTarget.style.background='var(--bg3)'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                        <td style={td}>{r.type}</td>
                        <td style={td}>{r.reason}</td>
                        <td style={td}><Badge variant={r.status==='pending'?'pending':'resolved'}>{r.status==='pending'?t('pending'):t('resolved')}</Badge></td>
                        <td style={td}>
                          {r.status==='pending' && <Btn size="sm" variant="success" onClick={() => action(() => reportService.resolve(r.id))}>{t('resolve')}</Btn>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
