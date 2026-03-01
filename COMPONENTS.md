# VibeLab — Reusable Components

**Version:** 2.0
**Last Updated:** March 1, 2026

---

## 1. Page Initialization (`initPage`)

**File:** `js/shared.js`
**Function:** `initPage(activePage)`

Every page calls this on `DOMContentLoaded`. It injects:
- Navigation bar (with active page highlighting)
- Footer
- Auth modal (login/signup/forgot password/Google complete signup)
- Profile edit modal
- Submit project modal
- Save-to-collection modal

```javascript
initPage('explore'); // Highlights "Explore" in nav
```

**Used in:** All pages

---

## 2. Navigation Component

**File:** `js/shared.js` — `getNavHTML(activePage)`

- Logo with VibeLab mark (`/Logo/VL-01.svg`)
- Dynamic nav links: Explore, Community
- Auth state switching: Login button (logged out) vs user avatar dropdown (logged in)
- Avatar dropdown: My Profile, My Vibes, Admin (superadmin only), Log Out
- `updateNav()` in `auth.js` toggles `.nav-auth-logged-in` / `.nav-auth-logged-out`

**CSS classes:** `.nav-inner`, `.logo`, `.logo-mark`, `.nav-links`, `.nav-avatar`, `.nav-dropdown`, `.nav-auth`

**Used in:** All pages

---

## 3. Footer Component

**File:** `js/shared.js` — `getFooterHTML()`

- 4-column layout: Brand, Community, Resources, Legal
- Social links (Twitter, GitHub, Discord)
- Copyright notice

**CSS classes:** `.footer-grid`, `.footer-brand`, `.footer-col`, `.footer-bottom`, `.footer-social`

**Used in:** All pages

---

## 4. Auth Modal

**File:** `js/shared.js` — `getAuthModalHTML()`
**Logic:** `js/auth.js`

### 4.1 Login / Sign Up Tabs

Tabbed interface switching between login and signup modes.

- **Login:** Email, password, forgot password link
- **Sign Up:** Display name, username (with live availability check), invite code, email, password
- **Google OAuth:** Single button, routes to Google complete signup if username needed

**Key functions:**
| Function | File | Description |
|----------|------|-------------|
| `openAuthModal(mode)` | `shared.js` | Opens modal in 'login' or 'signup' mode |
| `closeAuthModal()` | `shared.js` | Closes the modal |
| `switchAuthMode(mode)` | `shared.js` | Switches tabs, toggles forgot link visibility |
| `logInWithEmail()` | `auth.js` | Email/password login |
| `signUpWithEmail()` | `auth.js` | Signup with invite code validation |
| `signInWithGoogle()` | `auth.js` | Google OAuth flow |

### 4.2 Forgot Password

Embedded in the auth modal. Toggled via `showForgotPassword()` / `hideForgotPassword()`.

- Email input with send reset link button
- Success/error states
- `sendPasswordReset()` in `auth.js`

**CSS classes:** `.forgot-password-link`, `.forgot-password-header`, `.forgot-password-success`, `.forgot-password-error`

### 4.3 Google Complete Signup

Shown when a Google user needs to set a username and enter an invite code. Hidden section `#google-complete-section` that appears after Google sign-in if the user doesn't have a username yet.

**CSS classes:** `.modal-overlay`, `.modal`, `.auth-tabs`, `.auth-tab`, `.auth-error`, `.google-btn`, `.auth-divider`

**Used in:** All pages

---

## 5. Profile Edit Modal

**File:** `js/shared.js` — `getProfileModalHTML()`

- Profile photo upload with preview
- Username with vanity URL prefix (`vibelab.in/`)
- Display name, bio, company
- Skills/interests (comma-separated)
- Social links: Twitter, GitHub, Website

**Key functions:**
| Function | Description |
|----------|-------------|
| `openProfileModal()` | Load current profile data and open |
| `closeProfileModal()` | Close modal |
| `saveProfile()` | Validate and save to Firestore |
| `handleProfilePhotoUpload(e)` | Preview selected photo |
| `_attachUsernameChecker(inputId, statusId, currentUsername)` | Debounced (400ms) availability check |

