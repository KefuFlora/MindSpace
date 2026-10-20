
/* =========================================
   REGISTER FORM
   ========================================= */

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        if (password.length < 8) {
            alert("Password must be at least 8 characters long.");
            return;
        }

        alert("Account created successfully!");

        registerForm.reset();
    });
}

/* =========================================
   LOGIN FORM
   ========================================= */

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        if (email === "" || password === "") {
            alert("Please enter your email and password.");
            return;
        }

        // Create a temporary login session for the prototype.
        sessionStorage.setItem("mindspaceLoggedIn", "true");

        alert("Login successful!");

        loginForm.reset();
    });
}

/* =========================================
   LOGOUT
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {
    const logoutButton = document.getElementById("logoutButton");

    if (!logoutButton) return;

    logoutButton.addEventListener("click", function () {
        const confirmed = window.confirm(
            "Are you sure you want to log out?"
        );

        if (!confirmed) return;

        sessionStorage.removeItem("mindspaceLoggedIn");

        window.location.href = "login.html";
    });
});
