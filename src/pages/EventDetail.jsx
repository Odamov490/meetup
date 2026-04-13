import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { eventService, groupService, reportService } from '../firebase';
import { Spinner, Btn, Badge } from '../components/UI';

export default function EventDetail() {
  const { id } = useParams();
  const { t, currentUser, showToast } = useApp();
  const navigate = useNavigate();
  const [ev, setEv] = useState(null);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const data = await eventService.get(id);
    if (!data) { navigate('/events'); return; }
    setEv(data);
    if (data.groupId) { const g = await groupService.get(data.groupId); setGroup(g); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const handleAttend = async () => {
    if (!currentUser) { navigate('/auth'); return; }
    try {
      const isAtt = ev.attendees?.includes(currentUser.uid);
      if (isAtt) await eventService.unattend(id, currentUser.uid);
      else await eventService.attend(id, currentUser.uid);
      showToast(isAtt ? t('unattend') + ' ✓' : t('attend') + ' ✓', 'success');
      load();
    } catch(err) { showToast(err.message, 'error'); }
  };

  const handleDelete = async () => {
    if (!confirm(t('confirmDelete'))) return;
    await eventService.delete(id);
    showToast(t('delete') + ' ✓', 'success');
    navigate('/events');
  };

  const handleReport = async () => {
    const reason = prompt(t('report') + ':');
    if (!reason) return;
    await reportService.create({ type:'event', targetId:id, reason, reportedBy:currentUser.uid });
    showToast(t('report') + ' ✓', 'success');
  };

  if (loading) return <div style={{ paddingTop:'var(--nav-h)' }}><Spinner /></div>;
  if (!ev) return null;

  const isAtt = ev.attendees?.includes(currentUser?.uid);
  const isOwner = ev.createdBy === currentUser?.uid;
  const d = ev.date?.toDate ? ev.date.toDate() : ev.date ? new Date(ev.date) : null;
  const dateStr = d ? d.toLocaleDateString(undefined, { weekday:'long', year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' }) : '';

  return (
    <div style={{ paddingTop:'var(--nav-h)' }}>
      <div style={{ maxWidth:900, margin:'0 auto', padding:'40px 24px' }}>
        <button onClick={() => navigate('/events')} style={{ background:'none', border:'none', color:'var(--text2)', fontSize:'0.9rem', cursor:'pointer', display:'flex', alignItems:'center', gap:6, marginBottom:16 }}>
          ← {t('backToEvents')}
        </button>

        <div style={{ height:260, borderRadius:'var(--radius)', background:'linear-gradient(135deg,var(--accent-bg),var(--bg3))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'5rem', marginBottom:32, overflow:'hidden', position:'relative' }}>
          {ev.coverImage && <img src={ev.coverImage} alt={ev.title} style={{ width:'100%', height:'100%', objectFit:'cover', position:'absolute', inset:0 }} />}
          <span style={{ zIndex:1, position:'relative' }}>◷</span>
        </div>

        <div style={{ display:'flex', gap:8, marginBottom:12, flexWrap:'wrap' }}>
          <Badge variant={ev.isPaid ? 'paid' : 'free'}>{ev.isPaid ? t('paid') : t('free')}</Badge>
          {group && <Badge>{group.name}</Badge>}
        </div>

        <h1 style={{ marginBottom:12 }}>{ev.title}</h1>
        <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:32 }}>
          {dateStr && <span style={{ fontSize:'0.9rem', color:'var(--text2)' }}>📅 {dateStr}</span>}
          {ev.location?.address && <span style={{ fontSize:'0.9rem', color:'var(--text2)' }}>📍 {ev.location.address}</span>}
          <span style={{ fontSize:'0.9rem', color:'var(--text2)' }}>👥 {ev.attendeeCount || 0}{ev.maxCapacity ? '/'+ev.maxCapacity : ''} {t('attendees')}</span>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:32 }}>
          <div>
            {ev.description && <p style={{ lineHeight:1.8, marginBottom:24 }}>{ev.description}</p>}
            {ev.location?.address && (
              <div style={{ padding:20, background:'var(--bg3)', borderRadius:'var(--radius)' }}>
                <h4 style={{ marginBottom:8 }}>📍 {t('eventLocation')}</h4>
                <p style={{ fontSize:'0.9rem', marginBottom:12 }}>{ev.location.address}</p>
                <a href={`https://maps.google.com?q=${encodeURIComponent(ev.location.address)}`} target="_blank" rel="noreferrer" style={{ color:'var(--accent)', fontSize:'0.875rem' }}>
                  → Google Maps'da ko'rish
                </a>
              </div>
            )}
          </div>

          <div>
            <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:20, marginBottom:16 }}>
              <h4 style={{ marginBottom:8, fontSize:'0.95rem' }}>Qatnashish</h4>
              <p style={{ fontSize:'0.85rem', marginBottom:16 }}>{ev.attendeeCount || 0} kishi{ev.maxCapacity ? ` / ${ev.maxCapacity} max` : ''}</p>
              {currentUser ? (
                isOwner ? (
                  <>
                    <p style={{ color:'var(--green)', fontSize:'0.875rem', marginBottom:12 }}>✓ {t('ownerBadge')}</p>
                    <Btn full variant="danger" size="sm" onClick={handleDelete}>{t('delete')}</Btn>
                  </>
                ) : (
                  <Btn full variant={isAtt ? 'outline' : 'primary'} onClick={handleAttend}>
                    {isAtt ? '✓ ' + t('unattend') : '+ ' + t('attend')}
                  </Btn>
                )
              ) : (
                <Btn full onClick={() => navigate('/auth')}>{t('login')}</Btn>
              )}
            </div>

            {currentUser && !isOwner && (
              <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:20, marginBottom:16 }}>
                <Btn full variant="outline" size="sm" onClick={handleReport}>⚑ {t('report')}</Btn>
              </div>
            )}

            {group && (
              <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:20 }}>
                <h4 style={{ marginBottom:8, fontSize:'0.95rem' }}>◈ {t('groups')}</h4>
                <p style={{ fontSize:'0.875rem', marginBottom:12 }}>{group.name}</p>
                <Btn full variant="outline" size="sm" onClick={() => navigate(`/groups/${group.id}`)}>
                  Ko'rish →
                </Btn>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
