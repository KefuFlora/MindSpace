# MindSpace

A web-based wellness support platform that helps university students handle stress, academic pressure and everyday challenges in a safe, supportive space.

## Features

**Members**
- Register, log in and manage a profile (bio, interests)
- Share posts with topics and optional content warnings
- Like, comment, bookmark and follow other members
- Feed tabs: Latest, Top (by likes) and Following
- Notifications for likes, replies and moderator decisions
- Report posts and comments
- Light and dark mode

**Moderators**
- See the queue of reported and auto-flagged posts and comments
- Approve or remove content, with an optional note the author sees
- Moderation history and notifications

**Administrators**
- Everything moderators can do
- Dashboard statistics
- Manage users: add, change roles, turn accounts on or off
- See every moderator's activity and restore removed content
- Audit log of staff actions
- System settings: site name, sign-ups on or off, maintenance mode and auto-flag words

## How it works

One Spring Boot backend serves all three areas:

| Area | Where | Login |
| --- | --- | --- |
| Member site | `pages/` (open with Live Server, port 5500) | Session cookie |
| Moderator pages | `moderator/pages/` (Live Server, port 5500) | Staff token (JWT) |
| Admin dashboard | http://localhost:8080/admin/ | Staff token (JWT) |

Reporting a post or comment, or posting a word on the auto-flag list, puts it in the moderators' queue. Staff are notified. Removed content disappears from the site for everyone.

## Tech stack

- Java 21, Spring Boot 4.1.1, Spring Data JPA (Hibernate), JDBC
- MySQL
- JWT (jjwt 0.12.6) for staff, sessions for members, BCrypt for passwords
- Plain HTML, CSS and JavaScript on the front end

## Project structure

MindSpace/
├── pages/                      Member pages
├── js/  css/  assets/          Member scripts, styles and images
├── moderator/                  Moderator pages (pages, js, css)
├── index.html                  Landing page
└── mindspace-backend/mindspace-backend/
    ├── pom.xml
    └── src/main/
        ├── java/mindspace_backend/       Controllers, entities, services
        └── resources/
            ├── application.properties
            └── static/admin/             Admin dashboard (served at /admin/)


## Setup

### 1. Requirements
- JDK 21
- Maven
- MySQL
- VS Code with the Live Server extension (or any static server on port 5500)

### 2. Database
Create an empty database. The tables are created automatically when the backend first starts.

sql
CREATE DATABASE mindspace_db;


### 3. Configuration
Edit `mindspace-backend/mindspace-backend/src/main/resources/application.properties`:


spring.datasource.url=jdbc:mysql://localhost:3306/mindspace_db
spring.datasource.username=root
spring.datasource.password=${DB_PASSWORD:}
mindspace.jwt.secret=${JWT_SECRET:dev-only-secret-change-me-at-least-32-chars}



### 4. Run the backend

cd mindspace-backend/mindspace-backend
mvn spring-boot:run

The backend runs at http://localhost:8080.

### 5. Run the front end
Open the project folder in VS Code and use Live Server on:
- Members: `pages/login.html` (or `index.html`)
- Moderators: `moderator/pages/login.html`

The admin dashboard needs no Live Server: open http://localhost:8080/admin/.

## First-run staff accounts

The first start creates two staff accounts. **Change both passwords straight away.**

| Role | Email | Password |
| --- | --- | --- |
| Administrator | admin@mindspace.com | Admin123! |
| Moderator | mod@mindspace.com | Moderator123! |

Members register themselves on the member site. An administrator can change anyone's role in **Users**.

## API overview

| Path | Used by | Notes |
| --- | --- | --- |
| `/api/auth/*` | Members | Register, login, logout, current user |
| `/api/posts`, `/api/comments` | Members | Feed, posts, comments, likes, bookmarks |
| `/api/follow/*` | Members | Follow and unfollow |
| `/api/notifications` | Members | Notification list and read state |
| `/api/reports` | Members | Report a post or comment |
| `/api/admin/auth/*` | Staff | Login, forgot and reset password |
| `/api/admin/flagged`, `/review`, `/history`, `/notifications` | Moderators and admins | Moderation tools |
| `/api/admin/stats`, `/users`, `/audit`, `/settings`, `/moderators`, `/reverse` | Admins only | Administration |

## Notes and limits

- Turning off a user's account blocks their **next login**. A session that is already open stays valid until it ends.
- Password reset codes are printed to the backend console instead of being emailed.
- The front end calls `http://127.0.0.1:8080`, and the backend only accepts requests from `localhost:5500` and `127.0.0.1:5500`. To use the app from another device, or to deploy it, those addresses need to change.
- MindSpace is a peer-support space, not a crisis service. Check that any helpline numbers shown in the app are correct for your region before launch.

## Troubleshooting

- **Backend won't start with a JWT error:** the secret is shorter than 32 characters.
- **Login pages say they can't connect:** the backend isn't running, or you opened the page from a port other than 5500.
- **Page looks unstyled or out of date:** hard refresh with Ctrl+Shift+R.
- **Compile error "class X is public, should be declared in a file named X.java":** rename the file so it matches the class name exactly.