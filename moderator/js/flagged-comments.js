document.addEventListener("DOMContentLoaded", () => {
    const container = document.querySelector(".flagged-content-list");

    if (!container) {
        console.error("Flagged comments container not found.");
        return;
    }

    function showMessage(text) {
        container.replaceChildren();

        const message = document.createElement("p");
        message.textContent = text;
        container.appendChild(message);
    }

    function buildCard(comment) {
        const article = document.createElement("article");
        article.className = "flagged-card";

        const header = document.createElement("div");
        header.className = "flagged-card-header";

        const heading = document.createElement("div");
        const title = document.createElement("h3");
        title.textContent = `Comment #${comment.id}`;

        const status = document.createElement("span");
        status.className = "status pending";
        status.textContent = "Pending Review";

        heading.append(title, status);

        const date = document.createElement("span");
        date.className = "flagged-date";
        date.textContent = formatStaffDate(comment.created_at);

        header.append(heading, date);

        const body = document.createElement("div");
        body.className = "flagged-card-body";

        const preview = document.createElement("p");
        preview.className = "post-preview";
        preview.textContent = `"${comment.content || ""}"`;

        const reasonInfo = document.createElement("div");
        reasonInfo.className = "flag-information";

        const reasonLabel = document.createElement("strong");
        reasonLabel.textContent = "Report Reason: ";

        const reason = document.createElement("span");
        reason.textContent = comment.flag_reason || "Not specified";

        reasonInfo.append(reasonLabel, reason);

        const authorInfo = document.createElement("div");
        authorInfo.className = "flag-information";

        const authorLabel = document.createElement("strong");
        authorLabel.textContent = "Commented by: ";

        const author = document.createElement("span");
        author.textContent = comment.author || "Unknown";

        authorInfo.append(authorLabel, author);
        body.append(preview, reasonInfo, authorInfo);

        const actions = document.createElement("div");
        actions.className = "flagged-card-actions";

        const reviewLink = document.createElement("a");
        reviewLink.className = "review-button";
        reviewLink.textContent = "Review Content";
        reviewLink.href =
            `./review.html?id=${encodeURIComponent(comment.id)}&type=comment`;

        actions.appendChild(reviewLink);
        article.append(header, body, actions);

        return article;
    }

    async function loadFlaggedComments() {
        showMessage("Loading flagged comments...");

        try {
            const comments = await staffFetch("/flagged?type=comments");

            if (!Array.isArray(comments) || comments.length === 0) {
                showMessage("No flagged comments found.");
                return;
            }

            container.replaceChildren(...comments.map(buildCard));
        } catch (error) {
            console.error("Failed to load flagged comments:", error);
            showMessage(
                "Unable to load flagged comments. Please check that the backend is running and try again."
            );
        }
    }

    loadFlaggedComments();
});