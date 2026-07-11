'use strict';

const fs = require('fs');
const { isAllowedUrl, downloadVideo, friendlyErrorMessage } = require('../lib/downloader');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { url } = req.body || {};
  if (!url || !isAllowedUrl(url)) {
    res.status(400).json({ error: "Faqat YouTube yoki Instagram havolalari qabul qilinadi." });
    return;
  }

  try {
    const { filePath, downloadName } = await downloadVideo(url);
    res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
    res.setHeader('Content-Type', 'video/mp4');

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
    stream.on('close', () => fs.unlink(filePath, () => {}));
    stream.on('error', (err) => {
      console.error(err);
      fs.unlink(filePath, () => {});
      if (!res.headersSent) res.status(500).json({ error: friendlyErrorMessage(err) });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: friendlyErrorMessage(err) });
  }
};
