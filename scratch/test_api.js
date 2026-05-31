async function test() {
  try {
    const res = await fetch('http://localhost:3000/experience/6a173d2c9b103cf1e68945b3');
    const json = await res.json();
    console.log('Status:', res.status);
    console.log('JSON:', JSON.stringify(json, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
