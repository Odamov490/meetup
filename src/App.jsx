import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import Navbar from './components/Navbar';
import { Toast } from './components/UI';
import Home from './pages/Home';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetail';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import Admin from './pages/Admin';
import { Spinner } from './components/UI';


function ProtectedRoute({ children, adminOnly }) {
  const { currentUser, userProfile, authLoading } = useApp();
  if (authLoading) return <Spinner />;
  if (!currentUser) return <Navigate to="/auth" replace />;
  if (adminOnly && userProfile?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { authLoading } = useApp();
  if (authLoading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontFamily:'var(--font-head)', fontSize:'1.8rem', fontWeight:800, color:'var(--accent)', marginBottom:24 }}>
            Meetup<span style={{ color:'var(--text)' }}>.uz</span>
          </div>
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/groups/:id" element={<GroupDetail />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/chat/:groupId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
        


      </Routes>
      <Toast />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
