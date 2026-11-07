/**
 * APP.JS — CÒ ĐI HỌC OFFICIAL HUB
 * Điều hướng mượt mà, phân loại bài viết, novel viewer, video player,
 * kho tài nguyên tương tác và widget Zalo bot 0902 209 213.
 */

document.addEventListener('DOMContentLoaded', () => {
    const data = window.CDH_DATA;
    if (!data) {
        console.error('CDH_DATA not loaded!');
        return;
    }

    // ==========================================
    // 1. BLOG HUB RENDER & FILTER
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
            title: 'Tập 1: Con Lớp 1 Quá Tải Đánh Vần & Đọc Trơn Không Hiểu Nghĩa',
            src: 'assets/videos/codihoc_c01_kudo_9x16.mp4',
            script: `[00:00 - 00:08] BỐI CẢNH: Cò Đi Học đeo kính tròn gile navy bước vào khung hình, trên tay cầm quyển sách Tiếng Việt 1.
LỜI THOẠI CÒ ĐI HỌC: "Nhiều phụ huynh lớp 1 hay giật mình hỏi tôi: 'Cò ơi, sao con tôi đánh vần vanh vách từng chữ, đọc trơn như gió nhưng hỏi bài nói gì thì con ngơ ngác không biết?'"
[00:09 - 00:25] PHÂN TÍCH BẢN CHẤT:
LỜI THOẠI: "Bản chất là vì con đang dùng 100% năng lượng não bộ để giải mã mặt chữ cơ học, chứ con chưa hề 'tiêu hóa' ngữ nghĩa. Đừng vội quát mắng con lười hay dốt! Hãy đổi cách học: Đọc 1 câu, dừng lại hỏi 1 câu đố vui để kích hoạt trí tưởng tượng của con."
[00:26 - 00:35] KẾT LUẬN & ĐỒNG HÀNH:
LỜI THOẠI: "Nuôi dạy con là hành trình nuôi dưỡng sự tự tin. Cần Cò Đi Học đồng hành gỡ rối từng bài học, hãy nhắn tin ngay cho Cò trên Zalo nhé!"`
        },
        'v2': {
            title: 'Tập 2: Môn Học Liên Kết & Nỗi Lo Phụ Huynh Trường Công Lập',
            src: 'assets/videos/codihoc_v2_faccontent_9x16.mp4',
            script: `[00:00 - 00:10] BỐI CẢNH: Cò Đi Học cầm thước chỉ bảng, phía sau là sơ đồ lịch học trường công.
LỜI THOẠI: "Đầu năm học, phụ huynh nhận một tờ đơn đăng ký môn liên kết tự nguyện: Kỹ năng sống, STEM, Tiếng Anh bổ trợ... Nhưng nếu không đăng ký thì sao? Con ngồi đâu?"
[00:11 - 00:28] CĂN CỨ VĂN BẢN CHÍNH THỐNG:
LỜI THOẠI: "Theo đúng Thông tư của Bộ GD&ĐT, nhà trường bắt buộc phải xếp các môn liên kết sau giờ chính khóa và có giáo viên quản lý học sinh không tham gia. Phụ huynh có toàn quyền chọn lựa dựa trên nhu cầu thực của con."
[00:29 - 00:40] LỜI KHUYÊN CỦA CÒ ĐI HỌC:
LỜI THOẠI: "Hãy bình tĩnh đối thoại văn minh cùng Ban đại diện cha mẹ học sinh để cùng tạo ra môi trường học tập lành mạnh nhất cho các con!"`
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

    // Render Cây Nỗi Đau 6 Cụm A-F
    const paintreeContainer = document.getElementById('paintreeContainer');
    const paintreeSearch = document.getElementById('paintreeSearch');

    function renderPainTree(keyword = '') {
        if (!paintreeContainer) return;
        paintreeContainer.innerHTML = '';

        const kw = keyword.toLowerCase().trim();

        data.paintree.forEach(cluster => {
            const filteredProblems = cluster.problems.filter(p => 
                !kw || p.title.toLowerCase().includes(kw) || p.quote.toLowerCase().includes(kw) || p.solution.toLowerCase().includes(kw)
            );

            if (filteredProblems.length === 0) return;

            const col = document.createElement('div');
            col.className = 'cluster-card';

            let problemsHtml = '';
            filteredProblems.forEach(p => {
                problemsHtml += `
                    <div class="problem-item">
                        <div class="problem-summary" onclick="this.nextElementSibling.classList.toggle('hidden')">
                            <span><strong>${p.code}:</strong> ${p.title}</span>
                            <span class="text-xs text-amber-600 font-bold">Xem lời khuyên ▾</span>
                        </div>
                        <div class="problem-body hidden">
                            <div class="problem-quote">"${p.quote}"</div>
                            <div class="text-slate-800"><strong class="text-emerald-700">💡 Giải pháp từ Cò Đi Học:</strong> ${p.solution}</div>
                        </div>
                    </div>
                `;
            });

            col.innerHTML = `
                <div class="cluster-header">
                    <span class="cluster-icon">${cluster.icon}</span>
                    <div>
                        <div class="text-xs font-bold text-amber-600">CỤM ${cluster.code}</div>
                        <h4 class="cluster-title">${cluster.name}</h4>
                    </div>
                </div>
                <p class="text-xs text-slate-500 mb-3">${cluster.desc}</p>
                <div class="problem-list">${problemsHtml}</div>
            `;

            paintreeContainer.appendChild(col);
        });
    }

    if (paintreeSearch) {
        paintreeSearch.addEventListener('input', (e) => {
            renderPainTree(e.target.value);
        });
    }
    renderPainTree();

    // Render 57 Hội Nhóm
    const communityTableBody = document.getElementById('communityTableBody');
    const communitySearch = document.getElementById('communitySearch');

    function renderCommunities(keyword = '') {
        if (!communityTableBody) return;
        communityTableBody.innerHTML = '';
        const kw = keyword.toLowerCase().trim();

        const filtered = data.communities.filter(c => 
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
        data.curricula.forEach(curr => {
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

    // Render Bát Tự 5Balance
    const baziGrid = document.getElementById('baziGrid');
    if (baziGrid) {
        baziGrid.innerHTML = '';
        data.bazi.forEach(bz => {
            const bCard = document.createElement('div');
            bCard.className = 'bazi-card';
            bCard.style.borderLeft = `5px solid ${bz.color}`;
            bCard.innerHTML = `
                <div class="bazi-header">
                    <span class="text-2xl">${bz.symbol}</span>
                    <span>${bz.element}</span>
                </div>
                <div class="text-sm text-slate-700 mb-2"><strong>Đặc điểm nhận diện:</strong> ${bz.traits}</div>
                <div class="text-sm text-slate-700 mb-2"><strong class="text-emerald-700">Phương pháp học tối ưu:</strong> ${bz.study_style}</div>
                <div class="text-sm text-rose-700"><strong>Cảnh báo sai lầm:</strong> ${bz.warning}</div>
            `;
            baziGrid.appendChild(bCard);
        });
    }

    // Trắc nghiệm Bát Tự 5Balance
    const baziQuizSelect = document.getElementById('baziQuizSelect');
    const baziQuizResult = document.getElementById('baziQuizResult');
    if (baziQuizSelect && baziQuizResult) {
        baziQuizSelect.addEventListener('change', (e) => {
            const val = parseInt(e.target.value);
            if (val >= 0 && val < data.bazi.length) {
                const bz = data.bazi[val];
                baziQuizResult.innerHTML = `
                    <div class="p-4 bg-white rounded-lg border border-amber-300 shadow-sm mt-3">
                        <h4 class="font-bold text-navy-dark text-base mb-1">${bz.symbol} Kết Quả: Bé Có Khí Chất Thiên Về ${bz.element}</h4>
                        <p class="text-sm text-slate-700 mb-2">${bz.traits}</p>
                        <p class="text-sm text-emerald-800 font-semibold mb-2">Lời khuyên sư phạm: ${bz.study_style}</p>
                        <a href="https://zalo.me/0902209213?text=${encodeURIComponent('Chào Cò Đi Học, tôi muốn nhận bản phân tích Bát Tự chi tiết khí chất học tập cho con tôi.')}" target="_blank" class="inline-flex items-center gap-2 text-xs font-bold text-amber-600 hover:underline">Nhận bản giải mã khí chất 1-1 trên Zalo ➔</a>
                    </div>
                `;
            } else {
                baziQuizResult.innerHTML = '';
            }
        });
    }

    // ==========================================
    // 5. ZALO WIDGET & FLOATING POPUP
    // ==========================================
    const floatingWidgetTrigger = document.getElementById('floatingWidgetTrigger');
    const chatModalPopup = document.getElementById('chatModalPopup');
    const closeChatPopupBtn = document.getElementById('closeChatPopupBtn');
    const popupCategoryTags = document.getElementById('popupCategoryTags');
    const popupQuestionList = document.getElementById('popupQuestionList') || document.getElementById('popupPromptList');

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
        const qSource = data.zaloQuestions; const cat = qSource[catIndex];
        if (!cat) return;

        (cat.questions || cat.prompts).forEach(pText => {
            const btn = document.createElement('button');
            btn.className = 'question-item-btn prompt-item-btn';
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

    if (popupCategoryTags) {
        popupCategoryTags.innerHTML = '';
        (data.zaloQuestions).forEach((cat, idx) => {
            const span = document.createElement('span');
            span.className = `level-select-tag prompt-select-tag ${idx === 0 ? 'active' : ''}`;
            span.textContent = `${cat.icon} ${cat.level}`;
            span.onclick = () => {
                popupCategoryTags.querySelectorAll('.prompt-select-tag').forEach(s => s.classList.remove('active'));
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
