const fs = require('fs');
const readline = require('readline');

const logPath = 'C:\\Users\\mariu\\.gemini\\antigravity\\brain\\2c833f67-b6fd-4e67-8055-e8219b51ddc3\\.system_generated\\logs\\transcript.jsonl';

const rl = readline.createInterface({
  input: fs.createReadStream(logPath),
  crlfDelay: Infinity
});

rl.on('line', (line) => {
  try {
    const data = JSON.parse(line);
    if (data.step_index === 308 || data.step_index === 453) {
      console.log(`=== STEP ${data.step_index} CONTENT ===`);
      console.log(data.content);
      console.log('===================================\n');
    }
  } catch (err) {}
});
