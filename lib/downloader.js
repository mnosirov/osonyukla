'use strict';

const path = require('path');
const os = require('os');
const fs = require('fs');
const crypto = require('crypto');
const { spawn } = require('child_process');
const ffmpegPath = require('ffmpeg-static');

const YTDLP_PATH = path.join(__dirname, '..', 'bin', process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');

// Spawned directly (no shell) so paths containing spaces are handled correctly
// on all platforms, unlike youtube-dl-exec's own shell-based fallback.
function runYtDlp(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(YTDLP_PATH, args, { windowsHide: true });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (d) => (stdout += d.toString()));
    proc.stderr.on('data', (d) => (stderr += d.toString()));
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(Object.assign(new Error(stderr || `yt-dlp ${code} bilan tugadi`), { stderr }));
    });
  });
}

const ALLOWED_HOST_PATTERN = /(^|\.)(youtube\.com|youtu\.be|instagram\.com)$/i;

function isAllowedUrl(rawUrl) {
  try {
    const u = new URL(rawUrl);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
    return ALLOWED_HOST_PATTERN.test(u.hostname);
  } catch {
    return false;
  }
}

let resolvedCookiesPath;
function cookiesArgs() {
  if (resolvedCookiesPath === undefined) {
    const localCookies = path.join(process.cwd(), 'cookies.txt');
    if (fs.existsSync(localCookies)) {
      resolvedCookiesPath = localCookies;
    } else if (process.env.COOKIES_CONTENT) {
      const tmpCookies = path.join(os.tmpdir(), 'cookies.txt');
      fs.writeFileSync(tmpCookies, process.env.COOKIES_CONTENT);
      resolvedCookiesPath = tmpCookies;
    } else {
      resolvedCookiesPath = null;
    }
  }
  return resolvedCookiesPath ? ['--cookies', resolvedCookiesPath] : [];
}

// The android/web_safari client bypass avoids YouTube's anonymous bot-check,
// but it conflicts with cookie-based auth (yields "No video formats found!").
// Only use it when there are no cookies to authenticate with instead.
function youtubeBypassArgs(url) {
  if (/youtube\.com|youtu\.be/i.test(url) && cookiesArgs().length === 0) {
    return ['--extractor-args', 'youtube:player_client=android,web_safari'];
  }
  return [];
}

// Routes yt-dlp's traffic through a rotating proxy (PROXY_URL, e.g.
// http://user:pass@gateway-host:port) so requests aren't all seen by
// YouTube/Instagram as coming from one server IP.
function proxyArgs() {
  return process.env.PROXY_URL ? ['--proxy', process.env.PROXY_URL] : [];
}

function friendlyErrorMessage(err) {
  const msg = (err && (err.stderr || err.message)) || '';
  if (/sign in|cookies|login required|empty media response/i.test(msg)) {
    return "Bu video/post uchun tizimga kirish (cookies) talab qilinadi. cookies.txt fayl yoki COOKIES_CONTENT muhit o'zgaruvchisini sozlang (README.md ga qarang).";
  }
  if (/private|not available|unavailable/i.test(msg)) {
    return 'Bu video mavjud emas yoki yopiq (private) hisob postidir.';
  }
  if (/429|too many requests/i.test(msg)) {
    return "Juda ko'p so'rov yuborildi, biroz kutib qayta urinib ko'ring.";
  }
  return "Video bilan ishlashda xatolik. Havola to'g'riligini tekshiring.";
}

async function getVideoInfo(url) {
  const args = [
    '-j',
    '--no-playlist',
    ...youtubeBypassArgs(url),
    ...cookiesArgs(),
    ...proxyArgs(),
    url,
  ];
  const { stdout } = await runYtDlp(args);
  const info = JSON.parse(stdout.trim().split('\n')[0]);
  return {
    title: info.title,
    thumbnail: info.thumbnail,
    duration: info.duration,
    uploader: info.uploader || info.channel || '',
    ext: info.ext,
  };
}

async function downloadVideo(url) {
  const jobId = crypto.randomUUID();
  const tmpDir = os.tmpdir();
  const outputTemplate = path.join(tmpDir, `${jobId}.%(ext)s`);

  const args = [
    '--no-playlist',
    '-f', 'bv*+ba/b',
    '--merge-output-format', 'mp4',
    '--ffmpeg-location', ffmpegPath,
    '-o', outputTemplate,
    ...youtubeBypassArgs(url),
    ...cookiesArgs(),
    ...proxyArgs(),
    url,
  ];
  await runYtDlp(args);

  const files = fs.readdirSync(tmpDir).filter((f) => f.startsWith(jobId));
  if (files.length === 0) throw new Error('Yuklangan fayl topilmadi.');

  const filePath = path.join(tmpDir, files[0]);
  const downloadName = files[0].replace(jobId, 'video');
  return { filePath, downloadName };
}

module.exports = { isAllowedUrl, getVideoInfo, downloadVideo, friendlyErrorMessage };
