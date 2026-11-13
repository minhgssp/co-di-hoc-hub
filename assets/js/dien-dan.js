(function () {
  "use strict";

  const PAGE_SIZE = 16;
  const BODY_TRUNCATE_LIMIT = 400;
  const INITIAL_VISIBLE_COMMENTS = 3;
  const SAVED_STORAGE_KEY = "cdh_clean_forum_saved_v1";
  const THEME_STORAGE_KEY = "cdh_clean_forum_theme_v1";

  const GENERIC_AUTHORS = new Set([
    "",
    "thành viên nhóm",
    "anonymous participant",
    "người tham gia ẩn danh",
    "ẩn danh",
    "phụ huynh",
    "phụ huynh trong nhóm",
    "member",
  ]);

  const state = {
    data: null,
    topicId: "ALL",
    groupSlug: "ALL",
    tagSlug: "ALL",
    sortBy: "hot",
    search: "",
    savedOnly: false,
    visibleCount: PAGE_SIZE,
    savedSigs: loadSavedSet(),
    expandedPosts: new Set(),
    expandedComments: new Set(),
  };

  const els = {
    searchInput: document.getElementById("searchInput"),
    topicNavList: document.getElementById("topicNavList"),
    sidebarTagTotal: document.getElementById("sidebarTagTotal"),
    sidebarTagList: document.getElementById("sidebarTagList"),
    quickTagsBar: document.getElementById("quickTagsBar"),
    postList: document.getElementById("postList"),
    loadMoreWrap: document.getElementById("loadMoreWrap"),
    loadMoreBtn: document.getElementById("loadMoreBtn"),
    activeFilterChips: document.getElementById("activeFilterChips"),
    clearFiltersBtn: document.getElementById("clearFiltersBtn"),
    savedCountBadge: document.getElementById("savedCountBadge"),
    savedFilterBtn: document.getElementById("savedFilterBtn"),
    themeToggleBtn: document.getElementById("themeToggleBtn"),
    sidebarTotalClean: document.getElementById("sidebarTotalClean"),
    mobileFilterBtn: document.getElementById("mobileFilterBtn"),
    closeSidebarBtn: document.getElementById("closeSidebarBtn"),
    leftSidebar: document.getElementById("leftSidebar"),
    drawerBackdrop: document.getElementById("drawerBackdrop"),
    toastMsg: document.getElementById("toastMsg"),
  };

  function loadSavedSet() {
    try {
      const raw = localStorage.getItem(SAVED_STORAGE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(arr) ? arr : []);
    } catch (_err) {
      return new Set();
    }
  }

  function persistSavedSet() {
    try {
      localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(Array.from(state.savedSigs)));
    } catch (_err) {
      // Ignore storage quota errors
    }
  }

  function applyStoredTheme() {
    let saved = "light";
    try {
      saved = localStorage.getItem(THEME_STORAGE_KEY) || "light";
    } catch (_err) {
      saved = "light";
    }
    if (saved === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }

  function toggleTheme() {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const next = isDark ? "light" : "dark";
    if (next === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch (_err) {
      // Ignore storage errors
    }
    showToast(next === "dark" ? "Đã chuyển sang nền Tối dịu mắt" : "Đã chuyển sang nền Sáng");
  }

  let toastTimer = null;
  function showToast(message) {
    if (!els.toastMsg) return;
    els.toastMsg.textContent = message;
    els.toastMsg.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      els.toastMsg.hidden = true;
    }, 3200);
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function highlightHtmlTextNodes(htmlStr, query) {
    const q = escapeHtml((query || "").trim());
    if (!q || q.length < 2) return htmlStr;
    const escapedRe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    let re;
    try {
      re = new RegExp("(" + escapedRe + ")", "gi");
    } catch (_err) {
      return htmlStr;
    }
    const parts = htmlStr.split(/(<[^>]+>)/g);
    for (let i = 0; i < parts.length; i += 2) {
      if (parts[i]) {
        parts[i] = parts[i].replace(re, "<mark>$1</mark>");
      }
    }
    return parts.join("");
  }

  function highlightText(text, query) {
    return highlightHtmlTextNodes(escapeHtml(text), query);
  }

  function renderMarkdownInline(text, query) {
    let html = escapeHtml(text);

    // Markdown links [label](https://...)
    html = html.replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g, function (_m, label, url) {
      return (
        '<a href="' +
        url +
        '" target="_blank" rel="noopener noreferrer" class="post-md-link">' +
        label +
        "</a>"
      );
    });

    // Bold **...** and __...__ (tolerates inner padding spaces from pasted FB/Word posts)
    html = html.replace(/\*\*\s*([^*\n]+?)\s*\*\*/g, "<strong>$1</strong>");
    html = html.replace(/__\s*([^_\n]+?)\s*__/g, "<strong>$1</strong>");

    // Italic *...* (avoid breaking arithmetic or stray stars)
    html = html.replace(/(^|[\s(>])\*([^*\n]+?)\*(?=[\s.,!?;:)<]|$)/g, "$1<em>$2</em>");

    // Strip any dangling/unclosed "**" (common in truncated previews or malformed headings)
    html = html.replace(/\*\*/g, "");

    return highlightHtmlTextNodes(html, query);
  }

  function renderMarkdownBlock(text, query) {
    const normalized = String(text || "").replace(/\r\n/g, "\n");
    const lines = normalized.split("\n");
    const out = [];
    let paraBuffer = [];

    function flushPara() {
      if (paraBuffer.length === 0) return;
      const joined = paraBuffer
        .map(function (ln) {
          return renderMarkdownInline(ln, query);
        })
        .join("<br>");
      out.push('<p class="post-md-p">' + joined + "</p>");
      paraBuffer = [];
    }

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const trimmed = rawLine.trim();

      if (!trimmed) {
        flushPara();
        continue;
      }

      // Skip orphan heading markers like "##" alone on a line
      if (/^#{1,6}\s*$/.test(trimmed)) {
        flushPara();
        continue;
      }

      // Horizontal dividers (--- or ----------------)
      if (/^[-_*]{3,}\s*$/.test(trimmed)) {
        flushPara();
        out.push('<hr class="post-md-hr">');
        continue;
      }

      // Headings: #, ##, ###, ####
      const hMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
      if (hMatch) {
        flushPara();
        const headingText = hMatch[2].replace(/^\*\*\s*|\s*\*\*$/g, "").trim();
        out.push('<h3 class="post-md-heading">' + renderMarkdownInline(headingText, query) + "</h3>");
        continue;
      }

      // Blockquote: > ...
      const qMatch = trimmed.match(/^>\s*(.+)$/);
      if (qMatch) {
        flushPara();
        out.push(
          '<blockquote class="post-md-quote">' + renderMarkdownInline(qMatch[1], query) + "</blockquote>"
        );
        continue;
      }

      // Unordered list: - item / * item / • item
      const ulMatch = trimmed.match(/^(?:[-*•])\s+(.+)$/);
      if (ulMatch) {
        flushPara();
        out.push(
          '<div class="post-md-li"><span class="post-md-bullet" aria-hidden="true">•</span><span>' +
            renderMarkdownInline(ulMatch[1], query) +
            "</span></div>"
        );
        continue;
      }

      // Ordered list: 1. item
      const olMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
      if (olMatch) {
        flushPara();
        out.push(
          '<div class="post-md-li"><span class="post-md-num">' +
            escapeHtml(olMatch[1]) +
            ".</span><span>" +
            renderMarkdownInline(olMatch[2], query) +
            "</span></div>"
        );
        continue;
      }

      paraBuffer.push(trimmed);
    }

    flushPara();
    return out.join("");
  }

  function isGenericAuthor(name) {
    return GENERIC_AUTHORS.has(String(name || "").trim().toLowerCase());
  }

  function formatPostDate(raw) {
    const s = String(raw || "").trim();
    if (!s) return "";
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
      return m[3] + "/" + m[2] + "/" + m[1];
    }
    return s;
  }

  function getInitials(name) {
    const clean = String(name || "PH").trim();
    if (!clean) return "PH";
    const parts = clean.split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function getAvatarClass(seed) {
    let hash = 0;
    const str = String(seed || "");
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) | 0;
    }
    return "avatar-" + ((Math.abs(hash) % 5) + 1);
  }

  function openMobileSidebar() {
    if (!els.leftSidebar || !els.drawerBackdrop || !els.mobileFilterBtn) return;
    els.leftSidebar.classList.add("is-open");
    els.drawerBackdrop.classList.add("is-open");
    els.mobileFilterBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    if (els.closeSidebarBtn) els.closeSidebarBtn.focus();
  }

  function closeMobileSidebar() {
    if (!els.leftSidebar || !els.drawerBackdrop || !els.mobileFilterBtn) return;
    els.leftSidebar.classList.remove("is-open");
    els.drawerBackdrop.classList.remove("is-open");
    els.mobileFilterBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  function getFilteredPosts() {
    if (!state.data || !Array.isArray(state.data.posts)) return [];
    const q = state.search.trim().toLowerCase();
    const list = state.data.posts.filter(function (post) {
      if (state.topicId !== "ALL" && post.topic_id !== state.topicId) return false;
      if (state.groupSlug !== "ALL" && post.group_slug !== state.groupSlug) return false;
      if (state.tagSlug !== "ALL") {
        const hasTag = (post.tags || []).some(function (t) {
          return t.slug === state.tagSlug;
        });
        if (!hasTag) return false;
      }
      if (state.savedOnly && !state.savedSigs.has(post.post_sig)) return false;
      if (state.sortBy === "with_comments" && post.clean_comments_count === 0) return false;
      if (q) {
        const hay = [
          post.text,
          post.group_name,
          post.author,
          post.topic_label,
          (post.tags || []).map(function (t) {
            return t.label;
          }).join(" "),
          (post.clean_comments || []).map(function (c) {
            return c.text;
          }).join(" "),
        ]
          .join("\n")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const sorted = list.slice();
    if (state.sortBy === "comments" || state.sortBy === "with_comments") {
      sorted.sort(function (a, b) {
        return (
          b.clean_comments_count - a.clean_comments_count ||
          b.engagement_score - a.engagement_score
        );
      });
    } else if (state.sortBy === "recent") {
      sorted.sort(function (a, b) {
        return String(b.harvested_at).localeCompare(String(a.harvested_at));
      });
    } else {
      sorted.sort(function (a, b) {
        return (
          b.engagement_score - a.engagement_score ||
          b.clean_comments_count - a.clean_comments_count
        );
      });
    }
    return sorted;
  }

  function renderTelemetry() {
    const s = state.data.summary || {};
    if (els.savedCountBadge) {
      els.savedCountBadge.textContent = String(state.savedSigs.size);
    }
    if (els.sidebarTotalClean) {
      els.sidebarTotalClean.textContent = String(s.clean_posts_count || 0);
    }
  }

  function renderSidebarTopics() {
    if (!els.topicNavList) return;
    const s = state.data.summary || {};
    const items = [
      { id: "ALL", label: "Tất cả bài viết", count: s.clean_posts_count || 0 },
    ].concat(state.data.topics || []);

    els.topicNavList.innerHTML = items
      .map(function (topic) {
        const activeClass = state.topicId === topic.id ? " is-active" : "";
        return (
          '<li><button type="button" class="nav-item-btn' +
          activeClass +
          '" data-topic-id="' +
          escapeHtml(topic.id) +
          '">' +
          '<span class="nav-item-label">' +
          escapeHtml(topic.label) +
          "</span>" +
          '<span class="badge-count num">' +
          topic.count +
          "</span></button></li>"
        );
      })
      .join("");
  }

  function renderSidebarTags() {
    if (!els.sidebarTagList) return;
    const tags = state.data.popular_tags || [];
    if (els.sidebarTagTotal) {
      els.sidebarTagTotal.textContent = String(tags.length);
    }
    const allChip =
      '<button type="button" class="tag-cloud-btn' +
      (state.tagSlug === "ALL" ? " is-active" : "") +
      '" data-tag-slug="ALL">Tất cả thẻ <span class="num">' +
      (state.data.summary ? state.data.summary.clean_posts_count : 0) +
      "</span></button>";

    const tagButtons = tags
      .map(function (t) {
        const activeClass = state.tagSlug === t.slug ? " is-active" : "";
        return (
          '<button type="button" class="tag-cloud-btn' +
          activeClass +
          '" data-tag-slug="' +
          escapeHtml(t.slug) +
          '">' +
          escapeHtml(t.label) +
          ' <span class="num">' +
          t.count +
          "</span></button>"
        );
      })
      .join("");
    els.sidebarTagList.innerHTML = allChip + tagButtons;
  }

  function renderQuickTagsBar() {
    if (!els.quickTagsBar) return;
    const tags = (state.data.popular_tags || []).slice(0, 10);
    if (tags.length === 0) {
      els.quickTagsBar.hidden = true;
      return;
    }
    els.quickTagsBar.hidden = false;
    const prefix = '<span class="quick-tags-label">Thẻ nổi bật:</span>';
    const pills = tags
      .map(function (t) {
        const activeClass = state.tagSlug === t.slug ? " is-active" : "";
        return (
          '<button type="button" class="quick-tag-pill' +
          activeClass +
          '" data-tag-slug="' +
          escapeHtml(t.slug) +
          '">' +
          escapeHtml(t.label) +
          ' <span class="num">' +
          t.count +
          "</span></button>"
        );
      })
      .join("");
    els.quickTagsBar.innerHTML = prefix + pills;
  }

  function renderFilterStatus(totalMatched) {
    const chips = [];
    chips.push(
      '<span class="num"><strong>' +
        totalMatched +
        "</strong> bài viết</span>"
    );

    if (state.topicId !== "ALL") {
      const tObj = (state.data.topics || []).find(function (t) {
        return t.id === state.topicId;
      });
      if (tObj) {
        chips.push('<span class="filter-chip">Chủ đề: ' + escapeHtml(tObj.short_label) + "</span>");
      }
    }
    if (state.groupSlug !== "ALL") {
      const gObj = (state.data.groups || []).find(function (g) {
        return g.group_slug === state.groupSlug;
      });
      chips.push(
        '<span class="filter-chip">Nhóm: ' +
          escapeHtml(gObj ? gObj.group_name : state.groupSlug) +
          "</span>"
      );
    }
    if (state.tagSlug !== "ALL") {
      const tagObj = (state.data.popular_tags || []).find(function (t) {
        return t.slug === state.tagSlug;
      });
      chips.push(
        '<span class="filter-chip">Thẻ: ' +
          escapeHtml(tagObj ? tagObj.label : "#" + state.tagSlug) +
          "</span>"
      );
    }
    if (state.search.trim()) {
      chips.push('<span class="filter-chip">Từ khóa: "' + escapeHtml(state.search.trim()) + '"</span>');
    }
    if (state.savedOnly) {
      chips.push('<span class="filter-chip">🔖 Bài đã lưu</span>');
    }

    els.activeFilterChips.innerHTML = chips.join("");
    const hasFilter =
      state.topicId !== "ALL" ||
      state.groupSlug !== "ALL" ||
      state.tagSlug !== "ALL" ||
      Boolean(state.search.trim()) ||
      state.savedOnly;
    els.clearFiltersBtn.hidden = !hasFilter;

    els.savedFilterBtn.classList.toggle("btn-active", state.savedOnly);
    els.savedFilterBtn.setAttribute("aria-pressed", String(state.savedOnly));
    els.savedCountBadge.textContent = String(state.savedSigs.size);
  }

  function renderCommentHtml(cmt, query) {
    const isReply = Number(cmt.level) >= 2 ? " is-reply" : "";
    const formatted = String(cmt.text || "")
      .replace(/\r\n/g, "\n")
      .split("\n")
      .map(function (ln) {
        return renderMarkdownInline(ln, query);
      })
      .join("<br>");
    return (
      '<div class="comment-item' +
      isReply +
      '">' +
      '<div class="cmt-bubble">' +
      '<div class="cmt-text">' +
      formatted +
      "</div>" +
      "</div></div>"
    );
  }

  function renderPostCard(post) {
    const q = state.search.trim();
    const isBodyExpanded = state.expandedPosts.has(post.post_sig);
    const needsTruncate = post.text.length > BODY_TRUNCATE_LIMIT;
    const displayBody =
      needsTruncate && !isBodyExpanded
        ? post.text.slice(0, BODY_TRUNCATE_LIMIT).trimEnd() + "…"
        : post.text;

    const isSaved = state.savedSigs.has(post.post_sig);
    const hideAuthor = isGenericAuthor(post.author);
    const avClass = getAvatarClass(post.author + post.group_slug);
    const dateLabel = formatPostDate(post.posted_display);

    const allComments = post.clean_comments || [];
    const showAllComments = state.expandedComments.has(post.post_sig);
    const visibleComments = showAllComments
      ? allComments
      : allComments.slice(0, INITIAL_VISIBLE_COMMENTS);
    const hiddenCommentsCount = Math.max(0, allComments.length - visibleComments.length);

    let commentsBlockHtml = "";
    if (allComments.length > 0) {
      commentsBlockHtml =
        '<div class="comments-section">' +
        visibleComments
          .map(function (c) {
            return renderCommentHtml(c, q);
          })
          .join("") +
        (hiddenCommentsCount > 0
          ? '<button type="button" class="comments-more-btn" data-expand-comments="' +
            escapeHtml(post.post_sig) +
            '">Xem thêm ' +
            hiddenCommentsCount +
            " bình luận nữa</button>"
          : "") +
        "</div>";
    }

    const headerHtml = hideAuthor
      ? '<div class="post-header is-compact">' +
        '<div class="post-meta-inline">' +
        '<button type="button" class="post-group-btn" data-group-slug="' +
        escapeHtml(post.group_slug) +
        '" title="Lọc bài viết cùng hội nhóm">' +
        escapeHtml(post.group_name) +
        "</button>" +
        (dateLabel ? '<span class="post-time">• ' + escapeHtml(dateLabel) + "</span>" : "") +
        "</div></div>"
      : '<div class="post-header">' +
        '<div class="post-author-block">' +
        '<div class="avatar-circle ' +
        avClass +
        '" aria-hidden="true">' +
        escapeHtml(getInitials(post.author)) +
        "</div>" +
        '<div class="post-meta-col">' +
        '<div class="post-group-line">' +
        '<button type="button" class="post-group-btn" data-group-slug="' +
        escapeHtml(post.group_slug) +
        '" title="Lọc bài viết cùng hội nhóm">' +
        escapeHtml(post.group_name) +
        "</button>" +
        "</div>" +
        '<div class="post-author-line">' +
        '<span class="post-author-name">' +
        highlightText(post.author, q) +
        "</span>" +
        (dateLabel ? '<span class="post-time">• ' + escapeHtml(dateLabel) + "</span>" : "") +
        "</div></div></div></div>";

    return (
      '<article class="post-card" data-post-sig="' +
      escapeHtml(post.post_sig) +
      '">' +
      headerHtml +
      '<div class="topic-pill-row">' +
      '<span class="topic-tag">' +
      escapeHtml(post.topic_label) +
      "</span>" +
      (post.tags || [])
        .map(function (t) {
          const isAct = state.tagSlug === t.slug ? " is-active" : "";
          return (
            '<button type="button" class="post-tag-chip' +
            isAct +
            '" data-tag-slug="' +
            escapeHtml(t.slug) +
            '">' +
            escapeHtml(t.label) +
            "</button>"
          );
        })
        .join("") +
      "</div>" +
      '<div class="post-body">' +
      renderMarkdownBlock(displayBody, q) +
      "</div>" +
      (needsTruncate
        ? '<button type="button" class="expand-body-btn" data-expand-post="' +
          escapeHtml(post.post_sig) +
          '">' +
          (isBodyExpanded ? "Thu gọn" : "Xem toàn văn") +
          "</button>"
        : "") +
      '<div class="post-actions-bar">' +
      '<div class="post-action-btns">' +
      '<button type="button" class="card-action-btn' +
      (isSaved ? " is-saved" : "") +
      '" data-save-post="' +
      escapeHtml(post.post_sig) +
      '">' +
      (isSaved ? "🔖 Đã lưu" : "🔖 Lưu bài") +
      "</button>" +
      '<button type="button" class="card-action-btn" data-copy-post="' +
      escapeHtml(post.post_sig) +
      '">🔗 Chép trích dẫn</button>' +
      (post.permalink
        ? '<a class="card-action-btn" href="' +
          escapeHtml(post.permalink) +
          '" target="_blank" rel="noopener noreferrer">↗ Nguồn FB</a>'
        : "") +
      "</div>" +
      '<span class="post-cmt-summary num">' +
      post.clean_comments_count +
      " bình luận</span>" +
      "</div>" +
      commentsBlockHtml +
      "</article>"
    );
  }

  function renderFeed() {
    const matched = getFilteredPosts();
    renderFilterStatus(matched.length);

    if (matched.length === 0) {
      els.postList.innerHTML =
        '<div class="empty-state">' +
        "<h3>Không tìm thấy thảo luận phù hợp</h3>" +
        "<p>Thử bỏ bớt bộ lọc chủ đề, thẻ hoặc gõ từ khóa khác ngắn gọn hơn (ví dụ: lớp 1, trường, HSK, 20/11).</p>" +
        '<button type="button" class="btn btn-primary" id="emptyResetBtn">Đặt lại bộ lọc</button>' +
        "</div>";
      els.loadMoreWrap.hidden = true;
      const resetBtn = document.getElementById("emptyResetBtn");
      if (resetBtn) resetBtn.addEventListener("click", clearAllFilters);
      return;
    }

    const slice = matched.slice(0, state.visibleCount);
    els.postList.innerHTML = slice.map(renderPostCard).join("");

    const remaining = matched.length - slice.length;
    if (remaining > 0) {
      els.loadMoreWrap.hidden = false;
      els.loadMoreBtn.textContent = "Xem thêm " + Math.min(PAGE_SIZE, remaining) + " bài nữa (còn " + remaining + ")";
    } else {
      els.loadMoreWrap.hidden = true;
    }
  }

  function selectTagFilter(slug) {
    if (!slug || slug === "ALL" || state.tagSlug === slug) {
      state.tagSlug = "ALL";
    } else {
      state.tagSlug = slug;
    }
    state.visibleCount = PAGE_SIZE;
    renderSidebarTags();
    renderQuickTagsBar();
    renderFeed();
  }

  function selectGroupFilter(slug) {
    if (!slug || slug === "ALL" || state.groupSlug === slug) {
      state.groupSlug = "ALL";
    } else {
      state.groupSlug = slug;
    }
    state.visibleCount = PAGE_SIZE;
    renderFeed();
  }

  function clearAllFilters() {
    state.topicId = "ALL";
    state.groupSlug = "ALL";
    state.tagSlug = "ALL";
    state.search = "";
    state.savedOnly = false;
    state.visibleCount = PAGE_SIZE;
    if (els.searchInput) els.searchInput.value = "";
    renderSidebarTopics();
    renderSidebarTags();
    renderQuickTagsBar();
    renderFeed();
  }

  function bindEvents() {
    let searchTimer = null;
    if (els.searchInput) {
      els.searchInput.addEventListener("input", function () {
        if (searchTimer) clearTimeout(searchTimer);
        searchTimer = setTimeout(function () {
          state.search = els.searchInput.value;
          state.visibleCount = PAGE_SIZE;
          renderFeed();
        }, 180);
      });
    }

    if (els.topicNavList) {
      els.topicNavList.addEventListener("click", function (ev) {
        const btn = ev.target.closest("[data-topic-id]");
        if (!btn) return;
        state.topicId = btn.getAttribute("data-topic-id") || "ALL";
        state.visibleCount = PAGE_SIZE;
        renderSidebarTopics();
        renderFeed();
        closeMobileSidebar();
      });
    }

    if (els.sidebarTagList) {
      els.sidebarTagList.addEventListener("click", function (ev) {
        const btn = ev.target.closest("[data-tag-slug]");
        if (!btn) return;
        selectTagFilter(btn.getAttribute("data-tag-slug") || "ALL");
        closeMobileSidebar();
      });
    }

    if (els.quickTagsBar) {
      els.quickTagsBar.addEventListener("click", function (ev) {
        const btn = ev.target.closest("[data-tag-slug]");
        if (!btn) return;
        selectTagFilter(btn.getAttribute("data-tag-slug") || "ALL");
      });
    }

    const sortPills = document.querySelector(".sort-pills");
    if (sortPills) {
      sortPills.addEventListener("click", function (ev) {
        const btn = ev.target.closest("[data-sort]");
        if (!btn) return;
        state.sortBy = btn.getAttribute("data-sort") || "hot";
        document.querySelectorAll(".sort-pill").forEach(function (p) {
          p.classList.toggle("is-active", p === btn);
        });
        state.visibleCount = PAGE_SIZE;
        renderFeed();
      });
    }

    els.postList.addEventListener("click", function (ev) {
      const groupBtn = ev.target.closest("[data-group-slug]");
      if (groupBtn) {
        selectGroupFilter(groupBtn.getAttribute("data-group-slug") || "ALL");
        return;
      }

      const tagBtn = ev.target.closest("[data-tag-slug]");
      if (tagBtn) {
        selectTagFilter(tagBtn.getAttribute("data-tag-slug") || "ALL");
        return;
      }

      const expandPostBtn = ev.target.closest("[data-expand-post]");
      if (expandPostBtn) {
        const sig = expandPostBtn.getAttribute("data-expand-post");
        if (state.expandedPosts.has(sig)) {
          state.expandedPosts.delete(sig);
        } else {
          state.expandedPosts.add(sig);
        }
        renderFeed();
        return;
      }

      const expandCmtBtn = ev.target.closest("[data-expand-comments]");
      if (expandCmtBtn) {
        const sig = expandCmtBtn.getAttribute("data-expand-comments");
        state.expandedComments.add(sig);
        renderFeed();
        return;
      }

      const saveBtn = ev.target.closest("[data-save-post]");
      if (saveBtn) {
        const sig = saveBtn.getAttribute("data-save-post");
        if (state.savedSigs.has(sig)) {
          state.savedSigs.delete(sig);
          showToast("Đã bỏ lưu bài viết");
        } else {
          state.savedSigs.add(sig);
          showToast("Đã lưu bài viết vào danh sách đọc");
        }
        persistSavedSet();
        renderFeed();
        return;
      }

      const copyBtn = ev.target.closest("[data-copy-post]");
      if (copyBtn) {
        const sig = copyBtn.getAttribute("data-copy-post");
        const post = (state.data.posts || []).find(function (p) {
          return p.post_sig === sig;
        });
        if (post) {
          const authorPrefix = isGenericAuthor(post.author) ? "" : " — " + post.author;
          const quote =
            "[" +
            post.group_name +
            authorPrefix +
            "]\n" +
            post.text +
            (post.permalink ? "\nNguồn: " + post.permalink : "");
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(quote).then(
              function () {
                showToast("Đã sao chép trích dẫn bài viết");
              },
              function () {
                showToast("Không truy cập được clipboard trình duyệt");
              }
            );
          } else {
            showToast("Trình duyệt không hỗ trợ sao chép nhanh");
          }
        }
      }
    });

    els.loadMoreBtn.addEventListener("click", function () {
      state.visibleCount += PAGE_SIZE;
      renderFeed();
    });

    els.clearFiltersBtn.addEventListener("click", clearAllFilters);

    els.savedFilterBtn.addEventListener("click", function () {
      state.savedOnly = !state.savedOnly;
      state.visibleCount = PAGE_SIZE;
      renderFeed();
    });

    els.themeToggleBtn.addEventListener("click", toggleTheme);
    els.mobileFilterBtn.addEventListener("click", openMobileSidebar);
    els.closeSidebarBtn.addEventListener("click", closeMobileSidebar);
    els.drawerBackdrop.addEventListener("click", closeMobileSidebar);

    document.addEventListener("keydown", function (ev) {
      if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "k") {
        ev.preventDefault();
        if (els.searchInput) els.searchInput.focus();
      } else if (ev.key === "Escape") {
        if (els.leftSidebar && els.leftSidebar.classList.contains("is-open")) {
          closeMobileSidebar();
        }
      }
    });
  }

  async function loadForumData() {
    const isLocalPreview =
      window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";
    if (isLocalPreview && window.location.protocol.startsWith("http")) {
      try {
        const res = await fetch("/api/clean-feed", { cache: "no-store" });
        if (res.ok) {
          const payload = await res.json();
          if (payload && Array.isArray(payload.posts)) return payload;
        }
      } catch (_err) {
        // Fallback to static JS/JSON
      }
    }

    if (window.CDH_CLEAN_FORUM_DATA && Array.isArray(window.CDH_CLEAN_FORUM_DATA.posts)) {
      return window.CDH_CLEAN_FORUM_DATA;
    }

    const resJson = await fetch("assets/data/clean_forum_feed.json", { cache: "no-store" });
    if (!resJson.ok) {
      throw new Error("Không tải được dữ liệu diễn đàn");
    }
    return resJson.json();
  }

  async function init() {
    applyStoredTheme();
    bindEvents();

    els.postList.innerHTML =
      '<div class="empty-state"><p>Đang tải danh sách thảo luận...</p></div>';

    try {
      state.data = await loadForumData();
      renderTelemetry();
      renderSidebarTopics();
      renderSidebarTags();
      renderQuickTagsBar();
      renderFeed();
    } catch (err) {
      els.postList.innerHTML =
        '<div class="empty-state">' +
        "<h3>Không thể tải dữ liệu bảng tin</h3>" +
        "<p>" +
        escapeHtml(err && err.message ? err.message : "Lỗi kết nối dữ liệu") +
        "</p></div>";
    }
  }

  init();
})();
