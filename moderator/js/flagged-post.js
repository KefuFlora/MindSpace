document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("flaggedPostsContainer");

    if (!container) {
        return;
    }

    function showMessage(text) {
        container.replaceChildren();

        const message = document.createElement("p");
        message.textContent = text;
        container.appendChild(message);
    }

    function buildCard(post) {
        const article = document.createElement("article");
        article.className = "flagged-card";

        const header = document.createElement("div");
        header.className = "flagged-card-header";

        const heading = document.createElement("div");
        const title = document.createElement("h3");
        title.textContent = `Post #${post.id}`;

        const status = document.createElement("span");
        status.className = "status pending";
        status.textContent = "Pending Review";

        heading.append(title, status);

        const date = document.createElement("span");
        date.className = "flagged-date";
        date.textContent = formatStaffDate(post.created_at);

        header.append(heading, date);

        const body = document.createElement("div");
        body.className = "flagged-card-body";

        const preview = document.createElement("p");
        preview.className = "post-preview";
        preview.textContent = `"${post.content || ""}"`;

        const reasonInfo = document.createElement("div");
        reasonInfo.className = "flag-information";

        const reasonLabel = document.createElement("strong");
        reasonLabel.textContent = "Report Reason: ";

        const reason = document.createElement("span");
        reason.textContent = post.flag_reason || "Not specified";

        reasonInfo.append(reasonLabel, reason);

        const authorInfo = document.createElement("div");
        authorInfo.className = "flag-information";

        const authorLabel = document.createElement("strong");
        authorLabel.textContent = "Posted by: ";

        const author = document.createElement("span");
        author.textContent = post.author || "Unknown";

        authorInfo.append(authorLabel, author);
        body.append(preview, reasonInfo, authorInfo);

        const actions = document.createElement("div");
        actions.className = "flagged-card-actions";

        const reviewLink = document.createElement("a");
        reviewLink.className = "review-button";
        reviewLink.textContent = "Review Content";
        reviewLink.href =
            `./review.html?id=${encodeURIComponent(post.id)}&type=post`;

        actions.appendChild(reviewLink);
        article.append(header, body, actions);

        return article;
    }

    async function loadFlaggedPosts() {
        showMessage("Loading flagged posts...");

        try {
            const posts = await staffFetch("/flagged?type=posts");

            if (!Array.isArray(posts) || posts.length === 0) {
                showMessage("No flagged posts found.");
                return;
            }

            container.replaceChildren(...posts.map(buildCard));
        } catch (error) {
            console.error("Error loading flagged posts:", error);
            showMessage(
                "Unable to load flagged posts. Please try again later."
            );
        }
    }

    loadFlaggedPosts();
});