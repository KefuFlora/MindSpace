
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("createPostForm");
    const topicInput = document.getElementById("postTopic");
    const contentInput = document.getElementById("postContent");
    const triggerWarning = document.getElementById("triggerWarning");
    const warningDetails = document.getElementById("warningDetails");
    const warningText = document.getElementById("warningText");
    const closeButton = document.getElementById("closeButton");
    const submitButton = form.querySelector(".submit-post-button");
    const formMessage = document.getElementById("formMessage");
    const params = new URLSearchParams(window.location.search);
    const editId = params.get("editId");
    let postBeingEdited = null;

    if (editId) {
    try {
        const savedPosts = JSON.parse(
            localStorage.getItem("mindspacePosts") || "[]"
        );

        postBeingEdited = Array.isArray(savedPosts)
            ? savedPosts.find(
                post => String(post.id) === String(editId)
            )
            : null;

        if (postBeingEdited) {
            topicInput.value = postBeingEdited.topic;
            contentInput.value = postBeingEdited.content;

            triggerWarning.checked =
                postBeingEdited.hasTriggerWarning === true;

            warningDetails.hidden = !triggerWarning.checked;
            warningText.value = postBeingEdited.triggerWarning || "";

            submitButton.textContent = "Save Changes";

            document.querySelector(".create-post-header h1").textContent =
                "Edit Post";
        } else {
            formMessage.textContent =
                "This post could not be found. You can create a new post instead.";
        }
    } catch (error) {
        console.error("Could not load post for editing:", error);
        formMessage.textContent =
            "The post could not be loaded for editing.";
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

    // Create and save a post.
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const topic = topicInput.value;
        const content = contentInput.value.trim();
        const hasWarning = triggerWarning.checked;
        const warning = warningText.value.trim();

        formMessage.textContent = "";

        if (!content) {
            formMessage.textContent = "Please write something before posting.";
            contentInput.focus();
            return;
        }

        if (hasWarning && !warning) {
            formMessage.textContent =
                "Please enter a content warning or switch the option off.";
            warningText.focus();
            return;
        }

        // Read existing posts from browser storage.
        let savedPosts = [];

        try {
            const storedPosts = localStorage.getItem("mindspacePosts");
            savedPosts = storedPosts ? JSON.parse(storedPosts) : [];

            if (!Array.isArray(savedPosts)) {
                savedPosts = [];
            }
        } catch (error) {
            formMessage.textContent =
                "Your post could not be saved. Please try again.";
            return;
        }

       
        // Update an existing post or create a new one.
        if (editId && !postBeingEdited) {
            formMessage.textContent =
                "This post could not be found. Please return to the feed and try again.";
            return;
        }

        if (editId && postBeingEdited.author !== "You") {
            formMessage.textContent =
                "You can only edit your own posts.";
            return;
        }

        const postData = {
            id: editId || Date.now().toString(),
            author: editId ? postBeingEdited.author : "You",
            topic: topic,
            content: content,
            createdAt: editId
                ? postBeingEdited.createdAt
                : new Date().toISOString(),
            hasTriggerWarning: hasWarning,
            triggerWarning: hasWarning ? warning : "",
            likes: editId ? (postBeingEdited.likes || 0) : 0,
            comments: editId ? (postBeingEdited.comments || []) : [],
            bookmarked: editId
                ? (postBeingEdited.bookmarked || false)
                : false
        };

        if (editId) {
            const postIndex = savedPosts.findIndex(
                post => String(post.id) === String(editId)
            );

            if (postIndex === -1) {
                formMessage.textContent =
                    "This post could not be found. Please return to the feed and try again.";
                return;
            }

            savedPosts[postIndex] = postData;
        } else {
            savedPosts.unshift(postData);
        }

        // Save before navigating back to the feed.
        try {
            localStorage.setItem(
                "mindspacePosts",
                JSON.stringify(savedPosts)
            );
        } catch (error) {
            formMessage.textContent =
                "Your post could not be saved in this browser.";
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = editId ? "Changes Saved!" : "Post Created!";

        window.location.href = "posts.html";

    });
});
