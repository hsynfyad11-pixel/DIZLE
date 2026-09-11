

const BOT_TOKEN = "8766355337:AAGFx-vA40Uwlb9O_4CEuYQiFswxZys5rdo";
const LOCAL_WEBHOOK_URL = "http://localhost:3000/api/telegram/webhook";

let offset = 0;

async function poll() {
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${offset}&timeout=10`);
    const data = await res.json();
    
    if (data.ok && data.result.length > 0) {
      for (const update of data.result) {
        offset = update.update_id + 1;
        
        console.log(`[POLLER] Received incoming action from Telegram. Forwarding to Next.js Backend...`);
        
        // Forward exactly like a real Webhook to the NextJS API
        try {
          const fwdRes = await fetch(LOCAL_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(update)
          });
          console.log(`[POLLER] Backend response status: ${fwdRes.status}`);
        } catch (backendErr) {
          console.error(`[POLLER] Next.js is not running or unreachable: ${backendErr.message}`);
        }
      }
    }
  } catch (err) {
    if (err.message.includes('ECONNRESET')) {
      // ignore timeout
    } else {
      console.error("[POLLER] Error connecting to Telegram API:", err.message);
    }
  } finally {
    setTimeout(poll, 1500); // Loop softly
  }
}

console.log("⚡ Starting Local Telegram Poller Daemon...");
console.log(`📡 Listening for inline button clicks and simulating webhook to: ${LOCAL_WEBHOOK_URL}`);
poll();
