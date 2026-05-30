const fs = require('fs');
const file = 'frontend/src/pages/PackageDetails/PackageDetails.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. DELETE the old bulky Included/Excluded grid block from below the Overview
const oldIncExc = `                {/* What\'s Included & Excluded */}
                <div className="included-excluded-section" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
                  {/* Included */}
                  <div style={{ background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '12px', padding: '20px' }}>
                    <h3 style={{ color: '#22c55e', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fa-solid fa-circle-check"></i> {lang === 'AR' ? 'يشمل (Zero Hidden Fees)' : 'Included (Zero Hidden Fees)'}
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', color: '#e2e8f0' }}>
                      {packageData.included && packageData.included.length > 0 ? (
                        packageData.included.map((item, idx) => (
                          <li key={idx}><i className="fa-solid fa-check" style={{ color: '#22c55e', marginRight: '8px' }}></i> {item}</li>
                        ))
                      ) : (
                        <>
                          <li><i className="fa-solid fa-check" style={{ color: '#22c55e', marginRight: '8px' }}></i> All transfers (4x4 & A/C Vehicles)</li>
                          <li><i className="fa-solid fa-check" style={{ color: '#22c55e', marginRight: '8px' }}></i> All Meals (Breakfast, Lunch, Dinner)</li>
                          <li><i className="fa-solid fa-check" style={{ color: '#22c55e', marginRight: '8px' }}></i> National Park & Security Permits</li>
                          <li><i className="fa-solid fa-check" style={{ color: '#22c55e', marginRight: '8px' }}></i> Professional Camping Gear</li>
                        </>
                      )}
                    </ul>
                  </div>

                  {/* Excluded */}
                  <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', padding: '20px' }}>
                    <h3 style={{ color: '#ef4444', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fa-solid fa-circle-xmark"></i> {lang === 'AR' ? 'لا يشمل' : 'Excluded'}
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', color: '#e2e8f0' }}>
                      {packageData.excluded && packageData.excluded.length > 0 ? (
                        packageData.excluded.map((item, idx) => (
                          <li key={idx}><i className="fa-solid fa-xmark" style={{ color: '#ef4444', marginRight: '8px' }}></i> {item}</li>
                        ))
                      ) : (
                        <>
                          <li><i className="fa-solid fa-xmark" style={{ color: '#ef4444', marginRight: '8px' }}></i> Personal Expenses & Souvenirs</li>
                          <li><i className="fa-solid fa-xmark" style={{ color: '#ef4444', marginRight: '8px' }}></i> Tipping (Gratuities)</li>
                          <li><i className="fa-solid fa-xmark" style={{ color: '#ef4444', marginRight: '8px' }}></i> Flights or Visas</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>`;

// Normalise newlines for safety
content = content.replace(/\r\n/g, '\n');
const oldIncExcNorm = oldIncExc.replace(/\r\n/g, '\n');

if (content.includes(oldIncExcNorm)) {
  content = content.replace(oldIncExcNorm, '');
  console.log('1. Bulky Included/Excluded section removed from the top.');
} else {
  console.log('WARNING: Could not find top Included/Excluded block.');
}

// 2. INSERT the booking card and restructure it right below the Overview section
const targetOverview = `                <div className="details-section">
                  <h2 className="tw-text-slate-900 dark:tw-text-white tw-font-bold tw-text-2xl tw-mb-6">Overview</h2>
                  <p className="description-text" style={{ fontSize: '1.05rem', lineHeight: '1.7', color: '#cbd5e1' }}>
                    {packageData.description || 'Embark on a breath-taking journey that lets you discover Egypt\\\'s true wonders. Fully guided experience with premium logistics, customized options, and memorable local stories.'}
                  </p>
                </div>`;

const targetOverviewNorm = targetOverview.replace(/\r\n/g, '\n');

