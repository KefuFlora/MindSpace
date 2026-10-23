// Shared helpers for every moderator page (login excluded).
const STAFF_API = "http://127.0.0.1:8080/api/admin";

function getStaffSession() {
    try {
        return JSON.parse(sessionStorage.getItem("moderator"));
    } catch (error) {
        return null;
    }
}

function staffLogout() {
    sessionStorage.removeItem("moderator");
    window.location.href = "login.html";
}

// Call the backend with the saved login token and return its JSON reply.
async function staffFetch(path, options = {}) {
    const session = getStaffSession();

    const response = await fetch(`${STAFF_API}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + ((session && session.token) || ""),
            ...(options.headers || {})
        }
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 401) {
        staffLogout();
        throw new Error(data.error || "Please log in again.");
    }

    if (!response.ok) {
        throw new Error(
            data.error || "Something went wrong. Please try again."
        );
    }

    return data;
}

function formatStaffDate(value) {
    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? "Date unavailable"
        : date.toLocaleString("en-ZA", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
}

// Protect every page except the login page, and wire up the Logout button.
if (!window.location.pathname.endsWith("login.html")) {
    if (!getStaffSession()) {
        window.location.href = "login.html";
    }

    document.addEventListener("DOMContentLoaded", () => {
        const logoutButton = document.getElementById("logoutButton");

        if (logoutButton) {
            logoutButton.addEventListener("click", staffLogout);
        }
    });
}