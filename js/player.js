let currentAudio = null;
let currentButton = null;

export function togglePlay(trackElement) {
    const audio = trackElement.querySelector("audio");
    const button = trackElement.querySelector('[data-action="play"]');

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

    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        if (currentButton) currentButton.textContent = "Play";
    }

    currentAudio = audio;
    currentButton = button;

    audio.play();
    button.textContent = "Pause";

    audio.onended = () => {
        button.textContent = "Play";
        currentAudio = null;
        currentButton = null;
    };
}
