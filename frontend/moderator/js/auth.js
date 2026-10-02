const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (email === "" || password === "") {
        loginMessage.textContent = "Please enter your email and password.";
        return;
    }

    loginMessage.textContent = "Login functionality will be connected to the Java backend.";
});