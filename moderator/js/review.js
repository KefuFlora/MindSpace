document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const contentId = Number(params.get("id"));
    const contentType = params.get("type");

    const contentTitle = document.getElementById("contentTitle");
    const contentTypeElement = document.getElementById("contentType");
    const contentIdElement = document.getElementById("contentId");
    const reportReason = document.getElementById("reportReason");
    const reportedContent = document.getElementById("reportedContent");
    const approveButton = document.getElementById("approveButton");
    const removeButton = document.getElementById("removeButton");
    const actionMessage = document.getElementById("actionMessage");
    const statusElement = document.querySelector(".status");

    const isPost = contentType === "post";
    const listPage = isPost ? "./flagged-post.html" : "./flagged-comments.html";

    function showMessage(text) {
        if (actionMessage) {
            actionMessage.textContent = text;
        }
    }

    function disableButtons(disabled) {
        approveButton.disabled = disabled;
        removeButton.disabled = disabled;
    }

    // Load the selected flagged post or comment from the backend.
    async function loadContent() {
        if (!contentId || (contentType !== "post" && contentType !== "comment")) {
            showMessage("Invalid content ID or type.");
            disableButtons(true);
            return;
        }

        try {
            const items = await staffFetch(
                `/flagged?type=${isPost ? "posts" : "comments"}`
            );

            const item = items.find((entry) => entry.id === contentId);

            if (!item) {
                showMessage(
                    "This item has already been reviewed or no longer exists."
                );
                disableButtons(true);
                return;
            }

            contentTitle.textContent = isPost
                ? "Review Flagged Post"
                : "Review Flagged Comment";
            contentTypeElement.textContent = isPost ? "Post" : "Comment";
            contentIdElement.textContent = `#${item.id}`;
            reportReason.textContent = item.flag_reason || "Not specified";
            reportedContent.textContent = item.content;

            if (statusElement) {
                statusElement.textContent = "Pending Review";
            }
        } catch (error) {
            console.error("Unable to load flagged content:", error);
            showMessage(
                "Unable to load the flagged content. Check that the backend is running."
            );
            disableButtons(true);
        }
    }

    // Approve or remove the content, then return to the list.
    async function review(action, note) {
        disableButtons(true);
        showMessage("Saving your decision...");

        try {
            await staffFetch("/review", {
                method: "POST",
                body: JSON.stringify({
                    type: contentType,
                    id: contentId,
                    action: action,
                    note: note
                })
            });

            showMessage(
                `${isPost ? "Post" : "Comment"} ${action}. Returning to the list...`
            );

            setTimeout(() => {
                window.location.href = listPage;
            }, 800);
        } catch (error) {
            console.error("Unable to save the decision:", error);
            showMessage(
                error.message || "Unable to save the decision. Please try again."
            );
            disableButtons(false);
        }
    }

    approveButton.addEventListener("click", () => {
        review("approved", "");
    });

    removeButton.addEventListener("click", () => {
        const note = window.prompt(
            `Why are you removing this ${contentType}? (optional - the author will see this)`
        );

        if (note === null) {
            return;
        }

        review("removed", note.trim());
    });

    loadContent();
});