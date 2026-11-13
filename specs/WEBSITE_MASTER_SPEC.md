# ĐẶC TẢ KỸ THUẬT & TIÊU CHUẨN KIỂM ĐỊNH TOÀN DIỆN — CÒ ĐI HỌC OFFICIAL HUB (`WEBSITE_MASTER_SPEC v2.0`)

- **Mã tài liệu:** `SPEC-NWE-CODIHOC-WEB-v2.0`
- **Dự án:** Cổng thông tin & Trợ lý AI đồng hành cùng phụ huynh **Cò Đi Học** (`website_codihoc` & `portal/codihoc`)
- **Mục tiêu cốt lõi:** Đảm bảo 100% bản phát hành lên môi trường Production không bao giờ tái diễn các lỗi: (1) Vỡ bố cục do lệch tên class CSS giữa HTML/JS và tệp `.css`, (2) Lộ nhãn quy trình nội bộ / YAML / Markdown thô ra giao diện phụ huynh, (3) Cắt cụt nội dung bài viết khi xử lý dữ liệu, (4) Sai chuẩn viết hoa tiếng Việt (Sentence case) và từ vựng xuất bản.

---

## 1. Kiến trúc Tổng thể & Phân luồng Tệp tin (System Architecture)

| Tệp tin | Vai trò | Quy tắc Bất biến (Invariants) |
| :--- | :--- | :--- |
| `index.html` | Khung giao diện chính (Single-Page Hub) | Chỉ sử dụng các class đã được định nghĩa trong `assets/css/style.css` (không phụ thuộc Tailwind CDN lúc chạy). Mọi tiêu đề hiển thị tuân thủ Sentence case tiếng Việt. |
| `assets/css/style.css` | Hệ thống định kiểu & Design Tokens duy nhất | Phải bao phủ **100% class CSS** xuất hiện trong `index.html`, `assets/js/app.js` và chuỗi `contentHtml` trong `assets/js/data.js` (`0` Orphan CSS Classes). |
| `assets/js/data.js` | Kho dữ liệu tĩnh xuất bản (`window.CDH_DATA`) | Chỉ chứa dữ liệu sạch dành cho phụ huynh cuối. Tuyệt đối không chứa YAML frontmatter, nhãn quy trình nội bộ (`PHẦN A/B/C`, `Vòng duyệt`, `VOC Insight`), hoặc tên thương hiệu trường tư/trung tâm thương mại. |
| `assets/js/app.js` | Logic kết xuất DOM & Tương tác người dùng | Phải có cơ chế dự phòng an toàn (`fallback`) cho mọi trường dữ liệu, không bao giờ sinh chuỗi `undefined`, `null` hoặc `NaN` trên DOM. |
| `specs/verify_website_spec.py` | Cây thước kiểm định tự động 5 tầng | Phải được chạy và đạt `PASS 100%` ở cả 5 tầng trước mọi lệnh `git commit` / đồng bộ sang `portal/codihoc`. |

---

## 2. Đặc tả 10 Phân khu Giao diện & Khung StoryBrand SB7 (Layout & UX Specification)

Trang chủ `index.html` được tổ chức thành 10 phân khu tuần tự theo khung tự sự **StoryBrand SB7**, với các ràng buộc hình học bắt buộc trên trình duyệt thật:

### 2.1. Thanh Điều hướng (`#siteHeader` — Single-Tier Sticky Header)
- **Cấu trúc:** 1 tầng duy nhất (`height <= 80px` trên Desktop `1440px`), có `position: sticky; top: 0; z-index: 100`.
- **Thành phần:**
  1. Cụm thương hiệu (`.brand-logo`): Ảnh biểu trưng tròn `co_ava_cropped.jpg` (`42x42px`), tên **Cò Đi Học** và dòng định vị phụ trợ ngắn gọn.
  2. Thanh menu điều hướng (`.nav-menu`): Gồm đúng 5 mục neo (`Tiếng lòng cha mẹ` $\to$ `#problem-section`, `3 bước cùng Cò` $\to$ `#plan-section`, `Cẩm nang gỡ rối` $\to$ `#resources-section`, `16 bài chuyên sâu` $\to$ `#blog-section`, `Thư viện video` $\to$ `#video-section`). Tất cả hiển thị trên **1 dòng ngang duy nhất** (`white-space: nowrap`), không rớt dòng.
  3. Cụm nút hành động (`.header-actions`): Nút chính **Chat 1-1 với Cò đi học** (mở `#ctaPopupModal`) và nút phụ **Tham gia nhóm Zalo** (mở link nhóm Zalo cộng đồng).