**CSS classes:** `.profile-photo-upload`, `.profile-photo-preview`, `.upload-icon`

**Used in:** Accessible from nav dropdown on any page

---

## 6. Submit Project Modal (Share Your Vibe)

**File:** `js/shared.js` — `getSubmitModalHTML()`

- Project name, category selector, "Built With" dropdown
- Status tags: WIP, Experiment, Shipped
- Description, thumbnail upload
- Demo URL, GitHub URL, Figma URL
- Visibility toggle: Public / Unlisted
- Tags input (comma-separated)
- Challenge linking: dropdown to associate project with active challenge
- Dual-mode: create new or edit existing

**Key functions:**
| Function | Description |
|----------|-------------|
| `openSubmitModal()` | New project mode |
| `openEditProjectModal(projectId)` | Edit existing project |
| `closeSubmitModal()` | Close modal |
| `selectStatus(btn, status)` | Status selection |
| `selectVisibility(btn, vis)` | Visibility selection |
| `submitProject()` | Create or update project |
| `deleteProject(projectId, projectName)` | Delete with double-confirm |

**CSS classes:** `.status-tags`, `.status-tag`, `.visibility-toggle`, `.visibility-option`

**Used in:** explore.html, profile.html, vibe.html, my-vibes.html

---

## 7. Save to Collection Modal

**File:** `js/shared.js` — `getSaveModalHTML()`

- List of user's collections with checkboxes
- Project count per collection
- Inline "create new collection" input

**Key functions:**
| Function | Description |
|----------|-------------|
| `openSaveModal(projectId)` | Open with project context |
| `closeSaveModal()` | Close modal |
| `loadCollections(projectId)` | Load user's collections |
| `createCollection()` | Add new collection inline |
| `toggleProjectInCollection(collectionId, projectId, add)` | Add/remove project |

**CSS classes:** `.save-modal-list`, `.save-modal-item`, `.collection-name`, `.collection-count`, `.new-collection-input`

**Used in:** explore.html, profile.html, vibe.html

---

## 8. Custom Dropdown

**File:** `js/custom-dropdown.js`
**CSS:** `css/styles.css` — `/* Custom Dropdown Component */` section

Pill-shaped dropdown replacing native `<select>` elements. Matches VibeLab design with rounded menus, accent highlights, fade-in animation.

### Quick Start — Drop-in HTML

```html
<script src="js/custom-dropdown.js"></script>

<div class="custom-dropdown" id="my-filter">
  <button class="custom-dropdown-trigger" onclick="toggleCustomDropdown('my-filter')">
    <span class="custom-dropdown-label">All Items</span>
    <svg class="custom-dropdown-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none">
      <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>
  <div class="custom-dropdown-menu">
    <div class="custom-dropdown-option selected" data-value="all"
         onclick="selectDropdownOption('my-filter', 'all', 'All Items')">All Items</div>
    <div class="custom-dropdown-option" data-value="opt1"
         onclick="selectDropdownOption('my-filter', 'opt1', 'Option 1')">Option 1</div>
  </div>
</div>

<script>
  onDropdownChange('my-filter', (value, label) => {
    console.log('Selected:', value, label);
  });
</script>
```

### Quick Start — JS Helper

```js
const html = createCustomDropdown({
  id: 'sort-dropdown',
  defaultLabel: 'Sort by: Trending',
  options: [
    { value: 'trending', label: 'Sort by: Trending' },
    { value: 'newest',   label: 'Sort by: Newest' },
  ],
  onChange: (value) => handleSort(value)
});
document.getElementById('toolbar').insertAdjacentHTML('beforeend', html);
```

### API Reference

| Function | Description |
|----------|-------------|
| `toggleCustomDropdown(id)` | Open/close a dropdown by id |
| `selectDropdownOption(id, value, label)` | Select an option programmatically |
| `getDropdownValue(id)` | Get the current selected value |
| `setDropdownValue(id, value)` | Set value programmatically |
| `onDropdownChange(id, callback)` | Register an onChange listener |
| `createCustomDropdown(config)` | Generate dropdown HTML string |

### CSS Classes

