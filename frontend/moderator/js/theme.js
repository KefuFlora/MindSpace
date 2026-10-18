// MindSpace Moderator Theme Manager

const savedTheme = localStorage.getItem("mindspace-theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
}

document.addEventListener("DOMContentLoaded", function () {
    const themeToggle = document.getElementById("themeToggle");

    if (!themeToggle) {
        return;
    }

    function updateThemeButton() {
        if (document.body.classList.contains("dark-mode")) {
            themeToggle.textContent = "☀ Light Mode";
            themeToggle.setAttribute(
                "aria-label",
                "Switch to light mode"
            );
        } else {
            themeToggle.textContent = "🌙 Dark Mode";
            themeToggle.setAttribute(
                "aria-label",
                "Switch to dark mode"
            );
        }
    }

    updateThemeButton();

    themeToggle.addEventListener("click", function () {
        const isDarkMode = document.body.classList.toggle("dark-mode");

        localStorage.setItem(
            "mindspace-theme",
            isDarkMode ? "dark" : "light"
        );

        updateThemeButton();
    });
});