### 2.2. Khu vực Mở đầu (`#hero-section` — Above the Fold)
- **Bố cục:** Lưới 2 cột `.hero-grid` (`grid-template-columns: 1.25fr 0.75fr` trên Desktop, `1fr` trên Mobile).
- **Cột trái (`.hero-content`):**
  - Nhãn đối tượng (`.hero-eyebrow`): *"🌱 Dành riêng cho cha mẹ có con từ 4 đến 18 tuổi"*.
  - Tiêu đề chính (`.hero-title`): Chuẩn Sentence case tiếng Việt, nêu bật thông điệp gỡ bỏ áp lực trường lớp.
  - Đoạn dẫn (`.hero-subtitle`): Nêu rõ vai trò của Cò Đi Học (hỏi đáp nhanh hơn, lắng nghe từ hàng trăm hội nhóm, hội thảo, diễn đàn để đúc kết kinh nghiệm trả lời ngay khi bố mẹ cần).
  - Lưới 4 giá trị cốt lõi (`.hero-principles`): `display: grid; grid-template-columns: repeat(2, 1fr)` gồm: *Tiết kiệm thời gian*, *Tổng hợp để không bị sót*, *Sàng lọc để không bị loạn*, *Ghi nhớ để khỏi đau đầu*.
  - Cụm 2 nút CTA (`.hero-actions`):
    - CTA chính (`.btn-primary`): **👉 Chat 1-1 với Cò đi học**
    - CTA phụ (`.btn-secondary`): **💬 Tham gia nhóm Zalo**
- **Cột phải (`.hero-visual`):** Sử dụng **ảnh tĩnh** (`assets/images/co_14_co_giao_su_2.png`), luôn nạp thành công (`naturalWidth > 0`), kèm nhãn xác thực nổi `.hero-floating-badge`.

### 2.3. Dải 4 Trụ cột Đồng hành (`#values-section`)
- **Bố cục:** Lưới 4 cột ngang `.values-strip-grid` (`grid-template-columns: repeat(4, 1fr)` trên Desktop `1440px`, `repeat(2, 1fr)` trên Tablet, `1fr` trên Mobile).
- **Ràng buộc hình học:** 4 thẻ `.value-strip-card` trên Desktop phải có cùng tọa độ đỉnh (`top` chênh lệch $\le 2\text{px}$) và cùng chiều cao.

### 2.4. Khu vực Nỗi đau 3 Tầng & Người dẫn đường (`#problem-section`)
- **Bố cục:**
  - Lưới 3 cột `.problem-grid` thể hiện 3 tầng áp lực theo StoryBrand: (1) *Vấn đề bề nổi*, (2) *Nỗi lo trong lòng*, (3) *Điều đáng lẽ phải khác*.
  - Khung Người dẫn đường `.guide-banner` với lưới 2 cột `.guide-grid` thể hiện **Sự thấu cảm (Empathy)** và **Năng lực tổng hợp (Authority)** của Cò Đi Học.

### 2.5. Khu vực Kế hoạch 3 Bước (`#plan-section`)
- **Bố cục:** Lưới 3 cột `.plan-steps-grid` (hoặc `.plan-grid`) chứa 3 thẻ `.step-card` (hoặc `.plan-card`).
- **Ràng buộc chống tái lỗi vỡ khung (`ERR-WEB-UNSTYLED-SECTION`):**
  - `.plan-steps-grid` trên Desktop (`1440px`) bắt buộc có `getComputedStyle(el).display === 'grid'`.
  - Mỗi `.step-card` bắt buộc có nền trắng (`rgb(255, 255, 255)`), viền bo góc (`borderRadius >= 12px`), và 3 thẻ `01`, `02`, `03` phải nằm trên cùng một hàng ngang (`top` bằng nhau).
  - Mỗi huy hiệu số `.step-number` phải là hình tròn (`width == height == 48px`, `borderRadius == '50%'` hoặc `'24px'`).

