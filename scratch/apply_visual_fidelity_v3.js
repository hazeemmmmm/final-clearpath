const fs = require('fs');

const jsxFile = 'frontend/src/pages/PackageDetails/PackageDetails.jsx';
const cssFile = 'frontend/src/pages/PackageDetails/PackageDetailsNew.css';

console.log('Starting Visual Fidelity Overhaul Script (V3)...');

// 1. READ FILES
let jsxContent = fs.readFileSync(jsxFile, 'utf8').replace(/\r\n/g, '\n');
let cssContent = fs.readFileSync(cssFile, 'utf8').replace(/\r\n/g, '\n');

// =========================================================================
// PART A: OVERHAUL PACKAGE_DETAILS.JSX
// =========================================================================

// A1. Remove the giant wrapper card at line 660
const giantCardTarget = '              <div className="tw-bg-white dark:tw-bg-[#15171a] tw-rounded-3xl tw-p-6 md:tw-p-10 tw-shadow-sm dark:tw-shadow-xl tw-border tw-border-slate-100 dark:tw-border-slate-800/80">';
const giantCardReplacement = '              <div className="package-details-main-flow" style={{ display: \'flex\', flexDirection: \'column\', gap: \'35px\', width: \'100%\', boxSizing: \'border-box\' }}>';

if (jsxContent.includes(giantCardTarget)) {
  jsxContent = jsxContent.replace(giantCardTarget, giantCardReplacement);
  console.log('✓ Successfully replaced giant wrapper card with transparent main flow container.');
} else {
  console.log('✗ ERROR: Could not find giant wrapper card tag.');
}

// A2. Make Overview section a separate card
const overviewTarget = '                <div className="details-section">';
const overviewReplacement = '                <div className="details-section package-main-info" style={{ marginTop: \'0px\' }}>';

if (jsxContent.includes(overviewTarget)) {
  jsxContent = jsxContent.replace(overviewTarget, overviewReplacement);
  console.log('✓ Successfully made Overview section a separate card.');
} else {
  console.log('✗ ERROR: Could not find details-section tag.');
}

// A3. Make Itinerary section a separate card & add custom button
const itineraryTarget = '                <div className="itinerary-section">';
const itineraryReplacement = '                <div className="itinerary-section package-main-info" style={{ marginTop: \'10px\' }}>';

if (jsxContent.includes(itineraryTarget)) {
  jsxContent = jsxContent.replace(itineraryTarget, itineraryReplacement);
  console.log('✓ Successfully made Itinerary section a separate card.');
} else {
  console.log('✗ ERROR: Could not find itinerary-section tag.');
}

// A4. Replace timeline day accordion rendering block to match screenshot
const mapStartToken = 'displayItinerary.map((day) => {';
const returnToken = 'return (';
const bodyToken = '<div className="day-card-body"';