| Class | Purpose |
|-------|---------|
| `.custom-dropdown` | Wrapper (position: relative) |
| `.custom-dropdown-trigger` | Pill-shaped button |
| `.custom-dropdown-label` | Text inside trigger |
| `.custom-dropdown-chevron` | SVG chevron arrow |
| `.custom-dropdown-menu` | Floating options panel |
| `.custom-dropdown-option` | Individual option row |
| `.custom-dropdown-option.selected` | Active/highlighted option |
| `.custom-dropdown.open` | When expanded |
| `.custom-dropdown.disabled` | When disabled |

### Design Tokens Used

`--border`, `--surface`, `--text`, `--text-secondary`, `--bg-alt`, `--accent-soft`, `--radius`, `--shadow-lg`

**Used in:** explore.html, index.html (Category, Built-with, Status filters)

---

## 9. Project Card

**File:** `js/firebase-config.js` — `renderProjectCard(p)`

Renders a clickable project card with:
- Thumbnail with category gradient fallback
- Title + author name/initial avatar
- Vibe count and comment count
- Category-based color coding

**CSS classes:** `.project-card`, `.card-thumb`, `.card-info`, `.card-info-text`, `.card-creator`, `.card-creator-pic`, `.card-creator-initial`, `.card-stats`, `.card-stat`

**Used in:** index.html, explore.html, profile.html, my-vibes.html

---

## 10. Toast Notification System

**File:** `js/auth.js` — `showToast(message, actionText, actionCallback)`

- Fixed bottom-right positioning
- Auto-dismiss after 4 seconds with fade animation
- Optional action button (e.g., "Undo")
- Stacks multiple toasts

**CSS classes:** `.toast-container`, `.toast`, `.toast-out`, `.toast-action`

**Used in:** All pages (profile updates, project submissions, collection actions, follow/unfollow)

---

## 11. Invite Drawer

**File:** `profile.html` (HTML + inline JS)
**CSS:** `css/styles.css`

Slide-in side panel for managing invite codes.

- Shows remaining invite count
- "Generate Invite Code" button
- Lists generated codes with copy-to-clipboard
- Code format: `VIBE-XXXX`

**Key functions:**
| Function | Description |
|----------|-------------|
| `openInviteDrawer()` | Slide drawer open |
| `closeInviteDrawer()` | Slide drawer closed |
| `generateInviteCode()` | Create new code in Firestore |
| `loadMyInviteCodes()` | Fetch and display user's codes |
| `copyInviteCode(code)` | Copy to clipboard |

**CSS classes:** `.invite-drawer-overlay`, `.invite-drawer`, `.invite-drawer.open`, `.invite-drawer-header`, `.invite-drawer-close`, `.invite-drawer-body`, `.invite-drawer-codes`, `.invite-drawer-btn`

**Used in:** profile.html (own profile only)

---

## 12. Streak Calendar

**File:** `profile.html` (inline JS)
**CSS:** `css/styles.css`

GitHub-style 90-day contribution grid showing challenge submission activity.

- 4 intensity levels based on daily submission count
- Hover tooltips with date and count
- Day labels (Mon, Wed, Fri)
- Month labels
- Legend (Less → More)

**Key functions:**
| Function | Description |
|----------|-------------|
| `renderStreakCalendar(userId)` | Build and display the 90-day grid |

**CSS classes:** `.streak-calendar-section`, `.streak-calendar-title`, `.streak-calendar`, `.streak-grid`, `.streak-day`, `.streak-day-labels`, `.streak-month-labels`, `.streak-legend`

**Used in:** profile.html

---

## 13. Badges Row

**File:** `profile.html` (inline JS)
**CSS:** `css/styles.css`

Auto-awarded badges displayed on profile based on challenge participation.

| Badge | Icon | Condition |
|-------|------|-----------|
| First Vibe | `#4ade80` circle | 1+ challenge submissions |
| 7 Day Streak | `#f59e0b` circle | 7+ consecutive challenge days |
| 30 Day Streak | `#7c3aed` circle | 30+ consecutive challenge days |
| Challenge Champion | `#eab308` circle | 1+ completed challenges |
| Multi-Challenger | `#3b82f6` circle | 3+ challenges joined |

