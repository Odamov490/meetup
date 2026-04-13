import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { eventService, groupService } from '../firebase';
import { Spinner, EmptyState, Card, Btn, Modal, FormGroup, Input, Textarea, Select } from '../components/UI';

export default function Events() {
  const { t, currentUser, showToast } = useApp();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title:'', description:'', date:'', maxCapacity:'', address:'', groupId:'', isPaid:'false' });

  const load = async () => {
    setLoading(true);
    const [evs, gps] = await Promise.all([eventService.getAll(), groupService.getAll()]);
    setEvents(evs); setGroups(gps); setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = events.filter(ev => {
    const d = ev.date?.toDate ? ev.date.toDate() : ev.date ? new Date(ev.date) : null;
    const now = new Date();
    if (filter === 'upcoming') return d && d >= now;
    if (filter === 'today') return d && d.toDateString() === now.toDateString();
    if (filter === 'past') return d && d < now;
    if (filter === 'mine') return ev.attendees?.includes(currentUser?.uid) || ev.createdBy === currentUser?.uid;
    return true;
  });

  const handleAttend = async (e, ev) => {
    e.stopPropagation();
    if (!currentUser) { navigate('/auth'); return; }
    try {
      const isAtt = ev.attendees?.includes(currentUser.uid);
      if (isAtt) await eventService.unattend(ev.id, currentUser.uid);
      else await eventService.attend(ev.id, currentUser.uid);
      showToast(isAtt ? t('unattend') + ' ✓' : t('attend') + ' ✓', 'success');
      load();
    } catch(err) { showToast(err.message, 'error'); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await eventService.create({
        title: form.title, description: form.description,
        date: new Date(form.date),
        maxCapacity: form.maxCapacity ? parseInt(form.maxCapacity) : null,
        location: { address: form.address },
        groupId: form.groupId || null,
        isPaid: form.isPaid === 'true',
        createdBy: currentUser.uid,
        creatorName: currentUser.displayName,
      });
      showToast(t('createEvent') + ' ✓', 'success');
      setShowModal(false);
      setForm({ title:'', description:'', date:'', maxCapacity:'', address:'', groupId:'', isPaid:'false' });
      load();
    } catch(err) { showToast(err.message, 'error'); }
    finally { setSubmitting(false); }
  };

  const myGroups = groups.filter(g => g.ownerId === currentUser?.uid || g.members?.includes(currentUser?.uid));

  return (
    <div style={{ paddingTop:'var(--nav-h)' }}>
      <style>{`
        .filter-btn { padding:7px 16px; border-radius:20px; border:1.5px solid var(--border); background:var(--bg2); color:var(--text2); font-size:.85rem; font-weight:500; cursor:pointer; transition:all .2s; white-space:nowrap; }
        .filter-btn:hover,.filter-btn.active { background:var(--accent); border-color:var(--accent); color:white; }
      `}</style>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'40px 24px 0', display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
        <h1>{t('allEvents')}</h1>
        {currentUser && <Btn onClick={() => setShowModal(true)}>+ {t('createEvent')}</Btn>}
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'20px 24px', display:'flex', gap:8, overflowX:'auto', scrollbarWidth:'none' }}>
        {[
          { key:'upcoming', label:'⏳ ' + t('upcoming') },
          { key:'today', label:'📅 ' + t('today') },
          { key:'past', label:'✓ ' + t('past') },
          { key:'mine', label:'★ ' + t('myEvents') },
        ].map(f => (
          <button key={f.key} className={`filter-btn${filter === f.key ? ' active' : ''}`} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : filtered.length === 0 ? <EmptyState icon="◷" /> : (
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'8px 24px 60px', display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(310px,1fr))', gap:20 }}>
          {filtered.map(ev => {
            const isAtt = ev.attendees?.includes(currentUser?.uid);
            const d = ev.date?.toDate ? ev.date.toDate() : ev.date ? new Date(ev.date) : null;
            return (
              <Card key={ev.id} onClick={() => navigate(`/events/${ev.id}`)}>
                <div style={{ height:160, background:'linear-gradient(135deg,var(--accent-bg),var(--bg3))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2.5rem', position:'relative' }}>
                  ◷
                  <span style={{ position:'absolute', top:12, left:12, background: ev.isPaid ? 'var(--accent)' : 'var(--green)', color:'white', padding:'3px 10px', borderRadius:12, fontSize:'0.72rem', fontWeight:600 }}>
                    {ev.isPaid ? t('paid') : t('free')}
                  </span>
                </div>
                <div style={{ padding:18, flex:1, display:'flex', flexDirection:'column', gap:8 }}>
                  <div style={{ fontFamily:'var(--font-head)', fontWeight:600 }}>{ev.title}</div>
                  {ev.description && <div style={{ fontSize:'0.85rem', color:'var(--text2)', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{ev.description}</div>}
                  <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginTop:4 }}>
                    {d && <span style={{ fontSize:'0.8rem', color:'var(--text3)' }}>📅 {d.toLocaleDateString()}</span>}
                    {ev.location?.address && <span style={{ fontSize:'0.8rem', color:'var(--text3)' }}>📍 {ev.location.address}</span>}
                    <span style={{ fontSize:'0.8rem', color:'var(--text3)' }}>👥 {ev.attendeeCount || 0}{ev.maxCapacity ? '/'+ev.maxCapacity : ''}</span>
                  </div>
                </div>
                <div style={{ padding:'12px 18px', borderTop:'1px solid var(--border)', display:'flex', gap:8, justifyContent:'space-between' }}>
                  <Btn size="sm" variant="outline">{t('viewGroup')} →</Btn>
                  {currentUser && (
                    <Btn size="sm" variant={isAtt ? 'outline' : 'primary'} onClick={e => handleAttend(e, ev)}>
                      {isAtt ? t('unattend') : t('attend')}
                    </Btn>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {showModal && (
        <Modal title={t('createEvent')} onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate}>
            <FormGroup label={t('eventTitle')}>
              <Input required value={form.title} onChange={e => setForm(p => ({...p, title:e.target.value}))} />
            </FormGroup>
            <FormGroup label={t('eventDesc')}>
              <Textarea value={form.description} onChange={e => setForm(p => ({...p, description:e.target.value}))} />
            </FormGroup>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <FormGroup label={t('eventDate')}>
                <Input required type="datetime-local" value={form.date} onChange={e => setForm(p => ({...p, date:e.target.value}))} />
              </FormGroup>
              <FormGroup label={t('eventCapacity')}>
                <Input type="number" min="1" placeholder="100" value={form.maxCapacity} onChange={e => setForm(p => ({...p, maxCapacity:e.target.value}))} />
              </FormGroup>
            </div>
            <FormGroup label={t('eventLocation')}>
              <Input placeholder="Manzil..." value={form.address} onChange={e => setForm(p => ({...p, address:e.target.value}))} />
            </FormGroup>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <FormGroup label="Guruh">
                <Select value={form.groupId} onChange={e => setForm(p => ({...p, groupId:e.target.value}))}>
                  <option value="">Guruhsiz</option>
                  {myGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </Select>
              </FormGroup>
              <FormGroup label="Narx">
                <Select value={form.isPaid} onChange={e => setForm(p => ({...p, isPaid:e.target.value}))}>
                  <option value="false">{t('free')}</option>
                  <option value="true">{t('paid')}</option>
                </Select>
              </FormGroup>
            </div>
            <Btn type="submit" full disabled={submitting}>{submitting ? t('loading') : '+ ' + t('createEvent')}</Btn>
          </form>
        </Modal>
      )}
    </div>
  );
}