const replacementBookingCard = `                <div className="details-section">
                  <h2 className="tw-text-slate-900 dark:tw-text-white tw-font-bold tw-text-2xl tw-mb-6">Overview</h2>
                  <p className="description-text" style={{ fontSize: '1.05rem', lineHeight: '1.7', color: '#cbd5e1' }}>
                    {packageData.description || 'Embark on a breath-taking journey that lets you discover Egypt\\\'s true wonders. Fully guided experience with premium logistics, customized options, and memorable local stories.'}
                  </p>
                </div>

                {/* 💳 Bottom Full-Width Airbnb-style Booking Card (Styled to match reference pic exactly) */}
                <div className="booking-card" style={{ marginTop: '30px', marginBottom: '40px' }}>
                  <div className="booking-card-inner">
                    
                    {/* Left Half: Price & Trust Benefits */}
                    <div className="booking-card-left" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                        const aiDiscountApplied = customTrip?.ai_discount_applied || extraActivitiesCount >= 3;
                        
                        let totalPrice = (singlePrice * guestCount) + addonsTotal;
                        let originalTotalPrice = originalSinglePrice * guestCount + addonsTotal;
                        
                        if (!customTrip?.ai_discount_applied && extraActivitiesCount >= 3) {
                           const discount = totalPrice * 0.10;
                           totalPrice -= discount;
                        }

                        return (
                          <div className="booking-price" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <span className="price-label" style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#888', fontWeight: '700', letterSpacing: '0.5px' }}>
                              {isCustomizing ? (lang === 'AR' ? 'السعر المخصص للفرد' : 'Customized price per guest') : (lang === 'AR' ? 'يبدأ سعر الفرد من' : 'Price starts at')}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '5px' }}>
                              <span className="price-amount" style={{ fontSize: '2.8rem', fontWeight: '800', color: '#f59e0b' }}>
                                {formatPrice(totalPrice)}
                              </span>
                              {aiDiscountApplied && (
                                <span style={{ textDecoration: 'line-through', color: '#cbd5e1', fontSize: '1.25rem', opacity: 0.6 }}>
                                  {formatPrice(originalTotalPrice)}
                                </span>
                              )}
                            </div>
                            
                            {aiDiscountApplied && (
                              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '6px 10px', borderRadius: '8px', color: '#10b981', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', width: 'fit-content' }}>
                                <i className="fa-solid fa-wand-magic-sparkles"></i>
                                {lang === 'AR' ? 'تم تطبيق خصم التوجيه الذكي (AI) 10%' : '10% AI Bundle Discount Applied!'}
                              </div>
                            )}

                            <button 
                              onClick={() => setShowBreakdown(!showBreakdown)}
                              style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.85rem', textDecoration: 'underline', cursor: 'pointer', textAlign: 'left', marginTop: '10px', width: 'fit-content', padding: 0 }}
                            >
                              {lang === 'AR' ? 'عرض تفاصيل السعر (شفافية كاملة)' : 'View Price Breakdown (Full Transparency) →'}
                            </button>
                            
                            {showBreakdown && (
                              <div style={{ marginTop: '15px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '12px', padding: '15px', fontSize: '0.85rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {packageData.priceBreakdown && packageData.priceBreakdown.length > 0 ? (
                                  packageData.priceBreakdown.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <span>{item.label}</span>
                                      <span>{formatPrice(item.amount * guestCount)}</span>
                                    </div>
                                  ))
                                ) : (
                                  <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <span>{lang === 'AR' ? 'رسوم وتصاريح:' : 'Fees / Permits:'}</span>
                                      <span>{formatPrice(totalPrice * 0.15)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <span>{lang === 'AR' ? 'النقل (سيارة مكيفة):' : 'Transportation:'}</span>
                                      <span>{formatPrice(totalPrice * 0.25)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <span>{lang === 'AR' ? 'وجبات ومشروبات:' : 'Meals & Drinks:'}</span>
                                      <span>{formatPrice(totalPrice * 0.15)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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
                          </div>
                        );
                      })()}
                      
                      <div className="booking-benefits" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                        <div className="benefit-item" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                          <i className="fa-solid fa-shield-halved" style={{ fontSize: '1.15rem', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}></i>
                          <div>
                            <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{lang === 'AR' ? 'إلغاء مجاني' : 'Free Cancellation'}</strong>
                            <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#a4a4b4' }}>{lang === 'AR' ? 'إلغاء مرن حتى 24 ساعة مقدماً' : 'Cancel up to 24 hours in advance'}</p>
                          </div>
                        </div>
                        <div className="benefit-item" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                          <i className="fa-solid fa-bolt" style={{ fontSize: '1.15rem', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}></i>
                          <div>
                            <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{lang === 'AR' ? 'تأكيد فوري' : 'Instant Confirmation'}</strong>
                            <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#a4a4b4' }}>{lang === 'AR' ? 'احجز مكانك مباشرة في ثوانٍ معدودة' : 'Secure your spot in seconds'}</p>
                          </div>
                        </div>
                        <div className="benefit-item" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                          <i className="fa-solid fa-headset" style={{ fontSize: '1.15rem', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}></i>
                          <div>
                            <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{lang === 'AR' ? 'دعم متواصل 24/7' : '24/7 Support'}</strong>
                            <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#a4a4b4' }}>{lang === 'AR' ? 'فريق عمل متفاني لخدمتك طوال اليوم' : 'Dedicated customer support'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Half: Guest Counter & Customizer / Booking Buttons */}
                    <div className="booking-card-right" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {/* Interactive Guest Selector */}
                      <div className="guest-selector-container" style={{
                        padding: '18px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}>
                        <label style={{ fontSize: '0.85rem', color: '#a4a4b4', fontWeight: '600', display: 'flex', justifyContent: 'space-between', margin: 0 }}>
                          <span>{lang === 'AR' ? 'عدد المسافرين (الضيوف)' : 'Number of Travelers (Guests)'}</span>
                          <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{guestCount} {guestCount === 1 ? (lang === 'AR' ? 'مسافر' : 'Guest') : (lang === 'AR' ? 'مسافرين' : 'Guests')}</span>
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                          <button 
                            type="button"
                            onClick={() => setGuestCount(prev => Math.max(1, prev - 1))}
                            disabled={guestCount <= 1}
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: guestCount <= 1 ? '#333' : '#f59e0b',
                              color: '#000',
                              border: 'none',
                              cursor: guestCount <= 1 ? 'not-allowed' : 'pointer',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s'
                            }}
                          >
                            <i className="fa-solid fa-minus"></i>
                          </button>
                          <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff' }}>{guestCount}</span>
                          <button 
                            type="button"
                            onClick={() => setGuestCount(prev => prev + 1)}
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: '#f59e0b',
                              color: '#000',
                              border: 'none',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s'
                            }}
                          >
                            <i className="fa-solid fa-plus"></i>
                          </button>
                        </div>
                      </div>

                      {isCustomizing && customTrip && (
                        <div style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid #f59e0b', borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '0.85rem', fontWeight: '600' }}>
                          <i className="fa-solid fa-sparkles"></i> {lang === 'AR' ? 'الخطة المخصصة نشطة' : 'Custom Plan Active'}
                        </div>
                      )}

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button 
                          onClick={handleBookNow} 
                          className="btn-book-now" 
                          disabled={bookingLoading}
                          style={{
                            background: '#f59e0b',
                            color: '#000',
                            border: 'none',
                            width: '100%',
                            padding: '16px',
                            borderRadius: '16px',
                            fontSize: '1rem',
                            fontWeight: '800',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            boxShadow: '0 8px 25px rgba(245, 158, 11, 0.25)',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {bookingLoading ? (
                            <><i className="fa-solid fa-spinner fa-spin"></i> {lang === 'AR' ? 'جاري إتمام الحجز...' : 'Creating Booking...'}</>
                          ) : (
                            <><i className="fa-solid fa-calendar-days"></i> {lang === 'AR' ? 'احجز هذه المغامرة الآن' : 'Book This Adventure'}</>
                          )}
                        </button>
                        
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button 
                            type="button"
                            onClick={handleWishlistToggle} 
                            disabled={wishlistLoading}
                            style={{
                              flex: 1,
                              background: isInWishlist ? 'rgba(230, 30, 77, 0.15)' : 'rgba(255,255,255,0.03)',
                              border: \`1px solid \${isInWishlist ? '#e61e4d' : 'rgba(255,255,255,0.1)'}\`,
                              color: isInWishlist ? '#e61e4d' : '#cbd5e1',
                              padding: '12px',
                              borderRadius: '12px',
                              cursor: 'pointer',
                              fontWeight: '700',
                              fontSize: '0.85rem',
                              transition: 'all 0.3s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px'
                            }}
                          >
                            <i className={\`\${isInWishlist ? 'fa-solid' : 'fa-regular'} fa-heart\`} style={{ color: '#e61e4d' }}></i>
                            {isInWishlist ? (lang === 'AR' ? 'محفوظ' : 'Saved') : (lang === 'AR' ? 'حفظ' : 'Save')}
                          </button>

                          {token && (
                            <button 
                              type="button"
                              onClick={!customTrip ? handleStartCustomization : handleToggleCustomization} 
                              style={{
                                flex: 2,
                                background: 'transparent',
                                border: '1.5px solid rgba(255,255,255,0.25)',
                                color: '#fff',
                                padding: '12px',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontWeight: '700',
                                fontSize: '0.85rem',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                              }}
                            >
                              <i className="fa-solid fa-sliders" style={{ color: '#f59e0b' }}></i>
                              {!customTrip 
                                ? (lang === 'AR' ? 'خصص خطة الرحلة' : 'Customize Plan') 
                                : (isCustomizing ? (lang === 'AR' ? 'الخطة القياسية' : 'Standard Plan') : (lang === 'AR' ? 'الخطة المخصصة' : 'Custom Plan'))}
                            </button>
                          )}
                        </div>

                        <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#a4a4b4', marginTop: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <i className="fa-solid fa-lock" style={{ color: '#22c55e' }}></i>
                          {lang === 'AR' ? 'الدفع آمن 100% | بدون رسوم خفية' : '100% Secure Payment | Zero Hidden Fees'}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>`;

