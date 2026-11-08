/**
 * APP.JS — CÒ ĐI HỌC OFFICIAL HUB
 * Điều hướng mượt mà, phân loại bài viết, novel viewer, video player,
 * cẩm nang gỡ rối học đường, 57 hội nhóm chất lượng, đối sánh chương trình
 * và widget Zalo bot 0902 209 213.
 * Hoàn toàn đứng về phía phụ huynh — 0% quảng cáo bán hàng, 0% seeding.
 */

document.addEventListener('DOMContentLoaded', () => {
    const data = window.CDH_DATA;
    if (!data) {
        console.error('CDH_DATA not loaded!');
        return;
    }

    // ==========================================
    // 1. BLOG HUB RENDER & FILTER (16 BÀI CHUYÊN SÂU)
    // ==========================================
    const blogGrid = document.getElementById('blogGrid');
    const blogFilterTabs = document.getElementById('blogFilterTabs');
    let currentBlogFilter = 'all';

    function renderBlogs(filter = 'all') {
        if (!blogGrid) return;
        blogGrid.innerHTML = '';

        const filteredBlogs = filter === 'all' 
            ? data.blogs 
            : data.blogs.filter(b => b.level.toLowerCase().includes(filter.toLowerCase()));

        filteredBlogs.forEach(blog => {
            const card = document.createElement('div');
            card.className = 'blog-card';
            card.setAttribute('data-id', blog.id);

            card.innerHTML = `
                <div class="blog-card-header">
                    <span class="badge badge-orange">${blog.level}</span>
                    <span class="badge badge-navy">⏱️ ${blog.readTime} phút đọc</span>
                </div>
                <div class="blog-card-body">
                    <h3 class="blog-card-title">${blog.title}</h3>
                    <div class="blog-card-quote">
                        <strong>Tiếng lòng phụ huynh:</strong> "${blog.quote}"
                    </div>
                    <p class="blog-card-summary">${blog.summary}</p>
                </div>
                <div class="blog-card-footer">
                    <span>Chuyên mục: <strong>${blog.category}</strong></span>
                    <span class="read-more-link">Đọc toàn văn ➔</span>
                </div>
            `;

            card.addEventListener('click', () => openReader(blog));
            blogGrid.appendChild(card);
        });
    }

    if (blogFilterTabs) {
        blogFilterTabs.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-btn')) {
                blogFilterTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                currentBlogFilter = e.target.getAttribute('data-filter') || 'all';
                renderBlogs(currentBlogFilter);
            }
        });
    }

    renderBlogs();

    // ==========================================
    // 2. NOVEL VIEWER MODAL (/ak:markdown-novel-viewer)
    // ==========================================
    const readerModal = document.getElementById('readerModal');
    const closeReaderBtn = document.getElementById('closeReaderBtn');
    const readerProgressBar = document.getElementById('readerProgressBar');
    const readerTocList = document.getElementById('readerTocList');
    const readerArticleTitle = document.getElementById('readerArticleTitle');
    const readerLevelBadge = document.getElementById('readerLevelBadge');
    const readerReadTime = document.getElementById('readerReadTime');
    const readerQuoteText = document.getElementById('readerQuoteText');
    const readerContent = document.getElementById('readerContent');
    const readerAskZaloBtn = document.getElementById('readerAskZaloBtn');

    function openReader(blog) {
        if (!readerModal) return;

        readerArticleTitle.textContent = blog.title;
        readerLevelBadge.textContent = blog.level;
        readerReadTime.textContent = `⏱️ ${blog.readTime} phút đọc (${blog.wordCount} chữ)`;
        readerQuoteText.textContent = `"${blog.quote}"`;
        readerContent.innerHTML = blog.contentHtml;

        // Render TOC
        readerTocList.innerHTML = '';
        if (blog.toc && blog.toc.length > 0) {
            blog.toc.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `<a href="#${item.anchor}" class="toc-link">${item.title}</a>`;
                readerTocList.appendChild(li);
            });
        } else {
            readerTocList.innerHTML = `<li class="text-xs text-slate-500 italic">Toàn văn bài viết liền mạch</li>`;
        }

        // Setup CTA
        if (readerAskZaloBtn) {
            readerAskZaloBtn.onclick = () => {
                const message = encodeURIComponent(`Chào Cò Đi Học, tôi vừa đọc bài "${blog.title}". Tôi muốn xin tư vấn sâu hơn về trường hợp của con tôi.`);
                window.open(`https://zalo.me/0902209213?text=${message}`, '_blank');
            };
        }

        readerModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        readerModal.scrollTop = 0;
    }

    function closeReader() {
        if (!readerModal) return;
        readerModal.classList.remove('active');
        document.body.style.overflow = '';
        if (readerProgressBar) readerProgressBar.style.width = '0%';
    }

    if (closeReaderBtn) {
        closeReaderBtn.addEventListener('click', closeReader);
    }

    if (readerModal) {
        readerModal.addEventListener('click', (e) => {
            if (e.target === readerModal) closeReader();
        });

        // Reading progress calculation
        readerModal.addEventListener('scroll', () => {
            const scrollTop = readerModal.scrollTop;
            const scrollHeight = readerModal.scrollHeight - readerModal.clientHeight;
            if (scrollHeight > 0 && readerProgressBar) {
                const percent = (scrollTop / scrollHeight) * 100;
                readerProgressBar.style.width = `${percent}%`;
            }
        });
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && readerModal && readerModal.classList.contains('active')) {
            closeReader();
        }
    });

    // ==========================================
    // 3. VIDEO HUB PLAYER & PLAYLIST
    // ==========================================
    const mainVideoPlayer = document.getElementById('mainVideoPlayer');
    const videoTitleDisplay = document.getElementById('videoTitleDisplay');
    const videoScriptBody = document.getElementById('videoScriptBody');
    const videoItems = document.querySelectorAll('.video-item');

    const videoDataMap = {
        'v1': {
            title: 'Tập 1 - Con lớp 1 quá tải đánh vần và đọc trơn không hiểu nghĩa',
            src: 'assets/videos/codihoc_c01_kudo_9x16.mp4',
            script: `[00:00 - 00:08] Mở đầu câu chuyện:
"Nhiều phụ huynh lớp 1 hay băn khoăn hỏi Cò: 'Cò ơi, sao con đánh vần vanh vách từng chữ, đọc trơn như gió nhưng hỏi bài nói gì thì con ngơ ngác không biết?'"

[00:09 - 00:25] Góc nhìn tâm lý nhận thức:
"Bản chất là vì con đang dùng toàn bộ năng lượng não bộ để giải mã mặt chữ cơ học, chứ chưa kịp tiêu hóa ngữ nghĩa. Đừng vội trách con lười hay chậm hiểu! Hãy đổi cách học: đọc 1 câu, dừng lại hỏi 1 câu đố vui để kích hoạt trí tưởng tượng của con."

[00:26 - 00:35] Lời nhắn đồng hành:
"Nuôi dạy con là hành trình nuôi dưỡng sự tự tin. Cần Cò Đi Học đồng hành gỡ rối từng bài học, bố mẹ hãy nhắn tin ngay cho Cò trên Zalo nhé!"`
        },
        'v2': {
            title: 'Tập 2 - Môn học liên kết và nỗi lo phụ huynh trường công lập',
            src: 'assets/videos/codihoc_v2_faccontent_9x16.mp4',
            script: `[00:00 - 00:10] Tình huống thực tế đầu năm học:
"Đầu năm học, phụ huynh nhận tờ đơn đăng ký các môn liên kết tự nguyện như Kỹ năng sống, STEM, Tiếng Anh bổ trợ... Nhưng nếu không đăng ký thì sao? Con sẽ ngồi ở đâu?"

[00:11 - 00:28] Đối chiếu quy định của ngành giáo dục:
"Theo đúng quy định hiện hành của Bộ GD&ĐT, nhà trường cần bố trí các tiết liên kết hợp lý và đảm bảo quyền lợi học tập, sinh hoạt an toàn cho những học sinh không tham gia. Phụ huynh có toàn quyền chọn lựa dựa trên nhu cầu thực tế của con."

[00:29 - 00:40] Lời khuyên của Cò Đi Học:
"Hãy bình tĩnh đối thoại văn minh cùng giáo viên chủ nhiệm và Ban đại diện cha mẹ học sinh để cùng tạo ra môi trường học tập lành mạnh nhất cho các con!"`
        }
    };

    videoItems.forEach(item => {
        item.addEventListener('click', () => {
            videoItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            const vidKey = item.getAttribute('data-video') || 'v1';
            const vInfo = videoDataMap[vidKey];
            if (vInfo && mainVideoPlayer) {
                mainVideoPlayer.src = vInfo.src;
                mainVideoPlayer.play();
                if (videoTitleDisplay) videoTitleDisplay.textContent = vInfo.title;
                if (videoScriptBody) videoScriptBody.innerHTML = `<pre class="font-sans whitespace-pre-wrap text-slate-700">${vInfo.script}</pre>`;
            }
        });
    });

    // ==========================================
    // 4. KHO TÀI NGUYÊN TƯƠNG TÁC (RESOURCES HUB)
    // ==========================================
    const resourceNavBtns = document.querySelectorAll('.resource-nav-btn');
    const resourcePanes = document.querySelectorAll('.resource-pane');

    resourceNavBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            resourceNavBtns.forEach(b => b.classList.remove('active'));
            resourcePanes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            const targetPane = document.getElementById(targetId);
            if (targetPane) targetPane.classList.add('active');
        });
    });

    // Render Cẩm Nang Gỡ Rối Học Đường (4 Nhóm Thiết Thực)
    const guidesContainer = document.getElementById('guidesContainer');
    const guideSearchInput = document.getElementById('guideSearchInput');

    function renderPracticalGuides(keyword = '') {
        if (!guidesContainer) return;
        guidesContainer.innerHTML = '';

        const kw = keyword.toLowerCase().trim();
        const groups = data.practicalGuides || [];

        groups.forEach(group => {
            const filteredItems = group.items.filter(item => 
                !kw || 
                item.question.toLowerCase().includes(kw) || 
                item.situation.toLowerCase().includes(kw) || 
                item.advice.toLowerCase().includes(kw)
            );

            if (filteredItems.length === 0) return;

            const groupCard = document.createElement('div');
            groupCard.className = 'guide-group-card';

            let itemsHtml = '';
            filteredItems.forEach((item, idx) => {
                itemsHtml += `
                    <div class="guide-accordion-item">
                        <div class="guide-item-header" onclick="this.parentElement.classList.toggle('active')">
                            <span class="guide-item-title">❓ ${item.question}</span>
                            <span class="guide-item-toggle">▾</span>
                        </div>
                        <div class="guide-item-body">
                            <div class="guide-item-situation">
                                <strong>Băn khoăn của phụ huynh:</strong> "${item.situation}"
                            </div>
                            <div class="guide-item-advice">
                                <strong>💡 Lời giải đáp và hướng gỡ rối từ Cò Đi Học:</strong>
                                <p class="mt-1">${item.advice}</p>
                            </div>
                        </div>
                    </div>
                `;
            });

            groupCard.innerHTML = `
                <div class="guide-group-header">
                    <span class="guide-group-icon">${group.icon}</span>
                    <div>
                        <h3 class="guide-group-title">${group.title}</h3>
                        <p class="guide-group-desc">${group.desc}</p>
                    </div>
                </div>
                <div class="guide-accordion-list">${itemsHtml}</div>
            `;

            guidesContainer.appendChild(groupCard);
        });

        if (guidesContainer.children.length === 0) {
            guidesContainer.innerHTML = `
                <div class="text-center py-12 text-slate-500">
                    <div class="text-3xl mb-2">🔍</div>
                    <p>Không tìm thấy chủ đề phù hợp với từ khóa "${keyword}".</p>
                    <p class="text-xs text-slate-400 mt-1">Bạn có thể nhắn tin trực tiếp tới số Zalo <strong>0902 209 213</strong> để được hỗ trợ tức thì.</p>
                </div>
            `;
        }
    }

    if (guideSearchInput) {
        guideSearchInput.addEventListener('input', (e) => {
            renderPracticalGuides(e.target.value);
        });
    }
    renderPracticalGuides();

    // Render 57 Hội Nhóm Chất Lượng Cao
    const communityTableBody = document.getElementById('communityTableBody');
    const communitySearch = document.getElementById('communitySearch');

    function renderCommunities(keyword = '') {
        if (!communityTableBody) return;
        communityTableBody.innerHTML = '';
        const kw = keyword.toLowerCase().trim();

        const filtered = (data.communities || []).filter(c => 
            !kw || c.name.toLowerCase().includes(kw) || c.category.toLowerCase().includes(kw)
        );

        filtered.forEach(c => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="font-bold text-navy-dark">${c.name}</td>
                <td><span class="badge badge-navy">${c.category}</span></td>
                <td>${c.members} thành viên</td>
                <td><strong class="text-emerald-600 font-bold">${c.score}</strong></td>
                <td><span class="badge badge-green">${c.status}</span></td>
            `;
            communityTableBody.appendChild(tr);
        });
    }

    if (communitySearch) {
        communitySearch.addEventListener('input', (e) => renderCommunities(e.target.value));
    }
    renderCommunities();

    // Render Hồ Sơ Đối Sánh Chương Trình
    const curriculaContainer = document.getElementById('curriculaContainer');
    if (curriculaContainer) {
        curriculaContainer.innerHTML = '';
        (data.curricula || []).forEach(curr => {
            const card = document.createElement('div');
            card.className = 'curricula-card';
            card.innerHTML = `
                <div class="curricula-tag">${curr.tag}</div>
                <h4 class="curricula-title">${curr.system}</h4>
                <div class="curricula-spec">
                    <strong>Trọng tâm giáo dục:</strong>
                    ${curr.focus}
                </div>
                <div class="curricula-spec">
                    <strong class="text-emerald-700">Ưu điểm nổi bật:</strong>
                    ${curr.pros}
                </div>
                <div class="curricula-spec">
                    <strong class="text-rose-700">Điểm cần lưu ý:</strong>
                    ${curr.cons}
                </div>
                <div class="curricula-spec">
                    <strong>Học phí tham chiếu:</strong>
                    ${curr.cost}
                </div>
                <div class="curricula-spec mt-auto pt-3 border-t border-slate-100">
                    <strong class="text-amber-700">Đặc biệt phù hợp với:</strong>
                    ${curr.suitable}
                </div>
            `;
            curriculaContainer.appendChild(card);
        });
    }

    // ==========================================
    // 5. ZALO WIDGET & FLOATING POPUP
    // ==========================================
    const floatingWidgetTrigger = document.getElementById('floatingWidgetTrigger');
    const chatModalPopup = document.getElementById('chatModalPopup');
    const closeChatPopupBtn = document.getElementById('closeChatPopupBtn');
    const popupCategoryTags = document.getElementById('popupCategoryTags');
    const popupQuestionList = document.getElementById('popupQuestionList');

    if (floatingWidgetTrigger && chatModalPopup) {
        floatingWidgetTrigger.addEventListener('click', () => {
            chatModalPopup.classList.toggle('active');
        });
    }

    if (closeChatPopupBtn && chatModalPopup) {
        closeChatPopupBtn.addEventListener('click', () => {
            chatModalPopup.classList.remove('active');
        });
    }

    function renderPopupPrompts(catIndex = 0) {
        if (!popupQuestionList) return;
        popupQuestionList.innerHTML = '';
        const qSource = data.zaloQuestions || [];
        const cat = qSource[catIndex];
        if (!cat) return;

        (cat.questions || []).forEach(pText => {
            const btn = document.createElement('button');
            btn.className = 'question-item-btn';
            btn.innerHTML = `💬 ${pText}`;
            btn.onclick = () => {
                navigator.clipboard.writeText(pText).then(() => {
                    const encoded = encodeURIComponent(pText);
                    window.open(`https://zalo.me/0902209213?text=${encoded}`, '_blank');
                });
            };
            popupQuestionList.appendChild(btn);
        });
    }

    if (popupCategoryTags && data.zaloQuestions) {
        popupCategoryTags.innerHTML = '';
        data.zaloQuestions.forEach((cat, idx) => {
            const span = document.createElement('span');
            span.className = `level-select-tag ${idx === 0 ? 'active' : ''}`;
            span.textContent = `${cat.icon} ${cat.level}`;
            span.onclick = () => {
                popupCategoryTags.querySelectorAll('.level-select-tag').forEach(s => s.classList.remove('active'));
                span.classList.add('active');
                renderPopupPrompts(idx);
            };
            popupCategoryTags.appendChild(span);
        });
        renderPopupPrompts(0);
    }

    // Mobile nav toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
            if (navMenu.style.display === 'flex') {
                navMenu.style.flexDirection = 'column';
                navMenu.style.position = 'absolute';
                navMenu.style.top = '72px';
                navMenu.style.left = '0';
                navMenu.style.width = '100%';
                navMenu.style.backgroundColor = '#ffffff';
                navMenu.style.padding = '20px';
                navMenu.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
            }
        });
    }
});
