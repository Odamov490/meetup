import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { messageService, groupService, userService } from '../firebase';
import { Avatar, Btn } from '../components/UI';

export default function Chat() {
  const { groupId } = useParams();
  const { t, currentUser } = useApp();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState({});
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!currentUser) { navigate('/auth'); return; }
    groupService.get(groupId).then(g => { if (!g) navigate('/groups'); else setGroup(g); });

    const unsub = messageService.subscribe(groupId, async (msgs) => {
      setMessages(msgs);
      // Load user profiles for new senders
      const uids = [...new Set(msgs.map(m => m.senderId).filter(Boolean))];
      const newUids = uids.filter(uid => !users[uid]);
      if (newUids.length) {
        const loaded = await Promise.all(newUids.map(uid => userService.getUser(uid)));
        setUsers(prev => {
          const upd = { ...prev };
          loaded.forEach((u, i) => { if (u) upd[newUids[i]] = u; });
          return upd;
        });
      }
    });
    return unsub;
  }, [groupId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    await messageService.send(groupId, {
      text, senderId: currentUser.uid,
      senderName: currentUser.displayName || 'User',
    });
  };

  const escHtml = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  return (
    <div style={{ paddingTop:'var(--nav-h)', height:'100vh', display:'flex', flexDirection:'column', maxWidth:900, margin:'0 auto', padding:'var(--nav-h) 24px 0' }}>
      <style>{`.msg-bubble-mine { background:var(--accent); color:white; border-radius:14px 14px 4px 14px; } .msg-bubble-other { background:var(--bg3); color:var(--text); border-radius:14px 14px 14px 4px; }`}</style>

      {/* Header */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius) var(--radius) 0 0', padding:'14px 20px', display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={() => navigate(`/groups/${groupId}`)} style={{ background:'none', border:'none', color:'var(--text2)', cursor:'pointer', fontSize:'1.1rem' }}>←</button>
        <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--accent-bg)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem' }}>💬</div>
        <div>
          <div style={{ fontWeight:600, fontSize:'0.95rem' }}>{group?.name || t('loading')}</div>
          <div style={{ fontSize:'0.75rem', color:'var(--text3)' }}>{t('groupChat')}</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', background:'var(--surface)', borderLeft:'1px solid var(--border)', borderRight:'1px solid var(--border)', padding:16, display:'flex', flexDirection:'column', gap:10 }}>
        {messages.length === 0 && (
          <div style={{ textAlign:'center', color:'var(--text3)', padding:40, fontSize:'0.9rem' }}>{t('firstMessage')}</div>
        )}
        {messages.map(msg => {
          const isMe = msg.senderId === currentUser?.uid;
          const sender = users[msg.senderId];
          const time = msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : '';
          return (
            <div key={msg.id} style={{ display:'flex', gap:10, alignItems:'flex-end', flexDirection: isMe ? 'row-reverse' : 'row', maxWidth:'75%', alignSelf: isMe ? 'flex-end' : 'flex-start' }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--accent-bg)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', fontWeight:600, color:'var(--accent)', flexShrink:0, overflow:'hidden' }}>
                {sender?.photoURL ? <img src={sender.photoURL} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : (sender?.displayName || msg.senderName || '?')[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize:'0.75rem', color:'var(--text3)', marginBottom:3, textAlign: isMe ? 'right' : 'left' }}>
                  {!isMe && (sender?.displayName || msg.senderName || '')} {time}
                </div>
                <div className={isMe ? 'msg-bubble-mine' : 'msg-bubble-other'} style={{ padding:'10px 14px', fontSize:'0.875rem', lineHeight:1.5 }} dangerouslySetInnerHTML={{ __html: escHtml(msg.text) }} />
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'0 0 var(--radius) var(--radius)', padding:'12px 16px', display:'flex', gap:10, alignItems:'center' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
          placeholder={t('sendMessage')}
          maxLength={500}
          style={{ flex:1, padding:'10px 14px', border:'1.5px solid var(--border)', borderRadius:20, background:'var(--bg)', color:'var(--text)', fontSize:'0.9rem', outline:'none', fontFamily:'var(--font-body)', transition:'border-color .2s' }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        <Btn onClick={send} disabled={!input.trim()}>➤</Btn>
      </div>
    </div>
  );
}
