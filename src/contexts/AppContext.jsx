import { createContext, useContext, useEffect, useState } from 'react';
import { authService, userService } from '../firebase';
import { translations } from '../utils/i18n';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [lang, setLangState] = useState(() => localStorage.getItem('lang') || 'uz');
  const [theme, setThemeState] = useState(() => localStorage.getItem('theme') || 'light');
  const [toast, setToast] = useState([]);

  useEffect(() => {
    const unsub = authService.onAuthChange(async (user) => {
      setCurrentUser(user);
      if (user) {
        let profile = await userService.getUser(user.uid);
        if (!profile) {
          await userService.createUser(user.uid, {
            displayName: user.displayName || 'User',
            email: user.email,
            photoURL: user.photoURL || '',
          });
          profile = await userService.getUser(user.uid);
        }
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem('lang', lang);
  }, [lang]);

  const t = (key) => translations[lang]?.[key] || key;

  const setLang = (l) => setLangState(l);
  const toggleTheme = () => setThemeState(p => p === 'light' ? 'dark' : 'light');

  const showToast = (msg, type = 'info') => {
    const id = Date.now();
    setToast(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToast(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const refreshProfile = async () => {
    if (!currentUser) return;
    const profile = await userService.getUser(currentUser.uid);
    setUserProfile(profile);
  };

  return (
    <AppContext.Provider value={{ currentUser, userProfile, authLoading, lang, theme, t, setLang, toggleTheme, showToast, refreshProfile, toast }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
