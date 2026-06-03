const fs = require('fs');
let content = fs.readFileSync('./frontend/src/pages/PackageDetails/PackageDetails.jsx', 'utf8');
const old = '{formatPrice((currentActivitiesPrice + transportCost + accommodationCost) * guestCount + addonsTotal)}';
const neo = '{formatPrice(customSubtotal)}';
if (content.includes(old)) {
  content = content.replace(old, neo);
  fs.writeFileSync('./frontend/src/pages/PackageDetails/PackageDetails.jsx', content, 'utf8');
  console.log('DONE - replaced subtotal');
} else {
  console.log('NOT FOUND - string not in file');
}
