const commonComponents = {
    header: `
    <!-- ===== HEADER ===== -->
    <header class="header" id="header">
        <div class="header-banner">
            <!-- Blue gradient banner background -->
            <div class="header-banner-bg"></div>
            <div class="container">
                <div class="header-content">
                    <a href="#" class="logo">
                        <div class="logo-icon">
                            <svg viewBox="0 0 60 60" width="60" height="60">
                                <circle cx="30" cy="30" r="28" fill="none" stroke="rgba(255,255,255,0.6)"
                                    stroke-width="2" />
                                <circle cx="30" cy="30" r="22" fill="none" stroke="rgba(255,255,255,0.4)"
                                    stroke-width="1" />
                                <text x="30" y="28" text-anchor="middle" fill="white" font-size="8" font-weight="700"
                                    font-family="Inter">DakLakIOC</text>
                                <text x="30" y="38" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-size="5"
                                    font-family="Inter">SMART CITY</text>
                            </svg>
                        </div>
                    </a>
                    <div class="logo-text">
                        <h1 class="logo-title" style="font-size: 20px; font-weight: 700; text-transform: uppercase; margin: 0; color: white;">TRUNG TÂM GIÁM SÁT, ĐIỀU HÀNH ĐÔ THỊ THÔNG MINH</h1>
                        <p class="logo-subtitle" style="font-size: 16px; font-weight: 600; opacity: 0.9; margin: 5px 0 0 0; color: white;">TỈNH ĐẮK LẮK</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="nav-wrapper">
            <div class="container">
                <nav class="main-nav">
                    <a href="#" class="nav-small-logo">
                        <svg viewBox="0 0 60 60" width="50" height="50">
                            <circle cx="30" cy="30" r="28" fill="none" stroke="rgba(255,255,255,0.6)"
                                stroke-width="2" />
                            <circle cx="30" cy="30" r="22" fill="none" stroke="rgba(255,255,255,0.4)"
                                stroke-width="1" />
                            <text x="30" y="28" text-anchor="middle" fill="white" font-size="8" font-weight="700"
                                font-family="Inter">DakLakIOC</text>
                            <text x="30" y="38" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-size="5"
                                font-family="Inter">SMART CITY</text>
                        </svg>
                    </a>
                    <ul class="nav-list">
                        <li class="nav-item" data-nav="trang-chu">
                            <a href="${window.BASE_URL || ''}user/trang-chu/trang-chu.html">Trang chủ</a>
                        </li>
                        <li class="nav-item has-dropdown" data-nav="gioi-thieu">
                            <a href="#">Giới thiệu <i class="fa-solid fa-angle-down"></i></a>
                            <ul class="dropdown">
                                <li><a href="${window.BASE_URL || ''}user/gioi-thieu/chuc-nang-nhiem-vu.html">Chức năng, nhiệm vụ</a></li>
                                <li><a href="${window.BASE_URL || ''}user/gioi-thieu/dau-moi-ho-tro.html">Đầu mối hỗ trợ trực tuyến qua điện thoại</a></li>
                                <li><a href="${window.BASE_URL || ''}user/gioi-thieu/lich-su-hinh-thanh.html">Lịch sử hình thành</a></li>
                                <li><a href="${window.BASE_URL || ''}user/gioi-thieu/san-pham-tieu-bieu.html">Sản phẩm tiêu biểu</a></li>
                                <li><a href="${window.BASE_URL || ''}user/gioi-thieu/so-do-to-chuc.html">Sơ đồ tổ chức</a></li>
                            </ul>
                        </li>
                        <li class="nav-item" data-nav="co-cau-to-chuc">
                            <a href="${window.BASE_URL || ''}user/gioi-thieu/co-cau-to-chuc.html">Cơ cấu tổ chức</a>
                        </li>
                        <li class="nav-item has-dropdown" data-nav="tin-tuc">
                            <a href="#">Tin tức <i class="fa-solid fa-angle-down"></i></a>
                            <ul class="dropdown">
                                <li><a href="${window.BASE_URL || ''}user/tin-tuc/cap-nhat-bao-lu.html">Cập nhật bão lũ</a></li>
                                <li><a href="${window.BASE_URL || ''}user/tin-tuc/cds-doi-moi-sang-tao.html">CĐS - Đổi mới sáng tạo</a></li>
                                <li><a href="${window.BASE_URL || ''}user/chuyen-muc-khac/chi-dao-dieu-hanh.html">Chỉ đạo điều hành</a></li>
                                <li><a href="${window.BASE_URL || ''}user/chuyen-muc-khac/cong-tac-xay-dung-dang.html">Công tác xây dựng Đảng</a></li>
                                <li><a href="${window.BASE_URL || ''}user/giai-phap/giai-phap-an-toan-mang.html">Giải pháp An toàn mạng</a></li>
                                <li><a href="${window.BASE_URL || ''}user/giai-phap/giai-phap-an-toan-thong-tin.html">Giải pháp An toàn thông tin</a></li>
                                <li><a href="${window.BASE_URL || ''}user/tin-tuc/thong-bao.html">Thông báo</a></li>
                                <li><a href="${window.BASE_URL || ''}user/chuyen-muc-khac/tieu-chuan-chat-luong.html">Tiêu chuẩn - Chất lượng</a></li>
                                <li><a href="${window.BASE_URL || ''}user/tin-tuc/tin-hoat-dong.html">Tin hoạt động</a></li>
                                <li><a href="${window.BASE_URL || ''}user/chuyen-muc-khac/trao-doi-kinh-nghiem.html">Trao đổi kinh nghiệm</a></li>
                                <li><a href="${window.BASE_URL || ''}user/chuyen-muc-khac/tuong-tac-cong-dan.html">Tương tác công dân</a></li>
                            </ul>
                        </li>
                        <li class="nav-item has-dropdown" data-nav="van-ban">
                            <a href="#">Văn bản <i class="fa-solid fa-angle-down"></i></a>
                            <ul class="dropdown">
                                <li><a href="#">Bộ Khoa học và Công nghệ</a></li>
                                <li><a href="#">CSDL VBQPPL tỉnh Đắk Lắk</a></li>
                                <li><a href="#">Khoa học và Công nghệ địa phương</a></li>
                                <li><a href="#">Khoa học và Công nghệ Trung ương</a></li>
                                <li><a href="#">UBND tỉnh Đắk Lắk</a></li>
                                <li><a href="#">Văn bản</a></li>
                                <li><a href="#">Văn bản Trung tâm IOC</a></li>
                            </ul>
                        </li>
                        <li class="nav-item has-dropdown" data-nav="y-kien-du-thao">
                            <a href="#">Ý kiến dự thảo <i class="fa-solid fa-angle-down"></i></a>
                            <ul class="dropdown">
                                <li><a href="#">Văn bản dự thảo Sở KHCN</a></li>
                                <li class="dropdown-submenu">
                                    <a href="#">Văn bản dự thảo Trung tâm IOC <i class="fa-solid fa-angle-right"
                                            style="float: right; margin-top: 4px;"></i></a>
                                    <ul class="dropdown">
                                        <li><a href="#">Báo cáo</a></li>
                                        <li><a href="#">Công văn</a></li>
                                        <li><a href="#">Hướng dẫn</a></li>
                                        <li><a href="#">Quyết định</a></li>
                                        <li><a href="#">Tập huấn</a></li>
                                        <li><a href="#">Thông báo</a></li>
                                    </ul>
                                </li>
                                <li><a href="#">Văn bản dự thảo UBND tỉnh Đắk Lắk</a></li>
                            </ul>
                        </li>
                        <li class="nav-item" data-nav="lich-cong-tac">
                            <a href="#">Lịch công tác</a>
                        </li>
                        <li class="nav-item" data-nav="hoi-dap">
                            <a href="#">Hỏi đáp</a>
                        </li>
                        <li class="nav-item" data-nav="lien-he">
                            <a href="#">Liên hệ</a>
                        </li>
                    </ul>
                    
                    <div style="position: relative; margin-left: auto; display: flex; align-items: center;">
                        <button class="search-btn" id="searchBtn" style="margin-left: 0;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="m21 21-4.34-4.34" />
                                <circle cx="11" cy="11" r="8" />
                            </svg>
                        </button>
                        <div class="search-form" id="searchForm">
                            <form>
                                <input type="text" placeholder="Nhập tìm kiếm..." required
                                    oninvalid="this.setCustomValidity('Vui lòng nhập từ khóa tìm kiếm')"
                                    oninput="this.setCustomValidity('')">
                                <button type="submit">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round">
                                        <circle cx="11" cy="11" r="8" />
                                        <path d="m21 21-4.34-4.34" />
                                    </svg>
                                </button>
                                <button type="button" class="close-search" id="closeSearch">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round">
                                        <path d="M18 6 6 18" />
                                        <path d="m6 6 12 12" />
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </div>
                    <div class="user-dropdown-container" id="userDropdownContainer" style="margin-left: 20px; margin-right: 0;">
                        <button class="user-btn" id="userBtn" title="Tài khoản" style="display: flex; align-items: center;">
                            <i class="fa-solid fa-user"></i> <span id="userBtnText" style="font-family: 'Inter', sans-serif; font-size: 14px; margin-left: 8px; font-weight: 500;">Đăng nhập</span>
                        </button>
                        <ul class="user-dropdown-menu" id="userDropdownMenu">
                            <li class="user-info-item">Xin chào, <b id="displayUsername">Guest</b></li>
                            <li><hr></li>
                            <li><a href="${window.BASE_URL || ''}profile/ho-so.html"><i class="fa-solid fa-address-card"></i> Hồ sơ cá nhân</a></li>
                            <li><a href="#" id="logoutBtn"><i class="fa-solid fa-right-from-bracket"></i> Đăng xuất</a></li>
                        </ul>
                    </div>
                </nav>
            </div>
        </div>
        <!-- Mobile menu button -->
        <button class="mobile-menu-btn" id="mobileMenuBtn">
            <i class="fa-solid fa-bars"></i>
        </button>
    </header>`,

    footer: `
    <!-- ===== FOOTER ===== -->
    <footer class="footer">
        <div class="container">
            <div class="footer-main">
                <div class="footer-left">
                    <div class="footer-brand">
                        <div class="footer-logo">
                            <svg viewBox="0 0 60 60" width="60" height="60">
                                <circle cx="30" cy="30" r="28" fill="none" stroke="rgba(255,255,255,0.5)"
                                    stroke-width="1.5" />
                                <circle cx="30" cy="30" r="22" fill="none" stroke="rgba(255,255,255,0.3)"
                                    stroke-width="1" />
                                <text x="30" y="28" text-anchor="middle" fill="white" font-size="8" font-weight="700"
                                    font-family="Inter">DakLakIOC</text>
                                <text x="30" y="38" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-size="5"
                                    font-family="Inter">SMART CITY</text>
                            </svg>
                        </div>
                        <div class="footer-brand-text">
                            <strong>DAKLAK IOC</strong>
                            <span>Trung tâm Giám sát, điều hành đô thị thông minh tỉnh Đăk Lăk</span>
                        </div>
                    </div>
                    <div class="footer-info">
                        <h4>THÔNG TIN TRUNG TÂM</h4>
                        <p><i class="fa-solid fa-location-dot"></i> Địa chỉ: 28B Y Bih Aleo, Phường Buôn Ma Thuột, tỉnh
                            Đắk Lắk</p>
                        <p><i class="fa-solid fa-phone"></i> Điện thoại: <a href="tel:02621022">02621022</a> - Fax:
                            02621022</p>
                        <p><i class="fa-solid fa-envelope"></i> Email: <a
                                href="mailto:banbientapioc.tttt@daklak.gov.vn">banbientapioc.tttt@daklak.gov.vn</a></p>
                    </div>
                </div>
                <div class="footer-right">
                    <div class="footer-cert">
                        <div class="cert-badge">
                            <svg viewBox="0 0 140 50" width="140" height="50">
                                <rect width="140" height="50" rx="6" fill="white" />
                                <text x="70" y="20" text-anchor="middle" fill="#1a5276" font-size="10" font-weight="700"
                                    font-family="Inter">NCSC</text>
                                <text x="70" y="32" text-anchor="middle" fill="#555" font-size="7"
                                    font-family="Inter">Website đạt chứng nhận</text>
                                <text x="70" y="43" text-anchor="middle" fill="#c0392b" font-size="8" font-weight="700"
                                    font-family="Inter">TÍN NHIỆM MẠNG</text>
                            </svg>
                        </div>
                    </div>
                    <div class="footer-social">
                        <h4>THEO DÕI CHÚNG TÔI TẠI</h4>
                        <div class="social-links">
                            <a href="#" class="social-icon facebook" aria-label="Facebook">
                                <i class="fa-brands fa-facebook-f"></i>
                            </a>
                            <a href="#" class="social-icon zalo" aria-label="Zalo">
                                <span style="font-weight:700;font-size:10px;">Zalo</span>
                            </a>
                            <a href="#" class="social-icon youtube" aria-label="YouTube">
                                <i class="fa-brands fa-youtube"></i>
                            </a>
                            <a href="#" class="social-icon tiktok" aria-label="TikTok">
                                <i class="fa-brands fa-tiktok"></i>
                            </a>
                        </div>
                    </div>
                    <div class="footer-app">
                        <h4>TẢI ỨNG DỤNG ĐĂK LĂK SỐ</h4>
                        <div class="app-download">
                            <div class="qr-code">
                                <svg viewBox="0 0 80 80" width="80" height="80">
                                    <rect width="80" height="80" rx="4" fill="white" />
                                    <!-- QR code pattern -->
                                    <rect x="8" y="8" width="20" height="20" rx="2" fill="#333" />
                                    <rect x="52" y="8" width="20" height="20" rx="2" fill="#333" />
                                    <rect x="8" y="52" width="20" height="20" rx="2" fill="#333" />
                                    <rect x="12" y="12" width="12" height="12" rx="1" fill="white" />
                                    <rect x="56" y="12" width="12" height="12" rx="1" fill="white" />
                                    <rect x="12" y="56" width="12" height="12" rx="1" fill="white" />
                                    <rect x="15" y="15" width="6" height="6" fill="#333" />
                                    <rect x="59" y="15" width="6" height="6" fill="#333" />
                                    <rect x="15" y="59" width="6" height="6" fill="#333" />
                                    <rect x="32" y="8" width="4" height="4" fill="#333" />
                                    <rect x="40" y="8" width="4" height="4" fill="#333" />
                                    <rect x="32" y="16" width="4" height="4" fill="#333" />
                                    <rect x="44" y="16" width="4" height="4" fill="#333" />
                                    <rect x="36" y="32" width="8" height="8" fill="#333" />
                                    <rect x="52" y="36" width="4" height="4" fill="#333" />
                                    <rect x="60" y="40" width="4" height="4" fill="#333" />
                                    <rect x="32" y="52" width="4" height="4" fill="#333" />
                                    <rect x="40" y="56" width="4" height="4" fill="#333" />
                                    <rect x="52" y="52" width="8" height="8" fill="#333" />
                                    <rect x="64" y="56" width="4" height="4" fill="#333" />
                                </svg>
                            </div>
                            <div class="store-links">
                                <a href="#" class="store-btn">
                                    <svg viewBox="0 0 135 40" width="135" height="40">
                                        <rect width="135" height="40" rx="6" fill="#000" />
                                        <text x="67" y="15" text-anchor="middle" fill="#999" font-size="7"
                                            font-family="Inter">Download on the</text>
                                        <text x="67" y="28" text-anchor="middle" fill="white" font-size="13"
                                            font-weight="600" font-family="Inter">App Store</text>
                                    </svg>
                                </a>
                                <a href="#" class="store-btn">
                                    <svg viewBox="0 0 135 40" width="135" height="40">
                                        <rect width="135" height="40" rx="6" fill="#000" />
                                        <text x="67" y="15" text-anchor="middle" fill="#999" font-size="7"
                                            font-family="Inter">GET IT ON</text>
                                        <text x="67" y="28" text-anchor="middle" fill="white" font-size="13"
                                            font-weight="600" font-family="Inter">Google Play</text>
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>© 2026 Trung tâm Giám sát, Điều hành đô thị thông minh tỉnh Đắk Lắk – All Rights Reserved</p>
                <p>Ghi rõ nguồn "Trang Thông tin điện tử Trung tâm IOC" hoặc iocdaklak.vn khi phát hành lại thông tin từ
                    các nguồn này.</p>
            </div>
        </div>
    </footer>`,

    comments: `
            <!-- ===== COMMENTS SECTION ===== -->
            <div class="comments-section" id="commentsSection">
                <div class="comments-header">
                    <h3>Bình luận</h3>
                    <div class="comments-sort">
                        <select id="commentsSort">
                            <option value="likes">Tiêu biểu (nhiều like nhất)</option>
                            <option value="newest">Mới nhất</option>
                            <option value="oldest">Cũ nhất</option>
                        </select>
                    </div>
                </div>
                
                <div class="comments-input-area" id="commentsInputArea" style="display:none;">
                    <textarea id="commentInput" placeholder="Nhập bình luận của bạn..." rows="3"></textarea>
                    <div style="text-align: right; margin-top: 10px;">
                        <button id="postCommentBtn" class="post-comment-btn">Gửi bình luận</button>
                    </div>
                </div>
                <div class="comments-login-prompt" id="commentsLoginPrompt">
                    Vui lòng <a href="#" id="promptLoginBtn">đăng nhập</a> hoặc <a href="#" id="promptRegisterBtn">đăng ký</a> để có thể bình luận.
                </div>
                
                <div class="comments-list" id="commentsList">
                    <!-- Comments render here -->
                </div>
            </div>`,

    scrollTop: `
    <!-- ===== SCROLL TO TOP ===== -->
    <button class="scroll-top" id="scrollTopBtn" aria-label="Scroll to top">
        <i class="fa-solid fa-arrow-up"></i>
    </button>`
};

