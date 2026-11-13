/**
 * APP.JS — CÒ ĐI HỌC OFFICIAL HUB
 * Điều hướng mượt mà, phân loại 16 bài viết chuyên sâu (hiển thị tiệm tiến 6 bài + mở rộng 16 bài),
 * trình đọc bài viết (Novel Viewer kèm Mục lục Mobile & Thu gọn tài liệu tham khảo),
 * trình phát Video giới thiệu Cò Đi Học đồng bộ 5 chương mục,
 * cẩm nang hỏi đáp 16 tình huống thực chứng kèm Quick Filter Chips,
 * bảng đối sánh 4 lộ trình học tập và cổng kết nối Zalo 0902 209 213.
 */

document.addEventListener('DOMContentLoaded', () => {
    const data = window.CDH_DATA;
    if (!data) {
        console.error('CDH_DATA not loaded!');
        return;
    }

    // ==========================================
    // 1. BLOG HUB RENDER & FILTER (THUMBNAIL + TIÊU ĐỀ TỐI ƯU - PROGRESSIVE DISCLOSURE)
    // ==========================================
    const blogGrid = document.getElementById('blogGrid');
    const blogFilterTabs = document.getElementById('blogFilterTabs');
    const blogExpandWrap = document.getElementById('blogExpandWrap');
    const toggleAllBlogsBtn = document.getElementById('toggleAllBlogsBtn');
    let currentBlogFilter = 'all';
    let isBlogExpanded = false;

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

        filteredBlogs.forEach((blog, idx) => {
            const card = document.createElement('div');
            const shouldCollapse = (filter === 'all' && !isBlogExpanded && idx >= 6);
            card.className = `blog-card${shouldCollapse ? ' blog-card-collapsed' : ''}`;
            card.setAttribute('data-id', blog.id);

            card.innerHTML = `
                <div class="blog-card-thumb-wrap">
                    <img src="${blog.thumbnail}" alt="${blog.title}" class="blog-card-thumb">
                </div>
                <div class="blog-card-body">
                    <h3 class="blog-card-title">${blog.title}</h3>
                </div>
            `;

            card.addEventListener('click', () => openReader(blog));
            blogGrid.appendChild(card);
        });

        if (blogExpandWrap && toggleAllBlogsBtn) {
            if (filter === 'all' && filteredBlogs.length > 6) {
                blogExpandWrap.style.display = 'block';
                const hiddenCount = filteredBlogs.length - 6;
                toggleAllBlogsBtn.innerHTML = isBlogExpanded
                    ? `<span>🔼 Thu gọn bớt (chỉ hiện 6 bài tiêu biểu)</span>`
                    : `<span>📖 Xem thêm ${hiddenCount} bài viết khác ▾</span>`;
            } else {
                blogExpandWrap.style.display = 'none';
            }
        }
    }

    if (toggleAllBlogsBtn) {
        toggleAllBlogsBtn.addEventListener('click', () => {
            isBlogExpanded = !isBlogExpanded;
            renderBlogs(currentBlogFilter);
        });
    }

    if (blogFilterTabs) {
        blogFilterTabs.addEventListener('click', (e) => {
            const btn = e.target.closest('.tab-btn');
            if (btn) {
                blogFilterTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentBlogFilter = btn.getAttribute('data-filter') || 'all';
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
    const readerMobileTocWrap = document.getElementById('readerMobileTocWrap');
    const readerMobileTocList = document.getElementById('readerMobileTocList');
    const readerArticleTitle = document.getElementById('readerArticleTitle');
    const readerLevelBadge = document.getElementById('readerLevelBadge');
    const readerReadTime = document.getElementById('readerReadTime');
    const readerQuoteText = document.getElementById('readerQuoteText');
    const readerContent = document.getElementById('readerContent');
    const readerAskZaloBtn = document.getElementById('readerAskZaloBtn');
    const readerBottomZaloBtn = document.getElementById('readerBottomZaloBtn');

    function formatArticleHtmlWithCollapsibleSources(rawHtml) {
        if (!rawHtml) return '';
        const marker = "<h2 id='can-cu-phap-ly-va-tai-lieu-tham-khao'";
        const idx = rawHtml.indexOf(marker);
        if (idx === -1) return rawHtml;

        const mainPart = rawHtml.slice(0, idx);
        const tailPart = rawHtml.slice(idx);
        return `${mainPart}
            <details class="legal-sources-details mt-8">
                <summary class="legal-sources-summary">
                    <span>📚 Xem chi tiết văn bản pháp lý, tài liệu khoa học và bình luận khảo sát gốc</span>
                    <span class="legal-sources-hint">Bấm để mở rộng ▾</span>
                </summary>
                <div class="legal-sources-body">
                    ${tailPart}
                </div>
            </details>`;
    }

    function openReader(blog) {
        if (!readerModal || !blog) return;

        readerArticleTitle.textContent = blog.title;
        readerLevelBadge.textContent = blog.level;
        readerReadTime.textContent = `⚡ Có hướng xử lý áp dụng ngay • Toàn văn ${blog.readTime} phút tham khảo`;
        readerQuoteText.textContent = `"${blog.quote}"`;
        readerContent.innerHTML = formatArticleHtmlWithCollapsibleSources(blog.contentHtml);

        // Render TOC for both Desktop Sidebar and Mobile Dropdown
        if (readerTocList) readerTocList.innerHTML = '';
        if (readerMobileTocList) readerMobileTocList.innerHTML = '';

        if (blog.toc && blog.toc.length > 0) {
            if (readerMobileTocWrap) {
                readerMobileTocWrap.style.display = '';
                readerMobileTocWrap.removeAttribute('open');
            }
            blog.toc.forEach(item => {
                if (readerTocList) {
                    const li = document.createElement('li');
                    li.innerHTML = `<a href="#${item.anchor}" class="toc-link">${item.title}</a>`;
                    readerTocList.appendChild(li);
                }
                if (readerMobileTocList) {
                    const mLi = document.createElement('li');
                    const mLink = document.createElement('a');
                    mLink.href = `#${item.anchor}`;
                    mLink.className = 'toc-link';
                    mLink.textContent = item.title;
                    mLink.addEventListener('click', () => {
                        if (readerMobileTocWrap) readerMobileTocWrap.removeAttribute('open');
                    });
                    mLi.appendChild(mLink);
                    readerMobileTocList.appendChild(mLi);
                }
            });
        } else {
            if (readerTocList) {
                readerTocList.innerHTML = `<li class="text-xs text-slate-500 italic">Toàn văn bài viết liền mạch</li>`;
            }
            if (readerMobileTocWrap) {
                readerMobileTocWrap.style.display = 'none';
            }
        }

        // Setup Zalo CTA with exact article title
        const encodedMsg = encodeURIComponent(`Chào Cò Đi Học, tôi vừa đọc bài "${blog.title}" và muốn nhờ Cò tư vấn thêm cho trường hợp của con tôi.`);
        const zaloUrl = `https://zalo.me/0902209213?text=${encodedMsg}`;

        if (readerAskZaloBtn) {
            readerAskZaloBtn.href = zaloUrl;
        }
        if (readerBottomZaloBtn) {
            readerBottomZaloBtn.href = zaloUrl;
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
    // 3. HOMEPAGE INTRO VIDEO (STANDALONE PLAYER)
    // ==========================================
    // Video player runs standalone without chapter sidebar per design update.

    // ==========================================
    // 4. KHO TÀI NGUYÊN TƯƠNG TÁC (RESOURCES HUB & QUICK CHIPS)
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

    const guidesContainer = document.getElementById('guidesContainer');
    const guideSearchInput = document.getElementById('guideSearchInput');
    const quickSearchChips = document.getElementById('quickSearchChips');

    function formatAdviceHtml(adviceText = '') {
        if (!adviceText.includes('(1)')) {
            return `<p class="mt-1">${adviceText}</p>`;
        }
        const firstIdx = adviceText.indexOf('(1)');
        const intro = adviceText.slice(0, firstIdx).trim();
        const rest = adviceText.slice(firstIdx).trim();
        const parts = rest.split(/(?=\(\d+\)\s*)/).map(s => s.trim().replace(/;\s*$/, '')).filter(Boolean);

        const stepsHtml = parts.map(part => {
            const m = part.match(/^\((\d+)\)\s*(.*)$/);
            if (m) {
                return `<li class="guide-step-item"><span class="guide-step-badge">Bước ${m[1]}</span><span>${m[2]}</span></li>`;
            }
            return `<li class="guide-step-item"><span>${part}</span></li>`;
        }).join('');

        return `
            ${intro ? `<p class="mt-1 mb-2">${intro}</p>` : ''}
            <ul class="guide-steps-list">${stepsHtml}</ul>
        `;
    }

    function renderPracticalGuides(keyword = '') {
        if (!guidesContainer) return;
        guidesContainer.innerHTML = '';

        const kw = keyword.toLowerCase().trim();
        const groups = data.practicalGuides || [];
        let globalMatchIndex = 0;

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
                const isExpanded = kw.length > 0 || globalMatchIndex === 0;
                globalMatchIndex++;

                const deepLinkBtn = item.blogId
                    ? `<div class="mt-3 pt-2 border-t border-emerald-200/60 flex flex-wrap items-center justify-between gap-2">
                           <button type="button" class="read-more-link text-xs font-bold" onclick="window.openReaderById('${item.blogId}')">
                               📖 Đọc bài phân tích chuyên sâu và căn cứ pháp lý đầy đủ ➔
                           </button>
                           <a href="https://zalo.me/0902209213?text=${encodeURIComponent('Chào Cò Đi Học, tôi muốn hỏi thêm về tình huống: ' + item.question)}" target="_blank" class="text-xs font-bold text-emerald-700 hover:underline">
                               💬 Hỏi riêng Cò trên Zalo
                           </a>
                       </div>`
                    : '';

                itemsHtml += `
                    <div class="guide-accordion-item${isExpanded ? ' active' : ''}">
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
                                ${formatAdviceHtml(item.advice)}
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
                    <p>Chưa có mục trùng khớp với từ khóa "${keyword}".</p>
                    <p class="text-xs text-slate-500 mt-2 mb-4">Bố mẹ có thể bấm nút bên dưới để nhắn câu hỏi trực tiếp tới Zalo <strong>0902 209 213</strong> của Cò Đi Học.</p>
                    <a href="https://zalo.me/0902209213?text=${encodeURIComponent('Chào Cò Đi Học, tôi đang tìm hiểu về: ' + keyword)}" target="_blank" class="btn btn-primary btn-sm">
                        <span>💬 Hỏi trực tiếp Cò Đi Học trên Zalo</span>
                    </a>
                </div>
            `;
        }
    }

    if (guideSearchInput) {
        guideSearchInput.addEventListener('input', (e) => {
            const val = e.target.value;
            if (quickSearchChips) {
                quickSearchChips.querySelectorAll('.quick-chip').forEach(c => {
                    c.classList.toggle('active', c.getAttribute('data-kw') === val);
                });
            }
            renderPracticalGuides(val);
        });
    }

    if (quickSearchChips) {
        quickSearchChips.addEventListener('click', (e) => {
            const chip = e.target.closest('.quick-chip');
            if (!chip) return;
            quickSearchChips.querySelectorAll('.quick-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            const kw = chip.getAttribute('data-kw') || '';
            if (guideSearchInput) {
                guideSearchInput.value = kw;
            }
            renderPracticalGuides(kw);
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
                const encoded = encodeURIComponent(pText);
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(pText).catch(() => {});
                }
                window.open(`https://zalo.me/0902209213?text=${encoded}`, '_blank');
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
            const isOpen = navMenu.classList.toggle('mobile-open');
            navMenu.style.display = isOpen ? 'flex' : '';
            if (isOpen) {
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
