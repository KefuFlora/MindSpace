// Shows the real moderator notifications.
document.addEventListener("DOMContentLoaded", async () => {
    const list = document.querySelector(".notifications-list");

    if (!list) {
        return;
    }

    function buildCard(item) {
        const card = document.createElement("div");
        card.className = `notification-card${item.is_read ? "" : " unread"}`;

        const header = document.createElement("div");
        header.className = "notification-header";

        const title = document.createElement("h3");
        title.textContent = item.title || "MindSpace notification";

        header.appendChild(title);

        if (!item.is_read) {
            const badge = document.createElement("span");
            badge.className = "notification-status";
            badge.textContent = "New";
            header.appendChild(badge);
        }

        const message = document.createElement("p");
        message.textContent = item.message || "";

        const details = document.createElement("div");
        details.className = "notification-details";

        const date = document.createElement("span");
        date.textContent = formatStaffDate(item.created_at);
        details.appendChild(date);

        card.append(header, message, details);
        return card;
    }

    try {
        const items = await staffFetch("/notifications");

        if (!Array.isArray(items) || items.length === 0) {
            const empty = document.createElement("p");
            empty.textContent = "No notifications yet.";
            list.replaceChildren(empty);
            return;
        }

        list.replaceChildren(...items.map(buildCard));

        // Opening the page counts as reading them.
        if (items.some((item) => !item.is_read)) {
            await staffFetch("/notifications/read", { method: "POST" });
        }
    } catch (error) {
        console.error("Could not load notifications:", error);

        const message = document.createElement("p");
        message.textContent =
            "Unable to load notifications. Please try again later.";
        list.replaceChildren(message);
    }
});