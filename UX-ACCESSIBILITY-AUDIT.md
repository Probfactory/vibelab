# VibeLab UX + Accessibility Audit Report

**Date:** 2026-03-02
**Auditor:** Claude (Principal Product Designer + Accessibility Specialist)
**Standard:** WCAG 2.2 AA
**Scope:** All 10 pages, design system, interaction patterns, responsive behavior

---

## Executive Summary

VibeLab has strong visual design and generally good content architecture, but **fails WCAG 2.2 AA compliance across virtually every criterion related to keyboard access, screen reader support, and focus management**. The app is effectively unusable for keyboard-only and screen reader users.

**Critical: 8** | **High: 12** | **Medium: 10** | **Low: 6**

---

## CRITICAL (Blocks Assistive Technology Users Entirely)

### CR1: No Focus Styles on Interactive Elements

**WCAG:** 2.4.7 Focus Visible (AA)
**Scope:** Entire application

Only 6 form inputs have `:focus` styles. **Every button, link, tab, card, and interactive element lacks focus styles.** No `:focus-visible` selectors exist anywhere in the CSS. Keyboard users cannot see where they are on the page.

**Affected elements (50+):** All `.btn` variants, `.nav-links a`, `.auth-tab`, `.google-btn`, `.filter-btn`, `.feed-tab`, `.profile-tab`, `.admin-tab`, `.follow-btn`, `.project-icon-btn`, `.comment-action`, `.reaction-btn`, `.modal-close`, `.project-card`, `.collection-card`, all footer links, all dropdown triggers/options.

**Fix:** Add a global focus-visible style and per-component focus rings:
```css
:focus-visible {
  outline: 2px solid var(--text);
  outline-offset: 2px;
}
```

---

### CR2: Modals Have No Focus Trap or ARIA Roles

**WCAG:** 2.4.3 Focus Order, 4.1.2 Name/Role/Value
**Files:** `shared.js` (auth/profile/submit/save modals), `profile.html` (invite modal), `vibe.html` (demo modal)

All 6 modals in the app:
- **No `role="dialog"` or `aria-modal="true"`**
- **No `aria-labelledby`** pointing to a heading
- **No focus trap** — Tab key moves focus to background elements
- **No focus restoration** — closing a modal does not return focus to the trigger
- **No Escape key handler** (except demo modal and tag search)

Screen readers don't announce modals. Keyboard users can tab behind them.

---

### CR3: Zero `aria-live` Regions in Entire Codebase

**WCAG:** 4.1.3 Status Messages (AA)
**Scope:** Entire application

No `aria-live`, `role="alert"`, or `role="status"` exists anywhere. Screen readers are never notified of:
- Auth errors (login/signup failures)
- Toast notifications (success/error messages)
- Username availability check results
- Invite code verification results
- Vibe/follow count changes
- Comment count updates
- Password strength indicator changes
- Form validation errors

---

### CR4: Custom Dropdown Is Keyboard-Inaccessible

**WCAG:** 2.1.1 Keyboard (A), 4.1.2 Name/Role/Value
**File:** `js/custom-dropdown.js`

The category/built-with/status dropdowns:
- Options are `<div>` elements with only `onclick` — **no `tabindex`, no `role="option"`**
- **No arrow key navigation** between options
- **No Escape key** to close
- **No `aria-expanded`** on trigger
- **No `role="listbox"`** on container

Keyboard-only users cannot select filter options at all.

---

### CR5: No Skip Navigation Link

**WCAG:** 2.4.1 Bypass Blocks (A)
**Scope:** All 10 pages

No skip-to-main-content link exists. Keyboard users must tab through the entire navigation on every page. Combined with CR1 (no focus styles), navigation is both invisible and inescapable.

---

### CR6: No `<main>` Landmark on 9 of 10 Pages

**WCAG:** 1.3.1 Info and Relationships, 2.4.1 Bypass Blocks
**Scope:** All pages except `admin.html`

Screen reader users use landmarks to navigate. Without `<main>`, they cannot jump to primary content. Only `admin.html` has `<main>`.

---

### CR7: Form Inputs Missing Labels

**WCAG:** 1.3.1 Info and Relationships, 4.1.2 Name/Role/Value
**Scope:** All forms

| Input | File | Issue |
|---|---|---|
| Home search | `index.html` | No `<label>` or `aria-label` |
| Explore search | `explore.html` | No `<label>` or `aria-label` |
| Tag search | `explore.html` | No `<label>` or `aria-label` |
| Comment textarea | `vibe.html` | No `<label>` or `aria-label` |
| Auth modal inputs | `shared.js` | `<label>` elements exist but have **no `for` attribute** |
| Profile edit inputs | `profile.html` | `<label>` elements lack `for` attributes |
| Submit project inputs | `shared.js` | `<label>` elements lack `for` attributes |

