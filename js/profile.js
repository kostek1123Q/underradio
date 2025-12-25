document.addEventListener("DOMContentLoaded", () => {
    loadUserProfile();
});

async function loadUserProfile() {
    const userInfoContainer = document.getElementById("user-info");
    const userTracksContainer = document.getElementById("user-tracks");

    if (!localStorage.getItem("token")) {
        userInfoContainer.innerHTML = "<p>Musisz być zalogowany, żeby zobaczyć profil.</p>";
        return;
    }

    try {
        const user = await getMe();
        userInfoContainer.innerHTML = `
            <p><strong>Login:</strong> ${escapeHtml(user.username)}</p>
            <p><strong>Email:</strong> ${escapeHtml(user.email)}</p>
        `;

        const tracks = user.tracks || [];
        if (!tracks.length) {
            userTracksContainer.innerHTML = "<p>Nie dodałeś jeszcze żadnego utworu.</p>";
        } else {
            userTracksContainer.innerHTML = "";
            tracks.forEach(track => {
                const trackEl = createUserTrackElement(track);
                userTracksContainer.appendChild(trackEl);
            });
        }
    } catch (error) {
        console.error(error);
        userInfoContainer.innerHTML = "<p>Błąd ładowania profilu.</p>";
    }
}

function createUserTrackElement(track) {
    const div = document.createElement("div");
    div.className = "track";

    div.innerHTML = `
        <div class="track-header">
            <div>
                <div class="track-title">${escapeHtml(track.title)}</div>
            </div>
        </div>

        <div class="track-player">
            <button data-action="play">Play</button>
            <audio src="${track.audio_url}" preload="none"></audio>
        </div>

        <div class="track-actions">
            <span data-action="like">❤️ ${track.likes_count}</span>
            <span data-action="delete" style="color:#ff3b3b; cursor:pointer;">🗑 Usuń</span>
        </div>
    `;

    const playBtn = div.querySelector('[data-action="play"]');
    playBtn.addEventListener("click", () => togglePlay(div));

    const likeBtn = div.querySelector('[data-action="like"]');
    likeBtn.addEventListener("click", () => toggleLike(track.id, likeBtn));

    const deleteBtn = div.querySelector('[data-action="delete"]');
    deleteBtn.addEventListener("click", async () => {
        if (confirm("Na pewno chcesz usunąć ten utwór?")) {
            try {
                await deleteTrack(track.id);
                div.remove();
            } catch (error) {
                alert("Błąd podczas usuwania utworu.");
            }
        }
    });

    return div;
}

// UTILS
function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
