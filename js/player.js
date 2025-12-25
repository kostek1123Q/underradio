const globalPlayer = document.getElementById("global-player");
const playerAudio = document.getElementById("player-audio");
const playerTitle = document.getElementById("player-title");
const playerToggle = document.getElementById("player-toggle");

let currentTrackId = null;

function playTrackGlobal(track) {
    if (currentTrackId === track.id) {
        // Przełącz play/pause tego samego utworu
        if (playerAudio.paused) {
            playerAudio.play();
            playerToggle.textContent = "Pause";
        } else {
            playerAudio.pause();
            playerToggle.textContent = "Play";
        }
        return;
    }

    // Nowy utwór
    playerAudio.src = track.audio_url;
    playerTitle.textContent = `${track.title} - @${track.user.username}`;
    playerAudio.currentTime = track.start || 0;
    playerAudio.play();
    playerToggle.textContent = "Pause";
    globalPlayer.style.display = "flex";
    currentTrackId = track.id;
}

playerToggle.addEventListener("click", () => {
    if (!playerAudio.src) return;
    if (playerAudio.paused) {
        playerAudio.play();
        playerToggle.textContent = "Pause";
    } else {
        playerAudio.pause();
        playerToggle.textContent = "Play";
    }
});

playerAudio.addEventListener("ended", () => {
    playerToggle.textContent = "Play";
});
