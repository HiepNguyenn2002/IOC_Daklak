const API_BASE = 'http://localhost:5000/api';

// Hiển thị thông báo
function showAlert(message, isSuccess = true) {
    const alertBox = document.getElementById('alert-box');
    alertBox.textContent = message;
    alertBox.className = `alert ${isSuccess ? 'success' : 'error'}`;
    setTimeout(() => {
        alertBox.className = 'alert';
    }, 3000);
}

// Xử lý đóng mở menu Giới thiệu
function toggleMenu(element) {
    const submenu = element.nextElementSibling;
    submenu.classList.toggle('open');
    const icon = element.querySelector('.drop-icon');
    icon.classList.toggle('rotate');
}

// Chuyển Tab
document.querySelectorAll('.tab-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const targetId = e.currentTarget.dataset.target;
        document.getElementById(targetId).classList.add('active');
        if (targetId === 'accounts-tab') {
            loadUsers();
        } else if (e.currentTarget.classList.contains('news-category-link')) {
            const categoryId = e.currentTarget.dataset.category;
            const categoryName = e.currentTarget.textContent.trim();
            document.getElementById('newsTabTitle').textContent = `Quản lý ${categoryName}`;
            loadNews(categoryId);
        }
    });
});

// Load danh sách người dùng
let allUsers = [];

async function loadUsers() {
    try {
        const res = await fetch(`${API_BASE}/nguoi-dung`);
        allUsers = await res.json();
        renderUsers(allUsers);
    } catch (err) {
        console.error('Lỗi khi tải danh sách người dùng:', err);
    }
}

function renderUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="padding: 20px; text-align: center; color: #888;">Chưa có người dùng nào.</td></tr>';
        return;
    }
    
    users.forEach(u => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #f1f5f9';
        tr.style.transition = 'background 0.2s';
        tr.onmouseover = () => tr.style.background = '#f8fafc';
        tr.onmouseout = () => tr.style.background = 'transparent';
        
        let role = '<span style="background: #e2e8f0; color: #475569; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">Người dùng</span>';
        if ((u.username || '').toLowerCase() === 'admin') {
            role = '<span style="background: #fef3c7; color: #d97706; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">Quản trị viên</span>';
        }
        
        let status = '';
        if (u.isActive || u.isActive === undefined) {
            status = '<span style="display: flex; align-items: center; gap: 5px; color: #10b981; font-weight: 500;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></span>Hoạt động</span>';
        } else {
            status = '<span style="display: flex; align-items: center; gap: 5px; color: #ef4444; font-weight: 500;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #ef4444;"></span>Đã khóa</span>';
        }
        
        const displayName = u.fullName || u.username || 'Không xác định';
        
        tr.innerHTML = `
            <td style="padding: 15px 12px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 36px; height: 36px; border-radius: 50%; background: #e0f2fe; color: #0284c7; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                        ${displayName.charAt(0).toUpperCase()}
                    </div>
                    <span style="font-weight: 600; color: #0f172a;">${displayName}</span>
                </div>
            </td>
            <td style="padding: 15px 12px; font-family: monospace; color: #64748b;">${u.username}</td>
            <td style="padding: 15px 12px;">${role}</td>
            <td style="padding: 15px 12px;">${status}</td>
            <td style="padding: 15px 12px; color: #64748b;">${u.registerDate || ''}</td>
            <td style="padding: 15px 12px; text-align: center;">
                <button title="Sửa" style="background: none; border: none; color: #3b82f6; cursor: pointer; margin-right: 8px; font-size: 15px;" onclick="editUser('${u.username}')"><i class="fa-solid fa-pen-to-square"></i></button>
                <button title="Khóa/Xóa" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 15px;" onclick="deleteUser('${u.username}')"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Tìm kiếm người dùng
document.getElementById('searchAccountInput')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allUsers.filter(u => 
        (u.username || '').toLowerCase().includes(term) || 
        (u.fullName || '').toLowerCase().includes(term) ||
        (u.email || '').toLowerCase().includes(term)
    );
    renderUsers(filtered);
});


// Load cấu hình hiện tại
async function loadConfig() {
    try {
        const response = await fetch(`${API_BASE}/cau-hinh`);
        const config = await response.json();
        if(config) {
            if(config.bannerUrl) document.getElementById('bannerUrl').value = config.bannerUrl;
            if(config.bodyBgColor) document.getElementById('bodyBgColor').value = config.bodyBgColor;
            if(config.newsSectionBgColor) document.getElementById('newsSectionBgColor').value = config.newsSectionBgColor;
            if(config.infoUtilityBgColor) document.getElementById('infoUtilityBgColor').value = config.infoUtilityBgColor;
        }
    } catch (e) {
        console.error("Lỗi lấy cấu hình:", e);
    }
}

// Lưu cấu hình
document.getElementById('config-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const config = {
        bannerUrl: document.getElementById('bannerUrl').value,
        bodyBgColor: document.getElementById('bodyBgColor').value,
        newsSectionBgColor: document.getElementById('newsSectionBgColor').value,
        infoUtilityBgColor: document.getElementById('infoUtilityBgColor').value
    };

    try {
        const response = await fetch(`${API_BASE}/cau-hinh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        });
        const result = await response.json();
        if(result.success) showAlert(result.message);
        else showAlert('Lỗi lưu cấu hình', false);
    } catch (error) {
        showAlert('Lỗi kết nối tới Server', false);
    }
});