if (content.includes(targetOverviewNorm)) {
  content = content.replace(targetOverviewNorm, replacementBookingCard);
  console.log('2. Booking Card restructured and positioned right below the Overview.');
} else {
  console.log('WARNING: Could not find Overview section block.');
}

// 3. DELETE the old Right Column Sticky Booking Card sidebar from the bottom
const targetSidebar = `              {/* Right Column: Sticky Booking Card */}
              <div className="package-sidebar">
                <div className="tw-sticky tw-top-32 tw-bg-white/80 dark:tw-bg-[#15171a]/80 tw-backdrop-blur-xl tw-border tw-border-slate-200 dark:tw-border-slate-800/80 tw-rounded-3xl tw-p-8 tw-shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] dark:tw-shadow-2xl">
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
                    const aiDiscountApplied = customTrip?.ai_discount_applied || extraActivitiesCount >= 3;
                    
                    let totalPrice = (singlePrice * guestCount) + addonsTotal;
                    let originalTotalPrice = originalSinglePrice * guestCount + addonsTotal;
                    
                    if (!customTrip?.ai_discount_applied && extraActivitiesCount >= 3) {
                       const discount = totalPrice * 0.10;
                       totalPrice -= discount;
                    }

                    return (
                      <>
                        <div className="booking-price" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <span className="price-label">{isCustomizing ? (lang === 'AR' ? 'السعر المخصص للفرد' : 'Customized price per guest') : (lang === 'AR' ? 'يبدأ سعر الفرد من' : 'Price starts at')}</span>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                              {aiDiscountApplied && (
                                <span style={{ textDecoration: 'line-through', color: '#64748b', fontSize: '0.9rem' }}>
                                  {formatPrice(originalTotalPrice)}
                                </span>
                              )}
                              <span className="price-amount" style={{ fontSize: '1.2rem', color: aiDiscountApplied ? '#10b981' : 'inherit' }}>
                                {formatPrice(totalPrice)}
                              </span>
                            </div>
                          </div>
                          {aiDiscountApplied && (
                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '6px 10px', borderRadius: '8px', color: '#10b981', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', width: 'fit-content', alignSelf: 'flex-end' }}>
                              <i className="fa-solid fa-wand-magic-sparkles"></i>
                              {lang === 'AR' ? 'تم تطبيق خصم التوجيه الذكي (AI) 10%' : '10% AI Bundle Discount Applied!'}
                            </div>
                          )}
                          {extraActivitiesCount === 2 && (
                            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px dashed rgba(245, 158, 11, 0.4)', padding: '8px 10px', borderRadius: '8px', color: '#f59e0b', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                              <i className="fa-solid fa-gift fa-bounce"></i>
                              {lang === 'AR' ? 'أضف نشاطاً واحداً إضافياً واحصل على خصم 10% على إجمالي رحلتك!' : 'Add just 1 more extra activity to get a 10% AI Discount!'}
                            </div>
                          )}
                          
                          <button 
                            onClick={() => setShowBreakdown(!showBreakdown)}
                            style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.85rem', textDecoration: 'underline', cursor: 'pointer', textAlign: 'left', marginTop: '5px' }}
                          >
                            {lang === 'AR' ? 'عرض تفاصيل السعر (شفافية كاملة)' : 'View Price Breakdown (Full Transparency)'}
                          </button>
                          
                          {showBreakdown && (
                            <div style={{ marginTop: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '12px', fontSize: '0.85rem', color: '#cbd5e1' }}>
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '6px', marginTop: '4px' }}>
                              <span className="price-label" style={{ color: '#f59e0b', fontWeight: '700' }}>
                                {lang === 'AR' ? \`الإجمالي لـ \${guestCount} مسافرين\` : \`Total for \${guestCount} guests\`}
                              </span>
                              <span className="price-amount" style={{ color: '#f59e0b', fontSize: '1.4rem', fontWeight: '800' }}>
                                {totalPrice} EGP
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Interactive Guest Selector */}
                        <div className="guest-selector-container" style={{
                          margin: '15px 0',
                          padding: '12px',
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(212, 175, 55, 0.15)',
                          borderRadius: '10px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}>
                          <label style={{ fontSize: '0.85rem', color: '#aaa', fontWeight: '600', display: 'flex', justifyContent: 'space-between', margin: 0 }}>
                            <span>{lang === 'AR' ? 'عدد المسافرين (الضيوف)' : 'Number of Travelers (Guests)'}</span>
                            <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{guestCount} {guestCount === 1 ? (lang === 'AR' ? 'مسافر' : 'Guest') : (lang === 'AR' ? 'مسافرين' : 'Guests')}</span>
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                            <button 
                              type="button"
                              onClick={() => setGuestCount(prev => Math.max(1, prev - 1))}
                              disabled={guestCount <= 1}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: guestCount <= 1 ? '#333' : '#f59e0b',
                                color: '#000',
                                border: 'none',
                                cursor: guestCount <= 1 ? 'not-allowed' : 'pointer',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                              }}
                            >
                              <i className="fa-solid fa-minus"></i>
                            </button>
                            <span style={{ fontSize: '1.15rem', fontWeight: 'bold', color: '#fff' }}>{guestCount}</span>
                            <button 
                              type="button"
                              onClick={() => setGuestCount(prev => prev + 1)}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: '#f59e0b',
                                color: '#000',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                              }}
                            >
                              <i className="fa-solid fa-plus"></i>
                            </button>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                  
                  {isCustomizing && customTrip && (
                    <div style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid #f59e0b', borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: '#f59e0b', fontSize: '0.85rem', fontWeight: '600' }}>
                      <i className="fa-solid fa-sparkles"></i> {lang === 'AR' ? 'الخطة المخصصة نشطة' : 'Custom Plan Active'}
                    </div>
                  )}

                  <div className="booking-benefits">
                    <div className="benefit-item">
                      <i className="fa-solid fa-shield-halved"></i>
                      <div>
                        <strong>{lang === 'AR' ? 'إلغاء مجاني' : 'Free Cancellation'}</strong>
                        <p>{lang === 'AR' ? 'إلغاء مرن حتى 24 ساعة مقدماً' : 'Cancel up to 24 hours in advance'}</p>
                      </div>
                    </div>
                    <div className="benefit-item">
                      <i className="fa-solid fa-bolt"></i>
                      <div>
                        <strong>{lang === 'AR' ? 'تأكيد فوري' : 'Instant Confirmation'}</strong>
                        <p>{lang === 'AR' ? 'احجز مكانك مباشرة في ثوانٍ معدودة' : 'Secure your spot in seconds'}</p>
                      </div>
                    </div>
                    <div className="benefit-item">
                      <i className="fa-solid fa-headset"></i>
                      <div>
                        <strong>{lang === 'AR' ? 'دعم متواصل 24/7' : '24/7 Support'}</strong>
                        <p>{lang === 'AR' ? 'فريق عمل متفاني لخدمتك طوال اليوم' : 'Dedicated customer support'}</p>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', boxSizing: 'border-box' }}>
                    <button 
                      onClick={handleBookNow} 
                      className="tw-w-full tw-flex tw-items-center tw-justify-center tw-gap-2 tw-bg-amber-500 hover:tw-bg-amber-600 tw-text-white tw-font-bold tw-py-4 tw-px-6 tw-rounded-2xl tw-transition-all tw-shadow-lg" 
                      disabled={bookingLoading}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
                    >
                      {bookingLoading ? (
                        <><i className="fa-solid fa-spinner fa-spin"></i> {lang === 'AR' ? 'جاري إتمام الحجز...' : 'Creating Booking...'}</>
                      ) : (
                        <><i className="fa-solid fa-calendar-days"></i> {lang === 'AR' ? 'تخصيص واحجز الآن' : 'Customize & Book'}</>
                      )}
                    </button>
                    
                    <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#a4a4b4', margin: '5px 0 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <i className="fa-solid fa-lock" style={{ color: '#22c55e' }}></i> {lang === 'AR' ? 'الدفع آمن 100% | لا توجد رسوم خفية' : 'الدفع آمن 100% | لا توجد رسوم خفية'}
                    </p>
                  </div>

                    <button 
                      onClick={handleWishlistToggle} 
                      className={\`btn-wishlist-toggle \${isInWishlist ? 'saved' : ''}\`}
                      disabled={wishlistLoading}
                      style={{
                        width: '100%',
                        background: isInWishlist ? '#e61e4d' : '#f1f5f9',
                        border: isInWishlist ? '2px solid #e61e4d' : '2px solid #cbd5e1',
                        color: isInWishlist ? '#ffffff' : '#1e293b',
                        padding: '12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '700',
                        fontSize: '0.95rem',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: isInWishlist ? '0 6px 20px rgba(230, 30, 77, 0.4)' : 'none'
                      }}
                    >
                      {wishlistLoading ? (
                        <><i className="fa-solid fa-spinner fa-spin"></i> {lang === 'AR' ? 'جاري المعالجة...' : 'Processing...'}</>
                      ) : (
                        <>
                          <i className={\`\${isInWishlist ? 'fa-solid' : 'fa-regular'} fa-heart\`} style={{ color: isInWishlist ? '#ffffff' : '#e61e4d' }}></i>
                          {isInWishlist 
                            ? (lang === 'AR' ? 'تم الحفظ في المفضلة' : 'Saved to Wishlist')
                            : (lang === 'AR' ? 'أضف إلى المفضلة' : 'Add to Wishlist')}
                        </>
                      )}
                    </button>

                    {token && (
                      !customTrip ? (
                        <button 
                          onClick={handleStartCustomization} 
                          className="btn-start-custom"
                          style={{
                            width: '100%',
                            background: 'transparent',
                            border: '1px solid #f59e0b',
                            color: '#f59e0b',
                            padding: '12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.95rem',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                          }}
                        >
                          <i className="fa-solid fa-sliders"></i> {lang === 'AR' ? 'خصص هذه الخطة' : 'Customize This Plan'}
                        </button>
                      ) : (
                        <button 
                          onClick={handleToggleCustomization} 
                          className="btn-start-custom"
                          style={{
                            width: '100%',
                            background: 'transparent',
                            border: '1px solid #f59e0b',
                            color: '#f59e0b',
                            padding: '12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.95rem',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                          }}
                        >
                          <i className="fa-solid fa-rotate-left"></i> {isCustomizing ? (lang === 'AR' ? 'التحول للخطة الأساسية' : 'Switch to Standard Plan') : (lang === 'AR' ? 'التحول للخطة المخصصة' : 'Switch to Custom Plan')}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>`;

