const fs = require('fs');

const filePath = './frontend/src/pages/PackageDetails/PackageDetails.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize newlines in content to \n for robust matching on Windows
content = content.replace(/\r\n/g, '\n');

// Update the showBreakdown section inside PackageDetails.jsx
const targetOld = `                              {showBreakdown && (() => {
                                 // Calculate standard itinerary activities total price
                                 const stdActPrice = (packageData?.itinerary || []).reduce((acc, day) => {
                                   return acc + (day.activities || []).reduce((sum, act) => sum + (act.price || 0), 0);
                                 }, 0);

                                 // Calculate current itinerary activities + extra activities price
                                 let currentActivitiesPrice = 0;
                                 if (isCustomizing && customTrip) {
                                   currentActivitiesPrice = (customTrip.itinerary || []).reduce((acc, day) => {
                                     if (day.status !== "removed" && day.activities) {
                                       return acc + day.activities.reduce((sum, act) => {
                                         return sum + (act.status === "active" ? (act.price || 0) : 0);
                                       }, 0);
                                     }
                                     return acc;
                                   }, 0);

                                   currentActivitiesPrice += (customTrip.extra_activities || []).reduce((acc, act) => {
                                     return acc + (act.status === "active" ? (act.price || 0) : 0);
                                   }, 0);
                                 } else {
                                   currentActivitiesPrice = stdActPrice;
                                 }

                                 // Separate breakdown items into transport vs accommodation/other
                                 const breakdownItems = packageData?.priceBreakdown || [];
                                 let transportCost = 0;
                                 let accommodationCost = 0;
                                 
                                 const transportKeywords = ['transport', 'transit', 'transfer', 'commute', 'pickup', 'bus', 'yacht', 'felucca', 'cruise', 'flight', 'انتقال', 'توصيل', 'طيران', 'أتوبيس', 'يخت', 'فلوكة'];
                                 
                                 breakdownItems.forEach(item => {
                                   const isTransport = transportKeywords.some(kw => item.label.toLowerCase().includes(kw));
                                   if (isTransport) {
                                     transportCost += item.amount;
                                   } else {
                                     accommodationCost += item.amount;
                                   }
                                 });

                                 // Fallback if no transportation is defined in breakdown: assume 150 EGP per guest for standard, or 0
                                 if (transportCost === 0 && packageData?.airportPickup) {
                                   transportCost = 150;
                                 }

                                 return (
                                   <div style={{ marginTop: '10px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '12px', fontSize: '0.85rem', color: '#cbd5e1', width: '90%' }}>
                                     {isCustomizing && customTrip ? (
                                       <>
                                         {/* CUSTOM PLAN BREAKDOWN */}
                                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                                           <strong style={{ color: '#f59e0b' }}>{lang === 'AR' ? 'تفصيل السعر المخصص (قبل الضرائب والرسوم):' : 'Custom Plan Itemization:'}</strong>
                                         </div>
                                         
                                         {/* Dynamic Activities price (reflects checks/unchecks) */}
                                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                           <span>{lang === 'AR' ? 'أنشطة وفعاليات الرحلة (متغير):' : 'Trip Activities (Dynamic):'}</span>
                                           <span style={{ color: '#fff', fontWeight: 'bold' }}>{formatPrice(currentActivitiesPrice * guestCount)}</span>
                                         </div>

                                         {/* Transportation cost */}
                                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                           <span>{lang === 'AR' ? 'وسائل الانتقال والمواصلات:' : 'Transportation & Commutes:'}</span>
                                           <span>{formatPrice(transportCost * guestCount)}</span>
                                         </div>

                                         {/* Accommodation / Package components */}
                                         {accommodationCost > 0 && (
                                           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                             <span>{lang === 'AR' ? 'الإقامة والخدمات الأساسية:' : 'Accommodation & Lodging:'}</span>
                                             <span>{formatPrice(accommodationCost * guestCount)}</span>
                                           </div>
                                         )}

                                         {addonsTotal > 0 && (
                                           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                             <span>{lang === 'AR' ? 'الخدمات الإضافية المختارة:' : 'Selected Add-ons:'}</span>
                                             <span style={{ color: '#f59e0b' }}>{formatPrice(addonsTotal)}</span>
                                           </div>
                                         )}

                                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '5px' }}>
                                           <span>{lang === 'AR' ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                                           <span>{formatPrice((singlePrice * guestCount) + addonsTotal)}</span>
                                         </div>

                                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                           <span>{lang === 'AR' ? 'الضرائب (10%):' : 'Taxes (10%):'}</span>
                                           <span style={{ color: '#ef4444' }}>+{formatPrice(((singlePrice * guestCount) + addonsTotal) * 0.10)}</span>
                                         </div>

                                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                           <span>{lang === 'AR' ? 'رسوم الخدمة والمنصة (5%):' : 'Platform Service Fees (5%):'}</span>
                                           <span style={{ color: '#ef4444' }}>+{formatPrice(((singlePrice * guestCount) + addonsTotal) * 0.05)}</span>
                                         </div>
                                       </>
                                     ) : (
                                       <>
                                         {/* STANDARD PLAN BREAKDOWN */}
                                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                                           <strong style={{ color: '#10b981' }}>{lang === 'AR' ? 'تفصيل السعر الثابت (شامل كل شيء):' : 'Standard All-Inclusive Itemization:'}</strong>
                                         </div>

                                         {/* Activities price */}
                                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                           <span>{lang === 'AR' ? 'الأنشطة والفعاليات المشمولة:' : 'Included Trip Activities:'}</span>
                                           <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                                             {lang === 'AR' ? "مشمولة (" + formatPrice(currentActivitiesPrice * guestCount) + ")" : "Included (" + formatPrice(currentActivitiesPrice * guestCount) + ")"}
                                           </span>
                                         </div>

                                         {/* Transportation */}
                                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                           <span>{lang === 'AR' ? 'وسائل الانتقال (سيارات مكيفة):' : 'Included Transportation (AC Coach):'}</span>
                                           <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                                             {lang === 'AR' ? "مشمولة (" + formatPrice(transportCost * guestCount) + ")" : "Included (" + formatPrice(transportCost * guestCount) + ")"}
                                           </span>
                                         </div>

                                         {/* Accommodation / breakdown items */}
                                         {breakdownItems.filter(item => !transportKeywords.some(kw => item.label.toLowerCase().includes(kw))).map((item, idx) => (
                                           <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                             <span>{item.label}:</span>
                                             <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                                               {lang === 'AR' ? "مشمول (" + formatPrice(item.amount * guestCount) + ")" : "Included (" + formatPrice(item.amount * guestCount) + ")"}
                                             </span>
                                           </div>
                                         ))}

                                         {addonsTotal > 0 && (
                                           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '5px' }}>
                                             <span>{lang === 'AR' ? 'الخدمات الإضافية المختارة:' : 'Selected Add-ons:'}</span>
                                             <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{formatPrice(addonsTotal)}</span>
                                           </div>
                                         )}

                                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '5px' }}>
                                           <span>{lang === 'AR' ? 'الضرائب والرسوم الحكومية:' : 'Taxes & Service Fees:'}</span>
                                           <span style={{ color: '#10b981', fontWeight: 'bold' }}>{lang === 'AR' ? 'مشمولة بالكامل (0 ج.م)' : 'Fully Included (0 EGP)'}</span>
                                         </div>
                                       </>
                                     )}
                                   </div>
                                 );
                               })()}`;

