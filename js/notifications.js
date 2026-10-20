
document.addEventListener("DOMContentLoaded", () => {
    const notificationsList = document.getElementById("notificationsList");
    const notificationCount = document.getElementById("notificationCount");
    const emptyState = document.getElementById("emptyState");
    const markAllReadButton = document.getElementById("markAllReadButton");
    const clearAllButton = document.getElementById("clearAllButton");
    const pageMessage = document.getElementById("pageMessage");

    const STORAGE_KEY = "mindspaceNotifications";

    function loadNotifications() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);

            if (stored === null) {
                const examples = [
                    {
                        id: "demo-1",
                        type: "reply",
                        title: "Someone replied to your post",
                        message: "Your community is here to listen and support you.",
                        createdAt: new Date().toISOString(),
                        read: false
                    },
                    {
                        id: "demo-2",
                        type: "like",
                        title: "Your post received support",
                        message: "Someone appreciated a post you shared.",
                        createdAt: new Date(Date.now() - 3600000).toISOString(),
                        read: false
                    },
                    {
                        id: "demo-3",
                        type: "moderation",
                        title: "Community reminder",
                        message: "Remember to be respectful and supportive of everyone in MindSpace.",
                        createdAt: new Date(Date.now() - 86400000).toISOString(),
                        read: true
                    }
                ];

                localStorage.setItem(STORAGE_KEY, JSON.stringify(examples));
                return examples;
            }

            const parsed = JSON.parse(stored);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error("Could not load notifications:", error);
            pageMessage.textContent =
                "Notifications could not be loaded. Check your browser storage.";
            return [];
        }
    }

    let notifications = loadNotifications();

    function saveNotifications() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
            return true;
        } catch (error) {
            console.error("Could not save notifications:", error);
            pageMessage.textContent =
                "Your changes could not be saved in this browser.";
            return false;
        }
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
        if (minutes < 60) return `${minutes} minute(s) ago`;
        if (hours < 24) return `${hours} hour(s) ago`;
        if (days < 7) return `${days} day(s) ago`;

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

    notificationsList.addEventListener("click", (event) => {
        const card = event.target.closest(".notification-card");
        if (!card) return;

        const notificationId = card.dataset.notificationId;
        const notification = notifications.find(
            item => String(item.id) === notificationId
        );

        if (!notification) return;

        if (event.target.closest(".mark-read")) {
            notification.read = true;

            if (saveNotifications()) {
                pageMessage.textContent = "Notification marked as read.";
                renderNotifications();
            }
        }

        if (event.target.closest(".delete-notification")) {
            notifications = notifications.filter(
                item => String(item.id) !== notificationId
            );

            if (saveNotifications()) {
                pageMessage.textContent = "Notification deleted.";
                renderNotifications();
            }
        }
    });

    markAllReadButton.addEventListener("click", () => {
        notifications.forEach(item => {
            item.read = true;
        });

        if (saveNotifications()) {
            pageMessage.textContent = "All notifications marked as read.";
            renderNotifications();
        }
    });

    clearAllButton.addEventListener("click", () => {
        if (notifications.length === 0) return;

        if (!window.confirm("Clear all notifications? This cannot be undone.")) {
            return;
        }

        const previousNotifications = notifications;
        notifications = [];

        if (saveNotifications()) {
            pageMessage.textContent = "All notifications cleared.";
            renderNotifications();
        } else {
            notifications = previousNotifications;
            renderNotifications();
        }
    });

    renderNotifications();
});
