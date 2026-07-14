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
            document.body.classList.add('is-sticky');
        } else {
            document.body.classList.remove('is-sticky');
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

async function loadConfig() {
    try {
        const response = await fetch(`${API_BASE}/cau-hinh`);
        if (!response.ok) return;
        const config = await response.json();

        if (config.bannerUrl) {
            const banner = document.querySelector('.header-banner-bg');
            if (banner) {
                banner.style.backgroundImage = `url('${config.bannerUrl}')`;
                banner.style.backgroundSize = 'cover';
                banner.style.backgroundPosition = 'center';
            }
        }
        
        if (config.logoUrl) {
            const logoEl = document.querySelector('.header-content .logo .logo-icon');
            if (logoEl) {
                logoEl.innerHTML = `<img src="${config.logoUrl}" style="max-height: 60px; object-fit: contain;">`;
            }
        }
        
        if (config.headerTextMain) {
            const titleEl = document.querySelector('.header-content .logo-title');
            if (titleEl) {
                titleEl.innerText = config.headerTextMain;
                if (config.headerFontMain) titleEl.style.fontFamily = config.headerFontMain;
            }
        }
        
        if (config.headerTextSub) {
            const subtitleEl = document.querySelector('.header-content .logo-subtitle');
            if (subtitleEl) {
                subtitleEl.innerText = config.headerTextSub;
                if (config.headerFontSub) subtitleEl.style.fontFamily = config.headerFontSub;
            }
        }
        
        if (config.headerTextColor) {
            const titleEl = document.querySelector('.header-content .logo-title');
            const subtitleEl = document.querySelector('.header-content .logo-subtitle');
            if (titleEl) titleEl.style.color = config.headerTextColor;
            if (subtitleEl) subtitleEl.style.color = config.headerTextColor;
        }

        if (config.menuBarBgColor) {
            const navWrapper = document.querySelector('.nav-wrapper');
            if (navWrapper) navWrapper.style.backgroundColor = config.menuBarBgColor;
        }
        
        if (config.welcomeBgColor) {
            const welcomeBanner = document.querySelector('.welcome-banner');
            if (welcomeBanner) {
                welcomeBanner.style.background = config.welcomeBgColor; // Overrides linear-gradient too
            }
        }
        if (config.welcomeTextColor) {
            const welcomeBanner = document.querySelector('.welcome-banner');
            if (welcomeBanner) welcomeBanner.style.color = config.welcomeTextColor;
        }
        if (config.welcomeText) {
            const track = document.querySelector('.welcome-track');
            if (track) {
                const parts = config.welcomeText.split('★').map(p => p.trim());
                let html = '';
                // Duplicate text to create continuous ticker effect
                for (let i = 0; i < 4; i++) {
                    parts.forEach((p, index) => {
                        html += `<span>${p}</span>`;
                        if (index < parts.length - 1) {
                            html += `<span class="star">★</span>`;
                        }
                    });
                    
                    if (i < 3) {
                        if (parts.length > 1) {
                            html += `<span class="star">★</span>`;
                        } else {
                            html += `<span style="display: inline-block; width: 50px;"></span>`;
                        }
                    }
                }
                track.innerHTML = html;
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
        
        if (config.heroBgColor) {
            const heroSection = document.querySelector('.hero-section');
            if (heroSection) heroSection.style.backgroundColor = config.heroBgColor;
        }

        if (config.heroTitle) {
            const heroTitleEl = document.querySelector('.hero-title');
            if (heroTitleEl) heroTitleEl.innerText = config.heroTitle;
        }

        if (config.heroTitleFont) {
            const heroTitleEl = document.querySelector('.hero-title');
            if (heroTitleEl) heroTitleEl.style.fontFamily = config.heroTitleFont;
        }

        if (config.heroTitleColor) {
            const heroTitleEl = document.querySelector('.hero-title');
            if (heroTitleEl) heroTitleEl.style.color = config.heroTitleColor;
        }

        if (config.heroSubtitle) {
            const heroSubtitleEl = document.querySelector('.hero-description');
            if (heroSubtitleEl) heroSubtitleEl.innerText = config.heroSubtitle;
        }

        if (config.heroSubtitleFont) {
            const heroSubtitleEl = document.querySelector('.hero-description');
            if (heroSubtitleEl) heroSubtitleEl.style.fontFamily = config.heroSubtitleFont;
        }

        if (config.heroSubtitleColor) {
            const heroSubtitleEl = document.querySelector('.hero-description');
            if (heroSubtitleEl) heroSubtitleEl.style.color = config.heroSubtitleColor;
        }

        if (config.heroButtonUrl) {
            const heroButtonEl = document.querySelector('.btn-readmore');
            if (heroButtonEl) heroButtonEl.href = config.heroButtonUrl;
        }

        if (config.heroButtonText) {
            const heroButtonSpan = document.querySelector('.btn-readmore span');
            if (heroButtonSpan) heroButtonSpan.innerText = config.heroButtonText;
        }

        if (config.heroButtonFont) {
            const heroButtonEl = document.querySelector('.btn-readmore');
            if (heroButtonEl) heroButtonEl.style.fontFamily = config.heroButtonFont;
        }

        if (config.heroButtonBgColor) {
            const heroButtonEl = document.querySelector('.btn-readmore');
            if (heroButtonEl) heroButtonEl.style.backgroundColor = config.heroButtonBgColor;
        }
        
        if (config.heroImageUrl) {
            const heroImageContainer = document.querySelector('.hero-image');
            if (heroImageContainer) {
                heroImageContainer.innerHTML = `<img src="${config.heroImageUrl}" style="max-width: 100%; height: auto; border-radius: var(--radius-lg); box-shadow: 0 10px 30px rgba(0,0,0,0.1);">`;
            }
        }
        
        // Ticker logic
        if (config.tickerLabelText) {
            const tickerLabel = document.querySelector('.ticker-label');
            if(tickerLabel) tickerLabel.innerHTML = `<i class="fa-solid fa-bullhorn"></i> ${config.tickerLabelText}`;
        }
        
        if (config.tickerLabelColor) {
            const tickerLabel = document.querySelector('.ticker-label');
            if(tickerLabel) {
                tickerLabel.style.backgroundColor = config.tickerLabelColor;
                let dynamicStyle = document.getElementById('dynamic-ticker-style');
                if(!dynamicStyle) {
                    dynamicStyle = document.createElement('style');
                    dynamicStyle.id = 'dynamic-ticker-style';
                    document.head.appendChild(dynamicStyle);
                }
                dynamicStyle.innerHTML = `.ticker-label::after { border-left-color: ${config.tickerLabelColor} !important; }`;
            }
        }

        if (config.tickerItems && Array.isArray(config.tickerItems)) {
            const track = document.querySelector('.ticker-track');
            if(track) {
                let html = '';
                config.tickerItems.forEach(item => {
                    html += `<a href="${item.link}">${item.title}</a><span class="ticker-separator">|</span>`;
                });
                // Duplicate for seamless scrolling
                html += html;
                track.innerHTML = html;
            }
        }

        // Tech Solutions logic
        if (config.techSolutionsItems && Array.isArray(config.techSolutionsItems)) {
            const cards = document.querySelectorAll('.solution-card');
            const font = config.techSolutionsFont;
            const color = config.techSolutionsColor;

            config.techSolutionsItems.forEach((item, index) => {
                if(cards[index]) {
                    const card = cards[index];
                    const h3 = card.querySelector('h3');
                    const p = card.querySelector('p');
                    const a = card.querySelector('a.solution-link');
                    const imgContainer = card.querySelector('.solution-image');
                    
                    if (h3) {
                        h3.innerText = item.title;
                        if (font) h3.style.fontFamily = font;
                        if (color) h3.style.color = color;
                    }
                    if (p) {
                        p.innerText = item.desc;
                        if (font) p.style.fontFamily = font;
                    }
                    if (a) {
                        a.href = item.link;
                        if (color) {
                            a.style.color = color;
                            const svgPath = a.querySelector('svg path');
                            if (svgPath) svgPath.setAttribute('stroke', color);
                        }
                    }
                    if (imgContainer && item.image) {
                        imgContainer.innerHTML = `<img src="${item.image}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;">`;
                    }
                }
            });
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
    loadConfig();
    loadDynamicNews();
    loadHomePageGovData();
    setupSearchForm();
    loadAboutContent();
    loadSupportContent();
    loadHistoryContent();
    loadProductsContent();
    loadOrgChartContent();
    loadStructContent();
    loadCategoryNews();
});

async function loadHomePageGovData() {
    try {
        const response = await fetch(`${API_BASE}/trang-chu`);
        if (!response.ok) return;

        const homeData = await response.json();
        renderAnnouncements(homeData.announcements || []);
        renderDocumentArea(homeData.documentTypes || [], homeData.documents || []);
    } catch (e) {
        console.warn('Không tải được dữ liệu trang chủ từ backend.', e);
    }
}

function renderAnnouncements(announcements) {
    const list = document.querySelector('.announcement-list');
    if (!list || announcements.length === 0) return;

    list.innerHTML = announcements.map(item => {
        const url = item.url || '#';
        return `
            <li>
                <a href="${escapeAttribute(url)}" title="${escapeAttribute(item.title || '')}">
                    ${escapeHtml(item.title || '')}
                </a>
            </li>
        `;
    }).join('');
}

function renderDocumentArea(types, documents) {
    const tabs = document.querySelector('.document-tabs');
    const firstTable = document.getElementById('docTab0');
    if (!tabs || !firstTable || types.length === 0) return;

    tabs.innerHTML = types.map((type, index) => `
        <button class="doc-tab ${index === 0 ? 'active' : ''}" data-tab="${index}" data-type="${escapeAttribute(type.code || '')}">
            ${escapeHtml(type.name || '')}
        </button>
    `).join('');

    const oldTables = document.querySelectorAll('.documents-table');
    oldTables.forEach((table, index) => {
        if (index > 0) table.remove();
    });

    firstTable.id = 'docTab0';
    firstTable.classList.remove('hidden');
    renderDocumentTable(firstTable, documents.filter(doc => doc.typeCode === types[0].code));

    types.slice(1).forEach((type, index) => {
        const table = firstTable.cloneNode(false);
        table.id = `docTab${index + 1}`;
        table.classList.add('hidden');
        renderDocumentTable(table, documents.filter(doc => doc.typeCode === type.code));
        firstTable.parentElement.appendChild(table);
    });

    document.querySelectorAll('.doc-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.doc-tab').forEach(item => item.classList.remove('active'));
            tab.classList.add('active');

            document.querySelectorAll('.documents-table').forEach(table => table.classList.add('hidden'));
            const targetTable = document.getElementById(`docTab${tab.dataset.tab}`);
            if (targetTable) targetTable.classList.remove('hidden');
        });
    });
}

