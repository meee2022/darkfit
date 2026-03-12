import fetch from 'node-fetch'; // if available, or just use native fetch if node > 18
async function test() {
  try {
    const res = await fetch('https://exercisedb.p.rapidapi.com/exercises?limit=5', {
       headers: { 'x-rapidapi-key': 'ec10d5dbffmsh2d2f0ad3cba4decp16f48cjsn461438b83c09', 'x-rapidapi-host': 'exercisedb.p.rapidapi.com' }
    });
    const data = await res.json();
    console.log('Result type:', typeof data);
    console.log('IsArray?', Array.isArray(data));
    if (Array.isArray(data)) {
       console.log('Length:', data.length);
       console.log('First item:', data[0]);
    } else {
       console.log('Keys:', Object.keys(data));
       console.log('Data:', data);
    }
  } catch(e) { console.error('Fetch err:', e.message); }
}
test();
