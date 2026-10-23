// Fills in the live numbers on the moderator dashboard.
document.addEventListener("DOMContentLoaded", async () => {
    const numbers = document.querySelectorAll(".stat-card p");

    if (numbers.length < 4) {
        return;
    }

    // The "Review Content" card used a sample id, so send it to the list.
    document
        .querySelectorAll('.menu-card[href^="review.html"]')
        .forEach((link) => link.setAttribute("href", "flagged-post.html"));

    try {
        const [posts, comments, notifications] = await Promise.all([
            staffFetch("/flagged?type=posts"),
            staffFetch("/flagged?type=comments"),
            staffFetch("/notifications")
        ]);

        numbers[0].textContent = String(posts.length);
        numbers[1].textContent = String(comments.length);
        numbers[2].textContent = String(posts.length + comments.length);
        numbers[3].textContent = String(
            notifications.filter((item) => !item.is_read).length
        );
    } catch (error) {
        console.error("Could not load dashboard numbers:", error);
    }
});