const targetSidebarNorm = targetSidebar.replace(/\r\n/g, '\n');

if (content.includes(targetSidebarNorm)) {
  content = content.replace(targetSidebarNorm, '');
  console.log('3. Old Sticky Booking Card sidebar removed from the bottom.');
} else {
  console.log('WARNING: Could not find sticky sidebar booking block.');
}

// 4. INSERT the new compact Included/Excluded horizontally styled pills below the itinerary extensions
const targetExtensions = `                {/* MODULAR EXTENSIONS (ADD-ONS) */}
                {packageData.addons && packageData.addons.length > 0 && (
                  <div className="package-extensions-section" style={{ marginTop: '40px', padding: '25px', background: 'rgba(212,175,55,0.05)', borderRadius: '15px', border: '1px solid rgba(212,175,55,0.2)' }}>
                    <h3 style={{ color: '#f59e0b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <i className="fa-solid fa-puzzle-piece"></i> {lang === 'AR' ? 'إضافات الرحلة' : 'Modular Trip Extensions'}
                    </h3>
                    <div style={{ display: 'grid', gap: '15px' }}>
                      {packageData.addons.map(addon => {
                        const isSelected = selectedAddons.includes(addon._id);
                        return (
                          <div 
                            key={addon._id} 
                            onClick={() => {
                              setSelectedAddons(prev => 
                                isSelected ? prev.filter(id => id !== addon._id) : [...prev, addon._id]
                              );
                            }}
                            style={{ 
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                              padding: '15px 20px', background: isSelected ? 'rgba(212,175,55,0.15)' : 'rgba(0,0,0,0.3)', 
                              border: \`1px solid \${isSelected ? \'#f59e0b\' : \'rgba(255,255,255,0.1)\'}\`, 
                              borderRadius: '10px', cursor: 'pointer', transition: 'all 0.3s'
                            }}
                          >
                            <div>
                              <strong style={{ color: isSelected ? '#f59e0b' : '#fff', fontSize: '1.1rem', display: 'block', marginBottom: '5px' }}>
                                {addon.name}
                              </strong>
                              <p style={{ color: '#a4a4b4', fontSize: '0.9rem', margin: 0 }}>{addon.description}</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                              <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>+{addon.price} EGP</span>
                              <div style={{ 
                                width: '24px', height: '24px', borderRadius: '50%', border: \`2px solid \${isSelected ? \'#f59e0b\' : \'#a4a4b4\'}\`,
                                display: 'flex', justifyContent: 'center', alignItems: 'center', background: isSelected ? '#f59e0b' : 'transparent'
                              }}>
                                {isSelected && <i className="fa-solid fa-check" style={{ color: '#000', fontSize: '0.8rem' }}></i>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>`;

