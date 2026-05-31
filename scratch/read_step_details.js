const fs = require('fs');
const readline = require('readline');

const logPath = 'C:\\Users\\mariu\\.gemini\\]antigravity\\brain\\2c833f67-b6fd-4e67-8055-e8219b51ddc3\\.system_generated\\logs\\transcript.jsonl';
// Wait, the path has a small bracket typo in the prompt, let's make sure it is exactly the path:
const realLogPath = 'C:\\Users\\mariu\\.gemini\\antigravity\\brain\\2c833f67-b6fd-4e67-8055-e8219b51ddc3\\.system_generated\\logs\\transcript.jsonl';

const rl = readline.createInterface({
  input: fs.createReadStream(realLogPath),
  crlfDelay: Infinity
});

rl.on('line', (line) => {
  try {
    const data = JSON.parse(line);
    if (data.step_index >= 600 && data.step_index <= 800) {
      const content = data.content || '';
      if (data.type === 'USER_INPUT') {
        console.log(`=== STEP ${data.step_index} (User) ===`);
        console.log(content);
        console.log('===================================\n');
      } else if (data.type === 'PLANNER_RESPONSE' || data.type === 'MODEL') {
        if (content.includes('sticky-price-footer') || content.includes('الشريط') || content.includes('booking-card') || content.includes('bookingCard')) {
          console.log(`=== STEP ${data.step_index} (Model) ===`);
          console.log(content.substring(0, 500));
          console.log('===================================\n');
        }
      }
    }
  } catch (err) {}
});
