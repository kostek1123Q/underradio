import { uploadTrack } from "./api.js";

function setupUploadForm() {
    const form = document.getElementById("upload-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const title = document.getElementById("title").value.trim();
        const description = document.getElementById("description").value.trim();
        const social = document.getElementById("social").value.trim();
        const audio = document.getElementById("audio").files[0];
        const start = parseInt(document.getElementById("start").value) || 0;
        const end = parseInt(document.getElementById("end").value) || 30;

        if (!title || !audio) {
            alert("Podaj tytuł i plik audio.");
            return;
        }

        try {
            await uploadTrack({ title, description, social, audio, start, end });
            alert("Utwór dodany pomyślnie!");
            form.reset();

            if (window.loadTracks) window.loadTracks();
        } catch (err) {
            console.error(err);
            alert("Błąd wysyłania utworu.");
        }
    });
}

document.addEventListener("DOMContentLoaded", setupUploadForm);
