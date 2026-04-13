import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { groupService, eventService, userService } from '../firebase';
import { Spinner, Btn, Avatar, Card } from '../components/UI';

const CAT = { tech:'💻', sport:'⚽', art:'🎨', music:'🎵', business:'💼', education:'📚', food:'🍜', travel:'✈️' };

export default function GroupDetail() {
  const { id } = useParams();
  const { t, currentUser, showToast } = useApp();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [g, evs] = await Promise.all([groupService.get(id), eventService.getByGroup(id)]);
    if (!g) { navigate('/groups'); return; }
    setGroup(g); setEvents(evs);
    const uids = (g.members || []).slice(0, 8);
    const users = await Promise.all(uids.map(uid => userService.getUser(uid)));
    setMembers(users.filter(Boolean));
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const handleJoin = async () => {
    if (!currentUser) { navigate('/auth'); return; }
    try {
      const isMember = group.members?.includes(currentUser.uid);
      if (isMember) await groupService.leave(id, currentUser.uid);
      else await groupService.join(id, currentUser.uid);
      showToast(isMember ? t('leave') + ' ✓' : t('join') + ' ✓', 'success');
      load();
    } catch(err) { showToast(err.message, 'error'); }
  };

  const handleDelete = async () => {
    if (!confirm(t('confirmDelete'))) return;
    await groupService.delete(id);
    showToast(t('delete') + ' ✓', 'success');
    navigate('/groups');
  };

  if (loading) return <div style={{ paddingTop:'var(--nav-h)' }}><Spinner /></div>;
  if (!group) return null;

  const isMember = group.members?.includes(currentUser?.uid);
  const isOwner = group.ownerId === currentUser?.uid;

  return (
    <div style={{ paddingTop:'var(--nav-h)' }}>
      <div style={{ maxWidth:900, margin:'0 auto', padding:'40px 24px' }}>
        <button onClick={() => navigate('/groups')} style={{ background:'none', border:'none', color:'var(--text2)', fontSize:'0.9rem', cursor:'pointer', display:'flex', alignItems:'center', gap:6, marginBottom:16, transition:'color .2s' }}>
          ← {t('backToGroups')}
        </button>

        {/* Cover */}
        <div style={{ height:260, borderRadius:'var(--radius)', background:'linear-gradient(135deg,var(--accent-bg),var(--bg3))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'5rem', marginBottom:32, overflow:'hidden', position:'relative' }}>
          {group.coverImage && <img src={group.coverImage} alt={group.name} style={{ width:'100%', height:'100%', objectFit:'cover', position:'absolute', inset:0 }} />}
          <span style={{ zIndex:1, position:'relative' }}>{CAT[group.category] || '◈'}</span>
        </div>

        {/* Header */}
        <h1 style={{ marginBottom:12 }}>{group.name}</h1>
        <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:32 }}>
          <span style={{ fontSize:'0.9rem', color:'var(--text2)' }}>◈ {t(group.category)}</span>
          {group.city && <span style={{ fontSize:'0.9rem', color:'var(--text2)' }}>📍 {group.city}</span>}
          <span style={{ fontSize:'0.9rem', color:'var(--text2)' }}>👥 {group.memberCount || 0} {t('members')}</span>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:32 }}>
          {/* Left */}
          <div>
            {group.description && <p style={{ lineHeight:1.8, marginBottom:32 }}>{group.description}</p>}

            <h3 style={{ marginBottom:16 }}>{t('events')}</h3>
            {events.length === 0 ? <p style={{ color:'var(--text3)', fontSize:'0.9rem' }}>{t('noData')}</p> : (
              <div style={{ display:'grid', gap:12 }}>
                {events.map(ev => {
                  const d = ev.date?.toDate ? ev.date.toDate() : ev.date ? new Date(ev.date) : null;
                  return (
                    <Card key={ev.id} onClick={() => navigate(`/events/${ev.id}`)}>
                      <div style={{ padding:16 }}>
                        <div style={{ fontFamily:'var(--font-head)', fontWeight:600, marginBottom:6 }}>{ev.title}</div>
                        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                          {d && <span style={{ fontSize:'0.8rem', color:'var(--text3)' }}>📅 {d.toLocaleDateString()}</span>}
                          <span style={{ fontSize:'0.8rem', color:'var(--text3)' }}>👥 {ev.attendeeCount || 0} {t('attendees')}</span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:20, marginBottom:16 }}>
              {currentUser ? (
                isOwner ? (
                  <p style={{ fontSize:'0.875rem', color:'var(--green)', marginBottom:12 }}>✓ {t('ownerBadge')}</p>
                ) : (
                  <Btn full variant={isMember ? 'outline' : 'primary'} onClick={handleJoin} style={{ marginBottom:8 }}>
                    {isMember ? '← ' + t('leave') : '+ ' + t('join')}
                  </Btn>
                )
              ) : (
                <Btn full onClick={() => navigate('/auth')}>{t('login')}</Btn>
              )}
              {currentUser && (
                <Btn full variant="outline" onClick={() => navigate(`/chat/${id}`)} style={{ marginTop:8 }}>
                  💬 {t('groupChat')}
                </Btn>
              )}
            </div>

            {isOwner && (
              <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:20, marginBottom:16 }}>
                <h4 style={{ marginBottom:12, fontSize:'0.95rem' }}>Boshqaruv</h4>
                <Btn full variant="danger" size="sm" onClick={handleDelete}>{t('delete')}</Btn>
              </div>
            )}

            <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:20 }}>
              <h4 style={{ marginBottom:12, fontSize:'0.95rem' }}>{t('members')} ({group.memberCount || 0})</h4>
              {members.map(u => (
                <div key={u.id} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                  <Avatar user={u} size={28} />
                  <span style={{ fontSize:'0.875rem' }}>{u.displayName || u.email}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
