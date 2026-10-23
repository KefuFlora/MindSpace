
const API_BASE = "http://127.0.0.1:8080/api/auth";

/* =========================================
   HELPER: DISPLAY API RESPONSES
   ========================================= */

async function readResponse(response) {
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong. Please try again.");
    }

    return data;
}

/* =========================================
   REGISTER
   ========================================= */

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        if (password.length < 8 || password.length > 72) {
            alert("Password must be between 8 and 72 characters.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ username, email, password })
            });

            const data = await readResponse(response);

            alert(data.message || "Account created successfully!");
            registerForm.reset();
            window.location.href = "login.html";

        } catch (error) {
            alert(error.message || "Could not connect to MindSpace. Check that the backend is running.");
        }
    });
}

/* =========================================
   LOGIN
   ========================================= */

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        if (!email || !password) {
            alert("Please enter your email and password.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ email, password })
            });

            const data = await readResponse(response);

            alert(`Welcome to MindSpace, ${data.username}!`);
            loginForm.reset();
            window.location.href = "posts.html";

        } catch (error) {
            alert(error.message || "Could not connect to MindSpace. Check that the backend is running.");
        }
    });
}

/* =========================================
   LOGOUT
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {
    const logoutButton = document.getElementById("logoutButton");

    if (!logoutButton) return;

    logoutButton.addEventListener("click", async function () {
        const confirmed = window.confirm("Are you sure you want to log out?");

        if (!confirmed) return;

        try {
            const response = await fetch(`${API_BASE}/logout`, {
                method: "POST",
                credentials: "include"
            });

            await readResponse(response);
            // Pages inside /pages/ use login.html; the root page uses pages/login.html.
            window.location.href = window.location.pathname.includes("/pages/")
                ? "login.html"
                : "pages/login.html";

        } catch (error) {
            alert(error.message || "Could not log out. Please try again.");
        }
    });
});
