
document.addEventListener("DOMContentLoaded", () => {
    const profileForm = document.getElementById("profileForm");
    const usernameInput = document.getElementById("username");
    const bioInput = document.getElementById("bio");
    const interestsInput = document.getElementById("interests");
    const profileMessage = document.getElementById("profileMessage");
    const activityList = document.getElementById("activityList");

    let activeTab = "posts";

    function readStorage(key, fallback = []) {
        try {
            const value = JSON.parse(localStorage.getItem(key) || "null");
            return value ?? fallback;
        } catch {
            return fallback;
        }
    }

    function getPosts() {
        const posts = readStorage("mindspacePosts", []);
        return Array.isArray(posts) ? posts : [];
    }

    function getBookmarks() {
        const bookmarks = readStorage("mindspaceBookmarks", []);
        return Array.isArray(bookmarks) ? bookmarks.map(String) : [];
    }

    function loadProfile() {
        const profile = readStorage("mindspaceProfile", {});

        document.getElementById("displayUsername").textContent =
            profile.username || "Choose your username";
        document.getElementById("displayBio").textContent =
            profile.bio || "Tell the community about yourself.";
        document.getElementById("displayInterests").textContent =
            profile.interests ? "Interests: " + profile.interests : "";

        usernameInput.value = profile.username || "";
        bioInput.value = profile.bio || "";
        interestsInput.value = profile.interests || "";
    }

    document.getElementById("editProfileButton").addEventListener("click", () => {
        profileMessage.textContent = "";
        profileForm.hidden = false;
        usernameInput.focus();
    });

    document.getElementById("cancelEditButton").addEventListener("click", () => {
        loadProfile();
        profileForm.hidden = true;
        profileMessage.textContent = "";
    });

    profileForm.addEventListener("submit", event => {
        event.preventDefault();

        const profile = {
            username: usernameInput.value.trim(),
            bio: bioInput.value.trim(),
            interests: interestsInput.value.trim()
        };

        if (!profile.username) {
            profileMessage.textContent = "Please enter a username.";
            return;
        }

        localStorage.setItem("mindspaceProfile", JSON.stringify(profile));
        loadProfile();
        profileMessage.textContent = "Profile updated successfully!";
        profileForm.hidden = true;
    });

    function createButton(label, action, className = "") {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = label;
        button.className = className;
        button.addEventListener("click", action);
        return button;
    }

    function deletePost(postId) {
        if (!confirm("Delete this post permanently? Its comments will also be deleted.")) {
            return;
        }

        const posts = getPosts();
        const updatedPosts = posts.filter(post => String(post.id) !== String(postId));

        localStorage.setItem("mindspacePosts", JSON.stringify(updatedPosts));

        const bookmarks = getBookmarks().filter(id => id !== String(postId));
        localStorage.setItem("mindspaceBookmarks", JSON.stringify(bookmarks));

        renderActivity();
    }

    function deleteComment(postId, commentIndex) {
        if (!confirm("Delete this comment?")) return;

        const posts = getPosts();
        const post = posts.find(item => String(item.id) === String(postId));

        if (!post || !Array.isArray(post.comments)) return;

        const comment = post.comments[commentIndex];

        // Only allow deleting comments identified as yours.
        if (
            typeof comment === "string" ||
            (comment && comment.author === "You")
        ) {
            post.comments.splice(commentIndex, 1);
            localStorage.setItem("mindspacePosts", JSON.stringify(posts));
            renderActivity();
        } else {
            alert("You can only delete your own comments.");
        }
    }

    function removeBookmark(postId) {
        if (!confirm("Remove this post from your saved posts?")) return;

        const bookmarks = getBookmarks().filter(id => id !== String(postId));
        localStorage.setItem("mindspaceBookmarks", JSON.stringify(bookmarks));
        renderActivity();
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

    function renderActivity() {
        const posts = getPosts();
        const bookmarks = getBookmarks();

        const myPosts = posts.filter(post => post.author === "You");
        const myComments = [];

        posts.forEach(post => {
            if (!Array.isArray(post.comments)) return;

            post.comments.forEach((comment, index) => {
                if (typeof comment === "string") {
                    myComments.push({
                        text: comment,
                        post,
                        postId: post.id,
                        commentIndex: index
                    });
                } else if (comment && comment.author === "You") {
                    myComments.push({
                        text: comment.text || "",
                        post,
                        postId: post.id,
                        commentIndex: index
                    });
                }
            });
        });

        const likedPosts = posts.filter(post => post.liked === true);
        const savedPosts = bookmarks.map(id =>
            posts.find(post => String(post.id) === id)
        ).filter(Boolean);

        document.getElementById("postCount").textContent = myPosts.length;
        document.getElementById("commentCount").textContent = myComments.length;
        document.getElementById("likeCount").textContent = likedPosts.length;
        document.getElementById("bookmarkCount").textContent = bookmarks.length;

        activityList.replaceChildren();

        let items = [];

        if (activeTab === "posts") {
            items = myPosts.map(post => ({
                title: post.topic || "My post",
                content: post.content || "",
                meta: post.createdAt
                    ? new Date(post.createdAt).toLocaleString()
                    : "Post history",
                button: createButton("Delete post", () => deletePost(post.id))
            }));
        } else if (activeTab === "comments") {
            items = myComments.map(comment => ({
                title: "My comment",
                content: comment.text,
                meta: "On: " + (comment.post.content || "A post"),
                button: createButton("Delete comment", () =>
                    deleteComment(comment.postId, comment.commentIndex)
                )
            }));
        } else if (activeTab === "liked") {
            items = likedPosts.map(post => ({
                title: post.topic || "Liked post",
                content: post.content || "",
                meta: "Liked by you"
            }));
        } else if (activeTab === "saved") {
            items = savedPosts.map(post => ({
                title: post.topic || "Saved post",
                content: post.content || "",
                meta: "Bookmarked by you",
                button: createButton("Remove saved post", () =>
                    removeBookmark(post.id)
                )
            }));
        }

        if (items.length === 0) {
            const empty = document.createElement("p");
            empty.className = "empty-activity";

            const messages = {
                posts: "You haven't created any posts yet.",
                comments: "Your comment history will appear here.",
                liked: "Your liked posts will appear here when available.",
                saved: "You have no saved posts here."
            };

            empty.textContent = messages[activeTab];
            activityList.appendChild(empty);
            return;
        }

        items.forEach(item => {
            activityList.appendChild(
                createActivityCard(
                    item.title,
                    item.content,
                    item.meta,
                    item.button
                )
            );
        });
    }

    document.querySelectorAll(".profile-tabs button").forEach(button => {
        button.addEventListener("click", () => {
            activeTab = button.dataset.tab;

            document.querySelectorAll(".profile-tabs button").forEach(tab => {
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