function renderDocumentTable(table, documents) {
    const rows = documents.length === 0
        ? '<div class="table-row"><div class="table-col-content"><p>Chưa có văn bản trong nhóm này.</p></div></div>'
        : documents.map(doc => `
            <div class="table-row">
                <div class="table-col-id">
                    <p class="doc-number">${escapeHtml(doc.documentNumber || '')}</p>
                    <p class="doc-date">${formatDateVi(doc.publishedAt)}</p>
                </div>
                <div class="table-col-content">
                    <p>${escapeHtml(doc.title || '')}</p>
                    <a href="${escapeAttribute(resolveBackendUrl(doc.fileUrl || '#'))}" class="download-link" target="_blank">
                        <i class="fa-solid fa-arrow-down"></i> Tải tài liệu
                    </a>
                </div>
            </div>
        `).join('');

    table.innerHTML = `
        <div class="table-header">
            <div class="table-col-id">SỐ KÝ HIỆU/NGÀY BAN HÀNH</div>
            <div class="table-col-content">NỘI DUNG TRÍCH YẾU</div>
        </div>
        ${rows}
    `;
}

function setupSearchForm() {
    const form = searchForm?.querySelector('form');
    const input = form?.querySelector('input');
    if (!form || !input) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const keyword = input.value.trim();
        if (!keyword) return;

        const panel = ensureSearchResultPanel();
        panel.innerHTML = '<div style="padding: 12px 14px; color: #64748b;">Đang tìm kiếm...</div>';

        try {
            const response = await fetch(`${API_BASE}/tim-kiem?q=${encodeURIComponent(keyword)}&take=8`);
            const payload = await response.json();
            const results = payload.results || [];

            panel.innerHTML = results.length === 0
                ? '<div style="padding: 12px 14px; color: #64748b;">Không tìm thấy kết quả phù hợp.</div>'
                : results.map(item => `
                    <a href="${escapeAttribute(resolveFrontendUrl(item.url || '#'))}" style="display: block; padding: 12px 14px; border-bottom: 1px solid #e2e8f0; color: #0f172a; text-decoration: none;">
                        <strong style="display: block; font-size: 14px; margin-bottom: 4px;">${escapeHtml(item.title || '')}</strong>
                        <span style="display: block; font-size: 12px; color: #64748b;">${escapeHtml(item.type || '')}</span>
                    </a>
                `).join('');
        } catch (e) {
            panel.innerHTML = '<div style="padding: 12px 14px; color: #dc2626;">Không kết nối được backend tìm kiếm.</div>';
        }
    });
}

