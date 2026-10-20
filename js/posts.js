
document.addEventListener("DOMContentLoaded", () => {
    const feedTabs = document.querySelectorAll(".tab-button");
    const postsList = document.getElementById("postsList");
    const createPostButton = document.getElementById("createPostButton");
    const backButton = document.getElementById("backButton");

    // Switch between Top and Following tabs.
    // Actual feed filtering will use account data once the backend exists.
    feedTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            feedTabs.forEach((otherTab) => {
                const isActive = otherTab === tab;

                otherTab.classList.toggle("active", isActive);
                otherTab.setAttribute("aria-pressed", String(isActive));
            });
        });
    });
   
    // Like/unlike and save the changes.
    postsList.addEventListener("click", (event) => {
        const likeButton = event.target.closest(".like-button");
        if (!likeButton) return;

        const post = likeButton.closest(".post");
        const postId = post.dataset.postId;

        const isLiked =
            likeButton.getAttribute("aria-pressed") === "true";

        const nextLiked = !isLiked;
        const countElement = likeButton.querySelector(".like-count");

        if (!countElement) return;

        const currentCount = Number(countElement.textContent) || 0;
        const nextCount = Math.max(
            0,
            currentCount + (nextLiked ? 1 : -1)
        );

        // Update the interface.
        countElement.textContent = nextCount;
        likeButton.setAttribute("aria-pressed", String(nextLiked));
        likeButton.classList.toggle("liked", nextLiked);
        likeButton.setAttribute(
            "aria-label",
            nextLiked ? "Unlike post" : "Like post"
        );

        // Save likes for posts created through the form.
        try {
            const savedPosts = JSON.parse(
                localStorage.getItem("mindspacePosts") || "[]"
            );

            const savedPost = savedPosts.find(
                item => String(item.id) === String(postId)
            );

            if (savedPost) {
                savedPost.likes = nextCount;
                savedPost.liked = nextLiked;

                localStorage.setItem(
                    "mindspacePosts",
                    JSON.stringify(savedPosts)
                );
            }
        } catch (error) {
            console.error("Could not save like:", error);
        }
    });


    
    // Bookmark/unbookmark.