// Khởi tạo
document.addEventListener('DOMContentLoaded', () => {
    window.editors = {};
    const quillOptions = {
        theme: 'snow',
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'align': [] }],
                ['link', 'image'],
                ['clean']
            ]
        }
    };
    ['about', 'support', 'history', 'products', 'orgchart', 'struct'].forEach(key => {
        const editor = new Quill('#' + key + 'Content', quillOptions);
        
        // Loại bỏ nền xám (background) và màu chữ khi paste từ web khác vào
        editor.clipboard.addMatcher(Node.ELEMENT_NODE, function(node, delta) {
            delta.ops.forEach(function(op) {
                if (op.attributes) {
                    delete op.attributes.background;
                    delete op.attributes.color;
                }
            });
            return delta;
        });
        
        window.editors[key] = editor;
    });

    loadConfig();
    loadAbout();
    loadSupport();
    loadHistory();
    loadProducts();
    loadOrgChart();
    loadStruct();
    loadStruct();
});

// Load dữ liệu trang giới thiệu
async function loadAbout() {
    try {
        const response = await fetch(`${API_BASE}/chuc-nang-nhiem-vu`);
        if(response.ok) {
            const about = await response.json();
            if(about) {
                if(about.title) document.getElementById('aboutTitle').value = about.title;
                if(about.content) window.editors['about'].clipboard.dangerouslyPasteHTML(about.content);
            }
        }
    } catch (e) {
        console.error("Lỗi lấy dữ liệu trang giới thiệu:", e);
    }
}

// Lưu dữ liệu trang giới thiệu
document.getElementById('about-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const aboutData = {
        title: document.getElementById('aboutTitle').value,
        content: window.editors['about'].root.innerHTML
    };

    try {
        const response = await fetch(`${API_BASE}/chuc-nang-nhiem-vu`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(aboutData)
        });
        const result = await response.json();
        if(result.success) showAlert(result.message);
        else showAlert('Lỗi lưu trang giới thiệu', false);
    } catch (error) {
        showAlert('Lỗi kết nối tới Server', false);
    }
});

// Load dữ liệu trang hỗ trợ
async function loadSupport() {
    try {
        const response = await fetch(`${API_BASE}/dau-moi-ho-tro`);
        if(response.ok) {
            const support = await response.json();
            if(support) {
                if(support.title) document.getElementById('supportTitle').value = support.title;
                if(support.content) window.editors['support'].clipboard.dangerouslyPasteHTML(support.content);
            }
        }
    } catch (e) {
        console.error("Lỗi lấy dữ liệu trang hỗ trợ:", e);
    }
}

