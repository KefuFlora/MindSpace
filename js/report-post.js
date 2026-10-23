document.addEventListener("DOMContentLoaded", () => {
    const reportForm = document.getElementById("reportForm");
    const reportDetails = document.getElementById("reportDetails");
    const reportMessage = document.getElementById("reportMessage");
    const reportedPostText = document.getElementById("reportedPostText");
    const backButton = document.getElementById("backButton");
    const cancelButton = document.getElementById("cancelButton");

    const API_BASE = "http://127.0.0.1:8080/api";

    const params = new URLSearchParams(window.location.search);
    const postId = params.get("postId");

    function disableForm() {
        reportForm.querySelectorAll(
            'input[name="reportReason"], textarea, button[type="submit"]'
        ).forEach((element) => {
            element.disabled = true;
        });
    }

    // Show the post being reported, using the posts saved in MySQL.
    async function loadPostPreview() {
        if (!postId) {
            reportedPostText.textContent =
                "No post was selected. Return to the feed and choose a post to report.";
            disableForm();
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/posts`, {
                credentials: "include"
            });

            if (response.status === 401) {
                window.location.href = "login.html";
                return;
            }

            const posts = await response.json().catch(() => []);
            const post = Array.isArray(posts)
                ? posts.find((item) => String(item.id) === String(postId))
                : null;

            if (post && post.content) {
                reportedPostText.textContent = post.content;
            } else if (response.ok) {
                reportedPostText.textContent =
                    "This post is no longer available.";
                disableForm();
            } else {
                reportedPostText.textContent =
                    "The post could not be previewed, but you can still submit your report.";
            }
        } catch (error) {
            console.error("Could not load selected post:", error);
            reportedPostText.textContent =
                "The post could not be previewed, but you can still submit your report.";
        }
    }

    function returnToFeed() {
        window.location.href = "posts.html";
    }

    backButton.addEventListener("click", returnToFeed);
    cancelButton.addEventListener("click", returnToFeed);

    reportForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!postId || Number.isNaN(Number(postId))) {
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

        const submitButton = reportForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        reportMessage.textContent = "Sending your report...";

        try {
            const response = await fetch(`${API_BASE}/reports`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "post",
                    id: Number(postId),
                    reason: selectedReason.value,
                    details: reportDetails.value.trim()
                })
            });

            if (response.status === 401) {
                window.location.href = "login.html";
                return;
            }

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "We couldn't send your report. Please try again."
                );
            }

            reportForm.reset();
            reportMessage.textContent =
                data.message ||
                "Thank you. Your report has been submitted for review.";

            disableForm();
            cancelButton.textContent = "Return to Feed";
        } catch (error) {
            console.error("Could not send report:", error);
            reportMessage.textContent =
                error.message ||
                "We couldn't send your report. Please try again.";
            submitButton.disabled = false;
        }
    });

    loadPostPreview();
});