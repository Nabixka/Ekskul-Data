const URL = 'http://localhost:3000/auth/login'
const TOTAL_REQUESTS = 500
const CONCURRENT_BATCH = 500

async function hitRegisterEndpoint(id) {
  const start = performance.now();
  try {
    const payload = {
      nis: 13000,
      password: 'smkn10dkijkt'
    };

    const response = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const end = performance.now();

    if (!response.ok && id <= 5) {
      const text = await response.text();
      console.log(`
[Error Detail] ID id: Status ${response.status} - text`);
    }

    return {
      id,
      status: response.status,
      duration: Math.round(end - start),
      success: response.ok,
    };
  } catch (error) {
    const end = performance.now();
    if (id <= 5) console.log(`
[Network Error] ID id: ${error.message}`);

    return {
      id,
      status: 'ERROR',
      duration: Math.round(end - start),
      success: false,
      error: error.message,
    };
  }
}

async function runTest() {
  console.log(`🚀 Memulai Load Test REGISTER ke URL`);
  console.log(`Total Request: TOTAL_REQUESTS, Konkurensi: CONCURRENT_BATCH
`);

  const globalStart = performance.now();
  let successCount = 0;
  let failCount = 0;
  let totalDuration = 0;

  for (let i = 0; i < TOTAL_REQUESTS; i += CONCURRENT_BATCH) {
    const batch = [];
    for (let j = 0; j < CONCURRENT_BATCH && (i + j) < TOTAL_REQUESTS; j++) {
      batch.push(hitRegisterEndpoint(i + j + 1));
    }

    const results = await Promise.all(batch);

    results.forEach((res) => {
      if (res.success) {
        successCount++;
      } else {
        failCount++;
      }
      totalDuration += res.duration;
    });

    process.stdout.write(`Progress: ${Math.min(i + CONCURRENT_BATCH, TOTAL_REQUESTS)} / TOTAL_REQUESTS request selesai...
`);
  }

  const globalEnd = performance.now();
  const totalTimeSec = ((globalEnd - globalStart) / 1000).toFixed(2);

  console.log(`Waktu Total       : ${totalTimeSec} detik`);
  console.log(`Request Sukses    : ${successCount}`);
  console.log(`Request Gagal     : ${failCount}`);
  console.log(`Rata-rata Respon  : ${Math.round(totalDuration / TOTAL_REQUESTS)} ms`);
}

runTest();