const targetExtensionsNorm = targetExtensions.replace(/\r\n/g, '\n');

const replacementExtensionsWithIncExc = `                {/* MODULAR EXTENSIONS (ADD-ONS) */}
                {packageData.addons && packageData.addons.length > 0 && (
                  <div className="package-extensions-section" style={{ marginTop: '40px', padding: '25px', background: 'rgba(212,175,55,0.05)', borderRadius: '15px', border: '1px solid rgba(212,175,55,0.2)' }}>
                    <h3 style={{ color: '#f59e0b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <i className="fa-solid fa-puzzle-piece"></i> {lang === 'AR' ? 'إضافات الرحلة' : 'Modular Trip Extensions'}
                    </h3>
                    <div style={{ display: 'grid', gap: '15px' }}>
                      {packageData.addons.map(addon => {
                        const isSelected = selectedAddons.includes(addon._id);
                        return (
                          <div 
                            key={addon._id} 
                            onClick={() => {
                              setSelectedAddons(prev => 
                                isSelected ? prev.filter(id => id !== addon._id) : [...prev, addon._id]
                              );
                            }}
                            style={{ 
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                              padding: '15px 20px', background: isSelected ? 'rgba(212,175,55,0.15)' : 'rgba(0,0,0,0.3)', 
                              border: \`1px solid \${isSelected ? \'#f59e0b\' : \'rgba(255,255,255,0.1)\'}\`, 
                              borderRadius: '10px', cursor: 'pointer', transition: 'all 0.3s'
                            }}
                          >
                            <div>
                              <strong style={{ color: isSelected ? '#f59e0b' : '#fff', fontSize: '1.1rem', display: 'block', marginBottom: '5px' }}>
                                {addon.name}
                              </strong>
                              <p style={{ color: '#a4a4b4', fontSize: '0.9rem', margin: 0 }}>{addon.description}</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                              <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>+{addon.price} EGP</span>
                              <div style={{ 
                                width: '24px', height: '24px', borderRadius: '50%', border: \`2px solid \${isSelected ? \'#f59e0b\' : \'#a4a4b4\'}\`,
                                display: 'flex', justifyContent: 'center', alignItems: 'center', background: isSelected ? '#f59e0b' : 'transparent'
                              }}>
                                {isSelected && <i className="fa-solid fa-check" style={{ color: '#000', fontSize: '0.8rem' }}></i>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* What\'s Included & Excluded (Compact Horizontal layout at the bottom) */}
                <div className="included-excluded-section" style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '40px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px' }}>
                  {/* Included */}
                  <div>
                    <h4 style={{ color: '#22c55e', fontSize: '0.95rem', fontWeight: '800', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <i className="fa-solid fa-circle-check"></i> {lang === 'AR' ? 'يشمل (رسوم شفافة بالكامل)' : 'Included (Fully Transparent Fees)'}
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {packageData.included && packageData.included.length > 0 ? (
                        packageData.included.map((item, idx) => (
                          <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)', color: '#34d399', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}>
                            <i className="fa-solid fa-check" style={{ fontSize: '0.75rem' }}></i> {item}
                          </span>
                        ))
                      ) : (
                        <>
                          {['All transfers (4x4 & A/C Vehicles)', 'All Meals (Breakfast, Lunch, Dinner)', 'National Park & Security Permits', 'Professional Camping Gear'].map((item, idx) => (
                            <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)', color: '#34d399', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}>
                              <i className="fa-solid fa-check" style={{ fontSize: '0.75rem' }}></i> {item}
                            </span>
                          ))}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Excluded */}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
                    <h4 style={{ color: '#ef4444', fontSize: '0.95rem', fontWeight: '800', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <i className="fa-solid fa-circle-xmark"></i> {lang === 'AR' ? 'لا يشمل' : 'Excluded'}
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {packageData.excluded && packageData.excluded.length > 0 ? (
                        packageData.excluded.map((item, idx) => (
                          <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}>
                            <i className="fa-solid fa-xmark" style={{ fontSize: '0.75rem' }}></i> {item}
                          </span>
                        ))
                      ) : (
                        <>
                          {['Personal Expenses & Souvenirs', 'Tipping (Gratuities)', 'Flights or Visas'].map((item, idx) => (
                            <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}>
                              <i className="fa-solid fa-xmark" style={{ fontSize: '0.75rem' }}></i> {item}
                            </span>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>`;

const replacementExtensionsWithIncExcNorm = replacementExtensionsWithIncExc.replace(/\r\n/g, '\n');

if (content.includes(targetExtensionsNorm)) {
  content = content.replace(targetExtensionsNorm, replacementExtensionsWithIncExcNorm);
  console.log('4. Compact Included/Excluded pills section added horizontally below Itinerary.');
} else {
  console.log('WARNING: Could not find target extensions block.');
}