// Lưu dữ liệu trang hỗ trợ
document.getElementById('support-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const supportData = {
        title: document.getElementById('supportTitle').value,
        content: window.editors['support'].root.innerHTML
    };

    try {
        const response = await fetch(`${API_BASE}/dau-moi-ho-tro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(supportData)
        });
        const result = await response.json();
        if(result.success) showAlert(result.message);
        else showAlert('Lỗi lưu trang hỗ trợ', false);
    } catch (error) {
        showAlert('Lỗi kết nối tới Server', false);
    }
});

// Load dữ liệu trang lịch sử
async function loadHistory() {
    try {
        const response = await fetch(`${API_BASE}/lich-su-hinh-thanh`);
        if(response.ok) {
            const history = await response.json();
            if(history) {
                if(history.title) document.getElementById('historyTitle').value = history.title;
                if(history.content) window.editors['history'].clipboard.dangerouslyPasteHTML(history.content);
            }
        }
    } catch (e) {
        console.error("Lỗi lấy dữ liệu trang lịch sử:", e);
    }
}

// Lưu dữ liệu trang lịch sử
document.getElementById('history-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const historyData = {
        title: document.getElementById('historyTitle').value,
        content: window.editors['history'].root.innerHTML
    };

    try {
        const response = await fetch(`${API_BASE}/lich-su-hinh-thanh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(historyData)
        });
        const result = await response.json();
        if(result.success) showAlert(result.message);
        else showAlert('Lỗi lưu trang lịch sử', false);
    } catch (error) {
        showAlert('Lỗi kết nối tới Server', false);
    }
});

// Load dữ liệu trang sản phẩm
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE}/san-pham-tieu-bieu`);
        if(response.ok) {
            const products = await response.json();
            if(products) {
                if(products.title) document.getElementById('productsTitle').value = products.title;
                if(products.content) window.editors['products'].clipboard.dangerouslyPasteHTML(products.content);
            }
        }
    } catch (e) {
        console.error("Lỗi lấy dữ liệu trang sản phẩm:", e);
    }
}

// Lưu dữ liệu trang sản phẩm
document.getElementById('products-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const productsData = {
        title: document.getElementById('productsTitle').value,
        content: window.editors['products'].root.innerHTML
    };

    try {
        const response = await fetch(`${API_BASE}/san-pham-tieu-bieu`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productsData)
        });
        const result = await response.json();
        if(result.success) showAlert(result.message);
        else showAlert('Lỗi lưu trang sản phẩm', false);
    } catch (error) {
        showAlert('Lỗi kết nối tới Server', false);
    }
});

// Load dữ liệu trang sơ đồ tổ chức
async function loadOrgChart() {
    try {
        const response = await fetch(`${API_BASE}/so-do-to-chuc`);
        if(response.ok) {
            const orgchart = await response.json();
            if(orgchart) {
                if(orgchart.title) document.getElementById('orgchartTitle').value = orgchart.title;
                if(orgchart.content) window.editors['orgchart'].clipboard.dangerouslyPasteHTML(orgchart.content);
            }
        }
    } catch (e) {
        console.error("Lỗi lấy dữ liệu trang sơ đồ tổ chức:", e);
    }
}

// Lưu dữ liệu trang sơ đồ tổ chức
document.getElementById('orgchart-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const orgchartData = {
        title: document.getElementById('orgchartTitle').value,
        content: window.editors['orgchart'].root.innerHTML
    };

    try {
        const response = await fetch(`${API_BASE}/so-do-to-chuc`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orgchartData)
        });
        const result = await response.json();
        if(result.success) showAlert(result.message);
        else showAlert('Lỗi lưu trang sơ đồ tổ chức', false);
    } catch (error) {
        showAlert('Lỗi kết nối tới Server', false);
    }
});

// Load dữ liệu trang cơ cấu tổ chức
async function loadStruct() {
    try {
        const response = await fetch(`${API_BASE}/co-cau-to-chuc`);
        if(response.ok) {
            const structData = await response.json();
            if(structData) {
                if(structData.title) document.getElementById('structTitle').value = structData.title;
                if(structData.content) window.editors['struct'].clipboard.dangerouslyPasteHTML(structData.content);
            }
        }
    } catch (e) {
        console.error("Lỗi lấy dữ liệu trang cơ cấu tổ chức:", e);
    }
}

// Lưu dữ liệu trang cơ cấu tổ chức
document.getElementById('struct-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const structDataPayload = {
        title: document.getElementById('structTitle').value,
        content: window.editors['struct'].root.innerHTML
    };

    try {
        const response = await fetch(`${API_BASE}/co-cau-to-chuc`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(structDataPayload)
        });
        const result = await response.json();
        if(result.success) showAlert(result.message);
        else showAlert('Lỗi lưu trang cơ cấu tổ chức', false);
    } catch (error) {
        showAlert('Lỗi kết nối tới Server', false);
    }
});


// --- Quản lý Danh mục Tin tức động ---
let newsDataGlobal = { title: "", posts: [] };
let newsEditor = null;
let isEditingNews = false;
let currentNewsCategory = '';

document.addEventListener('DOMContentLoaded', () => {
    newsEditor = new Quill('#newsFormContent', {
        theme: 'snow',
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['link', 'image'],
                ['clean']
            ]
        }
    });
});

async function loadNews(categoryId) {
    currentNewsCategory = categoryId;
    try {
        const response = await fetch(`${API_BASE}/${categoryId}`);
        if(response.ok) {
            newsDataGlobal = await response.json();
            if (!newsDataGlobal.posts) newsDataGlobal.posts = [];
            renderNewsTable();
        }
    } catch (e) {
        console.error(`Lỗi lấy dữ liệu tin tức ${categoryId}:`, e);
    }
}

function renderNewsTable() {
    const tbody = document.getElementById('newsTableBody');
    tbody.innerHTML = '';
    
    newsDataGlobal.posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    newsDataGlobal.posts.forEach(post => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = "1px solid #e2e8f0";
        tr.innerHTML = `
            <td style="padding: 12px;"><img src="${post.imageUrl || 'https://via.placeholder.com/100x60'}" style="width: 80px; height: 50px; object-fit: cover; border-radius: 4px;"></td>
            <td style="padding: 12px; font-weight: 500;">${post.title}</td>
            <td style="padding: 12px;">${post.source || '-'}</td>
            <td style="padding: 12px; color: #64748b;">${post.createdAt}</td>
            <td style="padding: 12px; text-align: center;">
                <button onclick="editNews('${post.id}')" style="background: none; border: none; color: #3b82f6; cursor: pointer; margin-right: 10px;" title="Sửa"><i class="fa-solid fa-pen"></i></button>
                <button onclick="deleteNews('${post.id}')" style="background: none; border: none; color: #ef4444; cursor: pointer;" title="Xóa"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openNewsModal() {
    if (!currentNewsCategory) {
        showAlert('Vui lòng chọn một danh mục bên trái trước', false);
        return;
    }
    isEditingNews = false;
    document.getElementById('newsModalTitle').textContent = 'Đăng tin bài mới';
    document.getElementById('newsPostForm').reset();
    document.getElementById('newsFormId').value = '';
    newsEditor.root.innerHTML = '';
    document.getElementById('newsModal').style.display = 'flex';
}

