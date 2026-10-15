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

        /* Check that passwords match */

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        /* Check password length */

        if (password.length < 8) {
            alert("Password must be at least 8 characters long.");
            return;
        }

        /* Temporary registration confirmation */

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

        /* Temporary login confirmation */

        alert("Login successful!");

        loginForm.reset();
    });
}