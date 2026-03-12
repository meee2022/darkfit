const fs = require('fs');

async function main() {
  const apiKey = 'ec10d5dbffmsh2d2f0ad3cba4decp16f48cjsn461438b83c09';
  
  console.log("جاري جلب التمارين التي تحتوي على صور GIF من API...");
  
  try {
    const response = await fetch('https://exercisedb.p.rapidapi.com/exercises?limit=1500', {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'exercisedb.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`تم بنجاح سحب ${data.length} تمرين من RapidAPI!`);
    
    // حفظ الملف محلياً للمراجعة (اختياري)
    fs.writeFileSync('./convex/exercisedb-gifs.json', JSON.stringify(data, null, 2));
    console.log("تم حفظ التمارين في مسار: convex/exercisedb-gifs.json");
    
    console.log("\nلإدخال هذه التمارين في قاعدة البيانات باستخدام المفتاح، يمكنك فوراً تشغيل الأمر التالي في التيرمينال الخاص بك:");
    console.log("npx convex run exercises:fetchRapidApiGifs --data '{\"apiKey\": \"ec10d5dbffmsh2d2f0ad3cba4decp16f48cjsn461438b83c09\"}'");
    console.log("\nأو من خلال لوحة تحكم Convex (Dashboard).");
    
  } catch (error) {
    console.error("حدث خطأ أثناء الاتصال بالـ API:", error.message);
  }
}

main();