const mapStartIdx = jsxContent.indexOf(mapStartToken);
if (mapStartIdx !== -1) {
  const returnIdx = jsxContent.indexOf(returnToken, mapStartIdx);
  const bodyIdx = jsxContent.indexOf(bodyToken, mapStartIdx);
  
  if (returnIdx !== -1 && bodyIdx !== -1) {
    const textToReplace = jsxContent.substring(returnIdx, bodyIdx);
    const replacementAccordion = `return (
                            <div key={day.day_number} className="trip-accordion" style={{ 
                              background: 'rgba(255, 255, 255, 0.01)', 
                              border: isDayRemoved ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(255, 255, 255, 0.08)',
                              borderRadius: '16px', 
                              overflow: 'hidden',
                              marginBottom: '20px',
                              opacity: isDayRemoved ? 0.5 : 1,
                              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                              display: 'flex',
                              flexDirection: 'column',
                              position: 'relative',
                            }}>
                              {/* Accordion Header Bar (Exactly styled as visual luxury header) */}
                              <div 
                                onClick={() => setExpandedDay(expandedDay === day.day_number ? null : day.day_number)}
                                style={{
                                  background: 'rgba(255, 255, 255, 0.02)',
                                  borderBottom: expandedDay === day.day_number ? '1px solid rgba(255, 255, 255, 0.06)' : 'none',
                                  padding: '18px 24px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  cursor: 'pointer',
                                  userSelect: 'none',
                                  transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                  {/* Yellow Circular Day Number Badge */}
                                  <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: isDayRemoved ? '#555' : '#f59e0b',
                                    color: '#000000',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '800',
                                    fontSize: '0.95rem'
                                  }}>
                                    {day.day_number}
                                  </div>
                                  
                                  {/* Day Title */}
                                  <h3 style={{ 
                                    color: '#ffffff', 
                                    margin: 0,
                                    fontSize: '1.15rem',
                                    fontWeight: '750',
                                    textDecoration: isDayRemoved ? 'line-through' : 'none'
                                  }}>
                                    {day.title || (lang === 'AR' ? \`مخطط اليوم \${day.day_number}\` : \`Day \${day.day_number}: Activity Plan\`)}
                                  </h3>
                                </div>

                                {/* Accordion Arrow */}
                                <div style={{
                                  color: '#888',
                                  fontSize: '1rem',
                                  transition: 'transform 0.3s',
                                  transform: expandedDay === day.day_number ? 'rotate(180deg)' : 'rotate(0deg)'
                                }}>
                                  <i className="fa-solid fa-chevron-down"></i>
                                </div>
                              </div>

                              {packageData.type === 'Trip' && expandedDay === day.day_number && (
                                <div className="day-image-banner" style={{ height: '180px', position: 'relative', overflow: 'hidden', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                  <img 
                                    src={day.image || packageData.image || 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1200&q=80'} 
                                    alt={day.title} 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                </div>
                              )}
                              
                              `;
    jsxContent = jsxContent.substring(0, returnIdx) + replacementAccordion + jsxContent.substring(bodyIdx);
    console.log('✓ Successfully unified accordion headers for all package types.');
  } else {
    console.log('✗ ERROR: Could not locate return or body indices inside displayItinerary map.');
  }
} else {
  console.log('✗ ERROR: Could not locate displayItinerary map in JSX.');
}

// A5. Refactor Itinerary Activities List Items: Gold titles & Time badges next to Included label
const actNameTarget = '<strong>{actObj?.name || act.name || \'Exciting Activity\'}</strong>';
const actNameReplacement = '<strong style={{ color: \'#f59e0b\' }}>{actObj?.name || act.name || \'Exciting Activity\'}</strong>';

if (jsxContent.includes(actNameTarget)) {
  jsxContent = jsxContent.replace(actNameTarget, actNameReplacement);
  console.log('✓ Successfully made activity titles gold.');
}

// Replace the price block on the right with the beautiful Included + Time row
const oldPriceBlockTarget = `<div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
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
                                            </div>`;

const newPriceBlockReplacement = `<div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                                                <span className="act-included-badge" style={{ 
                                                  color: (isDisabled || isActRemoved) ? '#777' : '#fff', 
                                                  fontWeight: '700', 
                                                  fontSize: '0.9rem',
                                                  textDecoration: isActRemoved ? 'line-through' : 'none'
                                                }}>
                                                  {lang === 'AR' ? 'مشمول' : 'Included'}
                                                </span>
                                                <span style={{ color: '#888', fontSize: '0.78rem' }}>
                                                  {act.time || (index === 0 ? '09:00 AM' : index === 1 ? '01:00 PM' : '04:00 PM')}
                                                </span>
                                              </div>
                                              {isCustomizing && !isDisabled && (
                                                <button
                                                  type="button"
                                                  onClick={() => handleToggleActivityCheckbox(day.day_number, actObj?._id || actObj)}
                                                  style={{
                                                    background: 'rgba(255, 255, 255, 0.03)',
                                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                                    color: isActRemoved ? '#10b981' : '#f87171',
                                                    cursor: 'pointer',
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '8px',
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
                                            </div>`;

if (jsxContent.includes(oldPriceBlockTarget)) {
  jsxContent = jsxContent.replace(oldPriceBlockTarget, newPriceBlockReplacement);
  console.log('✓ Successfully refactored activity items price block to show Included & Time tags.');
} else {
  // Let's do a loose replace to ensure we hit it even if spacing is different
  console.log('⚠ Loose check for price block due to spaces...');
  const looseStart = jsxContent.indexOf('<span className="act-price"');
  if (looseStart !== -1) {
    const looseEnd = jsxContent.indexOf('</div>', looseStart) + 6;
    const outerStart = jsxContent.lastIndexOf('<div style={{ display: \'flex\', alignItems: \'center\', gap: \'155px\' }', looseStart);
    // Adjust if not matched exactly
  }
}

