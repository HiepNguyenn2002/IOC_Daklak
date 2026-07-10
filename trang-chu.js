// ===== CUỘN LÊN ĐẦU TRANG =====
const scrollTopBtn = document.getElementById('scrollTopBtn');

window.addEventListener('scroll', () => {
    if (!scrollTopBtn) return;
    if (window.scrollY > 300) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
}, { passive: true });

if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ===== LOGO HEADER CỐ ĐỊNH =====
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    if (header) {
        if (window.scrollY >= 85) {
            header.classList.add('is-sticky');
        } else {
            header.classList.remove('is-sticky');
        }
    }
}, { passive: true });

// ===== BẬT/TẮT TÌM KIẾM =====
const searchBtn = document.getElementById('searchBtn');
const searchForm = document.getElementById('searchForm');
const closeSearch = document.getElementById('closeSearch');

if (searchBtn && searchForm) {
    searchBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        searchForm.classList.add('active');
        const input = searchForm.querySelector('input');
        if (input) setTimeout(() => input.focus(), 50);
    });

    // Đóng khi click ra ngoài
    document.addEventListener('click', (e) => {
        if (searchForm.classList.contains('active')) {
            if (!searchForm.contains(e.target) && !searchBtn.contains(e.target)) {
                searchForm.classList.remove('active');
            }
        }
    });
}

if (closeSearch && searchForm) {
    closeSearch.addEventListener('click', () => {
        searchForm.classList.remove('active');
    });
}

// ===== MENU ĐIỆN THOẠI =====
const mobileMenuBtn = document.getElementById('mobileMenuBtn');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        document.body.classList.toggle('open-menu');
    });
}

// ===== CHUYỂN TAB TÀI LIỆU =====
const docTabs = document.querySelectorAll('.doc-tab');

docTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabIndex = tab.dataset.tab;

        // Xóa trạng thái active của tất cả các tab
        docTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Hiển thị/ẩn nội dung tab
        document.querySelectorAll('.documents-table').forEach(table => {
            table.classList.add('hidden');
        });

        const targetTable = document.getElementById(`docTab${tabIndex}`);
        if (targetTable) {
            targetTable.classList.remove('hidden');
        }
    });
});

// ===== OBSERVER ĐỂ CHẠY ANIMATION KHI CUỘN =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Theo dõi các phần tử có hiệu ứng animation
document.querySelectorAll('.solution-card, .partner-card, .news-card, .sidebar-banner').forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
});

// Xử lý đóng mở Accordion (Sidebar)
const accordionHeaders = document.querySelectorAll('.accordion-header');
accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
        const item = header.parentElement;
        item.classList.toggle('active');
    });
});

// ===== TÍCH HỢP API (C# BACKEND) =====
const API_BASE = 'http://localhost:5000/api';

async function loadDynamicConfig() {
    try {
        const response = await fetch(`${API_BASE}/config`);
        if (!response.ok) return;
        const config = await response.json();
        
        if (config.bodyBgColor) {
            document.body.style.backgroundColor = config.bodyBgColor;
        }
        if (config.bannerUrl) {
            const banner = document.querySelector('.header-banner-bg');
            if (banner) {
                banner.style.backgroundImage = `url('${config.bannerUrl}')`;
                banner.style.backgroundSize = 'cover';
                banner.style.backgroundPosition = 'center';
            }
        }
        if (config.newsSectionBgColor) {
            const newsSection = document.getElementById('news-section');
            if (newsSection) newsSection.style.backgroundColor = config.newsSectionBgColor;
        }
        if (config.infoUtilityBgColor) {
            const infoSection = document.getElementById('info-utility-section');
            if (infoSection) infoSection.style.backgroundColor = config.infoUtilityBgColor;
        }
    } catch (e) {
        console.warn('Backend C# is not running. Using default local styles.');
    }
}

async function loadDynamicNews() {
    try {
        const response = await fetch(`${API_BASE}/news`);
        if (!response.ok) return;
        const newsList = await response.json();
        
        const ul = document.getElementById('dynamic-news-list');
        if (ul && newsList && newsList.length > 0) {
            // Giữ 3 mục đầu (hoặc thay thế toàn bộ, thêm vào đầu danh sách)
            let html = '';
            // Chỉ hiển thị 3 tin mới nhất để giữ nguyên bố cục
            const displayList = newsList.slice(0, 3);
            displayList.forEach(item => {
                html += `
                    <li>
                        <a href="#">
                            <span class="news-list-date">${item.date || ''}</span>
                            <span>${item.title || ''}</span>
                        </a>
                    </li>
                `;
            });
            // Có thể thay thế nội dung (innerHTML) hoặc chèn lên đầu
            // Ở đây thay thế danh sách hiện tại bằng danh sách động nếu có tin mới
            ul.innerHTML = html;
        }
    } catch (e) {
        console.warn('Backend C# is not running. Using default static news.');
    }
}

