/**
 * GameHub MVP - Core Logic
 * 包含：模拟数据库、路由管理、UI 渲染
 */

// --- 1. 模拟数据库层 (Mock Database) ---

const DB_KEYS = {
    USERS: 'gh_users',
    GAMES: 'gh_games',
    POSTS: 'gh_posts',
    COMMENTS: 'gh_comments',
    CURRENT_USER: 'gh_current_user'
};

// 全局变量存储标签，因为它们不是动态的
let GLOBAL_TAGS = [];

const db = {
    init(seedData) {
        // 如果 localStorage 为空，则使用 seedData 初始化
        if (!localStorage.getItem(DB_KEYS.GAMES) && seedData.games) {
            localStorage.setItem(DB_KEYS.GAMES, JSON.stringify(seedData.games));
        }
        if (!localStorage.getItem(DB_KEYS.USERS)) {
            // 如果有预置用户，也初始化进去
            const initialUsers = seedData.users || [];
            localStorage.setItem(DB_KEYS.USERS, JSON.stringify(initialUsers));
        }
        if (!localStorage.getItem(DB_KEYS.POSTS)) {
            const initialPosts = seedData.posts || [];
            localStorage.setItem(DB_KEYS.POSTS, JSON.stringify(initialPosts));
        }
        if (!localStorage.getItem(DB_KEYS.COMMENTS)) {
            const initialComments = seedData.comments || [];
            localStorage.setItem(DB_KEYS.COMMENTS, JSON.stringify(initialComments));
        }
        
        // 设置全局标签
        GLOBAL_TAGS = seedData.tags || [];
    },

    // 用户相关
    register(username, password) {
        const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS));
        if (users.find(u => u.username === username)) {
            return { success: false, message: '用户名已存在' };
        }
        const newUser = { id: Date.now(), username, password };
        users.push(newUser);
        localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
        return { success: true, user: newUser };
    },

    login(username, password) {
        const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS));
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(user));
            return { success: true, user };
        }
        return { success: false, message: '用户名或密码错误' };
    },

    getCurrentUser() {
        return JSON.parse(localStorage.getItem(DB_KEYS.CURRENT_USER));
    },

    logout() {
        localStorage.removeItem(DB_KEYS.CURRENT_USER);
    },

    // 游戏相关
    getGames() {
        return JSON.parse(localStorage.getItem(DB_KEYS.GAMES)) || [];
    },

    getGameById(id) {
        const games = this.getGames();
        return games.find(g => g.id == id);
    },

    // 帖子相关
    createPost(userId, gameId, title, content, tags) {
        const posts = JSON.parse(localStorage.getItem(DB_KEYS.POSTS));
        const newPost = {
            id: Date.now(),
            userId,
            gameId: parseInt(gameId),
            title,
            content,
            tags, // Array of strings
            timestamp: new Date().toISOString()
        };
        posts.unshift(newPost); // 新帖子在最前
        localStorage.setItem(DB_KEYS.POSTS, JSON.stringify(posts));
        return newPost;
    },

    getPosts() {
        return JSON.parse(localStorage.getItem(DB_KEYS.POSTS)) || [];
    },

    getPostById(id) {
        const posts = this.getPosts();
        return posts.find(p => p.id == id);
    },

    // 评论相关
    addComment(postId, userId, content) {
        const comments = JSON.parse(localStorage.getItem(DB_KEYS.COMMENTS));
        const newComment = {
            id: Date.now(),
            postId: parseInt(postId),
            userId,
            content,
            timestamp: new Date().toISOString()
        };
        comments.push(newComment);
        localStorage.setItem(DB_KEYS.COMMENTS, JSON.stringify(comments));
        return newComment;
    },

    getCommentsByPostId(postId) {
        const comments = JSON.parse(localStorage.getItem(DB_KEYS.COMMENTS)) || [];
        return comments.filter(c => c.postId == postId).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    },
    
    getUserById(userId) {
        const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS)) || [];
        return users.find(u => u.id === userId) || { username: '未知用户' };
    }
};

// --- 2. 应用逻辑 (App Logic) ---

