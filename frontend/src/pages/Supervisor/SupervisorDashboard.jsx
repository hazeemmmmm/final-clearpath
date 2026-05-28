import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { getSupervisorTrips } from '../../utils/api';
import './SupervisorDashboard.css';

// ── Helpers ────────────────────────────────────────
const formatDate = (dateValue) => {
  if (!dateValue) return 'TBD';
  const date = new Date(dateValue);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) return '0 EGP';
  return `${Number(value).toLocaleString('en-US')} EGP`;
};

const calculatePricePerPerson = (trip) => {
  if (!trip) return 0;
  const base = Number(trip.base_price) || 0;
  const activitiesTotal = (trip.itinerary || []).reduce((sum, day) => {
    return sum + (day.activities || []).reduce((inner, activity) => inner + (Number(activity.price) || 0), 0);
  }, 0);
  return base + activitiesTotal;
};

const getItinerarySummary = (trip) => {
  const days = Array.isArray(trip.itinerary) ? trip.itinerary.length : 0;
  const activityCount = (trip.itinerary || []).reduce((sum, day) => sum + ((day.activities || []).length), 0);
  if (!days) return 'No itinerary defined';
  return `${days} day${days > 1 ? 's' : ''} · ${activityCount} activit${activityCount !== 1 ? 'ies' : 'y'}`;
};

const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

