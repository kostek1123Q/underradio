// === KONFIGURACJA ===

// TU PODMIENISZ NA URL Z RENDERA
const API_URL = "https://underradio-backend.onrender.com/api";

// === TOKEN ===
function getToken() {
    return localStorage.getItem("token");
}

function setToken(token) {
    localStorage.setItem("token", token);
}

function removeToken() {
    localStorage.removeItem("token");
}

// === GŁÓWNA FUNKCJA API ===
async function apiRequest(endpoint, options = {}) {
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    const token = getToken();
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers
    };

    try {
        const response = await fetch(API_URL + endpoint, config);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Błąd API");
        }

        // 204 No Content
        if (response.status === 204) {
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error("API ERROR:", error.message);
        throw error;
    }
}

// === ENDPOINTY (czytelne wrappery) ===

// AUTH
async function loginUser(email, password) {
    return apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
    });
}

async function registerUser(username, email, password) {
    return apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, email, password })
    });
}

async function getMe() {
    return apiRequest("/auth/me");
}

// TRACKI
async function getAllTracks() {
    return apiRequest("/tracks");
}

async function deleteTrack(trackId) {
    return apiRequest(`/tracks/${trackId}`, {
        method: "DELETE"
    });
}

// LAJKI
async function likeTrack(trackId) {
    return apiRequest(`/tracks/${trackId}/like`, {
        method: "POST"
    });
}

async function unlikeTrack(trackId) {
    return apiRequest(`/tracks/${trackId}/like`, {
        method: "DELETE"
    });
}

// KOMENTARZE
async function getComments(trackId) {
    return apiRequest(`/tracks/${trackId}/comments`);
}

async function addComment(trackId, content) {
    return apiRequest(`/tracks/${trackId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content })
    });
}