// 5. REFACTOR Itinerary Activity Items: Replace checklists with trash icons
const targetActivityItem = `                                      return (
                                        <li key={index} className="activity-item" style={{ 
                                          display: 'flex', 
                                          alignItems: 'center', 
                                          padding: '12px 15px', 
                                          background: 'rgba(0,0,0,0.02)',
                                          border: '1px solid var(--border-light, #e2e8f0)',
                                          borderRadius: '10px', 
                                          opacity: (isDisabled || isActRemoved) ? 0.5 : 1,
                                          transition: 'all 0.2s',
                                          gap: '15px'
                                        }}>
                                          {act?.image && (
                                            <div style={{ flex: '0 0 60px', height: '60px', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                                              <img src={act.image} alt="Activity" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                          )}
                                          <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '10px' }}>
                                            <label style={{ 
                                              display: 'flex', 
                                              alignItems: 'center', 
                                              gap: '10px', 
                                              cursor: isDisabled ? 'not-allowed' : 'pointer', 
                                              margin: 0, 
                                              color: (isDisabled || isActRemoved) ? '#888' : 'inherit', 
                                              fontWeight: '700'
                                            }}>
                                              <input 
                                                type="checkbox"
                                                disabled={isDisabled}
                                                checked={!isDisabled && !isActRemoved}
                                                onChange={() => handleToggleActivityCheckbox(day.day_number, actObj?._id || actObj)}
                                                style={{ width: '17px', height: '17px', cursor: isDisabled ? 'not-allowed' : 'pointer', accentColor: '#f59e0b' }}
                                              />
                                              <span style={{ textDecoration: isActRemoved ? 'line-through' : 'none', color: 'var(--text-dark, #1e293b)', fontSize: '0.95rem' }}>
                                                <strong>{actObj?.name || act.name || 'Exciting Activity'}</strong>
                                                {providerName && (
                                                  <span style={{ 
                                                    fontSize: '0.74rem', 
                                                    color: '#f59e0b', 
                                                    marginLeft: '10px', 
                                                    backgroundColor: 'rgba(212,175,55,0.08)', 
                                                    padding: '3px 10px', 
                                                    borderRadius: '4px',
                                                    border: '1px solid rgba(212,175,55,0.2)',
                                                    fontWeight: '700',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                  }}>
                                                    <i className="fa-solid fa-parachute-box"></i>
                                                    {providerName}
                                                  </span>
                                                )}
                                              </span>
                                            </label>
                                            <span className="act-price" style={{ color: (isDisabled || isActRemoved) ? '#777' : 'var(--accent-color, #f59e0b)', fontWeight: '800', fontSize: '0.95rem', textDecoration: isActRemoved ? 'line-through' : 'none' }}>
                                              +{act.price} EGP
                                            </span>
                                          </div>

                                          {/* 📝 Activity Description */}
                                          {(act.description || actObj?.description) && (
                                            <div style={{
                                              paddingLeft: '27px',
                                              marginTop: '6px',
                                              fontSize: '0.84rem',
                                              color: 'var(--text-muted, #64748b)',
                                              lineHeight: '1.4',
                                              textDecoration: isActRemoved ? 'line-through' : 'none'
                                            }}>
                                              {act.description || actObj.description}
                                            </div>
                                          )}
                                          </div>
                                        </li>
                                      );`;

const targetActivityItemNorm = targetActivityItem.replace(/\r\n/g, '\n');

const replacementActivityItem = `                                      return (
                                        <li key={index} className="activity-item" style={{ 
                                          display: 'flex', 
                                          flexDirection: 'column',
                                          padding: '12px 15px', 
                                          background: 'rgba(255, 255, 255, 0.02)',
                                          border: '1px solid rgba(255, 255, 255, 0.08)',
                                          borderRadius: '12px', 
                                          opacity: (isDisabled || isActRemoved) ? 0.5 : 1,
                                          transition: 'all 0.2s',
                                          gap: '10px'
                                        }}>
                                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '15px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                              {act?.image && (
                                                <div style={{ flex: '0 0 60px', height: '60px', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                                                  <img src={act.image} alt="Activity" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                              )}
                                              <div style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '10px', 
                                                margin: 0, 
                                                color: (isDisabled || isActRemoved) ? '#888' : 'inherit', 
                                                fontWeight: '700'
                                              }}>
                                                <span style={{ textDecoration: isActRemoved ? 'line-through' : 'none', color: '#fff', fontSize: '0.95rem' }}>
                                                  <strong>{actObj?.name || act.name || 'Exciting Activity'}</strong>
                                                  {providerName && (
                                                    <span style={{ 
                                                      fontSize: '0.74rem', 
                                                      color: '#f59e0b', 
                                                      marginLeft: '10px', 
                                                      backgroundColor: 'rgba(212,175,55,0.08)', 
                                                      padding: '3px 10px', 
                                                      borderRadius: '4px',
                                                      border: '1px solid rgba(212,175,55,0.2)',
                                                      fontWeight: '700',
                                                      display: 'inline-flex',
                                                      alignItems: 'center',
                                                      gap: '4px'
                                                    }}>
                                                      <i className="fa-solid fa-parachute-box"></i>
                                                      {providerName}
                                                    </span>
                                                  )}
                                                </span>
                                              </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                              <span className="act-price" style={{ color: (isDisabled || isActRemoved) ? '#777' : '#f59e0b', fontWeight: '800', fontSize: '0.95rem', textDecoration: isActRemoved ? 'line-through' : 'none' }}>
                                                +{act.price} EGP
                                              </span>
                                              {isCustomizing && !isDisabled && (
                                                <button
                                                  type="button"
                                                  onClick={() => handleToggleActivityCheckbox(day.day_number, actObj?._id || actObj)}
                                                  style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: isActRemoved ? '#10b981' : '#f87171',
                                                    cursor: 'pointer',
                                                    padding: '4px',
                                                    fontSize: '1.05rem',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transition: 'all 0.2s',
                                                    outline: 'none'
                                                  }}
                                                  title={isActRemoved ? 'Add back' : 'Remove activity'}
                                                >
                                                  <i className={\`fa-solid \${isActRemoved ? 'fa-circle-plus' : 'fa-trash'}\`}></i>
                                                </button>
                                              )}
                                            </div>
                                          </div>

                                          {/* 📝 Activity Description */}
                                          {(act.description || actObj?.description) && (
                                            <div style={{
                                              paddingLeft: act?.image ? '75px' : '0px',
                                              marginTop: '2px',
                                              fontSize: '0.84rem',
                                              color: '#a4a4b4',
                                              lineHeight: '1.4',
                                              textDecoration: isActRemoved ? 'line-through' : 'none'
                                            }}>
                                              {act.description || actObj.description}
                                            </div>
                                          )}
                                        </li>
                                      );`;

const replacementActivityItemNorm = replacementActivityItem.replace(/\r\n/g, '\n');

if (content.includes(targetActivityItemNorm)) {
  content = content.replace(targetActivityItemNorm, replacementActivityItemNorm);
  console.log('5. Daily activity rows updated with trash/restore action icons.');
} else {
  console.log('WARNING: Could not find target daily activity item list block.');
}

