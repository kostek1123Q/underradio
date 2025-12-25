// Importujemy funkcje z api.js
import { registerUser, loginUser } from "./api.js";

// --- UTILS ---
function setToken(token) {
    localStorage.setItem("token", token);
}

// === LOGOWANIE ===
const loginForm = document.getElementById("login-form");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        try {
            const data = await loginUser(username, password);
            if (data.error) throw new Error(data.error);

            setToken(data.token);
            alert("Zalogowano pomyślnie!");
            window.location.href = "index.html";
        } catch (error) {
            alert("Błąd logowania: " + error.message);
        }
    });
}

// === REJESTRACJA ===
const registerForm = document.getElementById("register-form");
if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        try {
            const data = await registerUser(username, password);
            if (data.error) throw new Error(data.error);

            setToken(data.token);
            alert("Rejestracja zakończona sukcesem!");
            window.location.href = "index.html";
        } catch (error) {
            alert("Błąd rejestracji: " + error.message);
        }
    });
}
