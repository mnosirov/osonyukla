# osonyukla — Video Yuklovchi (Instagram & YouTube)

Instagram va YouTube havolalarini kiritib, videoni brauzer orqali yuklab olish uchun web sahifa.

## Lokal ishga tushirish

```
npm install
npm start
```

Keyin brauzerda oching: http://localhost:3000

`npm install` avtomatik ravishda `scripts/download-ytdlp.js` skriptini ishga tushiradi — bu joriy platformaga mos
`yt-dlp` binariysini (`bin/` papkasiga) yuklab oladi. Alohida o'rnatish shart emas.

## Production (Render)

Loyiha [Render](https://render.com)'da doimiy Node server sifatida ishlaydi (`npm start` → `server.js`):

1. GitHub repositoriyasini Render'ga ulang ("New +" → "Web Service").
2. Build Command: `npm install`, Start Command: `npm start`.
3. Kerak bo'lsa quyidagi Environment Variables'ni qo'shing (pastga qarang).

Vercel'ga ham deploy qilish mumkin (`vercel.json` va `api/` papkasi shu uchun tayyorlangan), lekin serverless
muhit uzoq davom etadigan yordamchi jarayonlarni (masalan PO token provider) qo'llab-quvvatlamaydi, shuning
uchun doimiy server (Render) tavsiya etiladi.

## Qanday ishlaydi

- `scripts/download-ytdlp.js` — `npm install` vaqtida yt-dlp'ning platforma uchun mos standalone binariysini
  (Windows: `yt-dlp.exe`, Linux: `yt-dlp_linux`) to'g'ridan-to'g'ri GitHub'ning yuklab olish havolasidan (API
  emas — bu limitlanmaydi) yuklab, `bin/` papkasiga joylaydi.
- `lib/downloader.js` — umumiy mantiq: video ma'lumoti olish, yuklab olish, cookies/proksi sozlamalarini
  qo'llash, xatoliklarni foydalanuvchiga tushunarli tilga tarjima qilish.
- `server.js` — asosiy Express server (`npm start`), Render/lokal uchun.
- `api/info.js`, `api/download.js` — Vercel serverless funksiyalari (agar Vercel'da ishlatilsa).
- `public/index.html` — frontend: havolani kiriting, "Tekshirish" orqali oldindan ko'ring, so'ng "Yuklab olish".

Video fayllar vaqtinchalik papkaga (`os.tmpdir()`) yoziladi va foydalanuvchiga yuborilgach darhol o'chiriladi.

## YouTube/Instagram'ning bot-tekshiruvi haqida

YouTube va Instagram ba'zan "bot emasligingizni tasdiqlang" yoki "tizimga kiring" xatosini beradi — bu ularning
server tomonidagi himoyasi (ayniqsa bulutli/server IP manzillariga nisbatan qattiqroq), loyihadagi xato emas.
Bu tekshiruv har bir video uchun bir xilda ishlamaydi — ba'zi videolar muammosiz ochiladi, ba'zilari bloklanadi.

### Variant 1: Proksi-server (ko'p foydalanuvchili loyiha uchun tavsiya etiladi)

So'rovlarni bitta server IP manzili o'rniga rotatsion proksi orqali yuborish YouTube/Instagram tomonidan
"shubhali" deb belgilanish ehtimolini kamaytiradi — bu ommaviy (ko'p foydalanuvchili) loyihalar uchun eng
barqaror yechim, chunki u shaxsiy hisobga bog'liq emas.

1. Rotatsion proksi xizmatiga ro'yxatdan o'ting (masalan Webshare, IPRoyal, Smartproxy — "residential rotating"
   turini tanlang, "datacenter" emas, chunki YouTube datacenter IP'larni tezroq bloklaydi).
2. Xizmatdan yagona gateway manzilini oling (odatda `http://username:password@gateway-host:port` ko'rinishida).
3. Hosting platformasida (Render/Vercel) Environment Variable qo'shing:
   - **Key:** `PROXY_URL`
   - **Value:** `http://username:password@gateway-host:port`
4. Redeploy qiling. Server avtomatik ravishda barcha yt-dlp so'rovlarini shu proksi orqali yuboradi.

### Variant 2: Cookies (faqat shaxsiy/kichik loyihalar uchun tavsiya etiladi)

⚠️ **Ko'p foydalanuvchili ommaviy loyiha uchun tavsiya etilmaydi** — bu sizning shaxsiy hisobingizdan
foydalanadi, va begona foydalanuvchilarning barcha yuklab olishlari sizning hisobingiz nomidan amalga oshadi
(hisobingiz cheklanish xavfi bilan).

1. Brauzeringizga "Get cookies.txt LOCALLY" kabi kengaytma o'rnating.
2. YouTube/Instagram'ga **hozirgina** login qilib, darhol cookie faylini eksport qiling (eski cookie tezda
   yaroqsiz bo'lib qoladi).
3. **Lokalda**: faylni loyiha papkasiga `cookies.txt` nomi bilan joylashtiring (`.gitignore`da bor, tasodifan
   ulashilmaydi).
4. **Serverda**: fayl matnini Environment Variables'ga `COOKIES_CONTENT` nomi bilan qo'shing.

Eslatma: cookies va proksi bir vaqtda ishlatilganda, YouTube bypass (`android`/`web_safari` client) avtomatik
o'chiriladi — chunki bu ikkalasi ziddiyatga kirib, "No video formats found" xatosini beradi.

## Eslatma

Bunday xizmatni ommaviy taqdim etish YouTube va Instagram'ning foydalanish shartlariga zid bo'lishi mumkin.
Faqat o'zingizga tegishli yoki yuklab olishga ruxsat berilgan kontentni yuklab oling — mualliflik huquqiga
rioya qiling.
