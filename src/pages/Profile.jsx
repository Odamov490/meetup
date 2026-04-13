import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { authService, userService, groupService, eventService, storageService } from '../firebase';
import { Spinner, Btn, Avatar, Card, FormGroup, Input, Textarea, Badge } from '../components/UI';

export default function Profile() {
  const { currentUser, userProfile, refreshProfile, t, showToast } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState('info');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ displayName:'', city:'', bio:'' });
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [savedEvents, setSavedEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentUser) { navigate('/auth'); return; }
    if (userProfile) setForm({ displayName: userProfile.displayName || '', city: userProfile.city || '', bio: userProfile.bio || '' });
  }, [userProfile]);

  useEffect(() => {
    if (tab === 'groups') loadGroups();
    if (tab === 'events') loadEvents();
  }, [tab]);

  const loadGroups = async () => {
    setLoading(true);
    const ids = userProfile?.joinedGroups || [];
    const data = await Promise.all(ids.map(id => groupService.get(id)));
    setJoinedGroups(data.filter(Boolean));
    setLoading(false);
  };

  const loadEvents = async () => {
    setLoading(true);
    const ids = userProfile?.savedEvents || [];
    const data = await Promise.all(ids.map(id => eventService.get(id)));
    setSavedEvents(data.filter(Boolean));
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userService.updateUser(currentUser.uid, { displayName: form.displayName, city: form.city, bio: form.bio });
      await refreshProfile();
      showToast(t('save') + ' ✓', 'success');
      setEditing(false);
    } catch(err) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const url = await storageService.upload(`avatars/${currentUser.uid}`, file);
      await userService.updateUser(currentUser.uid, { photoURL: url });
      await refreshProfile();
      showToast('Rasm yangilandi!', 'success');
    } catch(err) { showToast(err.message, 'error'); }
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/');
  };

  if (!userProfile) return <div style={{ paddingTop:'var(--nav-h)' }}><Spinner /></div>;

  const tabs = [
    { key:'info', label:'👤 ' + t('editProfile') },
    { key:'groups', label:'◈ ' + t('joinedGroups') },
    { key:'events', label:'◷ ' + t('savedEvents') },
  ];

  return (
    <div style={{ paddingTop:'var(--nav-h)' }}>
      <div style={{ maxWidth:900, margin:'0 auto', padding:'40px 24px' }}>
        {/* Header */}
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:32, display:'flex', alignItems:'center', gap:24, marginBottom:32, flexWrap:'wrap' }}>
          <div style={{ position:'relative' }}>
            <Avatar user={userProfile} size={90} />
            <label style={{ position:'absolute', bottom:0, right:0, width:28, height:28, background:'var(--accent)', color:'white', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:'0.75rem' }}>
              ✎
              <input type="file" accept="image/*" onChange={handleAvatar} style={{ display:'none' }} />
            </label>
          </div>
          <div style={{ flex:1 }}>
            <h2 style={{ marginBottom:4 }}>{userProfile.displayName || 'User'}</h2>
            <p style={{ fontSize:'0.9rem', marginBottom:4 }}>{userProfile.email}</p>
            {userProfile.city && <p style={{ fontSize:'0.875rem', marginTop:4 }}>📍 {userProfile.city}</p>}
            {userProfile.bio && <p style={{ fontSize:'0.875rem', fontStyle:'italic', marginTop:4 }}>"{userProfile.bio}"</p>}
            {userProfile.role === 'admin' && <Badge variant="admin" style={{ marginTop:8, display:'inline-block' }}>⚙ Admin</Badge>}
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <Btn variant="outline" size="sm" onClick={() => setEditing(p => !p)}>
              {editing ? t('cancel') : '✎ ' + t('editProfile')}
            </Btn>
            <Btn variant="outline" size="sm" onClick={handleLogout}>← {t('logout')}</Btn>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:4, marginBottom:24, borderBottom:'1px solid var(--border)' }}>
          {tabs.map(tb => (
            <button key={tb.key} onClick={() => setTab(tb.key)} style={{
              padding:'10px 20px', background:'none', border:'none',
              borderBottom:`2px solid ${tab === tb.key ? 'var(--accent)' : 'transparent'}`,
              color: tab === tb.key ? 'var(--accent)' : 'var(--text2)',
              fontWeight:500, fontSize:'0.9rem', cursor:'pointer', marginBottom:-1,
              fontFamily:'var(--font-body)', transition:'all .2s',
            }}>
              {tb.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'info' && (
          editing ? (
            <form onSubmit={handleSave} style={{ maxWidth:500 }}>
              <FormGroup label={t('displayName')}>
                <Input required value={form.displayName} onChange={e => setForm(p=>({...p,displayName:e.target.value}))} />
              </FormGroup>
              <FormGroup label={t('city')}>
                <Input value={form.city} onChange={e => setForm(p=>({...p,city:e.target.value}))} placeholder="Toshkent..." />
              </FormGroup>
              <FormGroup label={t('bio')}>
                <Textarea value={form.bio} onChange={e => setForm(p=>({...p,bio:e.target.value}))} placeholder="O'zing haqingda..." />
              </FormGroup>
              <Btn type="submit" disabled={saving}>{saving ? t('loading') : '💾 ' + t('save')}</Btn>
            </form>
          ) : (
            <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:24, maxWidth:500, display:'grid', gap:16 }}>
              {[
                [t('displayName'), userProfile.displayName],
                [t('email'), userProfile.email],
                [t('city'), userProfile.city || '—'],
                [t('bio'), userProfile.bio || '—'],
              ].map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontSize:'0.8rem', color:'var(--text3)', marginBottom:2 }}>{label}</div>
                  <div style={{ fontWeight:500 }}>{val}</div>
                </div>
              ))}
            </div>
          )
        )}

        {tab === 'groups' && (
          loading ? <Spinner /> : joinedGroups.length === 0 ? <div style={{ color:'var(--text3)', padding:24 }}>{t('noData')}</div> : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
              {joinedGroups.map(g => (
                <Card key={g.id} onClick={() => navigate(`/groups/${g.id}`)}>
                  <div style={{ padding:16 }}>
                    <div style={{ fontFamily:'var(--font-head)', fontWeight:600, marginBottom:6 }}>{g.name}</div>
                    <div style={{ display:'flex', gap:10 }}>
                      <span style={{ fontSize:'0.8rem', color:'var(--text3)' }}>👥 {g.memberCount} {t('members')}</span>
                      {g.city && <span style={{ fontSize:'0.8rem', color:'var(--text3)' }}>📍 {g.city}</span>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )
        )}

        {tab === 'events' && (
          loading ? <Spinner /> : savedEvents.length === 0 ? <div style={{ color:'var(--text3)', padding:24 }}>{t('noData')}</div> : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
              {savedEvents.map(ev => (
                <Card key={ev.id} onClick={() => navigate(`/events/${ev.id}`)}>
                  <div style={{ padding:16 }}>
                    <div style={{ fontFamily:'var(--font-head)', fontWeight:600, marginBottom:6 }}>{ev.title}</div>
                    <div style={{ display:'flex', gap:10 }}>
                      {ev.location?.address && <span style={{ fontSize:'0.8rem', color:'var(--text3)' }}>📍 {ev.location.address}</span>}
                      <span style={{ fontSize:'0.8rem', color:'var(--text3)' }}>👥 {ev.attendeeCount || 0}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