### 2.6. Thư viện 22 Bài Phân tích Chuyên sâu & Nghiên cứu Quốc tế (`#blog-section` & `#readerModal`)
- **Lưới thẻ bài viết (`#blogGrid.blog-grid`):**
  - Hiển thị đủ 22 thẻ `.blog-card` theo lưới 3 cột trên Desktop (16 bài gỡ rối học đường Việt Nam + 6 bài tổng hợp nghiên cứu quốc tế), áp dụng mở rộng tiệm tiến (hiện 6 thẻ đầu tiên và mở rộng 22 thẻ khi bấm `#toggleAllBlogsBtn`).
  - Mỗi thẻ ngoài website hiển thị tối giản gồm: Ảnh bìa 16:9 thiết kế theo chuẩn `/fac-thumbnail` (`.blog-card-thumb-wrap > img.blog-card-thumb`) và Tiêu đề bài viết đã tối ưu ngắn gọn, tự nhiên (`.blog-card-title`). Toàn bộ nội dung tóm tắt, tiếng lòng phụ huynh và căn cứ chi tiết chỉ mở ra bên trong `#readerModal` khi người dùng bấm vào thẻ.
- **Cửa sổ Đọc bài Chuyên sâu (`#readerModal`):**
  - Khi mở một bài viết bất kỳ (`openBlogReader(id)`):
    - Cột trái (`.reader-sidebar`): Hiển thị mục lục bài viết (`#readerTocList`), có ít nhất 3 mục neo khớp 100% với các thẻ `<h2>`, `<h3>` trong bài.
    - Cột phải (`.reader-main`): Hiển thị tiêu đề bài viết duy nhất tại `#readerArticleTitle` (không có thẻ `<h1>` lặp lại bên trong `#readerArticleBody`), hộp tiếng lòng phụ huynh (`#readerPainBox`), nội dung chi tiết (`#readerArticleBody` có độ dài văn bản thuần $\ge 3.000$ ký tự), và khung gợi ý câu hỏi Zalo cuối bài.

### 2.7. Video Giới thiệu Cò Đi Học (`#video-section`)
- **Bố cục:** Trình phát video 16:9 độc lập căn giữa (`.video-showcase-grid` gồm 1 cột tối đa `860px`):
  - Khung `.main-player-wrap`: Trình phát video HTML5 `#mainVideoPlayer` phát trực tiếp tệp video giới thiệu chính thức (`codihoc_intro_homepage.mp4`), kèm dòng chú thích gọn và liên kết Zalo; không hiển thị danh sách chia chương hoặc hộp lời thoại bên cạnh video.

### 2.8. Cẩm nang Gỡ rối Học đường & Đối sánh 4 Lộ trình Học tập (`#resources-section`)
- **Thanh tìm kiếm & Bộ lọc 2 Tab Thực chứng:**
  - Chỉ hiển thị đúng **2 Tab dữ liệu thật** (`💡 Hỏi đáp nhanh 16 tình huống thực tế` và `⚖️ Đối sánh 4 lộ trình học tập phổ thông`). Tuyệt đối không hiển thị bảng "10 cộng đồng phụ huynh tiêu biểu / 57 hội nhóm" giả lập từ danh sách thu thập dữ liệu nội bộ.
  - Ô tìm kiếm `.search-bar-wrap > input#guideSearchInput.search-input` có viền, biểu tượng kính lúp `.search-icon` căn giữa theo chiều dọc, tự động lọc câu hỏi theo từ khóa gõ vào.
- **Danh sách 22 Chủ đề Gỡ rối Thực tế & Quốc tế (`#guidesContainer`):**
  - Chia làm 5 nhóm chủ đề ánh xạ **1-đối-1** với **22 bài nghiên cứu chuyên sâu thật** trong `data.blogs`.
  - Mỗi mục có trường `blogId` hợp lệ và nút **`📖 Đọc bài phân tích chuyên sâu đầy đủ ➔`** mở trực tiếp bài nghiên cứu tương ứng trong `#readerModal`.