// 6. REPLACE the selector form dropdown for existing days customizer
const targetExistingSelector = `                                        <div className="add-activity-inline-form" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212, 175, 55, 0.2)', padding: '15px', borderRadius: '10px', marginTop: '10px' }}>
                                          <h4 style={{ color: '#f59e0b', fontSize: '0.92rem', margin: '0 0 10px 0', fontWeight: '800' }}>
                                            {lang === 'AR' ? 'استعراض وإضافة نشاط إضافي بالمنطقة:' : 'Browse & Add Extra Activity in region:'}
                                          </h4>
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {/* Select Dropdown filtering ONLY activities in current destination region NOT in experience already */}
                                            <select 
                                              value={newActivitySelection.activityId}
                                              onChange={(e) => {
                                                const actId = e.target.value;
                                                const actObj = activitiesList.find(a => a._id === actId);
                                                setNewActivitySelection(prev => ({
                                                  ...prev,
                                                  activityId: actId,
                                                  price: actObj ? actObj.price : '',
                                                  providerId: actObj && actObj.provider?._id ? actObj.provider._id : (actObj?.provider || '')
                                                }));
                                              }}
                                              style={{ padding: '10px', background: '#14141f', border: '1.5px solid rgba(212,175,55,0.2)', color: '#fff', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}
                                            >
                                              <option value="">-- {lang === 'AR' ? 'اختر نشاطاً إضافياً بالمنطقة' : 'Select an Extra Activity in Region'} --</option>
                                              {(() => {
                                                const pkgDestId = packageData?.destination?._id || packageData?.destination;
                                                // Filter: ONLY activities in this region
                                                const regionalActs = activitiesList.filter(act => {
                                                  const actDestId = act.destination?._id || act.destination;
                                                  return actDestId && pkgDestId && actDestId.toString() === pkgDestId.toString();
                                                });

                                                // Filter out activities that are already in the current day's plan to prevent duplicate additions
                                                const currentDayActIds = day.activities.map(a => (a.activity?._id || a.activity)?.toString());
                                                const remainingActs = regionalActs.filter(a => !currentDayActIds.includes(a._id.toString()));

                                                return remainingActs.map(act => {
                                                  const provId = act.provider?._id || act.provider;
                                                  const matchedProv = providersList.find(p => p._id === provId);
                                                  const provName = matchedProv ? matchedProv.name : (act.provider?.name || 'Provider');
                                                  return (
                                                    <option key={act._id} value={act._id}>
                                                      {act.name} | Mover: {provName} | {act.description ? act.description.substring(0, 30) + '...' : 'No desc'} | Price: {act.price} EGP
                                                    </option>
                                                  );
                                                });
                                              })()}
                                            </select>

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
                                            })()}`;

const targetExistingSelectorNorm = targetExistingSelector.replace(/\r\n/g, '\n');

const replacementExistingSelector = `                                        <div className="add-activity-inline-form" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212, 175, 55, 0.2)', padding: '15px', borderRadius: '10px', marginTop: '10px' }}>
                                          <h4 style={{ color: '#f59e0b', fontSize: '0.92rem', margin: '0 0 10px 0', fontWeight: '800' }}>
                                            {lang === 'AR' ? 'استعراض وإضافة نشاط إضافي بالمنطقة:' : 'Browse & Add Extra Activity in region:'}
                                          </h4>
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            
                                            {/* Visual Grid Selector: Show premium cards instead of a select dropdown */}
                                            <div className="activity-cards-grid">
                                              {(() => {
                                                const pkgDestId = packageData?.destination?._id || packageData?.destination;
                                                const regionalActs = activitiesList.filter(act => {
                                                  const actDestId = act.destination?._id || act.destination;
                                                  return actDestId && pkgDestId && actDestId.toString() === pkgDestId.toString();
                                                });

                                                const currentDayActIds = day.activities.map(a => (a.activity?._id || a.activity)?.toString());
                                                const remainingActs = regionalActs.filter(a => !currentDayActIds.includes(a._id.toString()));

                                                if (remainingActs.length === 0) {
                                                  return (
                                                    <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem', gridColumn: '1 / -1', margin: '10px 0' }}>
                                                      {lang === 'AR' ? 'لا توجد أنxطة إضافية متاحة بهذه المنطقة حالياً.' : 'No extra activities available in this region currently.'}
                                                    </p>
                                                  );
                                                }

                                                return remainingActs.map(act => {
                                                  const isSelected = newActivitySelection.activityId === act._id;
                                                  const provId = act.provider?._id || act.provider;
                                                  const matchedProv = providersList.find(p => p._id === provId);
                                                  const provName = matchedProv ? matchedProv.name : (act.provider?.name || 'Local Guide');
                                                  
                                                  const imgUrl = act.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80';

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
                                                      className={\`activity-select-card \${isSelected ? 'selected' : ''}\`}
                                                    >
                                                      <div className="activity-card-image-wrap">
                                                        <img src={imgUrl} alt={act.name} />
                                                        <div style={{ position: 'absolute', bottom: '6px', right: '6px', background: 'rgba(0,0,0,0.8)', color: '#f59e0b', fontSize: '0.74rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                                                          +{act.price} EGP
                                                        </div>
                                                      </div>
                                                      <div className="activity-card-info">
                                                        <strong style={{ color: '#fff', fontSize: '0.8rem', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '34px' }}>
                                                          {act.name}
                                                        </strong>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                                                          <span className="activity-card-provider">
                                                            <i className="fa-solid fa-parachute-box" style={{ color: '#f59e0b' }}></i>
                                                            {provName.substring(0, 10)}{provName.length > 10 ? '...' : ''}
                                                          </span>
                                                          <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '1px 5px', borderRadius: '4px', fontSize: '0.62rem', fontWeight: 'bold' }}>
                                                            <i className="fa-solid fa-circle-check"></i>
                                                          </span>
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
                                                  background: 'rgba(0,0,0,0.3)',
                                                  border: '1px solid rgba(255,255,255,0.06)',
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
                                                      <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '2px 6px', borderRadius: '12px', fontSize: '0.65rem', marginLeft: '5px', display: 'flex', alignItems: 'center', gap: '4px' }} title="AI Trust Score">
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
                                            })()}`;

const replacementExistingSelectorNorm = replacementExistingSelector.replace(/\r\n/g, '\n');

if (content.includes(targetExistingSelectorNorm)) {
  content = content.replace(targetExistingSelectorNorm, replacementExistingSelectorNorm);
  console.log('6. Existing day activity dropdown replaced with premium Visual Card selector.');
} else {
  console.log('WARNING: Could not find target existing day select catalog form block.');
}

