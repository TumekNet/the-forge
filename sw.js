// The Forge — Service Worker
// Handles background sync and daily reminder notifications

const CACHE_NAME = 'forge-v1';
const NOTIFY_HOUR = 21; // 9:00 PM
const NOTIFY_MINUTE = 0;

// ── INSTALL & ACTIVATE ──────────────────────
self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
  // Schedule the first check
  scheduleCheck();
});

// ── MESSAGE FROM APP ─────────────────────────
// App sends messages to control the service worker
self.addEventListener('message', e => {
  if (e.data.type === 'LOGGED_TODAY') {
    // User logged today — cancel any pending notification
    self.registration.getNotifications().then(notifs => {
      notifs.forEach(n => n.close());
    });
  }
  if (e.data.type === 'SCHEDULE_CHECK') {
    scheduleCheck();
  }
  if (e.data.type === 'TEST_NOTIFICATION') {
    showForgeNotification();
  }
});

// ── NOTIFICATION CLICK ───────────────────────
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url.includes('tumeks-forge') && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open it
      if (clients.openWindow) {
        return clients.openWindow('https://tumeks-forge.netlify.app/');
      }
    })
  );
});

// ── SCHEDULING ───────────────────────────────
function scheduleCheck() {
  const now = new Date();
  const target = new Date();

  // Set to 9:00 PM today (Melbourne AEDT = UTC+11, AEST = UTC+10)
  // We use local time via the check logic — service worker runs in device timezone
  target.setHours(NOTIFY_HOUR, NOTIFY_MINUTE, 0, 0);

  // If 9pm has already passed today, schedule for tomorrow
  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }

  const msUntilCheck = target.getTime() - now.getTime();

  setTimeout(() => {
    checkAndNotify();
  }, msUntilCheck);
}

async function checkAndNotify() {
  // Ask all open clients if today has been logged
  const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true });

  if (clientList.length > 0) {
    // App is open — ask it directly
    const responses = await Promise.all(
      clientList.map(client => {
        return new Promise(resolve => {
          const channel = new MessageChannel();
          channel.port1.onmessage = e => resolve(e.data);
          client.postMessage({ type: 'CHECK_LOGGED' }, [channel.port2]);
          // Timeout after 2 seconds
          setTimeout(() => resolve({ logged: false }), 2000);
        });
      })
    );
    const anyLogged = responses.some(r => r && r.logged);
    if (!anyLogged) showForgeNotification();
  } else {
    // App is not open — check localStorage via IndexedDB isn't possible from SW
    // So always notify when app is closed (safe default)
    showForgeNotification();
  }

  // Schedule tomorrow's check
  scheduleCheck();
}

function showForgeNotification() {
  const messages = [
    { title: 'The Forge Awaits', body: "You haven't entered today. The Forge is patient. It is also watching." },
    { title: 'Enter the Forge', body: "Today's deeds are unrecorded. The chronicle has a gap. Fill it." },
    { title: 'The Forge Calls', body: "One log. That's all. The Forge doesn't ask for much. Just consistency." },
    { title: 'Daily Log Incomplete', body: "The hammer doesn't swing itself. Enter the Forge." },
    { title: "You Haven't Logged Today", body: "The Forge remembers everything. Including the days you didn't show up." },
    { title: 'Still Here. Still Waiting.', body: "The Forge has been open all day. You have not. This is noted." },
    { title: 'The Chronicle Is Incomplete', body: "Future you will look back at this week. Make sure there's something worth reading." },
    { title: 'No Entry Detected', body: "The system has checked. You have not logged. The system is disappointed. The system will survive. Will you?" },
    { title: 'One Minute. That Is All.', body: "You have survived today. Sixty seconds is all the Forge asks. Do not make it ask twice." },
    { title: 'The Streak Is Fragile', body: "You built something. It is still intact. For now. Enter the Forge before midnight." },
  ];

  const pick = messages[Math.floor(Math.random() * messages.length)];

  self.registration.showNotification(pick.title, {
    body: pick.body,
    icon: '/forge-logo-v2.png',
    badge: '/forge-logo-v2.png',
    tag: 'forge-daily-reminder',
    renotify: false,
    requireInteraction: false,
    vibrate: [200, 100, 200],
    data: { url: 'https://tumeks-forge.netlify.app/' },
  });
}
