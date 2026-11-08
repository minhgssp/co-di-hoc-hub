/**
 * APP.JS — CÒ ĐI HỌC OFFICIAL HUB
 * Điều hướng mượt mà, phân loại 16 bài viết chuyên sâu, trình đọc bài viết (Novel Viewer),
 * trình phát 2 video hoạt hình thực tế, cẩm nang hỏi đáp 16 tình huống thực chứng,
 * bảng đối sánh 4 lộ trình học tập và cổng kết nối Zalo 0902 209 213.
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
            : data.blogs.filter(b => {
                const lv = b.level.toLowerCase();
                const fl = filter.toLowerCase();
                if (fl === 'tiểu học') return lv === 'tiểu học';
                return lv.includes(fl);
            });

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
        if (!readerModal || !blog) return;

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

    window.openReaderById = function(blogId) {
        const targetBlog = (data.blogs || []).find(b => b.id === blogId);
        if (targetBlog) {
            openReader(targetBlog);
        }
    };

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
    // 3. VIDEO HUB PLAYER & PLAYLIST (2 VIDEO THẬT 100%)
    // ==========================================
    const mainVideoPlayer = document.getElementById('mainVideoPlayer');
    const videoTitleDisplay = document.getElementById('videoTitleDisplay');
    const videoScriptBody = document.getElementById('videoScriptBody');
    const videoItems = document.querySelectorAll('.video-item');

    const videoDataMap = {
        'v1': {
            title: 'Tập 1 - Lớp 1 quá tải (Thời lượng 1:20)',
            src: 'assets/videos/codihoc_c01_kudo_9x16.mp4',
            script: `[00:00 - 00:19] Cảnh 1 & 2 - Hai cú sốc đầu đời của học sinh lớp 1:
"Đã tốn bao nhiêu tiền và công sức cho con đi học trước từ mẫu giáo, vậy mà vừa bước vào lớp một, tối nào hai mẹ con cũng đánh vật đến kiệt sức! Cò Đi Học đã rà soát 15 bài thảo luận với 107 bình luận thực tế từ 5 hội nhóm phụ huynh tiểu học. Nỗi bất lực lớn nhất tập trung vào hai cú sốc ngay học kỳ đầu tiên."

[00:20 - 00:39] Cảnh 3 & 4 - Cú sốc số 1 về đánh vần và đọc trơn:
"Cú sốc số một là con chưa đánh vần vững đã phải đọc trơn cả bài thơ dài! Nhiều bé mới học nhận biết mặt chữ, vần 'ung' còn chưa học tới mà bài về nhà đã bắt đọc trơn cả câu. Đánh vần chữ sau thì quên mất chữ trước, hai mẹ con vừa khóc vừa đọc. Có mẹ nghẹn ngào kể chuyện con đọc trơn không kịp còn bị cô giáo gọi nhắc nhở!"

[00:40 - 01:00] Cảnh 5 & 6 - Cú sốc số 2 về chữ viết và hạ cỡ chữ:
"Cú sốc số hai là đã đầu tư cho con học tiền tiểu học nhiều tháng trời, nhưng vào lớp một chữ viết vẫn xấu và không căn nổi ô ly! Viết một trang vở mất cả tiếng đồng hồ, viết rồi tẩy rách giấy, đến lúc hạ cỡ chữ nhỏ lại càng áp lực."

[01:01 - 01:20] Cảnh 7 & 8 - Cơ chế gốc rễ và 3 giải pháp đồng hành vừa sức:
"Vì sao học trước vẫn đuối? Vì nhịp chương trình đang nhảy bậc nhanh hơn sự phát triển tự nhiên của trẻ 6 tuổi. Khi cơ tay con còn non và não bộ chưa quen ghép âm, việc nhồi nhét trước chỉ tạo cảm giác chủ quan giả tạo. Thay vì ngồi quát mắng con đến khuya, bố mẹ hãy chia nhỏ mỗi tối 10 phút ghép vần có nhịp nghỉ, chọn bút ngòi mài trơn không cắn giấy và nhắn Cò Đi Học để chọn đúng lộ trình vừa sức con nhé!"`
        },
        'v2': {
            title: 'Tập 2 - Giải mã bộ nhớ âm vị và sụn cổ tay trẻ 6 tuổi (Thời lượng 1:56)',
            src: 'assets/videos/codihoc_v2_faccontent_9x16.mp4',
            script: `[00:00 - 00:24] Cảnh 1 & 2 - Nghịch lý học tiền tiểu học vẫn trượt nhịp:
"Mười một giờ đêm, hai mẹ con vẫn ngồi khóc bên trang vở Tiếng Việt rách nát. Học tiền tiểu học cả năm rồi, sao vào lớp một con vẫn đuối sức? Ở lớp tiền tiểu học, bé quen nhìn tranh đoán chữ và tô nét chấm sẵn. Vào lớp một, chương trình tăng vọt lên 12 tiết Tiếng Việt mỗi tuần. Chỉ sau 6 tuần đầu, con phải tự đọc trơn thơ dài và hạ cỡ chữ."

[00:25 - 00:58] Cảnh 3 & 4 - Quá tải bộ nhớ âm vị và 8 xương cổ tay còn sụn mềm:
"Não trẻ 6 tuổi phải làm hai bước là giải mã âm rồi mới ghép nghĩa. Khi chưa đánh vần tự động mà ép đọc trơn, bộ nhớ làm việc sẽ quá tải khiến con đọc xong chữ phía sau thì quên sạch chữ phía trước và nhầm vần ăn, ăng. Hơn nữa, 8 xương cổ tay của trẻ 6 tuổi thực chất vẫn còn nhiều mô sụn mềm, chỉ giữ được lực tỳ ổn định trong 5 đến 7 phút. Khi cầm bút ngòi sắc viết liền một giờ, tay con mỏi cứng làm chữ biến dạng."

[00:59 - 01:15] Cảnh 5 - Đối chiếu chuẩn cuối năm của Thông tư 32:
"Qua 107 bình luận, nhiều mẹ kể con đọc chậm bị cô nhắc nhở, có bé ngồi cả tiếng đồng hồ vẫn không viết xong nổi một trang vở. Trong khi đó, Thông tư 32 của Bộ Giáo dục và Đào tạo chỉ yêu cầu đọc trơn vào cuối năm lớp một."

[01:16 - 01:56] Cảnh 6, 7 & 8 - Ba kỹ thuật thực chiến cứu con khỏi sợ học:
"Thứ nhất, mẹ dùng tấm bìa nhỏ che bớt các chữ xung quanh trong câu dài, cho con đánh vần thầm từng từ trong miệng rồi mới bật ra tiếng trơn. Thứ hai, lấy tay che bức tranh minh họa trong sách Tiếng Việt lại, chỉ ngẫu nhiên từ dưới lên trên để trị thói quen nhìn hình đoán chữ. Thứ ba, đừng ép con ngồi viết liền một mạch cả trang vở trong nước mắt mà hãy chia thành 3 chặng 5 phút, mỗi chặng viết 2 dòng rồi xoay cổ tay nghỉ, khen ngay một chữ đẹp nhất trong dòng và đổi sang bút rãnh cầm tam giác ngòi mài êm!"`
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

    // Render Cẩm Nang Gỡ Rối Học Đường (Đúc kết từ 16 bài nghiên cứu thực tế)
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
            filteredItems.forEach((item) => {
                const deepLinkBtn = item.blogId
                    ? `<div class="mt-3 pt-2 border-t border-emerald-200/60">
                           <button type="button" class="read-more-link text-xs font-bold" onclick="window.openReaderById('${item.blogId}')">
                               📖 Đọc bài phân tích chuyên sâu đầy đủ ➔
                           </button>
                       </div>`
                    : '';

                itemsHtml += `
                    <div class="guide-accordion-item">
                        <div class="guide-item-header" onclick="this.parentElement.classList.toggle('active')">
                            <span class="guide-item-title">❓ ${item.question}</span>
                            <span class="guide-item-toggle">▾</span>
                        </div>
                        <div class="guide-item-body">
                            <div class="guide-item-situation">
                                <strong>Tiếng lòng phụ huynh:</strong> "${item.situation}"
                            </div>
                            <div class="guide-item-advice">
                                <strong>💡 Đúc kết pháp lý, khoa học và hướng gỡ rối từ Cò Đi Học:</strong>
                                <p class="mt-1">${item.advice}</p>
                                ${deepLinkBtn}
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
                    <p class="text-xs text-slate-400 mt-1">Bố mẹ có thể nhắn tin trực tiếp tới số Zalo <strong>0902 209 213</strong> để được Cò Đi Học hỗ trợ tức thì.</p>
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

    // Render Hồ Sơ Đối Sánh 4 Lộ Trình Chương Trình
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
                    <strong>Chi phí tham khảo:</strong>
                    ${curr.cost}
                </div>
                <div class="curricula-spec mt-auto pt-3 border-t border-slate-100">
                    <strong class="text-amber-700">Phù hợp với:</strong>
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
