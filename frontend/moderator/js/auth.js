const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (email === "" || password === "") {
        loginMessage.textContent = "Please enter your email and password.";
        return;
    }

    loginMessage.textContent = "Logging in...";

    try {

        const response = await fetch("http://localhost:8080/api/moderators/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: email,
                password: password
            })
        });

        if (response.ok) {

            const data = await response.json();

            loginMessage.textContent = "Login successful!";

            sessionStorage.setItem("moderator", JSON.stringify(data));

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1000);

        } else {

            const errorMessage = await response.text();

            loginMessage.textContent =
                errorMessage || "Invalid email or password.";

        }

    } catch (error) {

        console.error("Login error:", error);

        loginMessage.textContent =
            "Unable to connect to the server. Please try again.";

    }

});