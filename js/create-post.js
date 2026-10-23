
document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("createPostForm");
    const topicInput = document.getElementById("postTopic");
    const contentInput = document.getElementById("postContent");
    const triggerWarning = document.getElementById("triggerWarning");
    const warningDetails = document.getElementById("warningDetails");
    const warningText = document.getElementById("warningText");
    const closeButton = document.getElementById("closeButton");
    const submitButton = form.querySelector(".submit-post-button");
    const formMessage = document.getElementById("formMessage");
    const heading = document.querySelector(".create-post-header h1");

    const API_BASE = "http://127.0.0.1:8080/api";
    const params = new URLSearchParams(window.location.search);
    const editId = params.get("editId");

    let postBeingEdited = null;

    function showMessage(message) {
        formMessage.textContent = message;
    }

    async function apiRequest(url, options = {}) {
        const response = await fetch(url, {
            ...options,
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...options.headers
            }
        });

        let data = {};

        try {
            data = await response.json();
        } catch {
            // The response may not contain JSON.
        }

        if (!response.ok) {
            throw new Error(
                data.message || "Something went wrong. Please try again."
            );
        }

        return data;
    }

    // Check that the user is logged in.
    try {
        await apiRequest(`${API_BASE}/auth/me`, {
            method: "GET",
            headers: {}
        });
    } catch {
        window.location.href = "login.html";
        return;
    }

    // Load the post from MySQL when editing.
    if (editId) {
        try {
            postBeingEdited = await apiRequest(
                `${API_BASE}/posts`,
                { method: "GET" }
            ).then(posts =>
                posts.find(post => String(post.id) === String(editId))
            );

            if (!postBeingEdited) {
                showMessage(
                    "This post could not be found. It may have been deleted."
                );
                submitButton.disabled = true;
                return;
            }

            if (!postBeingEdited.isOwnPost) {
                showMessage("You can only edit your own posts.");
                submitButton.disabled = true;
                return;
            }

            topicInput.value = postBeingEdited.topic;
            contentInput.value = postBeingEdited.content;

            triggerWarning.checked =
                postBeingEdited.hasTriggerWarning === true;

            warningDetails.hidden = !triggerWarning.checked;
            warningText.value = postBeingEdited.triggerWarning || "";

            submitButton.textContent = "Save Changes";
            heading.textContent = "Edit Post";
        } catch (error) {
            showMessage(error.message);
            submitButton.disabled = true;
            return;
        }
    }

    // Show or hide the content-warning field.
    triggerWarning.addEventListener("change", () => {
        warningDetails.hidden = !triggerWarning.checked;

        if (!triggerWarning.checked) {
            warningText.value = "";
        }
    });

    // Return to the feed without submitting.
    closeButton.addEventListener("click", () => {
        window.location.href = "posts.html";
    });

    // Create or update a post in MySQL.
    form.addEventListener("submit", async event => {
        event.preventDefault();

        const topic = topicInput.value;
        const content = contentInput.value.trim();
        const hasWarning = triggerWarning.checked;
        const warning = warningText.value.trim();

        showMessage("");

        if (!content) {
            showMessage("Please write something before posting.");
            contentInput.focus();
            return;
        }

        if (content.length > 2000) {
            showMessage("Your post cannot exceed 2000 characters.");
            contentInput.focus();
            return;
        }

        if (hasWarning && !warning) {
            showMessage(
                "Please enter a content warning or switch the option off."
            );
            warningText.focus();
            return;
        }

        if (warning.length > 100) {
            showMessage("The content warning cannot exceed 100 characters.");
            warningText.focus();
            return;
        }

        const postData = {
            topic,
            content,
            hasTriggerWarning: hasWarning,
            triggerWarning: hasWarning ? warning : ""
        };

        submitButton.disabled = true;
        submitButton.textContent = editId ? "Saving..." : "Posting...";

        try {
            await apiRequest(
                editId
                    ? `${API_BASE}/posts/${encodeURIComponent(editId)}`
                    : `${API_BASE}/posts`,
                {
                    method: editId ? "PUT" : "POST",
                    body: JSON.stringify(postData)
                }
            );

            submitButton.textContent = editId
                ? "Changes Saved!"
                : "Post Created!";

            window.location.href = "posts.html";
        } catch (error) {
            showMessage(error.message);
            submitButton.disabled = false;
            submitButton.textContent = editId
                ? "Save Changes"
                : "Post Anonymously";
        }
    });
});
