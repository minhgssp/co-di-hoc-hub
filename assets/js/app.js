/**
 * APP.JS - CÒ ĐI HỌC OFFICIAL HUB
 * Điều hướng mượt mà, phân loại 22 bài viết chuyên sâu (hiển thị tiệm tiến 6 bài + mở rộng 22 bài),
 * trình đọc bài viết (Novel Viewer kèm Mục lục Mobile & Thu gọn tài liệu tham khảo),
 * cẩm nang hỏi đáp 22 tình huống thực chứng (thu gọn tiệm tiến 2 nhóm đầu + tìm kiếm nhanh),
 * bảng đối sánh 4 lộ trình học tập và cổng kết nối Zalo 0902 209 213.
 */

document.addEventListener('DOMContentLoaded', () => {
    const data = window.CDH_DATA;
    if (!data) {
        console.error('CDH_DATA not loaded!');
        return;
    }

    const SVG_ICONS = {
        book: '<svg class="ui-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
        chat: '<svg class="ui-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
        arrow: '<svg class="ui-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
        chevron: '<svg class="ui-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>',
        chevronUp: '<svg class="ui-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15"/></svg>',
        search: '<svg class="ui-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
        help: '<svg class="ui-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        shield: '<svg class="ui-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
        clock: '<svg class="ui-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
        school: '<svg class="ui-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
        compass: '<svg class="ui-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
        bulb: '<svg class="ui-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>'
    };

    const GROUP_SVG_MAP = {
        'g1-preschool': SVG_ICONS.school,
        'g2-primary': SVG_ICONS.clock,
        'g3-health': SVG_ICONS.shield,
        'g4-transition': SVG_ICONS.compass,
        'g5-science': SVG_ICONS.bulb
    };

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
                    <img src="${blog.thumbnail}" alt="${blog.title}" width="1280" height="720" class="blog-card-thumb">
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
                    ? `${SVG_ICONS.chevronUp}<span>Thu gọn bớt (chỉ hiện 6 bài tiêu biểu)</span>`
                    : `${SVG_ICONS.book}<span>Xem thêm ${hiddenCount} bài viết khác</span>${SVG_ICONS.chevron}`;
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
                    <span>Xem chi tiết văn bản pháp lý, tài liệu khoa học và bình luận khảo sát gốc</span>
                    <span class="legal-sources-hint">Bấm để mở rộng</span>
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
        readerReadTime.textContent = `Có hướng xử lý áp dụng ngay - Toàn văn ${blog.readTime} phút tham khảo`;
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
    // 3. KHO TÀI NGUYÊN TƯƠNG TÁC (RESOURCES HUB & QUICK CHIPS)
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
    const guidesExpandWrap = document.getElementById('guidesExpandWrap');
    const toggleAllGuidesBtn = document.getElementById('toggleAllGuidesBtn');
    let isGuidesExpanded = false;

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

        groups.forEach((group, groupIdx) => {
            const filteredItems = group.items.filter(item =>
                !kw ||
                item.question.toLowerCase().includes(kw) ||
                item.situation.toLowerCase().includes(kw) ||
                item.advice.toLowerCase().includes(kw)
            );

            if (filteredItems.length === 0) return;

            const shouldCollapseGroup = (!kw && !isGuidesExpanded && groupIdx >= 2);
            const groupCard = document.createElement('div');
            groupCard.className = `guide-group-card${shouldCollapseGroup ? ' guide-group-collapsed' : ''}`;

            let itemsHtml = '';
            filteredItems.forEach((item) => {
                const isExpanded = (kw.length > 0 && globalMatchIndex === 0);
                globalMatchIndex++;

                const deepLinkBtn = item.blogId
                    ? `<div class="mt-3 pt-2 border-t border-emerald-200/60 flex flex-wrap items-center justify-between gap-2">
                           <button type="button" class="read-more-link" onclick="window.openReaderById('${item.blogId}')">
                               ${SVG_ICONS.book}
                               <span>Đọc bài phân tích chuyên sâu và căn cứ pháp lý đầy đủ</span>
                               ${SVG_ICONS.arrow}
                           </button>
                           <a href="https://zalo.me/0902209213?text=${encodeURIComponent('Chào Cò Đi Học, tôi muốn hỏi thêm về tình huống: ' + item.question)}" target="_blank" class="guide-zalo-link">
                               ${SVG_ICONS.chat}
                               <span>Hỏi riêng Cò trên Zalo</span>
                           </a>
                       </div>`
                    : '';

                itemsHtml += `
                    <div class="guide-accordion-item${isExpanded ? ' active' : ''}">
                        <div class="guide-item-header" onclick="this.parentElement.classList.toggle('active')">
                            <span class="guide-item-title">${SVG_ICONS.help}<span>${item.question}</span></span>
                            <span class="guide-item-toggle">${SVG_ICONS.chevron}</span>
                        </div>
                        <div class="guide-item-body">
                            <div class="guide-item-situation">
                                <strong>Tiếng lòng phụ huynh:</strong> "${item.situation}"
                            </div>
                            <div class="guide-item-advice">
                                <strong>Đúc kết pháp lý, khoa học và hướng gỡ rối từ Cò Đi Học:</strong>
                                ${formatAdviceHtml(item.advice)}
                                ${deepLinkBtn}
                            </div>
                        </div>
                    </div>
                `;
            });

            const groupSvg = GROUP_SVG_MAP[group.id] || SVG_ICONS.school;
            groupCard.innerHTML = `
                <div class="guide-group-header">
                    <span class="guide-group-icon">${groupSvg}</span>
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
                    <div class="text-3xl mb-2" style="display:flex;justify-content:center;">${SVG_ICONS.search}</div>
                    <p>Chưa có mục trùng khớp với từ khóa "${keyword}".</p>
                    <p class="text-slate-500 mt-2 mb-4" style="font-size:14px;">Bố mẹ có thể bấm nút bên dưới để nhắn câu hỏi trực tiếp tới Zalo <strong>0902 209 213</strong> của Cò Đi Học.</p>
                    <a href="https://zalo.me/0902209213?text=${encodeURIComponent('Chào Cò Đi Học, tôi đang tìm hiểu về: ' + keyword)}" target="_blank" class="btn btn-primary btn-sm">
                        ${SVG_ICONS.chat}
                        <span>Hỏi trực tiếp Cò Đi Học trên Zalo</span>
                    </a>
                </div>
            `;
        }

        if (guidesExpandWrap && toggleAllGuidesBtn) {
            if (!kw && groups.length > 2) {
                guidesExpandWrap.style.display = 'block';
                toggleAllGuidesBtn.innerHTML = isGuidesExpanded
                    ? `${SVG_ICONS.chevronUp}<span>Thu gọn bớt (chỉ hiện 2 nhóm chủ đề đầu tiên)</span>`
                    : `${SVG_ICONS.book}<span>Xem thêm 3 nhóm chủ đề (trọn bộ 22 tình huống gỡ rối)</span>${SVG_ICONS.chevron}`;
            } else {
                guidesExpandWrap.style.display = 'none';
            }
        }
    }

    if (toggleAllGuidesBtn) {
        toggleAllGuidesBtn.addEventListener('click', () => {
            isGuidesExpanded = !isGuidesExpanded;
            renderPracticalGuides(guideSearchInput ? guideSearchInput.value : '');
        });
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
                <h3 class="curricula-title">${curr.system}</h3>
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
    // 4. ZALO WIDGET & FLOATING POPUP
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
            btn.innerHTML = `${SVG_ICONS.chat}<span>${pText}</span>`;
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
            span.textContent = cat.level;
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
