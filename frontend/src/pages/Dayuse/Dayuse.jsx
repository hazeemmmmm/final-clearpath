import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getDayuse, getAllUsersAdmin } from '../../utils/api';
import { LanguageContext } from '../../context/LanguageContext';
import './Dayuse.css';

const Dayuse = () => {
  const { lang } = useContext(LanguageContext);
  const [isScrolled, setIsScrolled] = useState(false);
  const [dayuses, setDayuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usersMap, setUsersMap] = useState({});
  
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const fetchDayuse = async () => {
      try {
        const response = await getDayuse();
        setDayuses(response.data);
        try {
          const usersRes = await getAllUsersAdmin();
          const usersList = usersRes.data || usersRes.users || usersRes;
          const map = {};
          if (Array.isArray(usersList)) usersList.forEach(u => { if (u && u._id) map[u._id] = u; });
          setUsersMap(map);
        } catch (uerr) { console.debug('Could not fetch users for supervisor lookup', uerr); }
      } catch (err) {
        console.error('Error fetching dayuse:', err);
        setError('Failed to load dayuse packages. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDayuse();
  }, []);

  return (
    <div className={`dayuse-container ${lang === 'AR' ? 'lang-ar' : ''}`}>
      <Navbar lang={lang} isScrolled={isScrolled} />

      <div className="page-header hero-banner dayuse-hero">
        <div className="header-content">
            <h1>{lang === 'AR' ? <>داي يوز <span className="egypt-flag-text">استجمام</span></> : <>Egyptian <span className="egypt-flag-text">Dayuse</span></>}</h1>
            <p>{lang === 'AR' ? 'مسابح مريحة، شواطئ خلابة، وهروب من ضغوط العمل في أفخم المنتجعات' : 'Relaxing pools, beautiful beaches, and luxurious escapes'}</p>
        </div>
      </div>

      <main className="content">
        <div className="toolbar">
            <div className="filter-group">
                <button type="button" className="btn-outline active">{lang === 'AR' ? 'كل العروض' : 'All Dayuse'}</button>
                <button type="button" className="btn-outline">{lang === 'AR' ? 'دخول مسبح' : 'Pool Access'}</button>
                <button type="button" className="btn-outline">{lang === 'AR' ? 'شاطئ' : 'Beach'}</button>
            </div>
        </div>

        <div className="packages-grid">
            {loading ? (
              <p>{lang === 'AR' ? 'جاري تحميل عروض اليوم الواحد...' : 'Loading Dayuse Packages from the API...'}</p>
            ) : error ? (
              <p className="error">{lang === 'AR' ? 'فشل تحميل العروض. يرجى المحاولة لاحقاً.' : error}</p>
            ) : dayuses.length > 0 ? (
              dayuses.map((dayuse) => (
                <div key={dayuse.id || dayuse._id} className="card card--link" onClick={() => navigate(`/package-details/${dayuse.id || dayuse._id}`)}>
                    <div className="img-box">
                        <img src={dayuse.image || dayuse.images?.[0] || '/img/dayuse-default.jpg'} alt={dayuse.title || dayuse.name} />
                    </div>
                    <div className="info">
                        <h4>{dayuse.title || dayuse.name}</h4>
                        {(() => {
                          const sup = dayuse.supervisor || dayuse.supervisior || null;
                          let name = '';
                          if (sup) {
                            if (typeof sup === 'object') name = `${sup.firstName || ''} ${sup.lastName || ''}`.trim();
                            else name = (usersMap[sup] && `${usersMap[sup].firstName || ''} ${usersMap[sup].lastName || ''}`.trim()) || String(sup);
                          }
                          return name ? (
                            <div className="supervisor-badge small">
                              <span className="supervisor-avatar">{(name||'U').charAt(0).toUpperCase()}</span>
                              <span className="supervisor-name">{name}</span>
                            </div>
                          ) : null;
                        })()}
                        <p>{dayuse.price || dayuse.base_price || 0} EGP {lang === 'AR' ? '/ اليوم' : '/ day'}</p>
                    </div>
                </div>
              ))
            ) : (
              <p>{lang === 'AR' ? 'لا توجد عروض داي يوز متاحة في الوقت الحالي.' : 'No dayuse packages available at the moment.'}</p>
            )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dayuse;