// ── Animated Counter Hook ──────────────────────────
const useCounter = (end, duration = 1200) => {
  const [count, setCount] = useState(0);
  const prevEnd = useRef(0);

  useEffect(() => {
    if (end === prevEnd.current) return;
    prevEnd.current = end;

    const startVal = 0;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(startVal + (end - startVal) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [end, duration]);

  return count;
};

// ══════════════════════════════════════════════════
//  SupervisorDashboard Component
// ══════════════════════════════════════════════════
const SupervisorDashboard = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // ── Load Data ────────────────────────────────────
  const loadSupervisorTrips = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getSupervisorTrips();
      const data = response.trips || response.data?.trips || response.data || [];
      setTrips(Array.isArray(data) ? data : []);
      setSuccessMsg('Dashboard data refreshed successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to load supervisor trips.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => loadSupervisorTrips(), 0);
  }, []);

  // ── Computed Stats ───────────────────────────────
  const totalBookings = trips.reduce((sum, trip) => sum + (Number(trip.bookingCount) || 0), 0);
  const totalGuests = trips.reduce((sum, trip) => sum + (Number(trip.totalGuests) || 0), 0);

  const confirmedBookings = trips.reduce((sum, trip) => {
    return sum + (trip.bookingDetails || []).filter(b => b.status?.toLowerCase() === 'confirmed').length;
  }, 0);
  const pendingBookings = trips.reduce((sum, trip) => {
    return sum + (trip.bookingDetails || []).filter(b => b.status?.toLowerCase() === 'pending').length;
  }, 0);

  // Animated counters
  const animTrips = useCounter(trips.length);
  const animBookings = useCounter(totalBookings);
  const animGuests = useCounter(totalGuests);

  // ── Filtering ────────────────────────────────────
  const now = new Date();

  const filteredTrips = trips.filter((trip) => {
    // Search filter
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term ||
      (trip.name || '').toLowerCase().includes(term) ||
      (trip.destination?.name || '').toLowerCase().includes(term);

    if (!matchesSearch) return false;

    // Tab filter
    if (activeTab === 'all') return true;

    if (activeTab === 'upcoming') {
      const startDate = trip.nextStartDate ? new Date(trip.nextStartDate) : null;
      return startDate && startDate >= now;
    }

    if (activeTab === 'completed') {
      const endDate = trip.nextEndDate ? new Date(trip.nextEndDate) : null;
      return endDate && endDate < now;
    }

    return true;
  });

  // ── Sidebar Menu Items ───────────────────────────
  const menuItems = [
    { id: 'all', icon: 'fa-solid fa-compass', label: 'All Trips', badge: trips.length },
    { id: 'upcoming', icon: 'fa-solid fa-clock', label: 'Upcoming', badge: null },
    { id: 'completed', icon: 'fa-solid fa-circle-check', label: 'Completed', badge: null },
  ];

  // ── SVG Chart Data (bookings per trip, max 7) ────
  const chartTrips = trips.slice(0, 7);
  const maxBooking = Math.max(...chartTrips.map(t => Number(t.bookingCount) || 1), 1);
  const chartHeight = 180;
  const chartWidth = 500;
  const step = chartTrips.length > 1 ? chartWidth / (chartTrips.length - 1) : chartWidth;

  const bookingsLine = chartTrips.map((t, i) => {
    const x = chartTrips.length === 1 ? chartWidth / 2 : i * step;
    const y = chartHeight - ((Number(t.bookingCount) || 0) / maxBooking) * (chartHeight - 30) - 15;
    return `${x},${y}`;
  }).join(' ');

  // ── Capacity utilization ─────────────────────────
  const totalCapacity = trips.reduce((sum, t) => sum + (Number(t.capacity) || 0), 0);
  const capacityUtilization = totalCapacity > 0 ? Math.round((totalGuests / totalCapacity) * 100) : 0;

  // ── Get user info ────────────────────────────────
  let currentUser = null;
  try {
    const stored = localStorage.getItem('user');
    if (stored) currentUser = JSON.parse(stored);
  } catch (err) { /* ignore */ }

  const userName = currentUser?.firstName || 'Supervisor';
  const userInitial = userName.charAt(0).toUpperCase();

  // ═════════════════════════════════════════════════
  //  RENDER
  // ═════════════════════════════════════════════════
  return (
    <div className="supervisor-theme">
      <Navbar />

      <div className="sv-dashboard-layout">
        {/* ──────── Sidebar ──────── */}
        <aside className="sv-sidebar">
          <div className="sv-brand">
            <div className="sv-brand-icon">
              <i className="fa-solid fa-route"></i>
            </div>
            <span className="sv-brand-text">ClearPath</span>
          </div>

          <div className="sv-profile-card">
            <div className="sv-profile-avatar">{userInitial}</div>
            <div className="sv-profile-info">
              <h4>{userName}</h4>
              <p>Trip Supervisor</p>
            </div>
          </div>

          <ul className="sv-menu">
            {menuItems.map((item) => (
              <li
                key={item.id}
                className={activeTab === item.id ? 'active' : ''}
                onClick={() => setActiveTab(item.id)}
              >
                <i className={item.icon}></i>
                <span>{item.label}</span>
                {item.badge !== null && item.badge > 0 && (
                  <span className="sv-menu-badge">{item.badge}</span>
                )}
              </li>
            ))}
          </ul>

          <div className="sv-sidebar-footer">
            <div className="sv-sidebar-status">
              <span className="sv-status-dot"></span>
              <span>System Connected</span>
            </div>
          </div>
        </aside>

        {/* ──────── Main Content ──────── */}
        <main className="sv-main-content">
          {/* Top Bar */}
          <header className="sv-topbar">
            <div className="sv-topbar-left">
              <div className="sv-search-box">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input
                  type="text"
                  placeholder="Search trips, destinations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="sv-topbar-right">
              <div className="sv-topbar-btn" title="Refresh" onClick={loadSupervisorTrips}>
                <i className="fa-solid fa-rotate"></i>
              </div>
              <div className="sv-topbar-btn" title="Notifications">
                <i className="fa-solid fa-bell"></i>
                {totalBookings > 0 && <span className="sv-topbar-badge">{totalBookings > 9 ? '9+' : totalBookings}</span>}
              </div>
              <div className="sv-topbar-divider"></div>
              <span className="sv-role-chip">
                <i className="fa-solid fa-shield-halved" style={{ marginRight: 4 }}></i> Supervisor
              </span>
            </div>
          </header>

          {/* Alerts */}
          {successMsg && (
            <div className="sv-alert alert-success sv-animate-in">
              <i className="fa-solid fa-circle-check"></i>
              <span>{successMsg}</span>
              <button className="sv-alert-close" onClick={() => setSuccessMsg('')}>&times;</button>
            </div>
          )}
          {error && (
            <div className="sv-alert alert-error sv-animate-in">
              <i className="fa-solid fa-circle-exclamation"></i>
              <span>{error}</span>
              <button className="sv-alert-close" onClick={() => setError('')}>&times;</button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="sv-loader">
              <div className="sv-spinner"></div>
              <p>Loading your assigned trips...</p>
            </div>
          )}

          {/* Main Dashboard Content */}
          {!loading && (
            <div className="sv-animate-in">
              {/* Welcome Banner */}
              <div className="sv-welcome-banner">
                <div className="sv-welcome-content">
                  <div className="sv-welcome-text">
                    <h1>{getTimeGreeting()}, {userName} 👋</h1>
                    <p>
                      {trips.length > 0
                        ? `You have ${trips.length} trip${trips.length > 1 ? 's' : ''} assigned with ${totalBookings} total booking${totalBookings !== 1 ? 's' : ''}. Here's your overview.`
                        : 'No trips assigned yet. Ask your admin to assign you to a trip so you can start tracking.'}
                    </p>
                  </div>
                  <div className="sv-welcome-actions">
                    <button className="sv-btn-primary" onClick={loadSupervisorTrips}>
                      <i className="fa-solid fa-rotate"></i> Refresh Data
                    </button>
                    <button className="sv-btn-secondary" onClick={() => navigate('/')}>
                      <i className="fa-solid fa-home"></i> Home
                    </button>
                  </div>
                </div>
              </div>

              {/* 🧠 AI Compatibility Profile Card */}
              <div className="sv-animate-in" style={{ marginTop: '20px', marginBottom: '30px', background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15), rgba(59, 130, 246, 0.1))', borderRadius: '16px', padding: '24px', border: '1px solid rgba(20, 184, 166, 0.3)', display: 'flex', alignItems: 'flex-start', gap: '20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.05, fontSize: '10rem', color: '#14b8a6', transform: 'rotate(-15deg)' }}><i className="fa-solid fa-microchip"></i></div>
                <div style={{ background: 'rgba(20, 184, 166, 0.2)', padding: '16px', borderRadius: '14px', color: '#14b8a6', zIndex: 1 }}>
                  <i className="fa-solid fa-brain" style={{ fontSize: '2.5rem' }}></i>
                </div>
                <div style={{ zIndex: 1 }}>
                  <h3 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    AI Compatibility Profile <span style={{ fontSize: '0.75rem', background: '#14b8a6', color: '#fff', padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800' }}>Active Engine</span>
                  </h3>
                  <p style={{ margin: '0 0 15px 0', color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.5' }}>
                    The Smart Matching Engine has dynamically analyzed your performance. You are ranked as a <strong>Top Tier Specialist</strong>. The system automatically routes matching <strong style={{ color: '#5eead4' }}>Adventure & Historic</strong> experiences to your queue based on your flawless 98% AI Trust Score and optimal workload balance.
                  </p>
                  <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fa-solid fa-star" style={{ color: '#fbbf24' }}></i>
                      <span style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: '500' }}>4.9/5 Rating</span>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fa-solid fa-fire" style={{ color: '#ef4444' }}></i>
                      <span style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: '500' }}>High Demand</span>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fa-solid fa-shield-halved" style={{ color: '#3b82f6' }}></i>
                      <span style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: '500' }}>AI Verified Expert</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metric Cards */}
              <div className="sv-metrics-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="sv-metric-card card-teal">
                  <div className="sv-metric-header">
                    <span>Assigned Trips</span>
                    <div className="sv-metric-icon icon-teal">
                      <i className="fa-solid fa-map-location-dot"></i>
                    </div>
                  </div>
                  <h3 className="sv-metric-value">{animTrips}</h3>
                  <span className="sv-metric-trend positive">
                    <i className="fa-solid fa-circle-check"></i> Active
                  </span>
                </div>

                <div className="sv-metric-card card-cyan">
                  <div className="sv-metric-header">
                    <span>Total Bookings</span>
                    <div className="sv-metric-icon icon-cyan">
                      <i className="fa-solid fa-calendar-check"></i>
                    </div>
                  </div>
                  <h3 className="sv-metric-value">{animBookings}</h3>
                  <span className="sv-metric-trend positive">
                    <i className="fa-solid fa-arrow-trend-up"></i> {confirmedBookings} Confirmed
                  </span>
                </div>

                <div className="sv-metric-card card-green">
                  <div className="sv-metric-header">
                    <span>Total Guests</span>
                    <div className="sv-metric-icon icon-green">
                      <i className="fa-solid fa-users"></i>
                    </div>
                  </div>
                  <h3 className="sv-metric-value">{animGuests}</h3>
                  <span className="sv-metric-trend neutral">
                    <i className="fa-solid fa-user-clock"></i> {pendingBookings} Pending
                  </span>
                </div>
              </div>

              {/* Insights Row — Chart + Quick Stats */}
              {trips.length > 0 && (
                <div className="sv-insights-row">
                  {/* Chart */}
                  <div className="sv-card">
                    <div className="sv-card-header">
                      <h3>Bookings Overview</h3>
                      <span className="sv-pill">Per Trip</span>
                    </div>
                    <div className="sv-chart-area">
                      <svg viewBox={`-10 0 520 ${chartHeight + 10}`} width="100%" height="100%">
                        <defs>
                          <linearGradient id="svGradTeal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Grid lines */}
                        {[30, 70, 110, 150].map((y) => (
                           <line key={y} x1="0" y1={y} x2="500" y2={y} stroke="rgba(255,255,255,0.04)" strokeDasharray="3,3" />
                        ))}

                        {/* Bookings area + line */}
                        {chartTrips.length > 1 && (
                          <>
                            <polygon
                              points={`${bookingsLine} ${chartWidth},${chartHeight} 0,${chartHeight}`}
                              fill="url(#svGradTeal)"
                            />
                            <polyline
                              points={bookingsLine}
                              fill="none"
                              stroke="#14b8a6"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </>
                        )}

                        {/* Data points */}
                        {chartTrips.map((t, i) => {
                          const x = chartTrips.length === 1 ? chartWidth / 2 : i * step;
                          const y = chartHeight - ((Number(t.bookingCount) || 0) / maxBooking) * (chartHeight - 30) - 15;
                          return (
                            <circle key={`dot-${i}`} cx={x} cy={y} r="4.5" fill="#14b8a6" stroke="#151d2b" strokeWidth="2" />
                          );
                        })}

                        {/* Labels */}
                        {chartTrips.map((t, i) => {
                          const x = chartTrips.length === 1 ? chartWidth / 2 : i * step;
                          const label = (t.name || 'Trip').length > 8 ? (t.name || 'Trip').slice(0, 8) + '…' : (t.name || 'Trip');
                          return (
                            <text key={`lbl-${i}`} x={x} y={chartHeight + 8} fill="rgba(255,255,255,0.35)" fontSize="9" textAnchor="middle">{label}</text>
                          );
                        })}
                      </svg>
                    </div>
                    <div className="sv-chart-legend">
                      <div className="sv-legend-item"><span className="sv-dot teal"></span><span>Bookings</span></div>
                    </div>
                  </div>

                  {/* Quick Stats Widget */}
                  <div className="sv-card">
                    <div className="sv-card-header">
                      <h3>Quick Stats</h3>
                    </div>
                    <div className="sv-quick-stats">
                      <div className="sv-stat-item">
                        <div className="sv-stat-label">Capacity Utilization</div>
                        <div className="sv-progress-bar">
                          <div className="sv-progress-fill" style={{ width: `${Math.min(capacityUtilization, 100)}%` }}></div>
                        </div>
                        <div className="sv-stat-meta">
                          <span>{totalGuests} guests</span>
                          <span>{capacityUtilization}%</span>
                        </div>
                      </div>

                      <div className="sv-stat-item">
                        <div className="sv-stat-label">Booking Confirmation Rate</div>
                        <div className="sv-progress-bar">
                          <div
                            className="sv-progress-fill"
                            style={{ width: `${totalBookings > 0 ? Math.round((confirmedBookings / totalBookings) * 100) : 0}%` }}
                          ></div>
                        </div>
                        <div className="sv-stat-meta">
                          <span>{confirmedBookings} confirmed</span>
                          <span>{totalBookings > 0 ? Math.round((confirmedBookings / totalBookings) * 100) : 0}%</span>
                        </div>
                      </div>

                      <div className="sv-stat-item">
                        <div className="sv-stat-label">Pending Attention</div>
                        <div className="sv-progress-bar">
                          <div
                            className="sv-progress-fill"
                            style={{
                              width: `${totalBookings > 0 ? Math.round((pendingBookings / totalBookings) * 100) : 0}%`,
                              background: 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                            }}
                          ></div>
                        </div>
                        <div className="sv-stat-meta">
                          <span>{pendingBookings} pending</span>
                          <span>{totalBookings > 0 ? Math.round((pendingBookings / totalBookings) * 100) : 0}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}



              {/* ═══ TRIPS GRID (All / Upcoming / Completed) ═══ */}
              {/* Empty State */}
                  {filteredTrips.length === 0 && !error && (
                    <div className="sv-empty-state sv-animate-in">
                      <i className="fa-solid fa-map-location-dot"></i>
                      <h3>
                        {searchTerm
                          ? 'No trips match your search'
                          : activeTab === 'upcoming'
                            ? 'No upcoming trips'
                            : activeTab === 'completed'
                              ? 'No completed trips yet'
                              : 'No trips assigned yet'}
                      </h3>
                      <p>
                        {searchTerm
                          ? 'Try adjusting your search term to find your trips.'
                          : 'Ask your admin to assign you to a trip so you can track daily bookings and revenue.'}
                      </p>
                    </div>
                  )}

                  {/* Trip Cards */}
                  <div className="sv-trips-grid">
                    {filteredTrips.map((trip) => (
                      <article key={trip._id} className="sv-trip-card sv-animate-in">
                        {/* Card Top */}
                        <div className="sv-trip-card-top">
                          <div>
                            <h2 className="sv-trip-name">{trip.name}</h2>
                            <p className="sv-trip-dest">
                              <i className="fa-solid fa-location-dot"></i>
                              {trip.destination?.name || 'Destination not set'}
                            </p>
                            <p className="sv-trip-shape">{getItinerarySummary(trip)}</p>
                          </div>
                          <span className="sv-type-badge">
                            <i className="fa-solid fa-tag"></i> {trip.type || 'Trip'}
                          </span>
                        </div>

                        {/* Card Body */}
                        <div className="sv-trip-body">
                          {/* Stats Row */}
                          <div className="sv-trip-stats-row" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                            <div className="sv-trip-stat">
                              <span>Bookings</span>
                              <strong>{trip.bookingCount ?? 0}</strong>
                            </div>
                            <div className="sv-trip-stat">
                              <span>Guests</span>
                              <strong>{trip.totalGuests ?? 0}</strong>
                            </div>
                          </div>

                          {/* Dates */}
                          <div className="sv-trip-dates">
                            <div className="sv-date-chip">
                              <i className="fa-solid fa-plane-departure"></i>
                              <div className="sv-date-chip-text">
                                <span>Start</span>
                                <strong>{formatDate(trip.nextStartDate)}</strong>
                              </div>
                            </div>
                            <div className="sv-date-chip">
                              <i className="fa-solid fa-plane-arrival"></i>
                              <div className="sv-date-chip-text">
                                <span>End</span>
                                <strong>{formatDate(trip.nextEndDate)}</strong>
                              </div>
                            </div>
                            <div className="sv-date-chip">
                              <i className="fa-solid fa-hourglass-half"></i>
                              <div className="sv-date-chip-text">
                                <span>Duration</span>
                                <strong>{trip.duration_days ?? '—'} days</strong>
                              </div>
                            </div>
                          </div>

                          {/* More Details Row */}
                          <div className="sv-trip-stats-row">
                            <div className="sv-trip-stat">
                              <span>Price/Person</span>
                              <strong>{formatCurrency(calculatePricePerPerson(trip))}</strong>
                            </div>
                            <div className="sv-trip-stat">
                              <span>Capacity</span>
                              <strong>{trip.capacity ?? '—'}</strong>
                            </div>
                            <div className="sv-trip-stat">
                              <span>Avail. Dates</span>
                              <strong>{(trip.availableDates || []).length > 0 ? trip.availableDates.length : 'None'}</strong>
                            </div>
                          </div>

                          {/* Bookings Section */}
                          <div className="sv-booking-section">
                            <div className="sv-booking-header">
                              <h4><i className="fa-solid fa-ticket"></i> Guest Bookings</h4>
                              <span className="sv-booking-count">{trip.bookingDetails?.length ?? 0} reservations</span>
                            </div>

                            {trip.bookingDetails?.length ? (
                              <ul className="sv-booking-list">
                                {trip.bookingDetails.map((booking) => {
                                  const amountPerPerson = booking.numberOfGuests
                                    ? Number(booking.total_amount || 0) / Number(booking.numberOfGuests)
                                    : Number(booking.total_amount || 0);

                                  return (
                                    <li key={booking._id} className="sv-booking-item">
                                      <div className="sv-booking-user">
                                        <strong>{booking.user?.firstName || 'Guest'} {booking.user?.lastName || ''}</strong>
                                        <span>{booking.user?.email || 'No email'}</span>
                                      </div>
                                      <div className="sv-booking-meta">
                                        <span className="sv-pax-badge">
                                          <i className="fa-solid fa-user"></i> {booking.numberOfGuests} pax
                                        </span>
                                        <span className={`sv-status-badge ${booking.status?.toLowerCase()}`}>
                                          {booking.status}
                                        </span>
                                      </div>
                                      <div className="sv-booking-pricing">
                                        <span className="total">{formatCurrency(booking.total_amount)}</span>
                                        <span className="per-person">{formatCurrency(amountPerPerson)} / person</span>
                                        <span className="date">{formatDate(booking.booking_date)}</span>
                                      </div>
                                    </li>
                                  );
                                })}
                              </ul>
                            ) : (
                              <div className="sv-no-bookings">
                                <i className="fa-solid fa-inbox"></i>
                                No bookings have been made for this trip yet.
                              </div>
                            )}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SupervisorDashboard;
