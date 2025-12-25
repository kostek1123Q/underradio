// Funkcja do sprawdzania czy użytkownik jest zalogowany
export function checkLoginDisplay() {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    const loginLink = document.getElementById("login-link");
    const registerLink = document.getElementById("register-link");
    const navLinks = document.getElementById("nav-links");
    const uploadSection = document.getElementById("upload-section");

    if (token && username) {
        // Ukryj logowanie i rejestrację
        if (loginLink) loginLink.style.display = "none";
        if (registerLink) registerLink.style.display = "none";

        // Dodaj link do profilu
        if (navLinks && !document.getElementById("profile-link")) {
            const profileLink = document.createElement("a");
            profileLink.href = "profile.html";
            profileLink.id = "profile-link";
            profileLink.textContent = "Profil @" + username;
            navLinks.appendChild(profileLink);
        }

        // Pokaż sekcję dodawania utworu
        if (uploadSection) uploadSection.style.display = "block";
    } else {
        // Użytkownik niezalogowany – ukryj upload
        if (uploadSection) uploadSection.style.display = "none";
    }
}

// Wywołanie przy ładowaniu strony
document.addEventListener("DOMContentLoaded", () => {
    checkLoginDisplay();
});
