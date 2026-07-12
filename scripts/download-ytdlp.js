'use strict';

// Downloads the yt-dlp standalone binary directly from GitHub's release
// redirect URL (not the GitHub API, which is rate-limited and shared
// across many customers on CI/build infrastructure like Render/Vercel).
const https = require('https');
const fs = require('fs');
const path = require('path');

const BIN_DIR = path.join(__dirname, '..', 'bin');
const isWin = process.platform === 'win32';
const assetName = isWin ? 'yt-dlp.exe' : 'yt-dlp_linux';
const destPath = path.join(BIN_DIR, isWin ? 'yt-dlp.exe' : 'yt-dlp');

function download(url, dest, redirectsLeft = 5) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'osonyukla-app' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          if (redirectsLeft <= 0) return reject(new Error('Too many redirects'));
          res.resume();
          return resolve(download(res.headers.location, dest, redirectsLeft - 1));
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`Yuklab bo'lmadi (${url}): HTTP ${res.statusCode}`));
        }
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => file.close(() => resolve()));
        file.on('error', reject);
      })
      .on('error', reject);
  });
}

async function main() {
  if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
    console.log(`[download-ytdlp] Allaqachon mavjud: ${destPath}`);
    return;
  }
  fs.mkdirSync(BIN_DIR, { recursive: true });
  const url = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/${assetName}`;
  console.log(`[download-ytdlp] Yuklanmoqda: ${url}`);
  await download(url, destPath);
  if (!isWin) fs.chmodSync(destPath, 0o755);
  const { size } = fs.statSync(destPath);
  if (size < 1024 * 1024) {
    throw new Error(`Yuklangan fayl juda kichik (${size} bayt) - yuklab olish muvaffaqiyatsiz bo'lgan bo'lishi mumkin.`);
  }
  console.log(`[download-ytdlp] Tayyor: ${destPath} (${size} bayt)`);
}

main().catch((err) => {
  console.error('[download-ytdlp] XATOLIK:', err.message);
  process.exit(1);
});
