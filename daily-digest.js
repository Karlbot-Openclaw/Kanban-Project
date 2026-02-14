#!/usr/bin/env node
/**
 * Daily AI & Tech Digest
 * Fetches news, weather, and free AI model updates, then emails a digest.
 */

const https = require('https');
const nodemailer = require('nodemailer');
const fs = require('fs');

// Load config
const configPath = __dirname + '/digest-config.json';
const CONFIG = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Utility: HTTP GET with promise
function httpsGet(url) {
  return new Promise((resolve, reject) => {
    // If URL is https://api.rss2json.com, it will work
    https.get(url, { timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// Parse RSS via rss2json (no API key needed for low volume)
async function fetchRSS(feedUrl, limit = 5) {
  const api = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
  const resp = await httpsGet(api);
  if (resp.status !== 200) throw new Error(`RSS fetch failed: ${resp.status}`);
  const json = JSON.parse(resp.data);
  if (json.status !== 'ok') throw new Error('RSS API error');
  return json.items.slice(0, limit).map(item => ({
    title: item.title,
    link: item.link,
    pubDate: item.pubDate,
    snippet: item.description?.substring(0, 160) + '...' || ''
  }));
}

// Fetch weather from wttr.in (no API key)
async function fetchWeather(location) {
  try {
    const url = `https://wttr.in/${encodeURIComponent(location)}?format=j1`;
    const resp = await httpsGet(url);
    if (resp.status !== 200) throw new Error(`Weather fetch failed: ${resp.status}`);
    const data = JSON.parse(resp.data);
    const current = data.current_condition[0];
    const tempF = current.temp_F;
    const desc = current.weatherDesc[0].value;
    const feelsLike = current.FeelsLikeF;
    return `${tempF}°F, ${desc} (feels like ${feelsLike}°F)`;
  } catch (e) {
    console.warn('Weather fetch failed, using default:', e.message);
    return 'N/A';
  }
}

// Fetch free models from OpenRouter public endpoint
async function fetchFreeModels() {
  try {
    const resp = await httpsGet('https://openrouter.ai/api/models');
    if (resp.status !== 200) return [];
    const models = JSON.parse(resp.data);
    // Filter for models with free pricing. OpenRouter pricing is per token: {prompt: "0", completion: "0"} means free.
    const free = models.filter(m => {
      const pricing = m.pricing;
      if (!pricing) return false;
      // Check if both prompt and completion are zero (or empty)
      return (pricing.prompt === '0' || pricing.prompt === 0) && (pricing.completion === '0' || pricing.completion === 0);
    }).slice(0, 10);
    return free.map(m => ({ id: m.id, name: m.name, context: m.context_length }));
  } catch (e) {
    console.error('Failed to fetch OpenRouter models:', e.message);
    return [];
  }
}

// Build the HTML and text email bodies
function buildContent(aiNews, techNews, weather, freeModels) {
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const newsList = (items) => items.map(item => `
    <li style="margin-bottom: 12px;">
      <strong><a href="${item.link}" style="color: #1a0dab; text-decoration: none;">${item.title}</a></strong><br>
      <span style="color: #545454; font-size: 0.95em;">${item.snippet}</span>
    </li>`).join('');

  const modelsList = freeModels.length > 0 ? freeModels.map(m => `
    <li><strong>${m.name}</strong> (ID: ${m.id}, context: ${m.context})</li>`).join('') : '<li><em>No free models found or endpoint unavailable.</em></li>';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 24px; background: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 8px;">
      <header style="margin-bottom: 24px; border-bottom: 1px solid #e0e0e0; padding-bottom: 16px;">
        <h1 style="margin: 0; color: #202124; font-size: 24px;">🤖 Daily AI & Tech Digest</h1>
        <p style="margin: 8px 0 0; color: #5f6368;">${date} | <strong>Lake Worth, FL</strong>: ${weather}</p>
      </header>

      <section style="margin-bottom: 28px;">
        <h2 style="color: #1a73e8; font-size: 18px; border-bottom: 2px solid #1a73e8; padding-bottom: 6px;">🔥 Top AI News</h2>
        <ul style="padding-left: 20px;">
          ${aiNews ? newsList(aiNews) : '<li>No AI news available.</li>'}
        </ul>
      </section>

      <section style="margin-bottom: 28px;">
        <h2 style="color: #1a73e8; font-size: 18px; border-bottom: 2px solid #1a73e8; padding-bottom: 6px;">🎁 Free AI Models on OpenRouter</h2>
        <ul style="padding-left: 20px;">
          ${modelsList}
        </ul>
        <p style="font-size: 0.9em; color: #5f6368; margin-top: 8px;">Source: <a href="https://openrouter.ai/models" style="color: #1a0dab;">OpenRouter Models</a></p>
      </section>

      <section style="margin-bottom: 28px;">
        <h2 style="color: #1a73e8; font-size: 18px; border-bottom: 2px solid #1a73e8; padding-bottom: 6px;">📰 Tech Headlines</h2>
        <ul style="padding-left: 20px;">
          ${techNews ? newsList(techNews) : '<li>No tech news available.</li>'}
        </ul>
      </section>

      <footer style="margin-top: 40px; border-top: 1px solid #e0e0e0; padding-top: 16px; color: #5f6368; font-size: 0.9em;">
        <p>Digest generated by OpenClaw. To adjust frequency or content, reply to this email.</p>
      </footer>
    </div>
  `;

  const text = `
Daily AI & Tech Digest
${date} | Lake Worth, FL Weather: ${weather}

=== 🔥 Top AI News ===
${aiNews ? aiNews.map(item => `- ${item.title} (${item.link})\n  ${item.snippet}`).join('\n\n') : 'No AI news available.'}

=== 🎁 Free Models on OpenRouter ===
${freeModels.length > 0 ? freeModels.map(m => `- ${m.name} (ID: ${m.id}, context: ${m.context})`).join('\n') : 'No free models found.'}

=== 📰 Tech Headlines ===
${techNews ? techNews.map(item => `- ${item.title} (${item.link})`).join('\n') : 'No tech news available.'}

-- 
Sent by OpenClaw
  `;

  return { subject: `Daily AI & Tech Digest — ${date}`, html, text };
}

// Send email
async function sendEmail(subject, html, text) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user: CONFIG.gmailUser, pass: CONFIG.gmailPass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 30000
  });

  const info = await transporter.sendMail({
    from: CONFIG.gmailUser,
    to: CONFIG.toEmail,
    subject,
    html,
    text
  });
  return info;
}

// Main
(async () => {
  try {
    console.log('Fetching data...');
    const [aiNews, techNews, weather, freeModels] = await Promise.all([
      fetchRSS('https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', 5),
      fetchRSS('https://www.theverge.com/rss/tech/index.xml', 5),
      fetchWeather(CONFIG.location),
      fetchFreeModels()
    ]);

    console.log('Building digest...');
    const { subject, html, text } = buildContent(aiNews, techNews, weather, freeModels);

    console.log('Sending email...');
    const result = await sendEmail(subject, html, text);
    console.log('✅ Email sent:', result.messageId);
    process.exit(0);
  } catch (error) {
    console.error('❌ Digest failed:', error);
    process.exit(1);
  }
})();
