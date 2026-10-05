const cron = require('node-cron');
const https = require('https');

// Render automatically provides RENDER_EXTERNAL_URL in production
const backendUrl = process.env.RENDER_EXTERNAL_URL || 'http://localhost:5000';

const pingServer = () => {
  cron.schedule('*/14 * * * *', () => {
    console.log(`[Cron] Pinging server to keep it alive: ${backendUrl}/api/health`);
    
    // We use the appropriate module based on http or https
    const httpModule = backendUrl.startsWith('https') ? https : require('http');
    
    httpModule.get(`${backendUrl}/api/health`, (res) => {
      if (res.statusCode === 200) {
        console.log(`[Cron] Server pinged successfully: status ${res.statusCode}`);
      } else {
        console.error(`[Cron] Ping failed with status code: ${res.statusCode}`);
      }
    }).on('error', (err) => {
      console.error('[Cron] Error during ping:', err.message);
    });
  });
};

module.exports = pingServer;
