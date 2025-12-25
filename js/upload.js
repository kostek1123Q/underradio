const uploadForm = document.getElementById("upload-form");

uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const social = document.getElementById("social").value.trim();
    const audioFile = document.getElementById("audio").files[0];
    const start = parseInt(document.getElementById("start").value, 10);
    const end = parseInt(document.getElementById("end").value, 10);

    if (!audioFile) {
        alert("Wybierz plik audio!");
        return;
    }

    if (end <= start || end - start > 30 || end - start < 15) {
        alert("Fragment musi mieć od 15 do 30 sekund.");
        return;
    }

    if (!localStorage.getItem("token")) {
        alert("Musisz być zalogowany, żeby dodać utwór.");
        return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("social", social);
    formData.append("audio", audioFile);
    formData.append("start", start);
    formData.append("end", end);

    try {
        const response = await fetch("https://underradio-backend.onrender.com/api/tracks", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Błąd dodawania utworu.");
        }

        alert("Utwór dodany pomyślnie!");
        window.location.href = "index.html";
    } catch (error) {
        console.error("Upload error:", error);
        alert("Błąd dodawania utworu: " + error.message);
    }
});