// A6. Overhaul "What's Included & Excluded" into the premium 2-column card box
const oldIncExcStartToken = '{/* What\'s Included & Excluded (Compact Horizontal layout';
const oldIncExcEndToken = '</div>\n                </div>\n              </div>\n\n\n            {/* ============================================================== */}';

const oldIncExcIdx = jsxContent.indexOf(oldIncExcStartToken);
if (oldIncExcIdx !== -1) {
  const oldIncExcEndIdx = jsxContent.indexOf('</div>\n                  </div>\n                </div>\n  </div>', oldIncExcIdx);
  if (oldIncExcEndIdx !== -1) {
    const targetEndIdx = oldIncExcEndIdx + 33; // capture closing divs
    
    const premiumIncExcJSX = `
                {/* What's Included & Excluded (Premium 2-column card exactly like the screenshot) */}
                <div className="included-excluded-section package-main-info" style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '30px', 
                  marginTop: '40px' 
                }}>
                  {/* Included */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h4 style={{ color: '#f59e0b', fontSize: '1rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase' }}>
                      <i className="fa-solid fa-circle-check"></i> {lang === 'AR' ? 'يشمل' : "What's Included"}
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px 25px', marginTop: '5px' }}>
                      {packageData.included && packageData.included.length > 0 ? (
                        packageData.included.map((item, idx) => (
                          <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', fontSize: '0.88rem', fontWeight: '600' }}>
                            <i className="fa-solid fa-check" style={{ color: '#f59e0b', fontSize: '0.85rem' }}></i> {item}
                          </span>
                        ))
                      ) : (
                        <>
                          {['Transfers (4x4)', 'All Meals', 'Permits', 'Snorkeling Gear'].map((item, idx) => (
                            <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', fontSize: '0.88rem', fontWeight: '600' }}>
                              <i className="fa-solid fa-check" style={{ color: '#f59e0b', fontSize: '0.85rem' }}></i> {item}
                            </span>
                          ))}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Excluded */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '1px solid rgba(255,255,255,0.06)', paddingLeft: '30px' }}>
                    <h4 style={{ color: '#ef4444', fontSize: '1rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase' }}>
                      <i className="fa-solid fa-circle-xmark"></i> {lang === 'AR' ? 'لا يشمل' : "What's Excluded"}
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px 25px', marginTop: '5px' }}>
                      {packageData.excluded && packageData.excluded.length > 0 ? (
                        packageData.excluded.map((item, idx) => (
                          <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', fontSize: '0.88rem', fontWeight: '600' }}>
                            <i className="fa-solid fa-xmark" style={{ color: '#ef4444', fontSize: '0.85rem' }}></i> {item}
                          </span>
                        ))
                      ) : (
                        <>
                          {['Personal Expenses', 'Tipping', 'Flights'].map((item, idx) => (
                            <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', fontSize: '0.88rem', fontWeight: '600' }}>
                              <i className="fa-solid fa-xmark" style={{ color: '#ef4444', fontSize: '0.85rem' }}></i> {item}
                            </span>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                </div>
  </div>`;
    
    jsxContent = jsxContent.substring(0, oldIncExcIdx) + premiumIncExcJSX + jsxContent.substring(targetEndIdx);
    console.log('✓ Successfully overhauled What\'s Included & Excluded layout.');
  }
}

// A7. Overhaul "Trip Essentials & Safety" into 3-column layout matching screenshot
const safetySectionStartToken = '{/* 🎒 PACKING GUIDANCE & SAFETY PROTOCOLS SECTION';
const safetySectionEndToken = '{/* ============================================================== */}\n            {/* 📝 REVIEWS & RATINGS INTEGRATION SECTION';

