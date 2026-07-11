'use strict';

const express = require('express');
const path = require('path');
const fs = require('fs');
const { isAllowedUrl, getVideoInfo, downloadVideo, friendlyErrorMessage } = require('./lib/downloader');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/info', async (req, res) => {
  const { url } = req.body || {};
  if (!url || !isAllowedUrl(url)) {
    return res.status(400).json({ error: "Faqat YouTube yoki Instagram havolalari qabul qilinadi." });
  }
  try {
    res.json(await getVideoInfo(url));
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: friendlyErrorMessage(err),
      debug: { message: err.message, code: err.code, stderr: err.stderr },
    });
  }
});

app.post('/api/download', async (req, res) => {
  const { url } = req.body || {};
  if (!url || !isAllowedUrl(url)) {
    return res.status(400).json({ error: "Faqat YouTube yoki Instagram havolalari qabul qilinadi." });
  }
  try {
    const { filePath, downloadName } = await downloadVideo(url);
    res.download(filePath, downloadName, (err) => {
      fs.unlink(filePath, () => {});
      if (err) console.error('Yuborishda xatolik:', err.message);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: friendlyErrorMessage(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Server ishga tushdi: http://localhost:${PORT}`);
});