function ensureSearchResultPanel() {
    let panel = document.getElementById('searchResultPanel');
    if (panel) return panel;

    panel = document.createElement('div');
    panel.id = 'searchResultPanel';
    panel.style.cssText = 'position:absolute;top:52px;right:0;width:min(420px,90vw);max-height:420px;overflow:auto;background:#fff;border:1px solid #dbe3ef;border-radius:8px;box-shadow:0 18px 45px rgba(15,23,42,.18);z-index:9999;';
    searchForm.appendChild(panel);
    return panel;
}

function resolveBackendUrl(url) {
    if (!url || url === '#') return '#';
    return url.startsWith('http') ? url : `http://localhost:5000${url}`;
}

function resolveFrontendUrl(url) {
    if (!url || url === '#') return '#';
    if (url.startsWith('http')) return url;
    return url.startsWith('/') ? `${window.location.origin}${url}` : url;
}

function formatDateVi(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('vi-VN');
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function escapeAttribute(value) {
    return escapeHtml(value);
}

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

async function loadCategoryNews() {
    // Lấy ID danh mục từ thuộc tính data-page-id của thẻ body
    const categoryId = document.body.getAttribute('data-page-id');
    if (!categoryId) return; // Nếu không có thì không phải trang tin tức

    // Lấy phần tử hiển thị (hỗ trợ cả id chung và id cũ của bão lũ để tương thích ngược)
    const titleEl = document.getElementById('dynamic-news-title') || document.getElementById('dynamic-baolu-title');
    const contentEl = document.getElementById('dynamic-news-content') || document.getElementById('dynamic-baolu-content');
    
    if (!titleEl && !contentEl) return;

    try {
        const response = await fetch(`${API_BASE}/${categoryId}`);
        if (!response.ok) return;
        const data = await response.json();
        
        if (titleEl && data.title) titleEl.innerText = data.title;
        if (contentEl) {
            contentEl.innerHTML = '';
            if (!data.posts || data.posts.length === 0) {
                contentEl.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">Chưa có bản tin nào.</p>';
                return;
            }
            
            data.posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            const grid = document.createElement('div');
            grid.className = 'baolu-grid'; // Vẫn giữ class cũ để dùng chung CSS
            
            data.posts.forEach(post => {
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
        console.warn(`Backend C# is not running. Failed to load ${categoryId}.`, e);
        if (contentEl) contentEl.innerHTML = "<p>Lỗi kết nối tới Server. Vui lòng bật Backend.</p>";
    }
}
