document.addEventListener("DOMContentLoaded", () => {
    updateHeader();
    loadTracks();
    setupUploadForm();
});

function updateHeader() {
    const token = localStorage.getItem("token");
    const nav = document.getElementById("nav-links");
    const loginLink = document.getElementById("login-link");
    const registerLink = document.getElementById("register-link");

    if (token) {
        loginLink.style.display = "none";
        registerLink.style.display = "none";

        if (!document.getElementById("profile-link")) {
            const profileLink = document.createElement("a");
            profileLink.href = "profile.html";
            profileLink.id = "profile-link";
            profileLink.textContent = "Profil";
            nav.appendChild(profileLink);
        }

        if (!document.getElementById("upload-link")) {
            const uploadLink = document.createElement("a");
            uploadLink.href = "#upload-section";
            uploadLink.id = "upload-link";
            uploadLink.textContent = "Dodaj utwór";
            nav.appendChild(uploadLink);
        }

        document.getElementById("upload-section").style.display = "block";
    } else {
        loginLink.style.display = "inline";
        registerLink.style.display = "inline";
        document.getElementById("upload-section").style.display = "none";
    }
}

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
            const trackEl = createTrackElement(track);
            container.appendChild(trackEl);
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

        ${track.description ? `<div class="track-description">${escapeHtml(track.description)}</div>` : ""}

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
    const likeBtn = trackEl.querySelector('[data-action="like"]');
    const commentBtn = trackEl.querySelector('[data-action="comment"]');
    const commentsContainer = trackEl.querySelector(".comments");
    const titleEl = trackEl.querySelector(".track-title");

    // Kliknięcie na tytuł otwiera globalny player
    titleEl.addEventListener("click", () => {
        playTrackGlobal(track);
    });

    likeBtn.addEventListener("click", () => toggleLike(track.id, likeBtn));

    commentBtn.addEventListener("click", async () => {
        if (commentsContainer.style.display === "none") {
            await loadComments(track.id, commentsContainer);
            commentsContainer.style.display = "block";
        } else {
            commentsContainer.style.display = "none";
        }
    });
}

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

function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
