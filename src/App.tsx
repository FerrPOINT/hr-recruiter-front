import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import VacancyCreate from './pages/VacancyCreate';
import VacancyList from './pages/VacancyList';
import InterviewCreate from './pages/InterviewCreate';
import InterviewList from './pages/InterviewList';
import InterviewSession from './pages/InterviewSession';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Account from './pages/Account';
import Team from './pages/Team';
import Branding from './pages/Branding';
import Tariffs from './pages/Tariffs';
import Questions from './pages/Questions';
import AudioTest from './components/AudioTest';

function App() {
  return (
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
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/interview/:sessionId" element={<InterviewSession />} />
          <Route path="/audio-test" element={<AudioTest />} />
          <Route path="/" element={<Layout />}>
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
  );
}

export default App; 