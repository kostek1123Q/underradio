function isLoggedIn() {
    return !!localStorage.getItem("token");
}

async function toggleLike(trackId, likeElement) {
    if (!isLoggedIn()) {
        alert("Musisz być zalogowany, żeby lajkować.");
        return;
    }

    const liked = likeElement.classList.contains("liked");

    try {
        let response;

        if (liked) {
            response = await unlikeTrack(trackId);
            likeElement.classList.remove("liked");
        } else {
            response = await likeTrack(trackId);
            likeElement.classList.add("liked");
        }

        if (response && typeof response.likes_count === "number") {
            likeElement.textContent = `❤️ ${response.likes_count}`;
        }
    } catch (error) {
        console.error("Like error:", error.message);
    }
}
