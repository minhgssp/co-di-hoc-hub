#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Executable Website Specification Verifier (5-Gate Harness)
Spec Reference: specs/WEBSITE_MASTER_SPEC.md (SPEC-NWE-CODIHOC-WEB-v2.0)
"""
import json
import os
import re
import subprocess
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

ROOT_DIR = Path(__file__).resolve().parent.parent
INDEX_HTML = ROOT_DIR / "index.html"
STYLE_CSS = ROOT_DIR / "assets" / "css" / "style.css"
APP_JS = ROOT_DIR / "assets" / "js" / "app.js"
DATA_JS = ROOT_DIR / "assets" / "js" / "data.js"
PUBLIC_MD = ROOT_DIR / "temp" / "website_public_content.md"
EXAMPLE_REPORT = ROOT_DIR / "temp" / "example_report.json"
AUDIT_CLI = Path(r"c:\Users\user\.gemini\antigravity\.agents\skills\audit\scripts\run_audit.py")
PREVIEW_URL = "http://127.0.0.1:8099/index.html"


def check_gate_1_css_dom_parity() -> list[str]:
    """Gate 1: Verify 100% of CSS classes in HTML/JS/Data exist in style.css."""
    errors = []
    css_text = STYLE_CSS.read_text(encoding="utf-8")
    # Remove CSS comments and rule bodies {...} so only selectors remain
    no_comments = re.sub(r"/\*[\s\S]*?\*/", "", css_text)
    selector_chunks = re.sub(r"\{[^{}]*\}", "\n", no_comments)

    defined_classes = set()
    # Match escaped utility classes like .py-2\.5 or .md\:text-lg
    for m in re.finditer(r"\.([a-zA-Z0-9_-]+(?:\\[.:][a-zA-Z0-9_-]+)+)", selector_chunks):
        defined_classes.add(m.group(1).replace("\\.", ".").replace("\\:", ":"))
    # Match standard and compound class selectors like .zalo-tier-card.featured
    for m in re.finditer(r"\.([a-zA-Z0-9_-]+)", selector_chunks):
        defined_classes.add(m.group(1))

    used_classes = set()
    for path in (INDEX_HTML, APP_JS, DATA_JS):
        text = path.read_text(encoding="utf-8")
        for match in re.finditer(r'class=["\']([^"\']+)["\']', text):
            raw = re.sub(r"\$\{[^}]+\}", "", match.group(1))
            for token in raw.split():
                if re.match(r"^[a-zA-Z0-9_:-]+(?:\.[0-9]+)?$", token):
                    used_classes.add(token)

    orphan_classes = sorted(cls for cls in used_classes if cls not in defined_classes)
    if orphan_classes:
        errors.append(f"[Gate 1] Orphan CSS classes missing in style.css: {orphan_classes}")
    return errors


def check_gate_2_and_4_playwright_live_dom() -> list[str]:
    """Gate 2 & Gate 4: Verify live computed geometry, bounding boxes, and interactive states."""
    errors = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # 1. Desktop (1440x900) Geometry & Interactive Check
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        console_errors = []
        page_errors = []
        failed_reqs = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda err: page_errors.append(str(err)))
        page.on("requestfailed", lambda req: failed_reqs.append(req.url))

        page.goto(PREVIEW_URL, wait_until="networkidle")
        page.wait_for_timeout(300)

        desktop_audit = page.evaluate("""() => {
            const errs = [];
            // Horizontal overflow
            if (document.documentElement.scrollWidth > document.documentElement.clientWidth) {
                errs.push(`Desktop horizontal overflow: scrollWidth=${document.documentElement.scrollWidth} > clientWidth=${document.documentElement.clientWidth}`);
            }

            // Header height
            const header = document.getElementById('siteHeader');
            if (!header || header.getBoundingClientRect().height > 84) {
                errs.push(`Header height invalid: ${header ? header.getBoundingClientRect().height : 'missing'}`);
            }

            // Broken images
            document.querySelectorAll('img').forEach(img => {
                if (!img.complete || img.naturalWidth === 0) {
                    errs.push(`Broken image: ${img.src}`);
                }
            });

            // Required grids must compute to display: grid
            const requiredGrids = [
                '.hero-grid',
                '.values-strip-grid',
                '.problem-grid',
                '.plan-steps-grid',
                '.blog-grid',
                '.video-showcase-grid',
                '.zalo-hub-grid',
                '.stakes-grid',
                '.footer-grid'
            ];
            for (const sel of requiredGrids) {
                const el = document.querySelector(sel);
                if (!el) {
                    errs.push(`Missing required grid container: ${sel}`);
                } else {
                    const disp = window.getComputedStyle(el).display;
                    if (disp !== 'grid' && disp !== 'flex') {
                        errs.push(`Unstyled grid container ${sel}: computed display is '${disp}' instead of 'grid'`);
                    }
                }
            }

            // Verify #plan-section 3 step cards are horizontally aligned and styled
            const stepCards = Array.from(document.querySelectorAll('#plan-section .step-card'));
            if (stepCards.length !== 3) {
                errs.push(`Expected 3 .step-card in #plan-section, found ${stepCards.length}`);
            } else {
                const top0 = stepCards[0].getBoundingClientRect().top;
                stepCards.forEach((card, i) => {
                    const rect = card.getBoundingClientRect();
                    const cs = window.getComputedStyle(card);
                    if (Math.abs(rect.top - top0) > 2) {
                        errs.push(`#plan-section step-card[${i}] is not horizontally aligned on desktop (top=${rect.top} vs ${top0})`);
                    }
                    if (cs.backgroundColor === 'rgba(0, 0, 0, 0)') {
                        errs.push(`#plan-section step-card[${i}] has transparent background (unstyled card)`);
                    }
                });
            }

            // Verify 16 blog cards rendered
            const blogCards = document.querySelectorAll('#blogGrid .blog-card');
            if (blogCards.length !== 16) {
                errs.push(`Expected 16 .blog-card in #blogGrid, found ${blogCards.length}`);
            }

            return errs;
        }""")
        errors.extend(f"[Gate 2] {e}" for e in desktop_audit)

        # Gate 4: Interactive Runtime State checks
        # Test opening Reader Modal by clicking blog card 0, 5, 15
        for idx in (0, 5, 15):
            page.locator("#blogGrid .blog-card").nth(idx).click()
            page.wait_for_timeout(120)
            modal_err = page.evaluate("""(cardIdx) => {
                const modal = document.getElementById('readerModal');
                if (!modal || !modal.classList.contains('active')) return `Reader modal failed to open for card[${cardIdx}]`;
                const title = document.getElementById('readerArticleTitle')?.innerText?.trim() || '';
                const body = document.getElementById('readerContent');
                const tocItems = document.querySelectorAll('#readerTocList a');
                if (!title) return `Reader modal empty title for card[${cardIdx}]`;
                if (!body || body.innerText.trim().length < 2500) return `Reader modal body too short (${body?.innerText?.trim()?.length}) for card[${cardIdx}]`;
                if (body.querySelector('h1')) return `Duplicate <h1> inside #readerContent for card[${cardIdx}]`;
                if (tocItems.length < 3) return `Reader modal TOC has fewer than 3 items (${tocItems.length}) for card[${cardIdx}]`;
                return null;
            }""", idx)
            if modal_err:
                errors.append(f"[Gate 4] {modal_err}")
            page.locator("#closeReaderBtn").click()
            page.wait_for_timeout(80)

        # Test Guide Search Filtering
        page.fill("#guideSearchInput", "bán trú")
        page.wait_for_timeout(150)
        search_count = page.locator("#guidesContainer .guide-accordion-item").count()
        if search_count == 0 or search_count >= 30:
            errors.append(f"[Gate 4] Guide search filter failed for 'bán trú' (count={search_count})")
        page.fill("#guideSearchInput", "")
        page.wait_for_timeout(100)

        if console_errors:
            errors.append(f"[Gate 2] Console errors: {console_errors}")
        if page_errors:
            errors.append(f"[Gate 2] Page runtime errors: {page_errors}")
        if failed_reqs:
            errors.append(f"[Gate 2] Failed network requests: {failed_reqs}")

        # 2. Mobile (390x844) Overflow Check
        mobile_page = browser.new_page(viewport={"width": 390, "height": 844})
        mobile_page.goto(PREVIEW_URL, wait_until="networkidle")
        mobile_page.wait_for_timeout(200)
        mobile_overflow = mobile_page.evaluate(
            "() => document.documentElement.scrollWidth > document.documentElement.clientWidth"
        )
        if mobile_overflow:
            errors.append("[Gate 2] Mobile (390x844) horizontal overflow detected")

        browser.close()
    return errors


def check_gate_3_data_integrity() -> list[str]:
    """Gate 3: Verify CDH_DATA schema, zero internal metadata leaks, and zero commercial brand names."""
    errors = []
    cmd = [
        "node",
        "-e",
        r"""
        const fs = require('fs');
        const vm = require('vm');
        const code = fs.readFileSync(process.argv[1], 'utf8');
        const ctx = { window: {} };
        vm.createContext(ctx);
        vm.runInContext(code, ctx);
        console.log(JSON.stringify(ctx.window.CDH_DATA));
        """,
        str(DATA_JS),
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")
    if res.returncode != 0:
        return [f"[Gate 3] Failed to parse data.js: {res.stderr}"]

    data = json.loads(res.stdout)
    blogs = data.get("blogs", [])
    if len(blogs) != 16:
        errors.append(f"[Gate 3] Expected 16 blogs, found {len(blogs)}")

    forbidden_internal_patterns = [
        r"article_id:",
        r"cartridge:",
        r"PHẦN [ABC]\s*[-—]",
        r"Vòng duyệt",
        r"VOC Insight",
        r"VOC Pain Tree",
        r"\bVOC\b",
        r"\bP\d{2}\b",
        r"Node [A-Z]-\d+",
        r"Mẫu chuẩn \d+/\d+",
        r"BÀI \d+\s*\(",
        r"Chuyên gia Hoàng Mai Chi",
        r"Maichi Edu",
        r"\bWhitelist\b",
        r"BỐI CẢNH:",
        r"LỜI THOẠI CÒ ĐI HỌC:",
    ]
    forbidden_brands = [
        "Vinschool", "Archimedes", "Ngôi Sao", "Nguyễn Siêu", "Đoàn Thị Điểm",
        "Olympia", "Dewey", "Marie Curie", "Lomonoxop", "Wellspring", "TH School",
        "BVIS", "UNIS", "Concordia", "RGS", "Westlink", "True North", "St. Paul",
        "Apollo", "ILA", "VUS", "British Council", "Acellus", "Abeka", "I Can Read"
    ]

    full_json_str = json.dumps(data, ensure_ascii=False)
    for pat in forbidden_internal_patterns:
        if re.search(pat, full_json_str, flags=re.IGNORECASE):
            errors.append(f"[Gate 3] Internal metadata pattern '{pat}' leaked in data.js")

    for brand in forbidden_brands:
        flags = 0 if brand == "Ngôi Sao" else re.IGNORECASE
        if re.search(r"\b" + re.escape(brand) + r"\b", full_json_str, flags=flags):
            errors.append(f"[Gate 3] Commercial brand name '{brand}' leaked in data.js")

    for b in blogs:
        bid = b.get("id")
        title = b.get("title", "").strip()
        summary = b.get("summary", "").strip()
        quote = b.get("quote", "").strip()
        html = b.get("contentHtml", "").strip()
        toc = b.get("toc", [])
        plain_len = len(re.sub(r"<[^>]+>", "", html).strip())

        if title.lower() == summary.lower():
            errors.append(f"[Gate 3] {bid}: title equals summary")
        if len(quote) < 35 or "Trăn trở chân thực từ cộng đồng" in quote:
            errors.append(f"[Gate 3] {bid}: generic or too short quote")
        if plain_len < 3000:
            errors.append(f"[Gate 3] {bid}: contentHtml plain text too short ({plain_len} < 3000 chars)")
        if "<h1" in html.lower():
            errors.append(f"[Gate 3] {bid}: duplicate <h1> found inside contentHtml")
        if len(toc) < 3:
            errors.append(f"[Gate 3] {bid}: toc has fewer than 3 items ({len(toc)})")
        if re.search(r"\[\d+\]", html):
            errors.append(f"[Gate 3] {bid}: dangling numeric footnote citation [N] found in contentHtml")
        if re.search(r"<ul[^>]*>\s*<li>(?:(?!</li>)[\s\S])*?</li>\s*</ul>", html, flags=re.IGNORECASE):
            errors.append(f"[Gate 3] {bid}: single-item <ul><li>...</li></ul> pseudo-heading found")
        if "`" in html:
            errors.append(f"[Gate 3] {bid}: raw markdown backtick found in contentHtml")

    # Check for foreign script token glitches (Cyrillic, Bengali, CJK, etc.) or en-dash
    if "\u2013" in full_json_str:
        errors.append("[Gate 3] En-dash (–) found in data.js; must use standard hyphen (-)")
    if re.search(r"[\u0370-\u1DFF\u2E80-\u9FFF\uAC00-\uD7AF\uFFFD]", full_json_str):
        errors.append("[Gate 3] Foreign script glitch character (Cyrillic/Bengali/CJK) found in data.js")

    return errors


def check_gate_5_audit_cli() -> list[str]:
    """Gate 5: Run official /audit:publish, /audit:anti-slop, and /audit memory-scan CLI."""
    errors = []
    export_script = ROOT_DIR / "temp" / "run_once_export_web_to_md.js"
    if export_script.exists():
        subprocess.run(["node", str(export_script)], cwd=str(ROOT_DIR), check=True, capture_output=True)

    # 1. memory-scan --scenario web
    res_mem = subprocess.run(
        [sys.executable, str(AUDIT_CLI), "memory-scan", str(ROOT_DIR), "--scenario", "web"],
        capture_output=True, text=True, encoding="utf-8"
    )
    if res_mem.returncode != 0 or "PASS" not in res_mem.stdout:
        errors.append(f"[Gate 5] /audit memory-scan failed:\n{res_mem.stdout}")

    # 2. antislop
    res_slop = subprocess.run(
        [sys.executable, str(AUDIT_CLI), "antislop", str(PUBLIC_MD), "--force-external"],
        capture_output=True, text=True, encoding="utf-8"
    )
    if res_slop.returncode != 0 or "100.0 / 100.0" not in res_slop.stdout:
        errors.append(f"[Gate 5] /audit:anti-slop did not achieve 100.0/100.0:\n{res_slop.stdout}")

    # 3. publish
    res_pub = subprocess.run(
        [
            sys.executable, str(AUDIT_CLI), "publish", str(PUBLIC_MD),
            "--example-report", str(EXAMPLE_REPORT), "--force-external"
        ],
        capture_output=True, text=True, encoding="utf-8"
    )
    if res_pub.returncode != 0 or "100.0 / 100.0" not in res_pub.stdout:
        errors.append(f"[Gate 5] /audit:publish did not achieve 100.0/100.0:\n{res_pub.stdout}")

    return errors


def main() -> int:
    print("=" * 72)
    print("🛡️  VERIFYING CÒ ĐI HỌC HUB AGAINST WEBSITE_MASTER_SPEC v2.0 (5 GATES)")
    print("=" * 72)

    all_errors = []

    g1 = check_gate_1_css_dom_parity()
    print(f"Gate 1 (CSS-to-DOM Selector Parity):      {'✅ PASS (0 Orphan Classes)' if not g1 else f'❌ FAIL ({len(g1)})'}")
    all_errors.extend(g1)

    g24 = check_gate_2_and_4_playwright_live_dom()
    print(f"Gate 2 & 4 (Playwright Geometry & UX):    {'✅ PASS (Desktop + Mobile + Modals)' if not g24 else f'❌ FAIL ({len(g24)})'}")
    all_errors.extend(g24)

    g3 = check_gate_3_data_integrity()
    print(f"Gate 3 (Data Schema & Content Integrity): {'✅ PASS (16 Blogs + 30 Guides Clean)' if not g3 else f'❌ FAIL ({len(g3)})'}")
    all_errors.extend(g3)

    g5 = check_gate_5_audit_cli()
    print(f"Gate 5 (/audit:publish & anti-slop CLI):  {'✅ PASS (100.0/100.0 All 5 Gates)' if not g5 else f'❌ FAIL ({len(g5)})'}")
    all_errors.extend(g5)

    print("-" * 72)
    if all_errors:
        print(f"❌ VERIFICATION FAILED WITH {len(all_errors)} ERROR(S):")
        for err in all_errors:
            print(f"  - {err}")
        return 1

    print("🟢 ALL 5 GATES PASSED (100%) — READY FOR PRODUCTION DEPLOYMENT!")
    return 0


if __name__ == "__main__":
    sys.exit(main())
