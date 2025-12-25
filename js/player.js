let currentAudio = null;
let currentButton = null;

function togglePlay(trackElement) {
    const audio = trackElement.querySelector("audio");
    const button = trackElement.querySelector('[data-action="play"]');

    // Jeżeli klikamy ten sam track
    if (currentAudio === audio) {
        if (audio.paused) {
            audio.play();
            button.textContent = "Pause";
        } else {
            audio.pause();
            button.textContent = "Play";
        }
        return;
    }

    // Jeżeli gra inny track — zatrzymujemy go
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        if (currentButton) {
            currentButton.textContent = "Play";
        }
    }

    // Start nowego
    currentAudio = audio;
    currentButton = button;

    audio.play();
    button.textContent = "Pause";

    // Po zakończeniu
    audio.onended = () => {
        button.textContent = "Play";
        currentAudio = null;
        currentButton = null;
    };
}
