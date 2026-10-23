document.addEventListener("DOMContentLoaded", () => {
    const feedTabs = document.querySelectorAll(".tab-button");
    const postsList = document.getElementById("postsList");
    const createPostButton = document.getElementById("createPostButton");
    const backButton = document.getElementById("backButton");

    const POSTS_API = "http://127.0.0.1:8080/api/posts";
    const FOLLOWS_API = "http://127.0.0.1:8080/api/follows";

    // Update a like button so it matches the data saved in MySQL.
    function setLikeState(button, liked, count) {
        const countElement = button.querySelector(".like-count");

        if (countElement) {
            countElement.textContent = String(count ?? 0);
        }

        button.setAttribute("aria-pressed", String(liked));
        button.classList.toggle("liked", liked);
        button.setAttribute("aria-label", liked ? "Unlike post" : "Like post");
    }

    // Update a bookmark button so it matches the data saved in MySQL.
    function setBookmarkState(button, bookmarked) {
        button.setAttribute("aria-pressed", String(bookmarked));
        button.classList.toggle("bookmarked", bookmarked);
        button.setAttribute(
            "aria-label",
            bookmarked ? "Remove bookmark" : "Bookmark post"
        );

        const icon = button.querySelector("path");

        if (icon) {
            icon.setAttribute("fill", bookmarked ? "currentColor" : "none");
        }
    }

    // Convert the date sent by the backend into a Date object.
    function parseCreatedAt(value) {
        if (!value) return null;

        // Some Spring configurations send dates as [year, month, day, ...].
        if (Array.isArray(value)) {
            const [year, month, day, hour = 0, minute = 0, second = 0] = value;
            return new Date(year, month - 1, day, hour, minute, second);
        }

        // Keep only milliseconds so every browser can read the date.
        const cleaned = String(value).replace(/(\.\d{3})\d+/, "$1");
        const date = new Date(cleaned);

        return Number.isNaN(date.getTime()) ? null : date;
    }

    // Show a friendly time such as "5 min ago".
    function formatTimeAgo(date) {
        const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

        if (seconds < 60) return "Just now";

        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} min ago`;

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hr ago`;

        const days = Math.floor(hours / 24);
        if (days < 7) return `${days} ${days === 1 ? "day" : "days"} ago`;

        return date.toLocaleDateString("en-ZA", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }

    // Delete a post in MySQL, then remove it from the page.
    async function deletePost(postElement) {
        const postId = String(postElement.dataset.postId);

        try {
            const response = await fetch(
                `${POSTS_API}/${encodeURIComponent(postId)}`,
                { method: "DELETE", credentials: "include" }
            );

            if (response.status === 401) {
                window.location.href = "login.html";
                return;
            }

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.message || "Could not delete the post.");
            }

            postElement.remove();
        } catch (error) {
            console.error("Could not delete post:", error);
            window.alert(
                error.message || "Could not delete the post. Please try again."
            );
        }
    }

    // Switch between Top and Following tabs and reload the feed.
    feedTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            feedTabs.forEach((otherTab) => {
                const isActive = otherTab === tab;

                otherTab.classList.toggle("active", isActive);
                otherTab.setAttribute("aria-pressed", String(isActive));
            });

                        activeFeed = tab.dataset.feed || "latest";
            loadSavedPosts();
        });
    });

    // Like or unlike a post. The change is saved in MySQL.
    postsList.addEventListener("click", async (event) => {
        const likeButton = event.target.closest(".like-button");
        if (!likeButton || likeButton.disabled) return;

        const post = likeButton.closest(".post");
        if (!post || !post.dataset.postId) return;

        const postId = post.dataset.postId;
        const isLiked = likeButton.getAttribute("aria-pressed") === "true";

        likeButton.disabled = true;

        try {
            const response = await fetch(
                `${POSTS_API}/${encodeURIComponent(postId)}/like`,
                {
                    method: isLiked ? "DELETE" : "POST",
                    credentials: "include"
                }
            );

            if (response.status === 401) {
                window.location.href = "login.html";
                return;
            }

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.message || "Could not update your like.");
            }

            setLikeState(
                likeButton,
                data.likedByCurrentUser === true,
                data.likes
            );
        } catch (error) {
            console.error("Could not update like:", error);
            window.alert(
                error.message || "Could not update your like. Please try again."
            );
        } finally {
            likeButton.disabled = false;
        }
    });

    // Bookmark or unbookmark a post. The change is saved in MySQL.
    postsList.addEventListener("click", async (event) => {
        const bookmarkButton = event.target.closest(".bookmark-button");
        if (!bookmarkButton || bookmarkButton.disabled) return;

        const post = bookmarkButton.closest(".post");
        if (!post || !post.dataset.postId) return;

        const isBookmarked =
            bookmarkButton.getAttribute("aria-pressed") === "true";

        bookmarkButton.disabled = true;

        try {
            const data = await requestJson(
                `${POSTS_API}/${encodeURIComponent(post.dataset.postId)}/bookmark`,
                { method: isBookmarked ? "DELETE" : "POST" }
            );

            setBookmarkState(bookmarkButton, data.bookmarked === true);
        } catch (error) {
            console.error("Could not update bookmark:", error);
            window.alert(
                error.message ||
                    "Could not update your bookmark. Please try again."
            );
        } finally {
            bookmarkButton.disabled = false;
        }
    });

    // Open and close each post's options menu.
    postsList.addEventListener("click", (event) => {
        const menuButton = event.target.closest(".post-menu-button");

        if (menuButton) {
            const postHeader = menuButton.closest(".post-header");
            const menu = postHeader.querySelector(".post-menu");
            const willOpen = menu.hidden;

            // Close any other open menus first.
            postsList.querySelectorAll(".post-menu").forEach((otherMenu) => {
                otherMenu.hidden = true;

                const otherButton =
                    otherMenu.parentElement.querySelector(".post-menu-button");

                if (otherButton) {
                    otherButton.setAttribute("aria-expanded", "false");
                }
            });

            menu.hidden = !willOpen;
            menuButton.setAttribute("aria-expanded", String(willOpen));
            return;
        }

        // Close the menu when a menu option is selected.
        const menuOption = event.target.closest(".post-menu button");

        if (menuOption) {
            const menu = menuOption.closest(".post-menu");
            const menuButton =
                menu.parentElement.querySelector(".post-menu-button");

            menu.hidden = true;

            if (menuButton) {
                menuButton.setAttribute("aria-expanded", "false");
            }

            if (menuOption.classList.contains("edit-post")) {
                const post = menuOption.closest(".post");

                if (!post) return;

                const postId = post.dataset.postId;

                window.location.href = `create-post.html?editId=${encodeURIComponent(postId)}`;

                return;
            }

            if (menuOption.classList.contains("delete-post")) {
                const post = menuOption.closest(".post");

                if (!post) return;

                if (
                    !window.confirm(
                        "Are you sure you want to delete this post? This cannot be undone."
                    )
                ) {
                    return;
                }

                deletePost(post);
                return;
            }

            if (menuOption.classList.contains("report-post")) {
                const post = menuOption.closest(".post");

                if (post) {
                    const postId = post.dataset.postId;

                    window.location.href = `report-post.html?postId=${encodeURIComponent(postId)}`;
                }
            }
        }
    });

    // Close open menus when clicking elsewhere.
    document.addEventListener("click", (event) => {
        if (event.target.closest(".post-menu, .post-menu-button")) return;

        postsList.querySelectorAll(".post-menu").forEach((menu) => {
            menu.hidden = true;

            const menuButton =
                menu.parentElement.querySelector(".post-menu-button");

            if (menuButton) {
                menuButton.setAttribute("aria-expanded", "false");
            }
        });
    });

    // The Create Post screen will be added in the next step.
    createPostButton.addEventListener("click", () => {
        window.location.href = "create-post.html";
    });

    // Return to the previous page.
    backButton.addEventListener("click", () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = "../index.html";
        }
    });

    // Open or close the comments section.
    postsList.addEventListener("click", (event) => {
        const commentButton = event.target.closest(".comment-button");
        if (!commentButton) return;

        const post = commentButton.closest(".post");
        const commentsSection = post.querySelector(".comments-section");

        if (!commentsSection) return;

        commentsSection.hidden = !commentsSection.hidden;
    });

    // Add, edit and delete comments. Everything is saved in MySQL.
    const COMMENTS_API = "http://127.0.0.1:8080/api/comments";

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

    // Build one comment for the page.
    function createCommentElement(commentData) {
        const comment = document.createElement("div");
        comment.className = "existing-comment";
        comment.dataset.commentId = String(commentData.id);

        const commentAuthor = document.createElement("strong");
        commentAuthor.textContent = `${commentData.author || "Anonymous"}: `;

        const text = document.createElement("span");
        text.className = "comment-text";
        text.textContent = commentData.text || "";

        comment.append(commentAuthor, text);

        // Only show edit and delete on your own comments.
        if (commentData.isOwnComment === true) {
            const commentActions = document.createElement("div");
            commentActions.className = "comment-actions";

            const editCommentButton = document.createElement("button");
            editCommentButton.type = "button";
            editCommentButton.className = "edit-comment";
            editCommentButton.textContent = "Edit";

            const deleteCommentButton = document.createElement("button");
            deleteCommentButton.type = "button";
            deleteCommentButton.className = "delete-comment";
            deleteCommentButton.textContent = "Delete";

            commentActions.append(editCommentButton, deleteCommentButton);
            comment.appendChild(commentActions);
        }

        return comment;
    }

    // Add a new comment.
    postsList.addEventListener("submit", async (event) => {
        const form = event.target.closest(".comment-form");
        if (!form) return;

        event.preventDefault();

        const post = form.closest(".post");
        const input = form.querySelector(".comment-input");
        const submitButton = form.querySelector(".submit-comment");
        const commentsList = post.querySelector(".comments-list");
        const commentText = input.value.trim();

        if (!commentText) return;

        if (commentText.length > 500) {
            window.alert("Your comment cannot exceed 500 characters.");
            return;
        }

        submitButton.disabled = true;

        try {
            const savedComment = await requestJson(
                `${POSTS_API}/${encodeURIComponent(post.dataset.postId)}/comments`,
                {
                    method: "POST",
                    body: JSON.stringify({ content: commentText })
                }
            );

            commentsList.appendChild(createCommentElement(savedComment));

            const count = post.querySelector(".comment-count");

            if (count) {
                count.textContent = String(Number(count.textContent || 0) + 1);
            }

            commentButtonLabel(post);
            form.reset();
        } catch (error) {
            console.error("Could not save comment:", error);
            window.alert(
                error.message ||
                    "Could not save your comment. Please try again."
            );
        } finally {
            submitButton.disabled = false;
        }
    });

    // Edit or delete your own comments.
    postsList.addEventListener("click", async (event) => {
        const editButton = event.target.closest(".edit-comment");
        const deleteButton = event.target.closest(".delete-comment");

        if (!editButton && !deleteButton) return;

        const commentElement = event.target.closest(".existing-comment");
        const post = event.target.closest(".post");

        if (!commentElement || !post) return;

        const commentId = commentElement.dataset.commentId;
        const textElement = commentElement.querySelector(".comment-text");

        // Edit comment.
        if (editButton) {
            const newText = window.prompt(
                "Edit your comment:",
                textElement.textContent
            );

            if (newText === null) return;

            const trimmedText = newText.trim();

            if (!trimmedText) {
                window.alert("A comment cannot be empty.");
                return;
            }

            if (trimmedText.length > 500) {
                window.alert("Your comment cannot exceed 500 characters.");
                return;
            }

            try {
                const updatedComment = await requestJson(
                    `${COMMENTS_API}/${encodeURIComponent(commentId)}`,
                    {
                        method: "PUT",
                        body: JSON.stringify({ content: trimmedText })
                    }
                );

                textElement.textContent = updatedComment.text;
            } catch (error) {
                console.error("Could not edit comment:", error);
                window.alert(
                    error.message ||
                        "Could not edit your comment. Please try again."
                );
            }

            return;
        }

        // Delete comment.
        if (!window.confirm("Are you sure you want to delete this comment?")) {
            return;
        }

        try {
            await requestJson(
                `${COMMENTS_API}/${encodeURIComponent(commentId)}`,
                { method: "DELETE" }
            );

            commentElement.remove();

            const count = post.querySelector(".comment-count");

            if (count) {
                count.textContent = String(
                    Math.max(0, Number(count.textContent || 0) - 1)
                );
            }

            commentButtonLabel(post);
        } catch (error) {
            console.error("Could not delete comment:", error);
            window.alert(
                error.message ||
                    "Could not delete your comment. Please try again."
            );
        }
    });

    function commentButtonLabel(post) {
        const count = post.querySelector(".comment-count");
        const button = post.querySelector(".comment-button");

        if (count && button) {
            button.setAttribute(
                "aria-label",
                `View ${count.textContent} comments`
            );
        }
    }

    let allPosts = [];
    let followedUsers = new Set();
    let activeFeed = "latest";
    let linkedPostHandled = false;

    function setFollowState(button, following) {
        button.textContent = following ? "Following" : "Follow";
        button.classList.toggle("following", following);
        button.setAttribute("aria-pressed", String(following));
    }

    // Follow or unfollow the author of a post.
    postsList.addEventListener("click", async (event) => {
        const followButton = event.target.closest(".follow-button");
        if (!followButton || followButton.disabled) return;

        const post = followButton.closest(".post");
        const username = post && post.dataset.author;
        if (!username) return;

        const isFollowing = followedUsers.has(username);
        followButton.disabled = true;

        try {
            const response = await fetch(
                `${FOLLOWS_API}/${encodeURIComponent(username)}`,
                {
                    method: isFollowing ? "DELETE" : "POST",
                    credentials: "include"
                }
            );

            if (response.status === 401) {
                window.location.href = "login.html";
                return;
            }

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message || "Could not update follow. Please try again."
                );
            }

            if (isFollowing) {
                followedUsers.delete(username);
            } else {
                followedUsers.add(username);
            }

            // Unfollowing inside the Following tab removes their posts.
            if (activeFeed === "following" && isFollowing) {
                renderPosts();
                return;
            }

            postsList.querySelectorAll(".post").forEach((element) => {
                if (element.dataset.author === username) {
                    const button = element.querySelector(".follow-button");

                    if (button) {
                        setFollowState(button, !isFollowing);
                    }
                }
            });
        } catch (error) {
            console.error("Could not update follow:", error);
            window.alert(
                error.message || "Could not update follow. Please try again."
            );
        } finally {
            followButton.disabled = false;
        }
    });

    // Following: only people you follow. Top: most liked first.
    function getFeedPosts() {
        // Latest: newest posts first.
        if (activeFeed === "latest") {
            return [...allPosts].sort(
                (a, b) =>
                    (parseCreatedAt(b.createdAt) || 0) -
                    (parseCreatedAt(a.createdAt) || 0)
            );
        }

        if (activeFeed === "following") {
            return allPosts.filter((post) => followedUsers.has(post.author));
        }

        return [...allPosts].sort((a, b) => {
            const likeDifference = (b.likes || 0) - (a.likes || 0);

            if (likeDifference !== 0) return likeDifference;

            return (
                (parseCreatedAt(b.createdAt) || 0) -
                (parseCreatedAt(a.createdAt) || 0)
            );
        });
    }

    // Scroll to and highlight a post opened from a notification.
    function scrollToLinkedPost() {
        if (linkedPostHandled) return;
        linkedPostHandled = true;

        const match = window.location.hash.match(/^#post-(\d+)$/);
        if (!match) return;

        const target = document.getElementById(`post-${match[1]}`);
        if (!target) return;

        target.scrollIntoView({ behavior: "smooth", block: "center" });
        target.classList.add("post-highlight");

        setTimeout(() => target.classList.remove("post-highlight"), 3000);
    }

    // Load posts and followed users from the MySQL backend.
    async function loadSavedPosts() {
        try {
            const response = await fetch("http://127.0.0.1:8080/api/posts", {
                method: "GET",
                credentials: "include"
            });

            if (response.status === 401) {
                window.location.href = "login.html";
                return;
            }

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message || "Could not load community posts."
                );
            }

            allPosts = Array.isArray(data) ? data : [];

            const followResponse = await fetch(FOLLOWS_API, {
                credentials: "include"
            });

            if (followResponse.ok) {
                const names = await followResponse.json().catch(() => []);
                followedUsers = new Set(Array.isArray(names) ? names : []);
            }
        } catch (error) {
            console.error("Could not load posts from the backend:", error);
            postsList.textContent =
                "Could not load posts. Please check your connection and try again.";
            return;
        }

        renderPosts();
    }

    function renderPosts() {
        postsList.replaceChildren();

        const savedPosts = getFeedPosts();

        if (savedPosts.length === 0) {
            const empty = document.createElement("p");
            empty.className = "feed-empty";
            empty.textContent = activeFeed === "following"
                ? "No posts from people you follow yet. Tap Follow on a post to see their updates here."
                : "No posts yet. Be the first to share something.";
            postsList.append(empty);
            return;
        }

        savedPosts.forEach((post) => {
            const article = document.createElement("article");
            article.className = "post";
            article.id = `post-${post.id}`;
            article.dataset.postId = post.id;
            article.dataset.author = post.author || "";

            const header = document.createElement("div");
            header.className = "post-header";

            const author = document.createElement("div");
            author.className = "post-author";

            const avatar = document.createElement("div");
            avatar.className = "avatar";
            avatar.setAttribute("aria-hidden", "true");
            avatar.textContent = "●";

            const authorDetails = document.createElement("div");
            authorDetails.className = "author-details";

            const name = document.createElement("h2");
            name.textContent = post.author || "Anonymous";

            const time = document.createElement("time");
            const createdAt = parseCreatedAt(post.createdAt);

            if (createdAt) {
                time.dateTime = createdAt.toISOString();
                time.textContent = formatTimeAgo(createdAt);
            } else {
                time.textContent = "";
            }

            authorDetails.append(name, time);

            if (post.isOwnPost !== true && post.author) {
                const followButton = document.createElement("button");
                followButton.type = "button";
                followButton.className = "follow-button";
                setFollowState(followButton, followedUsers.has(post.author));
                authorDetails.append(followButton);
            }

            author.append(avatar, authorDetails);

            const menuButton = document.createElement("button");
            menuButton.className = "post-menu-button";
            menuButton.setAttribute("aria-label", "Post options");
            menuButton.setAttribute("aria-expanded", "false");
            menuButton.textContent = "•••";

            const menu = document.createElement("div");
            menu.className = "post-menu";
            menu.hidden = true;

            // Edit post button
            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.className = "edit-post";
            editButton.textContent = "Edit post";

            // Delete post button
            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "delete-post";
            deleteButton.textContent = "Delete post";

            // Report post button
            const reportButton = document.createElement("button");
            reportButton.type = "button";
            reportButton.className = "report-post";
            reportButton.textContent = "Report post";

            // Only show edit and delete for the user's own posts.
            const isOwnPost = post.isOwnPost === true;
            editButton.hidden = !isOwnPost;
            deleteButton.hidden = !isOwnPost;

            menu.append(editButton, deleteButton, reportButton);

            header.append(author, menuButton, menu);

            const topic = document.createElement("p");
            topic.className = "post-topic";
            topic.textContent = post.topic;

            const content = document.createElement("p");
            content.className = "post-content";

            if (post.hasTriggerWarning && post.triggerWarning) {
                const warning = document.createElement("p");
                warning.className = "post-warning";
                warning.textContent = "Content warning: " + post.triggerWarning;
                article.append(header, topic, warning);
            } else {
                article.append(header, topic);
            }

            content.textContent = post.content;
            article.append(content);

            const actions = document.createElement("div");
            actions.className = "post-actions";

            const likeButton = document.createElement("button");
            likeButton.className = "like-button";
            likeButton.setAttribute("aria-label", "Like post");
            likeButton.setAttribute("aria-pressed", "false");

            const heart = document.createElement("span");
            heart.className = "heart-icon";
            heart.setAttribute("aria-hidden", "true");
            heart.textContent = "♥";

            const likeCount = document.createElement("span");
            likeCount.className = "like-count";
            likeCount.textContent = String(post.likes || 0);
            likeButton.append(heart, likeCount);
            setLikeState(
                likeButton,
                post.likedByCurrentUser === true,
                post.likes || 0
            );

            const commentButton = document.createElement("button");
            commentButton.className = "comment-button";
            commentButton.setAttribute("aria-label", "View comments");

            const commentIcon = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "svg"
            );
            commentIcon.setAttribute("viewBox", "0 0 48 48");
            commentIcon.setAttribute("aria-hidden", "true");

            const commentPath = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "path"
            );
            commentPath.setAttribute("d", "M5 7 H43 V34 H25 L14 44 V34 H5 Z");
            commentPath.setAttribute("fill", "currentColor");
            commentIcon.append(commentPath);

            const commentCount = document.createElement("span");
            commentCount.className = "comment-count";
            commentCount.textContent = String(
                Array.isArray(post.comments) ? post.comments.length : 0
            );

            commentButton.append(commentIcon, commentCount);

            const bookmarkButton = document.createElement("button");
            bookmarkButton.className = "bookmark-button";
            bookmarkButton.setAttribute("aria-label", "Bookmark post");
            bookmarkButton.setAttribute("aria-pressed", "false");

            const bookmarkIcon = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "svg"
            );
            bookmarkIcon.setAttribute("viewBox", "0 0 40 48");
            bookmarkIcon.setAttribute("aria-hidden", "true");

            const bookmarkPath = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "path"
            );
            bookmarkPath.setAttribute("d", "M5 3 H35 V44 L20 29 L5 44 Z");
            bookmarkPath.setAttribute("fill", "none");
            bookmarkPath.setAttribute("stroke", "currentColor");
            bookmarkPath.setAttribute("stroke-width", "2");

            bookmarkIcon.append(bookmarkPath);
            bookmarkButton.append(bookmarkIcon);
            setBookmarkState(bookmarkButton, post.bookmarked === true);

            actions.append(likeButton, commentButton, bookmarkButton);
            article.append(actions);

            // Automatically create a comments section for this post.
            const commentsSection = document.createElement("div");
            commentsSection.className = "comments-section";
            commentsSection.hidden = true;

            const commentsList = document.createElement("div");
            commentsList.className = "comments-list";

            // Display comments already saved for this post.
            (Array.isArray(post.comments) ? post.comments : []).forEach(
                (savedComment) => {
                    commentsList.appendChild(
                        createCommentElement(savedComment)
                    );
                }
            );

            const commentForm = document.createElement("form");
            commentForm.className = "comment-form";

            const commentLabel = document.createElement("label");
            commentLabel.htmlFor = `comment-input-${post.id}`;
            commentLabel.textContent = "Add a comment";

            const commentInput = document.createElement("textarea");
            commentInput.id = `comment-input-${post.id}`;
            commentInput.className = "comment-input";
            commentInput.placeholder = "Share a supportive response...";
            commentInput.rows = 2;
            commentInput.required = true;

            const submitComment = document.createElement("button");
            submitComment.type = "submit";
            submitComment.className = "submit-comment";
            submitComment.textContent = "Comment";

            commentForm.append(commentLabel, commentInput, submitComment);

            commentsSection.append(commentsList, commentForm);
            article.append(commentsSection);

            // Add each post in the order chosen by the active tab.
            postsList.append(article);
        });

        scrollToLinkedPost();
    }

    loadSavedPosts();
});

// Show the number of unread notifications on the bell link.
document.addEventListener("DOMContentLoaded", async () => {
    const badge = document.getElementById("notificationBadge");
    if (!badge) return;

    try {
        const response = await fetch(
            "http://127.0.0.1:8080/api/notifications/unread-count",
            { credentials: "include" }
        );

        if (!response.ok) return;

        const data = await response.json();
        const count = Number(data.count) || 0;

        badge.textContent = count > 99 ? "99+" : String(count);
        badge.hidden = count === 0;
    } catch (error) {
        console.error("Could not load unread notifications:", error);
    }
});