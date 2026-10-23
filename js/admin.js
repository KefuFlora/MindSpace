document.addEventListener("DOMContentLoaded", () => {
    const API_BASE = "http://127.0.0.1:8080/api/admin";

    const reportList = document.getElementById("reportList");
    const reportTabs = document.getElementById("reportTabs");
    const adminMessage = document.getElementById("adminMessage");

    let reports = [];
    let activeFilter = "pending";

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
            const error = new Error(
                data.message || "Something went wrong. Please try again."
            );
            error.status = response.status;
            throw error;
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

    function createButton(label, className, action) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = className;
        button.textContent = label;
        button.addEventListener("click", action);
        return button;
    }

    function addLine(parent, text, className = "") {
        const line = document.createElement("p");
        line.textContent = text;

        if (className) {
            line.className = className;
        }

        parent.appendChild(line);
        return line;
    }

    // Ask for confirmation, send the change, then reload the reports.
    async function runAction(confirmMessage, url) {
        if (!window.confirm(confirmMessage)) return;

        adminMessage.textContent = "";

        try {
            const result = await requestJson(url, { method: "PUT" });
            await loadReports();

            if (result && result.message) {
                adminMessage.textContent = result.message;
            }
        } catch (error) {
            console.error("Could not complete the action:", error);
            window.alert(
                error.message || "Something went wrong. Please try again."
            );
        }
    }

    function hidePost(postId) {
        return runAction(
            "Remove this post from the feed? You can restore it later.",
            `${API_BASE}/posts/${encodeURIComponent(postId)}/hide`
        );
    }

    function restorePost(postId) {
        return runAction(
            "Show this post in the feed again?",
            `${API_BASE}/posts/${encodeURIComponent(postId)}/restore`
        );
    }

    function dismissReport(reportId) {
        return runAction(
            "Dismiss this report? The post will stay in the feed.",
            `${API_BASE}/reports/${encodeURIComponent(reportId)}/dismiss`
        );
    }

    function createReportCard(report) {
        const card = document.createElement("article");
        card.className = "activity-card";

        const top = document.createElement("div");
        top.className = "report-top";

        const heading = document.createElement("h3");
        heading.textContent = report.reason;

        const badge = document.createElement("span");
        const status = String(report.status || "").toLowerCase();
        badge.className = `status-badge status-${status}`;
        badge.textContent = status.charAt(0).toUpperCase() + status.slice(1);

        top.append(heading, badge);

        const content = document.createElement("div");
        content.className = "reported-content";

        if (report.postHidden) {
            addLine(
                content,
                "This post is currently hidden from the feed.",
                "post-hidden-note"
            );
        }

        addLine(content, `Post by ${report.postAuthor} · ${report.postTopic}`);
        addLine(content, report.postContent);

        card.append(top, content);

        if (report.details) {
            addLine(card, `Reporter's note: ${report.details}`);
        }

        const reviewed = report.reviewedAt
            ? ` · Reviewed ${formatDate(report.reviewedAt)}`
            : "";

        addLine(
            card,
            `Reported by ${report.reporter} on ${formatDate(report.createdAt)}${reviewed}`,
            "activity-meta"
        );

        const actions = document.createElement("div");
        actions.className = "admin-actions";

        if (report.postHidden) {
            actions.appendChild(
                createButton("Restore post", "neutral-button", () =>
                    restorePost(report.postId)
                )
            );
        } else {
            actions.appendChild(
                createButton("Remove post", "danger-button", () =>
                    hidePost(report.postId)
                )
            );
        }

        if (report.status === "PENDING") {
            actions.appendChild(
                createButton("Dismiss report", "neutral-button", () =>
                    dismissReport(report.id)
                )
            );
        }

        card.appendChild(actions);

        return card;
    }

    function updateTabs() {
        const counts = {
            pending: reports.filter((r) => r.status === "PENDING").length,
            resolved: reports.filter((r) => r.status === "RESOLVED").length,
            dismissed: reports.filter((r) => r.status === "DISMISSED").length,
            all: reports.length
        };

        const names = {
            pending: "Pending",
            resolved: "Resolved",
            dismissed: "Dismissed",
            all: "All"
        };

        reportTabs.querySelectorAll("button").forEach((button) => {
            const filter = button.dataset.filter;
            const selected = filter === activeFilter;

            button.textContent = `${names[filter]} (${counts[filter]})`;
            button.classList.toggle("active", selected);
            button.setAttribute("aria-pressed", String(selected));
        });
    }

    function showEmptyMessage(text) {
        const message = document.createElement("p");
        message.className = "empty-activity";
        message.textContent = text;
        reportList.replaceChildren(message);
    }

    function renderReports() {
        updateTabs();

        const visible = reports.filter(
            (report) =>
                activeFilter === "all" ||
                report.status.toLowerCase() === activeFilter
        );

        if (visible.length === 0) {
            const messages = {
                pending: "No reports are waiting for review.",
                resolved: "No resolved reports yet.",
                dismissed: "No dismissed reports yet.",
                all: "No reports have been submitted yet."
            };

            showEmptyMessage(messages[activeFilter]);
            return;
        }

        reportList.replaceChildren(...visible.map(createReportCard));
    }

    async function loadReports() {
        reports = await requestJson(`${API_BASE}/reports`);
        renderReports();
    }

    reportTabs.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-filter]");
        if (!button) return;

        activeFilter = button.dataset.filter;
        renderReports();
    });

    async function start() {
        try {
            await requestJson(`${API_BASE}/check`);
        } catch (error) {
            reportTabs.hidden = true;

            if (error.status === 403) {
                showEmptyMessage(
                    "You do not have access to this page. Only moderators can review reports."
                );
            } else {
                console.error("Could not check access:", error);
                showEmptyMessage(
                    "Could not load this page. Please check that the backend is running."
                );
            }

            return;
        }

        try {
            await loadReports();
        } catch (error) {
            console.error("Could not load reports:", error);
            showEmptyMessage("Could not load reports. Please try again.");
        }
    }

    start();
});