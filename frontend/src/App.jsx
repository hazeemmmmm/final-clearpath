import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import './App.css'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import Home from './pages/Home/Home'
import Wishlist from './pages/Wishlist/Wishlist'
import Trips from './pages/Trips/Trips'
import Dayuse from './pages/Dayuse/Dayuse'
import Profile from './pages/Profile/Profile'
import MyBookings from './pages/MyBookings'
import CancelConfirm from './pages/CancelConfirm/CancelConfirm'
import PackageDetails from './pages/PackageDetails/PackageDetails'
import Payment from './pages/Payment/Payment'
import PaymentSuccess from './pages/Payment/PaymentSuccess'
import PaymentCancel from './pages/Payment/PaymentCancel'
import AdminDashboard from './pages/Admin/AdminDashboard'
import PackingGuidesAdmin from './pages/Admin/PackingGuidesAdmin'
import CreateGuide from './pages/Admin/CreateGuide'
import SupervisorDashboard from './pages/Supervisor/SupervisorDashboard'
import Destinations from './pages/Destinations/Destinations'
import Experiences from './pages/Experiences/Experiences'
import Verify from './pages/Verify/Verify'
import ForgotPassword from './pages/ForgotPassword/ForgotPassword'
import Chatbot from './components/Chatbot'
import CreateDestination from './pages/Admin/CreateDestination'
import CreateProvider from './pages/Admin/CreateProvider'
import CreateActivity from './pages/Admin/CreateActivity'

// Protected Route Component
const ProtectedRoute = ({ children, roles = [] }) => {
  const authState = useSelector((state) => state.auth);
  const isAuthenticated = authState?.isAuthenticated || !!localStorage.getItem('clearpath_access_token') || !!localStorage.getItem('token');

  let localUser = null;
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      localUser = JSON.parse(storedUser);
    } catch (e) {
      localUser = null;
    }
  }

  const user = authState?.user || localUser;

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles.length && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
}

function App() {
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated || !!localStorage.getItem('clearpath_access_token'))

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/trips" element={<Trips />} />
        <Route path="/dayuse" element={<Dayuse />} />
        <Route path="/experiences" element={<Experiences />} />
        <Route path="/destinations" element={<Destinations />} />
        <Route path="/package-details/:id" element={<PackageDetails />} />
        
        {/* Protected Routes */}
        <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
        <Route path="/booking/:id/cancel" element={<ProtectedRoute><CancelConfirm /></ProtectedRoute>} />
        <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
        <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
        <Route path="/payment/cancel" element={<ProtectedRoute><PaymentCancel /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/packing-guides" element={<ProtectedRoute roles={['admin']}><PackingGuidesAdmin /></ProtectedRoute>} />
        {/* Dedicated full-page form for creating a new packing guide */}
        <Route path="/admin/guides/new" element={<ProtectedRoute roles={['admin']}><CreateGuide /></ProtectedRoute>} />
        <Route path="/admin/destinations/new" element={<ProtectedRoute roles={['admin']}><CreateDestination /></ProtectedRoute>} />
        <Route path="/admin/providers/new" element={<ProtectedRoute roles={['admin']}><CreateProvider /></ProtectedRoute>} />
        <Route path="/admin/activities/new" element={<ProtectedRoute roles={['admin']}><CreateActivity /></ProtectedRoute>} />
        <Route path="/admin/activities/:id/edit" element={<ProtectedRoute roles={['admin']}><CreateActivity /></ProtectedRoute>} />
        <Route path="/supervisor" element={<ProtectedRoute roles={['supervisor', 'provider']}><SupervisorDashboard /></ProtectedRoute>} />

        {/* Auth Routes */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} />
        <Route path="/verify" element={isAuthenticated ? <Navigate to="/" replace /> : <Verify />} />
        <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/" replace /> : <ForgotPassword />} />
        
        {/* Catch-all redirect for any unknown route like /home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Chatbot />
    </Router>
  )
}

export default App