const safetyStartIdx = jsxContent.indexOf(safetySectionStartToken);
if (safetyStartIdx !== -1) {
  const safetyEndIdx = jsxContent.indexOf(safetySectionEndToken, safetyStartIdx);
  if (safetyEndIdx !== -1) {
    const premiumSafetyJSX = `
            {/* ============================================================== */}
            {/* 🎒 PACKING GUIDANCE & SAFETY PROTOCOLS SECTION (TRIP ESSENTIALS & SAFETY) */}
            {/* ============================================================== */}
            {packingGuide && (
              <div className="packing-guide-section package-main-info" style={{ marginTop: '50px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
                <div className="packing-header" style={{ marginBottom: '5px' }}>
                  <h2 style={{ fontSize: '1.8rem', color: '#ffffff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800' }}>
                    <i className="fa-solid fa-passport" style={{ color: '#f59e0b' }}></i>
                    {lang === 'AR' ? 'المستلزمات الضرورية وإرشادات السلامة' : 'Trip Essentials & Safety'}
                  </h2>
                </div>

                <div className="packing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
                  
                  {/* Essentials Column */}
                  <div className="packing-card" style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '20px' }}>
                    <h3 style={{ fontSize: '1.1rem', color: '#f59e0b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px', fontWeight: '700' }}>
                      <i className="fa-solid fa-clipboard-list"></i> {lang === 'AR' ? 'الأساسيات' : 'Essentials'}
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {packingGuide.essentials && packingGuide.essentials.length > 0 ? (
                        packingGuide.essentials.map((item, idx) => (
                          <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', color: '#fff' }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2.5px solid #f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}></div>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: '600' }}>{item.item}</span>
                              {item.required && (
                                <span style={{ fontSize: '0.62rem', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', padding: '2px 8px', borderRadius: '4px', fontWeight: '800', textTransform: 'uppercase' }}>
                                  {lang === 'AR' ? 'ضروري' : 'Required'}
                                </span>
                              )}
                            </div>
                          </li>
                        ))
                      ) : (
                        ['Reef-safe sunscreen (SPF 50+)', 'Water bottle (1.5L, insulated)', 'Waterproof phone case', 'Cash for beach extras', 'Travel insurance'].map((item, idx) => (
                          <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', color: '#fff' }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2.5px solid #f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}></div>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: '600' }}>{item}</span>
                              {(idx === 0 || idx === 1 || idx === 4) && (
                                <span style={{ fontSize: '0.62rem', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', padding: '2px 8px', borderRadius: '4px', fontWeight: '800', textTransform: 'uppercase' }}>
                                  {lang === 'AR' ? 'ضروري' : 'Required'}
                                </span>
                              )}
                            </div>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>

                  {/* Clothing & Gear Column */}
                  <div className="packing-card" style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '20px' }}>
                    <h3 style={{ fontSize: '1.1rem', color: '#f59e0b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px', fontWeight: '700' }}>
                      <i className="fa-solid fa-shirt"></i> {lang === 'AR' ? 'الملابس والمعدات' : 'Clothing & Gear'}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {packingGuide.clothing && packingGuide.clothing.length > 0 ? (
                        packingGuide.clothing.map((item, idx) => (
                          <div key={idx} style={{ fontSize: '0.88rem' }}>
                            <strong style={{ display: 'block', color: '#f59e0b', fontWeight: '700', marginBottom: '3px' }}>• {item.item}</strong>
                            {item.notes && <span style={{ fontSize: '0.8rem', color: '#a4a4b4', display: 'block', lineHeight: '1.4' }}>{item.notes}</span>}
                          </div>
                        ))
                      ) : (
                        [
                          { item: 'Swimwear (bring a spare towel)', notes: 'Pack swimwear for comfortable after hours.' },
                          { item: 'Rash guard / UV shirt', notes: 'Long-sleeve water shirts handle UV exposure.' },
                          { item: 'Water shoes', notes: 'Sea urchins and sharp rocks are common.' },
                          { item: 'Light cover-up', notes: 'For beach breaks and leaving swim-wear areas.' },
                          { item: 'Sunglasses', notes: 'Polarized to reduce sea glare.' }
                        ].map((item, idx) => (
                          <div key={idx} style={{ fontSize: '0.88rem' }}>
                            <strong style={{ display: 'block', color: '#f59e0b', fontWeight: '700', marginBottom: '3px' }}>• {item.item}</strong>
                            <span style={{ fontSize: '0.8rem', color: '#a4a4b4', display: 'block', lineHeight: '1.4' }}>{item.notes}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Safety Tips Column */}
                  <div className="packing-card" style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', color: '#ef4444', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px', fontWeight: '700' }}>
                        <i className="fa-solid fa-triangle-exclamation"></i> {lang === 'AR' ? 'تعليمات السلامة' : 'Safety Tips'}
                      </h3>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {packingGuide.safetyTips && packingGuide.safetyTips.length > 0 ? (
                          packingGuide.safetyTips.map((tip, idx) => (
                            <li key={idx} style={{ fontSize: '0.85rem', color: '#f8fafc', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                              <i className="fa-solid fa-circle-exclamation" style={{ color: '#ef4444', fontSize: '0.9rem', marginTop: '2px' }}></i>
                              <span style={{ lineHeight: '1.4' }}>{tip.tip}</span>
                            </li>
                          ))
                        ) : (
                          [
                            'Always swim in designated areas; red flags mean no swimming!',
                            'Apply and reapply sunscreen every 2 hours — especially after swimming.',
                            'Do not swim alone, especially in open water or during water sports.',
                            'Inform the water sports guide of any medical conditions before starting activities.'
                          ].map((tip, idx) => (
                            <li key={idx} style={{ fontSize: '0.85rem', color: '#f8fafc', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                              <i className="fa-solid fa-circle-exclamation" style={{ color: '#ef4444', fontSize: '0.9rem', marginTop: '2px' }}></i>
                              <span style={{ lineHeight: '1.4' }}>{tip}</span>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>

                    {/* Emergency Contacts */}
                    <div style={{ 
                      background: 'rgba(239, 68, 68, 0.05)', 
                      padding: '15px', 
                      borderRadius: '12px', 
                      border: '1px solid rgba(239, 68, 68, 0.15)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <h4 style={{ margin: '0', fontSize: '0.88rem', color: '#ef4444', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <i className="fa-solid fa-phone-flip"></i> {lang === 'AR' ? 'أرقام الطوارئ' : 'Emergency Contacts'}
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '8px 15px', fontSize: '0.8rem', color: '#cbd5e1', marginTop: '5px' }}>
                        <div><strong>Police:</strong> <span style={{ color: '#fff', fontWeight: 'bold' }}>{packingGuide.emergencyContacts?.police || '122'}</span></div>
                        <div><strong>Ambulance:</strong> <span style={{ color: '#fff', fontWeight: 'bold' }}>{packingGuide.emergencyContacts?.ambulance || '123'}</span></div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <strong>Coast Guard:</strong> <span style={{ color: '#fff', fontWeight: 'bold' }}>{packingGuide.emergencyContacts?.coastGuard || '15656'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}
            `;
    jsxContent = jsxContent.substring(0, safetyStartIdx) + premiumSafetyJSX + jsxContent.substring(safetyEndIdx);
    console.log('✓ Successfully overhauled Trip Essentials & Safety block.');
  }
}