// 7. REPLACE the selector form dropdown for starting a new day customizer
const targetNewSelector = `                                  {addDayTab === 'custom' ? (
                                    <>
                                      <h4 style={{ color: '#f59e0b', fontSize: '0.9rem', margin: '0 0 10px 0', fontWeight: '800' }}>
                                        {lang === 'AR' ? \`إضافة نشاط لليوم الجديد (اليوم \${displayItinerary.length + 1}):\` : \`Add Activity to Start Day \${displayItinerary.length + 1}:\`}
                                      </h4>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <select 
                                          value={newActivitySelection.activityId}
                                          onChange={(e) => {
                                            const actId = e.target.value;
                                            const actObj = activitiesList.find(a => a._id === actId);
                                            setNewActivitySelection(prev => ({
                                              ...prev,
                                              activityId: actId,
                                              price: actObj ? actObj.price : '',
                                              providerId: actObj && actObj.provider?._id ? actObj.provider._id : (actObj?.provider || '')
                                            }));
                                          }}
                                          style={{ padding: '10px', background: '#14141f', border: '1.5px solid rgba(212,175,55,0.2)', color: '#fff', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}
                                        >
                                          <option value="">-- {lang === 'AR' ? 'اختر نشاطاً إضافياً بالمنطقة' : 'Select an Activity'} --</option>
                                          {(() => {
                                            const pkgDestId = packageData?.destination?._id || packageData?.destination;
                                            const optionalActs = activitiesList.filter(act => {
                                              const actDestId = act.destination?._id || act.destination;
                                              return actDestId && pkgDestId && actDestId.toString() === pkgDestId.toString();
                                            }) || [];
                                            return optionalActs.map(act => {
                                              const provId = act.provider?._id || act.provider;
                                              const matchedProv = providersList.find(p => p._id === provId);
                                              const provName = matchedProv ? matchedProv.name : (act.provider?.name || 'Local Expert');
                                              return (
                                                <option key={act._id} value={act._id}>
                                                  {act.name} | Mover: {provName} | {act.description ? act.description.substring(0, 30) + '...' : 'No desc'} | Price: {act.price} EGP
                                                </option>
                                              );
                                            });
                                          })()}
                                        </select>

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
                                                <span>
                                                  <i className="fa-solid fa-parachute-box" style={{ marginRight: '5px' }}></i>
                                                  {providerNameResolved}
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
                                        })()}`;

const targetNewSelectorNorm = targetNewSelector.replace(/\r\n/g, '\n');

const replacementNewSelector = `                                  {addDayTab === 'custom' ? (
                                    <>
                                      <h4 style={{ color: '#f59e0b', fontSize: '0.9rem', margin: '0 0 10px 0', fontWeight: '800' }}>
                                        {lang === 'AR' ? \`إضافة نشاط لليوم الجديد (اليوم \${displayItinerary.length + 1}):\` : \`Add Activity to Start Day \${displayItinerary.length + 1}:\`}
                                      </h4>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        
                                        {/* Visual Grid Selector: Show premium cards instead of a select dropdown */}
                                        <div className="activity-cards-grid">
                                          {(() => {
                                            const pkgDestId = packageData?.destination?._id || packageData?.destination;
                                            const optionalActs = activitiesList.filter(act => {
                                              const actDestId = act.destination?._id || act.destination;
                                              return actDestId && pkgDestId && actDestId.toString() === pkgDestId.toString();
                                            }) || [];

                                            if (optionalActs.length === 0) {
                                              return (
                                                <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem', gridColumn: '1 / -1', margin: '10px 0' }}>
                                                  {lang === 'AR' ? 'لا توجد أنشطة متاحة بهذه المنطقة حالياً.' : 'No activities available in this region currently.'}
                                                </p>
                                              );
                                            }

                                            return optionalActs.map(act => {
                                              const isSelected = newActivitySelection.activityId === act._id;
                                              const provId = act.provider?._id || act.provider;
                                              const matchedProv = providersList.find(p => p._id === provId);
                                              const provName = matchedProv ? matchedProv.name : (act.provider?.name || 'Local Guide');
                                              
                                              const imgUrl = act.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80';

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
                                                  className={\`activity-select-card \${isSelected ? 'selected' : ''}\`}
                                                >
                                                  <div className="activity-card-image-wrap">
                                                    <img src={imgUrl} alt={act.name} />
                                                    <div style={{ position: 'absolute', bottom: '6px', right: '6px', background: 'rgba(0,0,0,0.8)', color: '#f59e0b', fontSize: '0.74rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                                                      +{act.price} EGP
                                                    </div>
                                                  </div>
                                                  <div className="activity-card-info">
                                                    <strong style={{ color: '#fff', fontSize: '0.8rem', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '34px' }}>
                                                      {act.name}
                                                    </strong>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                                                      <span className="activity-card-provider">
                                                        <i className="fa-solid fa-parachute-box" style={{ color: '#f59e0b' }}></i>
                                                        {provName.substring(0, 10)}{provName.length > 10 ? '...' : ''}
                                                      </span>
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
                                              background: 'rgba(0,0,0,0.3)',
                                              border: '1px solid rgba(255,255,255,0.06)',
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
                                                <span>
                                                  <i className="fa-solid fa-parachute-box" style={{ marginRight: '5px' }}></i>
                                                  {providerNameResolved}
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
                                        })()}`;

const replacementNewSelectorNorm = replacementNewSelector.replace(/\r\n/g, '\n');

if (content.includes(targetNewSelectorNorm)) {
  content = content.replace(targetNewSelectorNorm, replacementNewSelectorNorm);
  console.log('7. New day activity dropdown replaced with premium Visual Card selector.');
} else {
  console.log('WARNING: Could not find target new day select catalog form block.');
}

// 8. Fix the ready day tab button styling (restoring it dynamically on clean git state)
const targetReadyButton = `                                    <button
                                      type="button"
                                      onClick={() => setAddDayTab('ready')}
                                      style={{
                                        background: addDayTab === 'ready' ? '#f59e0b' : 'transparent',
                                        color: addDayTab === 'ready' ? '#000' : '#fff',
                                        border: addDayTab === 'ready' ? 'none' : '1px solid rgba(255,255,255,0.2)',
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontWeight: '700',
                                        fontSize: '0.8rem',
                                        flex: 1,
                                        transition: 'all 0.2s'
                                      }}
                                    >`;

const replacementReadyButton = `                                    <button
                                      type="button"
                                      onClick={() => setAddDayTab('ready')}
                                      style={{
                                        background: addDayTab === 'ready' ? '#f59e0b' : 'transparent',
                                        color: addDayTab === 'ready' ? '#000' : '#fff',
                                        border: addDayTab === 'ready' ? 'none' : '1.5px solid rgba(255,255,255,0.25)',
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontWeight: '700',
                                        fontSize: '0.8rem',
                                        flex: 1,
                                        transition: 'all 0.2s'
                                      }}
                                    >`;

const targetReadyButtonNorm = targetReadyButton.replace(/\r\n/g, '\n');
const replacementReadyButtonNorm = replacementReadyButton.replace(/\r\n/g, '\n');

if (content.includes(targetReadyButtonNorm)) {
  content = content.replace(targetReadyButtonNorm, replacementReadyButtonNorm);
  console.log('8. Ready day use selector tab buttons styling checked and corrected.');
} else {
  console.log('WARNING: Could not find target ready button.');
}

fs.writeFileSync(file, content, 'utf8');
console.log('Comprehensive UI overhaul script finished execution successfully.');
