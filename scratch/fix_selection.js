const fs = require('fs');
const file = 'frontend/src/pages/PackageDetails/PackageDetails.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix the ready day tab button styling
const targetButton = `                                    <button
                                      type="button"
                                      onClick={() => setAddDayTab('ready')}
                                      style={{
                                        cursor: 'pointer',
                                        fontWeight: '700',
                                        fontSize: '0.8rem',
                                        flex: 1,
                                        transition: 'all 0.2s'
                                      }}
                                    >`;

const replacementButton = `                                    <button
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

// 2. Fix the new day activity select element
const targetSelect = `                                      <h4 style={{ color: '#f59e0b', fontSize: '0.9rem', margin: '0 0 10px 0', fontWeight: '800' }}>
                                         {lang === 'AR' ? \`إضافة نشاط لليوم الجديد (اليوم \${displayItinerary.length + 1}):\` : \`Add Activity to Start Day \${displayItinerary.length + 1}:\`}
                                       </h4>
                                             });
                                           })()}
                                         </select>`;

const replacementSelect = `                                      <h4 style={{ color: '#f59e0b', fontSize: '0.9rem', margin: '0 0 10px 0', fontWeight: '800' }}>
                                         {lang === 'AR' ? \`إضافة نشاط لليوم الجديد (اليوم \${displayItinerary.length + 1}):\` : \`Add Activity to Start Day \${displayItinerary.length + 1}:\`}
                                       </h4>
                                       {/* Visual Grid Selector: Show premium cards instead of a select dropdown */}
                                       <div className="activity-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
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
                                                 style={{ 
                                                   cursor: 'pointer',
                                                   background: isSelected ? 'rgba(245, 158, 11, 0.15)' : '#1a1a2e',
                                                   border: isSelected ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                                                   borderRadius: '8px',
                                                   padding: '8px',
                                                   transition: 'all 0.2s'
                                                 }}
                                               >
                                                 <div className="activity-card-image-wrap" style={{ position: 'relative', height: '80px', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                                                   <img src={imgUrl} alt={act.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                   <div style={{ position: 'absolute', bottom: '6px', right: '6px', background: 'rgba(0,0,0,0.8)', color: '#f59e0b', fontSize: '0.74rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                                                     +{act.price} EGP
                                                   </div>
                                                 </div>
                                                 <div className="activity-card-info" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                   <strong style={{ color: '#fff', fontSize: '0.8rem', lineHeight: '1.2', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '30px' }}>
                                                     {act.name}
                                                   </strong>
                                                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                     <span className="activity-card-provider" style={{ fontSize: '0.7rem', color: '#a0a0a0' }}>
                                                       <i className="fa-solid fa-parachute-box" style={{ color: '#f59e0b', marginRight: '4px' }}></i>
                                                       {provName.substring(0, 8)}{provName.length > 8 ? '...' : ''}
                                                     </span>
                                                   </div>
                                                 </div>
                                               </div>
                                             );
                                           });
                                         })()}
                                       </div>`;

// Normalise line endings to avoid git checkout mismatches
content = content.replace(/\r\n/g, '\n');
const targetButtonNorm = targetButton.replace(/\r\n/g, '\n');
const replacementButtonNorm = replacementButton.replace(/\r\n/g, '\n');
const targetSelectNorm = targetSelect.replace(/\r\n/g, '\n');
const replacementSelectNorm = replacementSelect.replace(/\r\n/g, '\n');

if (content.includes(targetButtonNorm)) {
  content = content.replace(targetButtonNorm, replacementButtonNorm);
  console.log('Successfully updated the tab button styles.');
} else {
  console.log('Could not find the target button pattern.');
}

if (content.includes(targetSelectNorm)) {
  content = content.replace(targetSelectNorm, replacementSelectNorm);
  console.log('Successfully updated the new day activity selector.');
} else {
  console.log('Could not find the target selector pattern.');
}

fs.writeFileSync(file, content, 'utf8');
console.log('Fix script finished execution.');
