import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { groupService, storageService } from '../firebase';
import { Spinner, EmptyState, Card, Btn, Modal, FormGroup, Input, Textarea, Select, Badge } from '../components/UI';

const CAT = { tech:'💻', sport:'⚽', art:'🎨', music:'🎵', business:'💼', education:'📚', food:'🍜', travel:'✈️' };
const CITIES = ['Toshkent','Samarqand','Buxoro','Namangan','Andijon',"Farg'ona",'Qarshi','Nukus','Urgench','Termiz'];

export default function Groups() {
  const { t, currentUser, showToast } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState(searchParams.get('cat') || '');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name:'', description:'', category:'', city:'', image:null });

  const load = async (cat = filterCat) => {
    setLoading(true);
    const data = await groupService.getAll(cat || null);
    setGroups(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filterCat]);

  const handleJoin = async (e, g) => {
    e.stopPropagation();
    if (!currentUser) { navigate('/auth'); return; }
    try {
      const isMember = g.members?.includes(currentUser.uid);
      if (isMember) await groupService.leave(g.id, currentUser.uid);
      else await groupService.join(g.id, currentUser.uid);
      showToast(isMember ? t('leave') + ' ✓' : t('join') + ' ✓', 'success');
      load();
    } catch(err) { showToast(err.message, 'error'); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      let coverImage = '';
      if (form.image) coverImage = await storageService.upload(`groups/${Date.now()}_${form.image.name}`, form.image);
      await groupService.create({ name:form.name, description:form.description, category:form.category, city:form.city, ownerId:currentUser.uid, coverImage });
      showToast(t('createNewGroup') + ' ✓', 'success');
      setShowModal(false);
      setForm({ name:'', description:'', category:'', city:'', image:null });
      load();
    } catch(err) { showToast(err.message, 'error'); }
    finally { setSubmitting(false); }
  };

  return (
    <div style={{ paddingTop:'var(--nav-h)' }}>
      <style>{`
        .filter-btn { padding:7px 16px; border-radius:20px; border:1.5px solid var(--border); background:var(--bg2); color:var(--text2); font-size:.85rem; font-weight:500; cursor:pointer; transition:all .2s; white-space:nowrap; }
        .filter-btn:hover,.filter-btn.active { background:var(--accent); border-color:var(--accent); color:white; }
        .card-cover { height:160px; background:linear-gradient(135deg,var(--accent-bg),var(--bg3)); display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden; }
        .card-cover img { width:100%; height:100%; object-fit:cover; position:absolute; inset:0; }
      `}</style>

      {/* Header */}
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'40px 24px 0', display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
        <h1>{t('allGroups')}</h1>
        {currentUser && <Btn onClick={() => setShowModal(true)}>+ {t('createNewGroup')}</Btn>}
      </div>

      {/* Filters */}
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'20px 24px', display:'flex', gap:8, overflowX:'auto', scrollbarWidth:'none' }}>
        <button className={`filter-btn${!filterCat ? ' active' : ''}`} onClick={() => setFilterCat('')}>
          {t('lang') === 'uz' ? 'Barchasi' : 'All'}
        </button>
        {Object.entries(CAT).map(([k, e]) => (
          <button key={k} className={`filter-btn${filterCat === k ? ' active' : ''}`} onClick={() => setFilterCat(k)}>
            {e} {t(k)}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? <Spinner /> : groups.length === 0 ? <EmptyState icon="◈" /> : (
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'8px 24px 60px', display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(310px,1fr))', gap:20 }}>
          {groups.map(g => {
            const isMember = g.members?.includes(currentUser?.uid);
            const isOwner = g.ownerId === currentUser?.uid;
            return (
              <Card key={g.id} onClick={() => navigate(`/groups/${g.id}`)}>
                <div className="card-cover">
                  {g.coverImage && <img src={g.coverImage} alt={g.name} />}
                  <span style={{ zIndex:1, position:'relative', fontSize:'2.5rem' }}>{CAT[g.category] || '◈'}</span>
                  <span style={{ position:'absolute', top:12, left:12, background:'var(--accent)', color:'white', padding:'3px 10px', borderRadius:12, fontSize:'0.72rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px' }}>
                    {t(g.category)}
                  </span>
                </div>
                <div style={{ padding:18, flex:1, display:'flex', flexDirection:'column', gap:8 }}>
                  <div style={{ fontFamily:'var(--font-head)', fontWeight:600 }}>{g.name}</div>
                  {g.description && <div style={{ fontSize:'0.85rem', color:'var(--text2)', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{g.description}</div>}
                  <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginTop:4 }}>
                    <span style={{ fontSize:'0.8rem', color:'var(--text3)' }}>👥 {g.memberCount || 0} {t('members')}</span>
                    {g.city && <span style={{ fontSize:'0.8rem', color:'var(--text3)' }}>📍 {g.city}</span>}
                  </div>
                </div>
                <div style={{ padding:'12px 18px', borderTop:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
                  <Btn size="sm" variant="outline">{t('viewGroup')} →</Btn>
                  {currentUser && !isOwner && (
                    <Btn size="sm" variant={isMember ? 'outline' : 'primary'} onClick={e => handleJoin(e, g)}>
                      {isMember ? t('leave') : t('join')}
                    </Btn>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <Modal title={t('createNewGroup')} onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate}>
            <FormGroup label={t('groupName')}>
              <Input required value={form.name} onChange={e => setForm(p => ({...p, name:e.target.value}))} placeholder={t('groupName') + '...'} />
            </FormGroup>
            <FormGroup label={t('groupDesc')}>
              <Textarea value={form.description} onChange={e => setForm(p => ({...p, description:e.target.value}))} />
            </FormGroup>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <FormGroup label={t('groupCategory')}>
                <Select required value={form.category} onChange={e => setForm(p => ({...p, category:e.target.value}))}>
                  <option value="">Tanlang...</option>
                  {Object.entries(CAT).map(([k, e]) => <option key={k} value={k}>{e} {t(k)}</option>)}
                </Select>
              </FormGroup>
              <FormGroup label={t('groupCity')}>
                <Select value={form.city} onChange={e => setForm(p => ({...p, city:e.target.value}))}>
                  <option value="">Tanlang...</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
              </FormGroup>
            </div>
            <FormGroup label="Rasm (ixtiyoriy)">
              <Input type="file" accept="image/*" onChange={e => setForm(p => ({...p, image:e.target.files[0]}))} />
            </FormGroup>
            <Btn type="submit" full disabled={submitting}>{submitting ? t('loading') : '+ ' + t('createNewGroup')}</Btn>
          </form>
        </Modal>
      )}
    </div>
  );
}
