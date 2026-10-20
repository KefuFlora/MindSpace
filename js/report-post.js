document.addEventListener("DOMContentLoaded", () => {
    const reportForm = document.getElementById("reportForm");
    const reportDetails = document.getElementById("reportDetails");
    const reportMessage = document.getElementById("reportMessage");
    const reportedPostText = document.getElementById("reportedPostText");
    const backButton = document.getElementById("backButton");
    const cancelButton = document.getElementById("cancelButton");

    const params = new URLSearchParams(window.location.search);
    const postId = params.get("postId");

    // Find the selected post if it was saved in the browser.
    function findPost() {
        try {
            const savedPosts = JSON.parse(
                localStorage.getItem("mindspacePosts") || "[]"
            );

            if (Array.isArray(savedPosts)) {
                const savedPost = savedPosts.find(
                    post => String(post.id) === String(postId)
                );

                if (savedPost) {
                    return savedPost.content || "";
                }
            }
        } catch (error) {
            console.error("Could not load selected post:", error);
        }

        // Hardcoded demo posts are not stored in mindspacePosts.
        const demoPost = document.querySelector(
            `[data-post-id="${CSS.escape(String(postId || ""))}"]`
        );

        return demoPost
            ? demoPost.querySelector(".post-content")?.textContent || ""
            : "";
    }

    const postContent = findPost();

    if (!postId) {
        reportedPostText.textContent =
            "No post was selected. Return to the feed and choose a post to report.";
        reportForm.querySelectorAll("input, textarea, button[type='submit']")
            .forEach(element => element.disabled = true);
    } else if (postContent) {
        reportedPostText.textContent = postContent;
    } else {
        reportedPostText.textContent =
            "Selected post ID: " + postId +
            ". The post content could not be previewed, but you can still submit your report.";
    }

    function returnToFeed() {
        window.location.href = "posts.html";
    }

    backButton.addEventListener("click", returnToFeed);
    cancelButton.addEventListener("click", returnToFeed);

    reportForm.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!postId) {
            reportMessage.textContent =
                "Please return to the feed and select a post to report.";
            return;
        }

        const selectedReason = reportForm.querySelector(
            'input[name="reportReason"]:checked'
        );

        if (!selectedReason) {
            reportMessage.textContent =
                "Please select a reason for your report.";
            return;
        }

        const report = {
            id: Date.now().toString(),
            postId: postId,
            reason: selectedReason.value,
            details: reportDetails.value.trim(),
            submittedAt: new Date().toISOString(),
            status: "Pending"
        };

        try {
            const storedReports = JSON.parse(
                localStorage.getItem("mindspaceReports") || "[]"
            );

            const reports = Array.isArray(storedReports)
                ? storedReports
                : [];

            reports.push(report);

            localStorage.setItem(
                "mindspaceReports",
                JSON.stringify(reports)
            );

            reportForm.reset();
            reportMessage.textContent =
                "Thank you. Your report has been submitted for review.";

            reportForm.querySelectorAll(
                'input[name="reportReason"], textarea, button[type="submit"]'
            ).forEach(element => {
                element.disabled = true;
            });

            cancelButton.textContent = "Return to Feed";
        } catch (error) {
            console.error("Could not save report:", error);
            reportMessage.textContent =
                "We couldn't save your report in this browser. Please try again.";
        }
    });
});