const app = {
    async init() {
        try {
            // 尝试从 data.json 读取初始数据
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const seedData = await response.json();
            db.init(seedData);
        } catch (error) {
            console.error('Failed to load data.json:', error);
            alert('注意：无法加载 data.json。如果你是直接打开文件，请尝试使用本地服务器运行 (如 Live Server)。将使用空数据初始化。');
            // Fallback: 使用空数据初始化，避免报错
            db.init({ games: [], tags: [], users: [], posts: [] });
        }
        
        this.checkAuth();
    },

    checkAuth() {
        const user = db.getCurrentUser();
        if (user) {
            document.getElementById('navbar').classList.remove('hidden');
            document.getElementById('current-user-display').textContent = `你好, ${user.username}`;
            this.router('home');
        } else {
            document.getElementById('navbar').classList.add('hidden');
            this.router('login');
        }
    },

    logout() {
        db.logout();
        this.checkAuth();
    },

    // 简单的路由系统
    router(route, params = {}) {
        const container = document.getElementById('app-container');
        container.innerHTML = ''; // 清空当前视图

        switch (route) {
            case 'login':
                this.renderLogin(container);
                break;
            case 'home':
                this.renderHome(container);
                break;
            case 'create':
                this.renderCreatePost(container);
                break;
            case 'post':
                this.renderPostDetail(container, params.id);
                break;
            default:
                this.renderHome(container);
        }
    },

    // --- 视图渲染 ---

    renderLogin(container) {
        container.innerHTML = `
            <div class="auth-container">
                <h2>欢迎来到 GameHub</h2>
                <p>请登录或注册以继续</p>
                <br>
                <div class="form-group">
                    <label>用户名</label>
                    <input type="text" id="username" placeholder="输入用户名 (例如: GameMaster)">
                </div>
                <div class="form-group">
                    <label>密码</label>
                    <input type="password" id="password" placeholder="输入密码 (例如: 123)">
                </div>
                <button onclick="app.handleLogin()" style="width:100%; padding:10px; background:var(--primary-color); color:white; border:none; border-radius:5px; cursor:pointer;">登录 / 注册</button>
                <p style="margin-top:10px; font-size:0.8rem; color:#666;">注意：如果是新用户名，将自动注册。</p>
            </div>
        `;
    },

    handleLogin() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!username || !password) {
            alert('请输入用户名和密码');
            return;
        }

        // 尝试登录
        let result = db.login(username, password);
        if (!result.success) {
            // 如果登录失败，尝试注册（简化流程）
            if (confirm('用户不存在或密码错误。是否创建一个新账号？')) {
                result = db.register(username, password);
                if (result.success) {
                    db.login(username, password);
                    this.checkAuth();
                } else {
                    alert(result.message);
                }
            }
        } else {
            this.checkAuth();
        }
    },

    renderHome(container) {
        const posts = db.getPosts();
        
        // 标签过滤器区域
        let tagsHtml = GLOBAL_TAGS.map(tag => 
            `<span class="filter-tag" onclick="app.filterByTag('${tag}')">${tag}</span>`
        ).join('');

        let postsHtml = posts.length === 0 ? '<p style="text-align:center; color:#666;">暂无帖子，快来发布第一条吧！</p>' : '';

        posts.forEach(post => {
            const game = db.getGameById(post.gameId);
            const user = db.getUserById(post.userId);
            const tags = (post.tags || []).map(t => `<span>#${t}</span>`).join('');
            
            postsHtml += `
                <div class="post-card" onclick="app.router('post', {id: ${post.id}})">
                    <div class="post-header">
                        <span>${user.username}</span>
                        <span class="game-tag">${game ? game.title : '未知游戏'}</span>
                    </div>
                    <div class="post-title">${post.title}</div>
                    <div class="post-tags">${tags}</div>
                    <div style="margin-top:10px; font-size:0.9rem; color:#666;">
                        ${new Date(post.timestamp).toLocaleString()}
                    </div>
                </div>
            `;
        });

        container.innerHTML = `
            <div class="tags-filter">
                <span class="filter-tag active" onclick="app.router('home')">全部</span>
                ${tagsHtml}
            </div>
            <div id="posts-list">
                ${postsHtml}
            </div>
        `;
    },

    filterByTag(tag) {
        // 简单的前端过滤实现
        // 这里为了代码简洁，我直接操作 DOM 隐藏不匹配的
        const cards = document.querySelectorAll('.post-card');
        cards.forEach(card => {
            if (card.innerHTML.includes(`#${tag}`)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
        
        // 更新标签样式
        document.querySelectorAll('.filter-tag').forEach(el => el.classList.remove('active'));
        event.target.classList.add('active');
    },

    renderCreatePost(container) {
        const games = db.getGames();
        const gamesOptions = games.map(g => `<option value="${g.id}">${g.title}</option>`).join('');
        const tagsCheckboxes = GLOBAL_TAGS.map(t => `
            <label style="margin-right:10px; display:inline-block;">
                <input type="checkbox" name="post-tag" value="${t}"> ${t}
            </label>
        `).join('');

        container.innerHTML = `
            <div class="post-card" style="cursor:default;">
                <h2>发布新帖</h2>
                <br>
                <div class="form-group">
                    <label>选择游戏</label>
                    <select id="post-game">${gamesOptions}</select>
                </div>
                <div class="form-group">
                    <label>标题</label>
                    <input type="text" id="post-title" placeholder="请输入标题">
                </div>
                <div class="form-group">
                    <label>内容</label>
                    <textarea id="post-content" rows="5" placeholder="分享你的想法..."></textarea>
                </div>
                <div class="form-group">
                    <label>标签</label>
                    <div>${tagsCheckboxes}</div>
                </div>
                <div style="display:flex; gap:10px;">
                    <button onclick="app.handleCreatePost()" style="padding:10px 20px; background:var(--primary-color); color:white; border:none; border-radius:5px; cursor:pointer;">发布</button>
                    <button onclick="app.router('home')" class="secondary" style="padding:10px 20px; background:transparent; border:1px solid #ccc; border-radius:5px; cursor:pointer;">取消</button>
                </div>
            </div>
        `;
    },

    handleCreatePost() {
        const gameId = document.getElementById('post-game').value;
        const title = document.getElementById('post-title').value;
        const content = document.getElementById('post-content').value;
        const checkboxes = document.querySelectorAll('input[name="post-tag"]:checked');
        const tags = Array.from(checkboxes).map(cb => cb.value);

        if (!title || !content) {
            alert('请填写标题和内容');
            return;
        }

        const user = db.getCurrentUser();
        db.createPost(user.id, gameId, title, content, tags);
        alert('发布成功！');
        this.router('home');
    },

    renderPostDetail(container, postId) {
        const post = db.getPostById(postId);
        if (!post) {
            container.innerHTML = '<p>帖子不存在</p>';
            return;
        }
        const game = db.getGameById(post.gameId);
        const author = db.getUserById(post.userId);
        const comments = db.getCommentsByPostId(postId);

        const commentsHtml = comments.map(c => {
            const cUser = db.getUserById(c.userId);
            return `
                <div class="comment">
                    <div class="comment-header">
                        <strong>${cUser.username}</strong>
                        <span>${new Date(c.timestamp).toLocaleString()}</span>
                    </div>
                    <div>${c.content}</div>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <button onclick="app.router('home')" style="margin-bottom:1rem; padding:5px 10px; cursor:pointer;">&larr; 返回列表</button>
            <div class="post-card" style="cursor:default;">
                <div class="post-header">
                    <span>${author.username}</span>
                    <span class="game-tag">${game ? game.title : '未知游戏'}</span>
                </div>
                <h1 class="post-title" style="font-size:1.5rem;">${post.title}</h1>
                <div style="margin:1rem 0; line-height:1.8;">${post.content}</div>
                <div class="post-tags">${(post.tags || []).map(t => `<span>#${t}</span>`).join('')}</div>
                
                <div class="comments-section">
                    <h3>评论 (${comments.length})</h3>
                    <br>
                    <div style="display:flex; gap:10px; margin-bottom:1rem;">
                        <input type="text" id="comment-input" placeholder="写下你的评论..." style="flex:1; padding:10px; border:1px solid #ddd; border-radius:5px;">
                        <button onclick="app.handleAddComment(${post.id})" style="padding:0 20px; background:var(--primary-color); color:white; border:none; border-radius:5px; cursor:pointer;">发送</button>
                    </div>
                    <div id="comments-list">
                        ${commentsHtml}
                    </div>
                </div>
            </div>
        `;
    },

    handleAddComment(postId) {
        const input = document.getElementById('comment-input');
        const content = input.value.trim();
        if (!content) return;

        const user = db.getCurrentUser();
        db.addComment(postId, user.id, content);
        
        // 重新渲染该页面以显示新评论
        this.renderPostDetail(document.getElementById('app-container'), postId);
    }
};

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
