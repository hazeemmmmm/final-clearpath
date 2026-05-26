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
import SupervisorDashboard from './pages/Supervisor/SupervisorDashboard'
import Destinations from './pages/Destinations/Destinations'
import Experiences from './pages/Experiences/Experiences'
import Verify from './pages/Verify/Verify'
import ForgotPassword from './pages/ForgotPassword/ForgotPassword'
import Chatbot from './components/Chatbot'

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
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/trips" element={<Trips />} />
        <Route path="/dayuse" element={<Dayuse />} />
        <Route path="/experiences" element={<Experiences />} />
        <Route path="/destinations" element={<Destinations />} />
        <Route path="/package-details/:id" element={<PackageDetails />} />
        
        {/* Protected Routes */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
        <Route path="/booking/:id/cancel" element={<ProtectedRoute><CancelConfirm /></ProtectedRoute>} />
        <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
        <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
        <Route path="/payment/cancel" element={<ProtectedRoute><PaymentCancel /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/supervisor" element={<ProtectedRoute roles={['supervisor']}><SupervisorDashboard /></ProtectedRoute>} />

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

