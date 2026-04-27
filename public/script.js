const API_URL = '/api/v1';

const authBtn = document.getElementById('auth-btn');
const userMenuContainer = document.getElementById('user-menu-container');
const profilePanel = document.getElementById('profile-panel');
const navAvatar = document.getElementById('nav-avatar');
const avatarUpload = document.getElementById('avatar-upload');
const editNameBtn = document.getElementById('edit-name-btn');
const logoutBtn = document.getElementById('logout-btn');
const uploadBtn = document.getElementById('upload-btn');
const authModal = document.getElementById('auth-modal');
const uploadModal = document.getElementById('upload-modal');
const authForm = document.getElementById('auth-form');
const uploadForm = document.getElementById('upload-form');
const videoFeed = document.getElementById('video-feed');
const toggleAuthBtn = document.getElementById('toggle-auth-btn');
const authTitle = document.getElementById('auth-title');

// Watch Modal Elements
const watchModal = document.getElementById('watch-modal');
const watchVideoPlayer = document.getElementById('watch-video-player');
const watchVideoTitle = document.getElementById('watch-video-title');
const watchVideoMeta = document.getElementById('watch-video-meta');
const closeWatchBtn = document.querySelector('.close-watch');
const likeBtn = document.getElementById('like-btn');
const subscribeBtn = document.getElementById('subscribe-btn');

let isLogin = true;
let currentVideo = null;

const checkAuth = async () => {
    try {
        const res = await fetch(`${API_URL}/users/current-user`, { credentials: 'include' });
        if (res.ok) {
            const data = await res.json();
            currentUser = data.data;
            authBtn.classList.add('hidden');
            userMenuContainer.classList.remove('hidden');
            uploadBtn.classList.remove('hidden');
            
            navAvatar.src = currentUser.avatar || 'https://via.placeholder.com/40';
            document.getElementById('panel-avatar').src = currentUser.avatar || 'https://via.placeholder.com/70';
            document.getElementById('panel-name').textContent = currentUser.fullName;
            document.getElementById('panel-username').textContent = '@' + currentUser.userName;
        } else {
            currentUser = null;
            authBtn.classList.remove('hidden');
            userMenuContainer.classList.add('hidden');
            profilePanel.classList.add('hidden');
            uploadBtn.classList.add('hidden');
        }
    } catch (e) {
        console.error(e);
    }
};

const fetchVideos = async () => {
    try {
        const res = await fetch(`${API_URL}/videos`, { credentials: 'include' });
        const data = await res.json();
        if (!data.data || data.data.length === 0) {
            videoFeed.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 3rem; background: var(--glass-bg); border-radius: 12px; border: 1px solid var(--glass-border); color: var(--text-muted);">No videos found. Be the first to upload!</div>';
            return;
        }
        videoFeed.innerHTML = data.data.map(video => `
            <div class="video-card" onclick="openVideo('${video._id}')">
                <img src="${video.thumbnail}" alt="${video.title}" class="video-thumbnail">
                <div class="video-info">
                    <h3 class="video-title">${video.title}</h3>
                    <p class="video-meta">${video.description}</p>
                </div>
            </div>
        `).join('');
    } catch (e) {
        videoFeed.innerHTML = '<div style="color: var(--danger); text-align:center;">Failed to load videos. Is the server connected to MongoDB?</div>';
    }
};

authBtn.addEventListener('click', () => authModal.classList.remove('hidden'));
uploadBtn.addEventListener('click', () => uploadModal.classList.remove('hidden'));
document.querySelector('.close').addEventListener('click', () => authModal.classList.add('hidden'));
document.querySelector('.close-upload').addEventListener('click', () => uploadModal.classList.add('hidden'));

navAvatar.addEventListener('click', async () => {
    profilePanel.classList.toggle('hidden');
    if(!profilePanel.classList.contains('hidden') && currentUser) {
        try {
            const res = await fetch(`${API_URL}/users/c/${currentUser.userName}`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                document.getElementById('panel-subscribers').textContent = data.data.subscribersCount || 0;
            }
        } catch(e) {}
    }
});

avatarUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const oldText = logoutBtn.textContent;
    logoutBtn.textContent = 'Uploading...';
    logoutBtn.disabled = true;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
        const res = await fetch(`${API_URL}/users/avatar`, {
            method: 'PATCH',
            credentials: 'include',
            body: formData
        });
        
        if (res.ok) {
            const data = await res.json();
            currentUser.avatar = data.data.avatar;
            document.getElementById('nav-avatar').src = currentUser.avatar;
            document.getElementById('panel-avatar').src = currentUser.avatar;
        } else {
            const err = await res.json();
            alert(`Failed to update avatar: ${err.message}`);
        }
    } catch (err) {
        alert('Error uploading avatar');
    } finally {
        logoutBtn.textContent = oldText;
        logoutBtn.disabled = false;
        avatarUpload.value = '';
    }
});

