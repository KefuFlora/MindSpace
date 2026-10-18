
document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const contentId = params.get("id");
    const contentType = params.get("type");

    const contentTitle = document.getElementById("contentTitle");
    const contentTypeElement = document.getElementById("contentType");
    const contentIdElement = document.getElementById("contentId");
    const reportReason = document.getElementById("reportReason");
    const reportedContent = document.getElementById("reportedContent");
    const approveButton = document.getElementById("approveButton");
    const removeButton = document.getElementById("removeButton");
    const statusElement = document.querySelector(".status");

    let selectedContent = null;

    const baseUrl = {
        post: "http://localhost:8080/api/flagged-posts",
        comment: "http://localhost:8080/api/flagged-comments"
    };

    // Load the selected flagged post or comment.
    async function loadContent() {
        if (!contentId || !baseUrl[contentType]) {
            alert("Invalid content ID or type.");
            return;
        }

        try {
            const response = await fetch(
                `${baseUrl[contentType]}/${contentType}/${encodeURIComponent(contentId)}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            selectedContent = await response.json();

            if (contentTitle) {
                contentTitle.textContent =
                    contentType === "post"
                        ? "Review Flagged Post"
                        : "Review Flagged Comment";
            }

            if (contentTypeElement) {
                contentTypeElement.textContent =
                    contentType === "post" ? "Post" : "Comment";
            }

            if (contentIdElement) {
                contentIdElement.textContent =
                    contentType === "post"
                        ? selectedContent.postId
                        : selectedContent.commentId;
            }

            if (reportReason) {
                reportReason.textContent = selectedContent.reportReason;
            }

            if (reportedContent) {
                reportedContent.textContent =
                    contentType === "post"
                        ? selectedContent.postContent
                        : selectedContent.commentContent;
            }

            if (statusElement) {
                statusElement.textContent = selectedContent.status;
            }
        } catch (error) {
            console.error("Unable to load flagged content:", error);
            alert(
                "Unable to load the flagged content. Check that the backend is running and the content exists."
            );
        }
    }

    // Update the report status in the database.
    async function updateStatus(newStatus) {
        if (!selectedContent || selectedContent.id == null) {
            alert("No content is loaded. Please return to the flagged content list.");
            return;
        }

        approveButton.disabled = true;
        removeButton.disabled = true;

        try {
            const response = await fetch(
                `${baseUrl[contentType]}/${selectedContent.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        ...selectedContent,
                        status: newStatus
                    })
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            selectedContent = await response.json();

            alert(
                `${contentType === "post" ? "Post" : "Comment"} status updated to ${newStatus}.`
            );

            window.location.href =
                contentType === "post"
                    ? "./flagged-post.html"
                    : "./flagged-comments.html";
        } catch (error) {
            console.error("Unable to update flagged content:", error);

            alert(
                "Unable to update the status. Check the backend and try again."
            );

            approveButton.disabled = false;
            removeButton.disabled = false;
        }
    }

    if (approveButton) {
        approveButton.addEventListener("click", () => {
            updateStatus("Approved");
        });
    }

    if (removeButton) {
        removeButton.addEventListener("click", () => {
            const confirmed = window.confirm(
                `Are you sure you want to mark this ${contentType} as Removed?`
            );

            if (confirmed) {
                updateStatus("Removed");
            }
        });
    }

    loadContent();
});