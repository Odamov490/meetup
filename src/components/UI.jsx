import { useApp } from '../contexts/AppContext';

export function Spinner() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'60px' }}>
      <div style={{
        width:36, height:36,
        border:'3px solid var(--border)',
        borderTopColor:'var(--accent)',
        borderRadius:'50%',
        animation:'spin 0.7s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function EmptyState({ icon = '◈', title }) {
  const { t } = useApp();
  return (
    <div style={{ textAlign:'center', padding:'60px 24px', color:'var(--text3)' }}>
      <div style={{ fontSize:'3rem', marginBottom:16 }}>{icon}</div>
      <h3 style={{ fontSize:'1.1rem', color:'var(--text2)', marginBottom:8 }}>{title || t('noData')}</h3>
    </div>
  );
}

export function Avatar({ user, size = 36 }) {
  const initial = (user?.displayName || user?.email || '?')[0].toUpperCase();
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%',
      background:'linear-gradient(135deg, var(--accent), var(--accent2))',
      display:'flex', alignItems:'center', justifyContent:'center',
      color:'white', fontWeight:700, fontSize:size * 0.38,
      fontFamily:'var(--font-head)', overflow:'hidden', flexShrink:0,
    }}>
      {user?.photoURL
        ? <img src={user.photoURL} alt={user.displayName} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        : initial}
    </div>
  );
}

export function Badge({ children, variant = 'default' }) {
  const colors = {
    default: 'background:var(--bg3);color:var(--text2)',
    admin: 'background:var(--accent-bg);color:var(--accent)',
    pending: 'background:rgba(232,160,16,0.15);color:var(--amber)',
    resolved: 'background:rgba(26,158,92,0.15);color:var(--green)',
    free: 'background:rgba(26,158,92,0.15);color:var(--green)',
    paid: 'background:var(--accent-bg);color:var(--accent)',
  };
  return (
    <span style={{
      display:'inline-block', padding:'3px 10px', borderRadius:12,
      fontSize:'0.75rem', fontWeight:600,
      ...Object.fromEntries((colors[variant]||colors.default).split(';').map(s => s.split(':').map(x=>x.trim()))),
    }}>
      {children}
    </span>
  );
}

export function Modal({ title, onClose, children }) {
  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position:'fixed', inset:0, zIndex:200,
        background:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)',
        display:'flex', alignItems:'center', justifyContent:'center', padding:16,
        animation:'fadeIn 0.15s ease',
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.95) } to { opacity:1; transform:scale(1) } }
      `}</style>
      <div style={{
        background:'var(--bg2)', borderRadius:'var(--radius)',
        padding:32, width:'100%', maxWidth:500, maxHeight:'90vh', overflowY:'auto',
        boxShadow:'var(--shadow2)', animation:'scaleIn 0.2s ease',
        border:'1px solid var(--border)',
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <h2 style={{ fontSize:'1.3rem' }}>{title}</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:'1.4rem', color:'var(--text3)', lineHeight:1 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function FormGroup({ label, children }) {
  return (
    <div style={{ marginBottom:18 }}>
      {label && <label style={{ display:'block', fontSize:'0.85rem', fontWeight:500, marginBottom:6, color:'var(--text2)' }}>{label}</label>}
      {children}
    </div>
  );
}

export function Input({ ...props }) {
  return (
    <input {...props} style={{
      width:'100%', padding:'11px 14px',
      border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)',
      background:'var(--bg)', color:'var(--text)',
      fontSize:'0.9rem', outline:'none', transition:'border-color var(--tr)',
      ...props.style,
    }}
    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
    onBlur={e => e.target.style.borderColor = 'var(--border)'}
    />
  );
}

export function Textarea({ ...props }) {
  return (
    <textarea {...props} style={{
      width:'100%', padding:'11px 14px',
      border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)',
      background:'var(--bg)', color:'var(--text)',
      fontSize:'0.9rem', outline:'none', resize:'vertical', minHeight:90,
      transition:'border-color var(--tr)', ...props.style,
    }}
    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
    onBlur={e => e.target.style.borderColor = 'var(--border)'}
    />
  );
}

export function Select({ children, ...props }) {
  return (
    <select {...props} style={{
      width:'100%', padding:'11px 14px',
      border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)',
      background:'var(--bg)', color:'var(--text)',
      fontSize:'0.9rem', outline:'none', cursor:'pointer',
      transition:'border-color var(--tr)', ...props.style,
    }}>
      {children}
    </select>
  );
}

export function Btn({ children, variant = 'primary', size = 'md', full, style: s, ...props }) {
  const base = {
    display:'inline-flex', alignItems:'center', justifyContent:'center', gap:6,
    border:'none', borderRadius:'var(--radius-sm)',
    fontWeight:500, fontFamily:'var(--font-body)', cursor:'pointer',
    transition:'all var(--tr)',
    padding: size === 'sm' ? '6px 14px' : '10px 20px',
    fontSize: size === 'sm' ? '0.8rem' : '0.9rem',
    width: full ? '100%' : 'auto',
  };
  const variants = {
    primary: { background:'var(--accent)', color:'white' },
    outline: { background:'transparent', border:'1.5px solid var(--border)', color:'var(--text)' },
    danger: { background:'var(--red)', color:'white' },
    success: { background:'var(--green)', color:'white' },
    ghost: { background:'none', border:'none', color:'var(--text2)' },
  };
  return <button {...props} style={{ ...base, ...variants[variant], ...s }}>{children}</button>;
}

export function Card({ children, onClick, style: s }) {
  return (
    <div onClick={onClick} style={{
      background:'var(--surface)', border:'1px solid var(--border)',
      borderRadius:'var(--radius)', overflow:'hidden',
      transition:'all var(--tr)', boxShadow:'var(--shadow)',
      display:'flex', flexDirection:'column',
      cursor: onClick ? 'pointer' : 'default',
      ...s,
    }}
    onMouseEnter={onClick ? e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='var(--shadow2)'; } : null}
    onMouseLeave={onClick ? e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='var(--shadow)'; } : null}
    >
      {children}
    </div>
  );
}

export function Toast() {
  const { toast } = useApp();
  const colors = { success:'var(--green)', error:'var(--red)', info:'var(--blue)' };
  const icons = { success:'✓', error:'✕', info:'ℹ' };
  return (
    <div style={{ position:'fixed', bottom:24, right:24, zIndex:300, display:'flex', flexDirection:'column', gap:8 }}>
      <style>{`@keyframes toastIn { from { opacity:0; transform:translateX(40px) } to { opacity:1; transform:translateX(0) } }`}</style>
      {toast.map(t => (
        <div key={t.id} style={{
          background:'var(--bg2)', border:'1px solid var(--border)',
          borderLeft:`3px solid ${colors[t.type]||colors.info}`,
          borderRadius:'var(--radius-sm)', padding:'12px 18px',
          fontSize:'0.875rem', boxShadow:'var(--shadow2)',
          animation:'toastIn 0.3s ease', minWidth:200, maxWidth:340,
          display:'flex', alignItems:'center', gap:8,
        }}>
          <span style={{ color:colors[t.type]||colors.info }}>{icons[t.type]||icons.info}</span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
