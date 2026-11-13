(function () {
  "use strict";

  const PAGE_SIZE = 16;
  const BODY_TRUNCATE_LIMIT = 360;
  const INITIAL_VISIBLE_COMMENTS = 3;
  const SAVED_STORAGE_KEY = "cdh_clean_forum_saved_v1";
  const THEME_STORAGE_KEY = "cdh_clean_forum_theme_v1";

  const SEEDING_INTENT_LABELS = {
    SEEDING_CLONE_CAMPAIGN: "Nick clone / Rải văn mẫu",
    COMMERCIAL_DIRECT_SALE: "Bán hàng / Rao vặt trực tiếp",
    SEEDING_LEAD_MAGNET_ZALO_INBOX: "Mồi xin file / Kéo inbox Zalo",
    CROSS_GROUP_ENGAGEMENT_BAIT: "Bài mồi rải chéo đa nhóm",
    SEEDING_AFFILIATE_SHOPEE_TROJAN: "Affiliate Shopee núp bóng",
    SEEDING_STORYTELLING_FUNNEL: "Kể chuyện cài phễu Workshop",
    SEEDING_VIRAL_HOMEWORK_LOOP: "Bài tập ép Viral-Loop",
  };

  const state = {
    data: null,
    topicId: "ALL",
    groupSlug: "ALL",
    tagSlug: "ALL",
    sortBy: "hot",
    search: "",
    groupSearch: "",
    savedOnly: false,
    visibleCount: PAGE_SIZE,
    savedSigs: loadSavedSet(),
    expandedPosts: new Set(),
    expandedComments: new Set(),
    lastFocusedTrigger: null,
  };

  const els = {
    searchInput: document.getElementById("searchInput"),
    groupQuickSearch: document.getElementById("groupQuickSearch"),
    topicNavList: document.getElementById("topicNavList"),
    sidebarTagTotal: document.getElementById("sidebarTagTotal"),
    sidebarTagList: document.getElementById("sidebarTagList"),
    quickTagsBar: document.getElementById("quickTagsBar"),
    groupNavList: document.getElementById("groupNavList"),
    postList: document.getElementById("postList"),
    loadMoreWrap: document.getElementById("loadMoreWrap"),
    loadMoreBtn: document.getElementById("loadMoreBtn"),
    activeFilterChips: document.getElementById("activeFilterChips"),
    clearFiltersBtn: document.getElementById("clearFiltersBtn"),
    composerSubtitle: document.getElementById("composerSubtitle"),
    topBlockedCount: document.getElementById("topBlockedCount"),
    savedCountBadge: document.getElementById("savedCountBadge"),
    savedFilterBtn: document.getElementById("savedFilterBtn"),
    themeToggleBtn: document.getElementById("themeToggleBtn"),
    sidebarTotalClean: document.getElementById("sidebarTotalClean"),
    sidebarGroupTotal: document.getElementById("sidebarGroupTotal"),
    mobileCleanStat: document.getElementById("mobileCleanStat"),
    mobileBlockedStat: document.getElementById("mobileBlockedStat"),
    cleanRatioBadge: document.getElementById("cleanRatioBadge"),
    kpiCleanPosts: document.getElementById("kpiCleanPosts"),
    kpiBlockedPosts: document.getElementById("kpiBlockedPosts"),
    kpiCleanComments: document.getElementById("kpiCleanComments"),
    kpiBlockedComments: document.getElementById("kpiBlockedComments"),
    purityMeterFill: document.getElementById("purityMeterFill"),
    seedingBreakdownList: document.getElementById("seedingBreakdownList"),
    insightList: document.getElementById("insightList"),
    seedingDrawer: document.getElementById("seedingDrawer"),
    seedingDrawerBody: document.getElementById("seedingDrawerBody"),
    seedingDialogSub: document.getElementById("seedingDialogSub"),
    openSeedingDrawerBtn: document.getElementById("openSeedingDrawerBtn"),
    railOpenSeedingBtn: document.getElementById("railOpenSeedingBtn"),
    mobileOpenDrawerBtn: document.getElementById("mobileOpenDrawerBtn"),
    inlineInspectSeedingBtn: document.getElementById("inlineInspectSeedingBtn"),
    closeSeedingDrawerBtn: document.getElementById("closeSeedingDrawerBtn"),
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

  function highlightText(text, query) {
    const safe = escapeHtml(text);
    const q = (query || "").trim();
    if (!q || q.length < 2) return safe;
    const escapedRe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    try {
      const re = new RegExp("(" + escapedRe + ")", "gi");
      return safe.replace(re, "<mark>$1</mark>");
    } catch (_err) {
      return safe;
    }
  }

  function getInitials(name) {
    const clean = String(name || "PH").trim();
    if (!clean) return "PH";
    if (clean.toLowerCase().includes("ẩn danh")) return "ẨD";
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
    els.leftSidebar.classList.add("is-open");
    els.drawerBackdrop.classList.add("is-open");
    els.mobileFilterBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    if (els.closeSidebarBtn) els.closeSidebarBtn.focus();
  }

  function closeMobileSidebar() {
    els.leftSidebar.classList.remove("is-open");
    els.drawerBackdrop.classList.remove("is-open");
    els.mobileFilterBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  function openSeedingDrawer(triggerEl) {
    state.lastFocusedTrigger = triggerEl || document.activeElement;
    renderSeedingDrawer();
    if (typeof els.seedingDrawer.showModal === "function") {
      els.seedingDrawer.showModal();
    } else {
      els.seedingDrawer.setAttribute("open", "open");
    }
    if (els.closeSeedingDrawerBtn) els.closeSeedingDrawerBtn.focus();
  }

  function closeSeedingDrawer() {
    if (typeof els.seedingDrawer.close === "function" && els.seedingDrawer.open) {
      els.seedingDrawer.close();
    } else {
      els.seedingDrawer.removeAttribute("open");
    }
    if (state.lastFocusedTrigger && typeof state.lastFocusedTrigger.focus === "function") {
      state.lastFocusedTrigger.focus();
    }
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
            return c.author + " " + c.text;
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
    const s = state.data.summary;
    els.topBlockedCount.textContent = String(s.blocked_seeding_posts_count);
    els.savedCountBadge.textContent = String(state.savedSigs.size);
    els.sidebarTotalClean.textContent = String(s.clean_posts_count);
    els.sidebarGroupTotal.textContent = String(s.active_groups_with_clean_posts);
    els.mobileCleanStat.textContent = String(s.clean_posts_count);
    els.mobileBlockedStat.textContent = String(s.blocked_seeding_posts_count);

    els.composerSubtitle.textContent =
      "Đã làm sạch " +
      s.clean_posts_count +
      " bài thảo luận thật & " +
      s.clean_comments_count +
      " bình luận hữu ích từ " +
      s.total_followed_groups +
      " hội nhóm (loại bỏ " +
      s.blocked_seeding_posts_count +
      " bài Seeding và " +
      s.blocked_comments_count +
      " bình luận rác).";

    els.cleanRatioBadge.textContent = s.clean_ratio_pct + "% sạch";
    els.kpiCleanPosts.textContent = String(s.clean_posts_count);
    els.kpiBlockedPosts.textContent = String(s.blocked_seeding_posts_count);
    els.kpiCleanComments.textContent = String(s.clean_comments_count);
    els.kpiBlockedComments.textContent = String(s.blocked_comments_count);
    els.purityMeterFill.style.width = Math.max(5, Math.min(100, s.clean_ratio_pct)) + "%";

    const breakdownEntries = Object.entries(state.data.seeding_breakdown || {}).sort(function (a, b) {
      return b[1] - a[1];
    });
    els.seedingBreakdownList.innerHTML = breakdownEntries
      .map(function (entry) {
        const label = SEEDING_INTENT_LABELS[entry[0]] || entry[0];
        return (
          '<li class="breakdown-row"><span>' +
          escapeHtml(label) +
          '</span><strong class="num">' +
          entry[1] +
          "</strong></li>"
        );
      })
      .join("");
  }

  function renderSidebarTopics() {
    const s = state.data.summary;
    const items = [
      { id: "ALL", label: "Tất cả thảo luận sạch", count: s.clean_posts_count },
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
    const tags = (state.data.popular_tags || []).slice(0, 12);
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

  function renderSidebarGroups() {
    const q = state.groupSearch.trim().toLowerCase();
    const groups = (state.data.groups || []).filter(function (g) {
      if (!q) return true;
      return (
        g.group_name.toLowerCase().includes(q) || g.group_slug.toLowerCase().includes(q)
      );
    });

    const headerItem =
      '<li><button type="button" class="nav-item-btn' +
      (state.groupSlug === "ALL" ? " is-active" : "") +
      '" data-group-slug="ALL">' +
      '<span class="nav-item-label">Tất cả hội nhóm</span>' +
      '<span class="badge-count num">' +
      state.data.groups.length +
      "</span></button></li>";

    const groupItems = groups
      .map(function (g) {
        const activeClass = state.groupSlug === g.group_slug ? " is-active" : "";
        return (
          '<li><button type="button" class="nav-item-btn' +
          activeClass +
          '" data-group-slug="' +
          escapeHtml(g.group_slug) +
          '" title="' +
          escapeHtml(g.group_name) +
          '">' +
          '<span class="nav-item-label">' +
          escapeHtml(g.group_name) +
          "</span>" +
          '<span class="badge-count num">' +
          g.clean_posts_count +
          "</span></button></li>"
        );
      })
      .join("");

    els.groupNavList.innerHTML = headerItem + groupItems;
  }

  function renderInsights() {
    const insights = state.data.featured_insights || [];
    els.insightList.innerHTML = insights
      .map(function (ins) {
        return (
          '<button type="button" class="insight-btn" data-insight-topic="' +
          escapeHtml(ins.topic_id) +
          '" data-insight-query="' +
          escapeHtml(ins.query) +
          '">' +
          '<span class="insight-badge">' +
          escapeHtml(ins.badge) +
          "</span>" +
          '<span class="insight-title">' +
          escapeHtml(ins.title) +
          "</span>" +
          '<span class="insight-summary">' +
          escapeHtml(ins.summary) +
          "</span>" +
          "</button>"
        );
      })
      .join("");
  }

  function renderFilterStatus(totalMatched) {
    const chips = [];
    chips.push(
      '<span class="num">Hiển thị <strong>' +
        totalMatched +
        "</strong> bài viết sạch</span>"
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
      chips.push('<span class="filter-chip">🔖 Đang xem bài đã lưu</span>');
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
    const avClass = getAvatarClass(cmt.author);
    return (
      '<div class="comment-item' +
      isReply +
      '">' +
      '<div class="cmt-avatar ' +
      avClass +
      '" aria-hidden="true">' +
      escapeHtml(getInitials(cmt.author)) +
      "</div>" +
      '<div class="cmt-bubble-wrap">' +
      '<div class="cmt-bubble">' +
      '<div><span class="cmt-author">' +
      highlightText(cmt.author, query) +
      "</span>" +
      (cmt.timestamp_text
        ? '<span class="cmt-time">' + escapeHtml(cmt.timestamp_text) + "</span>"
        : "") +
      "</div>" +
      '<p class="cmt-text">' +
      highlightText(cmt.text, query) +
      "</p>" +
      "</div></div></div>"
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
    const avClass = getAvatarClass(post.author + post.group_slug);

    const allComments = post.clean_comments || [];
    const showAllComments = state.expandedComments.has(post.post_sig);
    const visibleComments = showAllComments
      ? allComments
      : allComments.slice(0, INITIAL_VISIBLE_COMMENTS);
    const hiddenCommentsCount = Math.max(0, allComments.length - visibleComments.length);

    let commentsBlockHtml = "";
    if (allComments.length > 0 || post.filtered_comments_count > 0) {
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
            " bình luận thật nữa</button>"
          : "") +
        '<div class="readonly-comment-footer">' +
        "<span>🔒 Đã khóa bình luận để tránh spam</span>" +
        (post.filtered_comments_count > 0
          ? '<span class="spam-stripped-note num">Đã gạn bỏ ' +
            post.filtered_comments_count +
            ' bình luận rác / "." / xin file</span>'
          : "") +
        "</div></div>";
    }

    return (
      '<article class="post-card" data-post-sig="' +
      escapeHtml(post.post_sig) +
      '">' +
      '<div class="post-header">' +
      '<div class="post-author-block">' +
      '<div class="avatar-circle ' +
      avClass +
      '" aria-hidden="true">' +
      escapeHtml(getInitials(post.author)) +
      "</div>" +
      '<div class="post-meta-col">' +
      '<div class="post-group-line">' +
      escapeHtml(post.group_name) +
      "</div>" +
      '<div class="post-author-line">' +
      '<span class="post-author-name">' +
      highlightText(post.author, q) +
      "</span>" +
      '<span class="post-time">• ' +
      escapeHtml(post.posted_display) +
      "</span>" +
      "</div></div></div>" +
      '<div class="post-badges-col">' +
      '<span class="organic-pill" title="Đã vượt qua bộ lọc 7 chiến thuật Seeding">✓ Organic</span>' +
      "</div></div>" +
      '<div class="topic-pill-row">' +
      '<span class="topic-tag">' +
      escapeHtml(post.topic_label) +
      "</span>" +
      (post.is_anonymous ? '<span class="topic-tag">Đăng ẩn danh</span>' : "") +
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
      highlightText(displayBody, q) +
      "</div>" +
      (needsTruncate
        ? '<button type="button" class="expand-body-btn" data-expand-post="' +
          escapeHtml(post.post_sig) +
          '">' +
          (isBodyExpanded ? "Thu gọn" : "Xem toàn văn") +
          "</button>"
        : "") +
      '<div class="post-stats-strip">' +
      '<span class="num"><strong>' +
      post.clean_comments_count +
      "</strong> bình luận thật</span>" +
      (post.filtered_comments_count > 0
        ? '<span class="spam-stripped-note num">Đã lọc ' +
          post.filtered_comments_count +
          " bình luận rác</span>"
        : '<span>Chỉ xem • Nguồn Facebook Group</span>') +
      "</div>" +
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
      '<span class="readonly-lock-tag">🔒 Chỉ xem</span>' +
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
        "<p>Thử bỏ bớt bộ lọc chủ đề, hội nhóm hoặc gõ từ khóa khác ngắn gọn hơn (ví dụ: lớp 1, trường, HSK, 20/11).</p>" +
        '<button type="button" class="btn btn-primary" id="emptyResetBtn">Đặt lại tất cả bộ lọc</button>' +
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

  function renderSeedingDrawer() {
    if (!state.data) return;
    const samples = state.data.blocked_samples || [];
    const s = state.data.summary;
    els.seedingDialogSub.textContent =
      "Đã tự động chặn " +
      s.blocked_seeding_posts_count +
      " bài Seeding / Rao vặt (hiển thị " +
      samples.length +
      " mẫu tiêu biểu nhất)";

    if (samples.length === 0) {
      els.seedingDrawerBody.innerHTML = "<p>Chưa có mẫu Seeding nào bị chặn.</p>";
      return;
    }

    els.seedingDrawerBody.innerHTML = samples
      .map(function (item) {
        const label = SEEDING_INTENT_LABELS[item.seeding_intent] || item.seeding_intent;
        return (
          '<div class="blocked-sample-card">' +
          '<div class="blocked-sample-top">' +
          '<span class="intent-pill">' +
          escapeHtml(label) +
          " • " +
          item.seeding_score +
          "/100</span>" +
          '<span class="num">Rải ' +
          item.cross_group_count +
          " nhóm</span>" +
          "</div>" +
          "<div><strong>" +
          escapeHtml(item.author) +
          "</strong> &bull; <span>" +
          escapeHtml(item.group_name) +
          "</span></div>" +
          '<p class="blocked-preview">' +
          escapeHtml(item.text_preview) +
          "...</p>" +
          "</div>"
        );
      })
      .join("");
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

  function clearAllFilters() {
    state.topicId = "ALL";
    state.groupSlug = "ALL";
    state.tagSlug = "ALL";
    state.search = "";
    state.savedOnly = false;
    state.visibleCount = PAGE_SIZE;
    els.searchInput.value = "";
    renderSidebarTopics();
    renderSidebarTags();
    renderQuickTagsBar();
    renderSidebarGroups();
    renderFeed();
  }

  function bindEvents() {
    let searchTimer = null;
    els.searchInput.addEventListener("input", function () {
      if (searchTimer) clearTimeout(searchTimer);
      searchTimer = setTimeout(function () {
        state.search = els.searchInput.value;
        state.visibleCount = PAGE_SIZE;
        renderFeed();
      }, 180);
    });

    els.groupQuickSearch.addEventListener("input", function () {
      state.groupSearch = els.groupQuickSearch.value;
      renderSidebarGroups();
    });

    els.topicNavList.addEventListener("click", function (ev) {
      const btn = ev.target.closest("[data-topic-id]");
      if (!btn) return;
      state.topicId = btn.getAttribute("data-topic-id") || "ALL";
      state.visibleCount = PAGE_SIZE;
      renderSidebarTopics();
      renderFeed();
      closeMobileSidebar();
    });

    els.groupNavList.addEventListener("click", function (ev) {
      const btn = ev.target.closest("[data-group-slug]");
      if (!btn) return;
      state.groupSlug = btn.getAttribute("data-group-slug") || "ALL";
      state.visibleCount = PAGE_SIZE;
      renderSidebarGroups();
      renderFeed();
      closeMobileSidebar();
    });

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

    document.querySelector(".sort-pills").addEventListener("click", function (ev) {
      const btn = ev.target.closest("[data-sort]");
      if (!btn) return;
      state.sortBy = btn.getAttribute("data-sort") || "hot";
      document.querySelectorAll(".sort-pill").forEach(function (p) {
        p.classList.toggle("is-active", p === btn);
      });
      state.visibleCount = PAGE_SIZE;
      renderFeed();
    });

    els.insightList.addEventListener("click", function (ev) {
      const btn = ev.target.closest("[data-insight-topic]");
      if (!btn) return;
      state.topicId = btn.getAttribute("data-insight-topic") || "ALL";
      state.search = btn.getAttribute("data-insight-query") || "";
      state.groupSlug = "ALL";
      state.tagSlug = "ALL";
      state.savedOnly = false;
      state.visibleCount = PAGE_SIZE;
      els.searchInput.value = state.search;
      renderSidebarTopics();
      renderSidebarTags();
      renderQuickTagsBar();
      renderSidebarGroups();
      renderFeed();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    els.postList.addEventListener("click", function (ev) {
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
          const quote =
            "[" +
            post.group_name +
            " — " +
            post.author +
            "]\n" +
            post.text +
            (post.permalink ? "\nNguồn: " + post.permalink : "");
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(quote).then(
              function () {
                showToast("Đã sao chép trích dẫn bài viết sạch");
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

    [
      els.openSeedingDrawerBtn,
      els.railOpenSeedingBtn,
      els.mobileOpenDrawerBtn,
      els.inlineInspectSeedingBtn,
    ].forEach(function (btn) {
      if (btn) {
        btn.addEventListener("click", function () {
          openSeedingDrawer(btn);
        });
      }
    });

    els.closeSeedingDrawerBtn.addEventListener("click", closeSeedingDrawer);
    els.seedingDrawer.addEventListener("click", function (ev) {
      if (ev.target === els.seedingDrawer) closeSeedingDrawer();
    });

    document.addEventListener("keydown", function (ev) {
      if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "k") {
        ev.preventDefault();
        els.searchInput.focus();
      } else if (ev.key === "Escape") {
        if (els.leftSidebar.classList.contains("is-open")) {
          closeMobileSidebar();
        }
      }
    });
  }

  async function loadForumData() {
    // 1. Only try live SQLite API when served by local preview_server.py (127.0.0.1 / localhost)
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
        // Fallback cleanly to static JSON/JS
      }
    }

    // 2. Fallback to pre-loaded JS bundle
    if (window.CDH_CLEAN_FORUM_DATA && Array.isArray(window.CDH_CLEAN_FORUM_DATA.posts)) {
      return window.CDH_CLEAN_FORUM_DATA;
    }

    // 3. Fallback to static JSON
    const resJson = await fetch("assets/data/clean_forum_feed.json", { cache: "no-store" });
    if (!resJson.ok) {
      throw new Error("Không tải được dữ liệu diễn đàn sạch");
    }
    return resJson.json();
  }

  async function init() {
    applyStoredTheme();
    bindEvents();

    els.postList.innerHTML =
      '<div class="empty-state"><p>Đang nạp và làm sạch dữ liệu từ kho hội nhóm Cò Đi Học...</p></div>';

    try {
      state.data = await loadForumData();
      renderTelemetry();
      renderSidebarTopics();
      renderSidebarTags();
      renderQuickTagsBar();
      renderSidebarGroups();
      renderInsights();
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