- **Khu vực Đối sánh 4 Lộ trình Học tập Phổ thông (`#curriculaContainer`):**
  - Gồm 4 thẻ phân tích khách quan 4 lộ trình (Chương trình công lập chuẩn Bộ GD&ĐT 2018, Chương trình tư thục tự chủ và tăng cường, Chương trình song bằng quốc tế Cambridge/Oxford, Chương trình quốc tế toàn phần IB/AP).
  - **Ràng buộc phi thương mại:** Không nêu tên riêng bất kỳ trường tư thục hay trung tâm ngoại ngữ thương mại nào.

### 2.9. Không gian Kết nối Zalo & Đối thoại (`#community-section`)
- **Bố cục:** Lưới 2 cột `.zalo-hub-grid`:
  - Cột trái: Danh sách câu hỏi mẫu bấm-để-hỏi-ngay (`#zaloQuestionList`) và 2 nút CTA chuẩn (**Chat 1-1 với Cò đi học**, **Tham gia nhóm Zalo**).
  - Cột phải: Khung mô phỏng cuộc trò chuyện Zalo trực tiếp với Cò Đi Học (`#zaloChatBody`), tự động trả lời khi phụ huynh bấm vào câu hỏi gợi ý.

### 2.10. Bức tranh Chuyển hóa & Chân trang (`#stakes-section`, `#footer`, `#ctaPopupModal`, `.floating-zalo-btn`)
- **Bức tranh chuyển hóa (`#stakes-section`):** Lưới 2 cột `.stakes-grid` đối조 giữa *Nếu tiếp tục tự bơi giữa biển tin đồn* và *Khi có Cò Đi Học đồng hành mỗi ngày*, kết thúc bằng nút CTA chính **👉 Chat 1-1 với Cò đi học**.
- **Nút nổi góc phải dưới (`.floating-zalo-btn`) & Hộp thoại Đăng ký (`#ctaPopupModal`):** Luôn hoạt động ổn định, đóng/mở bằng nút bấm hoặc phím `Escape`.

---

## 3. Năm Cổng Kiểm định Bắt buộc Trước Xuất bản (The 5 Mandatory Audit Gates)

Để không bao giờ lặp lại tình trạng "chấm văn bản đạt 100 điểm nhưng giao diện thực tế bị vỡ hoặc sót rác", mọi phiên bản của website bắt buộc phải vượt qua kịch bản kiểm định tự động `specs/verify_website_spec.py` gồm **5 Cổng (Gates)** sau đây:

