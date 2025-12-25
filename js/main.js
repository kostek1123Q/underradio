import { getAllTracks, getComments, likeTrack } from "./api.js";
import { togglePlay } from "./player.js";

// Po załadowaniu DOM
document.addEventListener("DOMContentLoaded", () => {
    loadTracks();
});

// === FUNKCJE ===

// Load all tracks
export async function loadTracks() {
    const container = document.getElementById("tracks-list");
    container.innerHTML = "<p>Ładowanie tracków...</p>";

    try {
        const tracks = await getAllTracks();
        container.innerHTML = "";

        if (!tracks || tracks.length === 0) {
            container.innerHTML = "<p>Brak tracków.</p>";
            return;
        }

        tracks.forEach(track => {
            const trackElement = createTrackElement(track);
            container.appendChild(trackElement);
        });
    } catch (error) {
        console.error("Błąd ładowania tracków:", error);
        container.innerHTML = "<p>Błąd ładowania tracków.</p>";
    }
}

// Create HTML for single track
function createTrackElement(track) {
    const div = document.createElement("div");
    div.className = "track";

    const username = track.user?.username || "Anonim";

    div.innerHTML = `
        <div class="track-header">
            <div>
                <div class="track-title">${escapeHtml(track.title)}</div>
                <div class="track-author">@${escapeHtml(username)}</div>
            </div>
        </div>

        ${track.description ? `<div class="track-description">${escapeHtml(track.description)}</div>` : ""}

        <div class="track-player">
            <button data-action="play">Play</button>
            <audio src="${track.audio_url}" preload="none"></audio>
        </div>

        <div class="track-actions">
            <span data-action="like" class="${track.liked ? 'liked' : ''}">❤️ ${track.likes_count || 0}</span>
            <span data-action="comment">💬 Komentarze</span>
        </div>

        <div class="comments" style="display:none"></div>
    `;

    bindTrackEvents(div, track);
    return div;
}

// Bind event listeners
function bindTrackEvents(trackEl, track) {
    const playBtn = trackEl.querySelector('[data-action="play"]');
    const likeBtn = trackEl.querySelector('[data-action="like"]');
    const commentBtn = trackEl.querySelector('[data-action="comment"]');
    const commentsContainer = trackEl.querySelector(".comments");

    // Play / Pause
    playBtn.addEventListener("click", () => {
        togglePlay(trackEl);
    });

    // Like / Unlike
    likeBtn.addEventListener("click", async () => {
        try {
            await likeTrack(track.id);
            let count = parseInt(likeBtn.textContent.replace(/\D/g, "")) || 0;
            count += 1;
            likeBtn.textContent = `❤️ ${count}`;
            likeBtn.classList.add("liked");
        } catch {
            alert("Musisz być zalogowany, żeby lajkować.");
        }
    });

    // Show / Hide comments
    commentBtn.addEventListener("click", async () => {
        if (commentsContainer.style.display === "none") {
            await loadComments(track.id, commentsContainer);
            commentsContainer.style.display = "block";
        } else {
            commentsContainer.style.display = "none";
        }
    });
}

// Load comments for a track
async function loadComments(trackId, container) {
    container.innerHTML = "<p>Ładowanie komentarzy...</p>";

    try {
        const comments = await getComments(trackId);
        container.innerHTML = "";

        if (!comments || comments.length === 0) {
            container.innerHTML = "<p>Brak komentarzy.</p>";
            return;
        }

        comments.forEach(c => {
            const div = document.createElement("div");
            div.className = "comment";
            div.textContent = `@${c.user.username}: ${c.content}`;
            container.appendChild(div);
        });
    } catch (error) {
        console.error("Błąd ładowania komentarzy:", error);
        container.innerHTML = "<p>Błąd komentarzy.</p>";
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// Ustawienie globalnie po definicji, żeby upload.js mógł wywołać odświeżenie
window.loadTracks = loadTracks;
