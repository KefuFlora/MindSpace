
(function () {
    const themeKey = "mindspaceTheme";

    function applyTheme(isDark) {
        document.body.classList.toggle("dark-mode", isDark);

        const toggle = document.getElementById("themeToggle");

        if (toggle) {
            toggle.checked = isDark;
        }
    }

    // Apply the saved theme whenever a page opens.
    applyTheme(localStorage.getItem(themeKey) === "dark");

    // Listen for changes on pages that have the toggle.
    document.addEventListener("change", function (event) {
        if (event.target && event.target.id === "themeToggle") {
            const isDark = event.target.checked;

            localStorage.setItem(themeKey, isDark ? "dark" : "light");
            applyTheme(isDark);
        }
    });
})();
