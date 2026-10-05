import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CreateTripPage from './pages/CreateTripPage';
import MyTripsPage from './pages/MyTripsPage';
import ItineraryBuilderPage from './pages/ItineraryBuilderPage';
import ItineraryViewPage from './pages/ItineraryViewPage';
import CitySearchPage from './pages/CitySearchPage';
import BudgetPage from './pages/BudgetPage';
import PackingChecklistPage from './pages/PackingChecklistPage';
import PublicItineraryPage from './pages/PublicItineraryPage';
import UserProfilePage from './pages/UserProfilePage';
import TripNotesPage from './pages/TripNotesPage';
import CommunityPage from './pages/CommunityPage';
import ChatPage from './pages/ChatPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AIPlannerPage from './pages/AIPlannerPage';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return user ? children : <Navigate to="/login" replace />;
};

const AppLayout = ({ children }) => (
  <>
    <Navbar />
    <main
      style={{
        paddingTop: '94px',
        paddingBottom: '40px',
        width: '100%',
        maxWidth: '1280px',
        marginLeft: 'auto',
        marginRight: 'auto',
        position: 'relative',
      }}
      className="px-4 md:px-6 lg:px-8"
    >
      {children}
    </main>
  </>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/public/:id" element={<PublicItineraryPage />} />

        {/* Protected */}
        <Route path="/dashboard" element={<PrivateRoute><AppLayout><DashboardPage /></AppLayout></PrivateRoute>} />
        <Route path="/trips" element={<PrivateRoute><AppLayout><MyTripsPage /></AppLayout></PrivateRoute>} />
        <Route path="/trips/new" element={<PrivateRoute><AppLayout><CreateTripPage /></AppLayout></PrivateRoute>} />
        <Route path="/trips/:id/build" element={<PrivateRoute><AppLayout><ItineraryBuilderPage /></AppLayout></PrivateRoute>} />
        <Route path="/trips/:id/itinerary" element={<PrivateRoute><AppLayout><ItineraryViewPage /></AppLayout></PrivateRoute>} />
        <Route path="/trips/:id/budget" element={<PrivateRoute><AppLayout><BudgetPage /></AppLayout></PrivateRoute>} />
        <Route path="/trips/:id/checklist" element={<PrivateRoute><AppLayout><PackingChecklistPage /></AppLayout></PrivateRoute>} />
        <Route path="/trips/:id/notes" element={<PrivateRoute><AppLayout><TripNotesPage /></AppLayout></PrivateRoute>} />
        <Route path="/trips/:id/expense" element={<PrivateRoute><AppLayout><BudgetPage /></AppLayout></PrivateRoute>} />
        <Route path="/search" element={<PrivateRoute><AppLayout><CitySearchPage /></AppLayout></PrivateRoute>} />
        <Route path="/community" element={<PrivateRoute><AppLayout><CommunityPage /></AppLayout></PrivateRoute>} />
        <Route path="/chat" element={<PrivateRoute><AppLayout><ChatPage /></AppLayout></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><AppLayout><UserProfilePage /></AppLayout></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><AppLayout><AdminDashboardPage /></AppLayout></PrivateRoute>} />
        <Route path="/ai-planner" element={<PrivateRoute><AppLayout><AIPlannerPage /></AppLayout></PrivateRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AnimatedRoutes />
      </Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#FFFFFF',
            color: '#111827',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 500,
            fontFamily: '"Inter", system-ui, sans-serif',
            boxShadow: '0 12px 40px rgba(17, 24, 39, 0.10), 0 4px 12px rgba(17, 24, 39, 0.05)',
          },
          success: { iconTheme: { primary: '#2563EB', secondary: '#FFFFFF' } },
          error: { iconTheme: { primary: '#BA1A1A', secondary: '#FFFFFF' } },
        }}
      />
    </AuthProvider>
  );
}

export default App;
