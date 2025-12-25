document.addEventListener("DOMContentLoaded", () => {
    loadTracks();
});

async function loadTracks() {
    const container = document.getElementById("tracks-list");
    container.innerHTML = "<p>Ładowanie tracków...</p>";

    try {
        const tracks = await getAllTracks();
        container.innerHTML = "";

        if (!tracks.length) {
            container.innerHTML = "<p>Brak tracków.</p>";
            return;
        }

        tracks.forEach(track => {
            const trackElement = createTrackElement(track);
            container.appendChild(trackElement);
        });
    } catch (error) {
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
            <span data-action="like">❤️ ${track.likes_count}</span>
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

    playBtn.addEventListener("click", () => {
        togglePlay(trackEl);
    });

    likeBtn.addEventListener("click", async () => {
        try {
            await likeTrack(track.id);
            const count = parseInt(likeBtn.textContent.replace(/\D/g, ""));
            likeBtn.textContent = `❤️ ${count + 1}`;
        } catch (e) {
            alert("Musisz być zalogowany, żeby lajkować.");
        }
    });

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

        comments.forEach(c => {
            const div = document.createElement("div");
            div.className = "comment";
            div.textContent = `@${c.user.username}: ${c.content}`;
            container.appendChild(div);
        });
    } catch {
        container.innerHTML = "<p>Błąd komentarzy.</p>";
    }
}

// === UTILS ===
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