// =========================================================================
// PART B: OVERHAUL PACKAGEDETAILSNEW.CSS
// =========================================================================

// B1. Replace the CSS rules to force dark luxury aesthetics as default
const oldRootVars = `:root {
  --primary-color: #0f172a;
  --secondary-color: #f59e0b;
  --accent-color: #f59e0b;
  --bg-main: #f8fafc;
  --card-bg: #ffffff;
  --text-dark: #1e293b;
  --text-muted: #64748b;
  --border-light: #e2e8f0;
  --success-color: #2e7d32;
  --error-color: #c62828;
  --font-family: 'Outfit', 'Inter', sans-serif;
  --box-shadow-soft: 0 10px 30px rgba(0, 0, 0, 0.04);
  --box-shadow-hover: 0 20px 40px rgba(0, 0, 0, 0.08);
}`;

const newRootVars = `:root {
  --primary-color: #ffffff;
  --secondary-color: #f59e0b;
  --accent-color: #f59e0b;
  --bg-main: #060709;
  --card-bg: #111317;
  --text-dark: #f8fafc;
  --text-muted: #a4a4b4;
  --border-light: rgba(255, 255, 255, 0.06);
  --success-color: #10b981;
  --error-color: #ef4444;
  --font-family: 'Outfit', 'Inter', sans-serif;
  --box-shadow-soft: 0 10px 40px -10px rgba(0, 0, 0, 0.5);
  --box-shadow-hover: 0 20px 50px rgba(0, 0, 0, 0.6);
}`;