Only `reset-password.html` has proper `<label for="">` associations.

---

### CR8: `--text-muted` (#888) Fails Color Contrast

**WCAG:** 1.4.3 Contrast Minimum (AA) — requires 4.5:1 for normal text
**Scope:** 55+ elements across entire UI

`--text-muted` (#888888) on white backgrounds = **~3.5:1 ratio** (fails 4.5:1).

Used for: footer text, timestamps, labels, descriptions, placeholders, card metadata, bio text, stat labels, filter labels, help text, muted captions — affecting virtually every screen.

**Fix:** Change `--text-muted` to `#636363` (~5.9:1) or `#6b6b6b` (~5.0:1).

---

## HIGH Severity

### H1: No `prefers-reduced-motion` Support

**WCAG:** 2.3.3 Animation from Interactions (AAA, but best practice for AA)
**File:** `css/styles.css`

7 animations (3 infinite: `pulse-dot`, `float-card`, `marquee-scroll`) and 67 transitions run unconditionally. No `@media (prefers-reduced-motion: reduce)` query exists. Also, `html { scroll-behavior: smooth }` has no reduced-motion override. Users with vestibular disorders may experience discomfort.

---

### H2: No `<meta name="description">` on Any Page

**SEO + Accessibility**
All 10 pages lack meta descriptions. Screen reader users who browse by metadata get no page context.

---

### H3: Heading Hierarchy Broken on Most Pages

**WCAG:** 1.3.1 Info and Relationships
**Scope:** 8 of 10 pages

| Page | Issue |
|---|---|
| `index.html` | h1 -> h4 (skips h2, h3). "Section titles" are `<div>` not headings |
| `explore.html` | No h1 at all. Page title is a `<div class="section-title">` |
| `vibe.html` | h1 -> h3 (skips h2) |
| `profile.html` | h1 exists but h3 appears before it in DOM |
| `my-vibes.html` | No h1. Page title is `<div class="section-title">` |
| `community.html` | No h1. All section titles are `<div>` elements |
| `admin.html` | h1 hidden until dashboard loads; h2 appears first |
| `reset-password.html` | No h1; starts with h2 |

---

### H4: Decorative SVGs Not Hidden from Screen Readers

**WCAG:** 1.1.1 Non-text Content
**Scope:** All pages

Dozens of inline SVGs (icons for search, social links, stats, navigation) lack `aria-hidden="true"`. Screen readers may read SVG path data or announce empty elements. Meaningful SVGs (logo) also lack `<title>` or `aria-label`.

---

### H5: No Loading Feedback on User Actions

**UX: Feedback Principle**
**Scope:** 10+ async operations

| Action | Loading indicator? |
|---|---|
| Login | No |
| Signup | No |
| Google sign-in | No |
| Save profile | No |
| Submit project (with image upload) | No |
| Post comment | No |
| Delete project | No |
| Home page project grid load | No |

Users get no feedback during potentially slow operations. Double-submissions are possible. Only a few operations show feedback: invite verification ("Verifying..."), forgot password ("Sending..."), reset password ("Resetting...").

---

### H6: Tab Components Missing ARIA

**WCAG:** 4.1.2 Name/Role/Value
**Scope:** 4 tab sets

Feed tabs (index/explore), profile tabs, admin tabs, and auth modal tabs lack:
- `role="tablist"` on container
- `role="tab"` on buttons
- `role="tabpanel"` on content
- `aria-selected="true/false"`
- `aria-controls` linking tabs to panels

---

### H7: Toast Notifications Are Inaccessible

**WCAG:** 4.1.3 Status Messages
**File:** `js/auth.js:764-799`

Toasts are ephemeral (4 second auto-dismiss), dynamically created, and have no `role="alert"` or `aria-live`. They are the primary feedback mechanism for success/error states across the app but are completely invisible to screen readers.

---

### H8: iframe Missing `title` Attribute

**WCAG:** 2.4.1 Bypass Blocks, 4.1.2 Name/Role/Value
**File:** `vibe.html:91`

The demo modal iframe (`<iframe id="demo-modal-iframe"`) has no `title` attribute. Screen readers cannot identify the iframe's purpose.

---

### H9: Close Buttons Use Only Visual Symbol

**WCAG:** 4.1.2 Name/Role/Value
**Files:** `shared.js`, `profile.html`, `vibe.html`

Modal close buttons use `&times;` (×) as their only content with no `aria-label`. Screen readers announce "times" or "multiplication sign" instead of "Close". Only `reset-password.html` properly uses `aria-label="Show password"`.

---

### H10: Color-Only Information (Streak Calendar)

**WCAG:** 1.4.1 Use of Color
**Files:** `profile.html`, `404.html`

Streak calendar activity levels (0-3) are conveyed **only through color** (CSS classes `streak-level-0` through `streak-level-3`). No pattern, icon, or text label differentiates them. The `title` attribute provides hover text but is not available to all assistive tech or mobile users.

---

### H11: 31 Distinct Font Sizes (No Type Scale)

**Design System**
**File:** `css/styles.css`

The CSS uses 31 distinct font sizes ranging from 0.5rem to 3rem. The 0.78-0.92rem range alone contains 8 near-identical sizes. This creates visual inconsistency and maintenance burden. A proper type scale should have 8-12 steps.

---

### H12: Touch Targets Below 44px

**WCAG:** 2.5.8 Target Size (Minimum)
**Scope:** 20+ interactive elements

| Element | Approximate Size |
|---|---|
| `.btn-xs` | ~22px height |
| `.reaction-btn` | ~18px height |
| `.admin-row-checkbox` | 16x16px |
| `.tag-follow-chip` | ~24px height |
| `.comment-action` | No explicit size |
| `.modal-close` | 32x32px |
| `.password-toggle` | ~24x24px |
| `.follow-btn-sm` | ~28px height |
| `.streak-day` | 12x12px |

---

## MEDIUM Severity

### M1: Font Sizes Below 12px in 20+ Locations

**File:** `css/styles.css`

| Size | Elements |
|---|---|
| 0.72rem (11.5px) | Card tags, status badges, admin stat labels |
| 0.7rem (11.2px) | Comment avatars, reaction counts, streak legend |
| 0.68rem (10.9px) | Built-with overlay, admin column headers |
| 0.65rem (10.4px) | Avatar initials, admin badges, streak labels |
| 0.55rem (8.8px) | Demo avatar initial |
| 0.5rem (8px) | Card creator initial |

---

### M2: No Form Validation Associations (`aria-describedby`)

**WCAG:** 1.3.1 Info and Relationships
**Scope:** All forms

No form error messages are programmatically linked to their inputs via `aria-describedby`. The auth error is a shared `<div>` away from the fields. Username availability status is visually near the input but not associated.

---

### M3: Hardcoded Colors (30+ Not Using Variables)

**File:** `css/styles.css`

~30 unique hex colors are hardcoded instead of using CSS custom properties. Notable: reds (#ef4444, #dc2626), grays (#333, #ddd, #6b7280), greens (#059669, #16a34a), ambers (#d97706, #b45309). One undefined variable `var(--primary)` is referenced at line 1941 but never defined.

---

### M4: `404.html` Is a Copy of `profile.html`

**File:** `404.html`

This file is NOT a 404 error page — it is an exact copy of `profile.html` with the same title ("Profile -- VibeLab"). If Cloudflare serves this for 404s, users see a profile page instead of a proper error page.

---

### M5: No Unsaved Changes Warning

**UX: Data Loss Prevention**

Closing the submit project modal, canceling profile edit, or navigating away from forms with entered data silently discards all input. No `beforeunload` handler or confirmation dialog warns users of data loss.

---

### M6: Silent Failures on Vibe/Follow Toggle

**UX: Feedback Principle**
**File:** `js/shared.js`

`toggleVibe()` (line 871) and `toggleFollow()` (line 904) catch errors with only `console.error`. Users get no feedback when these actions fail — the UI may show an optimistic state that doesn't match the server.

---

### M7: No State Persistence for Filters/Scroll

**UX: Continuity**

Filter selections, search text, active tabs, and scroll position are stored only in JavaScript variables. Navigating to a project and returning reloads the feed from scratch, losing the user's place. URL parameters or `sessionStorage` should preserve state.

---

### M8: Inconsistent Responsive Breakpoints

**File:** `css/styles.css`

7 breakpoints used inconsistently: 480px, 500px, 600px, 768px, 800px, 1100px, 1400px. The 480/500 and 768/800 pairs overlap, creating 32px ranges where some elements are mobile-styled and others aren't. No breakpoint above 1400px for large screens.

---

### M9: Z-index Collisions

**File:** `css/styles.css`

| Z-index | Elements Sharing It |
|---|---|
| 50 | `nav`, `.more-menu` |
| 100 | `.modal-overlay`, `.custom-dropdown-menu` |
| 200 | `.toast-container`, `.demo-modal-overlay` |

Dropdowns could appear behind modals. Toasts could be hidden by the demo modal.

---

### M10: Additional Contrast Failures

**WCAG:** 1.4.3 Contrast Minimum

| Combination | Ratio | Location |
|---|---|---|
| `.tag-tool` (#b45309 on #fef3c7) | ~4.0:1 | Tag chips at 0.72rem |
| `.status-wip` (#d97706 on white) | ~3.3:1 | Status badges at 0.72rem |

---

## LOW Severity

### L1: Marquee Animation Accessibility

The trusted logos marquee (30s infinite scroll) cannot be paused. Content moves continuously with no stop control. While decorative, it could distract users with cognitive disabilities.

### L2: `href="#"` Used for Action Links

`index.html` uses `<a href="#">` for actions that should be `<button>` elements (e.g., "View All Projects" with an onclick handler).

### L3: Inconsistent Script Loading

Some pages load Firebase SDK in `<head>` (community.html, reset-password.html) while others load at end of `<body>`. This doesn't affect accessibility but creates maintenance inconsistency.

### L4: Unused CSS Variable

`--pink` (#ec4899) is defined in `:root` but never used via `var(--pink)`.

### L5: No Confirmation on Logout

Clicking "Log Out" immediately signs the user out with no confirmation dialog.

### L6: Invite Modal Close Button Lacks `aria-label`

The `&times;` close button on the invite modal has no `aria-label="Close"`.

---

## Remediation Priority Matrix

### P0 — Do Before Public Launch

| # | Fix | Effort | Impact |
|---|---|---|---|
| CR1 | Add `:focus-visible` styles to all interactive elements | Medium | Unblocks keyboard navigation |
| CR3 | Add `aria-live="polite"` to error divs, `role="alert"` to toast container | Small | Unblocks screen reader error awareness |
| CR7 | Add `aria-label` to search inputs, `for` attributes to labels | Small | Unblocks form accessibility |
| CR8 | Change `--text-muted` to #636363 or darker | Small | Fixes contrast across entire UI |
| H7 | Add `role="alert"` to toast container element | Small | Makes primary feedback accessible |
| H9 | Add `aria-label="Close"` to all close buttons | Small | Fixes screen reader announcement |

### P1 — Do Within First Sprint

| # | Fix | Effort | Impact |
|---|---|---|---|
| CR2 | Add `role="dialog"`, `aria-modal`, focus trap, Escape handler to all modals | Large | Makes modals usable for keyboard/SR users |
| CR5 | Add skip-to-main-content link | Small | Major keyboard navigation improvement |
| CR6 | Wrap primary content in `<main id="main-content">` on all pages | Small | Enables landmark navigation |
| H1 | Add `@media (prefers-reduced-motion: reduce)` | Small | Protects vestibular disorder users |
| H3 | Fix heading hierarchy: add h1 to all pages, use proper levels | Medium | Fixes document structure |
| H5 | Add loading states (disable button + "Loading..." text) to user actions | Medium | Prevents double-submissions |
| H6 | Add ARIA tab roles to all tab components | Medium | Makes tabs navigable by screen readers |

### P2 — Do Within Second Sprint

| # | Fix | Effort | Impact |
|---|---|---|---|
| CR4 | Rebuild custom dropdown with keyboard navigation + ARIA | Large | Makes filters accessible |
| H4 | Add `aria-hidden="true"` to decorative SVGs | Medium | Cleans up screen reader noise |
| H8 | Add `title` to demo iframe | Small | Identifies iframe purpose |
| H10 | Add text labels or patterns to streak calendar | Medium | Removes color-only dependency |
| H11 | Consolidate to 8-12 font sizes | Medium | Design system consistency |
| H12 | Increase touch targets to minimum 44x44px | Medium | Mobile usability |

### P3 — Ongoing Improvements

| # | Fix | Effort | Impact |
|---|---|---|---|
| M1-M10 | Font sizes, form validation, hardcoded colors, 404 page, state persistence, silent failures, breakpoints, z-index | Various | Polish and robustness |

---

## WCAG 2.2 AA Compliance Scorecard

| Principle | Criteria Checked | Passing | Failing | Score |
|---|---|---|---|---|
| **Perceivable** | 1.1.1, 1.3.1, 1.4.1, 1.4.3, 1.4.4, 1.4.10, 1.4.11 | 2 | 5 | 29% |
| **Operable** | 2.1.1, 2.1.2, 2.4.1, 2.4.3, 2.4.6, 2.4.7, 2.5.8 | 1 | 6 | 14% |
| **Understandable** | 3.1.1, 3.2.1, 3.3.1, 3.3.2 | 2 | 2 | 50% |
| **Robust** | 4.1.2, 4.1.3 | 0 | 2 | 0% |
| **Overall** | 20 criteria | 5 | 15 | **25%** |

---

*The app needs significant accessibility work before public launch. The P0 fixes (focus styles, aria-live, labels, contrast) are relatively small changes that would bring the biggest improvements.*
