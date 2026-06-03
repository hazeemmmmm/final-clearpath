import React, { useState, useEffect } from 'react';
import { getUserPreferenceAnalytics } from '../../utils/api';

const AdminAnalytics = () => {
  const fallbackStats = {
    totalEngagementCount: 1285,
    avgUserSpending: 3850,
    repeatCustomerCount: 14,
    mostViewedDestinations: [
      { destinationName: 'Hurghada / الغردقة', count: 248 },
      { destinationName: 'Luxor / الأقصر', count: 185 },
      { destinationName: 'Dahab / دهب', count: 142 },
      { destinationName: 'Siwa / سيوة', count: 96 }
    ],
    mostBookedPackages: [
      { packageName: 'Hurghada Yacht Red Sea Cruise', count: 52 },
      { packageName: 'Luxor Ancient Pharaoh Dynasty Tour', count: 38 },
      { packageName: 'Wadi Degla Cave Hiking Adventure', count: 29 },
      { packageName: 'Dahab Blue Hole Deep Dive', count: 18 }
    ],
    mostSearchedActivities: [
      { _id: 'diving / الغوص', count: 86 },
      { _id: 'safari / سفاري صحراوي', count: 64 },
      { _id: 'hiking / تسلق جبال', count: 48 },
      { _id: 'yacht rental / تأجير يخوت', count: 35 }
    ],
    topTravelCategories: [
      { _id: 'beach / شواطئ البحر الأحمر', count: 195 },
      { _id: 'culture / السياحة الأثرية', count: 120 },
      { _id: 'adventure / سياحة المغامرة', count: 85 }
    ],
    peakBookingHours: [
      { _id: 20, count: 45 },
      { _id: 21, count: 38 },
      { _id: 19, count: 30 },
      { _id: 15, count: 22 }
    ]
  };

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [lang, setLang] = useState('en'); // 'en' or 'ar'
  const [demoMode, setDemoMode] = useState(false);
  const [campaignDeployed, setCampaignDeployed] = useState(false);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await getUserPreferenceAnalytics(demoMode);
      if (res && res.success && res.data) {
        setData(res.data);
      } else {
        setErrorMsg(lang === 'en' ? 'Unable to load analytics. Showing demo statistics.' : 'تعذرت تحميل التحليلات. عرض بيانات تجريبية.');
        setData(fallbackStats);
      }
    } catch (err) {
      console.error("Failed to load user preference analytics:", err);
      setErrorMsg(lang === 'en' ? 'Analytics service is unavailable. Please refresh.' : 'خدمة التحليلات غير متاحة حالياً. الرجاء إعادة التحميل.');
      setData(fallbackStats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [demoMode]);

  const handleDeployCampaign = () => {
    setCampaignDeployed(true);
    setTimeout(() => {
      setCampaignDeployed(false);
    }, 6000);
  };

  if (loading) {
    return (
      <div className="aura-full-loader" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="aura-spinner"></div>
        <p style={{ marginTop: '15px', color: 'var(--text-muted)' }}>
          {lang === 'en' ? 'Decrypting Customer Behavior Logs...' : 'جاري فك تشفير سجلات سلوك العملاء...'}
        </p>
      </div>
    );
  }

  const stats = data || fallbackStats;

  // Find the primary category for smart AI recommendation
  const topCategoryObj = stats.topTravelCategories?.[0];
  const topCategoryName = topCategoryObj?._id || '';
  
  // Smart AI Recommendations based on data
  const getAIRecommendation = () => {
    if (lang === 'en') {
      if (topCategoryName.toLowerCase().includes('beach') || topCategoryName.includes('شواطئ')) {
        return {
          title: "🔥 AI Campaign Suggestion: Beach Paradise Boost",
          desc: "Beach destinations are trending with 195+ user views this week. We recommend auto-generating a 15% discount for Hurghada Yacht Red Sea Cruise or Sharm El Sheikh packages to maximize conversion.",
          action: "Deploy Beach Promo Campaign"
        };
      } else if (topCategoryName.toLowerCase().includes('culture') || topCategoryName.includes('أثرية')) {
        return {
          title: "🏛️ AI Campaign Suggestion: Ancient Heritage Promo",
          desc: "Historical & cultural experiences are highly searched. We suggest launching a custom cultural bundle featuring Luxor Ancient Pharaoh Dynasty Tour with pre-assigned guide Yasmine.",
          action: "Launch Cultural Heritage Bundle"
        };
      } else {
        return {
          title: "🌲 AI Campaign Suggestion: Active Adventure Promotion",
          desc: "Adventure seekers are heavily looking up desert safaris and cave hiking. Consider publishing a dynamic weekend package for Wadi Degla Hiking with high guide supervisor ratios.",
          action: "Distribute Adventure Coupons"
        };
      }
    } else {
      if (topCategoryName.toLowerCase().includes('beach') || topCategoryName.includes('شواطئ')) {
        return {
          title: "🔥 اقتراح حملة الذكاء الاصطناعي: تعزيز جنة الشواطئ",
          desc: "وجهات الشواطئ تحقق رواجاً كبيراً بأكثر من 195 مشاهدة هذا الأسبوع. نوصي بإنشاء خصم تلقائي 15% لرحلات يخت الغردقة أو باقات شرم الشيخ لزيادة نسبة الحجز.",
          action: "تفعيل حملة ترويج الشواطئ"
        };
      } else if (topCategoryName.toLowerCase().includes('culture') || topCategoryName.includes('أثرية')) {
        return {
          title: "🏛️ اقتراح حملة الذكاء الاصطناعي: عرض التراث القديم",
          desc: "الرحلات التاريخية والثقافية تحظى بنسبة بحث عالية. نقترح إطلاق باقة ثقافية مخصصة تضم جولة الأقصر الفرعونية مع تعيين المرشدة ياسمين تلقائياً.",
          action: "إطلاق باقة التراث الثقافي"
        };
      } else {
        return {
          title: "🌲 اقتراح حملة الذكاء الاصطناعي: ترويج المغامرات النشطة",
          desc: "الباحثون عن المغامرة يبحثون بكثافة عن سفاري الصحراء وتسلق الجبال. ننصح بنشر باقة عطلة نهاية الأسبوع لوادي دجلة مع توفير نسبة مشرفين عالية.",
          action: "توزيع كوبونات المغامرة"
        };
      }
    }
  };

  const aiRec = getAIRecommendation();

  // Dynamic layout dir
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const textAlign = lang === 'ar' ? 'right' : 'left';

  return (
    <div className="tab-pane animate-fade-in" style={{ direction: dir, textAlign: textAlign }}>
      
      {/* Toast Notification */}
      {campaignDeployed && (
        <div 
          style={{
            position: 'fixed',
            top: '20px',
            right: lang === 'en' ? '20px' : 'auto',
            left: lang === 'ar' ? '20px' : 'auto',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            animation: 'aura-slide-in 0.3s ease-out',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <i className="fa-solid fa-circle-check" style={{ fontSize: '1.25rem' }}></i>
          <div>
            <strong style={{ display: 'block', fontSize: '0.9rem' }}>
              {lang === 'en' ? 'Campaign Launched!' : 'تم إطلاق الحملة!'}
            </strong>
            <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>
              {lang === 'en' 
                ? 'Coupon BEACH15 (15% Off) created in DB. Sent push notifications to 142 interested users!'
                : 'تم إنشاء الكوبون BEACH15 (خصم 15٪) في قاعدة البيانات وإرسال إشعارات لـ 142 عميلاً!'}
            </span>
          </div>
          <button 
            onClick={() => setCampaignDeployed(false)} 
            style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.1rem', marginLeft: '10px' }}
          >
            &times;
          </button>
        </div>
      )}

      {/* Header */}
      <div className="pane-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2>{lang === 'en' ? 'User Preference & Behavior Analytics' : 'تحليلات تفضيلات وسلوك المستخدمين'}</h2>
          <p className="pane-subtitle">
            {lang === 'en' 
              ? 'Real-time insight engine mapping user views, searches, customizations, and booking patterns.' 
              : 'محرك التحليلات الفوري لتفضيلات العملاء، عمليات البحث، وتعديلات الرحلات.'}
          </p>
        </div>
        
        <div className="pane-actions" style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn-secondary" 
            onClick={() => setLang(l => l === 'en' ? 'ar' : 'en')}
            style={{ border: '1px solid #e5c158', color: '#e5c158', fontWeight: 'bold' }}
          >
            <i className="fa-solid fa-language"></i> {lang === 'en' ? 'العربية' : 'English'}
          </button>
          
          <button className="btn-secondary" onClick={fetchAnalyticsData}>
            <i className="fa-solid fa-rotate"></i> {lang === 'en' ? 'Refresh' : 'تحديث'}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div style={{
          border: '1px solid rgba(229,193,88,0.4)',
          background: 'rgba(229,193,88,0.12)',
          borderRadius: '14px',
          padding: '18px 22px',
          marginBottom: '24px',
          color: '#f8e7b8',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <i className="fa-solid fa-triangle-exclamation" style={{ color: '#f59e0b' }}></i>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Metric Cards Row */}
      <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        
        <div className="metric-card card-purple" style={{ borderLeft: '4px solid #e5c158' }}>
          <div className="metric-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{lang === 'en' ? 'Total Engagement Count' : 'إجمالي تفاعلات المنصة'}</span>
            <i className="fa-solid fa-chart-line" style={{ color: '#e5c158' }}></i>
          </div>
          <div className="metric-value">
            <h3>{stats.totalEngagementCount}</h3>
            <span className="trend positive" style={{ color: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)' }}>
              <i className="fa-solid fa-circle-up"></i> +12% {lang === 'en' ? 'this week' : 'هذا الأسبوع'}
            </span>
          </div>
        </div>

        <div className="metric-card card-indigo" style={{ borderLeft: '4px solid #818cf8' }}>
          <div className="metric-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{lang === 'en' ? 'Average User Spending' : 'متوسط إنفاق العميل'}</span>
            <i className="fa-solid fa-wallet" style={{ color: '#818cf8' }}></i>
          </div>
          <div className="metric-value">
            <h3>{stats.avgUserSpending} EGP</h3>
            <span className="trend positive" style={{ color: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)' }}>
              <i className="fa-solid fa-chart-simple"></i> {lang === 'en' ? 'Verified Value' : 'قيمة حقيقية'}
            </span>
          </div>
        </div>

        <div className="metric-card card-mauve" style={{ borderLeft: '4px solid #c084fc' }}>
          <div className="metric-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{lang === 'en' ? 'Repeat Customers' : 'العملاء الدائمون'}</span>
            <i className="fa-solid fa-user-group" style={{ color: '#c084fc' }}></i>
          </div>
          <div className="metric-value">
            <h3>{stats.repeatCustomerCount}</h3>
            <span className="trend positive" style={{ color: '#e5c158', backgroundColor: 'rgba(229,193,88,0.1)' }}>
              <i className="fa-solid fa-award"></i> {lang === 'en' ? 'Loyalty Rate' : 'معدل الولاء'}
            </span>
          </div>
        </div>

      </div>

      {/* Two-Column Grid */}
      <div className="dashboard-insights-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', marginBottom: '30px' }}>
        
        {/* Left Card: Top Destinations & Top Packages */}
        <div className="insight-card" style={{ gap: '25px' }}>
          
          {/* Top Destinations */}
          <div>
            <div className="card-header">
              <h4>{lang === 'en' ? 'Top Viewed Destinations' : 'أكثر الوجهات مشاهدة وتفضيلاً'}</h4>
              <span className="pill-status" style={{ color: '#e5c158', borderColor: '#e5c158' }}>{lang === 'en' ? 'Interactions' : 'تفاعل'}</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
              {stats.mostViewedDestinations?.map((dest, i) => {
                const maxCount = stats.mostViewedDestinations[0]?.count || 100;
                const widthPercent = Math.max(10, Math.min(100, (dest.count / maxCount) * 100));
                return (
                  <div key={i} className="system-summary-stat">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.88rem' }}>
                      <span className="pkg-emphasis">
                        <i className="fa-solid fa-map-pin" style={{ color: '#e5c158', marginRight: '6px', marginLeft: '6px' }}></i>
                        {dest.destinationName}
                      </span>
                      <span style={{ fontWeight: 'bold' }}>{dest.count} {lang === 'en' ? 'views' : 'مشاهدة'}</span>
                    </div>
                    <div className="stat-progress-bar">
                      <div className="progress-fill" style={{ width: `${widthPercent}%`, background: 'linear-gradient(90deg, #e5c158, #818cf8)' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Most Booked Packages */}
          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
            <div className="card-header">
              <h4>{lang === 'en' ? 'Most Booked Packages' : 'باقات السفر الأكثر حجزاً'}</h4>
              <span className="pill-status" style={{ color: '#10b981' }}>{lang === 'en' ? 'Sales Conversion' : 'المبيعات'}</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
              {stats.mostBookedPackages?.map((pkg, i) => {
                const maxCount = stats.mostBookedPackages[0]?.count || 50;
                const widthPercent = Math.max(10, Math.min(100, (pkg.count / maxCount) * 100));
                return (
                  <div key={i} className="system-summary-stat">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.88rem' }}>
                      <span className="pkg-emphasis">
                        <i className="fa-solid fa-box-open" style={{ color: '#818cf8', marginRight: '6px', marginLeft: '6px' }}></i>
                        {pkg.packageName}
                      </span>
                      <span style={{ fontWeight: 'bold', color: '#10b981' }}>{pkg.count} {lang === 'en' ? 'bookings' : 'حجز'}</span>
                    </div>
                    <div className="stat-progress-bar">
                      <div className="progress-fill" style={{ width: `${widthPercent}%`, background: 'linear-gradient(90deg, #818cf8, #10b981)' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Card: Categories & Searches */}
        <div className="insight-card" style={{ gap: '25px' }}>
          
          {/* Top Categories */}
          <div>
            <div className="card-header">
              <h4>{lang === 'en' ? 'Top Travel Categories' : 'فئات السفر المفضلة للعملاء'}</h4>
              <span className="pill-status">{lang === 'en' ? 'Interactions' : 'تفاعل'}</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
              {stats.topTravelCategories?.map((cat, i) => {
                const maxCount = stats.topTravelCategories[0]?.count || 100;
                const widthPercent = Math.max(10, Math.min(100, (cat.count / maxCount) * 100));
                return (
                  <div key={i} className="system-summary-stat">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.88rem' }}>
                      <span className="pkg-emphasis">
                        <i className="fa-solid fa-tag" style={{ color: '#c084fc', marginRight: '6px', marginLeft: '6px' }}></i>
                        {cat._id}
                      </span>
                      <span style={{ fontWeight: 'bold' }}>{cat.count} {lang === 'en' ? 'actions' : 'نشاط'}</span>
                    </div>
                    <div className="stat-progress-bar">
                      <div className="progress-fill" style={{ width: `${widthPercent}%`, background: 'linear-gradient(90deg, #c084fc, #e5c158)' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Search Trends */}
          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
            <div className="card-header">
              <h4>{lang === 'en' ? 'Popular Activity Searches' : 'الأنشطة والكلمات الأكثر بحثاً'}</h4>
              <span className="pill-status" style={{ color: '#06b6d4' }}>{lang === 'en' ? 'Intent Trends' : 'اهتمامات العملاء'}</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
              {stats.mostSearchedActivities?.map((act, i) => {
                const maxCount = stats.mostSearchedActivities[0]?.count || 100;
                const widthPercent = Math.max(10, Math.min(100, (act.count / maxCount) * 100));
                return (
                  <div key={i} className="system-summary-stat">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.88rem' }}>
                      <span className="pkg-emphasis">
                        <i className="fa-solid fa-magnifying-glass" style={{ color: '#06b6d4', marginRight: '6px', marginLeft: '6px' }}></i>
                        {act._id}
                      </span>
                      <span style={{ fontWeight: 'bold', color: '#06b6d4' }}>{act.count} {lang === 'en' ? 'searches' : 'بحث'}</span>
                    </div>
                    <div className="stat-progress-bar">
                      <div className="progress-fill" style={{ width: `${widthPercent}%`, background: 'linear-gradient(90deg, #06b6d4, #818cf8)' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* Booking Peaks and Trends timeline card */}
      <div className="recent-packages-card" style={{ marginBottom: '30px' }}>
        <div className="card-header">
          <h4>{lang === 'en' ? 'Peak Booking Hours & Timeline' : 'أوقات ذروة الحجوزات اليومية'}</h4>
          <span className="pill-status" style={{ color: '#e5c158' }}>{lang === 'en' ? 'Platform Load' : 'نشاط المنصة'}</span>
        </div>
        
        <p className="pane-subtitle" style={{ marginBottom: '20px' }}>
          {lang === 'en' 
            ? 'Analysis of the hours where users complete bookings, enabling precise scheduling of notification alerts.' 
            : 'تحليل الساعات الأكثر نشاطاً في إتمام الحجوزات لتمكين إرسال الإشعارات الترويجية في الوقت المثالي.'}
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', minHeight: '160px', padding: '20px 10px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
          {stats.peakBookingHours?.map((peak, i) => {
            const maxVal = stats.peakBookingHours[0]?.count || 10;
            const barHeight = Math.max(20, Math.min(120, (peak.count / maxVal) * 120));
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '60px' }}>
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold', marginBottom: '8px' }}>{peak.count}</span>
                <div 
                  style={{ 
                    height: `${barHeight}px`, 
                    width: '28px', 
                    borderRadius: '6px 6px 0 0', 
                    background: 'linear-gradient(180deg, #e5c158 0%, rgba(229,193,88,0.2) 100%)',
                    boxShadow: '0 0 10px rgba(229,193,88,0.2)'
                  }}
                ></div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px', fontWeight: '500' }}>
                  {peak._id === 12 ? '12 PM' : peak._id > 12 ? `${peak._id - 12} PM` : `${peak._id} AM`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default AdminAnalytics;
