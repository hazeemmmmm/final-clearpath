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
import PackageDetails from './pages/PackageDetails/PackageDetails'
import Payment from './pages/Payment/Payment'
import AdminDashboard from './pages/Admin/AdminDashboard'
import Destinations from './pages/Destinations/Destinations'
import Experiences from './pages/Experiences/Experiences'
import Verify from './pages/Verify/Verify'
import Chatbot from './components/Chatbot'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated || !!localStorage.getItem('clearpath_access_token'))
  return isAuthenticated ? children : <Navigate to="/login" replace />
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
        <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

        {/* Auth Routes */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} />
        <Route path="/verify" element={isAuthenticated ? <Navigate to="/" replace /> : <Verify />} />
        
        {/* Catch-all redirect for any unknown route like /home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Chatbot />
    </Router>
  )
}

export default App

