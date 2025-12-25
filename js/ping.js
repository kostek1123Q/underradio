const PING_INTERVAL = 30000; // 30 sekund

async function pingBackend() {
    try {
        await fetch("https://underradio-backend.onrender.com/api/health");
    } catch (error) {
        // celowo ignorujemy błędy
    }
}

// pierwszy ping od razu
pingBackend();

// kolejne co 30s
setInterval(pingBackend, PING_INTERVAL);