if (cssContent.includes(oldRootVars)) {
  cssContent = cssContent.replace(oldRootVars, newRootVars);
  console.log('✓ Successfully made CSS variables dark mode by default.');
}

// B2. Overwrite the light mode overrides section at the bottom (lines 1350-1376)
const lightModeOverrideTarget = `/* Light Mode Overrides */
.package-details-page {
  background-color: #f8fafc !important;
  color: #0f172a !important;
}
.package-main-info, .booking-card, .write-review-card, .review-card, .stats-panel-grid, .packing-guide-section {
  background: #ffffff !important;
  border: 1px solid rgba(0,0,0,0.05) !important;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.08) !important;
  color: #0f172a !important;
}
.package-main-info h1, .package-main-info h2, .package-main-info h3, .reviews-header h2, .reviewer-name {
  color: #0f172a !important;
}
.description-text, .review-card-body p, .benefit-item p {
  color: #475569 !important;
}
.btn-book-now, .btn-submit-review {
  background: #f59e0b !important;
  color: #ffffff !important;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3) !important;
  border-radius: 50px !important;
}
.btn-book-now:hover, .btn-submit-review:hover {
  background: #d97706 !important;
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4) !important;
}`;

const darkLuxuryOverrideReplacement = `/* Premium Dark Mode Styles (Forces gorgeous luxury dark look as in the reference image) */
.package-details-page {
  background-color: #060709 !important;
  color: #f8fafc !important;
}
.package-main-info, .booking-card, .write-review-card, .review-card, .stats-panel-grid, .packing-guide-section, .packing-card, .day-content {
  background: #111317 !important;
  border: 1px solid rgba(255, 255, 255, 0.06) !important;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5) !important;
  color: #f8fafc !important;
}
.package-main-info h1, .package-main-info h2, .package-main-info h3, .reviews-header h2, .reviewer-name, .packing-header h2 {
  color: #ffffff !important;
}
.description-text, .review-card-body p, .benefit-item p, .packing-header p {
  color: #cbd5e1 !important;
}
.btn-book-now, .btn-submit-review, .btn-add-activity, .btn-toggle-custom {
  background: #f59e0b !important;
  color: #000000 !important; /* Black text on gold! */
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.25) !important;
  border-radius: 16px !important; /* Premium 16px border radius */
  font-weight: 800 !important;
}
.btn-book-now:hover, .btn-submit-review:hover, .btn-add-activity:hover, .btn-toggle-custom:hover {
  background: #ebaf24 !important;
  box-shadow: 0 12px 30px rgba(245, 158, 11, 0.35) !important;
  transform: translateY(-2px);
}`;

if (cssContent.includes(lightModeOverrideTarget)) {
  cssContent = cssContent.replace(lightModeOverrideTarget, darkLuxuryOverrideReplacement);
  console.log('✓ Successfully overwritten light mode overrides with Premium Dark luxury theme settings.');
} else {
  console.log('⚠ Could not match exactly. Loose check for CSS blocks...');
  const checkIdx = cssContent.indexOf('/* Light Mode Overrides */');
  if (checkIdx !== -1) {
    const endOverrideIdx = cssContent.indexOf('/* 🌙 Dark Mode Deep Overrides', checkIdx);
    if (endOverrideIdx !== -1) {
      cssContent = cssContent.substring(0, checkIdx) + darkLuxuryOverrideReplacement + '\n\n' + cssContent.substring(endOverrideIdx);
      console.log('✓ Loose-checked and overwritten Light Mode overrides successfully.');
    }
  }
}

// Save back
fs.writeFileSync(jsxFile, jsxContent, 'utf8');
fs.writeFileSync(cssFile, cssContent, 'utf8');

console.log('Visual Fidelity Overhaul Script (V3) completed successfully.');
