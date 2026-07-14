document.addEventListener('DOMContentLoaded', async () => {
    // Chèn CSS phần xác thực
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = (window.BASE_URL || '') + 'auth/xac-thuc.css';
    document.head.appendChild(link);

    // Chèn trực tiếp HTML phần xác thực (tránh lỗi fetch do dùng file://)
    const authHtml = `
<!-- ===== AUTH MODAL ===== -->
<div class="auth-modal" id="authModal">
    <div class="auth-modal-content">
        <span class="auth-close" id="authClose">&times;</span>
        <div class="auth-tabs">
            <button class="auth-tab active" id="tabLogin">Đăng nhập</button>
            <button class="auth-tab" id="tabRegister">Đăng ký</button>
        </div>
        
        <!-- Login Form -->
        <form id="loginForm" class="auth-form active">
            <div class="form-group">
                <label>Tên đăng nhập</label>
                <input type="text" id="loginUsername" required placeholder="Nhập tên đăng nhập...">
            </div>
            <div class="form-group">
                <label>Mật khẩu</label>
                <input type="password" id="loginPassword" required placeholder="Nhập mật khẩu...">
            </div>
    
            <div class="form-options" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; font-size: 14px;">
                <label style="display: flex; align-items: center; gap: 5px; font-weight: normal; margin-bottom: 0; cursor: pointer;">
                    <input type="checkbox" id="rememberMe"> Ghi nhớ tài khoản
                </label>
                <a href="#" id="forgotPasswordLink" style="color: var(--primary-blue); text-decoration: none;">Quên mật khẩu?</a>
            </div>
            <p class="auth-error" id="loginError"></p>
            <button type="submit" class="auth-submit-btn">Đăng nhập</button>
        </form>

        <!-- Register Form -->
        <form id="registerForm" class="auth-form">
            <div class="form-group">
                <label>Tên đăng nhập</label>
                <input type="text" id="registerUsername" required minlength="3" placeholder="Nhập tên đăng nhập...">
            </div>
            <div class="form-group">
                <label>Mật khẩu</label>
                <input type="password" id="registerPassword" required minlength="6" placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)...">
            </div>
            <p class="auth-error" id="registerError"></p>
            <button type="submit" class="auth-submit-btn">Đăng ký</button>
        </form>
    </div>
</div>`;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = authHtml;
    document.body.appendChild(wrapper);


    const userBtn = document.getElementById('userBtn');
    const userDropdownMenu = document.getElementById('userDropdownMenu');
    const authModal = document.getElementById('authModal');
    const authClose = document.getElementById('authClose');
    const tabLogin = document.getElementById('tabLogin');
    const tabRegister = document.getElementById('tabRegister');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const displayUsername = document.getElementById('displayUsername');
    const logoutBtn = document.getElementById('logoutBtn');
    const userBtnText = document.getElementById('userBtnText');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    
    // Kiểm tra xem người dùng đã đăng nhập chưa
    let currentUser = localStorage.getItem('currentUser');
    let currentFullName = localStorage.getItem('currentFullName');

    if (currentUser === 'undefined' || currentUser === 'null') {
        currentUser = null;
    }

    function updateAuthUI() {
        if (!userBtnText) return;
        if (currentUser) {
            const isValidFullName = currentFullName && currentFullName !== 'undefined' && currentFullName !== 'null';
            userBtnText.textContent = isValidFullName ? currentFullName : currentUser;
            if (displayUsername) {
                displayUsername.textContent = isValidFullName ? currentFullName : currentUser;
            }
        } else {
            userBtnText.textContent = 'Đăng nhập';
            if (displayUsername) {
                displayUsername.textContent = 'Guest';
            }
        }
    }
    
    window.addEventListener('authProfileChanged', () => {
        currentUser = localStorage.getItem('currentUser');
        if (currentUser === 'undefined' || currentUser === 'null') {
            currentUser = null;
        }
        currentFullName = localStorage.getItem('currentFullName');
        updateAuthUI();
    });
    
    updateAuthUI();
    
    userBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentUser) {
            // Bật/tắt menu tài khoản
            userDropdownMenu.classList.toggle('show');
            const isValidFullName = currentFullName && currentFullName !== 'undefined' && currentFullName !== 'null';
            displayUsername.textContent = isValidFullName ? currentFullName : currentUser;
        } else {
            // Hiển thị popup đăng nhập
            authModal.classList.add('show');
        }
    });

    // Đóng menu tài khoản nếu click ra ngoài
    document.addEventListener('click', (e) => {
        if (!userBtn.contains(e.target) && !userDropdownMenu.contains(e.target)) {
            userDropdownMenu.classList.remove('show');
        }
    });

    // Xử lý đóng popup
    authClose.addEventListener('click', () => {
        authModal.classList.remove('show');
    });

    // Chuyển tab Đăng nhập / Đăng ký
    tabLogin.addEventListener('click', () => {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    });

    tabRegister.addEventListener('click', () => {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
    });

    // Xử lý sự kiện Đăng nhập
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        const errorEl = document.getElementById('loginError');
        errorEl.textContent = '';

        try {
            const res = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem('currentUser', data.user.username);
                if (data.accessToken) {
                    localStorage.setItem('accessToken', data.accessToken);
                    localStorage.setItem('tokenType', data.tokenType || 'Bearer');
                    if (data.expiresAt) localStorage.setItem('tokenExpiresAt', data.expiresAt);
                }
                if (data.user.fullName) {
                    localStorage.setItem('currentFullName', data.user.fullName);
                    currentFullName = data.user.fullName;
                } else {
                    localStorage.removeItem('currentFullName');
                    currentFullName = null;
                }
                currentUser = data.user.username;
                updateAuthUI();
                authModal.classList.remove('show');
                loginForm.reset();
                // Gửi sự kiện để các script khác biết người dùng đã đăng nhập
                window.dispatchEvent(new Event('userLoginStateChanged'));
            } else {
                errorEl.textContent = data.message;
            }
        } catch (err) {
            console.error(err);
            errorEl.textContent = 'Lỗi kết nối máy chủ.';
        }
    });

    // Xử lý sự kiện Đăng ký
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;
        const errorEl = document.getElementById('registerError');
        errorEl.textContent = '';

        try {
            const res = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem('currentUser', data.user.username);
                if (data.accessToken) {
                    localStorage.setItem('accessToken', data.accessToken);
                    localStorage.setItem('tokenType', data.tokenType || 'Bearer');
                    if (data.expiresAt) localStorage.setItem('tokenExpiresAt', data.expiresAt);
                }
                localStorage.removeItem('currentFullName');
                currentFullName = null;
                currentUser = data.user.username;
                updateAuthUI();
                authModal.classList.remove('show');
                registerForm.reset();
                window.dispatchEvent(new Event('userLoginStateChanged'));
            } else {
                errorEl.textContent = data.message;
            }
        } catch (err) {
            console.error(err);
            errorEl.textContent = 'Lỗi kết nối máy chủ.';
        }
    });

    // Xử lý sự kiện Đăng xuất
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentFullName');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('tokenType');
        localStorage.removeItem('tokenExpiresAt');
        currentUser = null;
        currentFullName = null;
        updateAuthUI();
        userDropdownMenu.classList.remove('show');
        window.dispatchEvent(new Event('userLoginStateChanged'));
    });

    // Xử lý sự kiện Quên mật khẩu
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Tính năng khôi phục mật khẩu đang được bảo trì. Vui lòng liên hệ quản trị viên.');
        });
    }
});
