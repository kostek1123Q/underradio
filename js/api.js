const API_BASE = "https://underradio-backend.onrender.com/api";

export async function registerUser(username, password) {
    const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Błąd rejestracji");
    return data;
}

export async function loginUser(username, password) {
    const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Błąd logowania");
    return data;
}

export async function uploadTrack({ title, description, social, audio, start, end }) {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Nie jesteś zalogowany");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("social", social);
    formData.append("audio", audio);
    formData.append("start", start);
    formData.append("end", end);

    const res = await fetch(`${API_BASE}/tracks`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Błąd uploadu");
    return data;
}

export async function getAllTracks() {
    const res = await fetch(`${API_BASE}/tracks`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Błąd pobierania tracków");
    return data;
}
