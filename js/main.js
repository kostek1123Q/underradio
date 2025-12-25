document.addEventListener("DOMContentLoaded", () => {
    loadTracks();
});

async function loadTracks() {
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

function createTrackElement(track) {
    const div = document.createElement("div");
    div.className = "track";

    div.innerHTML = `
        <div class="track-header">
            <div>
                <div class="track-title">${escapeHtml(track.title)}</div>
                <div class="track-author">@${escapeHtml(track.user.username)}</div>
            </div>
        </div>

        ${track.description ? `
            <div class="track-description">
                ${escapeHtml(track.description)}
            </div>
        ` : ""}

        <div class="track-player">
            <button data-action="play">Play</button>
            <audio src="${track.audio_url}" preload="none"></audio>
        </div>

        <div class="track-actions">
            <span data-action="like" class="${track.liked ? 'liked' : ''}">❤️ ${track.likes_count}</span>
            <span data-action="comment">💬 Komentarze</span>
        </div>

        <div class="comments" style="display:none"></div>
    `;

    bindTrackEvents(div, track);
    return div;
}

function bindTrackEvents(trackEl, track) {
    const playBtn = trackEl.querySelector('[data-action="play"]');
    const likeBtn = trackEl.querySelector('[data-action="like"]');
    const commentBtn = trackEl.querySelector('[data-action="comment"]');
    const commentsContainer = trackEl.querySelector(".comments");

    // PLAY / PAUSE
    playBtn.addEventListener("click", () => {
        togglePlay(trackEl);
    });

    // LIKE / UNLIKE
    likeBtn.addEventListener("click", () => {
        toggleLike(track.id, likeBtn);
    });

    // KOMENTARZE
    commentBtn.addEventListener("click", async () => {
        if (commentsContainer.style.display === "none") {
            await loadComments(track.id, commentsContainer);
            commentsContainer.style.display = "block";
        } else {
            commentsContainer.style.display = "none";
        }
    });
}

// === KOMENTARZE ===
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

// === UTILS ===
function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
