# 🎒 Cò Đi Học Official Hub & Diễn Đàn Phụ Huynh Sạch (`website_codihoc/`)

> **Trang chủ Hub:** [`index.html`](file:///c:/commandcenter/08_New_Way_Edu/website_codihoc/index.html) (`https://www.codihoc.com`)  
> **Diễn đàn Phụ huynh Sạch (Chỉ đọc):** [`dien-dan.html`](file:///c:/commandcenter/08_New_Way_Edu/website_codihoc/dien-dan.html) (`https://www.codihoc.com/dien-dan`)  
> **Ngôi Nhà Tri Thức & Phòng Khám Chẩn Đoán Giáo Dục Độc Lập Đứng Hẳn Về Phía Phụ Huynh** — *Hotline & Zalo Bot 24/7: **0902 209 213** (`https://zalo.me/0902209213`)*

---

## 🧭 Dành Cho AI Agent Mới Vào Dự Án (Đọc 3 Tệp Này Trước Khi Chạm Code)

Mọi phiên AI Agent khi nâng cấp website hoặc diễn đàn Cò Đi Học **bắt buộc đọc đúng thứ tự 3 tài liệu gốc (SSOT)** dưới đây để không tạo nợ kỹ thuật (Technical Debt) và không lạc khỏi nhu cầu thực tế của phụ huynh:

1. **[`specs/FORUM_PRODUCT_STRATEGY_JTBD_KANO_OST_ROADMAP.md`](file:///c:/commandcenter/08_New_Way_Edu/website_codihoc/specs/FORUM_PRODUCT_STRATEGY_JTBD_KANO_OST_ROADMAP.md)** — **Kim chỉ nam Sản phẩm (JTBD × Desired Outcomes × Kano Model × Cây OST của Teresa Torres):** Ghi rõ tiêu chí thành công bằng ngôn ngữ tự nhiên của phụ huynh và **lộ trình 4 hướng tính năng** (`SOL-01` Lọc Quận/Trường, `SOL-02` Đúc kết 30s từ Phụ huynh, `SOL-03` Nút Gửi Zalo cho Vợ/Chồng, `SOL-04` Hồ sơ Review từng Trường & Bàn cân 2 Trường).
2. **[`specs/SPEC_07_SCHOOL_DISTRICT_ENTITY_TAGGING_BMAD_BACKEND.md`](file:///c:/commandcenter/08_New_Way_Edu/website_codihoc/specs/SPEC_07_SCHOOL_DISTRICT_ENTITY_TAGGING_BMAD_BACKEND.md)** — **Bản vẽ Kiến trúc BMAD + Backend (`/bmad-architecture-engine` & `/ak:backend-development`) cho tính năng `SOL-01` (Lọc nhanh Quận/Khu vực & Gắn thẻ Tên Trường):** Quy định rõ 4 chốt chặn chống nợ kỹ thuật, tách trường `post.entities` trực giao với `post.tags`, suy diễn Quận từ Trường ở Backend build-time và Ma trận 3 phương án kiến trúc.
3. **[`specs/WEBSITE_MASTER_SPEC.md`](file:///c:/commandcenter/08_New_Way_Edu/website_codihoc/specs/WEBSITE_MASTER_SPEC.md)** — **Đặc tả Kỹ thuật & Cây thước kiểm định 5 tầng (`SPEC-NWE-CODIHOC-WEB-v2.0`)** cho toàn bộ cấu trúc trang chủ và tiêu chuẩn phát hành.

*(Lưu ý: Bản đồng bộ của bộ tài liệu diễn đàn cũng được lưu tại Sprint [`SP_261112_05_FB_Group_Daily_Post_Comment_Crawler/specs/`](file:///c:/commandcenter/08_New_Way_Edu/06_Sprints/SP_261112_05_FB_Group_Daily_Post_Comment_Crawler/specs) với mã `05_*`, `06_*`, `07_*`).*

---

## 🏗️ Kiến Trúc Tệp Tin & Dòng Chảy Dữ Liệu (Hybrid Static + Local SQLite)

```text
c:\commandcenter\08_New_Way_Edu\website_codihoc\
├── README.md                                  # [Tệp này] Bản đồ Onboarding AI Agent & quy tắc kiến trúc
├── index.html                                 # Trang chủ chính thức Cò Đi Học (StoryBrand SB7, 22 bài viết, video)
├── dien-dan.html                              # Diễn đàn Phụ huynh Sạch 2 cột (Facebook Light / Threads Dark)
├── preview_server.py                          # Server cục bộ :8099 + endpoint GET /api/clean-feed từ SQLite
├── vercel.json / .vercelignore                # Cấu hình xuất bản Vercel Static (co-di-hoc-hub / codihoc.com)
├── assets/
│   ├── css/
│   │   ├── style.css                          # CSS chính cho index.html
│   │   └── dien-dan.css                       # CSS 2 cột chuẩn Facebook/Threads cho dien-dan.html
│   ├── js/
│   │   ├── data.js & app.js                   # Dữ liệu & logic cho index.html
│   │   ├── clean_forum_feed_data.js           # Snapshot dữ liệu tĩnh window.CDH_CLEAN_FORUM_DATA (cho mở file:// & Vercel)
│   │   └── dien-dan.js                        # Logic diễn đàn (Markdown renderer, 6 chủ đề, dải #Tag 1 dòng, avatar động vật)
│   └── data/
│       └── clean_forum_feed.json              # Nguồn dữ liệu diễn đàn sạch (xuất bởi group_harvest_db_store.py)
└── specs/
    ├── WEBSITE_MASTER_SPEC.md                 # Đặc tả chính trang chủ & ràng buộc hình học
    ├── FORUM_PRODUCT_STRATEGY_JTBD_KANO_OST_ROADMAP.md # Chiến lược JTBD / Kano / Cây OST & 4 hướng tính năng
    ├── SPEC_07_SCHOOL_DISTRICT_ENTITY_TAGGING_BMAD_BACKEND.md # Thiết kế BMAD + Backend cho lọc Quận & Tên Trường
    └── verify_website_spec.py                 # Bộ kiểm định 5 tầng (BẮT BUỘC PASS 100% trước mọi deploy)
```

### Luồng Đồng Bộ Dữ Liệu Backend $\to$ Diễn Đàn
- **Kho SQLite gốc:** [`co_di_hoc_group_harvest.sqlite`](file:///c:/commandcenter/02_AI_Hub/Warehouse/Capability_Store/Postiz_Social_Publisher/data/co_di_hoc_group_harvest.sqlite) được cào hàng ngày trên máy chủ ACER và xử lý bởi [`group_harvest_db_store.py`](file:///c:/commandcenter/02_AI_Hub/Warehouse/Capability_Store/Postiz_Social_Publisher/group_harvest_db_store.py).
- Khi chạy `nwe_shared_cli.py fb-group-export-web` (hoặc `_export_all_csvs()`), Backend lọc seeding/rác, phân 6 Chủ đề, gắn 20 `#Tag` và kết xuất đồng thời [`clean_forum_feed.json`](file:///c:/commandcenter/08_New_Way_Edu/website_codihoc/assets/data/clean_forum_feed.json) lẫn [`clean_forum_feed_data.js`](file:///c:/commandcenter/08_New_Way_Edu/website_codihoc/assets/js/clean_forum_feed_data.js).
- Khi mở cục bộ qua [`preview_server.py`](file:///c:/commandcenter/08_New_Way_Edu/website_codihoc/preview_server.py), [`dien-dan.js`](file:///c:/commandcenter/08_New_Way_Edu/website_codihoc/assets/js/dien-dan.js) ưu tiên gọi `GET /api/clean-feed`; khi đẩy Vercel Static, trình duyệt tự fallback sang bản snapshot tĩnh.

---

## 🔒 4 Nguyên Tắc Bất Biến Chống Nợ Kỹ Thuật

1. **Làm nặng tại Backend Build-Time, giữ nhẹ 100% ở Frontend:** Không chạy Regex phân tích ngôn ngữ trên toàn bộ kho bài viết trong trình duyệt người dùng.
2. **Tách trục dữ liệu trực giao:** `topic_id` (6 chủ đề), `tags` (20 thẻ nỗi đau), `entities` (Quận & Tên trường tương lai), `ai_summary` (tóm tắt 30s tương lai) phải nằm ở các trường JSON riêng biệt, tương thích ngược 100%.
3. **Giữ gọn hệ bộ lọc & bố cục 2 cột:** Không thêm khối filter rườm rà ở cột trái hay hộp công cụ cồng kềnh đầu bảng tin.
4. **Kiểm định trước mọi phát hành:** Mọi thay đổi phải vượt qua [`verify_website_spec.py`](file:///c:/commandcenter/08_New_Way_Edu/website_codihoc/specs/verify_website_spec.py) (`5/5 GATES PASSED`) và kiểm tra Playwright trên `1440x900`, `768x1024`, `375x812` (Light + Dark Mode).

---

## 🚀 Hướng Dẫn Khởi Chạy & Kiểm Định

### Chạy Preview Cục Bộ
```bash
python preview_server.py
# Trang chủ: http://127.0.0.1:8099/index.html
# Diễn đàn:  http://127.0.0.1:8099/dien-dan.html
```

### Chạy Kiểm Định Spec Tự Động
```bash
python specs/verify_website_spec.py
```

### Triển Khai Lên Vercel Production
Dự án dùng Vercel Static Zero-Config (`vercel --prod` tại `website_codihoc/`, domain `https://www.codihoc.com` và `https://www.codihoc.com/dien-dan`).
