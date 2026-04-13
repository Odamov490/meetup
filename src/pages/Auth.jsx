import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { authService } from '../firebase';
import { Btn, FormGroup, Input } from '../components/UI';

export default function Auth() {
  const { t, showToast } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', password:'' });

  const errMsg = {
    'auth/user-not-found': "Foydalanuvchi topilmadi",
    'auth/wrong-password': "Parol noto'g'ri",
    'auth/email-already-in-use': "Bu email allaqachon ro'yxatdan o'tgan",
    'auth/weak-password': "Parol juda zaif (min 6 belgi)",
    'auth/invalid-email': "Email noto'g'ri formatda",
    'auth/invalid-credential': "Email yoki parol noto'g'ri",
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await authService.loginWithGoogle();
      showToast(t('welcome') + '!', 'success');
      navigate('/');
    } catch(err) { showToast(errMsg[err.code] || err.message, 'error'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') await authService.loginWithEmail(form.email, form.password);
      else await authService.registerWithEmail(form.email, form.password, form.name);
      showToast(t('welcome') + '!', 'success');
      navigate('/');
    } catch(err) { showToast(errMsg[err.code] || err.message, 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24, background:'var(--bg)' }}>
      <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:20, padding:40, width:'100%', maxWidth:440, boxShadow:'var(--shadow2)' }}>
        <div style={{ fontFamily:'var(--font-head)', fontSize:'1.8rem', fontWeight:800, color:'var(--accent)', textAlign:'center', marginBottom:8 }}>
          Meetup<span style={{ color:'var(--text)' }}>.uz</span>
        </div>
        <div style={{ textAlign:'center', fontSize:'0.9rem', color:'var(--text2)', marginBottom:32 }}>
          {mode === 'login' ? t('login') : t('register')}
        </div>

        <button
          onClick={handleGoogle} disabled={loading}
          style={{ width:'100%', padding:12, border:'1.5px solid var(--border)', borderRadius:8, background:'var(--bg2)', color:'var(--text)', fontSize:'0.9rem', fontWeight:500, display:'flex', alignItems:'center', justifyContent:'center', gap:10, cursor:'pointer', fontFamily:'var(--font-body)', transition:'all .2s' }}
          onMouseEnter={e => e.currentTarget.style.background='var(--bg3)'}
          onMouseLeave={e => e.currentTarget.style.background='var(--bg2)'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {t('loginGoogle')}
        </button>

        <div style={{ display:'flex', alignItems:'center', gap:12, margin:'20px 0', color:'var(--text3)', fontSize:'0.85rem' }}>
          <div style={{ flex:1, height:1, background:'var(--border)' }} />
          yoki
          <div style={{ flex:1, height:1, background:'var(--border)' }} />
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <FormGroup label={t('name')}>
              <Input required value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} placeholder={t('name')} />
            </FormGroup>
          )}
          <FormGroup label={t('email')}>
            <Input required type="email" value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} placeholder="email@example.com" />
          </FormGroup>
          <FormGroup label={t('password')}>
            <Input required type="password" minLength={6} value={form.password} onChange={e => setForm(p=>({...p,password:e.target.value}))} placeholder="••••••••" />
          </FormGroup>
          <Btn type="submit" full disabled={loading} style={{ padding:13, fontSize:'1rem' }}>
            {loading ? t('loading') : mode === 'login' ? t('login') : t('register')}
          </Btn>
        </form>

        <div style={{ textAlign:'center', fontSize:'0.85rem', color:'var(--text2)', marginTop:20 }}>
          {mode === 'login' ? t('noAccount') : t('hasAccount')}{' '}
          <button onClick={() => setMode(m => m === 'login' ? 'register' : 'login')} style={{ background:'none', border:'none', color:'var(--accent)', fontWeight:600, cursor:'pointer', fontFamily:'var(--font-body)' }}>
            {mode === 'login' ? t('register') : t('login')}
          </button>
        </div>
      </div>
    </div>
  );
}
