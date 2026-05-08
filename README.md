# ORBIT 🌌 
**A Premium, Full-Stack Video Hosting Platform**

ORBIT is a custom-built, modern video sharing application designed with a sleek, glassmorphic "space-tech" aesthetic. It provides a robust backend architecture integrated with seamless cloud media storage, wrapped in a responsive, single-page application frontend.

🚀 Key Features

* **Complete Authentication System:** Secure login and registration using HTTP-only JWT cookies (Access & Refresh tokens).
* **Cloud Media Management:** Direct integration with Cloudinary for handling large video chunking, auto-compression, and thumbnail storage.
* **Dynamic Media Feed:** Real-time fetching and rendering of a video library grid.
* **Interactive Custom Video Player:** Watch videos directly in an immersive, overlay modal without leaving the page.
* **User Engagement:** Fully functional Like/Dislike logic and Channel Subscription endpoints.
* **Real-time Dashboard:** A classy profile dropdown panel that instantly fetches your live subscriber and following counts, alongside an interactive avatar uploader.

## 🛠️ Tech Stack
* **Frontend:** HTML5, CSS3 (Glassmorphism), Js
* **Backend:** Node.js, Express.js
* **Database:** MongoDB 
* **Media Storage:** Cloudinary & Multer
* **Security:** bcrypt (password hashing), jsonwebtoken (JWT), CORS

## 💻 Running Locally

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file in the root directory and add your credentials:
  t server: `npm run dev`
5. Open `http://localhost:8000` in your browser.

---
*Crafted By Ankur*
