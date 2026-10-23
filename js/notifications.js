document.addEventListener("DOMContentLoaded", () => {
    const notificationsList = document.getElementById("notificationsList");
    const notificationCount = document.getElementById("notificationCount");
    const emptyState = document.getElementById("emptyState");
    const markAllReadButton = document.getElementById("markAllReadButton");
    const clearAllButton = document.getElementById("clearAllButton");
    const pageMessage = document.getElementById("pageMessage");

    const API_BASE = "http://127.0.0.1:8080/api/notifications";

    let notifications = [];

    // Send a request to the backend and return its JSON reply.
    async function requestJson(url, options = {}) {
        const response = await fetch(url, {
            credentials: "include",
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            }
        });

        if (response.status === 401) {
            window.location.href = "login.html";
            throw new Error("Please log in to continue.");
        }

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(
                data.message || "Something went wrong. Please try again."
            );
        }

        return data;
    }

    function showMessage(text) {
        pageMessage.textContent = text;
    }

    function getIcon(type) {
        const icons = {
            reply: "💬",
            like: "💜",
            moderation: "🛡️",
            system: "🔔"
        };

        return icons[type] || icons.system;
    }

    function formatTime(dateString) {
        const date = new Date(dateString);

        if (Number.isNaN(date.getTime())) {
            return "Recently";
        }

        const difference = Math.max(0, Date.now() - date.getTime());
        const minutes = Math.floor(difference / 60000);
        const hours = Math.floor(difference / 3600000);
        const days = Math.floor(difference / 86400000);

        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
        if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
        if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;

        return date.toLocaleDateString();
    }

    function renderNotifications() {
        notificationsList.replaceChildren();

        const unreadCount = notifications.filter(item => !item.read).length;
        notificationCount.textContent =
            `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`;

        emptyState.hidden = notifications.length !== 0;
        notificationsList.hidden = notifications.length === 0;
        markAllReadButton.disabled = unreadCount === 0;
        clearAllButton.disabled = notifications.length === 0;

        notifications.forEach((item) => {
            const card = document.createElement("article");
            card.className = `notification-card${item.read ? "" : " unread"}`;
            card.dataset.notificationId = String(item.id);

            const icon = document.createElement("div");
            icon.className = "notification-icon";
            icon.setAttribute("aria-hidden", "true");
            icon.textContent = getIcon(item.type);

            const content = document.createElement("div");
            content.className = "notification-content";

            const title = document.createElement("h2");
            title.textContent = item.title || "MindSpace notification";

            const message = document.createElement("p");
            message.textContent = item.message || "";

            const time = document.createElement("span");
            time.className = "notification-time";
            time.textContent = formatTime(item.createdAt);

            const actions = document.createElement("div");
            actions.className = "notification-actions";
            
            if (item.postId) {
                const viewLink = document.createElement("a");
                viewLink.className = "view-post";
                viewLink.href = `posts.html#post-${item.postId}`;
                viewLink.textContent = "View post";
                actions.appendChild(viewLink);
            }

            if (!item.read) {
                const readButton = document.createElement("button");
                readButton.type = "button";
                readButton.className = "mark-read";
                readButton.textContent = "Mark as read";
                actions.appendChild(readButton);
            }

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "delete-notification";
            deleteButton.textContent = "Delete";
            actions.appendChild(deleteButton);

            content.append(title, message, time, actions);

            if (!item.read) {
                const dot = document.createElement("span");
                dot.className = "unread-dot";
                dot.setAttribute("aria-label", "Unread");
                card.append(icon, content, dot);
            } else {
                card.append(icon, content);
            }

            notificationsList.appendChild(card);
        });
    }

    // Load notifications saved in MySQL for the logged-in user.
    async function loadNotifications() {
        try {
            const data = await requestJson(API_BASE);
            notifications = Array.isArray(data) ? data : [];
            showMessage("");
        } catch (error) {
            console.error("Could not load notifications:", error);
            showMessage(
                error.message ||
                "Notifications could not be loaded. Check that the backend is running."
            );
        }

        renderNotifications();
    }

    notificationsList.addEventListener("click", async (event) => {
        const card = event.target.closest(".notification-card");
        if (!card) return;

        const notificationId = card.dataset.notificationId;
        const notification = notifications.find(
            item => String(item.id) === notificationId
        );

        if (!notification) return;

        const readButton = event.target.closest(".mark-read");
        const deleteButton = event.target.closest(".delete-notification");
                const viewLink = event.target.closest(".view-post");

        // Opening a post also marks its notification as read.
        if (viewLink && !notification.read) {
            event.preventDefault();

            try {
                await requestJson(
                    `${API_BASE}/${encodeURIComponent(notificationId)}/read`,
                    { method: "PUT" }
                );
            } catch (error) {
                console.error("Could not mark notification as read:", error);
            }

            window.location.href = viewLink.href;
            return;
        }

        if (readButton) {
            readButton.disabled = true;

            try {
                await requestJson(
                    `${API_BASE}/${encodeURIComponent(notificationId)}/read`,
                    { method: "PUT" }
                );

                notification.read = true;
                showMessage("Notification marked as read.");
                renderNotifications();
            } catch (error) {
                console.error("Could not mark notification as read:", error);
                showMessage(error.message);
                readButton.disabled = false;
            }
        }

        if (deleteButton) {
            deleteButton.disabled = true;

            try {
                await requestJson(
                    `${API_BASE}/${encodeURIComponent(notificationId)}`,
                    { method: "DELETE" }
                );

                notifications = notifications.filter(
                    item => String(item.id) !== notificationId
                );
                showMessage("Notification deleted.");
                renderNotifications();
            } catch (error) {
                console.error("Could not delete notification:", error);
                showMessage(error.message);
                deleteButton.disabled = false;
            }
        }
    });

    markAllReadButton.addEventListener("click", async () => {
        markAllReadButton.disabled = true;

        try {
            await requestJson(`${API_BASE}/read-all`, { method: "PUT" });

            notifications.forEach(item => {
                item.read = true;
            });
            showMessage("All notifications marked as read.");
        } catch (error) {
            console.error("Could not mark all as read:", error);
            showMessage(error.message);
        }

        renderNotifications();
    });

    clearAllButton.addEventListener("click", async () => {
        if (notifications.length === 0) return;

        if (!window.confirm("Clear all notifications? This cannot be undone.")) {
            return;
        }

        clearAllButton.disabled = true;

        try {
            await requestJson(API_BASE, { method: "DELETE" });

            notifications = [];
            showMessage("All notifications cleared.");
        } catch (error) {
            console.error("Could not clear notifications:", error);
            showMessage(error.message);
        }

        renderNotifications();
    });

    renderNotifications();
    loadNotifications();
});