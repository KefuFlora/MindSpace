document.addEventListener("DOMContentLoaded", function () {

    const approveButton =
        document.getElementById("approveButton");

    const removeButton =
        document.getElementById("removeButton");

    const actionMessage =
        document.getElementById("actionMessage");

    const contentTitle =
        document.getElementById("contentTitle");

    const contentTypeDisplay =
        document.getElementById("contentType");

    const contentIdDisplay =
        document.getElementById("contentId");

    const reportReasonDisplay =
        document.getElementById("reportReason");

    const reportedContentDisplay =
        document.getElementById("reportedContent");


    // Get information from the URL
    const urlParams =
        new URLSearchParams(window.location.search);

    const contentId =
        urlParams.get("id");

    const contentType =
        urlParams.get("type");


    // Sample flagged posts
    const flaggedPosts = {

        post001: {
            type: "Post",
            reason: "Inappropriate content",
            content:
                "I've been struggling with the amount of academic pressure I'm experiencing this semester..."
        },

        post002: {
            type: "Post",
            reason: "Harassment",
            content:
                "Has anyone else experienced problems with students being disrespectful during group projects?"
        },

        post003: {
            type: "Post",
            reason: "Off-topic content",
            content:
                "I don't think this discussion belongs in the student support community..."
        }

    };


    // Sample flagged comments
    const flaggedComments = {

        comment001: {
            type: "Comment",
            reason: "Inappropriate language",
            content:
                "I completely understand what you're going through. You're definitely not alone in dealing with university pressure."
        },

        comment002: {
            type: "Comment",
            reason: "Harassment",
            content:
                "You should stop complaining and just work harder like everyone else."
        },

        comment003: {
            type: "Comment",
            reason: "Spam",
            content:
                "This is a university support forum. I don't think advertisements belong here."
        }

    };


    // Select the correct content collection
    let selectedContent = null;

    if (contentType === "post") {

        selectedContent =
            flaggedPosts[contentId];

    } else if (contentType === "comment") {

        selectedContent =
            flaggedComments[contentId];

    }


    // Display selected content
    if (selectedContent) {

        const displayId =
            contentId
                .replace("post", "Post #")
                .replace("comment", "Comment #");


        contentTitle.textContent =
            "Review " + displayId;


        contentIdDisplay.textContent =
            displayId;


        contentTypeDisplay.textContent =
            selectedContent.type;


        reportReasonDisplay.textContent =
            selectedContent.reason;


        reportedContentDisplay.textContent =
            '"' + selectedContent.content + '"';

    } else {

        contentTitle.textContent =
            "Review Content";


        contentIdDisplay.textContent =
            "No content selected";


        contentTypeDisplay.textContent =
            contentType || "Unknown";


        reportReasonDisplay.textContent =
            "No report information available";


        reportedContentDisplay.textContent =
            "Please return to the flagged content list and select content to review.";

    }


    // Approve Content
    approveButton.addEventListener(
        "click",
        function () {

            const confirmed =
                confirm(
                    "Are you sure you want to approve this content?"
                );


            if (!confirmed) {
                return;
            }


            actionMessage.textContent =
                "Content has been approved successfully.";


            actionMessage.className =
                "action-message success";


            approveButton.disabled = true;

            removeButton.disabled = true;

        }
    );


    // Remove Content
    removeButton.addEventListener(
        "click",
        function () {

            const confirmed =
                confirm(
                    "Are you sure you want to remove this content?"
                );


            if (!confirmed) {
                return;
            }


            actionMessage.textContent =
                "Content has been removed successfully.";


            actionMessage.className =
                "action-message removed";


            approveButton.disabled = true;

            removeButton.disabled = true;

        }
    );

});