| Cổng | Tên Cổng Kiểm Định | Cơ chế Kiểm tra Cơ học & Thực thi | Điều kiện Đạt (`PASS`) |
| :--- | :--- | :--- | :--- |
| **Gate 1** | **CSS-to-DOM Selector Parity Gate** | Phân tích cú pháp toàn bộ thuộc tính `class="..."` trong `index.html`, `assets/js/app.js` và `assets/js/data.js`, đối chiếu trực tiếp với bảng bộ chọn (selectors) trong `assets/css/style.css`. | **`0` Orphan CSS Classes** (Không có bất kỳ class nào được gọi trong HTML/JS mà thiếu định nghĩa trong `style.css`). |
| **Gate 2** | **Playwright Live Computed Layout & Geometry Gate** | Khởi chạy trình duyệt Chromium thật ở 2 độ phân giải (`1440x900` Desktop & `390x844` Mobile), kiểm tra `window.getComputedStyle` và `getBoundingClientRect` của toàn bộ phân khu. | • `scrollWidth <= clientWidth` (0 tràn ngang)<br>• Mọi khung lưới (`.hero-grid`, `.values-strip-grid`, `.problem-grid`, `.plan-steps-grid`, `.blog-grid`, `.video-showcase-grid`, `.zalo-hub-grid`, `.stakes-grid`) có `display: grid` trên Desktop<br>• Các thẻ cùng hàng trong `#values-section`, `#problem-section`, `#plan-section`, `#blog-section` có tọa độ `top` thẳng hàng ($\Delta \text{top} \le 2\text{px}$)<br>• 100% ảnh `<img>` có `complete == true` và `naturalWidth > 0`<br>• `0` Console Errors, `0` Page Errors, `0` Failed Network Requests. |
| **Gate 3** | **Data Schema & Content Integrity Gate** | Kiểm tra cấu trúc `window.CDH_DATA` trong `assets/js/data.js` trên cả 16 bài blog, 30 mục cẩm nang, 10 cộng đồng tiêu biểu, 4 hệ giáo dục, 2 video và bộ câu hỏi Zalo. | • `0` rò rỉ YAML/Markdown (`---`, `article_id`, `cartridge`, `PHẦN A/B/C`, `Vòng duyệt`, `VOC`, `P\d{2}`, `Node A-`, `Whitelist`, `BỐI CẢNH:`)<br>• `0` ký tự lỗi bảng mã ngoại lai (`Bengali`, `Cyrillic`, `CJK`), `0` dấu gạch ngang `–`, `0` dấu backtick `` ` ``<br>• `0` trích dẫn chân trang treo (`[1]`, `[2]`... không có danh mục nguồn)<br>• `0` danh sách 1 phần tử đóng giả tiêu đề phụ (`<ul><li>...</li></ul>`)<br>• 16/16 bài có `title != summary`, `quote` cụ thể ($\ge 35$ ký tự), `contentHtml` $\ge 3.000$ ký tự, `toc` $\ge 3$ mục khớp thẻ `<h2>`/`<h3>`, `0` thẻ `<h1>` lặp trong `contentHtml`<br>• `0` tên thương hiệu thương mại trong toàn bộ dữ liệu công khai. |
| **Gate 4** | **Interactive Runtime State Gate** | Giả lập thao tác người dùng thật qua Playwright: Bấm từng tab lọc `#blogFilterTabs` kiểm tra tổng phân hoạch bài viết (`16 = 2 + 11 + 2 + 1`), mở `#readerModal`, gõ tìm kiếm vào `#guideSearchInput`, kiểm tra `0` liên kết chết `href="#"`. | Tất cả thao tác phản hồi chính xác dưới `200ms`, tổng số bài theo các tab lọc khớp tuyệt đối `16`, không phát sinh lỗi JS hoặc lệch khung hiển thị. |
| **Gate 5** | **Official `/audit:publish` & `/audit:anti-slop` CLI Gate** | Xuất toàn bộ văn bản hiển thị công khai ra `temp/website_public_content.md` và chạy bộ công cụ CLI chính thức `run_audit.py publish` & `run_audit.py antislop`. | • `/audit:publish`: **100.0 / 100.0** (PASS cả 5 cổng con, Sentence case tiếng Việt, `0` dấu `—`, `0` từ cấm `'mình'`, `'tuyệt đối'`, `'bóc trần'`, `0` dấu phẩy Oxford)<br>• `/audit:anti-slop`: **100.0 / 100.0** (`CLEAN`). |

---

## 4. Quy trình Vận hành Chuẩn khi Cập nhật Website (Standard Operating Procedure)

1. **Bước 1 (Đọc Spec):** Đọc tệp `specs/WEBSITE_MASTER_SPEC.md` trước khi sửa `index.html`, `style.css`, `app.js` hoặc `data.js`.
2. **Bước 2 (Thực thi):** Thực hiện thay đổi mã nguồn hoặc dữ liệu. Nếu thêm bất kỳ class CSS mới nào vào HTML/JS, bắt buộc khai báo ngay trong `assets/css/style.css`.
3. **Bước 3 (Chạy Kiểm định 5 Cổng):** Chạy lệnh kiểm định tự động:

   ```powershell
   python "c:\commandcenter\08_New_Way_Edu\website_codihoc\specs\verify_website_spec.py"
   ```

4. **Bước 4 (Nghiệm thu & Đồng bộ):** Chỉ khi `verify_website_spec.py` trả về `ALL 5 GATES PASSED (100%)`, mới được phép đồng bộ sang `c:\commandcenter\08_New_Way_Edu\portal\codihoc\` và đẩy lên GitHub `main`.
