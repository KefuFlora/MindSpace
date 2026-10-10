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

let selectedComment = null;

async function loadComment() {
    if (contentType !== "comment" || !contentId) {
        return false;
    }

    try {
        const response = await fetch(
            "http://localhost:8080/api/flagged-comments"
        );

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const comments = await response.json();

        selectedComment = comments.find(
            comment => comment.commentId === contentId
        );

        if (!selectedComment) {
            throw new Error("The flagged comment could not be found.");
        }

        if (contentTitle) {
            contentTitle.textContent = "Review Flagged Comment";
        }

        if (contentTypeElement) {
            contentTypeElement.textContent = "Comment";
        }

        if (contentIdElement) {
            contentIdElement.textContent = selectedComment.commentId;
        }

        if (reportReason) {
            reportReason.textContent = selectedComment.reportReason;
        }

        if (reportedContent) {
            reportedContent.textContent = selectedComment.commentContent;
        }

        return true;
    } catch (error) {
        console.error("Unable to load flagged comment:", error);
        alert("Unable to load this comment. Please check that the backend is running.");
        return false;
    }
}

async function updateCommentStatus(newStatus) {
    if (!selectedComment || selectedComment.id == null) {
        alert("No comment is loaded. Please return to the flagged comments page and try again.");
        return;
    }

    approveButton.disabled = true;
    removeButton.disabled = true;

    try {
        const updatedComment = {
            commentId: selectedComment.commentId,
            commentContent: selectedComment.commentContent,
            reportReason: selectedComment.reportReason,
            status: newStatus,
            flaggedDate: selectedComment.flaggedDate
        };

        const response = await fetch(
            `http://localhost:8080/api/flagged-comments/${selectedComment.id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedComment)
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        selectedComment = await response.json();

        alert(`Comment ${newStatus.toLowerCase()} successfully.`);

        window.location.href = "./flagged-comments.html";
    } catch (error) {
        console.error("Unable to update comment:", error);
        alert("The comment could not be updated. Please check that the backend is running and try again.");

        approveButton.disabled = false;
        removeButton.disabled = false;
    }
}

if (approveButton) {
    approveButton.addEventListener("click", async () => {
        if (contentType === "comment") {
            await updateCommentStatus("Approved");
        } else {
            alert("Post approval is not connected to the backend yet.");
        }
    });
}

if (removeButton) {
    removeButton.addEventListener("click", async () => {
        if (contentType === "comment") {
            const confirmed = window.confirm(
                "Are you sure you want to remove this comment from the flagged content?"
            );

            if (confirmed) {
                await updateCommentStatus("Removed");
            }
        } else {
            alert("Post removal is not connected to the backend yet.");
        }
    });
}

if (contentType === "comment") {
    loadComment();
}
});
