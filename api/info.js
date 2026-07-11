'use strict';

const { isAllowedUrl, getVideoInfo, friendlyErrorMessage } = require('../lib/downloader');

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
    const info = await getVideoInfo(url);
    res.status(200).json(info);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: friendlyErrorMessage(err) });
  }
};