function closeNewsModal() {
    document.getElementById('newsModal').style.display = 'none';
}

function editNews(id) {
    const post = newsDataGlobal.posts.find(p => p.id === id);
    if (!post) return;
    
    isEditingNews = true;
    document.getElementById('newsModalTitle').textContent = 'Sửa tin bài';
    document.getElementById('newsFormId').value = post.id;
    document.getElementById('newsFormTitle').value = post.title;
    document.getElementById('newsFormImageUrl').value = post.imageUrl || '';
    document.getElementById('newsFormSource').value = post.source || '';
    document.getElementById('newsFormLinkUrl').value = post.linkUrl || '';
    document.getElementById('newsFormLinkText').value = post.linkText || '';
    newsEditor.root.innerHTML = post.content || '';
    
    document.getElementById('newsModal').style.display = 'flex';
}

async function deleteNews(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa tin này?')) return;
    
    newsDataGlobal.posts = newsDataGlobal.posts.filter(p => p.id !== id);
    await saveNewsToServer('Đã xóa tin bài.');
}

document.getElementById('newsPostForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    let imageUrl = document.getElementById('newsFormImageUrl').value;
    const fileInput = document.getElementById('newsFormImageUpload');
    
    // Nếu có file upload, ưu tiên dùng file upload
    if (fileInput.files.length > 0) {
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        try {
            const upRes = await fetch(`${API_BASE}/upload`, { method: 'POST', body: formData });
            const upData = await upRes.json();
            if (upData.url) {
                imageUrl = upData.url;
            } else {
                showAlert('Lỗi tải ảnh lên', false);
                return;
            }
        } catch (err) {
            showAlert('Lỗi tải ảnh lên', false);
            return;
        }
    }
    
    const postData = {
        title: document.getElementById('newsFormTitle').value,
        imageUrl: imageUrl,
        source: document.getElementById('newsFormSource').value,
        content: newsEditor.root.innerHTML,
        linkUrl: document.getElementById('newsFormLinkUrl').value,
        linkText: document.getElementById('newsFormLinkText').value
    };
    
    if (isEditingNews) {
        const id = document.getElementById('newsFormId').value;
        const index = newsDataGlobal.posts.findIndex(p => p.id === id);
        if (index > -1) {
            postData.id = id;
            postData.createdAt = newsDataGlobal.posts[index].createdAt;
            newsDataGlobal.posts[index] = postData;
        }
    } else {
        postData.id = Date.now().toString();
        const d = new Date();
        postData.createdAt = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0') + ' ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0') + ':' + String(d.getSeconds()).padStart(2,'0');
        newsDataGlobal.posts.push(postData);
    }
    
    await saveNewsToServer(isEditingNews ? 'Cập nhật thành công!' : 'Đã đăng tin mới!');
    closeNewsModal();
});