**Key functions:**
| Function | Description |
|----------|-------------|
| `renderBadges(userId)` | Calculate and display earned badges |

**CSS classes:** `.badges-row`, `.badge-item`, `.badge-icon`, `.badge-name`

**Used in:** profile.html

---

## 14. Password Change Section

**File:** `profile.html` (inline HTML + JS)

Two variants shown based on auth provider:
- **Email users:** Current password + new password + confirm → change password flow
- **Google users:** "Password managed by Google" message

**Key functions:**
| Function | Description |
|----------|-------------|
| `changePassword()` | Reauthenticate and update password |

**CSS classes:** `.change-password-section`, `.change-password-title`

**Used in:** profile.html (own profile edit mode only)

---

## 15. Guest CTA Box

**File:** Inline in `profile.html`, `vibe.html`, `explore.html`
**CSS:** `css/styles.css`

Prompt shown to non-logged-in visitors encouraging signup.

- Headline + description + "Join VibeLab" button
- Opens auth modal in signup mode

**CSS classes:** `.guest-cta-box`, `.guest-cta-content`

**Used in:** profile.html (public profiles), vibe.html (project detail), explore.html (feed gate)

---

## 16. Tag Follow Bar

**File:** `explore.html` (inline JS)
**CSS:** `css/styles.css`

Horizontal bar of tag chips that users can follow to personalize their "For You" feed.

- 13 tags with distinct colors
- Search dropdown for finding tags
- Follow/unfollow toggle per tag
- Chips for followed tags

**Key functions:**
| Function | Description |
|----------|-------------|
| `openTagSearch()` | Open tag search dropdown |
| `onTagSearchInput(value)` | Filter tags by query |
| `toggleFollowTag(tagId)` | Follow/unfollow a tag |
| `renderTagFollowChips()` | Render followed tags as chips |

**CSS classes:** `.tag-follow-bar`, `.tag-follow-label`, `.tag-follow-chips`, `.tag-follow-chip`, `.tag-follow-chip.followed`, `.tag-search-wrap`, `.tag-search-input`, `.tag-search-dropdown`, `.tag-search-result`

**Used in:** explore.html

---

## 17. Follow System

**File:** `js/shared.js`

User-to-user follow/unfollow with Firestore `follows` collection.

**Key functions:**
| Function | Description |
|----------|-------------|
| `toggleFollow(targetUid, btn)` | Follow/unfollow toggle |
| `checkIfFollowing(targetUid)` | Check if current user follows target |
| `getFollowCounts(userId)` | Get follower/following counts |

**CSS classes:** `.follow-btn`, `.follow-btn.not-following`, `.follow-btn.following`, `.follow-btn-sm`

**Used in:** vibe.html (creator card), profile.html

---

## 18. Vibe (Like) System

**File:** `js/shared.js`

Toggle-based like system using Firestore subcollection `projects/{id}/vibes`.

**Key functions:**
| Function | Description |
|----------|-------------|
| `toggleVibe(projectId, btn)` | Like/unlike toggle, updates count |

**CSS classes:** `.project-icon-btn`, `.project-icon-btn.active`

**Used in:** explore.html, vibe.html

---

## 19. Comments Section

**File:** `vibe.html` (inline JS + HTML)

Threaded comment system with emoji reactions.

- Comment input with auto-resize textarea
- Nested replies (one level)
- Emoji reactions per comment
- Delete own comments

**CSS classes:** `.comments-section`, `.comment-input-area`, `.comment-thread`, `.comment`, `.comment-content`, `.comment-header`, `.comment-author`, `.comment-time`, `.comment-body`, `.comment-actions`, `.comment-replies`, `.reply-input-area`, `.comment-reactions`, `.reaction-btn`

**Used in:** vibe.html

---

## 20. Username Validation System

**File:** `js/firebase-config.js`

Validates username format and checks availability against Firestore `usernames` collection.

**Key functions:**
| Function | Description |
|----------|-------------|
| `validateUsername(username)` | Format check: 3-20 chars, a-z0-9_-, no reserved words |
| `checkUsernameAvailable(username)` | Async Firestore lookup |
| `getProfileUrl(username, uid)` | Generate vanity URL or fallback |
| `getUsernameFromPath()` | Extract username from URL path |

