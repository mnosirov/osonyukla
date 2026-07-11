# Video Yuklovchi (Instagram & YouTube)

Instagram va YouTube havolalarini kiritib, videoni brauzer orqali yuklab olish uchun oddiy web sahifa.
Lokalda ham, Vercel'da (serverless) ham ishlaydi.

## Lokal ishga tushirish

```
npm install
npm start
```

Keyin brauzerda oching: http://localhost:3000

## Vercel'ga joylashtirish

1. Loyihani GitHub repositoriyasiga yuklang.
2. Vercel dashboardida "New Project" → repositoriyani tanlang → "Deploy" (frameworkni avtomatik "Other" deb aniqlaydi, qo'shimcha sozlash shart emas — `vercel.json` allaqachon tayyor).
3. Deploy tugagach, berilgan `*.vercel.app` havolasi orqali sahifa ishlaydi.

### Nega binariylarni alohida o'rnatish shart emas

`yt-dlp` va `ffmpeg` endi loyiha ichida qo'lda saqlangan `.exe` fayllar emas — ular `youtube-dl-exec` va
`ffmpeg-static` npm paketlari orqali `npm install` vaqtida joriy platformaga mos holda avtomatik yuklab olinadi
(lokalda Windows, Vercel'da Linux binariylari). Shu sabab loyiha kichik va GitHub'ga muammosiz yuklanadi.

## Qanday ishlaydi

- `lib/downloader.js` — umumiy mantiq (video ma'lumoti olish, yuklab olish, xatoliklarni tarjima qilish)
- `api/info.js`, `api/download.js` — Vercel serverless funksiyalari (production)
- `server.js` — Express server, faqat lokal development uchun (`npm start`)
- `public/index.html` — frontend: havolani kiriting, "Tekshirish" orqali oldindan ko'ring, so'ng "Yuklab olish"

Video fayllar vaqtinchalik papkaga (`os.tmpdir()`) yoziladi va foydalanuvchiga yuborilgach darhol o'chiriladi —
bu Vercel'ning faqat `/tmp` yozish huquqi berishiga mos keladi.

## Cheklovlar va cookies

YouTube va ayniqsa Instagram ba'zan "bot emasligingizni tasdiqlang" yoki "tizimga kiring" degan xatolik beradi —
bu ularning server tomonidagi himoyasi, loyihadagi xato emas. Buni hal qilish uchun:

1. Brauzeringizga "Get cookies.txt LOCALLY" kabi kengaytma o'rnating.
2. Instagram yoki YouTube saytiga login qilingan holda cookie faylini export qiling.
3. **Lokalda**: faylni loyiha papkasiga `cookies.txt` nomi bilan joylashtiring (`.gitignore`da bo'lgani uchun tasodifan ulashilmaydi).
4. **Vercel'da**: cookie faylini reponi committee qilmang — buning o'rniga fayl matnini Vercel loyihasining
   Environment Variables bo'limida `COOKIES_CONTENT` nomi bilan qo'shing. Server uni har chaqiriqda vaqtinchalik
   faylga yozib ishlatadi.

## Vercel'dagi cheklovlar haqida eslatma

Serverless funksiya bajarilish vaqti `vercel.json`da 60 soniyaga sozlangan (Hobby tarifda maksimal ruxsat etilgan
qiymat). Juda uzun yoki yuqori sifatli videolar shu vaqt ichida yuklab bo'lmasligi mumkin — bunday holatda kichikroq
sifat tanlang yoki Pro tarifga o'ting (u yerda muddat uzunroq bo'ladi).

## Eslatma

Faqat o'zingizga tegishli yoki yuklab olishga ruxsat berilgan kontentni yuklab oling — mualliflik huquqiga rioya qiling.
# osonyukla
