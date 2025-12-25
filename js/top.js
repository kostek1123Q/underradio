document.addEventListener("DOMContentLoaded", () => {
    loadTopTracks();
});

async function loadTopTracks() {
    const container = document.getElementById("top-tracks");
    container.innerHTML = "<p>Ładowanie top tracków...</p>";

    try {
        const tracks = await getTopTracks(); // endpoint /tracks/top lub podobny
        container.innerHTML = "";

        if (!tracks || tracks.length === 0) {
            container.innerHTML = "<p>Brak tracków w tym tygodniu.</p>";
            return;
        }

        tracks.forEach(track => {
            const trackEl = createTopTrackElement(track);
            container.appendChild(trackEl);
        });
    } catch (error) {
        console.error(error);
        container.innerHTML = "<p>Błąd ładowania top tracków.</p>";
    }
}

function createTopTrackElement(track) {
    const div = document.createElement("div");
    div.className = "track";

    div.innerHTML = `
        <div class="track-header">
            <div>
                <div class="track-title">${escapeHtml(track.title)}</div>
                <div class="track-author">@${escapeHtml(track.user.username)}</div>
            </div>
        </div>

        <div class="track-player">
            <button data-action="play">Play</button>
            <audio src="${track.audio_url}" preload="none"></audio>
        </div>

        <div class="track-actions">
            <span data-action="like">❤️ ${track.likes_count}</span>
        </div>
    `;

    const playBtn = div.querySelector('[data-action="play"]');
    playBtn.addEventListener("click", () => togglePlay(div));

    const likeBtn = div.querySelector('[data-action="like"]');
    likeBtn.addEventListener("click", () => toggleLike(track.id, likeBtn));

    return div;
}

// UTILS
function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// === API WRAPPER ===
async function getTopTracks() {
    return apiRequest("/tracks/top"); // backend musi zwracać top 10/20 tracków wg lajków z ostatniego tygodnia
}
