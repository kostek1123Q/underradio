const API_BASE = "https://underradio-backend.onrender.com/api";

// --- UTILS ---
function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// --- REJESTRACJA ---
export async function registerUser(username, password) {
    const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });
    return res.json();
}

// --- LOGOWANIE ---
export async function loginUser(username, password) {
    const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
    }
    return data;
}

// --- POBIERANIE WSZYSTKICH TRACKÓW ---
export async function getAllTracks() {
    const res = await fetch(`${API_BASE}/tracks`);
    return res.json();
}

// --- DODAWANIE TRACKA ---
export async function uploadTrack({ title, description, social, audio, start, end }) {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description || "");
    formData.append("start", start || 0);
    formData.append("end", end || 30);
    formData.append("audio", audio);

    const res = await fetch(`${API_BASE}/tracks`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData
    });
    return res.json();
}

// --- LAJKOWANIE ---
export async function likeTrack(trackId) {
    const res = await fetch(`${API_BASE}/tracks/${trackId}/like`, {
        method: "POST",
        headers: getAuthHeaders()
    });
    return res.json();
}

// --- KOMENTARZE ---
export async function getComments(trackId) {
    const res = await fetch(`${API_BASE}/tracks/${trackId}/comments`);
    return res.json();
}

export async function addComment(trackId, content) {
    const res = await fetch(`${API_BASE}/tracks/${trackId}/comments`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            ...getAuthHeaders()
        },
        body: JSON.stringify({ content })
    });
    return res.json();
}

// --- TOP TYGODNIA ---
export async function getTopTracks() {
    const res = await fetch(`${API_BASE}/tracks/top`);
    return res.json();
}
