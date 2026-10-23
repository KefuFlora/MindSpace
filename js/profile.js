document.addEventListener("DOMContentLoaded", () => {
    const API_BASE = "http://127.0.0.1:8080/api";

    const profileForm = document.getElementById("profileForm");
    const usernameInput = document.getElementById("username");
    const bioInput = document.getElementById("bio");
    const interestsInput = document.getElementById("interests");
    const profileMessage = document.getElementById("profileMessage");
    const activityList = document.getElementById("activityList");

    let activeTab = "posts";
    let currentProfile = null;

    // Send a request to the backend and return its JSON reply.
    async function requestJson(url, options = {}) {
        const response = await fetch(url, {
            credentials: "include",
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            }
        });

        if (response.status === 401) {
            window.location.href = "login.html";
            throw new Error("Please log in to continue.");
        }

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(
                data.message || "Something went wrong. Please try again."
            );
        }

        return data;
    }

    // Convert a date sent by the backend into a readable date and time.
    function formatDate(value) {
        if (!value) return "";

        let date;

        if (Array.isArray(value)) {
            const [year, month, day, hour = 0, minute = 0, second = 0] = value;
            date = new Date(year, month - 1, day, hour, minute, second);
        } else {
            date = new Date(String(value).replace(/(\.\d{3})\d+/, "$1"));
        }

        if (Number.isNaN(date.getTime())) return "";

        return date.toLocaleString("en-ZA", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    // Show only the four numbers at the top of the page.
    function showStats(profile) {
        document.getElementById("postCount").textContent =
            profile.postCount ?? 0;
        document.getElementById("commentCount").textContent =
            profile.commentCount ?? 0;
        document.getElementById("likeCount").textContent =
            profile.likedCount ?? 0;
        document.getElementById("bookmarkCount").textContent =
            profile.bookmarkCount ?? 0;
    }

    // Show the profile details and fill in the edit form.
    function showProfile(profile) {
        currentProfile = profile;

        document.getElementById("displayUsername").textContent =
            profile.username || "Your username";
        document.getElementById("displayBio").textContent =
            profile.bio || "Tell the community about yourself.";
        document.getElementById("displayInterests").textContent =
            profile.interests ? "Interests: " + profile.interests : "";

        usernameInput.value = profile.username || "";
        bioInput.value = profile.bio || "";
        interestsInput.value = profile.interests || "";

        showStats(profile);
    }

    async function loadProfile() {
        try {
            showProfile(await requestJson(`${API_BASE}/profile`));
        } catch (error) {
            console.error("Could not load profile:", error);
            profileMessage.textContent =
                "Could not load your profile. Please check that the backend is running.";
        }
    }

    // Refresh the four numbers without touching the edit form.
    async function refreshStats() {
        try {
            showStats(await requestJson(`${API_BASE}/profile`));
        } catch (error) {
            console.error("Could not refresh stats:", error);
        }
    }

    document
        .getElementById("editProfileButton")
        .addEventListener("click", () => {
            profileMessage.textContent = "";
            profileForm.hidden = false;
            usernameInput.focus();
        });

    document
        .getElementById("cancelEditButton")
        .addEventListener("click", () => {
            if (currentProfile) {
                showProfile(currentProfile);
            }

            profileForm.hidden = true;
            profileMessage.textContent = "";
        });

    profileForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = usernameInput.value.trim();
        const bio = bioInput.value.trim();
        const interests = interestsInput.value.trim();
        const saveButton = profileForm.querySelector('button[type="submit"]');

        if (username.length < 3 || username.length > 30) {
            profileMessage.textContent =
                "Username must be between 3 and 30 characters.";
            return;
        }

        if (bio.length > 250) {
            profileMessage.textContent =
                "Your bio cannot exceed 250 characters.";
            return;
        }

        if (interests.length > 200) {
            profileMessage.textContent =
                "Your interests cannot exceed 200 characters.";
            return;
        }

        saveButton.disabled = true;
        profileMessage.textContent = "";

        try {
            const updatedProfile = await requestJson(`${API_BASE}/profile`, {
                method: "PUT",
                body: JSON.stringify({ username, bio, interests })
            });

            showProfile(updatedProfile);
            profileMessage.textContent = "Profile updated successfully!";
            profileForm.hidden = true;
        } catch (error) {
            console.error("Could not update profile:", error);
            profileMessage.textContent =
                error.message || "Could not update your profile.";
        } finally {
            saveButton.disabled = false;
        }
    });

    function createButton(label, action, className = "") {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = label;
        button.className = className;
        button.addEventListener("click", action);
        return button;
    }

    // Ask for confirmation, send the request, then refresh the page data.
    async function runAction(confirmMessage, url, options) {
        if (!window.confirm(confirmMessage)) return;

        try {
            await requestJson(url, options);
            await refreshStats();
            await renderActivity();
        } catch (error) {
            console.error("Could not complete the action:", error);
            window.alert(
                error.message || "Something went wrong. Please try again."
            );
        }
    }

    function deletePost(postId) {
        return runAction(
            "Delete this post permanently? Its comments will also be deleted.",
            `${API_BASE}/posts/${encodeURIComponent(postId)}`,
            { method: "DELETE" }
        );
    }

    function deleteComment(commentId) {
        return runAction(
            "Delete this comment?",
            `${API_BASE}/comments/${encodeURIComponent(commentId)}`,
            { method: "DELETE" }
        );
    }

    function removeBookmark(postId) {
        return runAction(
            "Remove this post from your saved posts?",
            `${API_BASE}/posts/${encodeURIComponent(postId)}/bookmark`,
            { method: "DELETE" }
        );
    }

    function createActivityCard(title, content, meta, actionButton = null) {
        const card = document.createElement("article");
        card.className = "activity-card";

        const heading = document.createElement("h3");
        heading.textContent = title;

        const body = document.createElement("p");
        body.textContent = content;

        card.append(heading, body);

        if (meta) {
            const details = document.createElement("p");
            details.className = "activity-meta";
            details.textContent = meta;
            card.appendChild(details);
        }

        if (actionButton) card.appendChild(actionButton);

        return card;
    }

    function showMessage(text) {
        const message = document.createElement("p");
        message.className = "empty-activity";
        message.textContent = text;
        activityList.replaceChildren(message);
    }

    async function renderActivity() {
        const tab = activeTab;
        let data;

        try {
            data = await requestJson(`${API_BASE}/profile/${tab}`);
        } catch (error) {
            console.error("Could not load activity:", error);

            if (tab === activeTab) {
                showMessage("Could not load this list. Please try again.");
            }

            return;
        }

        // The person switched tabs while this list was loading.
        if (tab !== activeTab) return;

        const list = Array.isArray(data) ? data : [];
        let items = [];

        if (tab === "posts") {
            items = list.map((post) => ({
                title: post.topic || "My post",
                content: post.content || "",
                meta: formatDate(post.createdAt) || "Post history",
                button: createButton("Delete post", () => deletePost(post.id))
            }));
        } else if (tab === "comments") {
            items = list.map((comment) => ({
                title: "My comment",
                content: comment.text || "",
                meta: "On: " + (comment.postContent || "A post"),
                button: createButton("Delete comment", () =>
                    deleteComment(comment.id)
                )
            }));
        } else if (tab === "liked") {
            items = list.map((post) => ({
                title: post.topic || "Liked post",
                content: post.content || "",
                meta: "Liked by you"
            }));
        } else if (tab === "saved") {
            items = list.map((post) => ({
                title: post.topic || "Saved post",
                content: post.content || "",
                meta: "Bookmarked by you",
                button: createButton("Remove saved post", () =>
                    removeBookmark(post.id)
                )
            }));
        }

        if (items.length === 0) {
            const messages = {
                posts: "You haven't created any posts yet.",
                comments: "Your comment history will appear here.",
                liked: "Posts you like will appear here.",
                saved: "You have no saved posts yet."
            };

            showMessage(messages[tab]);
            return;
        }

        activityList.replaceChildren(
            ...items.map((item) =>
                createActivityCard(
                    item.title,
                    item.content,
                    item.meta,
                    item.button
                )
            )
        );
    }

    document.querySelectorAll(".profile-tabs button").forEach((button) => {
        button.addEventListener("click", () => {
            activeTab = button.dataset.tab;

            document.querySelectorAll(".profile-tabs button").forEach((tab) => {
                const selected = tab === button;
                tab.classList.toggle("active", selected);
                tab.setAttribute("aria-pressed", String(selected));
            });

            renderActivity();
        });
    });

    loadProfile();
    renderActivity();
});