async function saveNewsToServer(successMessage) {
    if (!currentNewsCategory) return;
    try {
        const response = await fetch(`${API_BASE}/${currentNewsCategory}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newsDataGlobal)
        });
        const result = await response.json();
        if(result.success) {
            showAlert(successMessage);
            renderNewsTable();
        } else {
            showAlert('Lỗi lưu danh mục tin tức', false);
        }
    } catch (error) {
        showAlert('Lỗi kết nối tới Server', false);
    }
}



// --- Xử lý Quản lý người dùng ---
let isEditingUser = false;
let editingUsername = '';

function openUserModal() {
    isEditingUser = false;
    document.getElementById('userModalTitle').textContent = 'Thêm Tài Khoản Mới';
    document.getElementById('userForm').reset();
    document.getElementById('userFormUsername').disabled = false;
    document.getElementById('pwdRequired').style.display = 'inline';
    document.getElementById('pwdHint').style.display = 'none';
    document.getElementById('userFormActive').value = 'true';
    document.getElementById('userModal').style.display = 'flex';
}

function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
}

function editUser(username) {
    const user = allUsers.find(u => u.username === username);
    if (!user) return;
    
    isEditingUser = true;
    editingUsername = username;
    
    document.getElementById('userModalTitle').textContent = 'Sửa Tài Khoản';
    document.getElementById('userFormUsername').value = user.username;
    document.getElementById('userFormUsername').disabled = true;
    
    document.getElementById('userFormFullName').value = user.fullName || '';
    document.getElementById('userFormEmail').value = user.email || '';
    document.getElementById('userFormPassword').value = '';
    
    document.getElementById('pwdRequired').style.display = 'none';
    document.getElementById('pwdHint').style.display = 'block';
    
    document.getElementById('userFormActive').value = user.isActive === false ? 'false' : 'true';
    
    document.getElementById('userModal').style.display = 'flex';
}

async function deleteUser(username) {
    if (username.toLowerCase() === 'admin') {
        showAlert('Không thể xóa tài khoản admin gốc', false);
        return;
    }
    
    if (confirm(`Bạn có chắc chắn muốn xóa tài khoản "${username}" không?`)) {
        try {
            const res = await fetch(`${API_BASE}/admin/nguoi-dung/${username}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                showAlert('Đã xóa tài khoản');
                loadUsers();
            } else {
                showAlert(data.message || 'Lỗi khi xóa', false);
            }
        } catch (err) {
            console.error(err);
            showAlert('Lỗi kết nối máy chủ', false);
        }
    }
}

document.getElementById('userForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('userFormUsername').value;
    const fullName = document.getElementById('userFormFullName').value;
    const email = document.getElementById('userFormEmail').value;
    const password = document.getElementById('userFormPassword').value;
    const isActive = document.getElementById('userFormActive').value === 'true';
    
    if (!isEditingUser && !password) {
        alert('Vui lòng nhập mật khẩu cho tài khoản mới.');
        return;
    }
    
    const payload = {
        username,
        fullName: fullName || null,
        email: email || null,
        isActive
    };
    if (password) {
        payload.password = password;
    }
    
    try {
        const url = isEditingUser 
            ? `${API_BASE}/admin/nguoi-dung/${username}` 
            : `${API_BASE}/admin/nguoi-dung`;
            
        const res = await fetch(url, {
            method: isEditingUser ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const data = await res.json();
        if (data.success) {
            showAlert(data.message);
            closeUserModal();
            loadUsers();
        } else {
            showAlert(data.message || 'Lỗi', false);
        }
    } catch (err) {
        console.error(err);
        showAlert('Lỗi kết nối máy chủ', false);
    }
});
