// Shows the real moderation decisions on the history page.
document.addEventListener("DOMContentLoaded", async () => {
    const section = document.querySelector(".history-section");

    if (!section) {
        return;
    }

    function addLine(parent, label, value) {
        const line = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = `${label}: `;
        line.append(strong, document.createTextNode(value));
        parent.appendChild(line);
    }

    function buildCard(record) {
        const typeName = record.content_type === "post" ? "Post" : "Comment";
        const actionName =
            record.action === "approved" ? "Approved" : "Removed";

        const card = document.createElement("div");
        card.className = "history-card";

        const header = document.createElement("div");
        header.className = "history-card-header";

        const heading = document.createElement("div");
        const title = document.createElement("h3");
        title.textContent = `${typeName} #${record.content_id}`;

        const status = document.createElement("span");
        status.className = `status ${record.action}`;
        status.textContent = actionName;

        heading.append(title, status);

        const date = document.createElement("span");
        date.className = "history-date";
        date.textContent = formatStaffDate(record.created_at);

        header.append(heading, date);

        const info = document.createElement("div");
        info.className = "history-information";
        addLine(info, "Content Type", typeName);
        addLine(info, "Action", actionName);
        addLine(info, "Moderator", record.moderator || "Unknown");
        addLine(info, "Reason", record.note || "No note added.");

        card.append(header, info);
        return card;
    }

    try {
        const records = await staffFetch("/history");

        if (!Array.isArray(records) || records.length === 0) {
            const empty = document.createElement("p");
            empty.textContent = "No moderation decisions yet.";
            section.replaceChildren(empty);
            return;
        }

        section.replaceChildren(...records.map(buildCard));
    } catch (error) {
        console.error("Could not load moderation history:", error);

        const message = document.createElement("p");
        message.textContent =
            "Unable to load the moderation history. Please try again later.";
        section.replaceChildren(message);
    }
});