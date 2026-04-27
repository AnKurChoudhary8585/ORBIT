# Product Requirements Document (PRD): ORBIT Backend Service

**Project Name:** ORBIT
**Client:** Antigravity
**Date:** April 26, 2026

## 1. Executive Summary
ORBIT is a comprehensive backend service designed to power a YouTube-like video hosting platform. Built utilizing a robust technology stack comprising Node.js, Express, MongoDB, and Mongoose, this service aims to provide a scalable, secure, and highly performant foundation for video content delivery and user interaction. The platform facilitates a wide array of functionalities, including secure user authentication, seamless video management, interactive features such as likes and comments, and organizational tools like playlists and subscriptions.

The primary objective of this project is to deliver a reliable backend infrastructure that can handle the complexities of video streaming, user data management, and real-time interactions, ensuring a smooth experience for both content creators and consumers.

## 2. Product Vision and Goals
The vision for ORBIT is to create a versatile and scalable backend architecture that empowers developers to build feature-rich video sharing applications. The core goals include:
- **Scalability:** Designing a system capable of handling increasing volumes of users, video uploads, and concurrent streaming requests without performance degradation.
- **Security:** Implementing robust authentication and authorization mechanisms to protect user data and ensure secure access to platform features.
- **Extensibility:** Creating a modular architecture that allows for the easy integration of future features, such as advanced analytics, live streaming capabilities, or monetization tools.
- **Performance:** Optimizing database queries and media delivery to minimize latency and provide a seamless user experience.

## 3. Target Audience
The primary users of the ORBIT backend service are frontend developers and mobile application developers who require a robust API to build user-facing video platforms. The end-users of the resulting applications will include:
- **Content Creators:** Individuals or organizations uploading videos, managing their channels, and interacting with their audience.
- **Viewers:** Users consuming video content, subscribing to channels, creating playlists, and engaging through likes and comments.

## 4. Technology Stack
The ORBIT backend service leverages a modern, JavaScript-based technology stack to ensure high performance and developer productivity.

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| Runtime Environment | Node.js | Provides an asynchronous, event-driven runtime for building scalable network applications. |
| Web Framework | Express.js | Facilitates the creation of robust APIs and handles routing, middleware, and HTTP requests. |
| Database | MongoDB | A NoSQL database chosen for its flexibility in handling unstructured data and scalability. |
| Object Data Modeling (ODM) | Mongoose | Provides a straight-forward, schema-based solution to model application data and interact with MongoDB. |
| Media Storage | Cloudinary | A cloud-based service utilized for the secure storage, management, and delivery of video files and images (avatars, thumbnails). |
| Authentication | JSON Web Tokens (JWT) & bcrypt | Ensures secure user authentication and password hashing. |

## 5. Core Features and Requirements

### 5.1 User Authentication and Management
- **Registration and Login:** Users must be able to create accounts using a unique username, email address, and secure password. The system will utilize bcrypt for password hashing and JWT for generating access and refresh tokens upon successful login.
- **Profile Management:** Users can update their profile information, including their full name, avatar, and cover image. The system must handle the secure upload and storage of these images via Cloudinary.
- **Watch History:** The system will maintain a record of videos watched by the user, allowing them to easily revisit previously viewed content.
- **Channel Profiles:** Users can view the public profiles of other users (channels), which will display their uploaded videos, subscriber count, and other relevant statistics.

### 5.2 Video Management
- **Video Upload:** Authenticated users can upload video files along with a required thumbnail image. The system must process these uploads, store the files securely on Cloudinary, and save the relevant URLs and metadata in the database.
- **Metadata Management:** Users must provide a title and description for each uploaded video. The system will automatically extract and store the video duration.
- **Publishing Controls:** Users have the ability to toggle the publication status of their videos, allowing them to keep content private or make it publicly accessible.
- **Video Retrieval:** The API must provide endpoints for retrieving individual videos by ID, as well as fetching lists of videos based on various criteria (e.g., all published videos, videos by a specific user).

### 5.3 Interaction System
- **Likes and Dislikes:** Users can express their opinion on videos, comments, and tweets by liking or disliking them. The system must track these interactions and provide aggregated counts.
- **Comments:** Users can add comments to videos, fostering discussion and community engagement. The system must support creating, updating, and deleting comments.
- **Tweets (Community Posts):** Users can post short text updates (tweets) to their channel, allowing for communication with their audience outside of video content.

### 5.4 Subscription System
- **Subscribe/Unsubscribe:** Users can toggle their subscription status to any channel on the platform.
- **Subscriber Management:** The system must provide endpoints to retrieve a list of a channel's subscribers and a list of channels a user is subscribed to.