**Reserved words:** feed, community, profile, project, my-vibes, admin, explore, search, login, signup, auth, 404, and more

**CSS classes:** `.username-input-wrapper`, `.username-prefix`, `.username-status`, `.username-status.available`, `.username-status.taken`, `.username-status.checking`

**Used in:** Auth modal signup, profile edit modal

---

## 21. Utility Functions

### `firebase-config.js`

| Function | Description |
|----------|-------------|
| `timeAgo(date)` | Relative time: "just now", "5m ago", "2h ago", "3d ago" |
| `escapeHtml(str)` | XSS prevention for user content |
| `getUrlParam(name)` | Get query param with hash fallback |
| `renderProjectCard(p)` | Generate project card HTML |

### `auth.js`

| Function | Description |
|----------|-------------|
| `showToast(message, actionText, actionCallback)` | Toast notification |
| `sendPasswordReset()` | Send forgot password email |

---

## 22. Design Tokens

**File:** `css/styles.css` — `:root` block

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--accent` | `#c8ff00` | Primary neon yellow |
| `--text` | `#111111` | Body text |
| `--text-secondary` | `#555555` | Secondary text |
| `--text-muted` | `#888888` | Muted text |
| `--bg` | `#ffffff` | Page background |
| `--bg-alt` | `#f7f7f8` | Alternate background |
| `--border` | `#e5e5e5` | Border color |
| `--surface` | `#ffffff` | Card/panel surface |

### Typography
| Font | Weights | Usage |
|------|---------|-------|
| Space Grotesk | 700, 800 | Headings |
| Inter | 400, 500, 600 | Body text |

### Spacing
8px, 12px, 16px, 24px, 32px, 48px, 60px (gap-based)

### Radius
| Token | Value |
|-------|-------|
| `--radius` | `16px` |
| `--radius-lg` | `24px` |
| Small radius | `8px`, `10px`, `12px` |

### Shadows
`--shadow-sm`, `--shadow-md`, `--shadow-lg`

---

## 23. Category System

**File:** `js/firebase-config.js`

| Category | Tag Label | Color | Used For |
|----------|-----------|-------|----------|
| web | Web | `#3b82f6` | Blue gradient cards |
| art | Gen Art | `#ec4899` | Pink gradient cards |
| game | Game | `#10b981` | Green gradient cards |
| tool | Tool | `#f59e0b` | Amber gradient cards |
| ai | AI | `#7c3aed` | Purple gradient cards |
| mobile | Mobile | `#4f46e5` | Indigo gradient cards |
| image | Image | `#db2777` | Pink gradient cards |

**Maps:** `tagClasses`, `tagMap`, `colorMap`, `gradMap`

**CSS badge classes:** `.tag-web`, `.tag-art`, `.tag-game`, `.tag-tool`, `.tag-ai`, `.tag-mobile`, `.tag-image`

---

## Page → Component Matrix

| Component | index | explore | vibe | profile | my-vibes | community | admin | 404 |
|-----------|:-----:|:-------:|:----:|:-------:|:--------:|:---------:|:-----:|:---:|
| Navigation | x | x | x | x | x | x | x | x |
| Footer | x | x | x | x | x | x | x | x |
| Auth Modal | x | x | x | x | x | x | x | x |
| Profile Edit Modal | x | x | x | x | x | x | x | x |
| Submit Modal | x | x | x | x | x | x | x | x |
| Save Modal | x | x | x | x | x | x | x | x |
| Custom Dropdown | x | x | | | | | | |
| Project Card | x | x | | x | x | | | |
| Toast System | x | x | x | x | x | x | x | x |
| Follow System | | | x | x | | | | |
| Vibe System | | x | x | | | | | |
| Comments | | | x | | | | | |
| Invite Drawer | | | | x | | | | |
| Streak Calendar | | | | x | | | | |
| Badges Row | | | | x | | | | |
| Password Change | | | | x | | | | |
| Guest CTA | | x | x | x | | | | |
| Tag Follow Bar | | x | | | | | | |
| Username Validation | x | x | x | x | x | x | x | x |

---

*This document should be updated whenever components are added or modified.*