// Inject components synchronously since the script is placed at the end of body
(function() {
    // 1. Inject Header at the beginning of body
    document.body.insertAdjacentHTML('afterbegin', commonComponents.header);
    
    // 2. Inject Footer & Scroll Top at the end of body
    document.body.insertAdjacentHTML('beforeend', commonComponents.footer);
    document.body.insertAdjacentHTML('beforeend', commonComponents.scrollTop);
    
    // 3. Inject Comments Section if placeholder exists
    const commentsPlaceholder = document.getElementById('common-comments');
    if (commentsPlaceholder) {
        commentsPlaceholder.outerHTML = commonComponents.comments;
    }

    // 4. Handle active menu state
    const pageId = document.body.dataset.pageId;
    if (pageId) {
        // Mảng các page-id thuộc mục "Tin tức"
        const newsPages = [
            'cap-nhat-bao-lu', 'cds-doi-moi-sang-tao', 'chi-dao-dieu-hanh', 
            'cong-tac-xay-dung-dang', 'giai-phap-an-toan-mang', 'giai-phap-an-toan-thong-tin',
            'thong-bao', 'tieu-chuan-chat-luong', 'tin-hoat-dong', 'trao-doi-kinh-nghiem', 'tuong-tac-cong-dan'
        ];
        
        // Mảng các page-id thuộc mục "Giới thiệu"
        const introPages = [
            'chuc-nang-nhiem-vu', 'dau-moi-ho-tro', 'lich-su-hinh-thanh', 'san-pham-tieu-bieu', 'so-do-to-chuc'
        ];

        let activeNav = '';
        if (pageId === 'trang-chu') {
            activeNav = 'trang-chu';
        } else if (pageId === 'co-cau-to-chuc') {
            activeNav = 'co-cau-to-chuc';
        } else if (newsPages.includes(pageId)) {
            activeNav = 'tin-tuc';
        } else if (introPages.includes(pageId)) {
            activeNav = 'gioi-thieu';
        }
        
        if (activeNav) {
            const activeMenuItem = document.querySelector(`.nav-item[data-nav="${activeNav}"]`);
            if (activeMenuItem) {
                // Xóa class active ở các item khác
                document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
                // Thêm active
                activeMenuItem.classList.add('active');
            }
        }
    }

    // Bộ đọc văn bản dùng chung cho các trang nội dung.
    // Nạp tại đây để không phải gắn lại script vào từng trang HTML.
    if (document.querySelector('.article-section')) {
        const voiceReaderScript = document.createElement('script');
        voiceReaderScript.src = `${window.BASE_URL || '/'}shared/doc-van-ban.js`;
        voiceReaderScript.defer = true;
        document.body.appendChild(voiceReaderScript);
    }
})();