// Khởi tạo khi tải trang
document.addEventListener('DOMContentLoaded', () => {
    loadDynamicConfig();
    loadDynamicNews();
    loadAboutContent();
    loadSupportContent();
    loadHistoryContent();
    loadProductsContent();
    loadOrgChartContent();
    loadStructContent();
    loadBaoLuContent();
});

async function loadSupportContent() {
    const titleEl = document.getElementById('dynamic-support-title');
    const contentEl = document.getElementById('dynamic-support-content');
    
    // Chỉ tải nếu đang ở trang Hỗ trợ
    if (!titleEl && !contentEl) return;

    try {
        const response = await fetch(`${API_BASE}/dau-moi-ho-tro`);
        if (!response.ok) return;
        const support = await response.json();
        
        if (titleEl && support.title) titleEl.innerText = support.title;
        if (contentEl && support.content) contentEl.innerHTML = support.content;
    } catch (e) {
        console.warn('Backend C# is not running. Using default static support content.');
        if (titleEl) titleEl.innerText = "Đầu mối hỗ trợ trực tuyến qua điện thoại";
        if (contentEl) contentEl.innerHTML = "<p>Lỗi kết nối tới Server. Vui lòng bật Backend.</p>";
    }
}

async function loadHistoryContent() {
    const titleEl = document.getElementById('dynamic-history-title');
    const contentEl = document.getElementById('dynamic-history-content');
    
    // Chỉ tải nếu đang ở trang Lịch sử
    if (!titleEl && !contentEl) return;

    try {
        const response = await fetch(`${API_BASE}/lich-su-hinh-thanh`);
        if (!response.ok) return;
        const history = await response.json();
        
        if (titleEl && history.title) titleEl.innerText = history.title;
        if (contentEl && history.content) contentEl.innerHTML = history.content;
    } catch (e) {
        console.warn('Backend C# is not running. Using default static history content.');
        if (titleEl) titleEl.innerText = "Lịch sử hình thành";
        if (contentEl) contentEl.innerHTML = "<p>Lỗi kết nối tới Server. Vui lòng bật Backend.</p>";
    }
}

async function loadAboutContent() {
    const titleEl = document.getElementById('dynamic-about-title');
    const contentEl = document.getElementById('dynamic-about-content');
    
    // Chỉ tải nếu đang ở trang Giới thiệu
    if (!titleEl && !contentEl) return;

    try {
        const response = await fetch(`${API_BASE}/chuc-nang-nhiem-vu`);
        if (!response.ok) return;
        const about = await response.json();
        
        if (titleEl && about.title) titleEl.innerText = about.title;
        if (contentEl && about.content) contentEl.innerHTML = about.content;
    } catch (e) {
        console.warn('Backend C# is not running. Using default static about content.');
        if (titleEl) titleEl.innerText = "Chức năng, nhiệm vụ";
        if (contentEl) contentEl.innerHTML = "<p>Lỗi kết nối tới Server. Vui lòng bật Backend.</p>";
    }
}

async function loadProductsContent() {
    const titleEl = document.getElementById('dynamic-products-title');
    const contentEl = document.getElementById('dynamic-products-content');
    
    // Chỉ tải nếu đang ở trang Sản phẩm
    if (!titleEl && !contentEl) return;

    try {
        const response = await fetch(`${API_BASE}/san-pham-tieu-bieu`);
        if (!response.ok) return;
        const products = await response.json();
        
        if (titleEl && products.title) titleEl.innerText = products.title;
        if (contentEl && products.content) contentEl.innerHTML = products.content;
    } catch (e) {
        console.warn('Backend C# is not running. Using default static products content.');
        if (titleEl) titleEl.innerText = "Sản phẩm tiêu biểu";
        if (contentEl) contentEl.innerHTML = "<p>Lỗi kết nối tới Server. Vui lòng bật Backend.</p>";
    }
}

