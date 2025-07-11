import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import CandidateLayout from './components/CandidateLayout';
import Dashboard from './pages/Dashboard';
import VacancyCreate from './pages/VacancyCreate';
import VacancyList from './pages/VacancyList';
import InterviewCreate from './pages/InterviewCreate';
import InterviewList from './pages/InterviewList';
import InterviewSession from './pages/InterviewSession';
import ElabsSession from './pages/ElabsSession';
import ElevenLabsTest from './components/ElevenLabsTest';
import SpeechToSpeechTest from './components/SpeechToSpeechTest';
import TestPage from './pages/TestPage';
import InterviewEntryForm from './pages/InterviewEntryForm';
import InterviewEntryDemo from './pages/InterviewEntryDemo';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Account from './pages/Account';
import Team from './pages/Team';
import Branding from './pages/Branding';
import Tariffs from './pages/Tariffs';
import Questions from './pages/Questions';
import { ThemeProvider } from './components/ThemeProvider';
import EditorLayout from './components/EditorLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './store/authStore';
import SessionExpiredModal from './components/SessionExpiredModal';

function App() {
  const { restoreSession, showSessionExpiredModal, hideSessionExpired } = useAuthStore();

  // Восстанавливаем сессию при загрузке приложения
  useEffect(() => {
    restoreSession().catch(error => {
      console.error('Failed to restore session:', error);
    });
  }, [restoreSession]);

  const handleSessionExpiredLogin = () => {
    hideSessionExpired();
    // Очищаем состояние и перенаправляем на логин
    useAuthStore.getState().logout();
    window.location.href = '/login';
  };

  return (
    <ThemeProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen bg-gray-50">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
          
          {/* Модальное окно истечения сессии */}
          <SessionExpiredModal 
            isOpen={showSessionExpiredModal} 
            onLogin={handleSessionExpiredLogin} 
          />
          <Routes>
            {/* Публичные страницы (без Layout) */}
            <Route path="/login" element={<Login />} />
            <Route path="/interview-entry" element={<InterviewEntryForm />} />
            <Route path="/interview-entry-demo" element={<InterviewEntryDemo />} />
            
            {/* Страницы кандидатов (с CandidateLayout) */}
            <Route path="/interview/:sessionId" element={<CandidateLayout><InterviewSession /></CandidateLayout>} />
            <Route path="/elabs/:sessionId" element={<CandidateLayout><ElabsSession /></CandidateLayout>} />
            
            {/* Тестовые страницы */}
            <Route path="/elevenlabs-test" element={<ElevenLabsTest />} />
            <Route path="/speech-test" element={<SpeechToSpeechTest />} />
            <Route path="/test" element={<TestPage />} />
            
            {/* Админские страницы (с Layout) */}
            <Route path="/" element={<ProtectedRoute><EditorLayout /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="vacancies" element={<VacancyList />} />
              <Route path="vacancies/create" element={<VacancyCreate />} />
              <Route path="vacancies/:id/edit" element={<VacancyCreate />} />
              <Route path="vacancies/:id" element={<VacancyCreate />} />
              <Route path="interviews" element={<InterviewList />} />
              <Route path="interviews/create" element={<InterviewCreate />} />
              <Route path="reports" element={<Reports />} />
              <Route path="account" element={<Account />} />
              <Route path="team" element={<Team />} />
              <Route path="team/add" element={<Team />} />
              <Route path="branding" element={<Branding />} />
              <Route path="tariffs" element={<Tariffs />} />
              <Route path="questions/:positionId" element={<Questions />} />
              <Route path="questions/add" element={<Questions />} />
              <Route path="questions/edit/:id" element={<Questions />} />
            </Route>
            
            {/* Старые роуты для совместимости */}
            <Route path="/old" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="vacancies" element={<VacancyList />} />
              <Route path="vacancies/create" element={<VacancyCreate />} />
              <Route path="interviews" element={<InterviewList />} />
              <Route path="interviews/create" element={<InterviewCreate />} />
              <Route path="reports" element={<Reports />} />
              <Route path="account" element={<Account />} />
              <Route path="team" element={<Team />} />
              <Route path="branding" element={<Branding />} />
              <Route path="tariffs" element={<Tariffs />} />
              <Route path="questions/:positionId" element={<Questions />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App; 