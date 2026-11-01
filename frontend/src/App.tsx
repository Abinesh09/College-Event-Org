import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { StudentRegisterPage } from './pages/StudentRegisterPage';
import { BrowseEventsPage } from './pages/BrowseEventsPage';
import { EventDetailsPage } from './pages/EventDetailsPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { MyRegistrationsPage } from './pages/MyRegistrationsPage';
import { TeacherDashboardPage } from './pages/TeacherDashboardPage';
import { CreateEventPage } from './pages/CreateEventPage';
import { EditEventPage } from './pages/EditEventPage';
import { EventParticipantsPage } from './pages/EventParticipantsPage';
import { EventStatsPage } from './pages/EventStatsPage';
import { ProfilePage } from './pages/ProfilePage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<StudentRegisterPage />} />
              <Route path="/events" element={<BrowseEventsPage />} />
              <Route path="/events/:id" element={<EventDetailsPage />} />

              {/* Student Only Routes */}
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute requiredRole="student">
                    <StudentDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/registrations"
                element={
                  <ProtectedRoute requiredRole="student">
                    <MyRegistrationsPage />
                  </ProtectedRoute>
                }
              />

              {/* Teacher Only Routes */}
              <Route
                path="/teacher/dashboard"
                element={
                  <ProtectedRoute requiredRole="teacher">
                    <TeacherDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/events/create"
                element={
                  <ProtectedRoute requiredRole="teacher">
                    <CreateEventPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/events/:id/edit"
                element={
                  <ProtectedRoute requiredRole="teacher">
                    <EditEventPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/events/:id/participants"
                element={
                  <ProtectedRoute requiredRole="teacher">
                    <EventParticipantsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/events/:id/stats"
                element={
                  <ProtectedRoute requiredRole="teacher">
                    <EventStatsPage />
                  </ProtectedRoute>
                }
              />

              {/* Shared Authenticated Routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Error & Fallback Routes */}
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
