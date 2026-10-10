document.addEventListener("DOMContentLoaded", () => {
    const commentsContainer = document.querySelector(
        ".flagged-content-list"
    );

    if (!commentsContainer) {
        console.error("Flagged comments container not found.");
        return;
    }

    async function loadFlaggedComments() {
        commentsContainer.innerHTML =
            "<p>Loading flagged comments...</p>";

        try {
            const response = await fetch(
                "http://localhost:8080/api/flagged-comments"
            );

            if (!response.ok) {
                throw new Error(
                    `HTTP error: ${response.status}`
                );
            }

            const comments = await response.json();

            commentsContainer.innerHTML = "";

            if (!Array.isArray(comments) || comments.length === 0) {
                commentsContainer.innerHTML =
                    "<p>No flagged comments found.</p>";
                return;
            }

            comments.forEach((comment) => {
                const article = document.createElement("article");
                article.className = "flagged-card";

                const header = document.createElement("div");
                header.className = "flagged-card-header";

                const heading = document.createElement("div");
                const title = document.createElement("h3");
                title.textContent = `Comment #${comment.commentId}`;

                const status = document.createElement("span");
                status.className = "status pending";
                status.textContent = comment.status || "Pending Review";

                heading.append(title, status);

                const date = document.createElement("span");
                date.className = "flagged-date";
                date.textContent = comment.flaggedDate || "Date unavailable";

                header.append(heading, date);

                const body = document.createElement("div");
                body.className = "flagged-card-body";

                const preview = document.createElement("p");
                preview.className = "post-preview";
                preview.textContent = `"${comment.commentContent || ""}"`;

                const information = document.createElement("div");
                information.className = "flag-information";

                const reasonLabel = document.createElement("strong");
                reasonLabel.textContent = "Report Reason: ";

                const reason = document.createElement("span");
                reason.textContent = comment.reportReason || "Not specified";

                information.append(reasonLabel, reason);
                body.append(preview, information);

                const actions = document.createElement("div");
                actions.className = "flagged-card-actions";

                const reviewLink = document.createElement("a");
                reviewLink.className = "review-button";
                reviewLink.textContent = "Review Content";
                reviewLink.href =
                    `./review.html?id=${encodeURIComponent(comment.commentId)}&type=comment`;

                actions.appendChild(reviewLink);
                article.append(header, body, actions);
                commentsContainer.appendChild(article);
            });
        } catch (error) {
            console.error("Failed to load flagged comments:", error);

            commentsContainer.innerHTML = "";

            const message = document.createElement("p");
            message.textContent =
                "Unable to load flagged comments. Please check that the backend is running and try again.";

            commentsContainer.appendChild(message);
        }
    }

    loadFlaggedComments();
});