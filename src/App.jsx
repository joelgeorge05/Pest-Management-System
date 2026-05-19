import { useState, useEffect } from 'react'
import { Leaf, Sprout, TreePine } from 'lucide-react';
import Header from './components/Header'
import Hero from './components/Hero'
import LandingPage from './components/LandingPage'
import UploadAnalyzer from './components/UploadAnalyzer'
import ResultsDisplay from './components/ResultsDisplay'
import SeasonalAdvice from './components/SeasonalAdvice'
import ShopList from './components/ShopList'
import Login from './components/Login'
import AdminDashboard from './components/AdminDashboard'
import SubsidyList from './components/SubsidyList'
import Forum from './components/Forum'
import MedicineProposal from './components/MedicineProposal'
import ExpertDashboard from './components/ExpertDashboard'
import Profile from './components/Profile'
import Messaging from './components/Messaging'
import Feedback from './components/Feedback'
import History from './components/History'
import Chatbot from './components/Chatbot'
import UserAnnouncements from './components/UserAnnouncements'
import Consultations from './components/Consultations'

const isProfileComplete = (user) => {
  if (!user) return false;
  return user.name && user.address && user.phone && user.pincode;
};

function App() {
  const [user, setUser] = useState(null)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [view, setView] = useState('landing') // 'landing' | 'login'
  const [currentPage, setCurrentPage] = useState('home'); // 'home' | 'subsidies' | 'forum' | 'proposal' | 'profile' | 'messaging' | 'shops' | 'consultations'
  const [expertTab, setExpertTab] = useState('consultations');
  const [adminTab, setAdminTab] = useState('users');

  useEffect(() => {
    // Check session storage for persisted login
    const storedUser = sessionStorage.getItem('pest_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    sessionStorage.setItem('pest_user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    setAnalysisResult(null)
    sessionStorage.removeItem('pest_user')
  }

  const handleAnalyze = (result) => {
    setAnalysisResult(result)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleReset = () => {
    setAnalysisResult(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!user) {
    if (view === 'landing') {
      return <LandingPage onNavigateToLogin={() => setView('login')} />
    }
    return <Login onLogin={handleLogin} onBack={() => setView('landing')} />
  }

  // Admin View
  if (user.role === 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
        <Header 
          user={user} 
          onLogout={handleLogout} 
          adminView={true} 
          onNavigate={setAdminTab}
          currentView={adminTab}
        />
        <div className="flex-1">
          <AdminDashboard 
            user={user} 
            onLogout={handleLogout} 
            activeTab={adminTab}
            setActiveTab={setAdminTab}
          />
        </div>
        <footer className="bg-emerald-950 text-emerald-50 py-10 text-center border-t border-emerald-900/50 mt-auto relative z-10">
          <p className="font-medium tracking-wide">&copy; 2026 Smart Pest Management System. Empowering Farmers.</p>
          <p className="text-sm text-emerald-300/80 mt-2 font-medium">Developed by joelgeorge05</p>
        </footer>
        <Chatbot />
      </div>
    )
  }

  // Expert View


  if (user.role === 'expert') {
    return (
      <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
        <Header
          user={user}
          onLogout={handleLogout}
          onNavigate={(view) => setExpertTab(view === 'home' ? 'consultations' : view)}
          currentView={expertTab}
        />
        <main className="pt-16 flex-1">
          <ExpertDashboard
            user={user}
            activeTab={expertTab}
            setActiveTab={setExpertTab}
          />
        </main>
        <footer className="bg-emerald-950 text-emerald-50 py-10 text-center border-t border-emerald-900/50 mt-auto relative z-10">
          <p className="font-medium tracking-wide">&copy; 2026 Smart Pest Management System. Empowering Farmers.</p>
          <p className="text-sm text-emerald-300/80 mt-2 font-medium">Developed by joelgeorge05</p>
        </footer>
        <Chatbot />
      </div>
    )
  }

  // Farmer View (Original App)
  const profileComplete = isProfileComplete(user);
  const activeView = profileComplete ? currentPage : 'profile';

  return (
    <div className="min-h-screen bg-amber-50/40 selection:bg-amber-200 selection:text-amber-900 font-sans relative overflow-hidden">
      {/* Immersive Breathtaking Background for Vibrant Earth Theme */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Animated Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-orange-300/30 rounded-full mix-blend-multiply filter blur-[100px] animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[35rem] h-[35rem] bg-emerald-300/30 rounded-full mix-blend-multiply filter blur-[100px] animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-[-20%] left-[20%] w-[45rem] h-[45rem] bg-amber-300/30 rounded-full mix-blend-multiply filter blur-[100px] animate-blob" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header
          user={user}
          onLogout={handleLogout}
          onNavigate={profileComplete ? setCurrentPage : undefined}
          currentView={activeView}
          profileComplete={profileComplete}
        />
        <main className="pt-28 flex-1">
          {activeView === 'home' && (
          !analysisResult ? (
            <>
              <Hero />
              <UploadAnalyzer onAnalyze={handleAnalyze} user={user} />
              <SeasonalAdvice />
              <ShopList />
            </>
          ) : (
            <ResultsDisplay result={analysisResult} onReset={handleReset} />
          )
        )}

        {activeView === 'subsidies' && <SubsidyList />}
        {activeView === 'consultations' && <Consultations user={user} />}
        {activeView === 'shops' && <ShopList />}
        {activeView === 'forum' && <Forum user={user} />}
        {activeView === 'proposal' && <MedicineProposal user={user} />}
        {activeView === 'profile' && <Profile user={user} onUpdateUser={handleLogin} />}
        {activeView === 'messaging' && <Messaging user={user} />}
        {activeView === 'feedback' && <Feedback user={user} />}
        {activeView === 'history' && <History user={user} />}
        {activeView === 'announcements' && <UserAnnouncements />}
      </main>

      <footer className="bg-emerald-950 text-emerald-50 py-10 text-center border-t border-emerald-900/50 mt-auto relative z-10">
        <p className="font-medium tracking-wide">&copy; 2026 Smart Pest Management System. Empowering Farmers.</p>
        <p className="text-sm text-emerald-300/80 mt-2 font-medium">Developed by joelgeorge05</p>
      </footer>
      <Chatbot />
    </div>
  </div>
  )
}

export default App