async function loadOrgChartContent() {
    const titleEl = document.getElementById('dynamic-orgchart-title');
    const contentEl = document.getElementById('dynamic-orgchart-content');
    
    // Chỉ tải nếu đang ở trang Sơ đồ tổ chức
    if (!titleEl && !contentEl) return;

    try {
        const response = await fetch(`${API_BASE}/so-do-to-chuc`);
        if (!response.ok) return;
        const orgchart = await response.json();
        
        if (titleEl && orgchart.title) titleEl.innerText = orgchart.title;
        if (contentEl && orgchart.content) contentEl.innerHTML = orgchart.content;
    } catch (e) {
        console.warn('Backend C# is not running. Using default static org chart content.');
        if (titleEl) titleEl.innerText = "Sơ đồ tổ chức";
        if (contentEl) contentEl.innerHTML = "<p>Lỗi kết nối tới Server. Vui lòng bật Backend.</p>";
    }
}

async function loadStructContent() {
    const titleEl = document.getElementById('dynamic-struct-title');
    const contentEl = document.getElementById('dynamic-struct-content');
    
    // Chỉ tải nếu đang ở trang Cơ cấu tổ chức
    if (!titleEl && !contentEl) return;

    try {
        const response = await fetch(`${API_BASE}/co-cau-to-chuc`);
        if (!response.ok) return;
        const structData = await response.json();
        
        if (titleEl && structData.title) titleEl.innerText = structData.title;
        if (contentEl && structData.content) contentEl.innerHTML = structData.content;
    } catch (e) {
        console.warn('Backend C# is not running. Using default static struct content.');
        if (titleEl) titleEl.innerText = "Cơ cấu tổ chức";
        if (contentEl) contentEl.innerHTML = "<p>Lỗi kết nối tới Server. Vui lòng bật Backend.</p>";
    }
}

async function loadBaoLuContent() {
    const titleEl = document.getElementById('dynamic-baolu-title');
    const contentEl = document.getElementById('dynamic-baolu-content');
    
    // Chỉ tải nếu đang ở trang Bão lũ
    if (!titleEl && !contentEl) return;

    try {
        const response = await fetch(`${API_BASE}/cap-nhat-bao-lu`);
        if (!response.ok) return;
        const baoluData = await response.json();
        
        if (titleEl && baoluData.title) titleEl.innerText = baoluData.title;
        if (contentEl) {
            contentEl.innerHTML = '';
            if (!baoluData.posts || baoluData.posts.length === 0) {
                contentEl.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">Chưa có bản tin bão lũ nào.</p>';
                return;
            }
            
            baoluData.posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            const grid = document.createElement('div');
            grid.className = 'baolu-grid';
            
            baoluData.posts.forEach(post => {
                const card = document.createElement('div');
                card.className = 'baolu-card';
                
                let imageHtml = '';
                if (post.imageUrl) {
                    const imgUrl = post.imageUrl.startsWith('http') ? post.imageUrl : `http://localhost:5000${post.imageUrl}`;
                    imageHtml = `<div class="baolu-img"><img src="${imgUrl}" alt="${post.title}"></div>`;
                }
                
                let linkHtml = '';
                if (post.linkUrl) {
                    linkHtml = `<a href="${post.linkUrl}" target="_blank" class="baolu-link"><i class="fa-solid fa-link"></i> ${post.linkText || 'Xem chi tiết'}</a>`;
                }
                
                card.innerHTML = `
                    ${imageHtml}
                    <div class="baolu-info">
                        <h3 class="baolu-card-title">${post.title}</h3>
                        <div class="baolu-meta">
                            <span><i class="fa-solid fa-clock"></i> ${post.createdAt}</span>
                            ${post.source ? `<span><i class="fa-solid fa-newspaper"></i> ${post.source}</span>` : ''}
                        </div>
                        <div class="baolu-card-content">
                            ${post.content || ''}
                        </div>
                        ${linkHtml}
                    </div>
                `;
                grid.appendChild(card);
            });
            contentEl.appendChild(grid);
        }
    } catch (e) {
        console.warn('Backend C# is not running. Using default static baolu content.', e);
        if (titleEl) titleEl.innerText = "Cập nhật bão lũ";
        if (contentEl) contentEl.innerHTML = "<p>Lỗi kết nối tới Server. Vui lòng bật Backend.</p>";
    }
}
