document.addEventListener('DOMContentLoaded', () => {
    const PAGE_ID = 'chuc-nang-nhiem-vu';
    
    const commentsSort = document.getElementById('commentsSort');
    const commentsInputArea = document.getElementById('commentsInputArea');
    const commentsLoginPrompt = document.getElementById('commentsLoginPrompt');
    const commentInput = document.getElementById('commentInput');
    const postCommentBtn = document.getElementById('postCommentBtn');
    const commentsList = document.getElementById('commentsList');
    
    const promptLoginBtn = document.getElementById('promptLoginBtn');
    const promptRegisterBtn = document.getElementById('promptRegisterBtn');
    
    let allComments = [];
    
    function checkLoginState() {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            commentsInputArea.style.display = 'block';
            commentsLoginPrompt.style.display = 'none';
        } else {
            commentsInputArea.style.display = 'none';
            commentsLoginPrompt.style.display = 'block';
        }
    }
    
    window.addEventListener('userLoginStateChanged', checkLoginState);
    checkLoginState();
    
    // Liên kết hiển thị đăng nhập
    if (promptLoginBtn) {
        promptLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('userBtn').click();
            document.getElementById('tabLogin').click();
        });
    }
    if (promptRegisterBtn) {
        promptRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('userBtn').click();
            document.getElementById('tabRegister').click();
        });
    }
    
    async function fetchComments() {
        try {
            const res = await fetch(`http://localhost:5000/api/binh-luan?pageId=${PAGE_ID}`);
            allComments = await res.json();
            renderComments();
        } catch (err) {
            console.error('Lỗi khi tải bình luận', err);
        }
    }
    
    function renderComments() {
        const sortMode = commentsSort.value;
        let sorted = [...allComments];
        
        if (sortMode === 'likes') {
            sorted.sort((a, b) => b.Likes - a.Likes);
        } else if (sortMode === 'newest') {
            sorted.sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
        } else if (sortMode === 'oldest') {
            sorted.sort((a, b) => new Date(a.CreatedAt) - new Date(b.CreatedAt));
        }
        
        commentsList.innerHTML = '';
        if (sorted.length === 0) {
            commentsList.innerHTML = '<p class="no-comments">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>';
            return;
        }
        
        sorted.forEach(c => {
            const div = document.createElement('div');
            div.className = 'comment-item';
            div.innerHTML = `
                <div class="comment-avatar"><i class="fa-solid fa-user"></i></div>
                <div class="comment-content-box">
                    <div class="comment-meta">
                        <span class="comment-author">${c.Username}</span>
                        <span class="comment-date">${c.CreatedAt}</span>
                    </div>
                    <div class="comment-text">${c.Content.replace(/\n/g, '<br>')}</div>
                    <div class="comment-actions">
                        <button class="like-btn" data-id="${c.Id}">
                            <i class="fa-regular fa-thumbs-up"></i> Hữu ích (<span class="like-count">${c.Likes}</span>)
                        </button>
                    </div>
                </div>
            `;
            commentsList.appendChild(div);
        });
        
        // Thêm sự kiện thích
        document.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const currentUser = localStorage.getItem('currentUser');
                if (!currentUser) {
                    alert('Vui lòng đăng nhập để thực hiện chức năng này.');
                    return;
                }
                const id = e.currentTarget.getAttribute('data-id');
                try {
                    const res = await fetch(`http://localhost:5000/api/binh-luan/${id}/like`, { method: 'POST' });
                    const data = await res.json();
                    if (data.success) {
                        e.currentTarget.querySelector('.like-count').textContent = data.likes;
                        // Cập nhật bộ đệm cục bộ
                        const idx = allComments.findIndex(x => x.Id === id);
                        if(idx > -1) allComments[idx].Likes = data.likes;
                    }
                } catch(err) {
                    console.error(err);
                }
            });
        });
    }
    
    commentsSort.addEventListener('change', renderComments);
    
    
    commentInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            postCommentBtn.click();
        }
    });

    postCommentBtn.addEventListener('click', async () => {
        const text = commentInput.value.trim();
        if (!text) return;
        
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) return;
        
        try {
            const res = await fetch('http://localhost:5000/api/binh-luan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    PageId: PAGE_ID,
                    Username: currentUser,
                    Content: text
                })
            });
            const data = await res.json();
            if (data.success) {
                commentInput.value = '';
                allComments.push(data.comment);
                renderComments();
            }
        } catch (err) {
            console.error('Lỗi khi đăng bình luận', err);
        }
    });
    
    fetchComments();
});