postsList.addEventListener("click", (event) => {
    const bookmarkButton = event.target.closest(".bookmark-button");
    if (!bookmarkButton) return;

    const post = bookmarkButton.closest(".post");
    if (!post || !post.dataset.postId) return;

    const postId = String(post.dataset.postId);
    const isBookmarked =
        bookmarkButton.getAttribute("aria-pressed") === "true";

    const nextBookmarked = !isBookmarked;

    bookmarkButton.setAttribute(
        "aria-pressed",
        String(nextBookmarked)
    );
    bookmarkButton.classList.toggle("bookmarked", nextBookmarked);
    bookmarkButton.setAttribute(
        "aria-label",
        nextBookmarked ? "Remove bookmark" : "Bookmark post"
    );

    const icon = bookmarkButton.querySelector("path");
    if (icon) {
        icon.setAttribute(
            "fill",
            nextBookmarked ? "currentColor" : "none"
        );
    }

    try {
        const savedBookmarks = JSON.parse(
            localStorage.getItem("mindspaceBookmarks") || "[]"
        );

        const bookmarks = Array.isArray(savedBookmarks)
            ? savedBookmarks.map(String)
            : [];

        const updatedBookmarks = nextBookmarked
            ? [...new Set([...bookmarks, postId])]
            : bookmarks.filter(id => id !== postId);

        localStorage.setItem(
            "mindspaceBookmarks",
            JSON.stringify(updatedBookmarks)
        );
    } catch (error) {
        console.error("Could not save bookmark:", error);
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

    window.location.href =
        `create-post.html?editId=${encodeURIComponent(postId)}`;

    return;
}

            if (menuOption.classList.contains("delete-post")) {
    const post = menuOption.closest(".post");

    if (!post) return;

    const postId = String(post.dataset.postId);

    if (!window.confirm(
        "Are you sure you want to delete this post? This cannot be undone."
    )) {
        return;
    }

    try {
        const savedPosts = JSON.parse(
            localStorage.getItem("mindspacePosts") || "[]"
        );

        const updatedPosts = Array.isArray(savedPosts)
            ? savedPosts.filter(
                item => String(item.id) !== postId
            )
            : [];

        localStorage.setItem(
            "mindspacePosts",
            JSON.stringify(updatedPosts)
        );

        const savedBookmarks = JSON.parse(
            localStorage.getItem("mindspaceBookmarks") || "[]"
        );

        const updatedBookmarks = Array.isArray(savedBookmarks)
            ? savedBookmarks.filter(
                id => String(id) !== postId
            )
            : [];

        localStorage.setItem(
            "mindspaceBookmarks",
            JSON.stringify(updatedBookmarks)
        );

        post.remove();
    } catch (error) {
        console.error("Could not delete post:", error);
        window.alert("Could not delete the post. Please try again.");
    }

    return;
}

            if (menuOption.classList.contains("report-post")) {
    const post = menuOption.closest(".post");

    if (post) {
        const postId = post.dataset.postId;

        window.location.href =
            `report-post.html?postId=${encodeURIComponent(postId)}`;
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

   
// Add and save comments.
postsList.addEventListener("submit", (event) => {
    const form = event.target.closest(".comment-form");
    if (!form) return;

    event.preventDefault();

    const post = form.closest(".post");
    const input = form.querySelector(".comment-input");
    const commentsList = post.querySelector(".comments-list");
    const commentText = input.value.trim();

    if (!commentText) return;

    // Display the new comment.
    const comment = document.createElement("p");
    comment.className = "existing-comment";

    const author = document.createElement("strong");
    author.textContent = "You: ";

    comment.appendChild(author);
    comment.appendChild(document.createTextNode(commentText));

    commentsList.appendChild(comment);

    // Update the comment count.
    const count = post.querySelector(".comment-count");

    if (count) {
        count.textContent = Number(count.textContent || 0) + 1;
    }

    // Save the comment to the correct post.
    const postId = post.dataset.postId;

    try {
        const savedPosts = JSON.parse(
            localStorage.getItem("mindspacePosts") || "[]"
        );

        const matchingPost = savedPosts.find(
            savedPost => String(savedPost.id) === String(postId)
        );

        if (matchingPost) {
            if (!Array.isArray(matchingPost.comments)) {
                matchingPost.comments = [];
            }

            matchingPost.comments.push({
                id: Date.now().toString(),
                author: "You",
                text: commentText,
                createdAt: new Date().toISOString()
            });

            localStorage.setItem(
                "mindspacePosts",
                JSON.stringify(savedPosts)
            );
        }
    } catch (error) {
        console.error("Could not save comment:", error);
    }

    // Update accessibility label.
    if (count) {
        post.querySelector(".comment-button").setAttribute(
            "aria-label",
            `View ${count.textContent} comments`
        );
    }

    form.reset();
});

    // Edit or delete your own comments.
    postsList.addEventListener("click", (event) => {
        const editButton = event.target.closest(".edit-comment");
        const deleteButton = event.target.closest(".delete-comment");

        if (!editButton && !deleteButton) return;

        const commentElement = event.target.closest(".existing-comment");
        const post = event.target.closest(".post");

        if (!commentElement || !post) return;

        const postId = String(post.dataset.postId);
        const commentId = commentElement.dataset.commentId;

        let savedPosts;

        try {
            savedPosts = JSON.parse(
                localStorage.getItem("mindspacePosts") || "[]"
            );

            if (!Array.isArray(savedPosts)) {
                throw new Error("Saved posts are not in the expected format.");
            }
        } catch (error) {
            console.error("Could not load saved comments:", error);
            window.alert("Could not access your saved comments. Please try again.");
            return;
        }

        const matchingPost = savedPosts.find(
            item => String(item.id) === postId
        );

        if (!matchingPost || !Array.isArray(matchingPost.comments)) {
            window.alert("These comments cannot be edited or deleted.");
            return;
        }

        const commentIndex = commentId.startsWith("legacy-")
            ? Number(commentId.replace("legacy-", ""))
            : matchingPost.comments.findIndex(
                item => String(item.id) === commentId
            );

        if (
            !Number.isInteger(commentIndex) ||
            commentIndex < 0 ||
            commentIndex >= matchingPost.comments.length
        ) {
            window.alert("Could not find this comment. Please refresh the feed.");
            return;
        }

        const savedComment = matchingPost.comments[commentIndex];

        // Edit comment.
        if (editButton) {
            const oldText = typeof savedComment === "string"
                ? savedComment
                : savedComment.text || "";

            const newText = window.prompt("Edit your comment:", oldText);

            if (newText === null) return;

            if (!newText.trim()) {
                window.alert("A comment cannot be empty.");
                return;
            }

            if (typeof savedComment === "string") {
                matchingPost.comments[commentIndex] = {
                    id: commentId,
                    author: "You",
                    text: newText.trim(),
                    createdAt: new Date().toISOString()
                };
            } else {
                matchingPost.comments[commentIndex] = {
                    ...savedComment,
                    text: newText.trim()
                };
            }

            commentElement.querySelector(".comment-text").textContent =
                newText.trim();
        }

        // Delete comment.
        if (deleteButton) {
            if (!window.confirm("Are you sure you want to delete this comment?")) {
                return;
            }

            matchingPost.comments.splice(commentIndex, 1);
            commentElement.remove();

            const count = post.querySelector(".comment-count");

            if (count) {
                count.textContent = Math.max(
                    0,
                    Number(count.textContent || 0) - 1
                );
            }

            commentButtonLabel(post);
        }

        try {
            localStorage.setItem(
                "mindspacePosts",
                JSON.stringify(savedPosts)
            );
        } catch (error) {
            console.error("Could not save comment changes:", error);
            window.alert("Your changes could not be saved. Please refresh the feed.");
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

    // Display posts created through the Create Post page.
    function loadSavedPosts() {
        let savedPosts = [];

        try {
            savedPosts = JSON.parse(
                localStorage.getItem("mindspacePosts") || "[]"
            );

            if (!Array.isArray(savedPosts)) {
                savedPosts = [];
            }
        } catch (error) {
            console.error("Could not load saved posts:", error);
            return;
        }

        savedPosts.forEach((post) => {
            // Prevent the same post from being added twice.
            if (postsList.querySelector(
                `[data-post-id="${post.id}"]`
            )) {
                return;
            }

            const article = document.createElement("article");
            article.className = "post";
            article.dataset.postId = post.id;

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
            time.textContent = "Just now";

            authorDetails.append(name, time);
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
const isOwnPost = post.author === "You";
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

            const commentButton = document.createElement("button");
            commentButton.className = "comment-button";
            commentButton.setAttribute("aria-label", "View comments");

            const commentIcon = document.createElementNS(
                "http://www.w3.org/2000/svg", "svg"
            );
            commentIcon.setAttribute("viewBox", "0 0 48 48");
            commentIcon.setAttribute("aria-hidden", "true");

            const commentPath = document.createElementNS(
                "http://www.w3.org/2000/svg", "path"
            );
            commentPath.setAttribute(
                "d", "M5 7 H43 V34 H25 L14 44 V34 H5 Z"
            );
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
                "http://www.w3.org/2000/svg", "svg"
            );
            bookmarkIcon.setAttribute("viewBox", "0 0 40 48");
            bookmarkIcon.setAttribute("aria-hidden", "true");

            const bookmarkPath = document.createElementNS(
                "http://www.w3.org/2000/svg", "path"
            );
            bookmarkPath.setAttribute(
                "d", "M5 3 H35 V44 L20 29 L5 44 Z"
            );
            bookmarkPath.setAttribute("fill", "none");
            bookmarkPath.setAttribute("stroke", "currentColor");
            bookmarkPath.setAttribute("stroke-width", "2");

            bookmarkIcon.append(bookmarkPath);
            bookmarkButton.append(bookmarkIcon);

            
actions.append(likeButton, commentButton, bookmarkButton);
article.append(actions);

// Automatically create a comments section for this post.
const commentsSection = document.createElement("div");
commentsSection.className = "comments-section";
commentsSection.hidden = true;

const commentsList = document.createElement("div");
commentsList.className = "comments-list";


    // Display comments already saved for this post.
    const existingComments = Array.isArray(post.comments)
        ? post.comments
        : [];

    existingComments.forEach((savedComment, index) => {
        const isOldComment = typeof savedComment === "string";

        const commentData = isOldComment
            ? {
                id: `legacy-${index}`,
                author: "You",
                text: savedComment
            }
            : savedComment;

        const comment = document.createElement("div");
        comment.className = "existing-comment";
        comment.dataset.commentId = String(commentData.id || `legacy-${index}`);

        const author = document.createElement("strong");
        author.textContent = `${commentData.author || "You"}: `;

        const text = document.createElement("span");
        text.className = "comment-text";
        text.textContent = commentData.text || "";

        comment.append(author, text);

        // Only show comment controls for your own comments.
        if (commentData.author === "You" || isOldComment) {
            const actions = document.createElement("div");
            actions.className = "comment-actions";

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.className = "edit-comment";
            editButton.textContent = "Edit";

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "delete-comment";
            deleteButton.textContent = "Delete";

            actions.append(editButton, deleteButton);
            comment.appendChild(actions);
        }

        commentsList.appendChild(comment);
    });

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

commentForm.append(
    commentLabel,
    commentInput,
    submitComment
);

commentsSection.append(commentsList, commentForm);
article.append(commentsSection);

// Insert new posts at the top of the feed.
postsList.prepend(article);

        });
    }

    loadSavedPosts();
    function restoreBookmarks() {
    try {
        const bookmarks = JSON.parse(
            localStorage.getItem("mindspaceBookmarks") || "[]"
        );

        const savedIds = new Set(
            Array.isArray(bookmarks) ? bookmarks.map(String) : []
        );

        document.querySelectorAll("#postsList .post").forEach(post => {
            const button = post.querySelector(".bookmark-button");
            if (!button) return;

            const isBookmarked = savedIds.has(
                String(post.dataset.postId)
            );

            button.setAttribute("aria-pressed", String(isBookmarked));
            button.classList.toggle("bookmarked", isBookmarked);
            button.setAttribute(
                "aria-label",
                isBookmarked ? "Remove bookmark" : "Bookmark post"
            );

            const icon = button.querySelector("path");
            if (icon) {
                icon.setAttribute(
                    "fill",
                    isBookmarked ? "currentColor" : "none"
                );
            }
        });
    } catch (error) {
        console.error("Could not restore bookmarks:", error);
    }
}

restoreBookmarks();

});
