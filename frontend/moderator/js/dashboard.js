const moderator = sessionStorage.getItem("moderator");


// Protect the dashboard
if (!moderator) {

    window.location.href = "login.html";

}


// Logout
const logoutButton = document.getElementById("logoutButton");

logoutButton.addEventListener("click", function () {

    sessionStorage.removeItem("moderator");

    window.location.href = "login.html";

});