editNameBtn.addEventListener('click', async () => {
    if (!currentUser) return;
    const newName = prompt("Enter your new full name:", currentUser.fullName);
    if (!newName || newName.trim() === "" || newName === currentUser.fullName) return;

    try {
        const res = await fetch(`${API_URL}/users/update-account`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ fullName: newName.trim(), email: currentUser.email })
        });
        
        if (res.ok) {
            const data = await res.json();
            currentUser.fullName = data.data.fullName;
            document.getElementById('panel-name').textContent = currentUser.fullName;
        } else {
            const err = await res.json();
            alert(`Failed to update name: ${err.message}`);
        }
    } catch (err) {
        alert('Network error while updating name');
    }
});

// Watch Video Logic
window.openVideo = async (videoId) => {
    try {
        const res = await fetch(`${API_URL}/videos/${videoId}`, { credentials: 'include' });
        const data = await res.json();
        currentVideo = data.data;
        
        watchVideoPlayer.src = currentVideo.videoFile;
        watchVideoTitle.textContent = currentVideo.title;
        watchVideoMeta.textContent = currentVideo.description;
        
        likeBtn.textContent = '👍 Like';
        subscribeBtn.textContent = 'Subscribe';
        
        watchModal.classList.remove('hidden');
        watchVideoPlayer.play();
    } catch(err) {
        alert('Failed to load video details');
    }
};

closeWatchBtn.addEventListener('click', () => {
    watchModal.classList.add('hidden');
    watchVideoPlayer.pause();
    watchVideoPlayer.src = "";
});

likeBtn.addEventListener('click', async () => {
    if(!currentVideo) return;
    try {
        const res = await fetch(`${API_URL}/likes/toggle/v/${currentVideo._id}`, { method: 'POST', credentials: 'include' });
        if(res.ok) {
            const data = await res.json();
            likeBtn.textContent = data.data.liked ? '👍 Liked' : '👍 Like';
        } else {
            alert('Please login to like videos');
        }
    } catch(err) { alert('Error processing like'); }
});

subscribeBtn.addEventListener('click', async () => {
    if(!currentVideo || !currentVideo.owner) return;
    const channelId = typeof currentVideo.owner === 'object' ? currentVideo.owner._id : currentVideo.owner;
    try {
        const res = await fetch(`${API_URL}/subscriptions/c/${channelId}`, { method: 'POST', credentials: 'include' });
        if(res.ok) {
            const data = await res.json();
            subscribeBtn.textContent = data.data.subscribed ? 'Subscribed' : 'Subscribe';
        } else {
            alert('Please login to subscribe');
        }
    } catch(err) { alert('Error processing subscription'); }
});

toggleAuthBtn.addEventListener('click', () => {
    isLogin = !isLogin;
    authTitle.textContent = isLogin ? 'Login to ORBIT' : 'Create an Account';
    toggleAuthBtn.textContent = isLogin ? 'Register' : 'Login';
    document.getElementById('email').classList.toggle('hidden');
    document.getElementById('fullname').classList.toggle('hidden');
});

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const btn = authForm.querySelector('button');
    btn.textContent = 'Processing...';
    
    try {
        if (isLogin) {
            const res = await fetch(`${API_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ userName: username, password })
            });
            if (res.ok) {
                authModal.classList.add('hidden');
                checkAuth();
            } else {
                const err = await res.json();
                alert(`Login failed: ${err.message || 'Invalid credentials'}`);
            }
        } else {
            const formData = new FormData();
            formData.append('userName', username);
            formData.append('email', document.getElementById('email').value);
            formData.append('fullName', document.getElementById('fullname').value);
            formData.append('password', password);
            
            const res = await fetch(`${API_URL}/users/register`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });
            if (res.ok) {
                alert('Registered successfully! Please login.');
                toggleAuthBtn.click();
            } else {
                const err = await res.json();
                alert(`Registration failed: ${err.message || 'Error'}`);
            }
        }
    } catch (err) {
        alert('Network error');
    } finally {
        btn.textContent = 'Submit';
    }
});

logoutBtn.addEventListener('click', async () => {
    await fetch(`${API_URL}/users/logout`, { method: 'POST', credentials: 'include' });
    checkAuth();
});

uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = uploadForm.querySelector('button');
    btn.textContent = 'Uploading to Cloudinary...';
    btn.disabled = true;

    const formData = new FormData();
    formData.append('title', document.getElementById('video-title').value);
    formData.append('description', document.getElementById('video-desc').value);
    formData.append('videoFile', document.getElementById('video-file').files[0]);
    formData.append('thumbnail', document.getElementById('thumbnail-file').files[0]);

    try {
        const res = await fetch(`${API_URL}/videos`, {
            method: 'POST',
            credentials: 'include',
            body: formData
        });
        if (res.ok) {
            alert('Video uploaded successfully!');
            uploadModal.classList.add('hidden');
            uploadForm.reset();
            fetchVideos();
        } else {
            const err = await res.json();
            alert(`Upload failed: ${err.message || 'Check Cloudinary settings'}`);
        }
    } catch(err) {
        alert('Upload Error');
    } finally {
        btn.textContent = 'Upload';
        btn.disabled = false;
    }
});

checkAuth();
fetchVideos();
