const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

const STAFF_LOGIN_URL = "http://127.0.0.1:8080/api/admin/auth/login";

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (email === "" || password === "") {
        loginMessage.textContent = "Please enter your email and password.";
        return;
    }

    loginMessage.textContent = "Logging in...";

    try {
        const response = await fetch(STAFF_LOGIN_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: email, password: password })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            loginMessage.textContent =
                data.error || "Invalid email or password.";
            return;
        }

        sessionStorage.setItem("moderator", JSON.stringify(data));

        loginMessage.textContent = "Login successful!";

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 600);
    } catch (error) {
        console.error("Login error:", error);

        loginMessage.textContent =
            "Unable to connect to the server. Please try again.";
    }
});