### 5.5 Playlist Management
- **Playlist Creation:** Users can create new playlists with a specific name and description.
- **Video Organization:** Users can add videos to and remove videos from their playlists.
- **Playlist Retrieval:** The API must allow users to retrieve their own playlists and view the contents of specific playlists.

## 6. Database Schema Design

| Schema | Key Fields | Description |
| :--- | :--- | :--- |
| **User** | `userName`, `email`, `fullName`, `avatar`, `coverImage`, `watchHistory`, `password`, `refreshToken` | Stores user identity, profile details, and authentication credentials. |
| **Video** | `videoFile`, `thumbnail`, `title`, `description`, `duration`, `views`, `isPublished`, `owner` | Contains metadata and storage URLs for uploaded videos. |
| **Comment** | `content`, `video`, `owner` | Stores user comments associated with specific videos. |
| **Like** | `video`, `comment`, `tweet`, `likedBy` | Tracks user likes across different content types. |
| **Subscription** | `subscriber`, `channel` | Manages the relationship between users and the channels they follow. |
| **Playlist** | `name`, `description`, `videos`, `owner` | Organizes collections of videos created by users. |

## 7. API Endpoint Structure
All endpoints are prefixed with `/api/v1`.

### 7.1 Users (`/api/v1/users`)
- `POST /register`: Register a new user.
- `POST /login`: Authenticate a user and issue tokens.
- `POST /logout`: Invalidate the user's current session.
- `POST /refresh-token`: Obtain a new access token using a refresh token.
- `POST /change-password`: Update the user's password.
- `GET /current-user`: Retrieve the profile of the currently authenticated user.
- `PATCH /update-account`: Update user account details.
- `PATCH /avatar`: Update the user's avatar image.
- `PATCH /cover-image`: Update the user's cover image.
- `GET /c/:username`: Retrieve a user's channel profile.
- `GET /history`: Retrieve the user's watch history.

### 7.2 Videos (`/api/v1/videos`)
- `GET /`: Retrieve a list of videos (with pagination and filtering).
- `POST /`: Publish a new video.
- `GET /:videoId`: Retrieve a specific video by ID.
- `PATCH /:videoId`: Update video metadata.
- `DELETE /:videoId`: Delete a video.
- `PATCH /toggle/publish/:videoId`: Toggle the publication status of a video.

### 7.3 Comments (`/api/v1/comments`)
- `GET /:videoId`: Retrieve comments for a specific video.
- `POST /:videoId`: Add a new comment to a video.
- `PATCH /:commentId`: Update an existing comment.
- `DELETE /:commentId`: Delete a comment.

### 7.4 Likes (`/api/v1/likes`)
- `POST /toggle/v/:videoId`: Toggle like status on a video.
- `POST /toggle/c/:commentId`: Toggle like status on a comment.
- `POST /toggle/t/:tweetId`: Toggle like status on a tweet.
- `GET /videos`: Retrieve a list of videos liked by the current user.

### 7.5 Subscriptions (`/api/v1/subscriptions`)
- `POST /c/:channelId`: Toggle subscription status for a channel.
- `GET /c/:channelId`: Retrieve a list of subscribers for a channel.
- `GET /u/:subscriberId`: Retrieve a list of channels a user is subscribed to.

### 7.6 Playlists (`/api/v1/playlists`)
- `POST /`: Create a new playlist.
- `GET /:playlistId`: Retrieve a specific playlist.
- `PATCH /:playlistId`: Update playlist details.
- `DELETE /:playlistId`: Delete a playlist.
- `PATCH /add/:videoId/:playlistId`: Add a video to a playlist.
- `PATCH /remove/:videoId/:playlistId`: Remove a video from a playlist.
- `GET /user/:userId`: Retrieve all playlists created by a specific user.

## 8. Non-Functional Requirements
- **Error Handling:** The API must implement a consistent error handling mechanism, returning standardized JSON responses with appropriate HTTP status codes and descriptive error messages.
- **Security:** All sensitive endpoints must be protected using JWT authentication. Input validation and sanitization must be implemented to prevent common vulnerabilities such as Cross-Site Scripting (XSS) and SQL Injection (or NoSQL equivalent).
- **Performance:** Database queries should be optimized using appropriate indexes. Media files should be served efficiently via Cloudinary's Content Delivery Network (CDN).
- **Documentation:** The API should be thoroughly documented, ideally using a tool like Swagger or Postman, to facilitate easy integration by frontend developers.
