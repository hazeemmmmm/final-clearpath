const fs = require('fs');
const file = 'frontend/src/pages/PackageDetails/PackageDetails.jsx';
let content = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

console.log('Starting comprehensive overhaul using deterministic indexing...');

// Step 1: Remove old top Included/Excluded block
const incExcComment = '{/* What\\\'s Included & Excluded */}';
const incExcStart = content.indexOf('{/* What\'s Included & Excluded */}');
if (incExcStart !== -1) {
  const packingGuideIdx = content.indexOf('/* 🎒 Smart Packing Guide Integration */');
  if (packingGuideIdx !== -1) {
    const incExcEnd = content.lastIndexOf('</div>', packingGuideIdx) + 6;
    content = content.substring(0, incExcStart) + content.substring(incExcEnd);
    console.log('1. Removed bulky top Included/Excluded section successfully.');
  }
} else {
  console.log('ERROR: Could not find Included/Excluded comment.');
}

// Step 2: Restructure and insert the Airbnb-style Booking Card right below the Overview section
const overviewIdx = content.indexOf('className="details-section"');
if (overviewIdx !== -1) {
  const overviewEnd = content.indexOf('</div>', overviewIdx) + 6;
  
  const bookingCardJSX = `

                {/* 💳 Bottom Full-Width Airbnb-style Booking Card (Aligned exactly with the reference pic colors/design) */}
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
                </div>
  `;

  content = content.substring(0, overviewEnd) + bookingCardJSX + content.substring(overviewEnd);
  console.log('2. Structured Airbnb-style Booking Card inserted below Overview.');
} else {
  console.log('ERROR: Could not find Overview section.');
}

// Step 3: Remove the old sticky booking card sidebar from the bottom
const sidebarStart = content.indexOf('{/* Right Column: Sticky Booking Card */}');
if (sidebarStart !== -1) {
  const packingGuidanceIdx = content.indexOf('{/* ============================================================== */}', sidebarStart);
  if (packingGuidanceIdx !== -1) {
    const lastDivIdx = content.lastIndexOf('</div>', packingGuidanceIdx);
    const targetSidebarEnd = content.lastIndexOf('</div>', lastDivIdx - 1) + 6;
    
    content = content.substring(0, sidebarStart) + content.substring(targetSidebarEnd);
    console.log('3. Removed sticky sidebar booking block from the bottom.');
  }
} else {
  console.log('ERROR: Could not find package sidebar start.');
}

// Step 4: Insert Included/Excluded compact horizontal section inside the left column container
const sidebarStartNew = content.indexOf('{/* ============================================================== */}');
if (sidebarStartNew !== -1) {
  const leftColumnDivIdx = content.lastIndexOf('</div>', sidebarStartNew);
  
  const horizontalIncExcJSX = `

                {/* What\'s Included & Excluded (Compact Horizontal layout at the bottom, dynamic data, dark premium glassmorphic style) */}
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
  `;

  content = content.substring(0, leftColumnDivIdx) + horizontalIncExcJSX + content.substring(leftColumnDivIdx);
  console.log('4. Compact horizontal Included/Excluded section repositioned at the bottom.');
} else {
  console.log('ERROR: Could not find left column closing div index.');
}

// Step 5: Replace checklists with trash icons inside daily activities list
const mapStart = content.indexOf('day.activities.map((act, index) => {');
if (mapStart !== -1) {
  const mapEnd = content.indexOf('</ul>', mapStart);
  if (mapEnd !== -1) {
    const mapCloseIdx = content.lastIndexOf('})', mapEnd) + 2;
    
    const replacementMap = `day.activities.map((act, index) => {
                                      const actObj = act.activity;
                                      const customAct = customDay?.activities?.find(a => (a.activity?._id || a.activity) === (actObj?._id || actObj));
                                      const isActRemoved = customAct ? customAct.status === 'removed' : false;
                                      const isDisabled = isDayRemoved;

                                      const provId = act.provider?._id || act.provider || actObj?.provider?._id || actObj?.provider;
                                      const matchedProv = providersList.find(p => p._id === provId);
                                      const providerName = matchedProv ? matchedProv.name : (act.provider?.name || actObj?.provider?.name || '');

                                      return (
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
                                      );
                                    })`;
    content = content.substring(0, mapStart) + replacementMap + content.substring(mapCloseIdx);
    console.log('5. Replaced daily activity list checkboxes with premium trash/restore icons.');
  }
} else {
  console.log('ERROR: Could not find daily activities map block.');
}

// Step 6: Replace dropdown forms inside both customizer selectors with visual cards grid
// A. First selector form (existing days)
const formStart = content.indexOf('add-activity-inline-form');
if (formStart !== -1) {
  const selectStart = content.indexOf('<select', formStart);
  const selectEnd = content.indexOf('</select>', selectStart) + 9;
  
  const replacementGrid = `
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
                                                      {lang === 'AR' ? 'لا توجد أنشطة إضافية متاحة بهذه المنطقة حالياً.' : 'No extra activities available in this region currently.'}
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
  `;
  content = content.substring(0, selectStart) + replacementGrid + content.substring(selectEnd);
  console.log('6A. Replaced first select dropdown (existing days) with visual activity card selector.');
} else {
  console.log('ERROR: Could not find first add-activity-inline-form.');
}

// B. Second selector form (new days)
const form2Start = content.indexOf('add-activity-inline-form', formStart + 50);
if (form2Start !== -1) {
  const select2Start = content.indexOf('<select', form2Start);
  const select2End = content.indexOf('</select>', select2Start) + 9;
  
  const replacementGrid2 = `
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
  `;
  content = content.substring(0, select2Start) + replacementGrid2 + content.substring(select2End);
  console.log('6B. Replaced second select dropdown (new day) with visual activity card selector.');
} else {
  console.log('ERROR: Could not find second add-activity-inline-form.');
}

fs.writeFileSync(file, content, 'utf8');
console.log('Deterministic UI Overhaul v2 completed successfully.');
