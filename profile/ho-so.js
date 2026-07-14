const API_BASE = 'http://localhost:5000/api';
let isAvatarChanged = false;
let currentAvatarUrl = null;

function getAuthHeaders(extraHeaders = {}) {
    const token = localStorage.getItem('accessToken');
    const tokenType = localStorage.getItem('tokenType') || 'Bearer';
    return token
        ? { ...extraHeaders, Authorization: `${tokenType} ${token}` }
        : extraHeaders;
}

function apiFetch(url, options = {}) {
    const headers = getAuthHeaders(options.headers || {});
    return fetch(url, { ...options, headers });
}

document.addEventListener('DOMContentLoaded', () => {
    const profileContent = document.getElementById('profileContent');
    const loginPrompt = document.getElementById('loginPrompt');
    const currentUser = localStorage.getItem('currentUser');

    if (!currentUser) {
        // Chưa đăng nhập
        profileContent.style.display = 'none';
        loginPrompt.style.display = 'block';
    } else {
        // Đã đăng nhập
        profileContent.style.display = 'flex';
        loginPrompt.style.display = 'none';
        loadUserProfile(currentUser);
    }

    // Xem trước hình ảnh tải lên
    document.getElementById('avatarUpload').addEventListener('change', handleAvatarSelection);
    
    // Xóa hình ảnh
    document.getElementById('removeAvatarBtn').addEventListener('click', handleAvatarRemoval);
    
    // Xử lý gửi biểu mẫu
    document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);
});

async function loadUserProfile(username) {
    try {
        const res = await apiFetch(`${API_BASE}/nguoi-dung/${username}`);
        const data = await res.json();
        
        if (data.success && data.user) {
            const user = data.user;
            
            // Điền thông tin cơ bản
            document.getElementById('username').value = user.username || username;
            document.getElementById('sidebarUsername').textContent = user.fullName || user.username || username;
            document.getElementById('fullName').value = user.fullName || '';
            document.getElementById('email').value = user.email || '';
            document.getElementById('dob').value = user.dateOfBirth || '';
            
            // Hiển thị ảnh đại diện
            if (user.avatarUrl) {
                // Nếu là đường dẫn tương đối, thêm tên miền API
                if (user.avatarUrl.startsWith('/')) {
                    document.getElementById('avatarPreview').src = `http://localhost:5000${user.avatarUrl}`;
                } else {
                    document.getElementById('avatarPreview').src = user.avatarUrl;
                }
                currentAvatarUrl = user.avatarUrl;
            } else {
                document.getElementById('avatarPreview').src = `https://ui-avatars.com/api/?name=${user.username || username}&background=random&size=150`;
                currentAvatarUrl = null;
            }
        } else {
            alert(data.message || 'Không thể tải thông tin hồ sơ.');
        }
    } catch (err) {
        console.error('Error loading profile:', err);
        alert('Lỗi kết nối máy chủ.');
    }
}

function handleAvatarSelection(e) {
    const file = e.target.files[0];
    if (file) {
        // Kiểm tra định dạng tệp
        if (!file.type.startsWith('image/')) {
            alert('Vui lòng chọn file hình ảnh hợp lệ.');
            return;
        }
        
        // Hiển thị xem trước
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('avatarPreview').src = e.target.result;
            isAvatarChanged = true;
        }
        reader.readAsDataURL(file);
    }
}

function handleAvatarRemoval() {
    if (confirm('Bạn có chắc chắn muốn xóa ảnh đại diện hiện tại?')) {
        const username = document.getElementById('username').value;
        document.getElementById('avatarPreview').src = `https://ui-avatars.com/api/?name=${username}&background=random&size=150`;
        document.getElementById('avatarUpload').value = ''; // Xóa dữ liệu đầu vào
        isAvatarChanged = true;
        currentAvatarUrl = null; // Đánh dấu để xóa
    }
}

async function uploadAvatar() {
    const fileInput = document.getElementById('avatarUpload');
    const file = fileInput.files[0];
    
    if (!file) return currentAvatarUrl; // Nếu không có file mới nhưng bị thay đổi, có thể là do bị xóa
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const res = await apiFetch(`${API_BASE}/upload`, {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        
        if (data.success) {
            return data.url;
        } else {
            throw new Error(data.message || 'Upload failed');
        }
    } catch (err) {
        console.error('Upload error:', err);
        throw err;
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const username = localStorage.getItem('currentUser');
    if (!username) return;
    
    const email = document.getElementById('email').value;
    const fullName = document.getElementById('fullName').value;
    const dob = document.getElementById('dob').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const saveBtn = document.getElementById('saveProfileBtn');
    
    // Xác thực mật khẩu
    if (newPassword && newPassword !== confirmPassword) {
        alert('Mật khẩu mới và xác nhận mật khẩu không khớp!');
        return;
    }
    
    // Vô hiệu hóa nút để tránh gửi trùng lặp
    const originalBtnText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang lưu...';
    saveBtn.disabled = true;
    
    try {
        let avatarUrlToSave = currentAvatarUrl;
        
        // Tải lên ảnh mới nếu có thay đổi và không phải bị xóa
        const fileInput = document.getElementById('avatarUpload');
        if (isAvatarChanged && fileInput.files.length > 0) {
            avatarUrlToSave = await uploadAvatar();
        } else if (isAvatarChanged && currentAvatarUrl === null) {
            avatarUrlToSave = null; // Đặt giá trị null rõ ràng
        }
        
        // Chuẩn bị dữ liệu cập nhật
        const payload = {
            fullName: fullName || null,
            email: email || null,
            dateOfBirth: dob || null,
            avatarUrl: avatarUrlToSave
        };
        
        if (newPassword) {
            payload.password = newPassword;
        }
        
        // Gọi API
        const res = await apiFetch(`${API_BASE}/nguoi-dung/${username}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        const data = await res.json();
        
        if (data.success) {
            alert('Cập nhật hồ sơ thành công!');
            
            // Làm trống các trường mật khẩu
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
            
            // Đặt lại các cờ trạng thái
            isAvatarChanged = false;
            if (data.user) {
                currentAvatarUrl = data.user.avatarUrl;
                if (data.user.fullName) {
                    localStorage.setItem('currentFullName', data.user.fullName);
                } else {
                    localStorage.removeItem('currentFullName');
                }
                document.getElementById('sidebarUsername').textContent = data.user.fullName || data.user.username || username;
                window.dispatchEvent(new Event('authProfileChanged'));
            }
        } else {
            alert(data.message || 'Có lỗi xảy ra khi cập nhật hồ sơ.');
        }
        
    } catch (err) {
        console.error('Update profile error:', err);
        alert('Lỗi kết nối máy chủ.');
    } finally {
        saveBtn.innerHTML = originalBtnText;
        saveBtn.disabled = false;
    }
}