const replacementNew = `                              {showBreakdown && (() => {
                                 // Calculate standard itinerary activities total price
                                 const stdActPrice = (packageData?.itinerary || []).reduce((acc, day) => {
                                   return acc + (day.activities || []).reduce((sum, act) => sum + (act.price || 0), 0);
                                 }, 0);

                                 // Calculate current itinerary activities + extra activities price
                                 let currentActivitiesPrice = 0;
                                 if (isCustomizing && customTrip) {
                                   currentActivitiesPrice = (customTrip.itinerary || []).reduce((acc, day) => {
                                     if (day.status !== "removed" && day.activities) {
                                       return acc + day.activities.reduce((sum, act) => {
                                         return sum + (act.status === "active" ? (act.price || 0) : 0);
                                       }, 0);
                                     }
                                     return acc;
                                   }, 0);

                                   currentActivitiesPrice += (customTrip.extra_activities || []).reduce((acc, act) => {
                                     return acc + (act.status === "active" ? (act.price || 0) : 0);
                                   }, 0);
                                 } else {
                                   currentActivitiesPrice = stdActPrice;
                                 }

                                 // Separate breakdown items into transport vs taxes vs fees vs accommodation/other
                                 const breakdownItems = packageData?.priceBreakdown || [];
                                 let transportCost = 0;
                                 let taxCost = 0;
                                 let feeCost = 0;
                                 let accommodationCost = 0;
                                 
                                 const transportKeywords = ['transport', 'transit', 'transfer', 'commute', 'pickup', 'bus', 'yacht', 'felucca', 'cruise', 'flight', 'انتقال', 'توصيل', 'طيران', 'أتوبيس', 'يخت', 'فلوكة'];
                                 const taxKeywords = ['tax', 'ضرائب', 'ضريبة'];
                                 const feeKeywords = ['fee', 'رسوم', 'خدمة', 'منصة'];

                                 breakdownItems.forEach(item => {
                                   const labelLower = item.label.toLowerCase();
                                   if (transportKeywords.some(kw => labelLower.includes(kw))) {
                                     transportCost += item.amount;
                                   } else if (taxKeywords.some(kw => labelLower.includes(kw))) {
                                     taxCost += item.amount;
                                   } else if (feeKeywords.some(kw => labelLower.includes(kw))) {
                                     feeCost += item.amount;
                                   } else {
                                     accommodationCost += item.amount;
                                   }
                                 });

                                 // Fallbacks for missing configuration fields
                                 if (transportCost === 0 && packageData?.airportPickup) transportCost = 150;
                                 if (taxCost === 0) taxCost = 100; // Fixed default tax per guest
                                 if (feeCost === 0) feeCost = 50;  // Fixed default fee per guest

                                 return (
                                   <div style={{ marginTop: '10px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '12px', fontSize: '0.85rem', color: '#cbd5e1', width: '90%' }}>
                                     {isCustomizing && customTrip ? (
                                       <>
                                         {/* CUSTOM PLAN BREAKDOWN */}
                                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                                           <strong style={{ color: '#f59e0b' }}>{lang === 'AR' ? 'تفصيل السعر المخصص:' : 'Custom Plan Itemization:'}</strong>
                                         </div>
                                         
                                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                           <span>{lang === 'AR' ? 'أنشطة وفعاليات الرحلة (متغير):' : 'Trip Activities (Dynamic):'}</span>
                                           <span style={{ color: '#fff', fontWeight: 'bold' }}>{formatPrice(currentActivitiesPrice * guestCount)}</span>
                                         </div>

                                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                           <span>{lang === 'AR' ? 'وسائل الانتقال والمواصلات (ثابت):' : 'Transportation & Commutes (Fixed):'}</span>
                                           <span>{formatPrice(transportCost * guestCount)}</span>
                                         </div>

                                         {accommodationCost > 0 && (
                                           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                             <span>{lang === 'AR' ? 'الإقامة والخدمات الأساسية:' : 'Accommodation & Lodging:'}</span>
                                             <span>{formatPrice(accommodationCost * guestCount)}</span>
                                           </div>
                                         )}

                                         {addonsTotal > 0 && (
                                           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                             <span>{lang === 'AR' ? 'الخدمات الإضافية المختارة:' : 'Selected Add-ons:'}</span>
                                             <span style={{ color: '#f59e0b' }}>{formatPrice(addonsTotal)}</span>
                                           </div>
                                         )}

                                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '5px' }}>
                                           <span>{lang === 'AR' ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                                           <span>{formatPrice((currentActivitiesPrice + transportCost + accommodationCost) * guestCount + addonsTotal)}</span>
                                         </div>

                                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                           <span>{lang === 'AR' ? 'الضرائب الحكومية (ثابتة):' : 'Fixed Tourism Taxes:'}</span>
                                           <span style={{ color: '#ef4444' }}>+{formatPrice(taxCost * guestCount)}</span>
                                         </div>

                                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                           <span>{lang === 'AR' ? 'رسوم خدمة المنصة (ثابتة):' : 'Fixed Service Fees:'}</span>
                                           <span style={{ color: '#ef4444' }}>+{formatPrice(feeCost * guestCount)}</span>
                                         </div>
                                       </>
                                     ) : (
                                       <>
                                         {/* STANDARD PLAN BREAKDOWN */}
                                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                                           <strong style={{ color: '#10b981' }}>{lang === 'AR' ? 'تفصيل السعر الثابت (شامل كل شيء):' : 'Standard All-Inclusive Itemization:'}</strong>
                                         </div>

                                         {/* Activities price */}
                                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                           <span>{lang === 'AR' ? 'الأنشطة والفعاليات المشمولة:' : 'Included Trip Activities:'}</span>
                                           <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                                             {lang === 'AR' ? "مشمولة (" + formatPrice(currentActivitiesPrice * guestCount) + ")" : "Included (" + formatPrice(currentActivitiesPrice * guestCount) + ")"}
                                           </span>
                                         </div>

                                         {/* Transportation */}
                                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                           <span>{lang === 'AR' ? 'وسائل الانتقال (سيارات مكيفة):' : 'Included Transportation (AC Coach):'}</span>
                                           <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                                             {lang === 'AR' ? "مشمولة (" + formatPrice(transportCost * guestCount) + ")" : "Included (" + formatPrice(transportCost * guestCount) + ")"}
                                           </span>
                                         </div>

                                         {/* Accommodation / breakdown items */}
                                         {breakdownItems.filter(item => {
                                           const lbl = item.label.toLowerCase();
                                           return !transportKeywords.some(kw => lbl.includes(kw)) &&
                                                  !taxKeywords.some(kw => lbl.includes(kw)) &&
                                                  !feeKeywords.some(kw => lbl.includes(kw));
                                         }).map((item, idx) => (
                                           <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                             <span>{item.label}:</span>
                                             <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                                               {lang === 'AR' ? "مشمول (" + formatPrice(item.amount * guestCount) + ")" : "Included (" + formatPrice(item.amount * guestCount) + ")"}
                                             </span>
                                           </div>
                                         ))}

                                         {addonsTotal > 0 && (
                                           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '5px' }}>
                                             <span>{lang === 'AR' ? 'الخدمات الإضافية المختارة:' : 'Selected Add-ons:'}</span>
                                             <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{formatPrice(addonsTotal)}</span>
                                           </div>
                                         )}

                                         {/* Taxes (Fixed but fully included in standard) */}
                                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '5px' }}>
                                           <span>{lang === 'AR' ? 'الضرائب الحكومية المشمولة:' : 'Included Tourism Taxes:'}</span>
                                           <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                                             {lang === 'AR' ? "مشمولة (" + formatPrice(taxCost * guestCount) + ")" : "Included (" + formatPrice(taxCost * guestCount) + ")"}
                                           </span>
                                         </div>

                                         {/* Fees (Fixed but fully included in standard) */}
                                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                           <span>{lang === 'AR' ? 'رسوم خدمة المنصة المشمولة:' : 'Included Platform Service Fees:'}</span>
                                           <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                                             {lang === 'AR' ? "مشمولة (" + formatPrice(feeCost * guestCount) + ")" : "Included (" + formatPrice(feeCost * guestCount) + ")"}
                                           </span>
                                         </div>
                                       </>
                                     )}
                                   </div>
                                 );
                               })()}`;

