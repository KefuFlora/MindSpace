const flaggedPostsContainer =
    document.getElementById("flaggedPostsContainer");


async function loadFlaggedPosts() {

    try {

        const response = await fetch(
            "http://localhost:8080/api/flagged-posts"
        );


        if (!response.ok) {

            throw new Error(
                "Failed to load flagged posts."
            );

        }


        const posts = await response.json();


        flaggedPostsContainer.innerHTML = "";


        if (posts.length === 0) {

            flaggedPostsContainer.innerHTML = `
                <p>No flagged posts found.</p>
            `;

            return;
        }


        posts.forEach(post => {

            const article =
                document.createElement("article");


            article.className = "flagged-card";


            const postNumber =
                post.postId.replace("post", "");


            article.innerHTML = `

                <div class="flagged-card-header">

                    <div>

                        <h3>
                            Post #${postNumber}
                        </h3>

                        <span class="status pending">
                            ${post.status}
                        </span>

                    </div>


                    <span class="flagged-date">
                        ${post.flaggedDate}
                    </span>

                </div>


                <div class="flagged-card-body">

                    <p class="post-preview">
                        "${post.postContent}"
                    </p>


                    <div class="flag-information">

                        <strong>
                            Report Reason:
                        </strong>

                        <span>
                            ${post.reportReason}
                        </span>

                    </div>

                </div>


                <div class="flagged-card-actions">

                    <a
                        href="./review.html?id=${post.postId}&type=post"
                        class="review-button"
                    >
                        Review Content
                    </a>

                </div>

            `;


            flaggedPostsContainer.appendChild(article);

        });


    } catch (error) {

        console.error(
            "Error loading flagged posts:",
            error
        );


        flaggedPostsContainer.innerHTML = `

            <p>
                Unable to load flagged posts.
                Please try again later.
            </p>

        `;

    }

}


loadFlaggedPosts();