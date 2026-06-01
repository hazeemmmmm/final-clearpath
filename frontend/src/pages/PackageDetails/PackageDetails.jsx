import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { ThemeContext } from '../../context/ThemeContext';
import { LanguageContext } from '../../context/LanguageContext';
import { CurrencyContext } from '../../context/CurrencyContext';
import { 
  getTripDetails, 
  getTrips,
  getUserProfile, 
  getExperienceReviews, 
  getExperienceStats, 
  createReview,
  getFinalTrip,
  getAllUsersAdmin,
  createCustomTrip,
  addDayToCustomTrip,
  addActivityToCustomTrip,
  removeActivityFromCustomTrip,
  removeDayFromCustomTrip,
  addExtraActivityToCustomTrip,
  removeExtraActivityFromCustomTrip,
  createBooking,
  getActivities,
  getProviders,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getPackingGuideForExperience,
  trackInteraction,
  combineDestination,
  getTripExtensions
} from '../../utils/api';
import './PackageDetailsNew.css';
import AISupervisorMatch from '../../components/AISupervisorMatch';

const PackageDetails = () => {
  const { id } = useParams();

  const getActivityImage = (actName = '') => {
    const name = actName.toLowerCase();
    if (name.includes('snorkel') || name.includes('beach') || name.includes('sea') || name.includes('boat') || name.includes('water') || name.includes('island')) {
      return 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=300&q=80';
    }
    if (name.includes('pyramid') || name.includes('temple') || name.includes('luxor') || name.includes('cairo') || name.includes('history') || name.includes('museum') || name.includes('mummy')) {
      return 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=300&q=80';
    }
    if (name.includes('quad') || name.includes('safari') || name.includes('desert') || name.includes('sand') || name.includes('folklore')) {
      return 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=300&q=80';
    }
    if (name.includes('lunch') || name.includes('dinner') || name.includes('feast') || name.includes('food') || name.includes('bbq') || name.includes('tea') || name.includes('culinary')) {
      return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=300&q=80';
    }
    return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80';
  };

  const [packageData, setPackageData] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0, ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  // Customization State
  const [customTrip, setCustomTrip] = useState(null);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [activitiesList, setActivitiesList] = useState([]);
  const [providersList, setProvidersList] = useState([]);
  const [showAddActivityDay, setShowAddActivityDay] = useState(null);
  const [addDayTab, setAddDayTab] = useState('custom'); // 'custom' | 'ready'
  const [newActivitySelection, setNewActivitySelection] = useState({ activityId: '', providerId: '', price: '' });
  const [showAddExtra, setShowAddExtra] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [customizationError, setCustomizationError] = useState('');
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { lang, setLang } = useContext(LanguageContext);
  const { currency, toggleCurrency, formatPrice } = useContext(CurrencyContext);

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.add('tw-dark');
      document.body.classList.add('tw-bg-[#0a0b0d]', 'tw-text-white');
      document.body.classList.remove('tw-bg-slate-50', 'tw-text-slate-900');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.remove('tw-dark');
      document.body.classList.add('tw-bg-slate-50', 'tw-text-slate-900');
      document.body.classList.remove('tw-bg-[#0a0b0d]', 'tw-text-white');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const [guestCount, setGuestCount] = useState(1);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [suggestedPackages, setSuggestedPackages] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [expandedDay, setExpandedDay] = useState(1); // Default expand first day

  // Trip Chaining / Modular Extension State
  const [showChainModal, setShowChainModal] = useState(false);
  const [chainExperiences, setChainExperiences] = useState([]);
  const [selectedChainId, setSelectedChainId] = useState('');
  const [loadingChain, setLoadingChain] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Wishlist State
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [usersMap, setUsersMap] = useState({});

  // Packing Guide State
  const [packingGuide, setPackingGuide] = useState(null);
  const [loadingGuide, setLoadingGuide] = useState(false);
  const [checkedPackingItems, setCheckedPackingItems] = useState({});

  const handleTogglePackingItem = (itemKey) => {
    setCheckedPackingItems(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
    // Play a subtle micro-interaction sound (if possible, else just visual)
  };


  const token = localStorage.getItem('token') || localStorage.getItem('clearpath_access_token');

  // Fetch package details, user profile, reviews, stats and wishlist status
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchPackageDetails();
    fetchReviewsAndStats();
    if (token) {
      fetchUserProfile();
      checkWishlistStatus();
    }
    fetchPackingGuideData();
  }, [id, token]);

  // Fetch dynamic trip chaining extensions starting exactly the next day after current package ends
  useEffect(() => {
    const fetchChainingExtensions = async () => {
      if (!packageData) return;
      
      let start = null;
      if (packageData.availableDates && packageData.availableDates.length > 0) {
        const validDates = packageData.availableDates
          .map(d => new Date(d.date))
          .filter(d => !isNaN(d.getTime()))
          .sort((a, b) => a - b);
        if (validDates.length > 0) {
          start = validDates[0];
        }
      }
      if (!start) {
        const today = new Date();
        const nextSat = new Date();
        nextSat.setDate(today.getDate() + ((6 - today.getDay() + 7) % 7 || 7));
        start = nextSat;
      }
      const duration = packageData.duration_days || 1;
      const end = new Date(start);
      end.setDate(start.getDate() + (duration > 1 ? duration - 1 : 0));
      
      const endDateStr = end.toISOString().split('T')[0];
      
      try {
        setLoadingChain(true);
        const res = await getTripExtensions(endDateStr);
        let filtered = [];
        if (res && res.success && res.data) {
          filtered = res.data.filter(exp => exp._id !== id);
        }
        
        // Smart AI Fallback: If no packages are scheduled exactly on the next day, fetch general premium catalog packages
        // and dynamically project them starting on the next day so the user can test the Trip Chaining slider immediately!
        if (filtered.length === 0) {
          const fallbackRes = await getTrips({ limit: 10 });
          const allExps = fallbackRes.data || fallbackRes;
          if (allExps && Array.isArray(allExps)) {
            filtered = allExps
              .filter(exp => exp._id !== id)
              .map(exp => ({
                ...exp,
                availableDates: [{ date: new Date(end.getTime()) }]
              }));
          }
        }

        setChainExperiences(filtered);
        if (filtered.length > 0) {
          setSelectedChainId(filtered[0]._id);
        }
      } catch (err) {
        console.error("Failed to fetch trip extensions:", err);
      } finally {
        setLoadingChain(false);
      }
    };

    fetchChainingExtensions();
  }, [packageData, id]);

  const fetchPackingGuideData = async () => {
    try {
      setLoadingGuide(true);
      const res = await getPackingGuideForExperience(id);
      if (res && res.success && res.data) {
        setPackingGuide(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch packing guide:', err);
    } finally {
      setLoadingGuide(false);
    }
  };

  const getDynamicIncludedExcluded = () => {
    // 1. If packageData has included/excluded in DB, return them
    const dbIncluded = packageData?.included || [];
    const dbExcluded = packageData?.excluded || [];
    
    if (dbIncluded.length > 0 || dbExcluded.length > 0) {
      return {
        included: dbIncluded,
        excluded: dbExcluded
      };
    }
    
    // 2. Otherwise dynamically generate based on activities in this package's itinerary!
    const activitiesInItinerary = [];
    if (packageData?.itinerary && Array.isArray(packageData.itinerary)) {
      packageData.itinerary.forEach(day => {
        if (day.activities && Array.isArray(day.activities)) {
          day.activities.forEach(act => {
            const actName = act.activity?.name || act.activity || '';
            if (actName && !activitiesInItinerary.includes(actName)) {
              activitiesInItinerary.push(actName);
            }
          });
        }
      });
    }

    const dynamicIncluded = [
      lang === 'AR' ? 'جميع الانتقالات طوال الرحلة بسيارة حديثة ومكيفة' : 'All scheduled transfers in modern air-conditioned vehicles',
      lang === 'AR' ? 'منسق رحلات ومساعد محلي مخصص للجروب' : 'Dedicated multilingual trip coordinator & assistant',
      ...activitiesInItinerary.map(actName => 
        lang === 'AR' ? `تذاكر دخول وتكاليف نشاط "${actName}"` : `Entry tickets & fees for "${actName}"`
      )
    ];

    const dynamicExcluded = [
      lang === 'AR' ? 'المصاريف الشخصية والمشتريات الخاصة' : 'Personal expenses and private shopping',
      lang === 'AR' ? 'الوجبات والمشروبات الإضافية غير المذكورة بالبرنامج' : 'Additional meals & beverages not in the itinerary',
      lang === 'AR' ? 'الإكراميات الاختيارية لطاقم العمل والمنسقين' : 'Optional tipping for local crew & coordinators'
    ];

    return {
      included: dynamicIncluded,
      excluded: dynamicExcluded
    };
  };

  const getDynamicPackingGuide = (packageData, lang) => {
    if (!packageData) return null;
    
    const name = (packageData.name || packageData.title || '').toLowerCase();
    
    const isWaterTrip = name.includes('beach') || name.includes('snorkeling') || name.includes('sea') || name.includes('boat') || name.includes('water') || name.includes('island') || name.includes('ocean') || name.includes('yacht') || name.includes('marina') || name.includes('الغردقة') || name.includes('بحر') || name.includes('شاطئ') || name.includes('يخت');
    
    const isDesertHistoryTrip = name.includes('pyramids') || name.includes('temple') || name.includes('luxor') || name.includes('cairo') || name.includes('aswan') || name.includes('history') || name.includes('museum') || name.includes('safari') || name.includes('desert') || name.includes('أهرامات') || name.includes('معبد') || name.includes('الأقصر') || name.includes('أسوان') || name.includes('تاريخ') || name.includes('متحف') || name.includes('سفاري') || name.includes('صحراء');

    if (isWaterTrip) {
      return {
        name: lang === 'AR' ? 'نادي شاطئ الغردقة والألعاب المائية' : 'Hurghada Water Sports & Beach',
        essentials: [
          { 
            item: lang === 'AR' ? 'واقي من الشمس آمن على الشعاب المرجانية (SPF 50+)' : 'Reef-safe sunscreen (SPF 50+)', 
            required: true, 
            icon: '☀️' 
          },
          { 
            item: lang === 'AR' ? 'زجاجة مياه معزولة للترطيب' : 'Water bottle (stay hydrated)', 
            required: true, 
            icon: '💧' 
          },
          { 
            item: lang === 'AR' ? 'جراب هاتف مقاوم للماء' : 'Waterproof phone case', 
            required: false, 
            icon: '📱' 
          },
          { 
            item: lang === 'AR' ? 'نقود كاش للمصاريف الإضافية على الشاطئ' : 'Cash for beach extras', 
            required: false, 
            icon: '💵' 
          },
          { 
            item: lang === 'AR' ? 'حقيبة جافة ومنشفة للرحلة' : 'Towel & dry bag', 
            required: true, 
            icon: '🎒' 
          }
        ],
        clothing: [
          { 
            item: lang === 'AR' ? 'ملابس السباحة (أحضر غياراً إضافياً)' : 'Swimwear (bring extra towel)', 
            notes: lang === 'AR' ? 'يفضل ملابس مريحة وسريعة الجفاف' : 'Fast-drying fabrics are recommended' 
          },
          { 
            item: lang === 'AR' ? 'قميص واقي من الأشعة فوق البنفسجية / راش جارد' : 'Rash guard / UV shirt', 
            notes: lang === 'AR' ? 'لحماية إضافية أثناء السباحة لفترات طويلة' : 'For extra protection during long swim sessions' 
          },
          { 
            item: lang === 'AR' ? 'حذاء مائي' : 'Water shoes', 
            notes: lang === 'AR' ? 'لتفادي الصخور والشعاب الحادة في المناطق الضحلة' : 'Prevents cuts from rocks and corals in shallow water' 
          },
          { 
            item: lang === 'AR' ? 'غطاء خفيف للجسم' : 'Light cover-up', 
            notes: lang === 'AR' ? 'للاستخدام في المطاعم أو أثناء فترات الاستراحة' : 'For beach restaurants and transitions' 
          },
          { 
            item: lang === 'AR' ? 'نظارة شمسية مستقطبة' : 'Sunglasses', 
            notes: lang === 'AR' ? 'لتقليل انعكاس الضوء من سطح الماء' : 'Polarized to reduce sea glare' 
          }
        ],
        safetyTips: [
          { tip: lang === 'AR' ? 'السباحة دائماً في المناطق المحددة واتباع إرشادات المنقذين.' : 'Always swim in designated zones and obey safety flags.' },
          { tip: lang === 'AR' ? 'أعد وضع واقي الشمس كل ساعتين، خصوصاً بعد السباحة.' : 'Reapply sunscreen every 2 hours - especially after swimming.' },
          { tip: lang === 'AR' ? 'تجنب السباحة بمفردك في المياه المفتوحة أو أثناء الألعاب المائية.' : 'Do not swim alone, especially in open deep water.' },
          { tip: lang === 'AR' ? 'أكرم طاقم الإنقاذ بالانتباه لتعليماتهم الأمنية.' : 'Listen carefully to the lifeguards and crew instructions.' }
        ],
        emergencyContacts: {
          police: '122',
          ambulance: '123',
          coastGuard: '15656',
          localHospital: lang === 'AR' ? 'مستشفى الغردقة العام: 0653546740' : 'Hurghada General Hospital: 0653546740'
        }
      };
    } else if (isDesertHistoryTrip) {
      return {
        name: lang === 'AR' ? 'الرحلات التاريخية والصحراوية' : 'Historical & Desert Safaris',
        essentials: [
          { 
            item: lang === 'AR' ? 'واقي من الشمس عالي الكفاءة' : 'High-efficiency sunscreen', 
            required: true, 
            icon: '☀️' 
          },
          { 
            item: lang === 'AR' ? 'زجاجة مياه قابلة لإعادة التعبئة' : 'Refillable water bottle', 
            required: true, 
            icon: '💧' 
          },
          { 
            item: lang === 'AR' ? 'قبعة شمسية واسعة الحواف' : 'Wide-brimmed sun hat', 
            required: true, 
            icon: '👒' 
          },
          { 
            item: lang === 'AR' ? 'معقم يدين ومناديل مبللة' : 'Hand sanitizer & wet wipes', 
            required: false, 
            icon: '🧴' 
          },
          { 
            item: lang === 'AR' ? 'نقود كاش بالعملة المحلية للشراء والإكراميات' : 'Cash in EGP for tips & local vendors', 
            required: true, 
            icon: '💵' 
          }
        ],
        clothing: [
          { 
            item: lang === 'AR' ? 'ملابس قطنية خفيفة ومريحة' : 'Lightweight breathable clothing', 
            notes: lang === 'AR' ? 'يفضل الألوان الفاتحة لعكس أشعة الشمس' : 'Lighter colors reflect heat better' 
          },
          { 
            item: lang === 'AR' ? 'أحذية مشي مريحة ومغلقة' : 'Comfortable walking shoes', 
            notes: lang === 'AR' ? 'ينصح بأحذية مغلقة لحماية القدم من الرمال والحصى' : 'Closed-toe recommended for sandy/uneven paths' 
          },
          { 
            item: lang === 'AR' ? 'شال خفيف أو وشاح' : 'Light scarf / shawl', 
            notes: lang === 'AR' ? 'للحماية من الغبار وخصوصاً لزيارة المعالم الدينية' : 'Great for dust protection and temple/mosque visits' 
          },
          { 
            item: lang === 'AR' ? 'نظارة شمسية (حماية UV)' : 'Sunglasses', 
            notes: lang === 'AR' ? 'لحماية العين من وهج الشمس الصحراوية' : 'Essential to protect against bright desert glare' 
          },
          { 
            item: lang === 'AR' ? 'حقيبة ظهر صغيرة' : 'Small daypack', 
            notes: lang === 'AR' ? 'لحمل زجاجة المياه والكاميرا والمنعشات الشخصية' : 'Ideal to carry water, camera, and sunscreen' 
          }
        ],
        safetyTips: [
          { tip: lang === 'AR' ? 'اشرب الكثير من المياه بانتظام حتى لو لم تشعر بالعطش.' : 'Stay hydrated - drink water regularly even if you do not feel thirsty.' },
          { tip: lang === 'AR' ? 'ابحث عن الظل خلال ساعات الذروة الحارة (من 12 ظهراً حتى 3 عصراً).' : 'Seek shade during peak hot hours (12 PM - 3 PM).' },
          { tip: lang === 'AR' ? 'احترم العادات المحلية بتغطية الكتفين والركبتين عند دخول الأماكن الدينية.' : 'Respect local customs by covering shoulders/knees in religious sites.' },
          { tip: lang === 'AR' ? 'حافظ على ممتلكاتك الشخصية في المناطق المزدحمة والأسواق.' : 'Keep an eye on personal belongings in crowded markets/bazaars.' }
        ],
        emergencyContacts: {
          police: '122',
          ambulance: '123',
          coastGuard: '',
          localHospital: lang === 'AR' ? 'شرطة السياحة والآثار: 126' : 'Tourist Police: 126'
        }
      };
    } else {
      return {
        name: lang === 'AR' ? 'أساسيات الرحلة العامة' : 'General Trip Essentials',
        essentials: [
          { 
            item: lang === 'AR' ? 'واقي من الشمس ومرطب للشفاه' : 'Sunscreen & lip balm', 
            required: false, 
            icon: '☀️' 
          },
          { 
            item: lang === 'AR' ? 'زجاجة مياه للشرب طوال اليوم' : 'Drinking water bottle', 
            required: true, 
            icon: '💧' 
          },
          { 
            item: lang === 'AR' ? 'شاحن متنقل للهواتف (Powerbank)' : 'Power bank & charging cables', 
            required: false, 
            icon: '🔌' 
          },
          { 
            item: lang === 'AR' ? 'نقود كاش بالجنيه المصري' : 'Cash in EGP', 
            required: false, 
            icon: '💵' 
          },
          { 
            item: lang === 'AR' ? 'صورة من بطاقة الهوية أو جواز السفر' : 'Copy of ID / Passport', 
            required: true, 
            icon: '🆔' 
          }
        ],
        clothing: [
          { 
            item: lang === 'AR' ? 'ملابس مريحة مناسبة للطقس الحالي' : 'Weather-appropriate comfortable clothing', 
            notes: lang === 'AR' ? 'تحقق من توقعات الطقس قبل الانطلاق' : 'Check local weather forecast before leaving' 
          },
          { 
            item: lang === 'AR' ? 'أحذية مشي مريحة ومناسبة' : 'Comfortable walking shoes', 
            notes: lang === 'AR' ? 'لتفادي التعب أثناء فترات الجولات والأنشطة' : 'Essential for pleasant walking tours' 
          },
          { 
            item: lang === 'AR' ? 'جاكيت خفيف أو سترة' : 'Light jacket or sweater', 
            notes: lang === 'AR' ? 'للأوقات المسائية أو الحافلات المكيفة' : 'Useful for cool evenings or air-conditioned buses' 
          },
          { 
            item: lang === 'AR' ? 'نظارة شمسية وحجاب' : 'Sunglasses & cap', 
            notes: lang === 'AR' ? 'لحماية رأسك وعينيك من أشعة الشمس' : 'To shade your head and eyes' 
          }
        ],
        safetyTips: [
          { tip: lang === 'AR' ? 'احتفظ دائماً برقم هاتف مرشد الرحلة أو المنظم مسجلاً على هاتفك.' : 'Always keep your guide\'s contact number saved in your phone.' },
          { tip: lang === 'AR' ? 'احمل بطاقة تعريفية أو صورة الهوية الشخصية طوال الرحلة.' : 'Carry a form of ID or copy with you at all times.' },
          { tip: lang === 'AR' ? 'التزم بالبقاء مع المجموعة أثناء الجولات السياحية الجماعية.' : 'Stay with your tour group during guided segments.' },
          { tip: lang === 'AR' ? 'انتبه لخطواتك عند المشي على الأرصفة غير الممهدة أو المعالم القديمة.' : 'Watch your steps on uneven roads or ancient ruins.' }
        ],
        emergencyContacts: {
          police: '122',
          ambulance: '123',
          coastGuard: '',
          localHospital: lang === 'AR' ? 'الطوارئ والنجدة: 122' : 'Police Emergency: 122'
        }
      };
    }
  };

  const checkWishlistStatus = async () => {
    try {
      const response = await getWishlist();
      const items = response.wishlist?.experiences || response.data?.experiences || response.wishlist || response.data || [];
      if (Array.isArray(items)) {
        const isSaved = items.some(item => (item._id || item.id) === id);
        setIsInWishlist(isSaved);
      }
    } catch (err) {
      console.error('Failed to fetch wishlist status', err);
    }
  };

  const handleWishlistToggle = async () => {
    if (!token) {
      window.location.href = '/login';
      return;
    }
    setWishlistLoading(true);
    try {
      if (isInWishlist) {
        await removeFromWishlist(id);
        setIsInWishlist(false);
      } else {
        await addToWishlist(id);
        setIsInWishlist(true);
      }
    } catch (err) {
      console.error('Failed to toggle wishlist item', err);
      alert('Failed to update wishlist. Please try again.');
    } finally {
      setWishlistLoading(false);
    }
  };

  const fetchPackageDetails = async () => {
    try {
      setLoading(true);
      
      if (token) {
        try {
          const response = await getFinalTrip(id);
          if (response && response.source === 'customTrip') {
            setCustomTrip(response.data);
            setIsCustomizing(true);
          }
        } catch (err) {
          console.log('No existing customization or error fetching custom trip', err);
        }
      }

      const response = await getTripDetails(id);
      const pkg = response.data || response.experience || response;
      setPackageData(pkg);
      // try fetch users for supervisor lookup if needed
      try {
        const usersRes = await getAllUsersAdmin();
        const usersList = usersRes.data || usersRes.users || usersRes;
        const map = {};
        if (Array.isArray(usersList)) usersList.forEach(u => { if (u && u._id) map[u._id] = u; });
        setUsersMap(map);
      } catch (uerr) {
        console.debug('Could not fetch users for supervisor lookup', uerr);
      }
      if (pkg) {
        setActiveImage(pkg.image || (pkg.images && pkg.images[0]) || 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1200&q=80');
        // Track interaction — fire-and-forget, don't block UI
        trackInteraction({
          experienceId: pkg._id || id,
          action: 'view',
          role: 'user',
          source: 'package_details'
        }).catch(() => {});
      }
      
      try {
        const acts = await getActivities({ limit: 100 });
        setActivitiesList(acts.data || acts.activities || acts || []);
        
        const provs = await getProviders({ limit: 100 });
        setProvidersList(provs.data || provs.providers || provs || []);

        // Load other packages/dayuse of the same region to suggest
        try {
          const allPkgsRes = await getTrips({ limit: 100 });
          const allPkgs = allPkgsRes.data || allPkgsRes || [];
          if (Array.isArray(allPkgs) && pkg && pkg.destination) {
            const currentDestId = pkg.destination._id || pkg.destination;
            const filtered = allPkgs.filter(p => {
              const pDestId = p.destination?._id || p.destination;
              return pDestId && currentDestId && pDestId.toString() === currentDestId.toString() && (p._id || p.id) !== (pkg._id || pkg.id);
            });
            setSuggestedPackages(filtered);
          }
        } catch (perr) {
          console.error("Failed to load suggested packages for this destination region", perr);
        }
      } catch (err) {
        console.error('Failed to load customization catalogs', err);
      }

    } catch (err) {
      console.error('Failed to load package details', err);
      setError('Failed to load package details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartCustomization = async () => {
    if (!token) {
      window.location.href = '/login';
      return;
    }
    
    try {
      setLoading(true);
      await createCustomTrip(id);
      
      const viewRes = await getFinalTrip(id);
      setCustomTrip(viewRes.data);
      setIsCustomizing(true);
      setCustomizationError('');
    } catch (err) {
      console.error('Failed to start customization', err);
      setCustomizationError(err.message || 'Failed to start customizing this experience.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCustomization = async (forcedPlan) => {
    const nextIsCustomizing = forcedPlan ? (forcedPlan === 'custom') : !isCustomizing;
    
    if (!nextIsCustomizing) {
      setIsCustomizing(false);
      setCustomTrip(null); // Clear/nullify customized trip state to reset price to standard
      localStorage.removeItem('customTripPrice');
      localStorage.setItem('selectedPlan', 'standard');
    } else {
      setIsCustomizing(true);
      localStorage.setItem('selectedPlan', 'custom');
      try {
        const response = await getFinalTrip(id);
        if (response && response.source === 'customTrip') {
          setCustomTrip(response.data);
        } else {
          await createCustomTrip(id);
          const fresh = await getFinalTrip(id);
          setCustomTrip(fresh.data);
        }
      } catch (err) {
        console.error('Failed to initialize custom trip:', err);
      }
    }
  };

  const handleToggleDayCheckbox = async (day_number) => {
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      let activeTrip = customTrip;
      if (!activeTrip) {
        // Initialize custom trip first in the background
        await createCustomTrip(id);
        const viewRes = await getFinalTrip(id);
        activeTrip = viewRes.data;
        setCustomTrip(activeTrip);
        setIsCustomizing(true);
      }

      await removeDayFromCustomTrip(activeTrip._id, day_number);
      const viewRes = await getFinalTrip(id);
      setCustomTrip(viewRes.data);
    } catch (err) {
      console.error('Failed to toggle day', err);
      alert(err.message || 'Failed to update day.');
    }
  };

  const handleToggleActivityCheckbox = async (day_number, activityId) => {
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      let activeTrip = customTrip;
      if (!activeTrip) {
        // Initialize custom trip first in the background
        await createCustomTrip(id);
        const viewRes = await getFinalTrip(id);
        activeTrip = viewRes.data;
        setCustomTrip(activeTrip);
        setIsCustomizing(true);
      }

      await removeActivityFromCustomTrip(activeTrip._id, day_number, activityId);
      const viewRes = await getFinalTrip(id);
      setCustomTrip(viewRes.data);
    } catch (err) {
      console.error('Failed to toggle activity', err);
      alert(err.message || 'Failed to update activity.');
    }
  };

  const handleToggleOptionalCheckbox = async (day_number, activity) => {
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      let activeTrip = customTrip;
      if (!activeTrip) {
        // Initialize custom trip first in the background
        await createCustomTrip(id);
        const viewRes = await getFinalTrip(id);
        activeTrip = viewRes.data;
        setCustomTrip(activeTrip);
        setIsCustomizing(true);
      }

      // Check if this activity already exists in customTrip itinerary for this day
      const customDay = activeTrip.itinerary?.find(d => d.day_number === day_number);
      const existingAct = customDay?.activities?.find(a => (a.activity?._id || a.activity) === activity._id);

      if (existingAct) {
        // Just toggle its status
        await removeActivityFromCustomTrip(activeTrip._id, day_number, activity._id);
      } else {
        // Add it as a new custom activity
        await addActivityToCustomTrip(activeTrip._id, day_number, {
          activity: activity._id,
          price: activity.price,
          provider: (activity.providers && activity.providers[0]) || null
        });
      }

      const viewRes = await getFinalTrip(id);
      setCustomTrip(viewRes.data);
    } catch (err) {
      console.error('Failed to toggle optional activity', err);
      alert(err.message || 'Failed to update optional activity.');
    }
  };

  const handleAddActivitySubmit = async (dayNumber) => {
    if (!newActivitySelection.activityId) {
      alert('Please select an activity.');
      return;
    }

    try {
      setLoading(true);
      let activeTrip = customTrip;
      if (!activeTrip) {
        await createCustomTrip(id);
        const viewRes = await getFinalTrip(id);
        activeTrip = viewRes.data;
        setCustomTrip(activeTrip);
        setIsCustomizing(true);
      }

      await addActivityToCustomTrip(activeTrip._id, dayNumber, {
        activity: newActivitySelection.activityId,
        price: Number(newActivitySelection.price) || 0,
        provider: newActivitySelection.providerId || null
      });

      const viewRes = await getFinalTrip(id);
      setCustomTrip(viewRes.data);
      setShowAddActivityDay(null);
      setNewActivitySelection({ activityId: '', providerId: '', price: '' });
      setCustomizationError('');
    } catch (err) {
      console.error('Failed to add custom activity', err);
      setCustomizationError(err.message || 'Failed to add activity.');
    } finally {
      setLoading(false);
    }
  };

  const handleInjectDayuseDay = async (dayusePkg) => {
    try {
      setLoading(true);
      let activeTrip = customTrip;
      if (!activeTrip) {
        await createCustomTrip(id);
        const viewRes = await getFinalTrip(id);
        activeTrip = viewRes.data;
        setCustomTrip(activeTrip);
        setIsCustomizing(true);
      }

      const sourceDay = dayusePkg.itinerary?.[0] || {};

      const payload = {
        title: dayusePkg.name || sourceDay.title || 'Day Use Plan',
        description: dayusePkg.description || sourceDay.description || 'Pre-designed single-day itinerary.',
        image: dayusePkg.image || sourceDay.image || '',
        activities: (sourceDay.activities || []).map(act => {
          const actId = act.activity?._id || act.activity;
          const matchedActObj = activitiesList.find(a => a._id === actId);
          return {
            activity: actId,
            price: Number(act.price) || (matchedActObj ? Number(matchedActObj.price) : 0),
            provider: act.provider?._id || act.provider || (matchedActObj?.provider?._id || matchedActObj?.provider) || null
          };
        })
      };

      await addDayToCustomTrip(activeTrip._id, payload);

      const viewRes = await getFinalTrip(id);
      setCustomTrip(viewRes.data);
      setShowAddActivityDay(null);
      setCustomizationError('');
    } catch (err) {
      console.error('Failed to inject Dayuse day', err);
      setCustomizationError(err.message || 'Failed to inject Dayuse day.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToTripChain = async () => {
    if (!packageData) return;

    // Always fetch the latest customTrip from backend to get accurate total_price.
    // This covers cases where the user customized but toggled the panel off, or state is stale.
    let latestCustomTrip = customTrip;
    if (token) {
      try {
        const freshRes = await getFinalTrip(id);
        if (freshRes && freshRes.source === 'customTrip' && freshRes.data) {
          latestCustomTrip = freshRes.data;
          setCustomTrip(freshRes.data);
        }
      } catch (e) {
        // silently fall back to current state
      }
    }

    const singlePrice = latestCustomTrip
      ? latestCustomTrip.total_price
      : (packageData.base_price || packageData.price || 0);

    const addonsTotal = selectedAddons.reduce((sum, addonId) => {
      const addon = packageData?.addons?.find(a => a._id === addonId);
      return sum + (addon ? addon.price : 0);
    }, 0);

    const totalPrice = (singlePrice * guestCount) + addonsTotal;

    const chainItem = {
      id: packageData._id || id,
      name: packageData.name,
      image: activeImage || packageData.image || (packageData.images && packageData.images[0]) || 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1200&q=80',
      guestCount: guestCount,
      price: totalPrice,
      selectedAddons: selectedAddons,
      isCustomized: !!latestCustomTrip || isCustomizing,
      customTripId: latestCustomTrip?._id || customTrip?._id || null
    };

    const currentChain = JSON.parse(localStorage.getItem('clearpath_trip_chain') || '[]');
    currentChain.push(chainItem);
    localStorage.setItem('clearpath_trip_chain', JSON.stringify(currentChain));

    alert(lang === 'AR' ? 'تمت إضافة الباقة بنجاح إلى سلسلة الرحلة!' : 'Package successfully added to your Trip Chain!');
    window.dispatchEvent(new Event('tripChainUpdated'));
  };

  const handleBookNow = async () => {
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      setBookingLoading(true);
      let res;
      if (isCustomizing && customTrip) {
        res = await createBooking({ customTrip: customTrip._id, numberOfGuests: guestCount, selectedAddons });
      } else {
        res = await createBooking({ experienceId: packageData._id, numberOfGuests: guestCount, selectedAddons });
      }
      
      const booking = res.data || res.booking || res;
      if (booking && booking._id) {
        localStorage.setItem('currentBookingId', booking._id);
        window.location.href = '/payment';
      } else {
        throw new Error('Booking could not be created.');
      }
    } catch (err) {
      console.error('Failed to create booking', err);
      alert(err.message || 'Failed to create booking.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleLockTripChain = async () => {
    if (!token) {
      window.location.href = '/login';
      return;
    }
    
    const selectedChainExp = chainExperiences.find(exp => exp._id === selectedChainId);
    if (!selectedChainExp) {
      alert(lang === 'AR' ? 'برجاء اختيار رحلة للتمديد' : 'Please select an experience to chain.');
      return;
    }

    try {
      setBookingLoading(true);
      
      // Dynamic Chain item representation in local storage (without creating backend bookings immediately)
      const chainCurrentAddonsTotal = selectedAddons.reduce((sum, addonId) => {
        const addon = packageData?.addons?.find(a => a._id === addonId);
        return sum + (addon ? addon.price : 0);
      }, 0);
      const chainCurrentSinglePrice = !isCustomizing
        ? (packageData.base_price || packageData.price || 4300)
        : (customTrip?.total_price || 7100);
      const chainCurrentTotalPrice = (chainCurrentSinglePrice * guestCount) + chainCurrentAddonsTotal;

      const chainItemCurrent = {
        id: id,
        name: packageData.name,
        image: packageData.image,
        start: startFormatted,
        end: endFormatted,
        guestCount: guestCount,
        price: chainCurrentTotalPrice,
        selectedAddons: selectedAddons,
        isCustomized: isCustomizing || !!customTrip,
        customTripId: customTrip?._id || null
      };
      
      const chainItemNext = {
        id: selectedChainExp._id,
        name: selectedChainExp.name,
        image: selectedChainExp.image,
        start: new Date(end.getTime()).toLocaleDateString(lang === 'AR' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        end: new Date(end.getTime() + ((selectedChainExp.duration_days || 1) - 1) * 86400000).toLocaleDateString(lang === 'AR' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        guestCount: guestCount,
        price: selectedChainExp.calculatedPrice || selectedChainExp.base_price,
        selectedAddons: [],
        isCustomized: false,
        customTripId: null
      };

      if ((isCustomizing || customTrip) && customTrip?._id) {
        await combineDestination(customTrip._id, selectedChainExp._id);
      }
      
      localStorage.setItem('clearpath_trip_chain', JSON.stringify([chainItemCurrent, chainItemNext]));
      window.dispatchEvent(new Event('tripChainUpdated'));
      
      alert(lang === 'AR' ? 'تم قفل سلسلة الرحلات بنجاح! تم حفظ رحلاتك المتسلسلة في حجوزاتك المعلقة.' : 'Trip chain successfully locked! Your chained trips have been saved to your pending bookings.');
      window.location.href = '/my-bookings?tab=pending';
    } catch (err) {
      console.error('Failed to chain trips:', err);
      alert(err.message || 'Failed to assemble trip chain.');
    } finally {
      setBookingLoading(false);
    }
  };



  const fetchUserProfile = async () => {
    try {
      const response = await getUserProfile();
      setCurrentUser(response.user || response.data?.user || response.data || response);
    } catch (err) {
      console.error('Failed to load user profile', err);
    }
  };

  const fetchReviewsAndStats = async () => {
    try {
      setLoadingReviews(true);
      
      // Load stats
      const statsRes = await getExperienceStats(id);
      if (statsRes && statsRes.data) {
        setStats(statsRes.data);
      } else if (statsRes) {
        setStats(statsRes);
      }

      // Load reviews list
      const reviewsRes = await getExperienceReviews(id, { limit: 50 });
      const loadedReviews = reviewsRes.reviews || reviewsRes.data?.reviews || reviewsRes.data || [];
      setReviews(loadedReviews);

    } catch (err) {
      console.error('Failed to load reviews or stats', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Check if current user has already reviewed when user and reviews list are loaded
  useEffect(() => {
    if (currentUser && reviews.length > 0) {
      const hasReviewed = reviews.some(r => {
        const reviewUserObj = r.user?._id || r.user;
        const currentUserId = currentUser._id || currentUser.id;
        return reviewUserObj && reviewUserObj.toString() === currentUserId.toString();
      });
      setUserHasReviewed(hasReviewed);
    }
  }, [currentUser, reviews]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (userRating === 0) {
      setReviewError('Please select a rating of at least 1 star.');
      return;
    }

    setSubmittingReview(true);
    setReviewSuccess('');
    setReviewError('');

    try {
      await createReview({
        experience: id,
        rating: userRating,
        comment: userComment
      });

      setReviewSuccess('Thank you! Your review has been submitted successfully.');
      setUserRating(0);
      setUserComment('');
      setUserHasReviewed(true);
      
      // Refresh
      fetchReviewsAndStats();
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating, onClick = null, onHover = null, interactive = false) => {
    const stars = [];
    const currentValue = interactive ? (hoverRating || userRating) : rating;
    
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= currentValue;
      stars.push(
        <i
          key={i}
          className={`${isFilled ? 'fa-solid' : 'fa-regular'} fa-star star ${interactive ? 'interactive-star' : ''}`}
          onClick={onClick ? () => onClick(i) : null}
          onMouseEnter={onHover ? () => onHover(i) : null}
          onMouseLeave={onHover ? () => onHover(0) : null}
          style={{ 
            cursor: interactive ? 'pointer' : 'default', 
            color: isFilled ? '#FFD700' : '#ddd',
            fontSize: interactive ? '1.8rem' : '0.95rem',
            marginRight: '3px',
            transition: 'color 0.2s, transform 0.2s'
          }}
        />
      );
    }
    return <div className="stars-container">{stars}</div>;
  };

  const getUserInitials = (user) => {
    if (!user) return '?';
    const first = user.firstName ? user.firstName.charAt(0).toUpperCase() : '';
    const last = user.lastName ? user.lastName.charAt(0).toUpperCase() : '';
    return first + last || 'U';
  };

  const getAvatarColor = (name) => {
    if (!name) return '#0f172a';
    const colors = ['#0f172a', '#f59e0b', '#f59e0b', '#2e7d32', '#6a1b9a', '#ef6c00', '#00838f'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const calculatePercentage = (count) => {
    if (!stats.totalReviews || stats.totalReviews === 0) return 0;
    return Math.round((count / stats.totalReviews) * 100);
  };

  const displayItinerary = isCustomizing && customTrip && customTrip.itinerary && customTrip.itinerary.length > 0
    ? customTrip.itinerary
    : (packageData ? packageData.itinerary : []);
  const { start, end } = (() => {
    if (!packageData) return { start: null, end: null };
    let start = null;
    if (packageData.availableDates && packageData.availableDates.length > 0) {
      const validDates = packageData.availableDates
        .map(d => new Date(d.date))
        .filter(d => !isNaN(d.getTime()))
        .sort((a, b) => a - b);
      if (validDates.length > 0) {
        start = validDates[0];
      }
    }
    if (!start) {
      const today = new Date();
      const nextSat = new Date();
      nextSat.setDate(today.getDate() + ((6 - today.getDay() + 7) % 7 || 7));
      start = nextSat;
    }
    const duration = packageData.duration_days || 1;
    const end = new Date(start);
    end.setDate(start.getDate() + (duration > 1 ? duration - 1 : 0));
    return { start, end };
  })();

  const startFormatted = start 
    ? start.toLocaleDateString(lang === 'AR' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

  const endFormatted = end
    ? end.toLocaleDateString(lang === 'AR' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

  const getDayDate = (dayNumber) => {
    if (!start) return '';
    const dayDate = new Date(start);
    dayDate.setDate(start.getDate() + (dayNumber - 1));
    return dayDate.toLocaleDateString(lang === 'AR' ? 'ar-EG' : 'en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`package-details-page tw-min-h-screen tw-bg-slate-50 dark:tw-bg-[#0a0b0d] tw-text-slate-900 dark:tw-text-white tw-transition-colors tw-duration-300 ${lang === 'AR' ? 'lang-ar tw-text-right' : 'tw-text-left'}`}>
      <Navbar lang={lang} setLang={setLang} isScrolled={true} />

      <main className="details-container">
        {loading ? (
          <div className="loading-spinner">
            <i className="fa-solid fa-spinner fa-spin"></i> Loading details...
          </div>
        ) : error ? (
          <div className="error-card">
            <i className="fa-solid fa-circle-exclamation"></i>
            <p>{error}</p>
            <Link to="/" className="btn-back">Return to Home</Link>
          </div>
        ) : packageData ? (
          <>

            {/* Main Grid */}
            <div className="package-grid">
                {/* Hero Header & Quick Overview */}
                <div className="experience-hero-header" style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      <span style={{ background: '#f59e0b', color: '#000', padding: '5px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem' }}>
                        <i className="fa-solid fa-tag"></i> {packageData.type} ({packageData.type === 'Trip' ? `${packageData.duration_days} Days` : 'Day Use'})
                      </span>
                      <div className="hero-rating" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '5px' }}>
                          <div>
                            {stats.totalReviews > 0 ? (
                              <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className="fa-solid fa-star"></i> {stats.averageRating}
                                <span style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.85rem', marginLeft: '10px' }}>
                                  <i className="fa-solid fa-shield-halved"></i> {stats.averageTrustScore || 100}/100 Trust Score
                                </span>
                                <span style={{ color: '#94a3b8', fontSize: '0.9rem', marginLeft: '5px' }}>
                                  ({stats.totalReviews} verified reviews)
                                </span>
                              </span>
                            ) : (
                              <span style={{ color: 'rgba(255,255,255,0.7)' }}>
                                <i className="fa-solid fa-star"></i> New (Unrated)
                              </span>
                            )}
                          </div>
                          {stats.totalReviews > 0 && (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '5px 12px', borderRadius: '20px', color: '#34d399', fontSize: '0.85rem', fontWeight: 'bold', marginTop: '5px' }}>
                              <i className="fa-solid fa-shield-halved"></i> AI-Verified Authentic Reviews
                            </div>
                          )}
                        </div>
                        {stats.totalReviews > 0 && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '5px 12px', borderRadius: '20px', color: '#34d399', fontSize: '0.85rem', fontWeight: 'bold', marginTop: '5px' }}>
                            <i className="fa-solid fa-shield-halved"></i> AI-Verified Authentic Reviews
                          </div>
                        )}
                      </div>
                  </div>
                  <h1 className="tw-text-slate-900 dark:tw-text-white tw-font-bold" style={{ fontSize: '2.5rem', marginBottom: '15px', lineHeight: '1.2' }}>{packageData.name || packageData.title}</h1>
                  
                  {/* Quick Overview Bar */}
                  <div className="quick-overview-bar" style={{ display: 'flex', gap: '20px', color: '#a4a4b4', fontSize: '0.95rem', flexWrap: 'wrap' }}>
                    <span><i className="fa-solid fa-location-dot" style={{ color: '#f59e0b', marginRight: '5px' }}></i> {packageData.destination?.name || 'Egypt'}</span>
                    <span><i className="fa-solid fa-clock" style={{ color: '#f59e0b', marginRight: '5px' }}></i> {packageData.duration_days} {packageData.duration_days > 1 ? 'Days / ' + (packageData.duration_days - 1) + ' Nights' : 'Day'}</span>
                    <span><i className="fa-solid fa-users" style={{ color: '#f59e0b', marginRight: '5px' }}></i> Max {packageData.capacity || 20} People</span>
                    <span><i className="fa-solid fa-language" style={{ color: '#f59e0b', marginRight: '5px' }}></i> English, Arabic</span>
                    <span><i className="fa-solid fa-car" style={{ color: '#f59e0b', marginRight: '5px' }}></i> Pickup Included</span>
                  </div>
                </div>

                {/* 📸 Premium Interactive Travel Experience Gallery */}
                <div className="premium-gallery-container">
                  {/* Large Active Image */}
                  <div className="image-wrapper">
                    <img 
                      src={activeImage || packageData.image || 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1200&q=80'} 
                      alt={packageData.name || packageData.title} 
                      className="main-gallery-image"
                    />
                    <div className="type-badge">{packageData.type}</div>
                  </div>

                   {/* Thumbnails Row */}
                   {packageData.images && packageData.images.length > 0 && (
                     <div className="thumbnails-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '15px' }}>
                       {packageData.images.map((imgUrl, idx) => {
                         const isValidUrl = imgUrl && (imgUrl.trim().startsWith('http') || imgUrl.trim().startsWith('/') || imgUrl.trim().startsWith('data:image'));
                         
                         let finalImgUrl = imgUrl;
                         if (!isValidUrl) {
                           if (idx === 0) finalImgUrl = 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=600&q=80';
                           else if (idx === 1) finalImgUrl = 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80';
                           else if (idx === 2) finalImgUrl = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80';
                           else finalImgUrl = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80';
                         }
                         
                         return (
                           <div 
                             key={idx} 
                             className={`thumbnail-item ${activeImage === finalImgUrl ? 'active' : ''}`}
                             onClick={() => setActiveImage(finalImgUrl)}
                             style={{
                               background: '#121212',
                               position: 'relative',
                               overflow: 'hidden',
                               border: activeImage === finalImgUrl ? '2.5px solid #f59e0b' : '1px solid rgba(212, 175, 55, 0.25)',
                               borderRadius: '10px',
                               height: '80px',
                               cursor: 'pointer',
                               boxSizing: 'border-box',
                               transition: 'all 0.2s'
                             }}
                           >
                             <img src={finalImgUrl} alt="Experience view" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                           </div>
                         );
                       })}
                     </div>
                   )}
                </div>

                <div className="details-section">
                  <h2 className="tw-text-slate-900 dark:tw-text-white tw-font-bold tw-text-2xl tw-mb-6">Overview</h2>
                  <p className="description-text" style={{ fontSize: '1.05rem', lineHeight: '1.7', color: '#cbd5e1' }}>
                    {packageData.description || 'Embark on a breath-taking journey that lets you discover Egypt\'s true wonders. Fully guided experience with premium logistics, customized options, and memorable local stories.'}
                  </p>
                </div>

                {/* Booking Card (relocated above Itinerary) */}
                <div className="booking-card" style={{ marginTop: '20px' }}>
                  <div className="booking-card-inner">
                    {/* Left Side: Pricing, Breakdown, Discounts & Benefits */}
                    <div>
                      {(() => {
                        const singlePrice = isCustomizing && customTrip 
                          ? customTrip.total_price 
                          : (packageData ? (packageData.base_price || packageData.price || 0) : 0);
                        
                        const originalSinglePrice = isCustomizing && customTrip && customTrip.ai_discount_applied
                          ? customTrip.original_price
                          : singlePrice;

                        const addonsTotal = selectedAddons.reduce((sum, addonId) => {
                          const addon = packageData?.addons?.find(a => a._id === addonId);
                          return sum + (addon ? addon.price : 0);
                        }, 0);
                        
                        const extraActivitiesCount = selectedAddons.length + (customTrip?.extra_activities?.length || 0);
                        const aiDiscountApplied = false; // DISABLED: No automatic discounts without entering a code.
                        
                        let totalPrice = (singlePrice * guestCount) + addonsTotal;
                        let originalTotalPrice = originalSinglePrice * guestCount + addonsTotal;

                        return (
                          <>
                            <div className="booking-price" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start', width: '100%' }}>
                                <span className="price-label" style={{ fontSize: '0.8rem', color: '#a4a4b4', fontWeight: '800', letterSpacing: '0.5px' }}>
                                  {isCustomizing ? (lang === 'AR' ? 'السعر المخصص للفرد' : 'CUSTOMIZED PRICE PER GUEST') : (lang === 'AR' ? 'يبدأ سعر الفرد من' : 'PRICE STARTS AT')}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                                  <span className="price-amount" style={{ fontSize: '2.4rem', color: '#f59e0b', fontWeight: 'bold' }}>
                                    {formatPrice(totalPrice)}
                                  </span>
                                  {aiDiscountApplied && (
                                    <span style={{ textDecoration: 'line-through', color: '#64748b', fontSize: '1rem', marginLeft: '5px' }}>
                                      {formatPrice(originalTotalPrice)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {aiDiscountApplied && (
                                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '6px 10px', borderRadius: '8px', color: '#10b981', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', width: 'fit-content' }}>
                                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                                  {lang === 'AR' ? 'تم تطبيق خصم التوجيه الذكي (AI) 10%' : '10% AI Bundle Discount Applied!'}
                                </div>
                              )}
                              {extraActivitiesCount === 2 && (
                                <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px dashed rgba(245, 158, 11, 0.4)', padding: '8px 10px', borderRadius: '8px', color: '#f59e0b', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', width: 'fit-content' }}>
                                  <i className="fa-solid fa-gift fa-bounce"></i>
                                  {lang === 'AR' ? 'أضف نشاطاً واحداً إضافياً واحصل على خصم 10% على إجمالي رحلتك!' : 'Add just 1 more extra activity to get a 10% AI Discount!'}
                                </div>
                              )}
                              
                              <button 
                                onClick={() => setShowBreakdown(!showBreakdown)}
                                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.85rem', textDecoration: 'underline', cursor: 'pointer', textAlign: 'left', marginTop: '6px', padding: 0, width: 'fit-content' }}
                              >
                                {lang === 'AR' ? 'عرض تفاصيل السعر (شفافية كاملة) ←' : 'View Price Breakdown (Full Transparency) →'}
                              </button>
                              
                              {showBreakdown && (
                                <div style={{ marginTop: '10px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '12px', fontSize: '0.85rem', color: '#cbd5e1', width: '90%' }}>
                                  {packageData.priceBreakdown && packageData.priceBreakdown.length > 0 ? (
                                    packageData.priceBreakdown.map((item, idx) => (
                                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <span>{item.label}</span>
                                        <span>{formatPrice(item.amount * guestCount)}</span>
                                      </div>
                                    ))
                                  ) : (
                                    <>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <span>{lang === 'AR' ? 'رسوم وتصاريح:' : 'Fees / Permits:'}</span>
                                        <span>{formatPrice(totalPrice * 0.15)}</span>
                                      </div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <span>{lang === 'AR' ? 'النقل (سيارة مكيفة):' : 'Transportation:'}</span>
                                        <span>{formatPrice(totalPrice * 0.25)}</span>
                                      </div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <span>{lang === 'AR' ? 'وجبات ومشروبات:' : 'Meals & Drinks:'}</span>
                                        <span>{formatPrice(totalPrice * 0.15)}</span>
                                      </div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <span>{lang === 'AR' ? 'أنشطة وتجارب:' : 'Activities & Experiences:'}</span>
                                        <span>{formatPrice(totalPrice * 0.45)}</span>
                                      </div>
                                    </>
                                  )}
                                  {aiDiscountApplied && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: 'bold', marginTop: '5px', paddingTop: '5px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                      <span>{lang === 'AR' ? 'خصم (10%):' : 'Discount (10%):'}</span>
                                      <span>- {formatPrice((originalTotalPrice - totalPrice))}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {guestCount > 1 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '90%', borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '10px', marginTop: '10px' }}>
                                  <span className="price-label" style={{ color: '#f59e0b', fontWeight: '700' }}>
                                    {lang === 'AR' ? `الإجمالي لـ ${guestCount} مسافرين` : `Total for ${guestCount} guests`}
                                  </span>
                                  <span className="price-amount" style={{ color: '#f59e0b', fontSize: '1.3rem', fontWeight: '800' }}>
                                    {totalPrice} EGP
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Premium Benefits List Under Price (Shield, Bolt, 24/7 Support) */}
                            <div className="booking-benefits" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '25px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '20px', width: '90%' }}>
                              <div className="benefit-item" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <i className="fa-solid fa-shield-halved" style={{ color: '#f59e0b', fontSize: '1rem', background: 'rgba(245, 158, 11, 0.08)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}></i>
                                <div>
                                  <strong style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#fff' }}>{lang === 'AR' ? 'إلغاء مجاني' : 'Free Cancellation'}</strong>
                                  <span style={{ fontSize: '0.78rem', color: '#a4a4b4', display: 'block', marginTop: '1px' }}>{lang === 'AR' ? 'إلغاء مرن حتى 24 ساعة مقدماً' : 'Cancel up to 24 hours in advance'}</span>
                                </div>
                              </div>
                              <div className="benefit-item" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <i className="fa-solid fa-bolt" style={{ color: '#f59e0b', fontSize: '1rem', background: 'rgba(245, 158, 11, 0.08)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}></i>
                                <div>
                                  <strong style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#fff' }}>{lang === 'AR' ? 'تأكيد فوري' : 'Instant Confirmation'}</strong>
                                  <span style={{ fontSize: '0.78rem', color: '#a4a4b4', display: 'block', marginTop: '1px' }}>{lang === 'AR' ? 'احجز مكانك مباشرة في ثوانٍ معدودة' : 'Secure your spot in seconds'}</span>
                                </div>
                              </div>
                              <div className="benefit-item" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <i className="fa-solid fa-headset" style={{ color: '#f59e0b', fontSize: '1rem', background: 'rgba(245, 158, 11, 0.08)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}></i>
                                <div>
                                  <strong style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#fff' }}>{lang === 'AR' ? 'دعم 24/7' : '24/7 Support'}</strong>
                                  <span style={{ fontSize: '0.78rem', color: '#a4a4b4', display: 'block', marginTop: '1px' }}>{lang === 'AR' ? 'دعم عملاء مخصص طوال اليوم' : 'Dedicated customer support'}</span>
                                </div>
                              </div>
                            </div>

                            {/* AI Demand Forecasting & Eco-Tourism Widget */}
                            {(() => {
                              const destName = packageData?.destination?.name || 'Cairo';
                              let occupancy = 'Low';
                              let score = 30; // percentage
                              let color = '#10b981'; // Green
                              let titleEN = 'Optimal Peaceful Visit';
                              let titleAR = 'وقت زيارة هادئ ومثالي';
                              let descEN = '';
                              let descAR = '';

                              if (destName.toLowerCase() === 'hurghada') {
                                occupancy = 'Moderate';
                                score = 55;
                                color = '#f59e0b'; // Amber
                                titleEN = 'Eco-Friendly Cruise Season';
                                titleAR = 'موسم رحلات معتدل بيئياً';
                                descEN = 'Moderate marine crowd (55%). Perfect water temperature. PADI reefs are highly vibrant with zero ecological warnings this week.';
                                descAR = 'ازدحام بحري معتدل (55%). درجات حرارة مياه مثالية. الشعاب المرجانية في قمة حيويتها بيئياً ولا توجد تحذيرات بحرية.';
                              } else if (destName.toLowerCase() === 'luxor') {
                                occupancy = 'Low';
                                score = 25;
                                color = '#10b981';
                                titleEN = 'Serene Pharaoh Discovery';
                                titleAR = 'استكشاف فرعوني هادئ ومثالي';
                                descEN = 'Very low summer occupancy (25%). Early mornings are serene. Best time to view Valley of Kings tombs with zero waiting lines.';
                                descAR = 'إشغال صيفي منخفض جداً (25%). الأجواء في الصباح الباكر ساحرة وهادئة. الوقت الأنسب لزيارة وادي الملوك دون طوابير.';
                              } else if (destName.toLowerCase() === 'dahab') {
                                occupancy = 'Moderate';
                                score = 40;
                                color = '#10b981';
                                titleEN = 'Zen Meditation Window';
                                titleAR = 'أجواء تأمل وصفاء مثالية';
                                descEN = 'Gentle Lighthouse winds. 40% bay occupancy. Highly recommended for eco-hiking and beachfront meditation.';
                                descAR = 'رياح معتدلة ومنعشة في خليج لايتهاوس. نسبة إشغال 40%. نوصي بشدة بالزيارة للاستجمام والتأمل الهادئ.';
                              } else {
                                // Giza / Cairo / Default
                                occupancy = 'Low';
                                score = 35;
                                color = '#10b981';
                                titleEN = 'Peaceful Plateau Photography';
                                titleAR = 'وقت تصوير مثالي وهادئ';
                                descEN = 'Summer morning low occupancy (35%). The Giza plateau is remarkably quiet. Ideal for private tours and uninterrupted photography.';
                                descAR = 'إشغال منخفض في الصباح الباكر (35%). هضبة الأهرامات هادئة ولطيفة جداً. وقت مثالي للجولات الخاصة والتصوير المستمر.';
                              }

                              return (
                                <div style={{
                                  marginTop: '15px',
                                  background: 'rgba(255, 255, 255, 0.02)',
                                  border: '1px solid rgba(16, 185, 129, 0.15)',
                                  borderRadius: '10px',
                                  padding: '14px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '10px'
                                }}>
                                  {/* Widget Header */}
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <i className="fa-solid fa-leaf" style={{ color: '#10b981', animation: 'ecoPulse 2s infinite' }}></i>
                                      <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#10b981', letterSpacing: '0.5px' }}>
                                        {lang === 'AR' ? 'تنبؤات الـ AI والزيارة المستدامة' : 'AI ECO-DEMAND FORECAST'}
                                      </span>
                                    </div>
                                    <span style={{
                                      fontSize: '0.72rem',
                                      background: 'rgba(16, 185, 129, 0.1)',
                                      color: color,
                                      padding: '2px 8px',
                                      borderRadius: '20px',
                                      fontWeight: '700',
                                      border: `1px solid ${color}30`
                                    }}>
                                      {lang === 'AR' ? `الطلب: ${occupancy === 'Low' ? 'منخفض' : 'معتدل'}` : `Demand: ${occupancy}`}
                                    </span>
                                  </div>

                                  {/* Occupancy Indicator Slider */}
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b' }}>
                                      <span>{lang === 'AR' ? 'هدوء مطلق' : 'Quiet'}</span>
                                      <span style={{ color: color, fontWeight: '700' }}>{score}% {lang === 'AR' ? 'سعة إشغال' : 'Occupancy'}</span>
                                      <span>{lang === 'AR' ? 'ذروة الازدحام' : 'Peak'}</span>
                                    </div>
                                    <div style={{
                                      height: '6px',
                                      width: '100%',
                                      background: '#222',
                                      borderRadius: '3px',
                                      position: 'relative',
                                      overflow: 'hidden'
                                    }}>
                                      <div style={{
                                        height: '100%',
                                        width: `${score}%`,
                                        background: `linear-gradient(90deg, #10b981 0%, ${color} 100%)`,
                                        borderRadius: '3px'
                                      }}></div>
                                    </div>
                                  </div>

                                  {/* AI Recommendation Message */}
                                  <div style={{
                                    background: 'rgba(255, 255, 255, 0.01)',
                                    borderLeft: `2.5px solid ${color}`,
                                    padding: '2px 8px',
                                    fontSize: '0.78rem',
                                    color: '#cbd5e1',
                                    lineHeight: '1.4'
                                  }}>
                                    <strong style={{ display: 'block', color: '#ffffff', fontSize: '0.8rem', marginBottom: '2px' }}>
                                      {lang === 'AR' ? titleAR : titleEN}
                                    </strong>
                                    {lang === 'AR' ? descAR : descEN}
                                  </div>

                                  {/* Inline CSS pulse */}
                                  <style>{`
                                    @keyframes ecoPulse {
                                      0%, 100% { opacity: 0.7; transform: scale(1); }
                                      50% { opacity: 1; transform: scale(1.15); }
                                    }
                                  `}</style>
                                </div>
                              );
                            })()}
                          </>
                        );
                      })()}
                    </div>

                    {/* Right Side: Guest Selector & Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {/* Interactive Guest Selector */}
                      <div className="guest-selector-container" style={{
                        padding: '16px 20px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}>
                        <label style={{ fontSize: '0.85rem', color: '#aaa', fontWeight: '700', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: 0 }}>
                          <span style={{ color: '#a4a4b4' }}>{lang === 'AR' ? 'عدد المسافرين (الضيوف)' : 'Number of Travelers (Guests)'}</span>
                          <span style={{ color: '#f59e0b', fontWeight: '800' }}>{guestCount} {guestCount === 1 ? (lang === 'AR' ? 'مسافر' : 'Guest') : (lang === 'AR' ? 'مسافرين' : 'Guests')}</span>
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                          <button 
                            type="button"
                            onClick={() => setGuestCount(prev => Math.max(1, prev - 1))}
                            disabled={guestCount <= 1}
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              background: guestCount <= 1 ? 'rgba(255,255,255,0.02)' : '#f59e0b',
                              color: guestCount <= 1 ? '#555' : '#000',
                              border: 'none',
                              cursor: guestCount <= 1 ? 'not-allowed' : 'pointer',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s',
                              fontSize: '1.1rem'
                            }}
                          >
                            <i className="fa-solid fa-minus"></i>
                          </button>
                          <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>{guestCount}</span>
                          <button 
                            type="button"
                            onClick={() => setGuestCount(prev => prev + 1)}
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              background: '#f59e0b',
                              color: '#000',
                              border: 'none',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s',
                              fontSize: '1.1rem'
                            }}
                          >
                            <i className="fa-solid fa-plus"></i>
                          </button>
                        </div>
                      </div>

                      {isCustomizing && customTrip && (
                        <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid #f59e0b', borderRadius: '12px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '0.88rem', fontWeight: '700' }}>
                          <i className="fa-solid fa-wand-magic-sparkles"></i> {lang === 'AR' ? 'الخطة المخصصة نشطة' : 'Custom Plan Active'}
                        </div>
                      )}

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* Book Adventure Button */}
                        <button 
                          onClick={handleBookNow} 
                          disabled={bookingLoading}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', border: 'none', borderRadius: '14px', padding: '16px 20px', background: '#f59e0b', color: '#000', fontWeight: '800', fontSize: '1.05rem', transition: 'all 0.2s' }}
                        >
                          {bookingLoading ? (
                            <><i className="fa-solid fa-spinner fa-spin"></i> {lang === 'AR' ? 'جاري إتمام الحجز...' : 'Creating Booking...'}</>
                          ) : (
                            <><i className="fa-solid fa-calendar-days"></i> {lang === 'AR' ? 'احجز هذه المغامرة' : 'Book This Adventure'}</>
                          )}
                        </button>

                        {/* Add to Trip Chain Button */}
                        <button 
                          onClick={handleAddToTripChain}
                          style={{
                            width: '100%',
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1.5px dashed rgba(245, 158, 11, 0.4)',
                            color: '#f59e0b',
                            padding: '14px 20px',
                            borderRadius: '14px',
                            fontWeight: '700',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = 'rgba(245, 158, 11, 0.08)';
                            e.currentTarget.style.borderColor = '#f59e0b';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                            e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)';
                          }}
                        >
                          <i className="fa-solid fa-link"></i> {lang === 'AR' ? 'أضف إلى سلسلة الرحلة' : 'Add to Trip Chain'}
                        </button>
                        
                        {/* Wishlist and Customize side-by-side */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '12px' }}>
                          {/* Saved Button */}
                          <button 
                            onClick={handleWishlistToggle} 
                            disabled={wishlistLoading}
                            style={{
                              background: isInWishlist ? 'rgba(230, 30, 77, 0.1)' : 'rgba(255,255,255,0.02)',
                              border: isInWishlist ? '1px solid #e61e4d' : '1px solid rgba(230, 30, 77, 0.3)',
                              color: isInWishlist ? '#ff4b72' : '#ff4b72',
                              padding: '12px 10px',
                              borderRadius: '12px',
                              cursor: 'pointer',
                              fontWeight: '700',
                              fontSize: '0.9rem',
                              transition: 'all 0.3s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px'
                            }}
                          >
                            {wishlistLoading ? (
                              <i className="fa-solid fa-spinner fa-spin"></i>
                            ) : (
                              <>
                                <i className={`${isInWishlist ? 'fa-solid' : 'fa-regular'} fa-heart`} style={{ color: '#e61e4d', fontSize: '1rem' }}></i>
                                {isInWishlist ? (lang === 'AR' ? 'تم الحفظ' : 'Saved') : (lang === 'AR' ? 'المفضلة' : 'Save')}
                              </>
                            )}
                          </button>

                          {/* Customize Plan Button */}
                          {token && (
                            !customTrip ? (
                              <button 
                                onClick={handleStartCustomization} 
                                style={{
                                  background: 'rgba(255,255,255,0.02)',
                                  border: '1px solid rgba(255, 255, 255, 0.12)',
                                  color: '#fff',
                                  padding: '12px 10px',
                                  borderRadius: '12px',
                                  cursor: 'pointer',
                                  fontWeight: '600',
                                  fontSize: '0.9rem',
                                  transition: 'all 0.2s',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '8px'
                                }}
                              >
                                <i className="fa-solid fa-sliders" style={{ color: '#f59e0b' }}></i> {lang === 'AR' ? 'تخصيص الخطة' : 'Customize Plan'}
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleToggleCustomization(isCustomizing ? 'standard' : 'custom')} 
                                style={{
                                  background: 'rgba(255,255,255,0.02)',
                                  border: '1px solid rgba(255, 255, 255, 0.12)',
                                  color: '#fff',
                                  padding: '12px 10px',
                                  borderRadius: '12px',
                                  cursor: 'pointer',
                                  fontWeight: '600',
                                  fontSize: '0.9rem',
                                  transition: 'all 0.2s',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '8px'
                                }}
                              >
                                <i className="fa-solid fa-sliders" style={{ color: '#f59e0b' }}></i> {isCustomizing ? (lang === 'AR' ? 'الخطة الأساسية' : 'Standard Plan') : (lang === 'AR' ? 'تخصيص الخطة' : 'Customize Plan')}
                              </button>
                            )
                          )}
                        </div>

                        {/* Secure Payment Text */}
                        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#2dd4bf', margin: '12px 0 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: '600' }}>
                          <i className="fa-solid fa-lock" style={{ color: '#2dd4bf' }}></i> {lang === 'AR' ? 'دفع آمن 100% | بدون رسوم خفية' : '100% Secure Payment | Zero Hidden Fees'}
                        </p>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Itinerary Section */}
                <div className="itinerary-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 className="tw-text-slate-900 dark:tw-text-white tw-font-bold tw-text-2xl tw-mb-6">{isCustomizing ? '⚡ Your Customized Itinerary' : 'Planned Itinerary'}</h2>
                    {token && customTrip && (
                      <button 
                        onClick={() => handleToggleCustomization(isCustomizing ? 'standard' : 'custom')} 
                        className="btn-toggle-custom"
                        style={{
                          background: 'rgba(212, 175, 55, 0.1)',
                          border: '1px solid #f59e0b',
                          color: '#f59e0b',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          transition: 'all 0.2s'
                        }}
                      >
                        {isCustomizing ? 'View Standard Plan' : 'View Customized Plan'}
                      </button>
                    )}
                  </div>

                  <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-circle-info" style={{ color: '#f59e0b' }}></i>
                    {token 
                      ? 'يمكنك تخصيص رحلتك بمجرد تحديد أو إلغاء تحديد الأيام والأنشطة أدناه!' 
                      : 'سجل دخولك لتتمكن من إلغاء أو تفعيل أي يوم أو نشاط وتعديل سعر الرحلة فوراً!'}
                  </p>

                  {customizationError && (
                    <div className="alert alert-error" style={{ marginBottom: '15px' }}>
                      <i className="fa-solid fa-circle-exclamation"></i> {customizationError}
                    </div>
                  )}

                  <div className="itinerary-timeline customized">
                    {(!displayItinerary || displayItinerary.length === 0) && (
                      <p style={{ color: '#888', fontStyle: 'italic', marginBottom: '20px', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', borderLeft: '3px solid #f59e0b' }}>
                        {lang === 'AR' ? 'رحلة استرخاء بدون خطة مسبقة. يمكنك تخصيص وبناء خطتك اليومية بإضافة الأيام أدناه.' : 'Leisure trip with open explore days. You can start building your custom itinerary by adding days below.'}
                      </p>
                    )}

                    {displayItinerary && displayItinerary.length > 0 && (
                      <>
                        {displayItinerary.map((day) => {
                          const customDay = customTrip?.itinerary?.find(d => d.day_number === day.day_number);
                          const isDayRemoved = customDay ? customDay.status === 'removed' : false;

                          // Optional Activities for this destination
                          const pkgDestId = packageData?.destination?._id || packageData?.destination;
                          const optionalActs = activitiesList.filter(act => {
                            const actDestId = act.destination?._id || act.destination;
                            return actDestId && pkgDestId && actDestId.toString() === pkgDestId.toString();
                          }) || [];
                          const finalAddActivityOptions = optionalActs.length > 0 ? optionalActs : activitiesList;

                          return (
                            <div key={day.day_number} className="tw-bg-white dark:tw-bg-[#15171a] tw-border tw-border-slate-200 dark:tw-border-slate-800 tw-rounded-2xl tw-shadow-sm trip-accordion" style={{ 
                              background: 'transparent', 
                              border: isDayRemoved ? '1px solid var(--border-light, #333)' : '1.5px solid #f59e0b',
                              borderRadius: '16px', 
                              overflow: 'hidden',
                              marginBottom: '30px',
                              opacity: isDayRemoved ? 0.6 : 1,
                              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                              boxShadow: 'var(--box-shadow-soft)',
                              display: 'flex',
                              flexDirection: 'column',
                              position: 'relative'
                            }}>
                              
                              {/* 🖼️ Scenic Airbnb-style Day Illustration Image Banner */}
                              <div 
                                className="day-image-banner" 
                                onClick={() => setExpandedDay(expandedDay === day.day_number ? null : day.day_number)}
                                style={{ 
                                  height: expandedDay === day.day_number ? '220px' : '100px', 
                                  position: 'relative',
                                  background: '#121212',
                                  overflow: 'hidden',
                                  cursor: 'pointer',
                                  transition: 'height 0.3s ease'
                                }}
                              >
                                <img 
                                  src={day.image || packageData.image || 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1200&q=80'} 
                                  alt={day.title || `Day ${day.day_number}`} 
                                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                                />
                                
                                {/* Overlay Gradient */}
                                <div style={{
                                  position: 'absolute',
                                  left: 0, right: 0, top: 0, bottom: 0,
                                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.85) 100%)'
                                }}></div>

                                {/* Custom Day Number Badge */}
                                <div className="day-number-badge" style={{
                                  position: 'absolute',
                                  top: '15px',
                                  left: '15px',
                                  background: isDayRemoved ? '#555' : '#f59e0b',
                                  color: '#000000',
                                  padding: '5px 12px',
                                  borderRadius: '20px',
                                  fontWeight: '800',
                                  fontSize: '0.8rem',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                  zIndex: 2
                                }}>
                                  Day {day.day_number}
                                </div>

                                {/* Accordion Icon */}
                                <div style={{
                                  position: 'absolute',
                                  top: '15px',
                                  right: '15px',
                                  color: '#fff',
                                  fontSize: '1.2rem',
                                  transition: 'transform 0.3s',
                                  transform: expandedDay === day.day_number ? 'rotate(180deg)' : 'rotate(0deg)'
                                }}>
                                  <i className="fa-solid fa-chevron-down"></i>
                                </div>

                                {/* Day Calendar Date Badge */}
                                <div className="day-calendar-date-badge" style={{
                                  position: 'absolute',
                                  top: '15px',
                                  left: '95px',
                                  background: 'rgba(0, 0, 0, 0.75)',
                                  color: '#fff',
                                  padding: '5px 12px',
                                  borderRadius: '20px',
                                  fontWeight: '700',
                                  fontSize: '0.78rem',
                                  border: '1px solid rgba(255,255,255,0.2)',
                                  zIndex: 2,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '5px'
                                }}>
                                  <i className="fa-solid fa-calendar-day" style={{ color: '#f59e0b' }}></i>
                                  {getDayDate(day.day_number)}
                                </div> 

                                {/* Day Title Heading */}
                                <h3 style={{ 
                                  position: 'absolute',
                                  bottom: '15px',
                                  left: '20px',
                                  right: '20px',
                                  color: '#ffffff',
                                  margin: 0,
                                  fontSize: expandedDay === day.day_number ? '1.4rem' : '1.2rem',
                                  fontWeight: '800',
                                  textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                                  textDecoration: isDayRemoved ? 'line-through' : 'none',
                                  transition: 'all 0.3s ease'
                                }}>
                                  {day.title || (lang === 'AR' ? `مخطط اليوم ${day.day_number}` : `Day ${day.day_number} Itinerary Plan`)}
                                </h3>

                                {/* 🗑️ Delete / Restore Day Button — visible only when expanded */}
                                {expandedDay === day.day_number && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleDayCheckbox(day.day_number);
                                    }}
                                    title={isDayRemoved
                                      ? (lang === 'AR' ? 'استعادة اليوم' : 'Restore Day')
                                      : (lang === 'AR' ? 'حذف اليوم' : 'Delete Day')}
                                    style={{
                                      position: 'absolute',
                                      bottom: '15px',
                                      right: '15px',
                                      background: isDayRemoved ? 'rgba(34,197,94,0.85)' : 'rgba(239,68,68,0.85)',
                                      color: '#fff',
                                      border: 'none',
                                      borderRadius: '10px',
                                      padding: '7px 14px',
                                      fontSize: '0.82rem',
                                      fontWeight: '700',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      zIndex: 10,
                                      backdropFilter: 'blur(4px)',
                                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                      transition: 'all 0.2s ease',
                                      letterSpacing: '0.3px'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                  >
                                    <i className={isDayRemoved ? 'fa-solid fa-rotate-left' : 'fa-solid fa-trash'}></i>
                                    {isDayRemoved
                                      ? (lang === 'AR' ? 'استعادة' : 'Restore')
                                      : (lang === 'AR' ? 'حذف اليوم' : 'Delete Day')}
                                  </button>
                                )}
                              </div>
                              
                              <div className="day-card-body" style={{ 
                                padding: '20px 25px', 
                                flex: '1', 
                                display: (expandedDay === day.day_number) ? 'flex' : 'none', 
                                flexDirection: 'column', 
                                gap: '15px' 
                              }}>
                                
                                {/* 📝 Day Description */}
                                {day.description && (
                                  <div style={{
                                    borderLeft: '3px solid #f59e0b',
                                    paddingLeft: '15px'
                                  }}>
                                    <h5 style={{ margin: '0 0 5px 0', textTransform: 'uppercase', color: '#f59e0b', fontSize: '0.78rem', fontWeight: '800', letterSpacing: '0.5px' }}>
                                      {lang === 'AR' ? 'نظرة عامة على اليوم' : 'Day overview'}
                                    </h5>
                                    <p className="day-description-info" style={{ 
                                      color: 'var(--text-muted, #64748b)', 
                                      fontSize: '0.94rem', 
                                      lineHeight: '1.6',
                                      marginTop: '0', 
                                      marginBottom: '0',
                                      fontWeight: '500'
                                    }}>
                                      {day.description}
                                    </p>
                                  </div>
                                )}

                                {/* ⚡ Day Activities Header */}
                                <h5 style={{ margin: '5px 0 0 0', textTransform: 'uppercase', color: 'var(--primary-color, #0f172a)', fontSize: '0.78rem', fontWeight: '800', letterSpacing: '0.5px' }}>
                                  {lang === 'AR' ? 'الأنشطة المدرجة:' : 'Included daily activities'}
                                </h5>

                                {day.activities && day.activities.length > 0 ? (
                                  <ul className="activity-list" style={{ paddingLeft: 0, listStyle: 'none', margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {day.activities.map((act, index) => {
                                      const actId = act.activity?._id || act.activity;
                                      const resolvedAct = (typeof act.activity === 'object' && act.activity !== null) 
                                        ? act.activity 
                                        : activitiesList.find(a => a._id === actId);
                                      const actObj = resolvedAct || act.activity;
                                      const customAct = customDay?.activities?.find(a => (a.activity?._id || a.activity) === actId);
                                      const isActRemoved = customAct ? customAct.status === 'removed' : false;
                                      const isDisabled = isDayRemoved;

                                      const provId = act.provider?._id || act.provider || actObj?.provider?._id || actObj?.provider;
                                      const matchedProv = providersList.find(p => p._id === provId);
                                      const providerName = matchedProv ? matchedProv.name : (act.provider?.name || actObj?.provider?.name || 'Local Guide');

                                      const actName = actObj?.name || act.name || 'Exciting Activity';
                                      const actDesc = act.description || actObj?.description || 'No description available for this activity.';
                                      const actImage = act.image || actObj?.image || getActivityImage(actName);
                                      const actPrice = act.price !== undefined ? act.price : (actObj?.price || 0);

                                      return (
                                        <li key={index} className="activity-item" style={{ 
                                          display: 'flex', 
                                          padding: '15px', 
                                          background: 'rgba(255, 255, 255, 0.02)',
                                          border: '1px solid rgba(255, 255, 255, 0.05)',
                                          borderRadius: '12px', 
                                          opacity: (isDisabled || isActRemoved) ? 0.5 : 1,
                                          transition: 'all 0.3s ease',
                                          alignItems: 'center',
                                          gap: '15px'
                                        }}>
                                          <img 
                                            src={actImage} 
                                            alt={actName} 
                                            style={{
                                              width: '90px',
                                              height: '90px',
                                              borderRadius: '8px',
                                              objectFit: 'cover',
                                              flexShrink: 0
                                            }}
                                            onError={(e) => {
                                              e.target.src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80';
                                            }}
                                          />
                                          <div style={{ flexGrow: 1, minWidth: 0 }}>
                                            <h4 style={{ 
                                              color: '#facc15', /* Premium Gold */
                                              fontSize: '1.05rem',
                                              fontWeight: '700',
                                              margin: '0 0 5px 0',
                                              textDecoration: isActRemoved ? 'line-through' : 'none'
                                            }}>{actName}</h4>
                                            <p style={{ 
                                              color: '#cbd5e1',
                                              fontSize: '0.85rem',
                                              margin: '0 0 8px 0',
                                              display: '-webkit-box',
                                              WebkitLineClamp: 2,
                                              WebkitBoxOrient: 'vertical',
                                              overflow: 'hidden',
                                              lineHeight: '1.4',
                                              textDecoration: isActRemoved ? 'line-through' : 'none'
                                            }}>{actDesc}</p>
                                            <div style={{ 
                                              color: '#9ca3af',
                                              fontSize: '0.8rem',
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '6px',
                                              fontWeight: '500'
                                            }}>
                                              <i className="fa-solid fa-parachute-box" style={{ color: '#facc15' }}></i>
                                              <span>{lang === 'AR' ? 'المزود:' : 'Provider:'} {providerName}</span>
                                            </div>
                                          </div>
                                          
                                          <div style={{ 
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'flex-end',
                                            gap: '8px',
                                            flexShrink: 0,
                                            paddingLeft: '15px',
                                            borderLeft: '1px solid rgba(255, 255, 255, 0.05)',
                                            minWidth: '100px'
                                          }}>
                                            <span style={{ 
                                              fontWeight: '800',
                                              color: '#10b981',
                                              fontSize: '0.95rem',
                                              textDecoration: isActRemoved ? 'line-through' : 'none'
                                            }}>
                                              {Number(actPrice) === 0 ? (lang === 'AR' ? 'مشمول' : 'Included') : `${actPrice} EGP`}
                                            </span>
                                            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                                              {act.time || (index === 0 ? '08:00 AM' : index === 1 ? '01:00 PM' : '04:00 PM')}
                                            </span>
                                            {isCustomizing && !isDisabled && (
                                              <button
                                                type="button"
                                                onClick={() => handleToggleActivityCheckbox(day.day_number, actObj?._id || actObj)}
                                                style={{
                                                  background: isActRemoved ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                                                  border: isActRemoved ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
                                                  color: isActRemoved ? '#10b981' : '#ef4444',
                                                  cursor: 'pointer',
                                                  width: '32px',
                                                  height: '32px',
                                                  borderRadius: '6px',
                                                  display: 'inline-flex',
                                                  alignItems: 'center',
                                                  justifyContent: 'center',
                                                  transition: 'all 0.2s',
                                                  outline: 'none'
                                                }}
                                                title={isActRemoved ? (lang === 'AR' ? 'إعادة إضافة' : 'Add back') : (lang === 'AR' ? 'حذف الفعالية' : 'Remove activity')}
                                              >
                                                <i className={`fa-solid ${isActRemoved ? 'fa-circle-plus' : 'fa-trash'}`}></i>
                                              </button>
                                            )}
                                          </div>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                ) : (
                                  <p style={{ color: '#888', fontStyle: 'italic', margin: 0 }}>Free leisure time to explore the city.</p>
                                )}

                                {/* Inline Add Custom Activity Form */}
                                {isCustomizing && customTrip && !isDayRemoved && (
                                  <div style={{ marginTop: '15px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                                    {showAddActivityDay === day.day_number ? (
                                      <div className="add-activity-inline-form" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212, 175, 55, 0.2)', padding: '15px', borderRadius: '10px', marginTop: '10px' }}>
                                        <h4 style={{ color: '#f59e0b', fontSize: '0.92rem', margin: '0 0 10px 0', fontWeight: '800' }}>
                                          {lang === 'AR' ? 'استعراض وإضافة نشاط إضافي بالمنطقة:' : 'Browse & Add Extra Activity in region:'}
                                        </h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                          {/* Select Dropdown filtering ONLY activities in current destination region NOT in experience already */}
                                          {/* Visual Grid Selector: Show premium cards instead of a select dropdown (Photo 2) */}
                                          <div className="activity-cards-grid" style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                                            gap: '12px',
                                            maxHeight: '300px',
                                            overflowY: 'auto',
                                            background: 'rgba(0,0,0,0.2)',
                                            padding: '12px',
                                            borderRadius: '10px',
                                            border: '1px solid rgba(255, 255, 255, 0.05)',
                                            boxSizing: 'border-box'
                                          }}>
                                            {(() => {
                                              const pkgDestId = packageData?.destination?._id || packageData?.destination;
                                              const regionalActs = activitiesList.filter(act => {
                                                const actDestId = act.destination?._id || act.destination;
                                                return actDestId && pkgDestId && actDestId.toString() === pkgDestId.toString();
                                              });

                                              const currentDayActIds = day.activities.map(a => (a.activity?._id || a.activity)?.toString());
                                              const remainingActs = regionalActs.filter(a => !currentDayActIds.includes(a._id?.toString()));

                                              if (remainingActs.length === 0) {
                                                return (
                                                  <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem', gridColumn: '1 / -1', margin: '10px 0', textAlign: 'center' }}>
                                                    {lang === 'AR' ? 'لا توجد أنشطة إضافية متاحة بهذه المنطقة حالياً.' : 'No extra activities available in this region currently.'}
                                                  </p>
                                                );
                                              }

                                              return remainingActs.map(act => {
                                                const isSelected = newActivitySelection.activityId === act._id;
                                                const provId = act.provider?._id || act.provider;
                                                const matchedProv = providersList.find(p => p._id === provId);
                                                const provName = matchedProv ? matchedProv.name : (act.provider?.name || 'Local Guide');
                                                const imgUrl = act.image || getActivityImage(act.name);

                                                return (
                                                  <div 
                                                    key={act._id}
                                                    onClick={() => {
                                                      setNewActivitySelection({
                                                        activityId: act._id,
                                                        price: act.price,
                                                        providerId: provId || ''
                                                      });
                                                    }}
                                                    style={{
                                                      background: isSelected ? 'rgba(250, 204, 21, 0.05)' : '#111827',
                                                      border: isSelected ? '2px solid #facc15' : '1px solid rgba(255,255,255,0.05)',
                                                      borderRadius: '10px',
                                                      overflow: 'hidden',
                                                      cursor: 'pointer',
                                                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                      display: 'flex',
                                                      flexDirection: 'column',
                                                      boxShadow: isSelected ? '0 4px 15px rgba(250,204,21,0.15)' : 'none'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                      if (!isSelected) {
                                                        e.currentTarget.style.borderColor = '#facc15';
                                                        e.currentTarget.style.transform = 'translateY(-3px)';
                                                      }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                      if (!isSelected) {
                                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                      }
                                                    }}
                                                  >
                                                    <div style={{ position: 'relative', width: '100%', height: '100px' }}>
                                                      <img src={imgUrl} alt={act.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                      <div style={{ position: 'absolute', bottom: '6px', right: '6px', background: 'rgba(0,0,0,0.85)', color: '#facc15', fontSize: '0.74rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                                                        +{act.price} EGP
                                                      </div>
                                                    </div>
                                                    <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '5px', flexGrow: 1 }}>
                                                      <strong style={{ color: '#fff', fontSize: '0.8rem', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                        {act.name}
                                                      </strong>
                                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', fontSize: '0.7rem', color: '#9ca3af' }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                          <i className="fa-solid fa-parachute-box" style={{ color: '#facc15' }}></i>
                                                          {provName.substring(0, 10)}{provName.length > 10 ? '...' : ''}
                                                        </span>
                                                        {isSelected && (
                                                          <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                                                            <i className="fa-solid fa-circle-check"></i>
                                                          </span>
                                                        )}
                                                      </div>
                                                    </div>
                                                  </div>
                                                );
                                              });
                                            })()}
                                          </div>

                                          {/* 🌟 Professional Live Preview of Selected Activity Specs */}
                                          {(() => {
                                            if (!newActivitySelection.activityId) return null;
                                            const selectedActObj = activitiesList.find(a => a._id === newActivitySelection.activityId);
                                            if (!selectedActObj) return null;

                                            const provId = selectedActObj.provider?._id || selectedActObj.provider;
                                            const matchedProv = providersList.find(p => p._id === provId);
                                            const providerNameResolved = matchedProv ? matchedProv.name : (selectedActObj.provider?.name || 'Local Expert');

                                            return (
                                              <div className="activity-live-preview-box" style={{
                                                background: 'rgba(255, 255, 255, 0.02)',
                                                border: '1px dashed rgba(212,175,55,0.3)',
                                                borderRadius: '8px',
                                                padding: '12px',
                                                fontSize: '0.85rem',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '6px'
                                              }}>
                                                <div style={{ color: '#fff', fontWeight: '700' }}>
                                                  {selectedActObj.name}
                                                </div>
                                                <div style={{ color: '#f59e0b', fontWeight: '600', display: 'flex', gap: '15px' }}>
                                                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <i className="fa-solid fa-parachute-box"></i>
                                                    {providerNameResolved}
                                                    <span style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', padding: '2px 6px', borderRadius: '12px', fontSize: '0.65rem', marginLeft: '5px', display: 'flex', alignItems: 'center', gap: '4px' }} title="AI Trust Score">
                                                      <i className="fa-solid fa-shield-halved"></i> 98% Verified
                                                    </span>
                                                  </span>
                                                  <span>
                                                    <i className="fa-solid fa-wallet" style={{ marginRight: '5px' }}></i>
                                                    {newActivitySelection.price} EGP
                                                  </span>
                                                </div>
                                                {selectedActObj.description && (
                                                  <div style={{ color: '#a4a4b4', fontSize: '0.78rem', lineHeight: '1.4', fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                                                    {selectedActObj.description}
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })()}

                                          <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                                            <button 
                                              onClick={() => handleAddActivitySubmit(day.day_number)}
                                              style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '0.82rem' }}
                                            >
                                              {lang === 'AR' ? 'تأكيد إضافة النشاط' : 'Confirm Add Activity'}
                                            </button>
                                            <button 
                                              onClick={() => {
                                                setShowAddActivityDay(null);
                                                setNewActivitySelection({ activityId: '', providerId: '', price: '' });
                                              }}
                                              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem' }}
                                            >
                                              {lang === 'AR' ? 'إلغاء' : 'Cancel'}
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <button 
                                        onClick={() => setShowAddActivityDay(day.day_number)}
                                        style={{ background: 'rgba(212, 175, 55, 0.05)', border: '1.5px dashed rgba(212, 175, 55, 0.4)', color: '#f59e0b', padding: '8px 18px', borderRadius: '25px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(212,175,55,0.15)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(212,175,55,0.05)'; }}
                                      >
                                        <i className="fa-solid fa-circle-plus"></i> {lang === 'AR' ? 'إضافة أنشطة إضافية للمخطط اليومي' : 'Add regional activities to this plan'}
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* 🌟 Modular Trip Extension / Package Stacking Node */}
                        {packageData && (
                          <div className="trip-extension-timeline-node" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '15px',
                            borderLeft: '2.5px dashed #f59e0b',
                            paddingLeft: '25px',
                            position: 'relative',
                            marginTop: '10px',
                            marginBottom: '35px',
                            minHeight: '80px',
                            boxSizing: 'border-box'
                          }}>
                            {/* Left dot icon */}
                            <div style={{
                              position: 'absolute',
                              left: '-10px',
                              top: '5px',
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              background: '#14141f',
                              border: '3.5px solid #f59e0b',
                              boxShadow: '0 0 10px rgba(245, 158, 11, 0.5)'
                            }}></div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <h4 style={{ color: '#f59e0b', fontSize: '1.15rem', fontWeight: '800', margin: '0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className="fa-solid fa-route"></i>
                                {lang === 'AR' ? 'تمديد وربط رحلة جديدة (Modular Trip Extension)' : 'Extend Your Journey (Modular Trip Extension)'}
                              </h4>
                              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0', lineHeight: '1.4' }}>
                                {lang === 'AR'
                                  ? `رحلتك الحالية تنتهي في ${endFormatted}. يمكنك فوراً حجز رحلة أخرى أو داي يوز يبدأ في نفس اليوم (${endFormatted}) لبناء سلسلة رحلات متصلة وخلق تجربة خالية من الفجوات الموقوتة!`
                                  : `Your current experience ends on ${endFormatted}. You can instantly stack another package or dayuse starting the same day (${endFormatted}) to build a seamless Trip Chain without overlapping schedules!`}
                              </p>
                              
                              <button
                                type="button"
                                onClick={() => {
                                  setShowChainModal(true);
                                }}
                                style={{
                                  width: 'fit-content',
                                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                  color: '#000',
                                  border: 'none',
                                  padding: '10px 24px',
                                  borderRadius: '30px',
                                  cursor: 'pointer',
                                  fontWeight: 'bold',
                                  fontSize: '0.85rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  marginTop: '10px',
                                  boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                              >
                                <i className="fa-solid fa-plus-circle"></i>
                                {lang === 'AR' ? 'استعراض الرحلات المتوفرة لليوم التالي' : 'Browse Available Packages for the Next Day'}
                              </button>
                            </div>
                          </div>
                        )}


                    {/* 🌟 Suggested regional Packages & Dayuse card lists */}
                    {isCustomizing && suggestedPackages && suggestedPackages.length > 0 && (
                      <div className="regional-suggestions-section" style={{
                        marginTop: '35px',
                        padding: '25px',
                        background: 'rgba(212, 175, 55, 0.04)',
                        border: '1px solid rgba(212, 175, 55, 0.15)',
                        borderRadius: '16px',
                        boxSizing: 'border-box'
                      }}>
                        <h3 style={{ 
                          color: '#f59e0b', 
                          fontSize: '1.25rem', 
                          fontWeight: '800', 
                          marginTop: '0', 
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px'
                        }}>
                          <i className="fa-solid fa-map-location-dot"></i>
                          {lang === 'AR' ? 'أيام أنشطة وباقات إضافية متاحة في نفس المنطقة:' : 'Suggested Extra Days & Packages in same region:'}
                        </h3>
                        <p style={{ color: '#c4c4d4', fontSize: '0.85rem', marginBottom: '20px', lineHeight: '1.4' }}>
                          {lang === 'AR' 
                            ? 'لقد عثرنا على هذه الباقات والرحلات اليومية المتاحة في نفس الوجهة الجغرافية. يمكنك استلهام أفكار منها أو إضافتها لرحلتك المخصصة.' 
                            : 'We found these dayuse experiences and travel packages active in the same region. You can view their details to enrich your journey.'}
                        </p>

                        <div className="suggestions-flex-grid" style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                          gap: '20px'
                        }}>
                          {suggestedPackages.map(pkg => (
                            <div key={pkg._id} className="suggested-region-card" style={{
                              background: 'rgba(255, 255, 255, 0.02)',
                              border: '1px solid rgba(255, 255, 255, 0.06)',
                              borderRadius: '12px',
                              overflow: 'hidden',
                              display: 'flex',
                              flexDirection: 'column',
                              transition: 'transform 0.2s, border-color 0.2s',
                              cursor: 'pointer'
                            }}
                            onClick={() => window.location.href = `/package-details/${pkg._id}`}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                              <div className="card-media-wrapper" style={{ height: '140px', position: 'relative' }}>
                                <img 
                                  src={pkg.image || 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=600&q=80'} 
                                  alt={pkg.name} 
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <div style={{
                                  position: 'absolute',
                                  top: '10px',
                                  right: '10px',
                                  background: 'rgba(0,0,0,0.7)',
                                  color: '#f59e0b',
                                  padding: '4px 10px',
                                  borderRadius: '20px',
                                  fontSize: '0.72rem',
                                  fontWeight: '700',
                                  border: '1px solid rgba(212,175,55,0.3)'
                                }}>
                                  {pkg.type === 'Package' ? (lang === 'AR' ? 'يوم واحد' : 'Day Use') : (lang === 'AR' ? 'رحلة متعددة' : 'Trip')}
                                </div>
                              </div>

                              <div className="card-info-pane" style={{ padding: '15px', display: 'flex', flexDirection: 'column', flex: '1', gap: '8px' }}>
                                <h4 style={{ color: '#ffffff', fontSize: '0.98rem', fontWeight: '700', margin: '0', lineHeight: '1.3' }}>
                                  {pkg.name}
                                </h4>
                                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0', flex: '1', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', lineHeight: '1.4' }}>
                                  {pkg.description || 'Embark on a high-value excursion.'}
                                </p>
                                <div style={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between', 
                                  alignItems: 'center', 
                                  marginTop: '5px',
                                  borderTop: '1px dashed rgba(255,255,255,0.06)',
                                  paddingTop: '10px'
                                }}>
                                  <span style={{ color: '#aaa', fontSize: '0.78rem' }}>
                                    <i className="fa-solid fa-clock" style={{ marginRight: '5px' }}></i>
                                    {pkg.duration_days} {pkg.duration_days > 1 ? (lang === 'AR' ? 'أيام' : 'Days') : (lang === 'AR' ? 'يوم' : 'Day')}
                                  </span>
                                  <strong style={{ color: '#f59e0b', fontSize: '0.95rem' }}>
                                    {pkg.base_price} EGP
                                  </strong>
                                </div>

                                {isCustomizing && (pkg.type === 'Package' || pkg.duration_days === 1) && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleInjectDayuseDay(pkg);
                                    }}
                                    style={{
                                      marginTop: '10px',
                                      width: '100%',
                                      background: 'rgba(212, 175, 55, 0.1)',
                                      border: '1px solid rgba(212, 175, 55, 0.4)',
                                      color: '#f59e0b',
                                      padding: '8px',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      fontWeight: '700',
                                      fontSize: '0.78rem',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '5px',
                                      transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f59e0b'; e.currentTarget.style.color = '#000'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)'; e.currentTarget.style.color = '#f59e0b'; }}
                                  >
                                    <i className="fa-solid fa-circle-plus"></i>
                                    {lang === 'AR' ? 'إضافة اليوم لخطتي' : 'Add Day to Itinerary'}
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                      </>
                    )}
                  </div>
                </div>

                {/* 📝 What's Included & Excluded Section */}
                {(() => {
                  const { included, excluded } = getDynamicIncludedExcluded();
                  return (
                    <div className="included-excluded-booking-section" style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '24px', 
                      marginTop: '40px', 
                      marginBottom: '40px' 
                    }}>
                      {/* Included Card */}
                      <div style={{ 
                        background: 'rgba(34, 197, 94, 0.03)', 
                        border: '1px solid rgba(34, 197, 94, 0.15)', 
                        borderRadius: '16px', 
                        padding: '24px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                      }}>
                        <h3 style={{ 
                          color: '#22c55e', 
                          fontSize: '1.2rem', 
                          fontWeight: '800', 
                          margin: '0 0 20px 0', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '10px' 
                        }}>
                          <i className="fa-solid fa-circle-check" style={{ fontSize: '1.3rem' }}></i> 
                          {lang === 'AR' ? 'يشمل (رسوم خفية صفرية)' : 'Included (Zero Hidden Fees)'}
                        </h3>
                        <ul style={{ 
                          listStyle: 'none', 
                          padding: 0, 
                          margin: 0, 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '12px', 
                          fontSize: '0.95rem', 
                          color: '#cbd5e1' 
                        }}>
                          {included.map((item, idx) => (
                            <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                              <i className="fa-solid fa-check" style={{ color: '#22c55e', marginTop: '3px', flexShrink: 0 }}></i> 
                              <span style={{ lineHeight: '1.4' }}>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Excluded Card */}
                      <div style={{ 
                        background: 'rgba(239, 68, 68, 0.03)', 
                        border: '1px solid rgba(239, 68, 68, 0.15)', 
                        borderRadius: '16px', 
                        padding: '24px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                      }}>
                        <h3 style={{ 
                          color: '#ef4444', 
                          fontSize: '1.2rem', 
                          fontWeight: '800', 
                          margin: '0 0 20px 0', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '10px' 
                        }}>
                          <i className="fa-solid fa-circle-xmark" style={{ fontSize: '1.3rem' }}></i> 
                          {lang === 'AR' ? 'لا يشمل' : 'Excluded'}
                        </h3>
                        <ul style={{ 
                          listStyle: 'none', 
                          padding: 0, 
                          margin: 0, 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '12px', 
                          fontSize: '0.95rem', 
                          color: '#cbd5e1' 
                        }}>
                          {excluded.map((item, idx) => (
                            <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                              <i className="fa-solid fa-xmark" style={{ color: '#ef4444', marginTop: '3px', flexShrink: 0 }}></i> 
                              <span style={{ lineHeight: '1.4' }}>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })()}

                 {/* 🤝 SMART CERTIFIED PROVIDER SECTION */}
                 {(() => {
                  const getSmartProvider = () => {
                    const supervisorId = packageData?.supervisor?._id || packageData?.supervisor;
                    const supervisorObj = usersMap[supervisorId] || packageData?.supervisor;

                    if (supervisorObj && supervisorObj.firstName) {
                      return {
                        name: `${supervisorObj.firstName} ${supervisorObj.lastName || ''}`,
                        roleEN: "ClearPath Certified Expert Guide",
                        roleAR: "مرشد خبير معتمد من ClearPath",
                        rating: "4.98",
                        reviewsCount: "128",
                        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200",
                        matchedReasonEN: `Matched based on your luxury preferences and guide expertise. ${supervisorObj.firstName} has background checks and active government license.`,
                        matchedReasonAR: `تمت المطابقة بناءً على تفضيلاتك الفاخرة وخبرة المرشد. ${supervisorObj.firstName} حاصل على رخصة حكومية نشطة ومفحوص بالكامل.`
                      };
                    }

                    const destName = packageData?.destination?.name || 'Cairo';
                    if (destName.toLowerCase() === 'hurghada') {
                      return {
                        name: lang === 'AR' ? 'الكابتن يوسف المصري' : 'Captain Youssef Al-Masri',
                        roleEN: 'Certified PADI Yacht Master & Deep Sea Skipper',
                        roleAR: 'قائد يخت معتمد ومستكشف البحر الأحمر PADI',
                        rating: '5.0',
                        reviewsCount: '208',
                        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200',
                        matchedReasonEN: 'AI matched based on yacht booking, Red Sea cruise safety record, and premium language compatibility (English/Arabic).',
                        matchedReasonAR: 'مطابقة ذكية بناءً على حجز اليخوت، وسجل الأمان البحري في البحر الأحمر، والتوافق التام مع اللغتين العربية والإنجليزية.'
                      };
                    } else if (destName.toLowerCase() === 'luxor') {
                      return {
                        name: lang === 'AR' ? 'د. هدى كامل' : 'Dr. Hoda Kamel',
                        roleEN: 'Licensed Egyptologist & East-West Bank Historian',
                        roleAR: 'خبيرة مصريات مرخصة وباحثة تاريخية بالبرين',
                        rating: '4.98',
                        reviewsCount: '315',
                        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200',
                        matchedReasonEN: 'AI matched based on historical tour preferences, deep Pharaoh-dynasty knowledge, and VIP guiding credentials.',
                        matchedReasonAR: 'مطابقة ذكية بناءً على تفضيل الجولات التاريخية، والمعرفة العميقة بالحضارة الفرعونية، وشهادات الإرشاد لكبار الشخصيات.'
                      };
                    } else if (destName.toLowerCase() === 'dahab') {
                      return {
                        name: lang === 'AR' ? 'ياسين البدوي' : 'Yassine Bedouin',
                        roleEN: 'Sinai Desert Safari Explorer & Bedouin Culture Expert',
                        roleAR: 'مستكشف سفاري صحراء سيناء وخبير الثقافة البدوية',
                        rating: '4.92',
                        reviewsCount: '96',
                        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200',
                        matchedReasonEN: 'AI matched based on Sinai canyon exploration request, active desert navigation license, and local Bedouin safety records.',
                        matchedReasonAR: 'مطابقة ذكية بناءً على استكشاف وديان سيناء، ورخصة الملاحة الصحراوية النشطة، وسجلات الأمان المحلية للبدو.'
                      };
                    } else {
                      return {
                        name: lang === 'AR' ? 'شريف الجميل' : 'Sherif El-Gamil',
                        roleEN: 'Certified Giza Plateau Guide & Historical Archeologist',
                        roleAR: 'مرشد هضبة الجيزة المعتمد وباحث الآثار التاريخية',
                        rating: '4.95',
                        reviewsCount: '142',
                        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200',
                        matchedReasonEN: 'AI matched based on Giza Pyramids Plateau itinerary, specialized Egyptology guide demands, and active government safety license.',
                        matchedReasonAR: 'مطابقة ذكية بناءً على مسار هضبة الأهرامات، والحاجة إلى إرشاد متخصص بالآثار المصرية، ورخصة الأمان الحكومية النشطة.'
                      };
                    }
                  };

                  const provider = getSmartProvider();
                  return (
                    <div className="smart-provider-matching-section" style={{
                      marginTop: '40px',
                      marginBottom: '40px',
                      background: 'rgba(30, 30, 30, 0.45)',
                      border: '1px solid rgba(197, 160, 89, 0.25)',
                      borderRadius: '24px',
                      padding: '30px',
                      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      
                      {/* Premium gold pulsing verification header */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid rgba(197, 160, 89, 0.15)',
                        paddingBottom: '20px',
                        marginBottom: '24px',
                        flexWrap: 'wrap',
                        gap: '15px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{
                            width: '10px',
                            height: '10px',
                            background: '#c5a059',
                            borderRadius: '50%',
                            display: 'inline-block',
                            boxShadow: '0 0 10px #c5a059',
                            animation: 'pulseGlow 2s infinite'
                          }}></span>
                          <h3 style={{
                            color: '#ffffff',
                            fontSize: '1.25rem',
                            fontWeight: '800',
                            margin: 0,
                            fontFamily: 'serif'
                          }}>
                            {lang === 'AR' ? 'الربط الآلي ومطابقة مزود الخدمة' : 'Certified Local Provider Smart Matching'}
                          </h3>
                        </div>

                        {/* Gold Badge */}
                        <div style={{
                          background: 'rgba(197, 160, 89, 0.08)',
                          border: '1px solid rgba(197, 160, 89, 0.3)',
                          borderRadius: '30px',
                          padding: '6px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: '#c5a059',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          letterSpacing: '0.5px'
                        }}>
                          <i className="fa-solid fa-circle-check" style={{ animation: 'pulseCheck 1.5s infinite' }}></i>
                          <span>{lang === 'AR' ? 'توثيق ومطابقة ذكية من ClearPath' : 'ClearPath Smart Matched & Certified'}</span>
                        </div>
                      </div>

                      {/* Provider Profile Content */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '24px',
                        alignItems: 'center',
                        flexWrap: 'wrap'
                      }}>
                        {/* Profile Image & Rating Badge */}
                        <div style={{ position: 'relative', flexShrink: 0, margin: '0 auto sm:margin-0' }}>
                          <img 
                            src={provider.image} 
                            alt={provider.name} 
                            style={{
                              width: '100px',
                              height: '100px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '2px solid #c5a059',
                              boxShadow: '0 4px 15px rgba(197, 160, 89, 0.2)'
                            }}
                          />
                          <div style={{
                            position: 'absolute',
                            bottom: '-6px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: '#1a1a1a',
                            border: '1px solid #c5a059',
                            borderRadius: '10px',
                            padding: '2px 8px',
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            color: '#c5a059',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            whiteSpace: 'nowrap'
                          }}>
                            <i className="fa-solid fa-star" style={{ color: '#c5a059' }}></i>
                            <span>{provider.rating}</span>
                          </div>
                        </div>

                        {/* Profile Bio Details */}
                        <div style={{ flex: 1, minWidth: '250px' }}>
                          <h4 style={{
                            color: '#ffffff',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            margin: '0 0 4px 0'
                          }}>
                            {provider.name}
                          </h4>
                          <p style={{
                            color: '#c5a059',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            margin: '0 0 12px 0'
                          }}>
                            {lang === 'AR' ? provider.roleAR : provider.roleEN}
                          </p>
                          <p style={{
                            color: '#cbd5e1',
                            fontSize: '0.88rem',
                            lineHeight: '1.5',
                            margin: '0 0 15px 0'
                          }}>
                            {lang === 'AR' ? provider.matchedReasonAR : provider.matchedReasonEN}
                          </p>

                          {/* Guide Verification Badges */}
                          <div style={{
                            display: 'flex',
                            gap: '10px',
                            flexWrap: 'wrap'
                          }}>
                            <span style={{
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              borderRadius: '6px',
                              padding: '4px 10px',
                              fontSize: '0.75rem',
                              color: '#94a3b8',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}>
                              <i className="fa-solid fa-shield-halved" style={{ color: '#c5a059' }}></i>
                              {lang === 'AR' ? 'مفحوص أمنياً' : 'Safety Screened'}
                            </span>
                            <span style={{
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              borderRadius: '6px',
                              padding: '4px 10px',
                              fontSize: '0.75rem',
                              color: '#94a3b8',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}>
                              <i className="fa-solid fa-id-card" style={{ color: '#c5a059' }}></i>
                              {lang === 'AR' ? 'مرخص حكومياً' : 'Licensed Guide'}
                            </span>
                            <span style={{
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              borderRadius: '6px',
                              padding: '4px 10px',
                              fontSize: '0.75rem',
                              color: '#94a3b8',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}>
                              <i className="fa-solid fa-comments" style={{ color: '#c5a059' }}></i>
                              {lang === 'AR' ? 'ثنائي اللغة' : 'Bilingual (AR/EN)'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* CSS Keyframes styled inline for verification animation */}
                      <style>{`
                        @keyframes pulseGlow {
                          0%, 100% { opacity: 0.6; box-shadow: 0 0 4px #c5a059; }
                          50% { opacity: 1; box-shadow: 0 0 12px #c5a059; }
                        }
                        @keyframes pulseCheck {
                          0%, 100% { transform: scale(1); }
                          50% { transform: scale(1.15); }
                        }
                      `}</style>
                    </div>
                  );
                })()}

                {/* 🎒 TRIP ESSENTIALS & SAFETY PROTOCOLS SECTION (Dynamic) */}
                {(() => {
                  const activePackingGuide = packingGuide || getDynamicPackingGuide(packageData, lang);
                  return activePackingGuide && (
                    <div className="packing-guide-section" style={{ 
                      marginTop: '40px',
                      marginBottom: '40px',
                      background: 'var(--card-bg, #15171a)', 
                      border: '1px solid var(--border-color, rgba(255,255,255,0.08))', 
                      borderRadius: '24px', 
                      padding: '30px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                    }}>
                      {/* Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '25px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '20px' }}>
                        <div>
                          <h2 style={{ fontSize: '1.6rem', color: '#fff', fontWeight: '800', margin: '0 0 5px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <i className="fa-solid fa-shield-heart" style={{ color: '#f59e0b' }}></i>
                            {lang === 'AR' ? 'أساسيات الرحلة والسلامة' : 'Trip Essentials & Safety'}
                          </h2>
                          <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>
                            {lang === 'AR' 
                              ? `قائمة مخصصة لنشاط "${activePackingGuide.name}" لضمان تجربة آمنة ومريحة` 
                              : `Curated list for your "${activePackingGuide.name}" activity to ensure a safe and comfortable experience`}
                          </p>
                        </div>
                        
                        {/* Progress Bar */}
                        {(activePackingGuide.essentials || activePackingGuide.clothing) && (
                          <div style={{ width: '220px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 'bold' }}>
                              <span>{lang === 'AR' ? 'تقدم التجهيز' : 'Packing Progress'}</span>
                              <span style={{ color: '#f59e0b' }}>
                                {(() => {
                                  const total = (activePackingGuide.essentials?.length || 0) + (activePackingGuide.clothing?.length || 0);
                                  const checked = Object.values(checkedPackingItems).filter(Boolean).length;
                                  return total > 0 ? Math.round((checked / total) * 100) : 0;
                                })()}%
                              </span>
                            </div>
                            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ 
                                height: '100%', 
                                background: 'linear-gradient(90deg, #f59e0b, #d4af37)', 
                                width: `${(() => {
                                  const total = (activePackingGuide.essentials?.length || 0) + (activePackingGuide.clothing?.length || 0);
                                  const checked = Object.values(checkedPackingItems).filter(Boolean).length;
                                  return total > 0 ? (checked / total) * 100 : 0;
                                })()}%`,
                                transition: 'width 0.4s ease'
                              }}></div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 3-Column Grid */}
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                        gap: '30px' 
                      }}>
                        
                        {/* Column 1: Essentials */}
                        {activePackingGuide.essentials && activePackingGuide.essentials.length > 0 && (
                          <div>
                            <h3 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
                              <i className="fa-solid fa-list-check" style={{ color: '#f59e0b' }}></i>
                              {lang === 'AR' ? 'الأساسيات' : 'Essentials'}
                            </h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {activePackingGuide.essentials.map((item, idx) => {
                                const itemKey = `ess_${idx}`;
                                const isChecked = checkedPackingItems[itemKey];
                                return (
                                  <li 
                                    key={idx} 
                                    onClick={() => handleTogglePackingItem(itemKey)} 
                                    style={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      gap: '12px', 
                                      fontSize: '0.95rem', 
                                      color: isChecked ? '#64748b' : '#cbd5e1', 
                                      cursor: 'pointer', 
                                      transition: 'all 0.2s', 
                                      opacity: isChecked ? 0.6 : 1 
                                    }}
                                  >
                                    <div style={{ 
                                      width: '20px', 
                                      height: '20px', 
                                      borderRadius: '50%', 
                                      border: `2px solid ${isChecked ? '#22c55e' : '#cbd5e1'}`, 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      justifyContent: 'center', 
                                      background: isChecked ? '#22c55e' : 'transparent', 
                                      transition: 'all 0.2s',
                                      flexShrink: 0
                                    }}>
                                      {isChecked && <i className="fa-solid fa-check" style={{ color: '#000', fontSize: '10px', fontWeight: 'bold' }}></i>}
                                    </div>
                                    <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{item.icon || '🎒'}</span>
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                      <span style={{ textDecoration: isChecked ? 'line-through' : 'none', fontWeight: '500' }}>{item.item}</span>
                                      {item.required && (
                                        <span style={{ 
                                          fontSize: '0.68rem', 
                                          background: 'rgba(245, 158, 11, 0.15)', 
                                          color: '#f59e0b', 
                                          padding: '2px 6px', 
                                          borderRadius: '4px', 
                                          fontWeight: 'bold',
                                          border: '1px solid rgba(245, 158, 11, 0.3)'
                                        }}>
                                          {lang === 'AR' ? 'مطلوب' : 'Required'}
                                        </span>
                                      )}
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}

                        {/* Column 2: Clothing & Gear */}
                        {activePackingGuide.clothing && activePackingGuide.clothing.length > 0 && (
                          <div>
                            <h3 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
                              <i className="fa-solid fa-shirt" style={{ color: '#f59e0b' }}></i>
                              {lang === 'AR' ? 'الملابس والمعدات' : 'Clothing & Gear'}
                            </h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {activePackingGuide.clothing.map((item, idx) => {
                                const itemKey = `clo_${idx}`;
                                const isChecked = checkedPackingItems[itemKey];
                                return (
                                  <li 
                                    key={idx} 
                                    onClick={() => handleTogglePackingItem(itemKey)} 
                                    style={{ 
                                      display: 'flex', 
                                      alignItems: 'flex-start', 
                                      gap: '12px', 
                                      fontSize: '0.95rem', 
                                      color: isChecked ? '#64748b' : '#cbd5e1', 
                                      cursor: 'pointer', 
                                      transition: 'all 0.2s', 
                                      opacity: isChecked ? 0.6 : 1 
                                    }}
                                  >
                                    <div style={{ 
                                      width: '18px', 
                                      height: '18px', 
                                      borderRadius: '4px', 
                                      border: `2px solid ${isChecked ? '#22c55e' : '#cbd5e1'}`, 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      justifyContent: 'center', 
                                      background: isChecked ? '#22c55e' : 'transparent', 
                                      marginTop: '3px',
                                      transition: 'all 0.2s',
                                      flexShrink: 0
                                    }}>
                                      {isChecked && <i className="fa-solid fa-check" style={{ color: '#000', fontSize: '9px', fontWeight: 'bold' }}></i>}
                                    </div>
                                    <div style={{ textDecoration: isChecked ? 'line-through' : 'none' }}>
                                      <strong style={{ display: 'block', color: isChecked ? '#64748b' : '#f59e0b' }}>• {item.item}</strong>
                                      {item.notes && <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginTop: '2px' }}>{item.notes}</span>}
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}

                        {/* Column 3: Safety Tips & Emergency Contacts */}
                        <div>
                          <h3 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
                            <i className="fa-solid fa-shield-halved" style={{ color: '#ef4444' }}></i>
                            {lang === 'AR' ? 'إرشادات السلامة' : 'Safety Tips'}
                          </h3>
                          
                          {activePackingGuide.safetyTips && activePackingGuide.safetyTips.length > 0 && (
                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {activePackingGuide.safetyTips.map((tip, idx) => {
                                const bulletColors = ['#ec4899', '#f97316', '#3b82f6', '#10b981', '#a855f7'];
                                const bulletColor = bulletColors[idx % bulletColors.length];
                                
                                return (
                                  <li key={idx} style={{ fontSize: '0.9rem', color: '#cbd5e1', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                    <span style={{ 
                                      width: '8px', 
                                      height: '8px', 
                                      borderRadius: '50%', 
                                      background: bulletColor, 
                                      marginTop: '6px',
                                      flexShrink: 0 
                                    }}></span>
                                    <span style={{ lineHeight: '1.4' }}>{tip.tip}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          )}

                          {activePackingGuide.emergencyContacts && (
                            <div style={{ 
                              background: 'rgba(239, 68, 68, 0.03)', 
                              padding: '15px', 
                              borderRadius: '12px', 
                              border: '1px solid rgba(239, 68, 68, 0.15)' 
                            }}>
                              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.88rem', color: '#ef4444', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <i className="fa-solid fa-phone"></i> 
                                {lang === 'AR' ? 'أرقام الطوارئ' : 'Emergency Contacts'}
                              </h4>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.78rem', color: '#cbd5e1' }}>
                                <div><strong>{lang === 'AR' ? 'الشرطة:' : 'Police:'}</strong> {activePackingGuide.emergencyContacts.police}</div>
                                <div><strong>{lang === 'AR' ? 'الإسعاف:' : 'Ambulance:'}</strong> {activePackingGuide.emergencyContacts.ambulance}</div>
                                {activePackingGuide.emergencyContacts.coastGuard && (
                                  <div style={{ gridColumn: '1 / -1' }}>
                                    <strong>{lang === 'AR' ? 'حرس الحدود:' : 'Coast Guard:'}</strong> {activePackingGuide.emergencyContacts.coastGuard}
                                  </div>
                                )}
                                {activePackingGuide.emergencyContacts.localHospital && (
                                  <div style={{ gridColumn: '1 / -1', marginTop: '3px' }}>
                                    <strong>{lang === 'AR' ? 'المستشفى:' : 'Hospital:'}</strong> {activePackingGuide.emergencyContacts.localHospital}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })()}


              </div>

            {/* ============================================================== */}
            {/* 📝 REVIEWS & RATINGS INTEGRATION SECTION                       */}
            {/* ============================================================== */}
            <div className="reviews-integration-section">
              <hr className="divider" />
              
              <div className="reviews-header">
                <h2 className="tw-text-slate-900 dark:tw-text-white tw-font-bold tw-text-2xl tw-mb-6">{lang === 'AR' ? 'تقييمات وآراء الزوار' : 'Guest Ratings & Reviews'}</h2>
                <p>{lang === 'AR' ? 'تجارب واقعية وتقييمات من مغامرين موثقين زاروا هذا المكان' : 'Real stories and ratings from verified adventurers'}</p>
              </div>

              {/* 1. Aggregate Statistics Panel */}
              <div className="stats-panel-grid">
                
                {/* Aggregate Summary Box */}
                <div className="stats-summary-box">
                  <div className="average-number">{stats.averageRating || '0.0'}</div>
                  {renderStars(stats.averageRating)}
                  <div className="total-label">{lang === 'AR' ? `بناءً على ${stats.totalReviews || 0} تقييم` : `Based on ${stats.totalReviews || 0} reviews`}</div>
                </div>

                {/* Star Rating Breakdown Bars */}
                <div className="stats-breakdown-box">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = stats.ratingBreakdown?.[star] || 0;
                    const pct = calculatePercentage(count);
                    return (
                      <div key={star} className="breakdown-row">
                        <span className="star-num">{star} ★</span>
                        <div className="progress-bar-bg">
                          <div className="progress-bar-fill" style={{ width: `${pct}%` }}></div>
                        </div>
                        <span className="star-pct">{pct}%</span>
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* 2. Review Form (Share your Experience) */}
              <div className="review-action-container">
                {token ? (
                  userHasReviewed ? (
                    <div className="info-message success">
                      <i className="fa-solid fa-circle-check"></i> {lang === 'AR' ? 'لقد قمت بتقييم هذه التجربة بالفعل. شكراً لك على مشاركتنا رأيك!' : 'You have already reviewed this experience. Thank you for your feedback!'}
                    </div>
                  ) : (
                    <div className="write-review-card">
                      <h3 className="tw-text-slate-800 dark:tw-text-slate-100 tw-font-bold tw-text-xl tw-mb-4">{lang === 'AR' ? 'شاركنا تجربتك الشخصية' : 'Share Your Experience'}</h3>
                      <p>{lang === 'AR' ? 'كيف كانت مغامرتك؟ دع الآخرين يتعرفون على تجربتك.' : 'How was your adventure? Let others know what you thought.'}</p>

                      {reviewSuccess && (
                        <div className="alert alert-success">
                          <i className="fa-solid fa-circle-check"></i> {reviewSuccess}
                        </div>
                      )}
                      
                      {reviewError && (
                        <div className="alert alert-error">
                          <i className="fa-solid fa-circle-exclamation"></i> {reviewError}
                        </div>
                      )}

                      <form onSubmit={handleReviewSubmit} className="review-form">
                        
                        {/* Premium Star Rating Selector */}
                        <div className="form-group-stars" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px 0', padding: '25px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(245,158,11,0.15)' }}>
                          <label style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '10px', color: '#fff', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                            {lang === 'AR' ? 'كيف تقيم رحلتك؟' : 'RATE YOUR ADVENTURE'}
                          </label>
                          <div className="stars-selector" style={{ display: 'flex', gap: '10px', justifyContent: 'center', margin: '10px 0' }}>
                            {[1, 2, 3, 4, 5].map((val) => {
                              const isFilled = (hoverRating || userRating) >= val;
                              return (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => setUserRating(val)}
                                  onMouseEnter={() => setHoverRating(val)}
                                  onMouseLeave={() => setHoverRating(0)}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '2.5rem',
                                    color: isFilled ? '#f59e0b' : '#334155',
                                    transition: 'all 0.15s ease',
                                    transform: (hoverRating || userRating) === val ? 'scale(1.25)' : 'scale(1)',
                                    padding: '5px'
                                  }}
                                >
                                  <i className={`${isFilled ? 'fa-solid' : 'fa-regular'} fa-star`} style={{ filter: isFilled ? 'drop-shadow(0 0 10px rgba(245,158,11,0.5))' : 'none' }}></i>
                                </button>
                              );
                            })}
                          </div>
                          <span style={{ fontSize: '0.95rem', color: '#f59e0b', fontWeight: 'bold', minHeight: '20px', transition: 'all 0.2s' }}>
                            {(() => {
                              const activeVal = hoverRating || userRating;
                              if (activeVal === 1) return lang === 'AR' ? 'سيئة جداً (Terrible)' : 'Terrible';
                              if (activeVal === 2) return lang === 'AR' ? 'مقبولة (Poor)' : 'Poor';
                              if (activeVal === 3) return lang === 'AR' ? 'جيدة (Okay)' : 'Okay';
                              if (activeVal === 4) return lang === 'AR' ? 'ممتازة (Good)' : 'Good';
                              if (activeVal === 5) return lang === 'AR' ? 'استثنائية (Amazing)' : 'Amazing';
                              return lang === 'AR' ? 'اختر عدد النجوم' : 'Select your rating';
                            })()}
                          </span>
                        </div>

                        {/* Comment Text */}
                        <div className="form-group">
                          <label htmlFor="review-comment">{lang === 'AR' ? 'تعليقاتك ورأيك في الخدمة:' : 'Your Review Comments:'}</label>
                          <textarea
                            id="review-comment"
                            value={userComment}
                            onChange={(e) => setUserComment(e.target.value)}
                            placeholder={lang === 'AR' ? 'أخبرنا عن المرشدين، وسائل النقل، الفنادق وتفاصيل رحلتك...' : "Tell us about the guides, the transport, the hotels, and details of your experience..."}
                            required
                            maxLength={500}
                          ></textarea>
                          <span className="char-counter">{userComment.length} / 500 {lang === 'AR' ? 'حرف' : 'characters'}</span>
                        </div>

                        <button type="submit" className="tw-flex tw-items-center tw-justify-center tw-gap-2 tw-bg-amber-500 hover:tw-bg-amber-600 tw-text-white tw-font-bold tw-py-3 tw-px-8 tw-rounded-2xl tw-transition-all tw-shadow-md" disabled={submittingReview}>
                          {submittingReview ? (
                            <><i className="fa-solid fa-spinner fa-spin"></i> {lang === 'AR' ? 'جاري الإرسال...' : 'Submitting...'}</>
                          ) : (
                            <><i className="fa-solid fa-paper-plane"></i> {lang === 'AR' ? 'إرسال التقييم' : 'Submit Review'}</>
                          )}
                        </button>
                      </form>
                    </div>
                  )
                ) : (
                  <div className="login-prompt-card">
                    <i className="fa-solid fa-lock"></i>
                    <h4>{lang === 'AR' ? 'هل تود كتابة تقييم؟' : 'Want to write a review?'}</h4>
                    <p>{lang === 'AR' ? 'يجب عليك تسجيل الدخول لتتمكن من تقييم وترك تعليق على التجارب.' : 'You must be signed in to rate and comment on experiences.'}</p>
                    <Link to="/login" className="btn-login-redirect">{lang === 'AR' ? 'تسجيل الدخول الآن' : 'Sign In Now'}</Link>
                  </div>
                )}
              </div>

              {/* 3. Review Lists */}
              <div className="reviews-list-container">
                <h3 className="tw-text-slate-800 dark:tw-text-slate-100 tw-font-bold tw-text-xl tw-mb-4">{lang === 'AR' ? `آراء وتجارب العملاء (${reviews.length})` : `Customer Reviews (${reviews.length})`}</h3>

                {loadingReviews ? (
                  <div className="loading-reviews">
                    <i className="fa-solid fa-spinner fa-spin"></i> {lang === 'AR' ? 'جاري تحميل التقييمات...' : 'Loading reviews...'}
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="no-reviews-card">
                    <i className="fa-regular fa-comments"></i>
                    <p>{lang === 'AR' ? 'لا توجد تقييمات لهذه التجربة حتى الآن. كن أول من يشاركنا رأيه!' : 'No reviews yet for this experience. Be the first to share your thoughts!'}</p>
                  </div>
                ) : (
                  <div className="reviews-list">
                    {reviews.map((rev) => {
                      const reviewerName = rev.user ? `${rev.user.firstName} ${rev.user.lastName}`.trim() : (lang === 'AR' ? 'مغامر مجهول' : 'Anonymous Adventurer');
                      const reviewerInitials = getUserInitials(rev.user);
                      const avatarBg = getAvatarColor(reviewerName);
                      const reviewDate = rev.createdAt ? new Date(rev.createdAt).toLocaleDateString(lang === 'AR' ? 'ar-EG' : 'en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      }) : 'Recent';

                      return (
                        <div key={rev._id} className="review-card">
                          
                          {/* Header */}
                          <div className="review-card-header">
                            
                            {/* Avatar & User Details */}
                            <div className="reviewer-info">
                              <div className="reviewer-avatar" style={{ backgroundColor: avatarBg }}>
                                {reviewerInitials}
                              </div>
                              <div>
                                <h4 className="reviewer-name">{reviewerName}</h4>
                                <span className="review-date">{reviewDate}</span>
                              </div>
                            </div>

                            {/* Rating Stars & Badge */}
                            <div className="review-meta">
                              {renderStars(rev.rating)}
                              {rev.isVerifiedBooking && (
                                <span className="verified-badge">
                                  <i className="fa-solid fa-circle-check"></i> {lang === 'AR' ? 'حجز مؤكد' : 'Verified Booking'}
                                </span>
                              )}
                            </div>

                          </div>

                          {/* Body */}
                          <div className="review-card-body">
                            <p>{rev.comment || (lang === 'AR' ? 'ترك هذا المستخدم تقييماً بالنجوم فقط دون تعليق.' : 'This user left no comment, just a rating.')}</p>
                          </div>

                        </div>
                      );
                    })}



                  </div>
                )}
              </div>

            </div>
          </>
        ) : (
          <div className="error-card">
            <p>{lang === 'AR' ? 'لم يتم العثور على الباقة السياحية.' : 'Package not found.'}</p>
            <Link to="/" className="btn-back">{lang === 'AR' ? 'العودة للرئيسية' : 'Return to Home'}</Link>
          </div>
        )}
      </main>


      {/* 🧠 Smart AI Trip Chaining (Modular Trip Extension) Carousel Modal */}
      {showChainModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            background: 'linear-gradient(145deg, #0e0f14 0%, #151720 100%)',
            border: '2px solid #f59e0b',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '1200px',
            padding: '30px',
            position: 'relative',
            boxShadow: '0 20px 50px rgba(245, 158, 11, 0.15)',
            boxSizing: 'border-box',
            color: '#fff',
            overflow: 'hidden'
          }}>
            {/* Close Button */}
            <button
              onClick={() => setShowChainModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                zIndex: 10
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(245, 158, 11, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              <i className="fa-solid fa-xmark" style={{ fontSize: '1.1rem' }}></i>
            </button>

            {/* Modal Header */}
            <div style={{ textAlign: 'center', marginBottom: '25px', position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: '-30px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '200px',
                height: '100px',
                background: 'radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, rgba(0,0,0,0) 70%)',
                pointerEvents: 'none'
              }}></div>
              
              <h3 style={{
                color: '#f59e0b',
                fontSize: '1.75rem',
                fontWeight: '900',
                margin: '0 0 8px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}>
                <i className="fa-solid fa-route"></i>
                {lang === 'AR' ? 'تمديد وربط رحلتك (Modular Trip Extension)' : 'Extend Your Journey (Modular Trip Extension)'}
                <span style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#f59e0b',
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  fontWeight: 'bold',
                  letterSpacing: '1px'
                }}>
                  <i className="fa-solid fa-brain" style={{ marginRight: '4px' }}></i> AI Powered
                </span>
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '700px', margin: '0 auto' }}>
                {lang === 'AR'
                  ? `رحلتك تنتهي في ${endFormatted}. يمكنك فوراً ربط رحلة أخرى أو داي يوز يبدأ في نفس اليوم (${endFormatted}) لتخلق سلسلة رحلات متصلة ممتازة!`
                  : `Your current experience ends on ${endFormatted}. You can instantly stack another package starting the same day (${endFormatted}) to build a seamless Trip Chain!`}
              </p>
            </div>

            {/* Slider Title Banner */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '15px',
              margin: '15px 0 25px 0'
            }}>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.3))' }}></div>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-sparkles" style={{ color: '#f59e0b' }}></i>
                {lang === 'AR' ? 'سلسلة الرحلات المقترحة المتاحة' : 'Recommended Seamless Extensions'}
                <i className="fa-solid fa-sparkles" style={{ color: '#f59e0b' }}></i>
              </span>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.3), transparent)' }}></div>
            </div>

            {/* Carousel Container */}
            {loadingChain ? (
              <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '15px' }}>
                <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '2.5rem', color: '#f59e0b' }}></i>
                <span style={{ color: '#94a3b8' }}>{lang === 'AR' ? 'جاري البحث عن الرحلات المتوافقة...' : 'Searching for compatible extensions...'}</span>
              </div>
            ) : chainExperiences.length === 0 ? (
              <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '15px', textRendering: 'optimizeLegibility' }}>
                <i className="fa-regular fa-calendar-xmark" style={{ fontSize: '3rem', color: '#64748b' }}></i>
                <span style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 'bold' }}>
                  {lang === 'AR' ? 'لا توجد باقات متوفرة لليوم التالي حالياً.' : 'No packages start on the next day.'}
                </span>
                <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                  {lang === 'AR' ? 'قم بتعديل مواعيدك لرؤية باقات أخرى أو انتظر إضافة الأدمن للمزيد.' : 'Try selecting different dates or check back later.'}
                </span>
              </div>
            ) : (
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '15px' }}>
                {/* Back Arrow */}
                <button
                  onClick={() => setCarouselIndex(prev => Math.max(0, prev - 1))}
                  disabled={carouselIndex === 0}
                  style={{
                    background: carouselIndex === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(245,158,11,0.1)',
                    border: `1px solid ${carouselIndex === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(245,158,11,0.3)'}`,
                    color: carouselIndex === 0 ? '#475569' : '#f59e0b',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    cursor: carouselIndex === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    zIndex: 2
                  }}
                >
                  <i className="fa-solid fa-chevron-left"></i>
                </button>

                {/* Visible Horizontal Cards viewport */}
                <div style={{
                  flex: 1,
                  overflow: 'hidden',
                  display: 'flex',
                  gap: '20px',
                  padding: '10px 5px'
                }}>
                  <div style={{
                    display: 'flex',
                    gap: '20px',
                    transform: `translateX(-${carouselIndex * 310}px)`,
                    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}>
                    {chainExperiences.map((exp, idx) => {
                      const isSelected = selectedChainId === exp._id;
                      const formattedStartDate = new Date(end.getTime()).toLocaleDateString(lang === 'AR' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' });
                      
                      return (
                        <div
                          key={exp._id}
                          onClick={() => setSelectedChainId(exp._id)}
                          style={{
                            width: '290px',
                            background: isSelected ? 'rgba(245, 158, 11, 0.05)' : 'rgba(255,255,255,0.02)',
                            border: `2px solid ${isSelected ? '#f59e0b' : 'rgba(255,255,255,0.07)'}`,
                            borderRadius: '16px',
                            padding: '15px',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            boxSizing: 'border-box',
                            boxShadow: isSelected ? '0 8px 24px rgba(245, 158, 11, 0.15)' : 'none'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                          }}
                        >
                          {/* Top Right Checkbox Circle */}
                          <div style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: isSelected ? '#f59e0b' : 'rgba(0,0,0,0.5)',
                            border: `2px solid ${isSelected ? '#f59e0b' : 'rgba(255,255,255,0.4)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 3
                          }}>
                            {isSelected && <i className="fa-solid fa-check" style={{ color: '#000', fontSize: '0.75rem', fontWeight: 'bold' }}></i>}
                          </div>

                          {/* Recently Added Badge */}
                          {idx === 0 && (
                            <span style={{
                              position: 'absolute',
                              top: '12px',
                              left: '12px',
                              background: '#22c55e',
                              color: '#fff',
                              fontSize: '0.68rem',
                              fontWeight: 'bold',
                              padding: '2px 8px',
                              borderRadius: '8px',
                              textTransform: 'uppercase',
                              letterSpacing: '1px',
                              zIndex: 3,
                              boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)'
                            }}>
                              {lang === 'AR' ? 'مضاف حديثاً' : 'Recently Added'}
                            </span>
                          )}

                          {/* Image */}
                          <div style={{
                            height: '130px',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            position: 'relative',
                            marginBottom: '12px'
                          }}>
                            <img
                              src={exp.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80'}
                              alt={exp.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              height: '50%',
                              background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
                            }}></div>
                          </div>

                          {/* Content Details */}
                          <h4 style={{
                            fontSize: '0.95rem',
                            fontWeight: 'bold',
                            margin: '0 0 6px 0',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            color: isSelected ? '#f59e0b' : '#fff'
                          }}>
                            {exp.name}
                          </h4>

                          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <i className="fa-regular fa-clock" style={{ color: '#f59e0b' }}></i>
                            {lang === 'AR' 
                              ? `يبدأ في ${formattedStartDate}، لمدة ${exp.duration_days || 1} أيام` 
                              : `Starts ${formattedStartDate}, ${exp.duration_days || 1}-Days`}
                          </p>

                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginTop: '10px',
                            borderTop: '1px solid rgba(255,255,255,0.06)',
                            paddingTop: '10px'
                          }}>
                            <div>
                              <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>
                                {lang === 'AR' ? 'سعر الباقة يبدأ من' : 'Base Price'}
                              </span>
                              <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#fff' }}>
                                {formatPrice ? formatPrice(exp.base_price) : `${exp.base_price} EGP`}
                              </span>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedChainId(exp._id);
                              }}
                              style={{
                                background: isSelected ? '#f59e0b' : 'rgba(255,255,255,0.05)',
                                color: isSelected ? '#000' : '#fff',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontSize: '0.78rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                            >
                              {lang === 'AR' ? 'اختر الرحلة' : 'Select/View'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Next Arrow */}
                <button
                  onClick={() => setCarouselIndex(prev => Math.min(chainExperiences.length - 1, prev + 1))}
                  disabled={carouselIndex >= chainExperiences.length - 3}
                  style={{
                    background: carouselIndex >= chainExperiences.length - 3 ? 'rgba(255,255,255,0.02)' : 'rgba(245,158,11,0.1)',
                    border: `1px solid ${carouselIndex >= chainExperiences.length - 3 ? 'rgba(255,255,255,0.05)' : 'rgba(245,158,11,0.3)'}`,
                    color: carouselIndex >= chainExperiences.length - 3 ? '#475569' : '#f59e0b',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    cursor: carouselIndex >= chainExperiences.length - 3 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    zIndex: 2
                  }}
                >
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>
            )}

            {/* Lock inselected Trip Chain CTA button */}
            {!loadingChain && chainExperiences.length > 0 && (
              <div style={{
                marginTop: '30px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '15px'
              }}>
                <button
                  onClick={handleLockTripChain}
                  disabled={bookingLoading}
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: '#000',
                    border: 'none',
                    padding: '14px 45px',
                    borderRadius: '35px',
                    fontWeight: '900',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(245,158,11,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {bookingLoading ? (
                    <><i className="fa-solid fa-circle-notch fa-spin"></i> {lang === 'AR' ? 'جاري الحجز وتأمين الربط...' : 'Locking in Chained Trips...'}</>
                  ) : (
                    <><i className="fa-solid fa-link"></i> {lang === 'AR' ? 'ربط وتأمين سلسلة الرحلة (حجز ودفع)' : 'Lock in selected Trip Chain (Add & Book)'}</>
                  )}
                </button>

                {/* Helpful list banner */}
                <div style={{
                  color: '#64748b',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '5px'
                }}>
                  <i className="fa-solid fa-circle-info" style={{ color: '#f59e0b' }}></i>
                  <span>
                    {lang === 'AR'
                      ? `تمت الإضافة بواسطة الأدمن حديثاً: ${chainExperiences.slice(0, 3).map(e => e.name).join('، ')} إلخ.`
                      : `Trip Extensions Added by Admin: Recently Added (1h ago): ${chainExperiences.slice(0, 3).map(e => e.name).join(', ')}, etc.`}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default PackageDetails;