// Also update the customized totalPrice calculation to use fixed taxes and fees
content = content.replace(
  `                        let totalPrice = isCustomizing 
                          ? ((singlePrice * guestCount) + addonsTotal) * 1.15 
                          : (singlePrice * guestCount) + addonsTotal;
                        let originalTotalPrice = isCustomizing
                          ? ((originalSinglePrice * guestCount) + addonsTotal) * 1.15
                          : (originalSinglePrice * guestCount) + addonsTotal;`,
  `                        // Calculate itemized fixed values for taxes & fees
                        const breakdownItemsTemp = packageData?.priceBreakdown || [];
                        let taxCostTemp = 0;
                        let feeCostTemp = 0;
                        breakdownItemsTemp.forEach(item => {
                          const lbl = item.label.toLowerCase();
                          if (lbl.includes('tax') || lbl.includes('ضرائب') || lbl.includes('ضريبة')) taxCostTemp += item.amount;
                          if (lbl.includes('fee') || lbl.includes('رسوم') || lbl.includes('خدمة')) feeCostTemp += item.amount;
                        });
                        if (taxCostTemp === 0) taxCostTemp = 100;
                        if (feeCostTemp === 0) feeCostTemp = 50;

                        let totalPrice = isCustomizing 
                          ? ((singlePrice * guestCount) + addonsTotal) + (taxCostTemp * guestCount) + (feeCostTemp * guestCount) 
                          : (singlePrice * guestCount) + addonsTotal;
                        let originalTotalPrice = isCustomizing
                          ? ((originalSinglePrice * guestCount) + addonsTotal) + (taxCostTemp * guestCount) + (feeCostTemp * guestCount)
                          : (originalSinglePrice * guestCount) + addonsTotal;`
);

if (content.includes(targetOld)) {
  content = content.replace(targetOld, replacementNew);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('SUCCESS: PackageDetails modified with fixed taxes/fees.');
} else {
  console.log('ERROR: Target breakdown block not found.');
}
